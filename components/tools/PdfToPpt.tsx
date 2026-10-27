/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef, useId } from 'react';
import {
  UploadCloud,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Sparkles,
  Presentation,
} from 'lucide-react';
import {
  convertPdfToPpt,
  type PptAspectRatio,
  type PptSlideMode,
  type PdfToPptResult,
} from '@/lib/pdfToPptEngine';

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function PdfToPpt() {
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aspectRatio, setAspectRatio] = useState<PptAspectRatio>('16:9');
  const [mode, setMode] = useState<PptSlideMode>('visual_slide_with_notes');
  const [dpi, setDpi] = useState<72 | 150 | 300>(150);
  const [pageRange, setPageRange] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PdfToPptResult | null>(null);

  const handleFileSelect = (file: File) => {
    setError(null);
    setResult(null);
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setError('Please upload a valid PDF document (.pdf).');
      return;
    }
    setSelectedFile(file);
  };

  const handleConvert = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);
    try {
      const ab = await selectedFile.arrayBuffer();
      const res = await convertPdfToPpt(new Uint8Array(ab), selectedFile.name, {
        aspectRatio,
        mode,
        dpi,
        pageRange: pageRange.trim() || 'all',
      });
      setResult(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to build PowerPoint (.pptx) presentation from PDF.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPptx = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.pptxBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6">
      {/* Privacy Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-xs text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>100% Client-Side PDF to PowerPoint (.pptx) Deck Builder • Zero Server Uploads</span>
        </div>
        <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-slate-900 dark:text-emerald-300">
          16:9 Widescreen &amp; 4:3 Standard
        </span>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) handleFileSelect(f);
        }}
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-8 text-center transition hover:border-orange-500 hover:bg-orange-50/20 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-orange-500"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileSelect(f);
          }}
        />
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-950/70 dark:text-orange-400">
          <UploadCloud className="h-7 w-7" />
        </div>
        <p className="text-base font-bold text-slate-900 dark:text-white">
          {selectedFile ? selectedFile.name : 'Click or Drag & Drop your PDF Presentation or Report here'}
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {selectedFile
            ? `Size: ${formatBytes(selectedFile.size)} • Ready to generate .pptx slides`
            : 'Converts every PDF page into a native Microsoft PowerPoint (.pptx) slide locally'}
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="space-y-1.5">
          <label htmlFor={`${formId}-mode`} className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Slide Reconstruction Mode
          </label>
          <select
            id={`${formId}-mode`}
            value={mode}
            onChange={(e) => setMode(e.target.value as PptSlideMode)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="visual_slide_with_notes">High-DPI Visual Slides (100% Exact Layout)</option>
            <option value="editable_text_boxes">Editable Native PowerPoint Text Boxes</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${formId}-ratio`} className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Slide Aspect Ratio
          </label>
          <select
            id={`${formId}-ratio`}
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as PptAspectRatio)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="16:9">Widescreen 16:9 (13.33 × 7.5 in)</option>
            <option value="4:3">Standard 4:3 (10 × 7.5 in)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${formId}-dpi`} className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Slide Resolution (DPI)
          </label>
          <select
            id={`${formId}-dpi`}
            value={dpi}
            onChange={(e) => setDpi(Number(e.target.value) as 72 | 150 | 300)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value={72}>72 DPI (Compact Email Deck)</option>
            <option value={150}>150 DPI (Standard HD Presentation)</option>
            <option value={300}>300 DPI (Ultra-Crisp Conference Display)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${formId}-range`} className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Page Range (Optional)
          </label>
          <div className="flex gap-2">
            <input
              id={`${formId}-range`}
              type="text"
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value)}
              placeholder="All (or 1-10)"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <button
              type="button"
              disabled={!selectedFile || isProcessing}
              onClick={handleConvert}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-orange-700 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              <span>{isProcessing ? 'Building...' : 'Convert'}</span>
            </button>
            {selectedFile && (
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setResult(null);
                  setError(null);
                }}
                aria-label="Clear file"
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-900"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Results & Slide Storyboard */}
      {result && (
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50/60 p-6 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {result.fileName} ({formatBytes(result.pptxBytes.byteLength)})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {result.slideCount} PowerPoint Slides • {result.aspectRatio} Widescreen • ECMA-376 OpenXML Package
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadPptx}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-orange-700"
            >
              <Download className="h-4 w-4" />
              <span>Download PowerPoint (.pptx)</span>
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Presentation className="h-4 w-4 text-orange-500" />
              <span>Slide Deck Storyboard Preview ({result.slideCount} Slides)</span>
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.slides.slice(0, 12).map((sl) => (
                <div
                  key={sl.slideNumber}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
                    <img
                      src={sl.previewDataUrl}
                      alt={`Slide ${sl.slideNumber}`}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="p-3 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-orange-600 dark:text-orange-400">
                      <span>Slide {sl.slideNumber}</span>
                      <span className="text-slate-400">PDF Page {sl.pageNumber}</span>
                    </div>
                    <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                      {sl.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
