"use client";

import React, { useState, useMemo, useRef } from 'react';
import {
    FileSignature,
    Stamp,
    Layers,
    ShieldCheck,
    ShieldAlert,
    Sparkles,
    RotateCcw,
    Upload,
    Download,
    CheckCircle2,
    Copy,
    Check,
    Share2,
    FileSpreadsheet,
    FileCode,
    FileText,
    Lock,
    Wrench,
    Info,
    Cpu,
    PenTool,
    Eye,
    Trash2,
    Archive,
} from 'lucide-react';

import {
    PDF_SIGNER_BATES_ENGINE_VERSION,
    parseSinglePdfBytes,
    analyzeAndCompilePdfStudio,
    autoFixPdfSigningIssues,
    verifySignedPdfIntegrity,
    exportBatesProductionCsv,
    exportBatesProductionXlsx,
    exportBatchSignedZipArchive,
    removeWhiteBackgroundFromRgba,
    getDefaultPdfStudioConfig,
    getPresetPdfStudioScenario,
    type PdfPresetScenarioId,
    type BatesStampPosition,
    type WatermarkLayoutMode,
    type WatermarkLayerPosition,
    type SignatureVisualStyle,
    type SignaturePagePlacement,
    type StampColorPreset,
    type PdfInputFileItem,
    type PdfStudioConfig,
} from '@/lib/pdfSignerBatesEngine';

type PdfStudioDeepTab =
    | 'signature_pad_seal'
    | 'bates_batch_index'
    | 'compliance_linter_12'
    | 'byterange_sha256_verifier'
    | 'ediscovery_audit_exports';

const QUICK_PDF_PRESETS: {
    id: PdfPresetScenarioId;
    title: string;
    subtitle: string;
    badge: string;
    pipelineTag: string;
}[] = [
        {
            id: 'all_in_one_board_resolution',
            title: '1. All-in-One Board Resolution (Sign + Watermark + Bates + Exhibit A)',
            subtitle: 'Applies 6-digit Bates (94% Shrink-to-Fit), Page 1 EXHIBIT A sticker, Tiled Watermark, Initials & Signature.',
            badge: '100/100 Grade A+',
            pipelineTag: '3-in-1 Full Pipeline',
        },
        {
            id: 'compliance_defect_linter_demo',
            title: '2. Compliance & eDiscovery Defect Demo (10 Alerts + 1-Click Auto-Fix)',
            subtitle: 'Triggers Bates footnote collision, 2-digit padding, 78% opaque overlay watermark, unflattened form & missing location.',
            badge: 'Test 1-Click Auto-Fix',
            pipelineTag: '12-Rule Audit',
        },
        {
            id: 'executive_nda_signature_audit',
            title: '3. Executive Mutual NDA (Digital Signature + Page Initials + Audit Page)',
            subtitle: 'Stamps initials ("EV") on pages 1–2, handwritten signature on page 3, /Sig /ByteRange & SHA-256 Certificate page.',
            badge: '/ByteRange Sealed',
            pipelineTag: 'Digital Signer',
        },
        {
            id: 'ediscovery_bates_shrink_exhibit',
            title: '4. Litigation eDiscovery Bates Production (PLAINTIFF-2026-000001 + EXHIBIT A)',
            subtitle: 'Stamps 6-digit zero-padded Bates numbers with 94% Shrink-to-Fit margin protection & Page 1 Court Exhibit sticker.',
            badge: '94% Shrink-to-Fit',
            pipelineTag: 'Bates & Exhibit',
        },
        {
            id: 'dataroom_tiled_dynamic_watermark',
            title: '5. M&A Data-Room Tiled Watermark ({{RECIPIENT}} • {{BATES}} • {{SHA256_8}})',
            subtitle: 'Renders a 3x4 diagonal tiled watermark behind text (Underlay 22%) with dynamic recipient, Bates & SHA-256 macros.',
            badge: 'Anti-Crop Underlay',
            pipelineTag: 'Dynamic Watermark',
        },
        {
            id: 'multi_pdf_continuous_bates_batch',
            title: '6. Multi-PDF Continuous Batch (3 Files • Bates 000101–000109)',
            subtitle: 'Numbers 3 separate discovery PDFs continuously (000101–000103 → 000104–000106 → 000107–000109) + .XLSX log.',
            badge: 'Cross-File Batch',
            pipelineTag: 'Batch Production',
        },
    ];

const BATES_POSITIONS: { id: BatesStampPosition; label: string }[] = [
    { id: 'BOTTOM_RIGHT', label: 'Bottom Right (Standard)' },
    { id: 'BOTTOM_CENTER', label: 'Bottom Center' },
    { id: 'BOTTOM_LEFT', label: 'Bottom Left' },
    { id: 'TOP_RIGHT', label: 'Top Right' },
    { id: 'TOP_CENTER', label: 'Top Center' },
    { id: 'TOP_LEFT', label: 'Top Left' },
];

const STAMP_COLORS: { id: StampColorPreset; label: string }[] = [
    { id: 'NAVY_BLUE', label: 'Legal Navy Blue' },
    { id: 'CRIMSON_RED', label: 'Exhibit Crimson Red' },
    { id: 'SLATE_GRAY', label: 'Subtle Slate Gray' },
    { id: 'EMERALD_GREEN', label: 'Verified Emerald' },
    { id: 'JET_BLACK', label: 'Archival Jet Black' },
];

