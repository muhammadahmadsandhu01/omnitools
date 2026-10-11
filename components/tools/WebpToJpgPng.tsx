'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Upload,
  FileImage,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Plus,
  Sliders,
  ShieldCheck,
  Archive,
  Image as ImageIcon,
} from 'lucide-react';
import {
  type WebpConversionOptions,
  type WebpQueueItem,
  DEFAULT_OPTIONS,
  MAX_FILES,
  MAX_TOTAL_BYTES,
  formatBytes,
  sanitizeOutputFilename,
  validateWebpFile,
  decodeImageDimensions,
  convertWebpFile,
  createBatchZip,
} from '@/lib/webpToJpgPngEngine';

export default function WebpToJpgPng() {
  const [items, setItems] = useState<WebpQueueItem[]>([]);
  const [options, setOptions] = useState<WebpConversionOptions>(DEFAULT_OPTIONS);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [zipBlob, setZipBlob] = useState<{ blob: Blob; url: string; size: number } | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [ariaAnnouncement, setAriaAnnouncement] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<WebpQueueItem[]>([]);
  const zipRef = useRef<{ blob: Blob; url: string; size: number } | null>(null);

  // Sync refs for safe cleanup on unmount
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    zipRef.current = zipBlob;
  }, [zipBlob]);

  const announce = useCallback((msg: string) => {
    setAriaAnnouncement(msg);
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (item.previewUrl) {
          try {
            URL.revokeObjectURL(item.previewUrl);
          } catch {}
        }
        if (item.resultUrl) {
          try {
            URL.revokeObjectURL(item.resultUrl);
          } catch {}
        }
      });
      if (zipRef.current?.url) {
        try {
          URL.revokeObjectURL(zipRef.current.url);
        } catch {}
      }
    };
  }, []);

  // Revoke item URLs when removed or updated
  const revokeItemUrls = useCallback((item: WebpQueueItem) => {
    if (item.previewUrl) {
      try {
        URL.revokeObjectURL(item.previewUrl);
      } catch {}
    }
    if (item.resultUrl) {
      try {
        URL.revokeObjectURL(item.resultUrl);
      } catch {}
    }
  }, []);

  // Computed queue properties
  const validItems = useMemo(() => items.filter((i) => i.isValid), [items]);
  const convertedItems = useMemo(() => items.filter((i) => i.status === 'success' && i.resultBlob), [items]);
  const totalSizeBytes = useMemo(() => items.reduce((acc, i) => acc + i.size, 0), [items]);

  // Handle incoming files
  const processIncomingFiles = async (files: FileList | File[]) => {
    const rawFiles = Array.from(files);
    if (rawFiles.length === 0) return;

    if (items.length + rawFiles.length > MAX_FILES) {
      setGlobalError(`Maximum limit is ${MAX_FILES} images at a time. Please remove some files before adding more.`);
      return;
    }

    setIsValidating(true);
    setGlobalError(null);

    // Existing names set for disambiguation
    const existingNames = new Set(items.map((i) => i.name));
    const processed: WebpQueueItem[] = [];

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

      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const validation = await validateWebpFile(file, displayName);

      let width = 0;
      let height = 0;
      let previewUrl = '';

      if (validation.isValid) {
        try {
          previewUrl = URL.createObjectURL(file);
          const dims = await decodeImageDimensions(file);
          width = dims.width;
          height = dims.height;
        } catch (err) {
          validation.isValid = false;
          validation.errorMessage = (err as Error).message || 'Failed to decode WebP image content.';
        }
      }

      processed.push({
        id,
        file,
        name: displayName,
        size: file.size,
        type: file.type || 'image/webp',
        previewUrl,
        width,
        height,
        isValid: validation.isValid,
        errorMessage: validation.errorMessage,
        status: 'idle',
      });
    }

    setItems((prev) => [...prev, ...processed]);
    setIsValidating(false);

    const validAdded = processed.filter((p) => p.isValid).length;
    announce(`Added ${processed.length} file${processed.length === 1 ? '' : 's'}. ${validAdded} valid WebP image${validAdded === 1 ? '' : 's'}.`);
  };

  // Drag and drop events
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

  // Remove single item
  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) revokeItemUrls(target);
      return prev.filter((i) => i.id !== id);
    });
    // Invalidate ZIP if results change
    if (zipBlob) {
      URL.revokeObjectURL(zipBlob.url);
      setZipBlob(null);
    }
    announce('Image removed from queue.');
  };

  // Clear all items
  const clearAll = () => {
    items.forEach((item) => revokeItemUrls(item));
    if (zipBlob) {
      URL.revokeObjectURL(zipBlob.url);
      setZipBlob(null);
    }
    setItems([]);
    setGlobalError(null);
    setProgress({ current: 0, total: 0 });
    announce('Queue cleared. All images removed.');
  };

  // Convert single item
  const convertSingleItem = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item || !item.isValid) return;

    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, status: 'converting' as const, errorMessage: undefined } : i))
    );

    try {
      const result = await convertWebpFile(item.file, options);
      const resultUrl = URL.createObjectURL(result.blob);
      const resultFilename = sanitizeOutputFilename(item.name, options.format);

      setItems((prev) =>
        prev.map((i) => {
          if (i.id === itemId) {
            if (i.resultUrl) {
              try {
                URL.revokeObjectURL(i.resultUrl);
              } catch {}
            }
            return {
              ...i,
              status: 'success' as const,
              resultBlob: result.blob,
              resultUrl,
              resultSize: result.blob.size,
              resultFilename,
              width: result.width,
              height: result.height,
            };
          }
          return i;
        })
      );
      announce(`Successfully converted ${item.name} to ${options.format.toUpperCase()}.`);
    } catch (err) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? { ...i, status: 'error' as const, errorMessage: (err as Error).message || 'Conversion failed.' }
            : i
        )
      );
      announce(`Failed to convert ${item.name}.`);
    }
  };

  // Convert all valid items
  const convertAll = async () => {
    if (validItems.length === 0 || isConverting) return;

    setIsConverting(true);
    setGlobalError(null);
    if (zipBlob) {
      URL.revokeObjectURL(zipBlob.url);
      setZipBlob(null);
    }

    setProgress({ current: 0, total: validItems.length });
    announce(`Starting conversion of ${validItems.length} images to ${options.format.toUpperCase()}.`);

    const updatedItems = [...items];
    const successfulResults: Array<{ filename: string; blob: Blob }> = [];

    for (let index = 0; index < updatedItems.length; index++) {
      const item = updatedItems[index];
      if (!item.isValid) continue;

      // Update state to converting for current item
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'converting' as const, errorMessage: undefined } : i))
      );

      try {
        const result = await convertWebpFile(item.file, options);
        const resultUrl = URL.createObjectURL(result.blob);
        const resultFilename = sanitizeOutputFilename(item.name, options.format);

        successfulResults.push({ filename: resultFilename, blob: result.blob });

        setItems((prev) =>
          prev.map((i) => {
            if (i.id === item.id) {
              if (i.resultUrl) {
                try {
                  URL.revokeObjectURL(i.resultUrl);
                } catch {}
              }
              return {
                ...i,
                status: 'success' as const,
                resultBlob: result.blob,
                resultUrl,
                resultSize: result.blob.size,
                resultFilename,
                width: result.width,
                height: result.height,
              };
            }
            return i;
          })
        );
      } catch (err) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: 'error' as const, errorMessage: (err as Error).message || 'Conversion failed.' }
              : i
          )
        );
      }

      setProgress((prev) => ({ ...prev, current: prev.current + 1 }));
    }

    // Generate batch ZIP if multiple successful items
    if (successfulResults.length > 1) {
      try {
        const zip = await createBatchZip(successfulResults);
        const url = URL.createObjectURL(zip);
        setZipBlob({ blob: zip, url, size: zip.size });
      } catch {
        // Non-blocking zip error
      }
    }

    setIsConverting(false);
    announce(`Conversion complete. ${successfulResults.length} of ${validItems.length} files successfully converted.`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* SCREEN READER ANNOUNCER */}
      <div
        id="ariaAnnouncer"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {ariaAnnouncement}
      </div>

      {/* HEADER & HERO */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Local processing: 100% browser-side • No files uploaded to any server</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          WebP to JPG & PNG Converter
        </h2>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-300">
          Convert next-generation WebP images to universal JPG or PNG files directly in your browser.
          Adjust JPEG quality, fill transparency background, and download individually or in bulk.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-mono font-medium">Input: .webp</span>
          <span>→</span>
          <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono font-medium">Output: .jpg (JPEG)</span>
          <span>or</span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono font-medium">.png (Lossless Alpha)</span>
        </div>
      </div>

      {/* GLOBAL ERROR BANNER */}
      {globalError && (
        <div
          id="globalAlert"
          role="alert"
          className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-sm text-red-800 dark:text-red-200"
        >
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Notice</p>
            <p className="text-xs sm:text-sm mt-0.5">{globalError}</p>
          </div>
          <button
            type="button"
            onClick={() => setGlobalError(null)}
            className="text-red-500 hover:text-red-700 font-bold text-xs p-1"
            aria-label="Dismiss alert"
          >
            ✕
          </button>
        </div>
      )}

      {/* WORKSPACE: EMPTY DROPZONE vs POPULATED QUEUE */}
      {items.length === 0 ? (
        /* EMPTY STATE DROPZONE */
        <div
          id="dropzone"
          role="button"
          tabIndex={0}
          aria-label="Drop WebP images here or click to browse files"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-14 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
          }`}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/60 shadow-xs">
            <Upload className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Drag & Drop WebP Images Here
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto">
            or <span className="text-blue-600 dark:text-blue-400 font-semibold underline underline-offset-2">browse files</span> from your computer or phone
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              WebP (.webp)
            </span>
            <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Opaque & Transparent
            </span>
            <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              High-Resolution
            </span>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
            Supports multiple files · Up to {MAX_FILES} images · Up to {formatBytes(MAX_TOTAL_BYTES)} total
          </p>

          <input
            id="fileInput"
            ref={fileInputRef}
            type="file"
            multiple
            accept=".webp,image/webp"
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileImage className="w-5 h-5 text-blue-600" />
                  <span>Images in Queue ({items.length})</span>
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatBytes(totalSizeBytes)} total • {convertedItems.length} converted • {validItems.length} ready
                  </p>
                  {isValidating && (
                    <span className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Validating...</span>
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
                  accept=".webp,image/webp"
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
                return (
                  <div
                    key={item.id}
                    className="group relative flex items-center gap-3 p-3 rounded-2xl border transition-all bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs"
                  >
                    {/* INDEX BADGE */}
                    <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>

                    {/* THUMBNAIL */}
                    <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0 relative">
                      {item.isValid && item.previewUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.previewUrl}
                          alt={item.name}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-red-500" />
                      )}
                    </div>

                    {/* DETAILS */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {item.name}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {item.isValid ? (
                          <>
                            <span>{item.width > 0 && item.height > 0 ? `${item.width}×${item.height} px` : 'WebP'}</span>
                            <span>•</span>
                            <span>{formatBytes(item.size)}</span>
                            {item.status === 'success' && item.resultSize && (
                              <>
                                <span>→</span>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                  {formatBytes(item.resultSize)} ({options.format.toUpperCase()})
                                </span>
                              </>
                            )}
                          </>
                        ) : (
                          <span className="text-red-500 font-medium">
                            {item.errorMessage || 'Invalid image file'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* STATUS & ACTIONS */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.status === 'converting' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-medium">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span className="hidden sm:inline">Converting</span>
                        </span>
                      )}

                      {item.status === 'success' && item.resultUrl && (
                        <a
                          id={`downloadItem-${index}`}
                          href={item.resultUrl}
                          download={item.resultFilename || `converted.${options.format}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors font-semibold"
                          title="Download Converted File"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Download</span>
                        </a>
                      )}

                      {item.status === 'error' && (
                        <button
                          id={`retryItem-${index}`}
                          type="button"
                          onClick={() => convertSingleItem(item.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 hover:bg-amber-100 font-medium"
                          title="Retry conversion"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Retry</span>
                        </button>
                      )}

                      {item.status === 'idle' && item.isValid && (
                        <button
                          type="button"
                          onClick={() => convertSingleItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Convert this image"
                          aria-label={`Convert ${item.name}`}
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        id={`removeItem-${index}`}
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Remove from queue"
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

          {/* RIGHT COLUMN: SETTINGS & PRIMARY ACTIONS (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span>Conversion Settings</span>
                </div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">Options</span>
              </div>

              {/* FORMAT SELECTOR */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="formatJpgButton"
                    type="button"
                    onClick={() => setOptions((prev) => ({ ...prev, format: 'jpg' }))}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-sm font-bold transition-all ${
                      options.format === 'jpg'
                        ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-600 text-blue-700 dark:text-blue-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>JPG / JPEG</span>
                    <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                      Universal & Compact
                    </span>
                  </button>

                  <button
                    id="formatPngButton"
                    type="button"
                    onClick={() => setOptions((prev) => ({ ...prev, format: 'png' }))}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-sm font-bold transition-all ${
                      options.format === 'png'
                        ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-600 text-blue-700 dark:text-blue-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>PNG</span>
                    <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                      Lossless Alpha Transparency
                    </span>
                  </button>
                </div>
              </div>

              {/* JPG QUALITY SLIDER (VISIBLE ONLY WHEN JPG SELECTED) */}
              {options.format === 'jpg' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="qualitySlider"
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      JPEG Quality
                    </label>
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                      {Math.round(options.quality * 100)}%
                    </span>
                  </div>

                  <input
                    id="qualitySlider"
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={Math.round(options.quality * 100)}
                    onChange={(e) =>
                      setOptions((prev) => ({ ...prev, quality: Number(e.target.value) / 100 }))
                    }
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />

                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Smaller Size (50%)</span>
                    <span>Balanced (90%)</span>
                    <span>Max Quality (100%)</span>
                  </div>
                </div>
              ) : null}

              {/* BACKGROUND COLOR FOR TRANSPARENCY (JPG ONLY) */}
              {options.format === 'jpg' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="bgColorInput"
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Background Color (for transparent areas)
                    </label>
                    <span className="text-xs font-mono text-slate-500">
                      {options.backgroundColor}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    JPEG does not support alpha transparency. Transparent pixels will be filled with this color.
                  </p>

                  <div className="flex items-center gap-2">
                    <input
                      id="bgColorInput"
                      type="color"
                      value={options.backgroundColor}
                      onChange={(e) =>
                        setOptions((prev) => ({ ...prev, backgroundColor: e.target.value }))
                      }
                      className="w-9 h-9 p-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer"
                      title="Custom color picker"
                    />

                    {/* PRESET SWATCHES */}
                    <div className="flex items-center gap-1.5">
                      {[
                        { label: 'White', hex: '#ffffff' },
                        { label: 'Black', hex: '#000000' },
                        { label: 'Light Gray', hex: '#f3f4f6' },
                        { label: 'Warm', hex: '#fef3c7' },
                      ].map((swatch) => (
                        <button
                          key={swatch.hex}
                          type="button"
                          onClick={() => setOptions((prev) => ({ ...prev, backgroundColor: swatch.hex }))}
                          className={`px-2 py-1 text-xs rounded-lg border transition-all ${
                            options.backgroundColor.toLowerCase() === swatch.hex.toLowerCase()
                              ? 'border-blue-600 font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {swatch.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* PROGRESS BAR */}
              {isConverting && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <span>Converting images...</span>
                    <span>
                      {progress.current} of {progress.total}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                      style={{
                        width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="pt-2 space-y-3">
                <button
                  id="convertAllButton"
                  type="button"
                  disabled={validItems.length === 0 || isConverting}
                  onClick={convertAll}
                  className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Batch...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Convert All to {options.format.toUpperCase()}</span>
                    </>
                  )}
                </button>

                {/* BULK DOWNLOAD ZIP */}
                {convertedItems.length > 1 && (
                  <button
                    id="downloadAllZipButton"
                    type="button"
                    onClick={() => {
                      if (zipBlob) {
                        const a = document.createElement('a');
                        a.href = zipBlob.url;
                        a.download = `converted_images_${options.format}.zip`;
                        a.click();
                      } else {
                        // On-demand zip creation
                        createBatchZip(
                          convertedItems.map((i) => ({
                            filename: i.resultFilename || `image.${options.format}`,
                            blob: i.resultBlob!,
                          }))
                        ).then((zip) => {
                          const url = URL.createObjectURL(zip);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `converted_images_${options.format}.zip`;
                          a.click();
                          URL.revokeObjectURL(url);
                        });
                      }
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Archive className="w-4 h-4" />
                    <span>Download All as ZIP ({convertedItems.length} files)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
