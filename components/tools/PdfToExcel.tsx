'use client';

import React, { useState, useRef, useId } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Sparkles,
  Copy,
  Check,
  Table,
  Layers,
  Columns,
} from 'lucide-react';
import {
  convertPdfToExcel,
  type PdfExcelSheetMode,
  type PdfToExcelResult,
} from '@/lib/pdfToExcelEngine';

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function PdfToExcel() {
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sheetMode, setSheetMode] = useState<PdfExcelSheetMode>('merged_single_sheet');
  const [pageRange, setPageRange] = useState<string>('');
  const [sanitizeFormulas, setSanitizeFormulas] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PdfToExcelResult | null>(null);
  const [activeSheetIdx, setActiveSheetIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

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
    try {
      const ab = await selectedFile.arrayBuffer();
      const res = await convertPdfToExcel(new Uint8Array(ab), selectedFile.name, {
        sheetMode,
        pageRange: pageRange.trim() || 'all',
        sanitizeFormulas,
      });
      setResult(res);
      setActiveSheetIdx(0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to extract spreadsheet tables from the PDF.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (format: 'xlsx' | 'csv' | 'json') => {
    if (!result) return;
    const baseName = result.fileName.replace(/\.xlsx$/i, '');
    let blob: Blob;
    let ext: string;

    if (format === 'xlsx') {
      blob = result.xlsxBlob;
      ext = 'xlsx';
    } else if (format === 'csv') {
      blob = new Blob([result.csvText], { type: 'text/csv;charset=utf-8;' });
      ext = 'csv';
    } else {
      blob = new Blob([result.jsonText], { type: 'application/json;charset=utf-8;' });
      ext = 'json';
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCsv = () => {
    if (!result) return;
    navigator.clipboard?.writeText(result.csvText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const previewRows = result?.sheets[activeSheetIdx]?.rows || [];

  return (
    <div className="w-full space-y-6">
      {/* Privacy Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-xs text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>100% Client-Side PDF Bank Statement &amp; Table Extractor • Zero Server Uploads</span>
        </div>
        <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-slate-900 dark:text-emerald-300">
          CWE-1236 Safe XLSX/CSV
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
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400">
          <UploadCloud className="h-7 w-7" />
        </div>
        <p className="text-base font-bold text-slate-900 dark:text-white">
          {selectedFile ? selectedFile.name : 'Click or Drag & Drop your PDF Statement / Invoice / Table here'}
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {selectedFile
            ? `Size: ${formatBytes(selectedFile.size)} • Ready for X/Y spatial grid extraction`
            : 'Extracts structured rows & columns into native Excel (.xlsx), CSV, and JSON 100% locally'}
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 sm:grid-cols-3 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="space-y-1.5">
          <label htmlFor={`${formId}-sheet`} className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Excel Worksheet Layout
          </label>
          <select
            id={`${formId}-sheet`}
            value={sheetMode}
            onChange={(e) => setSheetMode(e.target.value as PdfExcelSheetMode)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="merged_single_sheet">Combine All Pages into 1 Continuous Sheet</option>
            <option value="sheet_per_page">Separate Worksheet Tab per PDF Page (Page_1, Page_2...)</option>
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
            placeholder="All pages (or e.g. 1-3, 5)"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="flex flex-col justify-between gap-2">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={sanitizeFormulas}
              onChange={(e) => setSanitizeFormulas(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>CWE-1236 Formula Injection Protection</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!selectedFile || isProcessing}
              onClick={handleConvert}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Extracting Tables...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Convert PDF to Excel (.xlsx)</span>
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
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Results & Live Grid Preview */}
      {result && (
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50/60 p-6 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {result.fileName} Extracted Successfully
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {result.pageCount} Pages • {result.totalRows.toLocaleString()} Rows • {result.maxColumns} Columns Detected
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownload('xlsx')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700"
              >
                <Download className="h-4 w-4" />
                <span>Download Excel (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownload('csv')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Download CSV (.csv)</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownload('json')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <span>Export JSON</span>
              </button>
              <button
                type="button"
                onClick={handleCopyCsv}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied CSV!' : 'Copy CSV'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                <Layers className="h-3.5 w-3.5 text-blue-500" /> Pages Scanned
              </span>
              <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                {result.pageCount}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                <Table className="h-3.5 w-3.5 text-emerald-500" /> Total Extracted Rows
              </span>
              <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                {result.totalRows.toLocaleString()}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                <Columns className="h-3.5 w-3.5 text-purple-500" /> Detected Columns
              </span>
              <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                {result.maxColumns}
              </div>
            </div>
          </div>

          {/* Page Tabs & Grid Preview */}
          {result.sheets.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {result.sheets.map((sh, idx) => (
                <button
                  key={sh.sheetName}
                  type="button"
                  onClick={() => setActiveSheetIdx(idx)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    activeSheetIdx === idx
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  {sh.sheetName} ({sh.rows.length} rows)
                </button>
              ))}
            </div>
          )}

          <div className="max-h-96 overflow-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <table className="min-w-[580px] w-full border-collapse text-left text-xs">
              <thead className="sticky top-0 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                <tr>
                  <th className="border-b border-r border-slate-200 px-2.5 py-2 text-center font-mono text-[10px] text-slate-400 dark:border-slate-700">
                    #
                  </th>
                  {(previewRows[0] || []).map((_, cIdx) => (
                    <th key={cIdx} className="border-b border-r border-slate-200 px-3 py-2 font-bold dark:border-slate-700">
                      Col {cIdx + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800 dark:text-slate-300">
                {previewRows.slice(0, 100).map((row, rIdx) => (
                  <tr key={rIdx} className={rIdx === 0 ? 'bg-blue-50/40 font-semibold dark:bg-blue-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'}>
                    <td className="border-r border-slate-200 px-2.5 py-1.5 text-center font-mono text-[10px] text-slate-400 dark:border-slate-800">
                      {rIdx + 1}
                    </td>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="border-r border-slate-100 px-3 py-1.5 tabular-nums dark:border-slate-800/80">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
