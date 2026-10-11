/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  UploadCloud,
  FileImage,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCw,
  ShieldCheck,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Settings2,
  Eye,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Crop,
  Layers,
  FileArchive,
  Info,
  X,
  FileText,
} from 'lucide-react';
import {
  PageSizePreset,
  PageOrientation,
  MarginPreset,
  ImagePlacement,
  QualityPreset,
  OutputMode,
  CustomDimensions,
  ImageToPdfOptions,
  ImageQueueItem,
  ConversionProgress,
  ConversionResult,
  PAGE_SIZE_POINTS,
  QUALITY_CONFIG,
  calculatePageDimensions,
  createQueueItemFromFile,
  generateCombinedPdf,
  generateSeparatePdfsZip,
  sanitizePdfFilename,
} from '@/lib/imageToPdfEngine';

const MAX_FILES = 100;
const MAX_TOTAL_BYTES = 500 * 1024 * 1024; // 500 MB

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function ImageToPdf() {
  // Queue & Selection
  const [items, setItems] = useState<ImageQueueItem[]>([]);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Array<{ filename: string; reason: string }>>([]);

  // PDF Configuration
  const [pageSize, setPageSize] = useState<PageSizePreset>('a4');
  const [customDimensions, setCustomDimensions] = useState<CustomDimensions>({
    width: 210,
    height: 297,
    unit: 'mm',
  });
  const [orientation, setOrientation] = useState<PageOrientation>('auto');
  const [margin, setMargin] = useState<MarginPreset>('small');
  const [customMarginPt, setCustomMarginPt] = useState<number>(20);
  const [placement, setPlacement] = useState<ImagePlacement>('contain');
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [quality, setQuality] = useState<QualityPreset>('high');
  const [outputFilename, setOutputFilename] = useState<string>('images-to-pdf.pdf');
  const [outputMode, setOutputMode] = useState<OutputMode>('single');

  // Conversion Lifecycle
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<ConversionProgress | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>('');

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<ImageQueueItem[]>(items);
  const resultRef = useRef<ConversionResult | null>(result);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  const announce = useCallback((message: string) => {
    setAriaAnnouncement(message);
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (item.previewUrl) {
          try {
            URL.revokeObjectURL(item.previewUrl);
          } catch {
            // Ignore revocation errors
          }
        }
      });
      if (resultRef.current?.downloadUrl) {
        try {
          URL.revokeObjectURL(resultRef.current.downloadUrl);
        } catch {
          // Ignore
        }
      }
    };
  }, []);

  // Safe preview index derived directly without cascading effect
  const safePreviewIndex = items.length === 0 ? 0 : Math.min(selectedPreviewIndex, items.length - 1);

  // Total queue stats
  const validItems = useMemo(() => items.filter((i) => i.isValid), [items]);
  const totalSizeBytes = useMemo(() => items.reduce((acc, i) => acc + i.size, 0), [items]);

  // Handle incoming file list
  const processIncomingFiles = async (files: FileList | File[]) => {
    const rawFiles = Array.from(files);
    if (rawFiles.length === 0) return;

    if (items.length + rawFiles.length > MAX_FILES) {
      setError(`Maximum limit is ${MAX_FILES} images at a time. Please remove some files before adding more.`);
      return;
    }

    setIsValidating(true);
    setError(null);
    const newErrors: Array<{ filename: string; reason: string }> = [];

    // Deduplicate file names against existing items
    const existingNames = new Set(items.map((i) => i.name));
    const processedNewItems: ImageQueueItem[] = [];

    for (const file of rawFiles) {
      let displayName = file.name;
      let counter = 1;
      const base = file.name.replace(/\.[^/.]+$/, '');
      const ext = file.name.includes('.') ? `.${file.name.split('.').pop()}` : '';

      while (existingNames.has(displayName)) {
        displayName = `${base} (${counter})${ext}`;
        counter++;
      }
      existingNames.add(displayName);

      const queueItem = await createQueueItemFromFile(file, displayName);

      if (!queueItem.isValid) {
        newErrors.push({
          filename: file.name,
          reason: queueItem.errorMessage || 'Failed to decode image data.',
        });
      }

      processedNewItems.push(queueItem);
    }

    setItems((prev) => [...prev, ...processedNewItems]);
    if (newErrors.length > 0) {
      setValidationErrors((prev) => [...prev, ...newErrors]);
    }

    const addedValidCount = processedNewItems.filter((i) => i.isValid).length;
    announce(`Added ${processedNewItems.length} image${processedNewItems.length === 1 ? '' : 's'}. ${addedValidCount} ready for conversion.`);
    setIsValidating(false);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processIncomingFiles(e.dataTransfer.files);
    }
  };

  // Queue item manipulation
  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.previewUrl) {
        try {
          URL.revokeObjectURL(target.previewUrl);
        } catch {
          // Ignore
        }
      }
      const updated = prev.filter((i) => i.id !== id);
      announce(`Removed image. ${updated.length} remaining.`);
      return updated;
    });
  };

  const clearAll = () => {
    if (items.length === 0) return;
    items.forEach((item) => {
      if (item.previewUrl) {
        try {
          URL.revokeObjectURL(item.previewUrl);
        } catch {
          // Ignore
        }
      }
    });
    setItems([]);
    setValidationErrors([]);
    setResult(null);
    setError(null);
    setSelectedPreviewIndex(0);
    announce('Cleared all images.');
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (isProcessing) return;
    setItems((prev) => {
      if (direction === 'up' && index > 0) {
        const next = [...prev];
        const temp = next[index - 1];
        next[index - 1] = next[index];
        next[index] = temp;
        announce(`Moved ${next[index - 1].name} to page ${index}.`);
        if (selectedPreviewIndex === index) setSelectedPreviewIndex(index - 1);
        else if (selectedPreviewIndex === index - 1) setSelectedPreviewIndex(index);
        return next;
      }
      if (direction === 'down' && index < prev.length - 1) {
        const next = [...prev];
        const temp = next[index + 1];
        next[index + 1] = next[index];
        next[index] = temp;
        announce(`Moved ${next[index + 1].name} to page ${index + 2}.`);
        if (selectedPreviewIndex === index) setSelectedPreviewIndex(index + 1);
        else if (selectedPreviewIndex === index + 1) setSelectedPreviewIndex(index);
        return next;
      }
      return prev;
    });
  };

  const rotateItem = (index: number, delta: number) => {
    setItems((prev) => {
      const next = [...prev];
      const item = next[index];
      const newRotation = (((item.rotation + delta) % 360) + 360) % 360;
      next[index] = { ...item, rotation: newRotation };
      announce(`Rotated ${item.name} to ${newRotation} degrees.`);
      return next;
    });
  };

  // Trigger Conversion
  const handleConvert = async () => {
    if (validItems.length === 0) {
      setError('Please select at least one valid image to convert.');
      return;
    }

    if (totalSizeBytes > MAX_TOTAL_BYTES) {
      setError(`Total image size exceeds ${formatBytes(MAX_TOTAL_BYTES)}. Please reduce file batch size.`);
      return;
    }

    setIsProcessing(true);
    setError(null);
    if (result?.downloadUrl) {
      try {
        URL.revokeObjectURL(result.downloadUrl);
      } catch {
        // Ignore
      }
    }
    setResult(null);

    const conversionOptions: ImageToPdfOptions = {
      pageSize,
      customDimensions: pageSize === 'custom' ? customDimensions : undefined,
      orientation,
      margin,
      customMarginPt: margin === 'custom' ? customMarginPt : undefined,
      placement,
      backgroundColor,
      quality,
      outputFilename: sanitizePdfFilename(outputFilename),
      outputMode,
    };

    try {
      let conversionResult: ConversionResult;

      if (outputMode === 'separate') {
        conversionResult = await generateSeparatePdfsZip(validItems, conversionOptions, (p) => {
          setProgress(p);
        });
      } else {
        conversionResult = await generateCombinedPdf(validItems, conversionOptions, (p) => {
          setProgress(p);
        });
      }

      setResult(conversionResult);
      announce(`Conversion complete! Output ready: ${conversionResult.filename} (${formatBytes(conversionResult.byteSize)}).`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'PDF conversion failed unexpectedly.';
      setError(message);
      announce(`Conversion error: ${message}`);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  // Preview Calculations for active item
  const activeItem = items[safePreviewIndex] || null;

  const previewDimensions = useMemo(() => {
    if (!activeItem || !activeItem.isValid) {
      return { width: 595.28, height: 841.89 };
    }
    const isRotated90 = activeItem.rotation === 90 || activeItem.rotation === 270;
    const w = isRotated90 ? activeItem.height : activeItem.width;
    const h = isRotated90 ? activeItem.width : activeItem.height;
    return calculatePageDimensions(pageSize, orientation, w, h, customDimensions);
  }, [activeItem, pageSize, orientation, customDimensions]);

  // Aspect ratio for the simulated preview container
  const previewAspectRatio = previewDimensions.width / previewDimensions.height;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Hidden screen-reader announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {ariaAnnouncement}
      </div>

      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Image to PDF Converter
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Convert JPG, PNG, WebP, BMP, and GIF images into professional PDF documents.
          </p>
        </div>

        {/* VERIFIED LOCAL PRIVACY BADGE */}
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>Local processing: 100% browser-side. Images never leave your device.</span>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div
          role="alert"
          className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-2xl flex items-start gap-3 text-sm shadow-sm"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
          <div className="flex-1">
            <p className="font-semibold">Conversion Error</p>
            <p className="mt-0.5 text-xs sm:text-sm">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 dark:hover:text-red-300 p-1 rounded-lg"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* REJECTED / INVALID FILES BANNER */}
      {validationErrors.length > 0 && (
        <div
          role="alert"
          className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 p-4 rounded-2xl text-sm space-y-2 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{validationErrors.length} file{validationErrors.length === 1 ? '' : 's'} could not be imported</span>
            </div>
            <button
              type="button"
              onClick={() => setValidationErrors([])}
              className="text-amber-700 dark:text-amber-400 hover:underline text-xs"
            >
              Dismiss
            </button>
          </div>
          <ul className="text-xs list-disc pl-5 space-y-1 text-amber-700 dark:text-amber-400">
            {validationErrors.map((err, idx) => (
              <li key={idx}>
                <strong>{err.filename}:</strong> {err.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* SUCCESS RESULT CARD */}
      {result && (
        <div
          id="resultCard"
          role="status"
          className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 dark:from-emerald-950/40 dark:to-blue-950/40 border border-emerald-300 dark:border-emerald-700/60 rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="inline-block text-xs uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                Conversion Successful
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white break-all">
                {result.filename}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2">
                <span>{formatBytes(result.byteSize)}</span>
                <span>•</span>
                <span>{result.pageCount} {result.isZip ? 'PDF files' : 'pages'}</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Verified PDF Binary</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <a
              id="downloadButton"
              href={result.downloadUrl}
              download={result.filename}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Download className="w-5 h-5" />
              <span>Download {result.isZip ? 'ZIP Archive' : 'PDF Document'}</span>
            </a>
            <button
              id="closeResultButton"
              type="button"
              onClick={() => {
                if (result?.downloadUrl) {
                  try {
                    URL.revokeObjectURL(result.downloadUrl);
                  } catch {
                    // Ignore
                  }
                }
                setResult(null);
              }}
              className="p-3.5 rounded-2xl border border-gray-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              title="Close result and continue editing"
              aria-label="Close result banner"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* MAIN STUDIO WORKSPACE */}
      {items.length === 0 ? (
        /* EMPTY STATE / DROPZONE */
        <div
          tabIndex={0}
          role="button"
          aria-label="Drop images here or press Enter to browse files"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`h-80 sm:h-96 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl cursor-pointer transition-all p-8 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            isDragging
              ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/30 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-sm">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Drag & Drop Images Here
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
            or <span className="text-blue-600 dark:text-blue-400 font-semibold underline decoration-2 underline-offset-2">browse files</span> from your computer or phone
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-6 max-w-xl">
            {['JPG / JPEG', 'PNG', 'WebP', 'BMP', 'GIF', 'SVG', 'HEIC'].map((fmt) => (
              <span
                key={fmt}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                {fmt}
              </span>
            ))}
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
            Supports multiple selection · Up to {MAX_FILES} images · Up to {formatBytes(MAX_TOTAL_BYTES)} batch
          </p>

          <input
            id="fileInput"
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp,.bmp,.gif,.svg,.heic,.heif,image/*"
            onChange={(e) => {
              if (e.target.files) processIncomingFiles(e.target.files);
              e.target.value = '';
            }}
            className="hidden"
            aria-hidden="true"
          />
        </div>
      ) : (
        /* POPULATED WORKSPACE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: QUEUE & ACTIONS (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* QUEUE TOOLBAR */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileImage className="w-5 h-5 text-blue-600" />
                  <span>Images in PDF Queue ({items.length})</span>
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatBytes(totalSizeBytes)} total • {validItems.length} valid page{validItems.length === 1 ? '' : 's'}
                  </p>
                  {isValidating && (
                    <span className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Reading...</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="addMoreButton"
                  type="button"
                  onClick={() => addMoreInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add More</span>
                </button>
                <input
                  id="addMoreInput"
                  ref={addMoreInputRef}
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp,.bmp,.gif,.svg,.heic,.heif,image/*"
                  onChange={(e) => {
                    if (e.target.files) processIncomingFiles(e.target.files);
                    e.target.value = '';
                  }}
                  className="hidden"
                  aria-hidden="true"
                />

                <button
                  id="clearAllButton"
                  type="button"
                  onClick={clearAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-transparent hover:border-red-200 dark:hover:border-red-900 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>
            </div>

            {/* QUEUE CARDS LIST */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {items.map((item, index) => {
                const isSelected = safePreviewIndex === index;
                const isRotated = item.rotation !== 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPreviewIndex(index)}
                    className={`group relative flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-400 dark:border-blue-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* PAGE NUMBER BADGE */}
                    <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>

                    {/* THUMBNAIL */}
                    <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0 relative">
                      {item.isValid && item.previewUrl ? (
                        <img
                          src={item.previewUrl}
                          alt={item.name}
                          style={{
                            transform: `rotate(${item.rotation}deg)`,
                            transition: 'transform 0.2s ease',
                          }}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-red-500" />
                      )}
                    </div>

                    {/* DETAILS */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {item.name}
                        </p>
                        {isRotated && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-mono">
                            {item.rotation}°
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.isValid ? (
                          <>
                            {formatBytes(item.size)} • {item.width}×{item.height}px
                          </>
                        ) : (
                          <span className="text-red-500 font-medium">{item.errorMessage || 'Invalid image'}</span>
                        )}
                      </p>
                    </div>

                    {/* ACTIONS */}
                    <div
                      className="flex items-center gap-1 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* REORDER UP */}
                      <button
                        type="button"
                        disabled={index === 0 || isProcessing}
                        onClick={() => moveItem(index, 'up')}
                        title="Move Page Up"
                        className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label={`Move ${item.name} up`}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      {/* REORDER DOWN */}
                      <button
                        type="button"
                        disabled={index === items.length - 1 || isProcessing}
                        onClick={() => moveItem(index, 'down')}
                        title="Move Page Down"
                        className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label={`Move ${item.name} down`}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      {/* ROTATE CW */}
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => rotateItem(index, 90)}
                        title="Rotate 90° Clockwise"
                        className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label={`Rotate ${item.name} clockwise`}
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>

                      {/* REMOVE */}
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => removeItem(item.id)}
                        title="Remove from Queue"
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: SETTINGS & LIVE PREVIEW (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* LIVE PREVIEW PANEL */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>Document Page Preview</span>
                </h3>

                {items.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <button
                      type="button"
                      disabled={safePreviewIndex === 0}
                      onClick={() => setSelectedPreviewIndex((i) => Math.max(0, i - 1))}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                      aria-label="Previous page preview"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-semibold">
                      {safePreviewIndex + 1} / {items.length}
                    </span>
                    <button
                      type="button"
                      disabled={safePreviewIndex === items.length - 1}
                      onClick={() => setSelectedPreviewIndex((i) => Math.min(items.length - 1, i + 1))}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                      aria-label="Next page preview"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* SIMULATED SHEET */}
              <div className="w-full flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[260px]">
                {activeItem && activeItem.isValid ? (
                  <div
                    style={{
                      aspectRatio: `${previewAspectRatio}`,
                      maxHeight: '230px',
                      backgroundColor: backgroundColor || '#ffffff',
                    }}
                    className="relative w-full max-w-[200px] shadow-lg rounded-sm border border-slate-300 dark:border-slate-700 overflow-hidden flex items-center justify-center transition-all"
                  >
                    {/* MARGIN BOUNDARY INDICATOR (SUBTLE DASHED BOX) */}
                    <div
                      style={{
                        padding: `${(margin === 'none' ? 0 : margin === 'small' ? 6 : margin === 'large' ? 12 : (customMarginPt / 40) * 12)}px`,
                      }}
                      className="w-full h-full flex items-center justify-center overflow-hidden"
                    >
                      <img
                        src={activeItem.previewUrl}
                        alt="Page preview"
                        style={{
                          transform: `rotate(${activeItem.rotation}deg)`,
                          objectFit: placement === 'cover' ? 'cover' : 'contain',
                        }}
                        className="w-full h-full transition-transform duration-200"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 text-slate-400 dark:text-slate-500 text-xs">
                    <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Select a valid image to preview layout</p>
                  </div>
                )}
              </div>

              {activeItem && (
                <div className="text-xs text-slate-500 dark:text-slate-400 text-center truncate">
                  Page {safePreviewIndex + 1}: <strong>{activeItem.name}</strong> ({activeItem.width}×{activeItem.height}px)
                </div>
              )}
            </div>

            {/* SETTINGS ACCORDION / CARD */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-blue-600" />
                  <span>PDF Document Settings</span>
                </h3>
              </div>

              {/* 1. PAGE SIZE */}
              <div className="space-y-1.5">
                <label htmlFor="pageSizeSelect" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Page Size</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {pageSize !== 'fit' && pageSize !== 'custom' ? PAGE_SIZE_POINTS[pageSize].name : ''}
                  </span>
                </label>
                <select
                  id="pageSizeSelect"
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as PageSizePreset)}
                  className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="a4">A4 (210 × 297 mm) — Standard</option>
                  <option value="letter">US Letter (8.5 × 11 in)</option>
                  <option value="fit">Fit to Image (Preserve Exact Image Dimensions)</option>
                  <option value="a3">A3 (297 × 420 mm)</option>
                  <option value="a5">A5 (148 × 210 mm)</option>
                  <option value="legal">US Legal (8.5 × 14 in)</option>
                  <option value="custom">Custom Dimensions...</option>
                </select>

                {pageSize === 'custom' && (
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div>
                      <span className="text-[10px] text-slate-500">Width</span>
                      <input
                        type="number"
                        min="10"
                        value={customDimensions.width}
                        onChange={(e) => setCustomDimensions({ ...customDimensions, width: Math.max(1, parseFloat(e.target.value) || 0) })}
                        className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Height</span>
                      <input
                        type="number"
                        min="10"
                        value={customDimensions.height}
                        onChange={(e) => setCustomDimensions({ ...customDimensions, height: Math.max(1, parseFloat(e.target.value) || 0) })}
                        className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Unit</span>
                      <select
                        value={customDimensions.unit}
                        onChange={(e) => setCustomDimensions({ ...customDimensions, unit: e.target.value as 'mm' | 'in' | 'pt' })}
                        className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-white"
                      >
                        <option value="mm">mm</option>
                        <option value="in">in</option>
                        <option value="pt">pt</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. ORIENTATION */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Orientation</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['auto', 'portrait', 'landscape'] as PageOrientation[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setOrientation(mode)}
                      className={`text-xs py-2 px-2 rounded-xl font-medium capitalize border transition-all text-center ${
                        orientation === mode
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. MARGIN */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Page Margins</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { key: 'none', label: 'None (0)' },
                    { key: 'small', label: 'Small (7mm)' },
                    { key: 'large', label: 'Large (14mm)' },
                    { key: 'custom', label: 'Custom' },
                  ].map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setMargin(m.key as MarginPreset)}
                      className={`text-xs py-2 px-1 rounded-xl font-medium border transition-all text-center ${
                        margin === m.key
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {margin === 'custom' && (
                  <div className="flex items-center gap-2 pt-1.5">
                    <span className="text-[11px] text-slate-500">Margin width (pt):</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={customMarginPt}
                      onChange={(e) => setCustomMarginPt(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-20 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* 4. PLACEMENT & CROPPING */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Image Placement</span>
                  {placement === 'cover' && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                      <Crop className="w-3 h-3" /> May crop edges
                    </span>
                  )}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'contain', label: 'Fit (No Crop)' },
                    { key: 'cover', label: 'Fill / Cover' },
                    { key: 'actual', label: 'Actual Size' },
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setPlacement(p.key as ImagePlacement)}
                      className={`text-xs py-2 px-2 rounded-xl font-medium border transition-all text-center ${
                        placement === p.key
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. QUALITY / COMPRESSION */}
              <div className="space-y-1.5">
                <label htmlFor="qualitySelect" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Image Quality & Compression</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {QUALITY_CONFIG[quality].label}
                  </span>
                </label>
                <select
                  id="qualitySelect"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as QualityPreset)}
                  className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="high">High Quality (92% JPEG) — Best Balance</option>
                  <option value="medium">Standard / Balanced (80% JPEG) — Smaller Size</option>
                  <option value="low">Compressed (60% JPEG) — Email & Sharing</option>
                  <option value="original">Original / Lossless (100% Quality)</option>
                </select>
              </div>

              {/* 6. BACKGROUND COLOR */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Page Background</span>
                <div className="flex items-center gap-2">
                  {[
                    { color: '#ffffff', label: 'White' },
                    { color: '#f8fafc', label: 'Off-White' },
                    { color: '#0f172a', label: 'Dark' },
                    { color: '#000000', label: 'Black' },
                  ].map((bg) => (
                    <button
                      key={bg.color}
                      type="button"
                      onClick={() => setBackgroundColor(bg.color)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-xl border flex items-center justify-center gap-1.5 ${
                        backgroundColor === bg.color
                          ? 'border-blue-500 ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600"
                        style={{ backgroundColor: bg.color }}
                      />
                      <span className="text-[11px] text-slate-700 dark:text-slate-300">{bg.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 7. OUTPUT OPTIONS */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="space-y-1">
                  <label htmlFor="filenameInput" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    PDF Filename
                  </label>
                  <input
                    id="filenameInput"
                    type="text"
                    value={outputFilename}
                    onChange={(e) => setOutputFilename(e.target.value)}
                    placeholder="images-to-pdf.pdf"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Output Mode</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="singleModeButton"
                      type="button"
                      onClick={() => setOutputMode('single')}
                      className={`text-xs py-2 px-2 rounded-xl font-medium border flex items-center justify-center gap-1.5 ${
                        outputMode === 'single'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Single Combined PDF</span>
                    </button>
                    <button
                      id="separateModeButton"
                      type="button"
                      onClick={() => setOutputMode('separate')}
                      className={`text-xs py-2 px-2 rounded-xl font-medium border flex items-center justify-center gap-1.5 ${
                        outputMode === 'separate'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <FileArchive className="w-3.5 h-3.5" />
                      <span>Separate PDFs (ZIP)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* PROGRESS BAR */}
              {isProcessing && progress && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      <span>{progress.message}</span>
                    </span>
                    <span className="font-mono">{progress.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-200"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* PRIMARY CONVERT CTA */}
              <button
                id="convertButton"
                type="button"
                disabled={isProcessing || validItems.length === 0}
                onClick={handleConvert}
                className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Document...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>
                      Convert {validItems.length} Image{validItems.length === 1 ? '' : 's'} to PDF
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
