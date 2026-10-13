'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import {
  UploadCloud,
  FileText,
  Trash2,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
  Download,
  Loader2,
  AlertCircle,
  SplitSquareVertical,
  Layers,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Archive,
  Sparkles,
} from 'lucide-react';

export interface PdfFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  sizeFormatted: string;
  pageCount: number | null;
  isValidating: boolean;
  error: string | null;
}

export interface ParsedPageRange {
  pagesZeroBased: number[];
  normalizedLabel: string;
  count: number;
}

export type SplitMethod = 'extract' | 'single_pages' | 'ranges';

export interface ProgressState {
  active: boolean;
  phase: 'idle' | 'validating' | 'loading' | 'copying' | 'saving' | 'verifying' | 'packaging' | 'complete';
  title: string;
  detail: string;
  current: number;
  total: number;
  percent: number;
}

const MAX_SINGLE_FILE_BYTES = 250 * 1024 * 1024; // 250 MB
const MAX_TOTAL_MERGE_BYTES = 750 * 1024 * 1024; // 750 MB
const MAX_MERGE_FILES = 50;
const MIN_PDF_FILE_BYTES = 32;

const WINDOWS_RESERVED_NAMES = new Set([
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9',
]);

const makeId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const formatSize = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const yieldToBrowser = (): Promise<void> =>
  new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });

export const sanitizeFilename = (name: string, fallback: string): string => {
  if (!name || typeof name !== 'string') return fallback;

  // Unicode normalization (NFC)
  let cleaned = name.normalize('NFC').trim();

  // Strip .pdf or .zip extension if already provided
  cleaned = cleaned.replace(/\.(pdf|zip)$/i, '');

  // Strip trailing spaces and dots early
  cleaned = cleaned.replace(/[. ]+$/, '');

  // Strip directory traversal patterns
  cleaned = cleaned.replace(/\.\.+/g, '_').replace(/[/\\]/g, '_');

  // Strip dangerous control chars and disallowed filesystem chars
  cleaned = cleaned.replace(/[<>:"|?*\u0000-\u001F\u007F]/g, '_');

  // Normalize consecutive spaces and underscores
  cleaned = cleaned.replace(/\s+/g, ' ').replace(/_+/g, '_').trim();

  // Strip trailing spaces and dots
  cleaned = cleaned.replace(/[. ]+$/, '');

  // Windows reserved device name check
  if (WINDOWS_RESERVED_NAMES.has(cleaned.toUpperCase())) {
    cleaned = `${cleaned}_document`;
  }

  // Length limit for broad filesystem portability
  if (cleaned.length > 100) {
    cleaned = cleaned.slice(0, 100).trim();
  }

  // If only underscores or empty remain, return fallback
  if (!cleaned || /^_+$/.test(cleaned)) {
    return fallback;
  }

  return cleaned || fallback;
};

/**
 * Validates PDF magic-byte sequence (%PDF-) in the initial header slice of a Uint8Array buffer.
 */
export const hasPdfMagicBytesBuffer = (bytes: Uint8Array): boolean => {
  if (!bytes || bytes.length < 5) return false;
  const magic = [0x25, 0x50, 0x44, 0x46, 0x2d]; // '%PDF-'
  const limit = Math.min(bytes.length - magic.length, 1024);

  for (let i = 0; i <= limit; i++) {
    let matched = true;
    for (let j = 0; j < magic.length; j++) {
      if (bytes[i + j] !== magic[j]) {
        matched = false;
        break;
      }
    }
    if (matched) return true;
  }
  return false;
};

/**
 * Validates PDF magic-byte sequence (%PDF-) in the initial header slice of a File.
 */
export const hasPdfMagicBytes = async (file: File): Promise<boolean> => {
  try {
    const slice = file.slice(0, 1024);
    const buffer = await slice.arrayBuffer();
    return hasPdfMagicBytesBuffer(new Uint8Array(buffer));
  } catch {
    return false;
  }
};

/**
 * High-performance deterministic page range parser.
 * Supports comma-separated single pages ("1, 3, 5") and ranges ("1-3, 5-8").
 * Strictly validates bounds, deduplicates pages, rejects invalid formats,
 * and sorts ascending.
 */
export const parsePageRange = (
  rangeStr: string,
  maxPages: number
): ParsedPageRange => {
  const trimmed = rangeStr.trim();

  if (!trimmed) {
    throw new Error('Please specify the pages to extract (e.g. 1-3, 5, 8-10).');
  }

  if (!Number.isSafeInteger(maxPages) || maxPages < 1) {
    throw new Error('Unable to determine a valid document page count.');
  }

  // Reject consecutive or trailing commas
  if (trimmed.startsWith(',') || trimmed.endsWith(',') || /,\s*,/.test(trimmed)) {
    throw new Error('Invalid page range: please remove duplicate, leading, or trailing commas.');
  }

  const parts = trimmed.split(',');
  const selectedPages = new Set<number>();

  for (const rawPart of parts) {
    const part = rawPart.trim();

    if (!part) {
      throw new Error('Invalid page range: empty item detected.');
    }

    if (part.includes('-')) {
      if (!/^\d+\s*-\s*\d+$/.test(part)) {
        throw new Error(`Invalid range format "${part}". Use formats like "1-5".`);
      }

      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = Number(startStr);
      const end = Number(endStr);

      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)) {
        throw new Error(`Page numbers in range "${part}" exceed safe integer bounds.`);
      }

      if (start < 1) {
        throw new Error(`Page numbers must start at 1 or higher. Found "${start}" in "${part}".`);
      }

      if (end > maxPages) {
        throw new Error(
          `Page ${end} in range "${part}" exceeds the document total of ${maxPages} page${maxPages === 1 ? '' : 's'}.`
        );
      }

      if (start > end) {
        throw new Error(
          `Invalid reversed range "${part}": start page (${start}) cannot be greater than end page (${end}).`
        );
      }

      // Safe iteration bounded by document's actual page count
      for (let p = start; p <= end; p++) {
        selectedPages.add(p - 1); // 0-based
      }
      continue;
    }

    if (!/^\d+$/.test(part)) {
      throw new Error(`Invalid page entry "${part}". Only numbers and hyphenated ranges are allowed.`);
    }

    const page = Number(part);

    if (!Number.isSafeInteger(page)) {
      throw new Error(`Page number "${part}" exceeds safe integer bounds.`);
    }

    if (page < 1) {
      throw new Error(`Page numbers must start at 1 or higher. Found "${page}".`);
    }

    if (page > maxPages) {
      throw new Error(
        `Page ${page} exceeds the document total of ${maxPages} page${maxPages === 1 ? '' : 's'}.`
      );
    }

    selectedPages.add(page - 1); // 0-based
  }

  if (selectedPages.size === 0) {
    throw new Error('No valid pages were selected for extraction.');
  }

  const pagesZeroBased = Array.from(selectedPages).sort((a, b) => a - b);
  const normalizedLabel = pagesZeroBased.map((p) => p + 1).join(', ');

  return {
    pagesZeroBased,
    normalizedLabel,
    count: pagesZeroBased.length,
  };
};

