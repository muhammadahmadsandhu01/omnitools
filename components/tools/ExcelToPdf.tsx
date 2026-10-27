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
  Layers,
  Table,
} from 'lucide-react';
import {
  parseSpreadsheetFile,
  convertSpreadsheetSheetsToPdf,
  type ExcelPdfPageSize,
  type ExcelPdfOrientation,
  type ParsedSpreadsheetSheet,
  type ExcelToPdfResult,
} from '@/lib/excelToPdfEngine';

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ExcelToPdf() {
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedSheets, setParsedSheets] = useState<ParsedSpreadsheetSheet[]>([]);
  const [selectedSheetNames, setSelectedSheetNames] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState<ExcelPdfPageSize>('a4');
  const [orientation, setOrientation] = useState<ExcelPdfOrientation>('auto');
  const [repeatHeaderRow, setRepeatHeaderRow] = useState<boolean>(true);
  const [zebraStriping, setZebraStriping] = useState<boolean>(true);
  const [showGridlines, setShowGridlines] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExcelToPdfResult | null>(null);
  const [previewSheetIdx, setPreviewSheetIdx] = useState<number>(0);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setResult(null);
    if (!/\.(xlsx|xls|csv|tsv)$/i.test(file.name)) {
      setError('Please upload a valid Excel (.xlsx, .xls), CSV (.csv), or TSV (.tsv) file.');
      return;
    }
    try {
      const ab = await file.arrayBuffer();
      const sheets = parseSpreadsheetFile(new Uint8Array(ab), file.name);
      setSelectedFile(file);
      setParsedSheets(sheets);
      setSelectedSheetNames(sheets.map((s) => s.name));
      setPreviewSheetIdx(0);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to parse spreadsheet workbook.'
      );
    }
  };

  const toggleSheetSelection = (name: string) => {
    setSelectedSheetNames((prev) =>
      prev.includes(name)
        ? prev.length > 1
          ? prev.filter((n) => n !== name)
          : prev
        : [...prev, name]
    );
  };

  const handleConvert = async () => {
    if (parsedSheets.length === 0 || !selectedFile) return;
    setIsProcessing(true);
    setError(null);
    try {
      const res = await convertSpreadsheetSheetsToPdf(parsedSheets, selectedFile.name, {
        selectedSheetNames,
        pageSize,
        orientation,
        repeatHeaderRow,
        zebraStriping,
        showGridlines,
      });
      setResult(res);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate PDF from spreadsheet.'
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

  const activePreviewSheet = parsedSheets[previewSheetIdx];

  return (
    <div className="w-full space-y-6">
      {/* Privacy Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-xs text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>100% Client-Side Excel (.xlsx / .csv) to Vector PDF Engine • Zero Server Uploads</span>
        </div>
        <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-slate-900 dark:text-emerald-300">
          Auto-Fit Column Pagination
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
          accept=".xlsx,.xls,.csv,.tsv"
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
          {selectedFile ? selectedFile.name : 'Click or Drag & Drop Excel (.xlsx, .xls) or CSV (.csv) here'}
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {selectedFile
            ? `${parsedSheets.length} Worksheet(s) Loaded • Size: ${formatBytes(selectedFile.size)}`
            : 'Supports multi-sheet Excel workbooks & CSVs • Auto-fits columns onto A4 / Letter pages'}
        </p>
      </div>

      {/* Sheet Selector & Layout Controls */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
        {parsedSheets.length > 0 && (
          <div className="space-y-2 border-b border-slate-200 pb-4 dark:border-slate-800">
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Select Worksheets to Include in PDF ({selectedSheetNames.length} of {parsedSheets.length} selected)
            </span>
            <div className="flex flex-wrap gap-2">
              {parsedSheets.map((s) => {
                const checked = selectedSheetNames.includes(s.name);
                return (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => toggleSheetSelection(s.name)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                      checked
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {s.name} ({s.rowCount}×{s.columnCount})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor={`${formId}-size`} className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Paper Size
            </label>
            <select
              id={`${formId}-size`}
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value as ExcelPdfPageSize)}
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
              onChange={(e) => setOrientation(e.target.value as ExcelPdfOrientation)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="auto">Auto-Detect (Landscape for 6+ Columns)</option>
              <option value="landscape">Landscape (Wide Tables)</option>
              <option value="portrait">Portrait (Vertical)</option>
            </select>
          </div>

          <div className="flex flex-col justify-between gap-2">
            <div className="flex flex-wrap gap-3 pt-1">
              <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={repeatHeaderRow}
                  onChange={(e) => setRepeatHeaderRow(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600"
                />
                <span>Repeat Header</span>
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={zebraStriping}
                  onChange={(e) => setZebraStriping(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600"
                />
                <span>Zebra Stripes</span>
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGridlines}
                  onChange={(e) => setShowGridlines(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600"
                />
                <span>Gridlines</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={parsedSheets.length === 0 || isProcessing}
                onClick={handleConvert}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Rendering PDF...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Convert Excel to PDF</span>
                  </>
                )}
              </button>
              {selectedFile && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setParsedSheets([]);
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
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Results & Live Sheet Preview */}
      {result && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-emerald-200 bg-emerald-50/60 p-6 dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {result.fileName} ({formatBytes(result.pdfBytes.byteLength)})
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {result.pageCount} PDF Pages • {result.sheetCount} Worksheets • {result.totalRowsRendered.toLocaleString()} Rows Paginated
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF ({result.fileName})</span>
          </button>
        </div>
      )}

      {activePreviewSheet && (
        <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Table className="h-4 w-4 text-blue-600" />
              <span>Live Worksheet Preview: {activePreviewSheet.name}</span>
            </h3>
            {parsedSheets.length > 1 && (
              <div className="flex flex-wrap gap-1.5">
                {parsedSheets.map((s, idx) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setPreviewSheetIdx(idx)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      previewSheetIdx === idx
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="max-h-80 overflow-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <table className="min-w-[580px] w-full border-collapse text-left text-xs">
              <tbody>
                {activePreviewSheet.rows.slice(0, 60).map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className={
                      rIdx === 0
                        ? 'bg-slate-800 font-bold text-white'
                        : rIdx % 2 === 1
                        ? 'bg-slate-50 dark:bg-slate-900/50'
                        : ''
                    }
                  >
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="border border-slate-200 px-3 py-1.5 dark:border-slate-800">
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
