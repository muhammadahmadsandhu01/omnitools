'use client';

import React, { useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import {
  FileText,
  Upload,
  Download,
  Sparkles,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sliders,
  ShieldCheck,
  Archive,
  Eye,
  Gauge,
  Layers,
  RefreshCw,
} from 'lucide-react';
import {
  compressPdfDocument,
  createSampleBloatedPdf,
  TARGET_KB_PRESETS,
  type PdfCompressionMode,
  type PdfCompressionOptions,
  type PdfCompressionResult,
} from '@/lib/pdfCompressorEngine';

interface QueuedPdfItem {
  id: string;
  fileName: string;
  bytes: Uint8Array;
  status: 'pending' | 'compressing' | 'done' | 'error';
  progressText?: string;
  progressPercent?: number;
  error?: string;
  result?: PdfCompressionResult;
}

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export default function PdfCompressor() {
  const [items, setItems] = useState<QueuedPdfItem[]>([]);
  const [mode, setMode] = useState<PdfCompressionMode>('balanced');
  const [targetKb, setTargetKb] = useState<number>(200);
  const [customDpi, setCustomDpi] = useState<72 | 96 | 120 | 150 | 200 | 300>(150);
  const [jpegQuality, setJpegQuality] = useState<number>(0.74);
  const [grayscale, setGrayscale] = useState<boolean>(false);
  const [stripMetadata, setStripMetadata] = useState<boolean>(true);
  const [flattenFormsAndAnnotations, setFlattenFormsAndAnnotations] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedInspectId, setSelectedInspectId] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const runCompressionForItems = useCallback(
    async (
      queue: QueuedPdfItem[],
      opts: PdfCompressionOptions
    ) => {
      if (queue.length === 0) return;
      setIsProcessing(true);
      setErrorBanner(null);

      const updated = [...queue];

      for (let i = 0; i < updated.length; i++) {
        const item = updated[i];
        updated[i] = {
          ...item,
          status: 'compressing',
          progressText: 'Starting local compression...',
          progressPercent: 10,
          error: undefined,
        };
        setItems([...updated]);

        try {
          const res = await compressPdfDocument(
            item.bytes,
            item.fileName,
            opts,
            (stage, percent) => {
              updated[i] = {
                ...updated[i],
                progressText: stage,
                progressPercent: percent,
              };
              setItems([...updated]);
            }
          );

          updated[i] = {
            ...updated[i],
            status: 'done',
            progressText: 'Done',
            progressPercent: 100,
            result: res,
          };
          setItems([...updated]);
          if (i === 0) {
            setSelectedInspectId(updated[i].id);
          }
        } catch (err) {
          updated[i] = {
            ...updated[i],
            status: 'error',
            error: err instanceof Error ? err.message : 'Failed to compress PDF.',
          };
          setItems([...updated]);
        }
      }

      setIsProcessing(false);
    },
    []
  );

  const currentOptions: PdfCompressionOptions = {
    mode,
    targetKb,
    customDpi,
    jpegQuality,
    grayscale,
    stripMetadata,
    flattenFormsAndAnnotations,
  };

  const handleFilesSelected = async (fileList: FileList | File[]) => {
    setErrorBanner(null);
    const files = Array.from(fileList).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (files.length === 0) {
      setErrorBanner('Please select at least one valid .pdf file.');
      return;
    }

    if (items.length + files.length > 25) {
      setErrorBanner('You can batch compress up to 25 PDF files at once.');
      return;
    }

    const newQueued: QueuedPdfItem[] = [];
    for (const file of files) {
      const buf = await file.arrayBuffer();
      newQueued.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        fileName: file.name,
        bytes: new Uint8Array(buf),
        status: 'pending',
      });
    }

    const combined = [...items, ...newQueued];
    setItems(combined);
    await runCompressionForItems(combined, currentOptions);
  };

  const handleLoadSamplePdf = async () => {
    setErrorBanner(null);
    setIsProcessing(true);
    try {
      const sampleBytes = await createSampleBloatedPdf();
      const sampleItem: QueuedPdfItem = {
        id: `sample-${Date.now()}`,
        fileName: 'Enterprise_Financial_Report_Unoptimized.pdf',
        bytes: sampleBytes,
        status: 'pending',
      };
      const nextQueue = [sampleItem];
      setItems(nextQueue);
      await runCompressionForItems(nextQueue, currentOptions);
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Could not generate sample PDF.');
      setIsProcessing(false);
    }
  };

  const handleRecompressAll = async () => {
    if (items.length === 0 || isProcessing) return;
    await runCompressionForItems(items, currentOptions);
  };

  const handleDownloadSingle = (res: PdfCompressionResult) => {
    const url = URL.createObjectURL(res.outputBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = res.fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const handleDownloadAllZip = async () => {
    const completed = items.filter((i) => i.status === 'done' && i.result);
    if (completed.length === 0) return;

    const zip = new JSZip();
    for (const item of completed) {
      if (item.result) {
        zip.file(item.result.fileName, item.result.outputBytes);
      }
    }
    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KivaroTools_Compressed_PDFs_${completed.length}_files.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const completedItems = items.filter((i) => i.status === 'done' && i.result);
  const totalOriginalBytes = completedItems.reduce(
    (acc, i) => acc + (i.result?.originalBytes || 0),
    0
  );
  const totalCompressedBytes = completedItems.reduce(
    (acc, i) => acc + (i.result?.compressedBytes || 0),
    0
  );
  const totalSavedBytes = Math.max(0, totalOriginalBytes - totalCompressedBytes);
  const totalReductionPct =
    totalOriginalBytes > 0
      ? Number(((totalSavedBytes / totalOriginalBytes) * 100).toFixed(1))
      : 0;

  const inspectedItem =
    items.find((i) => i.id === selectedInspectId && i.result) || completedItems[0];

  return (
    <div className="space-y-6">
      {/* Top Privacy & Feature Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 px-4 py-3 text-xs text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
        <div className="flex items-center gap-2 font-medium">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            <strong>100% Client-Side PDF Compression:</strong> Your PDFs are compressed in local browser RAM with zero server uploads.
          </span>
        </div>
        <button
          type="button"
          onClick={handleLoadSamplePdf}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-emerald-700 disabled:opacity-50"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Load Sample Bloated PDF (1-Click Test)
        </button>
      </div>

      {/* Compression Mode Selector (4 Enterprise Modes) */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/50 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Gauge className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            1. Select PDF Compression Mode
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Includes Never-Grow Guard (output never exceeds original size)
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              id: 'balanced' as const,
              title: 'Balanced (Recommended)',
              badge: '~50%–70% Smaller',
              desc: '150 DPI Retina clarity + 74% perceptual JPEG & XMP metadata stripping.',
            },
            {
              id: 'target_kb' as const,
              title: 'Exact Target KB / MB',
              badge: '100KB / 200KB Fit',
              desc: 'Multi-pass binary search solver for strict government, job & visa portals.',
            },
            {
              id: 'extreme' as const,
              title: 'Extreme Compression',
              badge: 'Up to 88% Smaller',
              desc: '96 DPI high-density compression for large scanned PDFs and email limits.',
            },
            {
              id: 'lossless' as const,
              title: 'Lossless Vector Stream',
              badge: '100% Sharp Vector',
              desc: 'Keeps text & vectors 100% untouched; compacts XRef object streams & metadata.',
            },
          ].map((card) => {
            const active = mode === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setMode(card.id)}
                className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                  active
                    ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 dark:border-blue-500 dark:bg-blue-950/40'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {card.title}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        active
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {card.badge}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-4 text-slate-600 dark:text-slate-400">
                    {card.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Target KB Presets Bar (when target_kb is selected) */}
        {mode === 'target_kb' && (
          <div className="mt-4 rounded-xl border border-blue-200 bg-white p-3.5 dark:border-blue-900/50 dark:bg-slate-950">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <label
                  htmlFor="target-kb-input"
                  className="block text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  Target Maximum PDF File Size (KB):
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Pick a portal preset below or enter any custom KB limit (e.g. 100 KB, 200 KB, 500 KB).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="target-kb-input"
                  type="number"
                  min={20}
                  max={51200}
                  value={targetKb}
                  onChange={(e) => setTargetKb(Math.max(20, Number(e.target.value) || 100))}
                  className="w-28 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">KB</span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {TARGET_KB_PRESETS.map((preset) => (
                <button
                  key={preset.kb}
                  type="button"
                  onClick={() => setTargetKb(preset.kb)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                    targetKb === preset.kb
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                  }`}
                >
                  <span>≤ {preset.label}</span>
                  <span className="opacity-75 text-[10px]">({preset.badge})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fine-Grained Controls Row */}
        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-200/80 pt-4 dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="pdf-dpi-select"
              className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <Sliders className="h-3.5 w-3.5 text-blue-600" />
              Target Resolution (DPI)
            </label>
            <select
              id="pdf-dpi-select"
              value={customDpi}
              disabled={mode === 'lossless' || mode === 'target_kb'}
              onChange={(e) =>
                setCustomDpi(Number(e.target.value) as 72 | 96 | 120 | 150 | 200 | 300)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value={72}>72 DPI (Screen / Smallest)</option>
              <option value={96}>96 DPI (Compact Email)</option>
              <option value={120}>120 DPI (Standard Portal)</option>
              <option value={150}>150 DPI (Retina Web — Default)</option>
              <option value={200}>200 DPI (High Clarity)</option>
              <option value={300}>300 DPI (Print Archival)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="pdf-quality-slider"
              className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <span>Image Stream Quality</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">
                {Math.round(jpegQuality * 100)}%
              </span>
            </label>
            <input
              id="pdf-quality-slider"
              type="range"
              min={0.2}
              max={0.95}
              step={0.02}
              value={jpegQuality}
              disabled={mode === 'lossless' || mode === 'target_kb'}
              onChange={(e) => setJpegQuality(Number(e.target.value))}
              className="w-full accent-blue-600 disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col justify-center gap-1.5">
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={grayscale}
                onChange={(e) => setGrayscale(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Grayscale Monochrome (Black &amp; White)</span>
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={stripMetadata}
                onChange={(e) => setStripMetadata(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Strip XMP &amp; Producer Metadata Bloat</span>
            </label>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={handleRecompressAll}
              disabled={items.length === 0 || isProcessing}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-40"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              {isProcessing ? 'Compressing...' : 'Apply & Re-Compress All'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorBanner && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.length) {
            void handleFilesSelected(e.dataTransfer.files);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className="group cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center transition hover:border-blue-500 hover:bg-blue-50/30 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-blue-500/60 sm:p-8"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) {
              void handleFilesSelected(e.target.files);
              e.target.value = '';
            }
          }}
        />
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 transition group-hover:scale-105 dark:bg-blue-950/80 dark:text-blue-400">
          <Upload className="h-6 w-6" />
        </div>
        <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
          Click to select PDF files or drag &amp; drop here
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Batch compress up to 25 PDF documents at once (up to 500 MB total) • 100% Private Local RAM Execution
        </p>
      </div>

      {/* Results & Savings Summary Dashboard */}
      {items.length > 0 && (
        <div className="space-y-6">
          {/* Aggregate KPI Strip */}
          {completedItems.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Original Total Size
                </span>
                <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                  {formatFileSize(totalOriginalBytes)}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                  Compressed Total Size
                </span>
                <p className="mt-1 text-lg font-extrabold text-emerald-700 dark:text-emerald-300">
                  {formatFileSize(totalCompressedBytes)}
                </p>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 dark:border-blue-900/50 dark:bg-blue-950/30">
                <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300">
                  Total Space Saved
                </span>
                <p className="mt-1 text-lg font-extrabold text-blue-700 dark:text-blue-300">
                  {formatFileSize(totalSavedBytes)} ({totalReductionPct}%)
                </p>
              </div>
              <div className="flex flex-col justify-center gap-1.5 rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={handleDownloadAllZip}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-emerald-700"
                >
                  <Archive className="h-3.5 w-3.5" />
                  Download All ({completedItems.length}) ZIP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setItems([]);
                    setSelectedInspectId(null);
                  }}
                  className="inline-flex w-full items-center justify-center gap-1 text-[11px] font-medium text-slate-500 hover:text-red-600 dark:text-slate-400"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear Queue
                </button>
              </div>
            </div>
          )}

          {/* File Queue Table (Scrollable on Mobile) */}
          <div className="w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <table className="min-w-[580px] w-full text-left text-xs border-collapse">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                <tr>
                  <th className="p-3 font-semibold">PDF Document</th>
                  <th className="p-3 font-semibold">Pages</th>
                  <th className="p-3 font-semibold">Original</th>
                  <th className="p-3 font-semibold">Compressed</th>
                  <th className="p-3 font-semibold">Savings</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {items.map((item) => {
                  const res = item.result;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    >
                      <td className="p-3 font-medium text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                          <div>
                            <div className="truncate max-w-[220px] sm:max-w-[300px]">
                              {item.fileName}
                            </div>
                            {res && (
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                {res.appliedStrategy}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {res ? `${res.pageCount}p` : '—'}
                      </td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                        {formatFileSize(item.bytes.byteLength)}
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {item.status === 'compressing' ? (
                          <span className="text-blue-600 dark:text-blue-400">
                            {item.progressPercent}% ({item.progressText})
                          </span>
                        ) : res ? (
                          formatFileSize(res.compressedBytes)
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3">
                        {res ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" />
                            -{res.reductionPercent}%
                          </span>
                        ) : item.status === 'error' ? (
                          <span className="text-red-600">{item.error}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {res && (
                            <>
                              <button
                                type="button"
                                onClick={() => setSelectedInspectId(item.id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                              >
                                <Eye className="h-3 w-3" />
                                X-Ray
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownloadSingle(res)}
                                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-700"
                              >
                                <Download className="h-3 w-3" />
                                Download
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Interactive PDF Space X-Ray & Before/After Visual Inspector */}
          {inspectedItem?.result && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* PDF Space X-Ray Breakdown Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  PDF Internal Space X-Ray Audit ({inspectedItem.fileName})
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Breakdown of byte allocation across Embedded Images, Fonts/Content, XMP Metadata, and Object Structure.
                </p>

                <div className="mt-4 space-y-3">
                  <div>
                    <div className="mb-1 flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>Before Compression ({formatFileSize(inspectedItem.result.originalBytes)})</span>
                      <span>{inspectedItem.result.beforeXRay.estimatedObjectCount} PDF Objects</span>
                    </div>
                    <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        style={{ width: `${inspectedItem.result.beforeXRay.imagePercentage}%` }}
                        className="bg-blue-600"
                        title="Images"
                      />
                      <div
                        style={{ width: `${inspectedItem.result.beforeXRay.contentPercentage}%` }}
                        className="bg-emerald-500"
                        title="Content & Fonts"
                      />
                      <div
                        style={{ width: `${inspectedItem.result.beforeXRay.metadataPercentage}%` }}
                        className="bg-amber-500"
                        title="Metadata & XMP"
                      />
                      <div
                        style={{ width: `${inspectedItem.result.beforeXRay.structurePercentage}%` }}
                        className="bg-purple-500"
                        title="XRef & Structure"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      <span>After Compression ({formatFileSize(inspectedItem.result.compressedBytes)})</span>
                      <span>Saved {formatFileSize(inspectedItem.result.savedBytes)} (-{inspectedItem.result.reductionPercent}%)</span>
                    </div>
                    <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        style={{ width: `${inspectedItem.result.afterXRay.imagePercentage}%` }}
                        className="bg-blue-600"
                      />
                      <div
                        style={{ width: `${inspectedItem.result.afterXRay.contentPercentage}%` }}
                        className="bg-emerald-500"
                      />
                      <div
                        style={{ width: `${inspectedItem.result.afterXRay.metadataPercentage}%` }}
                        className="bg-amber-500"
                      />
                      <div
                        style={{ width: `${inspectedItem.result.afterXRay.structurePercentage}%` }}
                        className="bg-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-600 dark:text-slate-400 sm:grid-cols-4">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                      <span>Images ({inspectedItem.result.afterXRay.imagePercentage}%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <span>Text/Fonts ({inspectedItem.result.afterXRay.contentPercentage}%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                      <span>Metadata ({inspectedItem.result.afterXRay.metadataPercentage}%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                      <span>XRef ({inspectedItem.result.afterXRay.structurePercentage}%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Before / After Page 1 Visual Quality Inspector */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Before vs. After Page 1 Readability Preview
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Verify text sharpness and visual fidelity at {inspectedItem.result.appliedDpi} DPI before downloading.
                </p>

                {inspectedItem.result.previewBeforeDataUrl && inspectedItem.result.previewAfterDataUrl ? (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-950">
                      <div className="mb-1 text-center text-[10px] font-bold text-slate-600 dark:text-slate-400">
                        ORIGINAL ({formatFileSize(inspectedItem.result.originalBytes)})
                      </div>
                      <img
                        src={inspectedItem.result.previewBeforeDataUrl}
                        alt="Original PDF Page 1"
                        className="mx-auto max-h-44 rounded border border-slate-200 object-contain dark:border-slate-800"
                      />
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-2 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                      <div className="mb-1 text-center text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                        COMPRESSED ({formatFileSize(inspectedItem.result.compressedBytes)})
                      </div>
                      <img
                        src={inspectedItem.result.previewAfterDataUrl}
                        alt="Compressed PDF Page 1"
                        className="mx-auto max-h-44 rounded border border-emerald-200 object-contain dark:border-emerald-800"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950">
                    Vector PDF stream optimized losslessly ({inspectedItem.result.pageCount} pages preserved at 100% original resolution).
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