/**
 * Multi-range parser for splitting a single PDF into multiple separate documents.
 * Supports semicolon-separated range sets (e.g. "1-5; 6-10; 11-15") or comma-separated hyphenated intervals.
 */
export const parseMultiRange = (
  multiRangeStr: string,
  maxPages: number
): ParsedPageRange[] => {
  const trimmed = multiRangeStr.trim();
  if (!trimmed) {
    throw new Error('Please specify at least one page range to split (e.g. 1-5; 6-10).');
  }

  let rawParts: string[];
  if (trimmed.includes(';')) {
    rawParts = trimmed.split(';').map((s) => s.trim()).filter(Boolean);
  } else if (/^\s*\d+\s*-\s*\d+(\s*,\s*\d+\s*-\s*\d+)+\s*$/.test(trimmed)) {
    // E.g. "1-4, 5-8"
    rawParts = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
  } else {
    rawParts = [trimmed];
  }

  if (rawParts.length === 0) {
    throw new Error('No valid page range parts detected.');
  }

  const results: ParsedPageRange[] = [];
  for (const part of rawParts) {
    const parsed = parsePageRange(part, maxPages);
    const label =
      parsed.pagesZeroBased.length > 1 &&
      parsed.pagesZeroBased[parsed.pagesZeroBased.length - 1] -
        parsed.pagesZeroBased[0] ===
        parsed.pagesZeroBased.length - 1
        ? `${parsed.pagesZeroBased[0] + 1}-${parsed.pagesZeroBased[parsed.pagesZeroBased.length - 1] + 1}`
        : parsed.normalizedLabel.replace(/, /g, '-');
    results.push({
      ...parsed,
      normalizedLabel: label,
    });
  }

  return results;
};

/**
 * Preset range generator for common extraction workflows.
 */
export const generatePresetRange = (
  pageCount: number,
  preset: 'all' | 'odd' | 'even' | 'first_last'
): string => {
  if (!Number.isSafeInteger(pageCount) || pageCount < 1) return '';
  if (preset === 'all') {
    return pageCount === 1 ? '1' : `1-${pageCount}`;
  }
  if (preset === 'first_last') {
    return pageCount === 1 ? '1' : `1, ${pageCount}`;
  }
  if (preset === 'odd') {
    const odds: number[] = [];
    for (let p = 1; p <= pageCount; p += 2) odds.push(p);
    return odds.join(', ');
  }
  if (preset === 'even') {
    const evens: number[] = [];
    for (let p = 2; p <= pageCount; p += 2) evens.push(p);
    return evens.length > 0 ? evens.join(', ') : '';
  }
  return '';
};

/**
 * Preflight inspects a single PDF file for validity, page count, and encryption.
 */
export const inspectPdfFile = async (
  file: File
): Promise<{ pageCount: number }> => {
  const looksLikePdf =
    file.type === 'application/pdf' || /\.pdf$/i.test(file.name);

  if (!looksLikePdf) {
    throw new Error(`"${file.name}" is not a recognized PDF document.`);
  }

  if (file.size === 0) {
    throw new Error(`"${file.name}" is empty (0 bytes).`);
  }

  if (file.size < MIN_PDF_FILE_BYTES) {
    throw new Error(`"${file.name}" is too small to be a valid PDF document.`);
  }

  if (file.size > MAX_SINGLE_FILE_BYTES) {
    throw new Error(
      `"${file.name}" (${formatSize(file.size)}) exceeds the ${formatSize(MAX_SINGLE_FILE_BYTES)} browser safety limit.`
    );
  }

  const validMagic = await hasPdfMagicBytes(file);
  if (!validMagic) {
    throw new Error(`"${file.name}" does not contain a valid %PDF- header.`);
  }

  let buffer: ArrayBuffer;
  try {
    buffer = await file.arrayBuffer();
  } catch {
    throw new Error(`Unable to read "${file.name}" into memory.`);
  }

  try {
    const doc = await PDFDocument.load(buffer, {
      updateMetadata: false,
      ignoreEncryption: true,
    });

    if (doc.isEncrypted) {
      throw new Error(
        `"${file.name}" is encrypted or password-protected. Client-side editing of encrypted PDFs is not supported.`
      );
    }

    const pageCount = doc.getPageCount();
    if (!Number.isInteger(pageCount) || pageCount < 1) {
      throw new Error(`"${file.name}" contains no readable pages.`);
    }

    return { pageCount };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (/encrypt|password/i.test(msg)) {
      throw new Error(
        `"${file.name}" is encrypted or password-protected. Please decrypt it before merging or extracting.`
      );
    }
    if (/corrupt|parse|xref|trailer|offset/i.test(msg)) {
      throw new Error(
        `"${file.name}" appears corrupted or contains malformed PDF syntax.`
      );
    }
    throw new Error(
      `Failed to parse "${file.name}": ${msg || 'unsupported PDF syntax'}.`
    );
  }
};

/**
 * Validates the generated output PDF byte stream before triggering download.
 */
