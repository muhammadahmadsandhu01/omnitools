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
  Copy,
  Check,
  Layers,
  Table,
  Heading,
} from 'lucide-react';
import {
  convertPdfToWord,
  type PdfToWordMode,
  type PdfToWordResult,
} from '@/lib/pdfToWordEngine';

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function PdfToWord() {
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<PdfToWordMode>('editable_flow');
  const [pageRange, setPageRange] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PdfToWordResult | null>(null);
  const [previewTab, setPreviewTab] = useState<'blocks' | 'markdown' | 'text'>('blocks');
  const [copied, setCopied] = useState<boolean>(false);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setResult(null);
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setError('Please select a valid PDF document (.pdf).');
      return;
    }
    if (file.size > 250 * 1024 * 1024) {
      setError('File exceeds the 250 MB maximum client-side size limit.');
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
      const bytes = new Uint8Array(ab);
      const res = await convertPdfToWord(bytes, selectedFile.name, {
        mode,
        pageRange: pageRange.trim() || 'all',
      });
      setResult(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to reconstruct Word document from the provided PDF.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (format: 'docx' | 'md' | 'txt') => {
    if (!result) return;
    const baseName = result.fileName.replace(/\.docx$/i, '');
    let blob: Blob;
    let ext: string;

    if (format === 'docx') {
      blob = result.docxBlob;
      ext = 'docx';
    } else if (format === 'md') {
      blob = new Blob([result.markdownText], { type: 'text/markdown;charset=utf-8' });
      ext = 'md';
    } else {
      blob = new Blob([result.plainText], { type: 'text/plain;charset=utf-8' });
      ext = 'txt';
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyText = () => {
    if (!result) return;
    const textToCopy = previewTab === 'markdown' ? result.markdownText : result.plainText;
    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Privacy Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-xs text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>100% Client-Side PDF to Word (.docx) Reconstruction • Zero Server Uploads</span>
        </div>
        <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-slate-900 dark:text-emerald-300">
          ECMA-376 OpenXML Engine
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
        className="cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-8 text-center transition hover:border-blue-500 hover:bg-blue-50/30 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-blue-500"
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
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400">
          <UploadCloud className="h-7 w-7" />
        </div>
        <p className="text-base font-bold text-slate-900 dark:text-white">
          {selectedFile ? selectedFile.name : 'Click or Drag & Drop your PDF file here'}
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {selectedFile
            ? `Size: ${formatBytes(selectedFile.size)} • Ready for instant local .docx conversion`
            : 'Supports PDF documents up to 250 MB • Extracts headings, paragraphs, bullet lists & tables'}
        </p>
      </div>

      {/* Configuration Controls */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 sm:grid-cols-3 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="space-y-1.5">
          <label htmlFor={`${formId}-mode`} className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Document Reconstruction Mode
          </label>
          <select
            id={`${formId}-mode`}
            value={mode}
            onChange={(e) => setMode(e.target.value as PdfToWordMode)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="editable_flow">Editable Paragraph &amp; Table Flow (Recommended)</option>
            <option value="exact_page_breaks">Strict Line-by-Line &amp; Page Break Preservation</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${formId}-range`} className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Page Range Filter (Optional)
          </label>
          <input
            id={`${formId}-range`}
            type="text"
            value={pageRange}
            onChange={(e) => setPageRange(e.target.value)}
            placeholder="All pages (or e.g. 1-5, 8)"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            type="button"
            disabled={!selectedFile || isProcessing}
            onClick={handleConvert}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Reconstructing .DOCX...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Convert PDF to Word (.docx)</span>
              </>
            )}
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

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Results & Interactive Preview Studio */}
      {result && (
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50/60 p-6 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {result.fileName} Ready for Download
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {result.pageCount} Pages • {result.wordCount.toLocaleString()} Words • {result.headingCount} Headings • {result.tableCount} Tables Reconstructed
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownload('docx')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                <span>Download Word (.docx)</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownload('md')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Export Markdown (.md)</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownload('txt')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Export Text (.txt)</span>
              </button>
            </div>
          </div>

          {/* Telemetry Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                <Layers className="h-3.5 w-3.5 text-blue-500" /> Pages Processed
              </span>
              <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                {result.pageCount}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                <FileText className="h-3.5 w-3.5 text-emerald-500" /> Total Words
              </span>
              <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                {result.wordCount.toLocaleString()}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                <Heading className="h-3.5 w-3.5 text-purple-500" /> Detected Headings
              </span>
              <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                {result.headingCount}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                <Table className="h-3.5 w-3.5 text-amber-500" /> Reconstructed Tables
              </span>
              <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                {result.tableCount}
              </div>
            </div>
          </div>

          {/* Interactive Document Preview Tabs */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800">
                {(['blocks', 'markdown', 'text'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setPreviewTab(tab)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition ${
                      previewTab === tab
                        ? 'bg-white text-blue-600 shadow-2xs dark:bg-slate-900 dark:text-blue-400'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                    }`}
                  >
                    {tab === 'blocks' ? 'Structured Document Preview' : tab}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCopyText}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Content'}</span>
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-xs leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
              {previewTab === 'blocks' ? (
                <div className="space-y-3">
                  {result.blocks.slice(0, 80).map((b, idx) => {
                    if (b.type === 'page_break') {
                      return (
                        <div key={idx} className="my-4 border-t border-dashed border-slate-300 pt-1 text-center text-[10px] font-bold uppercase text-slate-400 dark:border-slate-700">
                          — End of Page {b.pageNumber} —
                        </div>
                      );
                    }
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
              ) : (
                <pre className="whitespace-pre-wrap font-mono text-xs">
                  {previewTab === 'markdown' ? result.markdownText : result.plainText}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