export default function PdfSignerBatesStudio() {
    // Clean 0 initial state on page load / refresh
    const [activePresetId, setActivePresetId] = useState<PdfPresetScenarioId | null>(null);
    const [files, setFiles] = useState<PdfInputFileItem[]>([]);
    const [config, setConfig] = useState<PdfStudioConfig>(() => getDefaultPdfStudioConfig());
    const [activeDeepTab, setActiveDeepTab] = useState<PdfStudioDeepTab>('signature_pad_seal');
    const [isDrawingPad, setIsDrawingPad] = useState<boolean>(false);
    const [wetInkRemovedPixels, setWetInkRemovedPixels] = useState<number>(0);
    const [simulateTamperTest, setSimulateTamperTest] = useState<boolean>(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [statusNotice, setStatusNotice] = useState<string | null>(null);

    const pdfInputRef = useRef<HTMLInputElement | null>(null);
    const sigImgInputRef = useRef<HTMLInputElement | null>(null);
    const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const report = useMemo(() => analyzeAndCompilePdfStudio(files, config), [files, config]);

    const activeVerification = useMemo(() => {
        if (!simulateTamperTest || report.stampedFiles.length === 0) {
            return report.signatureVerification;
        }
        const tampered = new Uint8Array(report.stampedFiles[0].stampedPdfBytes);
        if (tampered.length > 120) {
            tampered[100] = (tampered[100] + 1) & 0xff;
        }
        return verifySignedPdfIntegrity(tampered);
    }, [simulateTamperTest, report]);

    const copyText = (text: string, id: string) => {
        if (!text) return;
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            void navigator.clipboard.writeText(text);
        }
        setCopiedId(id);
        setTimeout(() => {
            setCopiedId((prev) => (prev === id ? null : prev));
        }, 1800);
    };

    const handleSelectPreset = (presetId: PdfPresetScenarioId) => {
        const scenario = getPresetPdfStudioScenario(presetId);
        setActivePresetId(presetId);
        setFiles(scenario.files);
        setConfig(scenario.config);
        if (presetId === 'compliance_defect_linter_demo') {
            setActiveDeepTab('compliance_linter_12');
        } else if (presetId === 'multi_pdf_continuous_bates_batch') {
            setActiveDeepTab('bates_batch_index');
        } else if (presetId === 'executive_nda_signature_audit') {
            setActiveDeepTab('byterange_sha256_verifier');
        }
        setStatusNotice(scenario.description);
    };

    const handleResetToZero = () => {
        setActivePresetId(null);
        setFiles([]);
        setConfig(getDefaultPdfStudioConfig());
        setWetInkRemovedPixels(0);
        setStatusNotice(
            'Workspace reset to clean 0 state. Click any of the 6 Legal & Enterprise Scenario Presets above or upload your own PDF files.'
        );
    };

    const handlePdfFilesSelected = async (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        const loaded: PdfInputFileItem[] = [];
        for (let i = 0; i < fileList.length; i++) {
            const f = fileList[i];
            try {
                const ab = await f.arrayBuffer();
                const parsed = parseSinglePdfBytes(new Uint8Array(ab), f.name, `${Date.now()}_${i}`);
                loaded.push(parsed);
            } catch {
                // skip unreadable file
            }
        }
        if (loaded.length > 0) {
            setActivePresetId(null);
            setFiles((prev) => [...prev, ...loaded]);
            setStatusNotice(
                `Loaded ${loaded.length} PDF file(s) (${loaded.reduce((s, x) => s + x.pageCount, 0)} pages) 100% locally in browser memory.`
            );
        }
    };

    const handleWetInkSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        try {
            const bmp = await createImageBitmap(f);
            const canvas = document.createElement('canvas');
            canvas.width = Math.min(360, bmp.width);
            canvas.height = Math.min(140, bmp.height);
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const { cleanedRgba, transparentPixelsCount } = removeWhiteBackgroundFromRgba(
                    new Uint8Array(imgData.data.buffer),
                    228
                );
                const outData = new ImageData(new Uint8ClampedArray(cleanedRgba), canvas.width, canvas.height);
                ctx.putImageData(outData, 0, 0);
                const dataUri = canvas.toDataURL('image/png');
                setWetInkRemovedPixels(transparentPixelsCount);
                setConfig((prev) => ({
                    ...prev,
                    signatureStyle: 'UPLOADED_WET_INK_PNG',
                    uploadedSignatureDataUri: dataUri,
                }));
                setStatusNotice(
                    `Uploaded wet-ink signature "${f.name}" and automatically removed ${transparentPixelsCount.toLocaleString()} white paper background pixels.`
                );
            }
        } catch {
            setStatusNotice('Could not decode signature image file.');
        }
        e.target.value = '';
    };

    const handleAutoFix = () => {
        const { nextConfig, fixSummary } = autoFixPdfSigningIssues(config);
        setConfig(nextConfig);
        setStatusNotice(fixSummary);
    };

    const triggerBinaryDownload = (bytes: Uint8Array, fileName: string, mime: string) => {
        const ab = new ArrayBuffer(bytes.byteLength);
        new Uint8Array(ab).set(bytes);
        const blob = new Blob([ab], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
    };

    const handleDownloadPrimaryPdf = () => {
        if (report.stampedFiles.length === 0) return;
        const sf = report.stampedFiles[0];
        triggerBinaryDownload(sf.stampedPdfBytes, sf.outputFileName, 'application/pdf');
    };

    const handleDownloadBatchZip = () => {
        if (report.stampedFiles.length === 0) return;
        const zipBytes = exportBatchSignedZipArchive(report);
        triggerBinaryDownload(zipBytes, 'kivarotools-signed-bates-production-batch.zip', 'application/zip');
    };

    const handleDownloadXlsx = () => {
        const xlsxBytes = exportBatesProductionXlsx(report);
        triggerBinaryDownload(
            xlsxBytes,
            'kivarotools-ediscovery-bates-production-log.xlsx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
    };

    const handleDownloadCsv = () => {
        const csv = exportBatesProductionCsv(report);
        triggerBinaryDownload(
            new TextEncoder().encode(csv),
            'kivarotools-ediscovery-bates-production-log.csv',
            'text/csv;charset=utf-8'
        );
    };

    const handleDownloadAuditJson = () => {
        const json = JSON.stringify(
            {
                engineVersion: report.engineVersion,
                globalBatesRange: `${report.globalFirstBatesId} .. ${report.globalLastBatesId}`,
                complianceScore: report.complianceScore,
                complianceGrade: report.complianceGrade,
                signatureVerification: report.signatureVerification,
                pageBatesIndex: report.pageBatesIndex,
            },
            null,
            2
        );
        triggerBinaryDownload(
            new TextEncoder().encode(json),
            'kivarotools-pdf-cryptographic-audit-certificate.json',
            'application/json;charset=utf-8'
        );
    };

    // HTML5 Signature Pad Drawing Handlers
    const handlePadPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = sigCanvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setIsDrawingPad(true);
        setConfig((prev) => ({
            ...prev,
            signatureStyle: 'DRAWN_CURSIVE_VECTOR',
            drawnSignaturePoints: [...prev.drawnSignaturePoints, [{ x, y }]],
        }));
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.strokeStyle = '#1e3a8a';
            ctx.lineWidth = 2.4;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    };

    const handlePadPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawingPad) return;
        const canvas = sigCanvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    const handlePadPointerUp = () => {
        setIsDrawingPad(false);
    };

    const handleClearSignaturePad = () => {
        const canvas = sigCanvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
        setConfig((prev) => ({ ...prev, drawnSignaturePoints: [] }));
    };

    const isLoaded = !report.isIdleEmpty;

    return (
        <div className="space-y-6 w-full min-w-0 max-w-full overflow-x-hidden text-slate-900 dark:text-slate-100">
            {/* ============================================================================
          SECTION 1: TOP STUDIO HEADER, MULTI-PDF LOADER & 6 INSTANT 1-CLICK PRESETS
          ============================================================================ */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <Lock className="w-3.5 h-3.5 shrink-0" />
                                <span>100% Client-Side PDF 1.7 Binary Studio (0 Server Uploads)</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                <Cpu className="w-3.5 h-3.5 shrink-0" />
                                <span>v{PDF_SIGNER_BATES_ENGINE_VERSION}</span>
                            </span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            PDF Digital Signer (<code>/ByteRange</code> &amp; SHA-256 Seal), Multi-Layer Watermark &amp; Legal Bates Stamper
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            Execute PDF agreements with handwritten signatures, page initials, corporate seals, and ISO 32000-1{' '}
                            <code>/Sig /ByteRange</code> dictionaries; apply diagonal tiled <code>Underlay</code> or{' '}
                            <code>Overlay</code> watermarks with dynamic macros; and stamp sequential multi-PDF legal Bates numbers
                            with <code>94% Shrink-to-Fit</code> margin protection and Page 1 <code>EXHIBIT A</code> court stickers.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <input
                            ref={pdfInputRef}
                            type="file"
                            multiple
                            accept=".pdf,application/pdf"
                            onChange={(e) => {
                                void handlePdfFilesSelected(e.target.files);
                                e.target.value = '';
                            }}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => pdfInputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-xs transition cursor-pointer"
                        >
                            <Upload className="w-4 h-4 shrink-0" />
                            <span>Upload PDF(s)</span>
                        </button>
                        {isLoaded && (
                            <button
                                type="button"
                                onClick={handleDownloadPrimaryPdf}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition cursor-pointer"
                            >
                                <Download className="w-4 h-4 shrink-0" />
                                <span>Download Stamped .PDF</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleResetToZero}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-400 transition cursor-pointer"
                            title="Reset workspace and all counters to 0"
                        >
                            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                            <span>Reset (0)</span>
                        </button>
                    </div>
                </div>

                {/* 6 Instant 1-Click Legal & Enterprise Scenario Cards (2-Column Responsive Grid) */}
                <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>
                                Instant 1-Click Legal &amp; Enterprise PDF Scenarios (Click Any Preset to Load Sample PDFs &amp; Live Preview):
                            </span>
                        </div>
                        <span className="text-[11px] font-medium text-slate-400">6 Real Binary PDF Samples</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {QUICK_PDF_PRESETS.map((preset) => {
                            const isSelected = activePresetId === preset.id;
                            return (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => handleSelectPreset(preset.id)}
                                    className={`min-w-0 text-left p-3.5 rounded-xl border transition group cursor-pointer ${isSelected
                                            ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/90 dark:bg-indigo-950/60 ring-2 ring-indigo-500/25 shadow-xs'
                                            : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/60 dark:bg-slate-800/40'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 break-words">
                                            {preset.title}
                                        </span>
                                        <span
                                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${isSelected
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                                }`}
                                        >
                                            {isSelected ? '✓ Active' : 'Load'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                                            {preset.pipelineTag}
                                        </span>
                                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                                            {preset.badge}
                                        </span>
                                    </div>
                                    <p className="text-[11px] leading-snug text-slate-600 dark:text-slate-400 break-words">
                                        {preset.subtitle}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {statusNotice && (
                    <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/80 bg-indigo-50/80 dark:bg-indigo-950/40 px-3.5 py-2.5 flex items-start sm:items-center justify-between gap-3 text-xs text-indigo-950 dark:text-indigo-200">
                        <div className="flex items-start sm:items-center gap-2 min-w-0">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                            <span className="break-words">{statusNotice}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setStatusNotice(null)}
                            className="text-indigo-700 dark:text-indigo-300 hover:underline font-bold shrink-0 cursor-pointer"
                        >
                            Dismiss
                        </button>
                    </div>
                )}
            </div>

            {/* ============================================================================
          SECTION 2: LIVE CRYPTOGRAPHIC SEAL, BATES RANGE & 12-RULE COMPLIANCE HERO BAR
          ============================================================================ */}
            <div
                className={`rounded-2xl border p-4 sm:p-5 shadow-sm transition ${!isLoaded
                        ? 'border-slate-200 dark:border-slate-800 bg-slate-900 text-white'
                        : report.criticalFindingsCount > 0
                            ? 'border-rose-500/40 bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white'
                            : report.warningFindingsCount > 0
                                ? 'border-amber-500/40 bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 text-white'
                                : 'border-emerald-500/40 bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 text-white'
                    }`}
            >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="min-w-0 space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${!isLoaded
                                        ? 'bg-slate-800 text-slate-300'
                                        : report.criticalFindingsCount === 0
                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                                            : 'bg-rose-500/25 text-rose-200 border border-rose-400/40'
                                    }`}
                            >
                                {isLoaded && report.criticalFindingsCount === 0 ? (
                                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : isLoaded ? (
                                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                                ) : (
                                    <FileSignature className="w-4 h-4 text-indigo-300 shrink-0" />
                                )}
                                <span>
                                    {!isLoaded
                                        ? 'READY TO SIGN, WATERMARK OR BATES STAMP (0 FILES)'
                                        : report.signatureVerification.hasEmbeddedSigDictionary
                                            ? '✓ ISO 32000-1 /SIG & /BYTERANGE SEALED'
                                            : '✓ BATES & WATERMARK STREAM COMPILED'}
                                </span>
                            </span>

                            {config.enableBatesStamping && (
                                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-white/10 text-white">
                                    Bates: {isLoaded ? `${report.globalFirstBatesId} → ${report.globalLastBatesId}` : '0'}
                                </span>
                            )}

                            {config.shrinkPageToFitSafeMargins && (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/25 text-indigo-200 border border-indigo-400/30">
                                    94% Shrink-to-Fit Margin Safe
                                </span>
                            )}
                        </div>

                        <div className="text-base sm:text-lg font-extrabold tracking-tight text-white break-words">
                            {!isLoaded
                                ? '0 Active PDF Documents — Select a Scenario Preset Above or Drop PDF Files Below'
                                : `${report.totalFilesCount} PDF File(s) • ${report.totalInputPagesCount} Input Pages → ${report.totalOutputPagesCount} Output Pages (${config.appendAuditCertificatePage && config.enableDigitalSignature
                                    ? 'Includes SHA-256 Audit Certificate Page'
                                    : 'Direct Page Stream'
                                })`}
                        </div>

                        <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span>
                                <strong>Signer:</strong>{' '}
                                <span className="font-mono break-all">
                                    {isLoaded && config.enableDigitalSignature ? config.signerFullName : '—'}
                                </span>
                            </span>
                            <span>
                                <strong>Sealed SHA-256:</strong>{' '}
                                <span className="font-mono text-emerald-300 break-all">
                                    {report.stampedFiles[0] ? `${report.stampedFiles[0].stampedSha256Hex.slice(0, 24)}…` : '0'}
                                </span>
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <div className="rounded-xl bg-white/10 border border-white/15 px-3.5 py-2 text-left">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                                12-Rule Readiness Score
                            </div>
                            <div className="flex items-baseline gap-2 mt-0.5">
                                <span
                                    className={`text-lg font-black font-mono ${!isLoaded
                                            ? 'text-slate-300'
                                            : report.complianceScore >= 90
                                                ? 'text-emerald-400'
                                                : report.complianceScore >= 70
                                                    ? 'text-amber-300'
                                                    : 'text-rose-400'
                                        }`}
                                >
                                    {isLoaded ? `${report.complianceScore}/100 (${report.complianceGrade})` : '0 / 100'}
                                </span>
                                <span className="text-xs font-semibold text-slate-300">
                                    • {report.criticalFindingsCount} Crit / {report.warningFindingsCount} Warn
                                </span>
                            </div>
                        </div>

                        {report.lintFindings.length > 0 && (
                            <button
                                type="button"
                                onClick={handleAutoFix}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm transition cursor-pointer"
                            >
                                <Wrench className="w-4 h-4 shrink-0" />
                                <span>1-Click Auto-Fix ({report.lintFindings.length} Alerts)</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ============================================================================
          SECTION 3: LIVE PAGE PREVIEW CANVAS & 3-PIPELINE CONFIGURATION WORKBENCH
          ============================================================================ */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-5">
                {/* Pipeline Toggle Strip (Flex-Wrap so buttons never clip!) */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="space-y-1">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Active Document Execution &amp; Stamping Pipelines (Combine Any or All 4)
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setConfig((p) => ({ ...p, enableDigitalSignature: !p.enableDigitalSignature }))
                                }
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${config.enableDigitalSignature
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                {config.enableDigitalSignature ? '✓ ' : ''}1. Digital Signature &amp; /ByteRange Seal
                            </button>

                            <button
                                type="button"
                                onClick={() => setConfig((p) => ({ ...p, enableWatermark: !p.enableWatermark }))}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${config.enableWatermark
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                {config.enableWatermark ? '✓ ' : ''}2. Diagonal / Tiled Watermark
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setConfig((p) => ({ ...p, enableBatesStamping: !p.enableBatesStamping }))
                                }
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${config.enableBatesStamping
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                {config.enableBatesStamping ? '✓ ' : ''}3. Sequential Bates Numbering
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setConfig((p) => ({
                                        ...p,
                                        enableExhibitStickerPage1: !p.enableExhibitStickerPage1,
                                    }))
                                }
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${config.enableExhibitStickerPage1
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                {config.enableExhibitStickerPage1 ? '✓ ' : ''}4. Page 1 Court Exhibit Sticker
                            </button>
                        </div>
                    </div>

                    {isLoaded && report.stampedFiles.length > 1 && (
                        <button
                            type="button"
                            onClick={handleDownloadBatchZip}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shrink-0 cursor-pointer"
                        >
                            <Archive className="w-3.5 h-3.5" />
                            <span>Download Batch .ZIP ({report.stampedFiles.length} PDFs)</span>
                        </button>
                    )}
                </div>

                {/* Live Visual Page Preview Card + 3-Pipeline Parameter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                    {/* Left 5 cols on md+: Live High-DPI Page Preview & Overlay Legend */}
                    <div className="min-w-0 md:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <Eye className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                <span>Live Page Stream Preview</span>
                            </span>
                            <span className="text-[11px] font-mono text-slate-500">
                                {isLoaded ? `${files[0].fileName} (612×792 pt)` : '0 Pages'}
                            </span>
                        </div>

                        {!isLoaded ? (
                            <div
                                onClick={() => pdfInputRef.current?.click()}
                                className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center cursor-pointer hover:border-indigo-500 transition space-y-2"
                            >
                                <Upload className="w-7 h-7 text-indigo-600 mx-auto" />
                                <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                                    Drop .PDF Files Here or Click a Scenario Preset Above
                                </div>
                                <p className="text-[11px] text-slate-500">
                                    Supports Single or Multi-PDF Batch Continuous Bates Stamping, Watermarking &amp; Signing
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {report.pageBatesIndex.length > 1 && (
                                    <div className="flex flex-wrap items-center gap-1">
                                        {report.pageBatesIndex.slice(0, 9).map((pgRec, idx) => {
                                            const isActivePg = (config.previewPageIndex || 0) === idx;
                                            return (
                                                <button
                                                    key={pgRec.globalPageNumber}
                                                    type="button"
                                                    onClick={() =>
                                                        setConfig((p) => ({ ...p, previewPageIndex: idx }))
                                                    }
                                                    className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer ${isActivePg
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                                                        }`}
                                                >
                                                    Pg {pgRec.globalPageNumber}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="flex justify-center bg-slate-200/70 dark:bg-slate-900 rounded-xl p-3 border border-slate-300/80 dark:border-slate-800">
                                    <img
                                        src={report.activePreviewPngDataUri}
                                        alt="Live Stamped PDF Page Preview"
                                        className="w-48 sm:w-52 h-auto rounded shadow-md border border-slate-300 dark:border-slate-700"
                                    />
                                </div>

                                {/* Live Stamp Telemetry Badges on Preview */}
                                <div className="space-y-1.5 text-[11px]">
                                    <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                        <span className="font-semibold text-slate-500">Bates Stamp:</span>
                                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 break-all">
                                            {report.globalFirstBatesId} ({config.batesPosition})
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                        <span className="font-semibold text-slate-500">Exhibit Sticker:</span>
                                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400 break-all">
                                            {config.enableExhibitStickerPage1 ? config.exhibitStickerLabel : 'Disabled'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                        <span className="font-semibold text-slate-500">Watermark Layer:</span>
                                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                            {config.enableWatermark
                                                ? `${config.watermarkOpacityPercent}% (${config.watermarkLayer === 'UNDERLAY_BEHIND_TEXT' ? 'Underlay' : 'Overlay'
                                                })`
                                                : 'Disabled'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right 7 cols on md+: Bates, Watermark & Digital Signature Parameter Cards */}
                    <div className="min-w-0 md:col-span-7 space-y-4">
                        {/* CARD A: LEGAL BATES NUMBERING & COURT EXHIBIT STICKER CONTROLS */}
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                                <span className="font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                                    <Stamp className="w-3.5 h-3.5 shrink-0" />
                                    <span>A. Legal Bates Numbering, Shrink-to-Fit &amp; Court Exhibit Sticker</span>
                                </span>
                                <label className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.shrinkPageToFitSafeMargins}
                                        onChange={(e) =>
                                            setConfig((p) => ({ ...p, shrinkPageToFitSafeMargins: e.target.checked }))
                                        }
                                        className="rounded accent-emerald-600"
                                    />
                                    <span>Shrink Page 94% (Prevent Footnote Collision)</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div>
                                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Bates Prefix
                                    </label>
                                    <input
                                        type="text"
                                        value={config.batesPrefix}
                                        onChange={(e) => setConfig((p) => ({ ...p, batesPrefix: e.target.value }))}
                                        placeholder="ACME-PROD-"
                                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Start # &amp; Zero-Pad Digits
                                    </label>
                                    <div className="flex gap-1.5">
                                        <input
                                            type="number"
                                            min={1}
                                            value={config.batesStartNumber}
                                            onChange={(e) =>
                                                setConfig((p) => ({
                                                    ...p,
                                                    batesStartNumber: Math.max(1, Number(e.target.value) || 1),
                                                }))
                                            }
                                            className="w-1/2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-1.5 font-mono"
                                        />
                                        <input
                                            type="number"
                                            min={1}
                                            max={12}
                                            value={config.batesZeroPadDigits}
                                            onChange={(e) =>
                                                setConfig((p) => ({
                                                    ...p,
                                                    batesZeroPadDigits: Math.max(1, Math.min(12, Number(e.target.value) || 6)),
                                                }))
                                            }
                                            title="Zero-padding digits (e.g. 6 -> 000001)"
                                            className="w-1/2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-1.5 font-mono"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Stamp Position (6-Zone)
                                    </label>
                                    <select
                                        value={config.batesPosition}
                                        onChange={(e) =>
                                            setConfig((p) => ({
                                                ...p,
                                                batesPosition: e.target.value as BatesStampPosition,
                                            }))
                                        }
                                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-1.5"
                                    >
                                        {BATES_POSITIONS.map((pos) => (
                                            <option key={pos.id} value={pos.id}>
                                                {pos.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Page 1 Court Exhibit Sticker &amp; Case No.
                                    </label>
                                    <div className="flex gap-1.5">
                                        <input
                                            type="text"
                                            value={config.exhibitStickerLabel}
                                            onChange={(e) =>
                                                setConfig((p) => ({ ...p, exhibitStickerLabel: e.target.value }))
                                            }
                                            placeholder="EXHIBIT A"
                                            className="w-2/5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-1.5 font-mono font-bold"
                                        />
                                        <input
                                            type="text"
                                            value={config.exhibitCaseNumber}
                                            onChange={(e) =>
                                                setConfig((p) => ({ ...p, exhibitCaseNumber: e.target.value }))
                                            }
                                            placeholder="Case No. 2026-CV-04918"
                                            className="w-3/5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-1.5 font-mono"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Protective Order / Confidentiality Footer
                                    </label>
                                    <input
                                        type="text"
                                        value={config.confidentialityFooterText}
                                        onChange={(e) =>
                                            setConfig((p) => ({ ...p, confidentialityFooterText: e.target.value }))
                                        }
                                        placeholder="CONFIDENTIAL — SUBJECT TO PROTECTIVE ORDER"
                                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* CARD B: MULTI-LAYER DIAGONAL / TILED WATERMARK & DYNAMIC MACROS */}
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                                <span className="font-extrabold uppercase tracking-wider text-violet-700 dark:text-violet-300 flex items-center gap-1.5">
                                    <Layers className="w-3.5 h-3.5 shrink-0" />
                                    <span>B. Multi-Layer Watermark (Underlay vs. Overlay &amp; Dynamic Macros)</span>
                                </span>
                                <div className="flex flex-wrap gap-1">
                                    {(['{{RECIPIENT}}', '{{BATES}}', '{{DATE}}', '{{PAGE}}', '{{SHA256_8}}'] as const).map(
                                        (macro) => (
                                            <button
                                                key={macro}
                                                type="button"
                                                onClick={() =>
                                                    setConfig((p) => ({
                                                        ...p,
                                                        watermarkText: `${p.watermarkText} • ${macro}`,
                                                    }))
                                                }
                                                className="px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300 font-mono text-[10px] cursor-pointer"
                                            >
                                                +{macro}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Watermark Template (Supports Dynamic Macros)
                                    </label>
                                    <input
                                        type="text"
                                        value={config.watermarkText}
                                        onChange={(e) => setConfig((p) => ({ ...p, watermarkText: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Data-Room Recipient (<code>{'{{RECIPIENT}}'}</code>)
                                    </label>
                                    <input
                                        type="text"
                                        value={config.watermarkRecipientName}
                                        onChange={(e) =>
                                            setConfig((p) => ({ ...p, watermarkRecipientName: e.target.value }))
                                        }
                                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div>
                                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Grid Layout Mode
                                    </label>
                                    <select
                                        value={config.watermarkLayout}
                                        onChange={(e) =>
                                            setConfig((p) => ({
                                                ...p,
                                                watermarkLayout: e.target.value as WatermarkLayoutMode,
                                            }))
                                        }
                                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-1.5"
                                    >
                                        <option value="TILED_DIAGONAL_GRID">Tiled 3x4 Grid (Anti-Crop)</option>
                                        <option value="SINGLE_CENTER">Single Diagonal Center</option>
                                        <option value="SINGLE_TOP_BANNER">Single Top Header Banner</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Z-Order Layer (PDF Stream)
                                    </label>
                                    <select
                                        value={config.watermarkLayer}
                                        onChange={(e) =>
                                            setConfig((p) => ({
                                                ...p,
                                                watermarkLayer: e.target.value as WatermarkLayerPosition,
                                            }))
                                        }
                                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-1.5"
                                    >
                                        <option value="UNDERLAY_BEHIND_TEXT">Underlay (Behind Text)</option>
                                        <option value="OVERLAY_OVER_TEXT">Overlay (Over Text)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Opacity ({config.watermarkOpacityPercent}%) &amp; Angle ({config.watermarkRotationDeg}°)
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="range"
                                            min={5}
                                            max={95}
                                            value={config.watermarkOpacityPercent}
                                            onChange={(e) =>
                                                setConfig((p) => ({
                                                    ...p,
                                                    watermarkOpacityPercent: Number(e.target.value) || 22,
                                                }))
                                            }
                                            className="w-full accent-violet-600 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CARD C: DIGITAL SIGNATURE, PAGE INITIALS & /BYTERANGE SEAL */}
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                                <span className="font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                                    <FileSignature className="w-3.5 h-3.5 shrink-0" />
                                    <span>C. Digital Signature, Page Initials &amp; SHA-256 Audit Certificate</span>
                                </span>
                                <div className="flex flex-wrap items-center gap-3">
                                    <label className="inline-flex items-center gap-1 font-semibold cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.initialAllPages}
                                            onChange={(e) =>
                                                setConfig((p) => ({ ...p, initialAllPages: e.target.checked }))
                                            }
                                            className="rounded accent-emerald-600"
                                        />
                                        <span>Initial All Pages ({config.signerInitials})</span>
                                    </label>
                                    <label className="inline-flex items-center gap-1 font-semibold cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.appendAuditCertificatePage}
                                            onChange={(e) =>
                                                setConfig((p) => ({
                                                    ...p,
                                                    appendAuditCertificatePage: e.target.checked,
                                                }))
                                            }
                                            className="rounded accent-emerald-600"
                                        />
                                        <span>Append SHA-256 Audit Page</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div>
                                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Signer Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={config.signerFullName}
                                        onChange={(e) => setConfig((p) => ({ ...p, signerFullName: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Signing Reason (<code>/Reason</code>)
                                    </label>
                                    <input
                                        type="text"
                                        value={config.signingReason}
                                        onChange={(e) => setConfig((p) => ({ ...p, signingReason: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Jurisdiction / Location (<code>/Location</code>)
                                    </label>
                                    <input
                                        type="text"
                                        value={config.signingLocation}
                                        onChange={(e) => setConfig((p) => ({ ...p, signingLocation: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Visual Signature &amp; Seal Style
                                    </label>
                                    <select
                                        value={config.signatureStyle}
                                        onChange={(e) =>
                                            setConfig((p) => ({
                                                ...p,
                                                signatureStyle: e.target.value as SignatureVisualStyle,
                                            }))
                                        }
                                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5"
                                    >
                                        <option value="DRAWN_CURSIVE_VECTOR">Handwritten Cursive Vector</option>
                                        <option value="CORPORATE_ROUND_SEAL">Official Corporate Round Seal</option>
                                        <option value="TYPOGRAPHIC_EXECUTIVE">Typographic Executive Script</option>
                                        <option value="UPLOADED_WET_INK_PNG">Uploaded Wet-Ink PNG (Auto-Alpha)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Full Signature Page Placement
                                    </label>
                                    <select
                                        value={config.signaturePlacement}
                                        onChange={(e) =>
                                            setConfig((p) => ({
                                                ...p,
                                                signaturePlacement: e.target.value as SignaturePagePlacement,
                                            }))
                                        }
                                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5"
                                    >
                                        <option value="LAST_PAGE_ONLY">Final Execution Page Only (+ Initials)</option>
                                        <option value="FIRST_PAGE_ONLY">First Cover Page Only</option>
                                        <option value="ALL_PAGES">Full Signature Block on Every Page</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ============================================================================
          SECTION 4: 4 FULL-WIDTH HORIZONTAL SUMMARY ROWS (100% Overflow-Proof grid-cols-1)
          ============================================================================ */}
            <div className="grid grid-cols-1 gap-2.5 text-xs min-w-0">
                {/* Row 1: Active Pipelines, Document Batch & Total Stamped Pages */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0 shadow-2xs">
                    <div className="min-w-0 space-y-0.5">
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                            1. Active Execution Pipelines, Document Queue &amp; Output Page Count
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 break-words">
                            {isLoaded
                                ? `Sign: ${config.enableDigitalSignature ? 'ON' : 'OFF'} • Watermark: ${config.enableWatermark ? 'ON (' + config.watermarkLayout + ')' : 'OFF'
                                } • Bates: ${config.enableBatesStamping ? 'ON' : 'OFF'} • Exhibit Sticker: ${config.enableExhibitStickerPage1 ? config.exhibitStickerLabel : 'OFF'
                                }`
                                : '0 active PDF files — click any preset above or drop a PDF'}
                        </div>
                    </div>
                    <div className="text-sm font-extrabold font-mono text-indigo-600 dark:text-indigo-400 shrink-0">
                        {isLoaded
                            ? `${report.totalFilesCount} File(s) • ${report.totalInputPagesCount} → ${report.totalOutputPagesCount} Pages`
                            : '0 Files (0 Pages)'}
                    </div>
                </div>

                {/* Row 2: Sequential Bates Numbering Range & Shrink-to-Fit Margin Protection */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0 shadow-2xs">
                    <div className="min-w-0 space-y-0.5">
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                            2. Sequential eDiscovery Bates Range &amp; Shrink-to-Fit Safe MarginBox
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono break-all">
                            {isLoaded && config.enableBatesStamping
                                ? `Position: ${config.batesPosition} • Padding: ${config.batesZeroPadDigits} Digits • Margin Scaling: ${config.shrinkPageToFitSafeMargins ? '94% Safe MarginBox (Zero Collision)' : '100% Unscaled'
                                }`
                                : '0 Bates numbers assigned'}
                        </div>
                    </div>
                    <div className="text-sm font-extrabold font-mono text-slate-900 dark:text-white break-all sm:text-right">
                        {isLoaded && config.enableBatesStamping
                            ? `${report.globalFirstBatesId} → ${report.globalLastBatesId}`
                            : '0'}
                    </div>
                </div>

                {/* Row 3: Cryptographic Signature Seal (/Sig /ByteRange) & SHA-256 Digest */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0 shadow-2xs">
                    <div className="min-w-0 space-y-0.5">
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                            3. ISO 32000-1 Cryptographic Signature (<code>/Sig /ByteRange</code>) &amp; SHA-256 Seal
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono break-all">
                            {isLoaded && report.stampedFiles[0]
                                ? `SHA-256: ${report.stampedFiles[0].stampedSha256Hex} • SubFilter: ${report.signatureVerification.subFilter}`
                                : '0 cryptographic signatures embedded'}
                        </div>
                    </div>
                    <div className="text-sm font-extrabold font-mono text-emerald-600 dark:text-emerald-400 shrink-0">
                        {isLoaded
                            ? report.signatureVerification.hasEmbeddedSigDictionary
                                ? '✓ /ByteRange Sealed'
                                : 'Unsigned Stamp'
                            : '0'}
                    </div>
                </div>

                {/* Row 4: 12-Rule Legal, eDiscovery & Cryptographic Readiness Linter */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0 shadow-2xs">
                    <div className="min-w-0 space-y-0.5">
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                            4. 12-Rule Legal, eDiscovery &amp; Cryptographic Readiness Audit
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 break-words">
                            {isLoaded
                                ? `${report.criticalFindingsCount} Critical • ${report.warningFindingsCount} Warnings • AcroForm Flattened: ${config.flattenFormFieldsAndAnnotations ? 'Yes' : 'No'
                                } • /Info Scrubbed: ${config.scrubDocumentInfoMetadata ? 'Yes' : 'No'}`
                                : '0 compliance checks evaluated'}
                        </div>
                    </div>
                    <div
                        className={`text-sm font-extrabold font-mono shrink-0 ${!isLoaded
                                ? 'text-slate-900 dark:text-white'
                                : report.complianceScore >= 90
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-rose-600 dark:text-rose-400'
                            }`}
                    >
                        {isLoaded ? `${report.complianceScore}/100 (Grade ${report.complianceGrade})` : '0 / 100'}
                    </div>
                </div>
            </div>

            {/* ============================================================================
          SECTION 5: 5 DEEP-DIVE ENTERPRISE STUDIO TABS
          ============================================================================ */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
                <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 p-2 flex flex-wrap gap-1.5">
                    <button
                        type="button"
                        onClick={() => setActiveDeepTab('signature_pad_seal')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeDeepTab === 'signature_pad_seal'
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                            }`}
                    >
                        <PenTool className="w-3.5 h-3.5 shrink-0" />
                        <span>1. Signature Pad &amp; Wet-Ink Auto-Background Remover</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveDeepTab('bates_batch_index')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeDeepTab === 'bates_batch_index'
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                            }`}
                    >
                        <Stamp className="w-3.5 h-3.5 shrink-0" />
                        <span>2. Batch Bates Production Index ({report.pageBatesIndex.length} Pages)</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveDeepTab('compliance_linter_12')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeDeepTab === 'compliance_linter_12'
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                            }`}
                    >
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        <span>3. 12-Rule Legal &amp; eDiscovery Linter ({report.lintFindings.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveDeepTab('byterange_sha256_verifier')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeDeepTab === 'byterange_sha256_verifier'
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                            }`}
                    >
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>4. Cryptographic /Sig &amp; /ByteRange Verifier</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveDeepTab('ediscovery_audit_exports')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeDeepTab === 'ediscovery_audit_exports'
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                            }`}
                    >
                        <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                        <span>5. Export .PDF, .ZIP, Bates .XLSX / .CSV &amp; .JSON</span>
                    </button>
                </div>

                <div className="p-4 sm:p-6 space-y-5">
                    {/* ====================================================================
              TAB 1: INTERACTIVE SIGNATURE PAD & WET-INK BACKGROUND REMOVER
              ==================================================================== */}
                    {activeDeepTab === 'signature_pad_seal' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        Draw Handwritten Signature (Touch / Mouse / Stylus Pad)
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleClearSignaturePad}
                                        className="inline-flex items-center gap-1 text-rose-600 hover:underline font-semibold cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Clear Pad</span>
                                    </button>
                                </div>
                                <canvas
                                    ref={sigCanvasRef}
                                    width={340}
                                    height={110}
                                    onPointerDown={handlePadPointerDown}
                                    onPointerMove={handlePadPointerMove}
                                    onPointerUp={handlePadPointerUp}
                                    onPointerLeave={handlePadPointerUp}
                                    className="w-full h-28 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-white cursor-crosshair touch-none"
                                />
                                <p className="text-[11px] text-slate-500">
                                    Draw your signature above or choose a typographic executive script / corporate round seal style.
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                                <div className="font-bold text-slate-900 dark:text-white">
                                    Upload Wet-Ink Signature Photo (Auto-Removes White Paper Background!)
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                    Upload a photo or scan of your handwritten signature on white paper. Our luminance-threshold alpha
                                    filter automatically strips near-white paper pixels (<code>L &ge; 228</code>) so only transparent ink
                                    strokes are stamped onto your PDF.
                                </p>
                                <input
                                    ref={sigImgInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={handleWetInkSignatureUpload}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => sigImgInputRef.current?.click()}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
                                >
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>Upload Signature PNG / JPG (Auto-Transparent)</span>
                                </button>
                                {wetInkRemovedPixels > 0 && (
                                    <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                                        ✓ Stripped {wetInkRemovedPixels.toLocaleString()} white background pixels into transparent alpha!
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ====================================================================
              TAB 2: MULTI-PDF BATCH BATES PRODUCTION INDEX TABLE
              ==================================================================== */}
                    {activeDeepTab === 'bates_batch_index' && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                        Page-by-Page Sequential Bates Production &amp; Forensic Watermark Index
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Tracks continuous Bates numbering across all uploaded PDFs without resetting between files.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleSelectPreset('multi_pdf_continuous_bates_batch')}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition cursor-pointer"
                                >
                                    Load 3-PDF Batch Demo (000101–000109)
                                </button>
                            </div>

                            {report.pageBatesIndex.length === 0 ? (
                                <div className="p-6 text-center text-xs text-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl">
                                    0 Pages Indexed. Click <strong>Load 3-PDF Batch Demo</strong> above or upload PDFs to inspect
                                    continuous cross-file Bates numbering.
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-500">
                                                <th className="py-2.5 px-3">Global Pg</th>
                                                <th className="py-2.5 px-3">Document File Name</th>
                                                <th className="py-2.5 px-3">Pg in File</th>
                                                <th className="py-2.5 px-3">Assigned Bates ID</th>
                                                <th className="py-2.5 px-3">Exhibit Sticker</th>
                                                <th className="py-2.5 px-3">Signature / Initials</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                            {report.pageBatesIndex.map((row) => (
                                                <tr key={row.globalPageNumber}>
                                                    <td className="py-2 px-3 font-mono font-bold">{row.globalPageNumber}</td>
                                                    <td className="py-2 px-3 font-medium text-slate-900 dark:text-white break-all">
                                                        {row.fileName}
                                                    </td>
                                                    <td className="py-2 px-3 font-mono">{row.pageNumberInFile}</td>
                                                    <td className="py-2 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                                        {row.assignedBatesId}
                                                    </td>
                                                    <td className="py-2 px-3 font-mono text-rose-600 dark:text-rose-400">
                                                        {row.exhibitLabelApplied}
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        {row.hasFullSignatureBox ? (
                                                            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                                                                Signed + /ByteRange Seal
                                                            </span>
                                                        ) : row.hasInitialsStamp ? (
                                                            <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold text-[10px]">
                                                                Initialed ({config.signerInitials})
                                                            </span>
                                                        ) : (
                                                            '—'
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ====================================================================
              TAB 3: 12-RULE LEGAL, EDISCOVERY & CRYPTOGRAPHIC LINTER
              ==================================================================== */}
                    {activeDeepTab === 'compliance_linter_12' && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                        12-Rule Legal Discovery, Watermark Legibility &amp; Cryptographic Signature Audit
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Audits Bates bottom-footnote collision risk, eDiscovery zero-padding, unflattened AcroForm fields,
                                        watermark opacity, and ESIGN/eIDAS signer attribution.
                                    </p>
                                </div>
                                {report.lintFindings.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleAutoFix}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs transition cursor-pointer"
                                    >
                                        <Wrench className="w-4 h-4" />
                                        <span>1-Click Auto-Fix All ({report.lintFindings.length})</span>
                                    </button>
                                )}
                            </div>

                            {report.lintFindings.length === 0 ? (
                                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/30 p-5 flex items-center gap-3 text-emerald-900 dark:text-emerald-200">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                                    <div className="text-xs sm:text-sm">
                                        <div className="font-bold">
                                            {!isLoaded
                                                ? 'Ready to Audit — Click "2. Compliance & eDiscovery Defect Demo" Above to Test the 12-Rule Linter'
                                                : 'All 12 Legal, eDiscovery & Cryptographic Rules Passed (Score: 100/100 Grade A+)'}
                                        </div>
                                        <p className="text-xs opacity-85 mt-0.5">
                                            94% Shrink-to-Fit margin protection active, 6-digit sortable Bates padding verified, AcroForm
                                            fields flattened, and SHA-256 Audit Certificate attached.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {report.lintFindings.map((f) => (
                                        <div
                                            key={f.ruleId}
                                            className={`rounded-xl border p-4 space-y-1.5 ${f.severity === 'CRITICAL'
                                                    ? 'border-rose-300 dark:border-rose-900/80 bg-rose-50/60 dark:bg-rose-950/25'
                                                    : 'border-amber-300 dark:border-amber-900/80 bg-amber-50/60 dark:bg-amber-950/25'
                                                }`}
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${f.severity === 'CRITICAL'
                                                                ? 'bg-rose-600 text-white'
                                                                : 'bg-amber-500 text-slate-950'
                                                            }`}
                                                    >
                                                        {f.severity}
                                                    </span>
                                                    <span className="font-mono text-xs font-bold">{f.ruleId}</span>
                                                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                                        {f.title}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] font-mono text-slate-500">{f.category}</span>
                                            </div>
                                            <p className="text-xs text-slate-700 dark:text-slate-300 font-mono break-words">
                                                <strong>Evidence:</strong> {f.evidence}
                                            </p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                                <strong>Remediation:</strong> {f.remediation}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ====================================================================
              TAB 4: CRYPTOGRAPHIC /SIG & /BYTERANGE TAMPER-EVIDENT VERIFIER
              ==================================================================== */}
                    {activeDeepTab === 'byterange_sha256_verifier' && (
                        <div className="space-y-4 text-xs">
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-4 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                                        ISO 32000-1 /Type /Sig Dictionary &amp; Exact /ByteRange Integrity Verification
                                    </div>
                                    {isLoaded && config.enableDigitalSignature && (
                                        <button
                                            type="button"
                                            onClick={() => setSimulateTamperTest((prev) => !prev)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${simulateTamperTest
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                                                }`}
                                        >
                                            {simulateTamperTest
                                                ? '✓ Restore Intact Signed PDF'
                                                : 'Simulate 1-Byte Post-Signing Tamper Test'}
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="rounded-lg bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800">
                                        <span className="text-slate-500 block">ByteRange Digest Verification Status</span>
                                        <span
                                            className={`font-mono font-bold break-words ${activeVerification.isByteRangeIntactAndTamperFree
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : 'text-rose-600 dark:text-rose-400'
                                                }`}
                                        >
                                            {activeVerification.verificationSummary}
                                        </span>
                                    </div>
                                    <div className="rounded-lg bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800">
                                        <span className="text-slate-500 block">SubFilter &amp; Exact ByteRange Array</span>
                                        <span className="font-mono font-bold text-slate-900 dark:text-white break-all">
                                            {activeVerification.subFilter} •{' '}
                                            {activeVerification.byteRange
                                                ? `[${activeVerification.byteRange.join(', ')}]`
                                                : '—'}
                                        </span>
                                    </div>
                                    <div className="rounded-lg bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800">
                                        <span className="text-slate-500 block">Signer Identity &amp; Location</span>
                                        <span className="font-mono font-bold text-slate-900 dark:text-white break-words">
                                            {activeVerification.signerName} ({activeVerification.signingLocation})
                                        </span>
                                    </div>
                                    <div className="rounded-lg bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800">
                                        <span className="text-slate-500 block">Computed /ByteRange SHA-256 Digest</span>
                                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 break-all">
                                            {activeVerification.computedByteRangeSha256Hex}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ====================================================================
              TAB 5: EXPORT STAMPED .PDF, BATCH .ZIP, BATES .XLSX/.CSV & .JSON
              ==================================================================== */}
                    {activeDeepTab === 'ediscovery_audit_exports' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                            <button
                                type="button"
                                onClick={handleDownloadPrimaryPdf}
                                disabled={!isLoaded}
                                className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/70 dark:bg-indigo-950/40 p-4 text-left hover:border-indigo-500 disabled:opacity-40 transition cursor-pointer space-y-1"
                            >
                                <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-200">
                                    <Download className="w-4 h-4 text-indigo-600 shrink-0" />
                                    <span>Download Signed .PDF</span>
                                </div>
                                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                    Binary PDF 1.7 with Bates, Watermark, Signature &amp; Audit Page.
                                </p>
                            </button>

                            <button
                                type="button"
                                onClick={handleDownloadBatchZip}
                                disabled={!isLoaded}
                                className="rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/70 dark:bg-purple-950/40 p-4 text-left hover:border-purple-500 disabled:opacity-40 transition cursor-pointer space-y-1"
                            >
                                <div className="flex items-center gap-2 font-bold text-purple-900 dark:text-purple-200">
                                    <Archive className="w-4 h-4 text-purple-600 shrink-0" />
                                    <span>Download Batch .ZIP</span>
                                </div>
                                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                    All stamped PDFs + CSV Bates index + JSON cryptographic certificate.
                                </p>
                            </button>

                            <button
                                type="button"
                                onClick={handleDownloadXlsx}
                                disabled={!isLoaded}
                                className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/40 p-4 text-left hover:border-emerald-500 disabled:opacity-40 transition cursor-pointer space-y-1"
                            >
                                <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200">
                                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>Export Bates Log .XLSX</span>
                                </div>
                                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                    CWE-1236 safe Excel workbook for Relativity / eDiscovery production.
                                </p>
                            </button>

                            <button
                                type="button"
                                onClick={handleDownloadCsv}
                                disabled={!isLoaded}
                                className="rounded-xl border border-sky-200 dark:border-sky-900 bg-sky-50/70 dark:bg-sky-950/40 p-4 text-left hover:border-sky-500 disabled:opacity-40 transition cursor-pointer space-y-1"
                            >
                                <div className="flex items-center gap-2 font-bold text-sky-900 dark:text-sky-200">
                                    <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                                    <span>Export Bates Log .CSV</span>
                                </div>
                                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                    UTF-8 BOM CSV with page-by-page Bates IDs and SHA-256 digests.
                                </p>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ============================================================================
          SECTION 6: TECHNICAL SPECIFICATION & ZERO-UPLOAD PRIVACY DISCLOSURE
          ============================================================================ */}
            <details className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-xs text-slate-600 dark:text-slate-400">
                <summary className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer flex items-center justify-between">
                    <span className="inline-flex items-center gap-2">
                        <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>
                            ISO 32000-1 /ByteRange Digital Sealing, Shrink-to-Fit Bates MarginBox &amp; Zero-Upload Privacy Disclosure
                        </span>
                    </span>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold shrink-0">
                        Click to expand
                    </span>
                </summary>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 leading-relaxed">
                    <p>
                        <strong>100% Local Browser Execution:</strong> Your privileged contracts, discovery productions, and
                        signature images are processed strictly inside your browser&apos;s local memory. Zero bytes are ever
                        uploaded to any external server.
                    </p>
                    <p>
                        <strong>Cryptographic Sealing &amp; eDiscovery Scope:</strong> The engine embeds an ISO 32000-1{' '}
                        <code>/Type /Sig</code> dictionary with <code>/SubFilter /adbe.pkcs7.detached</code>,{' '}
                        <code>/ByteRange</code> coverage, and SHA-256 document digests for tamper-evidence. For regulated statutory
                        notarization requiring a hardware USB token or cloud HSM (Qualified Trust Service Provider), verify your
                        jurisdiction&apos;s certificate authority rules.
                    </p>
                </div>
            </details>
        </div>
    );
}