export const verifyOutputPdfIntegrity = async (
  bytes: Uint8Array,
  expectedPages: number,
  mode: 'merge' | 'split'
): Promise<void> => {
  if (!bytes || bytes.byteLength === 0) {
    throw new Error('Generated PDF byte stream is empty.');
  }

  if (bytes.byteLength < MIN_PDF_FILE_BYTES) {
    throw new Error('Generated PDF byte stream is truncated.');
  }

  if (!hasPdfMagicBytesBuffer(bytes)) {
    throw new Error('Generated output is missing valid PDF header bytes.');
  }

  // Reload output to verify parseability and page invariant
  let reloaded: PDFDocument;
  try {
    reloaded = await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (err: unknown) {
    throw new Error(
      `Output verification failed: reloaded PDF is unparseable (${err instanceof Error ? err.message : 'corrupted'}).`
    );
  }

  const actualPages = reloaded.getPageCount();
  if (actualPages !== expectedPages) {
    throw new Error(
      `Page count mismatch during ${mode} verification: expected ${expectedPages} page${expectedPages === 1 ? '' : 's'}, but produced ${actualPages}.`
    );
  }
};

export default function PdfMergeSplit() {
  const [mode, setMode] = useState<'merge' | 'split'>('merge');
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('extract');

  const [files, setFiles] = useState<PdfFileItem[]>([]);
  const [splitFile, setSplitFile] = useState<PdfFileItem | null>(null);
  const [pageRange, setPageRange] = useState('');
  const [customFilename, setCustomFilename] = useState('');

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProgressState>({
    active: false,
    phase: 'idle',
    title: '',
    detail: '',
    current: 0,
    total: 0,
    percent: 0,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [ariaAnnouncement, setAriaAnnouncement] = useState('');
  const [showDisclosures, setShowDisclosures] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const operationIdRef = useRef(0);
  const cancelledRef = useRef(false);
  const activeBlobUrlsRef = useRef<Set<string>>(new Set());

  // Cleanup on unmount
  useEffect(() => {
    const activeBlobUrls = activeBlobUrlsRef.current;
    return () => {
      cancelledRef.current = true;
      operationIdRef.current += 1;
      activeBlobUrls.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      });
      activeBlobUrls.clear();
    };
  }, []);

  const announce = (msg: string) => {
    setAriaAnnouncement(msg);
  };

  const setInputValueEmpty = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadBlob = (
    bytes: Uint8Array,
    filename: string,
    mimeType = 'application/pdf'
  ) => {
    const safeBytes = new Uint8Array(bytes.byteLength);
    safeBytes.set(bytes);
    const blob = new Blob([safeBytes.buffer], { type: mimeType });
    const url = URL.createObjectURL(blob);
    activeBlobUrlsRef.current.add(url);

    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setTimeout(() => {
        try {
          URL.revokeObjectURL(url);
          activeBlobUrlsRef.current.delete(url);
        } catch {}
      }, 4000);
    }
  };

  const processIncomingFiles = async (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    if (incoming.length === 0) return;

    setError(null);
    setSuccess(null);

    if (mode === 'merge') {
      const remainingSlots = MAX_MERGE_FILES - files.length;
      if (remainingSlots <= 0) {
        setError(`You can merge up to ${MAX_MERGE_FILES} PDF files in a single session.`);
        setInputValueEmpty();
        return;
      }

      const accepted = incoming.slice(0, remainingSlots);
      if (accepted.length < incoming.length) {
        setError(`Limit reached: only the first ${remainingSlots} PDF files were added.`);
      }

      const incomingBytes = accepted.reduce((sum, f) => sum + f.size, 0);
      const existingBytes = files.reduce((sum, item) => sum + item.file.size, 0);

      if (existingBytes + incomingBytes > MAX_TOTAL_MERGE_BYTES) {
        setError(
          `Total selected PDF size cannot exceed ${formatSize(MAX_TOTAL_MERGE_BYTES)}. Current: ${formatSize(existingBytes + incomingBytes)}.`
        );
        setInputValueEmpty();
        return;
      }

      // Create items in validating state
      const newItems: PdfFileItem[] = accepted.map((file) => ({
        id: makeId(),
        file,
        name: file.name,
        size: file.size,
        sizeFormatted: formatSize(file.size),
        pageCount: null,
        isValidating: true,
        error: null,
      }));

      setFiles((prev) => [...prev, ...newItems]);
      setInputValueEmpty();

      // Asynchronously preflight inspect each newly added file
      for (const item of newItems) {
        try {
          const info = await inspectPdfFile(item.file);
          setFiles((curr) =>
            curr.map((f) =>
              f.id === item.id
                ? { ...f, pageCount: info.pageCount, isValidating: false, error: null }
                : f
            )
          );
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : 'Validation failed.';
          setFiles((curr) =>
            curr.map((f) =>
              f.id === item.id
                ? { ...f, isValidating: false, error: errMsg }
                : f
            )
          );
        }
      }
      announce(`Added ${accepted.length} file${accepted.length === 1 ? '' : 's'} to merge list.`);
    } else {
      // Split mode
      const target = incoming[0];
      const singleItem: PdfFileItem = {
        id: makeId(),
        file: target,
        name: target.name,
        size: target.size,
        sizeFormatted: formatSize(target.size),
        pageCount: null,
        isValidating: true,
        error: null,
      };

      setSplitFile(singleItem);
      setPageRange('');
      setInputValueEmpty();

      try {
        const info = await inspectPdfFile(target);
        setSplitFile((curr) =>
          curr && curr.id === singleItem.id
            ? { ...curr, pageCount: info.pageCount, isValidating: false, error: null }
            : curr
        );
        announce(`Loaded ${target.name} with ${info.pageCount} pages.`);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Validation failed.';
        setSplitFile((curr) =>
          curr && curr.id === singleItem.id
            ? { ...curr, isValidating: false, error: errMsg }
            : curr
        );
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processIncomingFiles(e.dataTransfer.files);
    }
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    if (isProcessing) return;

    setFiles((current) => {
      if (direction === 'up' && index > 0) {
        const next = [...current];
        const target = next[index];
        [next[index - 1], next[index]] = [next[index], next[index - 1]];
        announce(`"${target.name}" moved to position ${index} of ${next.length}.`);
        return next;
      }
      if (direction === 'down' && index < current.length - 1) {
        const next = [...current];
        const target = next[index];
        [next[index + 1], next[index]] = [next[index], next[index + 1]];
        announce(`"${target.name}" moved to position ${index + 2} of ${next.length}.`);
        return next;
      }
      return current;
    });
  };

  const removeFile = (id: string) => {
    if (isProcessing) return;
    setFiles((current) => {
      const removed = current.find((f) => f.id === id);
      const remaining = current.filter((f) => f.id !== id);
      if (removed) {
        announce(`Removed "${removed.name}". ${remaining.length} files remaining.`);
      }
      return remaining;
    });
  };

  const cancelProcessing = () => {
    if (!isProcessing) return;
    cancelledRef.current = true;
    operationIdRef.current += 1;
    setIsProcessing(false);
    setProgress({
      active: false,
      phase: 'idle',
      title: '',
      detail: '',
      current: 0,
      total: 0,
      percent: 0,
    });
    setError(null);
    setSuccess('Operation was cancelled. Your uploaded files remain ready.');
    announce('Processing was cancelled.');
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please add at least 2 PDF files to merge.');
      setSuccess(null);
      return;
    }

    const unreadyFile = files.find((f) => f.isValidating || Boolean(f.error));
    if (unreadyFile) {
      if (unreadyFile.isValidating) {
        setError(`Please wait: "${unreadyFile.name}" is still being validated.`);
      } else {
        setError(`Cannot merge: "${unreadyFile.name}" has an error (${unreadyFile.error}). Please remove it first.`);
      }
      setSuccess(null);
      return;
    }

    const totalBytes = files.reduce((sum, item) => sum + item.file.size, 0);
    if (totalBytes > MAX_TOTAL_MERGE_BYTES) {
      setError(`Total selected PDF size cannot exceed ${formatSize(MAX_TOTAL_MERGE_BYTES)}.`);
      setSuccess(null);
      return;
    }

    const operationId = ++operationIdRef.current;
    cancelledRef.current = false;
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    const isCurrent = () =>
      !cancelledRef.current && operationIdRef.current === operationId;

    try {
      setProgress({
        active: true,
        phase: 'validating',
        title: 'Preparing Merge Session',
        detail: 'Initializing memory workspace...',
        current: 0,
        total: files.length,
        percent: 5,
      });

      await yieldToBrowser();
      if (!isCurrent()) return;

      const mergedPdf = await PDFDocument.create();
      mergedPdf.setProducer('OmniTools PDF Utility (Client-Side)');
      mergedPdf.setCreator('OmniTools');
      mergedPdf.setModificationDate(new Date());

      let totalPagesCopied = 0;

      for (let i = 0; i < files.length; i++) {
        if (!isCurrent()) return;

        const item = files[i];
        const progressPct = 10 + Math.round((i / files.length) * 75);

        setProgress({
          active: true,
          phase: 'loading',
          title: `Processing Document ${i + 1} of ${files.length}`,
          detail: `Reading "${item.name}"...`,
          current: i + 1,
          total: files.length,
          percent: progressPct,
        });

        await yieldToBrowser();
        if (!isCurrent()) return;

        let arrayBuffer: ArrayBuffer;
        try {
          arrayBuffer = await item.file.arrayBuffer();
        } catch {
          throw new Error(`Failed to read file buffer for "${item.name}".`);
        }

        if (!isCurrent()) return;

        const sourcePdf = await PDFDocument.load(arrayBuffer, {
          updateMetadata: false,
          ignoreEncryption: true,
        });

        if (sourcePdf.isEncrypted) {
          throw new Error(`"${item.name}" is encrypted or password-protected.`);
        }

        if (!isCurrent()) return;

        const pageIndices = sourcePdf.getPageIndices();
        totalPagesCopied += pageIndices.length;

        setProgress({
          active: true,
          phase: 'copying',
          title: `Merging Document ${i + 1} of ${files.length}`,
          detail: `Copying ${pageIndices.length} page${pageIndices.length === 1 ? '' : 's'} from "${item.name}"...`,
          current: i + 1,
          total: files.length,
          percent: progressPct + 5,
        });

        await yieldToBrowser();
        if (!isCurrent()) return;

        const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndices);
        for (const page of copiedPages) {
          mergedPdf.addPage(page);
        }

        await yieldToBrowser();
      }

      if (!isCurrent()) return;

      setProgress({
        active: true,
        phase: 'saving',
        title: 'Generating Output Document',
        detail: `Serializing ${totalPagesCopied} pages into final PDF...`,
        current: files.length,
        total: files.length,
        percent: 90,
      });

      await yieldToBrowser();
      if (!isCurrent()) return;

      const pdfBytes = await mergedPdf.save({
        addDefaultPage: false,
        useObjectStreams: false,
        updateFieldAppearances: false,
      });

      if (!isCurrent()) return;

      setProgress({
        active: true,
        phase: 'verifying',
        title: 'Verifying Output Integrity',
        detail: 'Checking PDF invariants and reloading pages...',
        current: files.length,
        total: files.length,
        percent: 95,
      });

      await yieldToBrowser();
      if (!isCurrent()) return;

      // Invariant validation: verify byte stream and page count match input sum
      await verifyOutputPdfIntegrity(pdfBytes, totalPagesCopied, 'merge');

      if (!isCurrent()) return;

      const baseName = sanitizeFilename(customFilename || 'OmniTools_Merged', 'OmniTools_Merged');
      downloadBlob(pdfBytes, `${baseName}.pdf`);

      setProgress({
        active: false,
        phase: 'complete',
        title: 'Merge Complete',
        detail: '',
        current: files.length,
        total: files.length,
        percent: 100,
      });

      setSuccess(
        `Successfully merged ${files.length} documents into a single ${totalPagesCopied}-page PDF (${formatSize(pdfBytes.byteLength)}).`
      );
      announce(`Successfully merged ${files.length} documents into a ${totalPagesCopied}-page PDF.`);
    } catch (err: unknown) {
      if (!isCurrent()) return;
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while merging PDFs.'
      );
    } finally {
      if (isCurrent()) {
        setIsProcessing(false);
      }
    }
  };

  const handleSplit = async () => {
    if (!splitFile) {
      setError('Please upload a PDF file to extract or split pages.');
      setSuccess(null);
      return;
    }

    if (splitFile.isValidating) {
      setError(`Please wait: "${splitFile.name}" is still being analyzed.`);
      setSuccess(null);
      return;
    }

    if (splitFile.error) {
      setError(`Cannot split: ${splitFile.error}`);
      setSuccess(null);
      return;
    }

    const totalPages = splitFile.pageCount;
    if (!totalPages || totalPages < 1) {
      setError('Unable to determine the document page count.');
      setSuccess(null);
      return;
    }

    const operationId = ++operationIdRef.current;
    cancelledRef.current = false;
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    const isCurrent = () =>
      !cancelledRef.current && operationIdRef.current === operationId;

    try {
      setProgress({
        active: true,
        phase: 'loading',
        title: 'Loading Source Document',
        detail: `Reading "${splitFile.name}"...`,
        current: 1,
        total: 1,
        percent: 15,
      });

      await yieldToBrowser();
      if (!isCurrent()) return;

      const buffer = await splitFile.file.arrayBuffer();
      if (!isCurrent()) return;

      const sourcePdf = await PDFDocument.load(buffer, {
        updateMetadata: false,
        ignoreEncryption: true,
      });

      if (sourcePdf.isEncrypted) {
        throw new Error('The selected document is encrypted or password-protected.');
      }

      if (!isCurrent()) return;

      const defaultBase = `OmniTools_Split_${splitFile.name}`;
      const safeBase = sanitizeFilename(customFilename || defaultBase, 'OmniTools_Split');

      // MODE 1: EXTRACT SELECTED PAGES (SINGLE PDF)
      if (splitMethod === 'extract') {
        if (!pageRange.trim()) {
          throw new Error('Please specify the pages to extract (e.g. 1-3, 5).');
        }

        const parsed = parsePageRange(pageRange, totalPages);

        setProgress({
          active: true,
          phase: 'copying',
          title: 'Extracting Selected Pages',
          detail: `Extracting pages: ${parsed.normalizedLabel}...`,
          current: 1,
          total: 1,
          percent: 50,
        });

        await yieldToBrowser();
        if (!isCurrent()) return;

        const newPdf = await PDFDocument.create();
        newPdf.setProducer('OmniTools PDF Utility (Client-Side)');
        newPdf.setCreator('OmniTools');
        newPdf.setModificationDate(new Date());

        const copiedPages = await newPdf.copyPages(sourcePdf, parsed.pagesZeroBased);
        for (const page of copiedPages) {
          newPdf.addPage(page);
        }

        if (!isCurrent()) return;

        setProgress({
          active: true,
          phase: 'saving',
          title: 'Building Extracted PDF',
          detail: `Saving ${parsed.count} pages into new document...`,
          current: 1,
          total: 1,
          percent: 80,
        });

        await yieldToBrowser();
        if (!isCurrent()) return;

        const pdfBytes = await newPdf.save({
          addDefaultPage: false,
          useObjectStreams: false,
          updateFieldAppearances: false,
        });

        if (!isCurrent()) return;

        setProgress({
          active: true,
          phase: 'verifying',
          title: 'Verifying Output Integrity',
          detail: 'Checking PDF invariants and validating page count...',
          current: 1,
          total: 1,
          percent: 95,
        });

        await yieldToBrowser();
        if (!isCurrent()) return;

        await verifyOutputPdfIntegrity(pdfBytes, parsed.count, 'split');

        if (!isCurrent()) return;

        downloadBlob(pdfBytes, `${safeBase}.pdf`);

        setSuccess(
          `Extracted ${parsed.count} page${parsed.count === 1 ? '' : 's'} (${parsed.normalizedLabel}) successfully.`
        );
        announce(`Extracted ${parsed.count} pages successfully.`);
      }

      // MODE 2: SPLIT EVERY PAGE INTO SEPARATE PDFS (ZIP ARCHIVE)
      else if (splitMethod === 'single_pages') {
        const zip = new JSZip();
        const padDigits = totalPages >= 100 ? 3 : totalPages >= 10 ? 2 : 1;

        for (let i = 0; i < totalPages; i++) {
          if (!isCurrent()) return;

          const pct = 20 + Math.round((i / totalPages) * 60);
          setProgress({
            active: true,
            phase: 'copying',
            title: `Splitting Page ${i + 1} of ${totalPages}`,
            detail: `Generating individual single-page document...`,
            current: i + 1,
            total: totalPages,
            percent: pct,
          });

          await yieldToBrowser();
          if (!isCurrent()) return;

          const pageDoc = await PDFDocument.create();
          pageDoc.setProducer('OmniTools PDF Utility (Client-Side)');
          pageDoc.setCreator('OmniTools');
          pageDoc.setModificationDate(new Date());

          const [copiedPage] = await pageDoc.copyPages(sourcePdf, [i]);
          pageDoc.addPage(copiedPage);

          const pageBytes = await pageDoc.save({
            addDefaultPage: false,
            useObjectStreams: false,
            updateFieldAppearances: false,
          });

          await verifyOutputPdfIntegrity(pageBytes, 1, 'split');

          const padNum = String(i + 1).padStart(padDigits, '0');
          zip.file(`${safeBase}_page_${padNum}.pdf`, pageBytes);

          await yieldToBrowser();
        }

        if (!isCurrent()) return;

        setProgress({
          active: true,
          phase: 'packaging',
          title: 'Compressing ZIP Archive',
          detail: `Packaging ${totalPages} individual PDF documents...`,
          current: totalPages,
          total: totalPages,
          percent: 85,
        });

        await yieldToBrowser();
        if (!isCurrent()) return;

        const zipBytes = await zip.generateAsync(
          {
            type: 'uint8array',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 },
          },
          (metadata) => {
            if (isCurrent()) {
              setProgress((prev) => ({
                ...prev,
                percent: Math.min(98, 85 + Math.round(metadata.percent * 0.13)),
              }));
            }
          }
        );

        if (!isCurrent()) return;

        downloadBlob(zipBytes, `${safeBase}.zip`, 'application/zip');

        setSuccess(
          `Successfully split ${totalPages} pages into individual PDF files packaged in "${safeBase}.zip".`
        );
        announce(`Successfully split ${totalPages} pages into a ZIP archive.`);
      }

      // MODE 3: SPLIT BY RANGES INTO MULTIPLE PDFS (ZIP ARCHIVE)
      else if (splitMethod === 'ranges') {
        if (!pageRange.trim()) {
          throw new Error('Please enter semicolon- or comma-separated page ranges (e.g. 1-5; 6-10; 11-15).');
        }

        const groups = parseMultiRange(pageRange, totalPages);
        const zip = new JSZip();

        for (let g = 0; g < groups.length; g++) {
          if (!isCurrent()) return;

          const group = groups[g];
          const pct = 20 + Math.round((g / groups.length) * 60);

          setProgress({
            active: true,
            phase: 'copying',
            title: `Building Part ${g + 1} of ${groups.length}`,
            detail: `Extracting pages ${group.normalizedLabel}...`,
            current: g + 1,
            total: groups.length,
            percent: pct,
          });

          await yieldToBrowser();
          if (!isCurrent()) return;

          const partDoc = await PDFDocument.create();
          partDoc.setProducer('OmniTools PDF Utility (Client-Side)');
          partDoc.setCreator('OmniTools');
          partDoc.setModificationDate(new Date());

          const copiedPages = await partDoc.copyPages(sourcePdf, group.pagesZeroBased);
          for (const page of copiedPages) {
            partDoc.addPage(page);
          }

          const partBytes = await partDoc.save({
            addDefaultPage: false,
            useObjectStreams: false,
            updateFieldAppearances: false,
          });

          await verifyOutputPdfIntegrity(partBytes, group.pagesZeroBased.length, 'split');

          const safeLabel = group.normalizedLabel.replace(/, /g, '_');
          zip.file(`${safeBase}_part_${g + 1}_pages_${safeLabel}.pdf`, partBytes);

          await yieldToBrowser();
        }

        if (!isCurrent()) return;

        setProgress({
          active: true,
          phase: 'packaging',
          title: 'Packaging ZIP Archive',
          detail: `Packaging ${groups.length} separate documents...`,
          current: groups.length,
          total: groups.length,
          percent: 85,
        });

        await yieldToBrowser();
        if (!isCurrent()) return;

        const zipBytes = await zip.generateAsync(
          {
            type: 'uint8array',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 },
          },
          (metadata) => {
            if (isCurrent()) {
              setProgress((prev) => ({
                ...prev,
                percent: Math.min(98, 85 + Math.round(metadata.percent * 0.13)),
              }));
            }
          }
        );

        if (!isCurrent()) return;

        downloadBlob(zipBytes, `${safeBase}.zip`, 'application/zip');

        setSuccess(
          `Successfully created ${groups.length} separate documents packaged in "${safeBase}.zip".`
        );
        announce(`Successfully split document into ${groups.length} files.`);
      }

      setProgress({
        active: false,
        phase: 'complete',
        title: 'Operation Complete',
        detail: '',
        current: 1,
        total: 1,
        percent: 100,
      });
    } catch (err: unknown) {
      if (!isCurrent()) return;
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while splitting PDF pages.'
      );
    } finally {
      if (isCurrent()) {
        setIsProcessing(false);
      }
    }
  };

  const switchMode = (nextMode: 'merge' | 'split') => {
    cancelledRef.current = true;
    operationIdRef.current += 1;
    setIsProcessing(false);
    setProgress({
      active: false,
      phase: 'idle',
      title: '',
      detail: '',
      current: 0,
      total: 0,
      percent: 0,
    });
    setMode(nextMode);
    setError(null);
    setSuccess(null);
    setIsDragging(false);
    setCustomFilename('');
    setInputValueEmpty();
    announce(`Switched to ${nextMode === 'merge' ? 'Merge PDFs' : 'Split / Extract'} mode.`);
  };

  const clearMergeFiles = () => {
    if (isProcessing) return;
    setFiles([]);
    setError(null);
    setSuccess(null);
    setCustomFilename('');
    setInputValueEmpty();
    announce('Cleared all files from merge list.');
  };

  const replaceSplitFile = () => {
    if (isProcessing) return;
    setSplitFile(null);
    setPageRange('');
    setCustomFilename('');
    setError(null);
    setSuccess(null);
    setInputValueEmpty();
    fileInputRef.current?.click();
  };

  const totalMergePages = files.reduce(
    (sum, f) => sum + (f.pageCount || 0),
    0
  );
  const totalMergeBytes = files.reduce((sum, f) => sum + f.file.size, 0);

  // Live range validation status for Split Mode
  const rangeValidation = useMemo(() => {
    if (!splitFile || !splitFile.pageCount || !pageRange.trim()) {
      return null;
    }
    try {
      if (splitMethod === 'ranges') {
        const groups = parseMultiRange(pageRange, splitFile.pageCount);
        const totalSelected = groups.reduce((sum, g) => sum + g.count, 0);
        return {
          isValid: true,
          message: `${groups.length} document parts (${totalSelected} total pages)`,
        };
      }
      if (splitMethod === 'extract') {
        const parsed = parsePageRange(pageRange, splitFile.pageCount);
        return {
          isValid: true,
          message: `${parsed.count} of ${splitFile.pageCount} page${splitFile.pageCount === 1 ? '' : 's'} selected (${parsed.normalizedLabel})`,
        };
      }
      return null;
    } catch (err) {
      return {
        isValid: false,
        message: err instanceof Error ? err.message : 'Invalid syntax',
      };
    }
  }, [splitFile, pageRange, splitMethod]);

  const outputExtension = mode === 'merge' || splitMethod === 'extract' ? '.pdf' : '.zip';

  return (
    <div className="flex flex-col gap-6">
      {/* Hidden Live Region for Screen Readers */}
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
        aria-atomic="true"
      >
        {ariaAnnouncement}
      </div>

      {/* 1. TOP TABS & CLIENT PRIVACY BADGE */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="PDF Tool Mode Selection"
          className="bg-gray-100 dark:bg-slate-800 p-1 rounded-2xl flex gap-1 border border-gray-200 dark:border-slate-700 w-full sm:w-auto"
        >
          <button
            type="button"
            role="tab"
            id="tab-merge"
            aria-selected={mode === 'merge'}
            aria-controls="panel-merge-split"
            onClick={() => switchMode('merge')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              mode === 'merge'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Layers className="w-4 h-4" /> Merge PDFs
          </button>
          <button
            type="button"
            role="tab"
            id="tab-split"
            aria-selected={mode === 'split'}
            aria-controls="panel-merge-split"
            onClick={() => switchMode('split')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              mode === 'split'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <SplitSquareVertical className="w-4 h-4" /> Split &amp; Extract
          </button>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border border-emerald-200 dark:border-emerald-800/50 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Local processing: 100% private in-browser memory. Zero file uploads.</span>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div
          role="alert"
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-2xl flex items-start gap-3 text-sm"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <div className="flex-1">
            <p className="font-semibold">Operation Error</p>
            <p className="mt-0.5 text-xs sm:text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* SUCCESS BANNER */}
      {success && (
        <div
          role="status"
          aria-live="polite"
          className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 p-4 rounded-2xl flex items-start gap-3 text-sm"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
          <div className="flex-1">
            <p className="font-semibold">Success</p>
            <p className="mt-0.5 text-xs sm:text-sm">{success}</p>
          </div>
        </div>
      )}

      {/* 2. MAIN WORKSPACE */}
      <div
        id="panel-merge-split"
        role="tabpanel"
        aria-labelledby={mode === 'merge' ? 'tab-merge' : 'tab-split'}
        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6"
      >
        {((mode === 'merge' && files.length === 0) || (mode === 'split' && !splitFile)) ? (
          /* EMPTY DROPZONE */
          <div
            tabIndex={0}
            role="button"
            aria-label={`Upload PDF files for ${mode === 'merge' ? 'merging' : 'splitting'}: drag and drop or press Enter to browse`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 hover:bg-gray-100 dark:hover:bg-slate-900'
            }`}
          >
            <UploadCloud className="w-12 h-12 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 text-center">
              {mode === 'merge'
                ? 'Drag & Drop PDF files to merge'
                : 'Drag & Drop a PDF to split or extract'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
              or click to browse from your device
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">
              Up to {formatSize(MAX_SINGLE_FILE_BYTES)} per file · Pure client-side processing
            </p>
            <input
              type="file"
              multiple={mode === 'merge'}
              accept=".pdf,application/pdf"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files) processIncomingFiles(e.target.files);
              }}
              className="hidden"
              aria-hidden="true"
            />
          </div>
        ) : (
          /* POPULATED WORKSPACE */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-slate-800 pb-4">
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  {mode === 'merge'
                    ? `Documents to Merge (${files.length})`
                    : 'Document Selected for Splitting'}
                </h3>
                {mode === 'merge' && files.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatSize(totalMergeBytes)} total ·{' '}
                    {totalMergePages > 0 ? `${totalMergePages} pages · ` : ''}
                    Sequence determines output page order
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {mode === 'merge' && files.length > 0 && (
                  <button
                    type="button"
                    onClick={clearMergeFiles}
                    disabled={isProcessing}
                    className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-semibold hover:text-red-500 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded px-2 py-1"
                  >
                    Clear all
                  </button>
                )}
                <button
                  type="button"
                  onClick={
                    mode === 'merge'
                      ? () => fileInputRef.current?.click()
                      : replaceSplitFile
                  }
                  disabled={isProcessing}
                  className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-2 py-1"
                >
                  + {mode === 'merge' ? 'Add more files' : 'Replace document'}
                </button>
              </div>

              <input
                type="file"
                multiple={mode === 'merge'}
                accept=".pdf,application/pdf"
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files) processIncomingFiles(e.target.files);
                }}
                className="hidden"
                aria-hidden="true"
              />
            </div>

            {/* MERGE FILE LIST */}
            {mode === 'merge' && (
              <div className="space-y-4">
                <div
                  role="list"
                  aria-label="Ordered list of documents to merge"
                  className="space-y-2.5"
                >
                  {files.map((file, index) => (
                    <div
                      key={file.id}
                      role="listitem"
                      aria-label={`Document ${index + 1} of ${files.length}: ${file.name}`}
                      className="flex items-center justify-between bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 p-3.5 sm:p-4 rounded-2xl gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 overflow-hidden min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <FileText className="w-6 h-6 text-red-500 shrink-0" />
                        <div className="truncate min-w-0">
                          <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            <span>{file.sizeFormatted}</span>
                            <span>•</span>
                            {file.isValidating ? (
                              <span className="text-blue-500 flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" /> Verifying...
                              </span>
                            ) : file.error ? (
                              <span className="text-red-500 flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> Error: {file.error}
                              </span>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <FileCheck className="w-3 h-3" /> {file.pageCount} page{file.pageCount === 1 ? '' : 's'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => moveFile(index, 'up')}
                            disabled={index === 0 || isProcessing}
                            aria-label={`Move "${file.name}" up from position ${index + 1}`}
                            className="p-1 rounded text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveFile(index, 'down')}
                            disabled={index === files.length - 1 || isProcessing}
                            aria-label={`Move "${file.name}" down from position ${index + 1}`}
                            className="p-1 rounded text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFile(file.id)}
                          disabled={isProcessing}
                          aria-label={`Remove "${file.name}" from merge list`}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CUSTOM FILENAME INPUT */}
                <div className="pt-2">
                  <label
                    htmlFor="input-merge-filename"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Output Filename (Optional)
                  </label>
                  <div className="flex items-center">
                    <input
                      id="input-merge-filename"
                      type="text"
                      value={customFilename}
                      onChange={(e) => setCustomFilename(e.target.value)}
                      placeholder="OmniTools_Merged"
                      className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-l-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white font-mono text-xs sm:text-sm"
                    />
                    <span className="px-3.5 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-mono border border-l-0 border-gray-200 dark:border-slate-800 rounded-r-xl select-none">
                      .pdf
                    </span>
                  </div>
                </div>

                {/* MERGE ACTION BAR */}
                <div className="pt-2">
                  {progress.active && (
                    <div
                      className="bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-4 mb-4 space-y-2"
                      aria-live="polite"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-blue-700 dark:text-blue-300">
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          {progress.title}
                        </span>
                        <span>{progress.percent}%</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                        {progress.detail}
                      </p>
                      <div
                        role="progressbar"
                        aria-valuenow={progress.percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="PDF merge progress"
                        className="w-full h-2 bg-blue-100 dark:bg-slate-800 rounded-full overflow-hidden"
                      >
                        <div
                          className="h-full bg-blue-600 transition-all duration-300"
                          style={{ width: `${progress.percent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={handleMerge}
                      disabled={isProcessing || files.length < 2}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Merging PDFs...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          <span>Merge &amp; Download PDF</span>
                        </>
                      )}
                    </button>

                    {isProcessing && (
                      <button
                        type="button"
                        onClick={cancelProcessing}
                        className="sm:w-36 flex items-center justify-center px-5 py-4 rounded-2xl font-semibold border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SPLIT / EXTRACT WORKSPACE */}
            {mode === 'split' && splitFile && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 p-4 rounded-2xl">
                  <FileText className="w-10 h-10 text-red-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">
                      {splitFile.name}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>{splitFile.sizeFormatted}</span>
                      <span>•</span>
                      {splitFile.isValidating ? (
                        <span className="text-blue-500 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Validating PDF...
                        </span>
                      ) : splitFile.error ? (
                        <span className="text-red-500 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> {splitFile.error}
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <FileCheck className="w-3 h-3" /> {splitFile.pageCount} Total Pages
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* SPLIT METHOD SELECTOR */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Splitting Method
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs sm:text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setSplitMethod('extract');
                        setError(null);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        splitMethod === 'extract'
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold ring-1 ring-blue-500'
                          : 'border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-bold">Extract Pages</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                        Combines selected pages into a single output PDF.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSplitMethod('single_pages');
                        setError(null);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        splitMethod === 'single_pages'
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold ring-1 ring-blue-500'
                          : 'border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Archive className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-bold">Every Page (ZIP)</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                        Extracts every single page as a standalone 1-page PDF.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSplitMethod('ranges');
                        setError(null);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        splitMethod === 'ranges'
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold ring-1 ring-blue-500'
                          : 'border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <SplitSquareVertical className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-bold">By Ranges (ZIP)</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                        Splits into multiple PDF parts (e.g. 1-5; 6-10) in a ZIP.
                      </p>
                    </button>
                  </div>
                </div>

                {/* RANGE INPUT (For 'extract' or 'ranges') */}
                {splitMethod !== 'single_pages' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="input-page-range"
                        className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
                      >
                        {splitMethod === 'extract'
                          ? 'Pages to Extract'
                          : 'Range Groups (Semicolon-Separated)'}
                      </label>
                      {rangeValidation && (
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            rangeValidation.isValid
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                          }`}
                        >
                          {rangeValidation.isValid ? `✓ ${rangeValidation.message}` : `⚠ ${rangeValidation.message}`}
                        </span>
                      )}
                    </div>

                    <input
                      id="input-page-range"
                      type="text"
                      value={pageRange}
                      onChange={(e) => {
                        setPageRange(e.target.value);
                        setError(null);
                        setSuccess(null);
                      }}
                      placeholder={
                        splitMethod === 'ranges'
                          ? splitFile.pageCount && splitFile.pageCount > 4
                            ? `e.g. 1-2; 3-${splitFile.pageCount}`
                            : 'e.g. 1-3; 4-6; 7-10'
                          : splitFile.pageCount
                          ? `e.g. 1-${Math.min(3, splitFile.pageCount)}, ${splitFile.pageCount}`
                          : 'e.g. 1-3, 5, 8-10'
                      }
                      className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white font-mono text-sm"
                      aria-label={splitMethod === 'extract' ? 'Pages to extract' : 'Page range groups to split'}
                    />

                    {/* QUICK PRESETS FOR EXTRACT MODE */}
                    {splitMethod === 'extract' && splitFile.pageCount && splitFile.pageCount > 1 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-blue-500" /> Presets:
                        </span>
                        <button
                          type="button"
                          onClick={() => setPageRange(generatePresetRange(splitFile.pageCount!, 'all'))}
                          className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                        >
                          All Pages (1–{splitFile.pageCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => setPageRange(generatePresetRange(splitFile.pageCount!, 'odd'))}
                          className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                        >
                          Odd Pages
                        </button>
                        {splitFile.pageCount >= 2 && (
                          <button
                            type="button"
                            onClick={() => setPageRange(generatePresetRange(splitFile.pageCount!, 'even'))}
                            className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                          >
                            Even Pages
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setPageRange(generatePresetRange(splitFile.pageCount!, 'first_last'))}
                          className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                        >
                          First &amp; Last
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {splitMethod === 'extract' ? (
                        <>
                          Enter individual page numbers or ranges separated by commas (e.g.{' '}
                          <code className="font-mono text-blue-600 dark:text-blue-400">1-3, 5, 8-10</code>).
                          {splitFile.pageCount ? ` Valid range: 1 to ${splitFile.pageCount}.` : ''} Duplicate pages are deduplicated automatically.
                        </>
                      ) : (
                        <>
                          Enter distinct document groups separated by semicolons (e.g.{' '}
                          <code className="font-mono text-blue-600 dark:text-blue-400">1-5; 6-10; 11-15</code>).
                          Each range group will be saved as a separate PDF file inside the downloaded ZIP archive.
                        </>
                      )}
                    </p>
                  </div>
                )}

                {splitMethod === 'single_pages' && (
                  <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-2xl p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    <p className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                      <Archive className="w-4 h-4 text-blue-600" /> All Pages Extraction Mode
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      This will convert all {splitFile.pageCount} pages into {splitFile.pageCount} standalone single-page PDF documents (`_page_01.pdf`, `_page_02.pdf`, ...) and bundle them directly into a single ZIP archive.
                    </p>
                  </div>
                )}

                {/* CUSTOM FILENAME INPUT */}
                <div>
                  <label
                    htmlFor="input-split-filename"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Output Filename (Optional)
                  </label>
                  <div className="flex items-center">
                    <input
                      id="input-split-filename"
                      type="text"
                      value={customFilename}
                      onChange={(e) => setCustomFilename(e.target.value)}
                      placeholder={`OmniTools_Split_${splitFile.name}`}
                      className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-l-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white font-mono text-xs sm:text-sm"
                    />
                    <span className="px-3.5 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-mono border border-l-0 border-gray-200 dark:border-slate-800 rounded-r-xl select-none">
                      {outputExtension}
                    </span>
                  </div>
                </div>

                {progress.active && (
                  <div
                    className="bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-4 space-y-2"
                    aria-live="polite"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-blue-700 dark:text-blue-300">
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        {progress.title}
                      </span>
                      <span>{progress.percent}%</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                      {progress.detail}
                    </p>
                    <div
                      role="progressbar"
                      aria-valuenow={progress.percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="PDF extraction progress"
                      className="w-full h-2 bg-blue-100 dark:bg-slate-800 rounded-full overflow-hidden"
                    >
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleSplit}
                    disabled={
                      isProcessing ||
                      Boolean(splitFile.error) ||
                      (splitMethod !== 'single_pages' && !pageRange.trim()) ||
                      (rangeValidation !== null && !rangeValidation.isValid)
                    }
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing Document...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>
                          {splitMethod === 'extract'
                            ? 'Extract & Download PDF'
                            : splitMethod === 'single_pages'
                            ? `Split ${splitFile.pageCount} Pages & Download ZIP`
                            : 'Split Ranges & Download ZIP'}
                        </span>
                      </>
                    )}
                  </button>

                  {isProcessing && (
                    <button
                      type="button"
                      onClick={cancelProcessing}
                      className="sm:w-36 flex items-center justify-center px-5 py-4 rounded-2xl font-semibold border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. TECHNICAL & DISCLOSURES PANEL */}
      <section
        aria-labelledby="heading-disclosures"
        className="bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 transition-colors text-xs text-slate-600 dark:text-slate-400 space-y-3"
      >
        <div className="flex items-center justify-between">
          <h4
            id="heading-disclosures"
            className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm"
          >
            <HelpCircle className="w-4 h-4 text-blue-600" />
            PDF Technical Methodology &amp; Browser Limitations
          </h4>
          <button
            type="button"
            onClick={() => setShowDisclosures((prev) => !prev)}
            aria-expanded={showDisclosures}
            aria-controls="technical-disclosures-panel"
            className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-2 py-1"
          >
            <span>{showDisclosures ? 'Hide Details' : 'View Details'}</span>
            {showDisclosures ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {showDisclosures && (
          <div
            id="technical-disclosures-panel"
            className="space-y-3 pt-2 border-t border-gray-200 dark:border-slate-800"
          >
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-300">
                100% In-Memory Client Architecture
              </p>
              <p className="mt-0.5">
                All document parsing, page extraction, ZIP compression, and assembly occur strictly client-side inside your browser via standard Web APIs and PDFDocument. Files and extracted contents are never uploaded to any server or external service.
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-300">
                Resource Budget &amp; Memory Safeguards
              </p>
              <p className="mt-0.5">
                Individual files are capped at 250 MB, with a total merge batch limit of 750 MB and up to 50 files. Actual browser RAM usage may exceed disk file size during decompression and parsing. Multi-part splits and individual page operations yield execution frames to maintain a responsive interface.
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-300">
                Feature Preservation Scope
              </p>
              <p className="mt-0.5">
                Page visual appearance, vector artwork, embedded fonts, image fidelity, media boxes, crop boxes, and page rotation are preserved. Note that document-level interactive elements (such as fillable AcroForm input fields, JavaScript actions, and complex hierarchical bookmarks) are flattened to prevent cross-document catalog corruption.
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-300">
                Encrypted &amp; Password-Protected Documents
              </p>
              <p className="mt-0.5">
                Encrypted and password-protected PDF files cannot be processed without prior decryption. If an encrypted document is uploaded, it is automatically detected and rejected with a clear notification.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* DYNAMIC SEO FOOTER */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
        Secure client-side PDF organizer: merge multiple files or extract pages into PDF and ZIP archives directly in your browser without external file uploads.
      </div>
    </div>
  );
}
