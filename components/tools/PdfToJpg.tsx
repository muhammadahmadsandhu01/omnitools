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
  Image as ImageIcon,
  FileArchive,
} from 'lucide-react';
import {
  convertPdfToImages,
  type PdfImageOutputFormat,
  type PdfImageDpiTier,
  type PdfToJpgResult,
  type RenderedPdfPageImage,
} from '@/lib/pdfToJpgEngine';

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function PdfToJpg() {
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [format, setFormat] = useState<PdfImageOutputFormat>('image/jpeg');
  const [dpi, setDpi] = useState<PdfImageDpiTier>(150);
  const [quality, setQuality] = useState<number>(0.92);
  const [pageRange, setPageRange] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PdfToJpgResult | null>(null);

  const handleFileSelect = (file: File) => {
    setError(null);
    setResult(null);
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setError('Please select a valid PDF document (.pdf).');
      return;
    }
    setSelectedFile(file);
  };

  const handleConvert = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);
    setProgressText('Initializing PDF rasterizer...');
    try {
      const ab = await selectedFile.arrayBuffer();
      const res = await convertPdfToImages(new Uint8Array(ab), selectedFile.name, {
        format,
        dpi,
        quality,
        pageRange: pageRange.trim() || 'all',
        onProgress: (cur, tot) => {
          setProgressText(`Rendering page ${cur} of ${tot} at ${dpi} DPI...`);
        },
      });
      setResult(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to rasterize PDF pages into images.'
      );
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  const handleDownloadZip = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.zipFileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSingleImage = (img: RenderedPdfPageImage) => {
    const a = document.createElement('a');
    a.href = img.dataUrl;
    a.download = img.fileName;
    a.click();
  };

  return (
    <div className="w-full space-y-6">
      {/* Privacy Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-xs text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>100% Client-Side PDF to JPG / PNG / WebP Rasterizer (Up to 600 DPI) • Zero Server Uploads</span>
        </div>
        <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-slate-900 dark:text-emerald-300">
          HTML5 Canvas + ZIP
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
        className="cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-8 text-center transition hover:border-pink-500 hover:bg-pink-50/20 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-pink-500"
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
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-100 text-pink-600 dark:bg-pink-950/70 dark:text-pink-400">
          <UploadCloud className="h-7 w-7" />
        </div>
        <p className="text-base font-bold text-slate-900 dark:text-white">
          {selectedFile ? selectedFile.name : 'Click or Drag & Drop your PDF file here'}
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {selectedFile
            ? `Size: ${formatBytes(selectedFile.size)} • Ready for multi-DPI image extraction`
            : 'Convert PDF pages into high-resolution JPG, lossless PNG, or WebP images locally'}
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="space-y-1.5">
          <label htmlFor={`${formId}-fmt`} className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Output Image Format
          </label>
          <select
            id={`${formId}-fmt`}
            value={format}
            onChange={(e) => setFormat(e.target.value as PdfImageOutputFormat)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="image/jpeg">JPG / JPEG (High Compatibility)</option>
            <option value="image/png">PNG (Lossless Pixel-Sharp Text)</option>
            <option value="image/webp">WebP (Modern Compact Web Format)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${formId}-dpi`} className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Resolution Tier (DPI)
          </label>
          <select
            id={`${formId}-dpi`}
            value={dpi}
            onChange={(e) => setDpi(Number(e.target.value) as PdfImageDpiTier)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value={72}>72 DPI (1x Screen Preview)</option>
            <option value={150}>150 DPI (2x Standard HD — Recommended)</option>
            <option value={300}>300 DPI (4x Commercial Print Quality)</option>
            <option value={600}>600 DPI (8x Ultra Archival Resolution)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${formId}-qual`} className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Compression Quality ({Math.round(quality * 100)}%)
          </label>
          <input
            id={`${formId}-qual`}
            type="range"
            min={0.4}
            max={1.0}
            step={0.04}
            disabled={format === 'image/png'}
            value={quality}
            onChange={(e) => setQuality( parseFloat(e.target.value) )}
            className="mt-2 w-full accent-blue-600"
          />
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
              placeholder="All (or 1-5, 8)"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <button
              type="button"
              disabled={!selectedFile || isProcessing}
              onClick={handleConvert}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              <span>{isProcessing ? 'Rendering...' : 'Convert'}</span>
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

      {isProcessing && progressText && (
        <div className="flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 p-3.5 text-xs font-semibold text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span>{progressText}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Results & Per-Page Image Gallery */}
      {result && (
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50/60 p-6 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {result.pageCount} High-Resolution Page Images Ready ({result.dpi} DPI)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Archive: {result.zipFileName} ({formatBytes(result.zipBytes.byteLength)})
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadZip}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
            >
              <FileArchive className="h-4 w-4" />
              <span>Download All Images (.ZIP)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.images.map((img) => (
              <div
                key={img.pageNumber}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="aspect-[3/4] w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                  <img
                    src={img.dataUrl}
                    alt={`Page ${img.pageNumber}`}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 pt-1">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Page {img.pageNumber} ({img.widthPx}×{img.heightPx}px)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {formatBytes(img.byteSize)} • {img.fileName}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadSingleImage(img)}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:text-slate-200"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
