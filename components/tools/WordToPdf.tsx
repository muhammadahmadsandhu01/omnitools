'use client';

import React, { useState, useRef, useId } from 'react';
import {
  UploadCloud,
  FileText,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Sparkles,
  Layers,
  Table,
  AlignLeft,
} from 'lucide-react';
import {
  convertWordFilesToPdf,
  type WordPdfPageSize,
  type WordPdfMargin,
  type WordToPdfResult,
} from '@/lib/wordToPdfEngine';

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function WordToPdf() {
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState<WordPdfPageSize>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<WordPdfMargin>('normal');
  const [includePageNumbers, setIncludePageNumbers] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WordToPdfResult | null>(null);

  const handleFilesSelected = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    setError(null);
    setResult(null);
    const valid: File[] = [];
    for (let i = 0; i < incoming.length; i++) {
      const f = incoming[i];
      if (!/\.(docx|txt|md)$/i.test(f.name)) {
        setError(`Unsupported file "${f.name}". Please upload .docx, .txt, or .md files.`);
        return;
      }
      valid.push(f);
    }
    setFiles((prev) => [...prev, ...valid].slice(0, 25));
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setError(null);
    try {
      const filePayloads: { name: string; bytes: Uint8Array }[] = [];
      for (const f of files) {
        const ab = await f.arrayBuffer();
        filePayloads.push({ name: f.name, bytes: new Uint8Array(ab) });
      }
      const res = await convertWordFilesToPdf(filePayloads, {
        pageSize,
        orientation,
        margin,
        includePageNumbers,
      });
      setResult(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to convert Word (.docx) document to PDF.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.pdfBlob);
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
          <span>100% Client-Side Word (.docx) to PDF Engine • Zero Server Uploads</span>
        </div>
        <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-slate-900 dark:text-emerald-300">
          OpenXML + Vector PDF
        </span>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFilesSelected(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-8 text-center transition hover:border-blue-500 hover:bg-blue-50/30 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-blue-500"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".docx,.txt,.md,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400">
          <UploadCloud className="h-7 w-7" />
        </div>
        <p className="text-base font-bold text-slate-900 dark:text-white">
          {files.length > 0
            ? `${files.length} Document${files.length > 1 ? 's' : ''} Queued (${files.map((f) => f.name).join(', ')})`
            : 'Click or Drag & Drop Word (.docx), Markdown (.md), or Text (.txt) files'}
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Batch-convert or combine up to 25 Word documents into a print-ready A4 / Letter PDF locally
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="space-y-1.5">
          <label htmlFor={`${formId}-size`} className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Paper Size
          </label>
          <select
            id={`${formId}-size`}
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value as WordPdfPageSize)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="a4">A4 (210 × 297 mm)</option>
            <option value="letter">US Letter (8.5 × 11 in)</option>
            <option value="legal">US Legal (8.5 × 14 in)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${formId}-orient`} className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Page Orientation
          </label>
          <select
            id={`${formId}-orient`}
            value={orientation}
            onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="portrait">Portrait (Vertical)</option>
            <option value="landscape">Landscape (Horizontal)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${formId}-margin`} className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Page Margins
          </label>
          <select
            id={`${formId}-margin`}
            value={margin}
            onChange={(e) => setMargin(e.target.value as WordPdfMargin)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="normal">Standard (0.75 in / 54 pt)</option>
            <option value="narrow">Narrow (0.50 in / 36 pt)</option>
            <option value="wide">Wide (1.00 in / 72 pt)</option>
          </select>
        </div>

        <div className="flex flex-col justify-between gap-2">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={includePageNumbers}
              onChange={(e) => setIncludePageNumbers(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Footer Page Numbers (Page X of Y)</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={files.length === 0 || isProcessing}
              onClick={handleConvert}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Building PDF...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Convert to PDF</span>
                </>
              )}
            </button>
            {files.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setFiles([]);
                  setResult(null);
                  setError(null);
                }}
                aria-label="Clear files"
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

      {result && (
        <div className="space-y-5 rounded-3xl border border-slate-200 bg-slate-50/60 p-6 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {result.fileName} ({formatBytes(result.pdfBytes.byteLength)})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {result.pageCount} PDF Pages • {result.wordCount.toLocaleString()} Words • {result.paragraphCount} Paragraphs • {result.tableCount} Tables
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF ({result.fileName})</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                <Layers className="h-3.5 w-3.5 text-blue-500" /> PDF Pages
              </span>
              <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                {result.pageCount}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                <FileText className="h-3.5 w-3.5 text-emerald-500" /> Words Parsed
              </span>
              <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                {result.wordCount.toLocaleString()}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                <AlignLeft className="h-3.5 w-3.5 text-purple-500" /> Paragraphs
              </span>
              <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                {result.paragraphCount}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                <Table className="h-3.5 w-3.5 text-amber-500" /> Tables Rendered
              </span>
              <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                {result.tableCount}
              </div>
            </div>
          </div>

          {/* Document Preview */}
          <div className="max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-xs leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 space-y-2.5">
            {result.blocks.slice(0, 60).map((b, idx) => {
              if (b.type === 'heading1') {
                return <h4 key={idx} className="text-base font-extrabold text-slate-900 dark:text-white">{b.text}</h4>;
              }
              if (b.type === 'heading2' || b.type === 'heading3') {
                return <h5 key={idx} className="text-sm font-bold text-slate-800 dark:text-slate-200">{b.text}</h5>;
              }
              if (b.type === 'bullet') {
                return <div key={idx} className="pl-4">• {b.text}</div>;
              }
              if (b.type === 'table' && b.rows) {
                return (
                  <div key={idx} className="overflow-x-auto my-2">
                    <table className="min-w-[580px] w-full border-collapse border border-slate-200 text-[11px] dark:border-slate-800">
                      <tbody>
                        {b.rows.map((r, rIdx) => (
                          <tr key={rIdx} className={rIdx === 0 ? 'bg-slate-100 font-bold dark:bg-slate-800' : ''}>
                            {r.map((c, cIdx) => (
                              <td key={cIdx} className="border border-slate-200 px-2 py-1 dark:border-slate-800">{c}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }
              return <p key={idx}>{b.text}</p>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
