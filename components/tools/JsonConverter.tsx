'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import {
  UploadCloud,
  Trash2,
  FileJson,
  Table2,
  Download,
  Columns,
  CheckSquare,
  Square,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  Wand2,
  ShieldCheck,
  Clock,
  Eye,
  X,
  Copy,
  Check,
  Sliders,
  HelpCircle,
  Code2,
  FileCode,
  Sparkles,
} from 'lucide-react';
import {
  jsonToYaml,
  jsonToXml,
  jsonToCsv,
  jsonToTsv,
  jsonToJsonl,
  SAMPLE_DATASETS,
} from '@/lib/jsonConverterEngine';

type CellValue = string | number | boolean | null | undefined;

type FlattenOptions = {
  separator: string;
  arrayMode: 'json' | 'join' | 'indexed';
  maxDepth: number;
};

type ParseResult = {
  rows: Record<string, CellValue>[];
  columns: string[];
  totalCells: number;
  durationMs: number;
};

type SelectedCellInfo = {
  row: number;
  column: string;
  value: CellValue;
  type: string;
  length: number;
};

// Resource safety limits
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_ROOT_ROWS = 200_000;
const MAX_COLUMNS = 10_000;
const MAX_CELLS = 5_000_000; // 5 Million cells maximum
const MAX_PREVIEW_ROWS = 100;
const MAX_PREVIEW_COLS = 40;
const MAX_VISIBLE_COLUMN_CHIPS = 80;
const WORKER_THRESHOLD = 256 * 1024; // 256 KB triggers Web Worker

const DEFAULT_OPTIONS: FlattenOptions = {
  separator: '_',
  arrayMode: 'json',
  maxDepth: 20,
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Prototype pollution safe cell definition.
 * Uses Object.defineProperty on null-prototype objects.
 */
const defineCell = (
  target: Record<string, CellValue>,
  key: string,
  value: CellValue,
) => {
  Object.defineProperty(target, key, {
    value,
    enumerable: true,
    configurable: true,
    writable: true,
  });
};

/**
 * Format bytes into human-readable string.
 */
const formatBytes = (bytes: number): string => {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

/**
 * Sanitize user-provided export filename.
 * Removes path traversal, control chars, and invalid filesystem characters.
 */
const sanitizeFilename = (filename: string): string => {
  const cleaned = filename
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\.+/g, '.')
    .trim();
  return cleaned.slice(0, 80) || 'kivarotools_export';
};

/**
 * Spreadsheet formula injection protection.
 * Distinguishes genuine numeric values from formula payloads.
 * Protects =, +, -, @, tabs, returns, newlines, and fullwidth Unicode variants.
 */
const safeSpreadsheetValue = (
  value: CellValue,
): string | number | boolean => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number' || typeof value === 'boolean') return value;

  const str = String(value);

  // Check for leading formula triggers: =, +, -, @, tabs, returns, newlines, and fullwidth variants
  if (/^[\t\r\n=+\-@\uFF1D\uFF0B\uFF0D\uFF20]/.test(str)) {
    // If it starts with + or -, check if it is a genuine finite number
    if (/^[+-]/.test(str)) {
      const trimmed = str.trim();
      if (/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(trimmed) && !isNaN(Number(trimmed))) {
        return str; // Safe legitimate number string
      }
    }
    // Prefix unsafe formula string with apostrophe
    return `'${str}`;
  }

  return str;
};

/**
 * Flatten arrays into safe cell representation based on arrayMode.
 */
const stringifyArray = (
  value: unknown[],
  mode: FlattenOptions['arrayMode'],
): string | undefined => {
  if (mode === 'join') {
    return value
      .map((item) =>
        isPlainObject(item) || Array.isArray(item)
          ? JSON.stringify(item)
          : item === null || item === undefined
            ? ''
            : String(item),
      )
      .join(', ');
  }
  if (mode === 'indexed') return undefined;
  return JSON.stringify(value);
};

/**
 * Deterministically flattens nested objects with bounded recursion,
 * prototype-pollution protection, and key collision resolution.
 */
const flattenObject = (
  input: unknown,
  prefix = '',
  options: FlattenOptions = DEFAULT_OPTIONS,
  depth = 0,
): Record<string, CellValue> => {
  const result: Record<string, CellValue> = Object.create(null);
  const seenKeys = new Set<string>();

  const put = (candidateKey: string, value: CellValue) => {
    if (!candidateKey) return;

    // Key collision resolution: if key already exists in this row, suffix deterministically
    let finalKey = candidateKey;
    let collisionCount = 1;
    while (seenKeys.has(finalKey)) {
      collisionCount++;
      finalKey = `${candidateKey}_${collisionCount}`;
    }

    seenKeys.add(finalKey);
    defineCell(result, finalKey, value);
  };

  const walk = (value: unknown, key: string, level: number) => {
    if (level > options.maxDepth) {
      put(key, JSON.stringify(value));
      return;
    }

    if (value === null || value === undefined) {
      put(key, '');
      return;
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      put(key, value);
      return;
    }

    if (Array.isArray(value)) {
      if (options.arrayMode === 'indexed') {
        if (value.length === 0) {
          put(key, '[]');
          return;
        }

        value.forEach((item, index) => {
          const childKey = key
            ? `${key}${options.separator}${index}`
            : String(index);
          walk(item, childKey, level + 1);
        });
        return;
      }

      put(
        key,
        stringifyArray(value, options.arrayMode) ?? JSON.stringify(value),
      );
      return;
    }

    if (isPlainObject(value)) {
      const entries = Object.entries(value);

      if (entries.length === 0) {
        put(key, '{}');
        return;
      }

      entries.forEach(([child, childValue]) => {
        const childKey = key
          ? `${key}${options.separator}${child}`
          : child;
        walk(childValue, childKey, level + 1);
      });
    }
  };

  walk(input, prefix, depth);
  return result;
};

/**
 * Normalise any valid JSON root (object, array, primitive) into an array of records.
 */
const normaliseRoot = (parsed: unknown, options: FlattenOptions): Record<string, CellValue>[] => {
  if (Array.isArray(parsed)) {
    if (parsed.length === 0) return [];

    return parsed.map((item) => {
      if (isPlainObject(item) || Array.isArray(item)) {
        return flattenObject(item, '', options);
      }
      const row: Record<string, CellValue> = Object.create(null);
      defineCell(row, 'value', item as CellValue);
      return row;
    });
  }

  if (isPlainObject(parsed)) {
    return [flattenObject(parsed, '', options)];
  }

  // Primitive root (number, string, boolean, null)
  const row: Record<string, CellValue> = Object.create(null);
  defineCell(row, 'value', parsed as CellValue);
  return [row];
};

/**
 * Comprehensive parser with explicit resource budget enforcement.
 */
const parseJsonToTable = (
  text: string,
  options: FlattenOptions,
): ParseResult => {
  const startTime = performance.now();

  if (text.length > MAX_FILE_SIZE) {
    throw new Error(
      `Dataset exceeds the maximum allowed size of 50 MB (found ${formatBytes(text.length)}).`,
    );
  }

  const parsed = JSON.parse(text);

  if (Array.isArray(parsed) && parsed.length > MAX_ROOT_ROWS) {
    throw new Error(
      `JSON contains ${parsed.length.toLocaleString()} root rows, exceeding the safe limit of ${MAX_ROOT_ROWS.toLocaleString()} rows. Split the input into smaller batches.`,
    );
  }

  const rows = normaliseRoot(parsed, options);

  const columns: string[] = [];
  const seenColumns = new Set<string>();

  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!seenColumns.has(key)) {
        seenColumns.add(key);
        columns.push(key);

        if (columns.length > MAX_COLUMNS) {
          throw new Error(
            `The flattened dataset exceeds the safe limit of ${MAX_COLUMNS.toLocaleString()} columns (detected > ${MAX_COLUMNS.toLocaleString()}). Reduce nesting depth or select a different array mode.`,
          );
        }
      }
    }
  }

  const totalCells = rows.length * columns.length;
  if (totalCells > MAX_CELLS) {
    throw new Error(
      `Dataset exceeds the safe processing limit of ${MAX_CELLS.toLocaleString()} cells (estimated ${totalCells.toLocaleString()} cells across ${rows.length.toLocaleString()} rows and ${columns.length.toLocaleString()} columns). Reduce the JSON size or select a smaller dataset.`,
    );
  }

  const durationMs = Math.round(performance.now() - startTime);

  return {
    rows,
    columns,
    totalCells,
    durationMs,
  };
};

const normaliseOptions = (options: FlattenOptions): FlattenOptions => ({
  separator: options.separator || '_',
  arrayMode: options.arrayMode,
  maxDepth: Math.min(Math.max(options.maxDepth || 20, 1), 50),
});

/**
 * Enhanced syntax error locator with line, column, context, and visual caret.
 */
const formatSyntaxError = (error: unknown, source: string): string => {
  if (!(error instanceof Error)) return 'Invalid JSON structure.';

  const message = error.message;
  let line = 1;
  let column = 1;
  let position = -1;

  // Pattern 1: "... at position 123"
  const posMatch = message.match(/position\s+(\d+)/i);
  // Pattern 2: "... line 12 column 34"
  const lineColMatch = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);

  if (lineColMatch) {
    line = parseInt(lineColMatch[1], 10);
    column = parseInt(lineColMatch[2], 10);
  } else if (posMatch) {
    position = parseInt(posMatch[1], 10);
    const clampedPos = Math.min(position, source.length);
    const lines = source.slice(0, clampedPos).split('\n');
    line = lines.length;
    column = lines[lines.length - 1].length + 1;
  }

  const locationInfo = position >= 0
    ? `line ${line}, column ${column} (char ${position.toLocaleString()})`
    : `line ${line}, column ${column}`;

  // Extract snippet around the error line
  const allLines = source.split('\n');
  const errorLineIdx = Math.max(0, line - 1);
  const startIdx = Math.max(0, errorLineIdx - 1);
  const endIdx = Math.min(allLines.length - 1, errorLineIdx + 1);

  const snippetLines: string[] = [];
  for (let i = startIdx; i <= endIdx; i++) {
    const lineNum = String(i + 1).padStart(4, ' ');
    const isErrorLine = i === errorLineIdx;
    const prefix = isErrorLine ? '>' : ' ';
    snippetLines.push(`${prefix} ${lineNum} | ${allLines[i]}`);

    if (isErrorLine) {
      const caretIndent = ' '.repeat(7 + Math.max(0, column - 1));
      snippetLines.push(`${caretIndent}^`);
    }
  }

  const snippet = snippetLines.join('\n');
  return `JSON Syntax Error at ${locationInfo}:\n${message}\n\n${snippet}`;
};

/**
 * Web Worker generator code for non-blocking parsing of large JSON inputs.
 */
const WORKER_SCRIPT = String.raw`
  const MAX_ROOT_ROWS = 200000;
  const MAX_COLUMNS = 10000;
  const MAX_CELLS = 5000000;

  const isPlainObject = (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

  const defineCell = (target, key, value) => {
    Object.defineProperty(target, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  };

  const stringifyArray = (value, mode) => {
    if (mode === 'join') {
      return value
        .map((item) =>
          isPlainObject(item) || Array.isArray(item)
            ? JSON.stringify(item)
            : item === null || item === undefined
              ? ''
              : String(item)
        )
        .join(', ');
    }
    if (mode === 'indexed') return undefined;
    return JSON.stringify(value);
  };

  const flattenObject = (input, prefix, options, depth) => {
    const result = Object.create(null);
    const seenKeys = new Set();

    const put = (candidateKey, value) => {
      if (!candidateKey) return;
      let finalKey = candidateKey;
      let collisionCount = 1;
      while (seenKeys.has(finalKey)) {
        collisionCount++;
        finalKey = candidateKey + '_' + collisionCount;
      }
      seenKeys.add(finalKey);
      defineCell(result, finalKey, value);
    };

    const walk = (value, key, level) => {
      if (level > options.maxDepth) {
        put(key, JSON.stringify(value));
        return;
      }

      if (value === null || value === undefined) {
        put(key, '');
        return;
      }

      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        put(key, value);
        return;
      }

      if (Array.isArray(value)) {
        if (options.arrayMode === 'indexed') {
          if (value.length === 0) {
            put(key, '[]');
            return;
          }
          value.forEach((item, index) => {
            const childKey = key ? key + options.separator + index : String(index);
            walk(item, childKey, level + 1);
          });
          return;
        }

        put(key, stringifyArray(value, options.arrayMode) || JSON.stringify(value));
        return;
      }

      if (isPlainObject(value)) {
        const entries = Object.entries(value);
        if (entries.length === 0) {
          put(key, '{}');
          return;
        }
        entries.forEach(([child, childValue]) => {
          const childKey = key ? key + options.separator + child : child;
          walk(childValue, childKey, level + 1);
        });
      }
    };

    walk(input, prefix, depth);
    return result;
  };

  const normaliseRoot = (parsed, options) => {
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) return [];
      return parsed.map((item) => {
        if (isPlainObject(item) || Array.isArray(item)) {
          return flattenObject(item, '', options, 0);
        }
        const row = Object.create(null);
        defineCell(row, 'value', item);
        return row;
      });
    }

    if (isPlainObject(parsed)) {
      return [flattenObject(parsed, '', options, 0)];
    }

    const row = Object.create(null);
    defineCell(row, 'value', parsed);
    return [row];
  };

  self.onmessage = (event) => {
    const { source, options, requestId } = event.data;
    const startTime = performance.now();

    try {
      self.postMessage({ type: 'progress', state: 'Parsing JSON...', requestId });
      const parsed = JSON.parse(source);

      if (Array.isArray(parsed) && parsed.length > MAX_ROOT_ROWS) {
        throw new Error(
          'JSON contains ' + parsed.length.toLocaleString() + ' root rows, exceeding the safe limit of ' + MAX_ROOT_ROWS.toLocaleString() + ' rows.'
        );
      }

      self.postMessage({ type: 'progress', state: 'Flattening data structure...', requestId });
      const rows = normaliseRoot(parsed, options);

      self.postMessage({ type: 'progress', state: 'Extracting column headers...', requestId });
      const columns = [];
      const seenColumns = new Set();

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        for (const key of Object.keys(row)) {
          if (!seenColumns.has(key)) {
            seenColumns.add(key);
            columns.push(key);
            if (columns.length > MAX_COLUMNS) {
              throw new Error(
                'The flattened dataset exceeds the safe limit of ' + MAX_COLUMNS.toLocaleString() + ' columns.'
              );
            }
          }
        }
      }

      const totalCells = rows.length * columns.length;
      if (totalCells > MAX_CELLS) {
        throw new Error(
          'Dataset exceeds the safe processing limit of ' + MAX_CELLS.toLocaleString() + ' cells (found ' + totalCells.toLocaleString() + ').'
        );
      }

      const durationMs = Math.round(performance.now() - startTime);

      self.postMessage({
        type: 'done',
        ok: true,
        requestId,
        result: { rows, columns, totalCells, durationMs },
      });
    } catch (error) {
      self.postMessage({
        type: 'done',
        ok: false,
        requestId,
        error: error instanceof Error ? error.message : 'Invalid JSON input.',
      });
    }
  };
`;

const createParserWorker = (
  source: string,
  options: FlattenOptions,
  requestId: number,
  onProgress: (state: string) => void,
) => {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') {
    return null;
  }

  const blob = new Blob([WORKER_SCRIPT], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(blob);
  let worker: Worker;

  try {
    worker = new Worker(workerUrl);
  } catch (error) {
    URL.revokeObjectURL(workerUrl);
    throw error;
  }

  let disposed = false;
  let settled = false;
  let pendingReject: ((reason?: unknown) => void) | null = null;

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    worker.onmessage = null;
    worker.onerror = null;
    worker.onmessageerror = null;
    worker.terminate();
    URL.revokeObjectURL(workerUrl);

    if (!settled && pendingReject) {
      settled = true;
      pendingReject(new Error('Background JSON parsing was cancelled.'));
      pendingReject = null;
    }
  };

  return {
    worker,
    dispose,
    start: () =>
      new Promise<ParseResult>((resolve, reject) => {
        if (disposed) {
          reject(new Error('Background JSON parsing was cancelled.'));
          return;
        }

        pendingReject = reject;

        worker.onmessage = (event) => {
          if (event.data?.requestId !== requestId) return;

          if (event.data?.type === 'progress') {
            onProgress(event.data.state);
            return;
          }

          if (event.data?.type === 'done') {
            settled = true;
            pendingReject = null;
            if (event.data.ok) {
              resolve(event.data.result as ParseResult);
            } else {
              reject(new Error(event.data.error || 'Parsing failed.'));
            }
          }
        };

        worker.onerror = () => {
          if (settled || disposed) return;
          settled = true;
          pendingReject = null;
          reject(new Error('Background JSON parser stopped unexpectedly.'));
        };

        worker.postMessage({
          source,
          options: normaliseOptions(options),
          requestId,
        });
      }),
  };
};

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = sanitizeFilename(filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
};

export default function JsonConverter() {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, CellValue>[]>([]);
  const [allColumns, setAllColumns] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [columnSearch, setColumnSearch] = useState('');
  const [separator, setSeparator] = useState('_');
  const [arrayMode, setArrayMode] = useState<FlattenOptions['arrayMode']>('json');
  const [maxDepth, setMaxDepth] = useState<number>(20);
  const [baseFilename, setBaseFilename] = useState('kivarotools_export');
  const [importedFileInfo, setImportedFileInfo] = useState<{ name: string; size: number } | null>(null);

  // Status & Progress
  const [parseStatus, setParseStatus] = useState<string>('Ready');
  const [isProcessing, setIsProcessing] = useState(false);
  const [metrics, setMetrics] = useState<{
    cells: number;
    durationMs: number;
  }>({ cells: 0, durationMs: 0 });

  // Value Inspector state
  const [selectedCell, setSelectedCell] = useState<SelectedCellInfo | null>(null);
  const [cellCopied, setCellCopied] = useState(false);
  const [showRulesHelp, setShowRulesHelp] = useState(false);

  // Tab & Format states
  const [outputViewTab, setOutputViewTab] = useState<'table' | 'code'>('table');
  const [codeFormat, setCodeFormat] = useState<'yaml' | 'xml' | 'csv' | 'tsv' | 'jsonl'>('yaml');
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'input' | 'output'>('input');
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const parserTaskRef = useRef<{ dispose: () => void } | null>(null);
  const parseRequestRef = useRef(0);

  const options = useMemo<FlattenOptions>(
    () => ({
      separator,
      arrayMode,
      maxDepth,
    }),
    [separator, arrayMode, maxDepth],
  );

  // Handle parsing changes
  useEffect(() => {
    const requestId = ++parseRequestRef.current;

    if (!input.trim()) {
      parserTaskRef.current?.dispose();
      parserTaskRef.current = null;
      queueMicrotask(() => {
        if (requestId !== parseRequestRef.current) return;
        setParsedData([]);
        setAllColumns([]);
        setVisibleColumns(new Set());
        setError(null);
        setIsProcessing(false);
        setParseStatus('Ready');
        setMetrics({ cells: 0, durationMs: 0 });
        setSelectedCell(null);
      });
      return;
    }

    const run = async () => {
      setIsProcessing(true);
      setParseStatus('Analyzing input...');
      const normalizedOptions = normaliseOptions(options);

      // Fast-path synchronous execution for smaller JSON inputs
      if (input.length < WORKER_THRESHOLD) {
        try {
          const result = parseJsonToTable(input, normalizedOptions);
          if (requestId !== parseRequestRef.current) return;

          setParsedData(result.rows);
          setAllColumns(result.columns);
          setMetrics({ cells: result.totalCells, durationMs: result.durationMs });

          setVisibleColumns((prev) => {
            const next = new Set<string>();
            result.columns.forEach((col) => {
              if (prev.size === 0 || prev.has(col)) {
                next.add(col);
              }
            });
            if (next.size === 0 && result.columns.length > 0) {
              result.columns.forEach((col) => next.add(col));
            }
            return next;
          });

          setError(null);
          setIsProcessing(false);
          setParseStatus('Ready');
        } catch (err) {
          if (requestId !== parseRequestRef.current) return;
          setParsedData([]);
          setAllColumns([]);
          setVisibleColumns(new Set());
          setSelectedCell(null);
          setError(formatSyntaxError(err, input));
          setIsProcessing(false);
          setParseStatus('Failed');
        }
        return;
      }

      // Background Web Worker parsing for larger JSON documents
      parserTaskRef.current?.dispose();
      parserTaskRef.current = null;

      const task = createParserWorker(
        input,
        normalizedOptions,
        requestId,
        (progressState) => {
          if (requestId === parseRequestRef.current) {
            setParseStatus(progressState);
          }
        },
      );

      if (!task) {
        // Fallback synchronous parse if Web Worker creation is unavailable
        try {
          const result = parseJsonToTable(input, normalizedOptions);
          if (requestId !== parseRequestRef.current) return;
          setParsedData(result.rows);
          setAllColumns(result.columns);
          setMetrics({ cells: result.totalCells, durationMs: result.durationMs });
          setVisibleColumns(new Set(result.columns));
          setError(null);
          setIsProcessing(false);
          setParseStatus('Ready');
        } catch (err) {
          if (requestId !== parseRequestRef.current) return;
          setParsedData([]);
          setAllColumns([]);
          setVisibleColumns(new Set());
          setSelectedCell(null);
          setError(formatSyntaxError(err, input));
          setIsProcessing(false);
          setParseStatus('Failed');
        }
        return;
      }

      parserTaskRef.current = task;

      try {
        const result = await task.start();
        if (requestId !== parseRequestRef.current) return;

        setParsedData(result.rows);
        setAllColumns(result.columns);
        setMetrics({ cells: result.totalCells, durationMs: result.durationMs });

        setVisibleColumns((prev) => {
          const next = new Set<string>();
          result.columns.forEach((col) => {
            if (prev.size === 0 || prev.has(col)) {
              next.add(col);
            }
          });
          if (next.size === 0 && result.columns.length > 0) {
            result.columns.forEach((col) => next.add(col));
          }
          return next;
        });

        setError(null);
        setIsProcessing(false);
        setParseStatus('Ready');
      } catch (err) {
        if (requestId !== parseRequestRef.current) return;
        setParsedData([]);
        setAllColumns([]);
        setVisibleColumns(new Set());
        setSelectedCell(null);
        const errMsg = err instanceof Error ? err.message : 'Invalid JSON input.';
        setError(formatSyntaxError(new Error(errMsg), input));
        setIsProcessing(false);
        setParseStatus('Failed');
      } finally {
        task.dispose();
        if (parserTaskRef.current === task) {
          parserTaskRef.current = null;
        }
      }
    };

    void run();

    return () => {
      parserTaskRef.current?.dispose();
      parserTaskRef.current = null;
    };
  }, [input, options]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      parserTaskRef.current?.dispose();
      parserTaskRef.current = null;
    };
  }, []);

  const handleCancel = () => {
    parseRequestRef.current++;
    parserTaskRef.current?.dispose();
    parserTaskRef.current = null;
    setIsProcessing(false);
    setParseStatus('Cancelled');
  };

  const filteredColumns = useMemo(
    () =>
      allColumns.filter((column) =>
        column.toLowerCase().includes(columnSearch.trim().toLowerCase()),
      ),
    [allColumns, columnSearch],
  );

  const displayedColumnChips = useMemo(
    () => filteredColumns.slice(0, MAX_VISIBLE_COLUMN_CHIPS),
    [filteredColumns],
  );

  const visibleColumnList = useMemo(
    () => allColumns.filter((column) => visibleColumns.has(column)),
    [allColumns, visibleColumns],
  );

  const previewColumns = useMemo(
    () => visibleColumnList.slice(0, MAX_PREVIEW_COLS),
    [visibleColumnList],
  );

  const previewRows = useMemo(
    () => parsedData.slice(0, MAX_PREVIEW_ROWS),
    [parsedData],
  );

  const toggleColumn = (col: string) => {
    setVisibleColumns((previous) => {
      const next = new Set(previous);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      return next;
    });
  };

  const selectFiltered = (selected: boolean) => {
    setVisibleColumns((previous) => {
      const next = new Set(previous);
      filteredColumns.forEach((column) => {
        if (selected) next.add(column);
        else next.delete(column);
      });
      return next;
    });
  };

  const invertFiltered = () => {
    setVisibleColumns((previous) => {
      const next = new Set(previous);
      filteredColumns.forEach((column) => {
        if (next.has(column)) next.delete(column);
        else next.add(column);
      });
      return next;
    });
  };

  const handleFormat = () => {
    try {
      if (input.trim()) {
        setInput(JSON.stringify(JSON.parse(input), null, 2));
      }
    } catch {
      // Syntax error is already displayed in live feedback
    }
  };

  const handleMinify = () => {
    try {
      if (input.trim()) {
        setInput(JSON.stringify(JSON.parse(input)));
      }
    } catch {
      // Syntax error is already displayed in live feedback
    }
  };

  const handleClear = () => {
    parseRequestRef.current++;
    parserTaskRef.current?.dispose();
    parserTaskRef.current = null;
    setInput('');
    setColumnSearch('');
    setError(null);
    setParsedData([]);
    setAllColumns([]);
    setVisibleColumns(new Set());
    setImportedFileInfo(null);
    setSelectedCell(null);
    setIsProcessing(false);
    setParseStatus('Ready');
    setMetrics({ cells: 0, durationMs: 0 });
    setAriaAnnouncement('Editor cleared.');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const showToast = (message: string) => {
    setCopyToast(message);
    window.setTimeout(() => setCopyToast(null), 2500);
  };

  const loadSample = (sampleKey: 'users' | 'ecommerce' | 'geo') => {
    const data = SAMPLE_DATASETS[sampleKey];
    if (data) {
      setInput(data);
      setBaseFilename(`kivarotools_${sampleKey}`);
      setImportedFileInfo(null);
      const label = sampleKey === 'users' ? 'Users (Nested)' : sampleKey === 'ecommerce' ? 'E-Commerce' : 'Geo Coordinates';
      setAriaAnnouncement(`Loaded sample dataset: ${label}`);
      showToast(`Loaded ${label} sample`);
    }
  };

  const processFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json' && file.type !== '') {
      setError('Please select a valid .json file.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File (${formatBytes(file.size)}) exceeds the 50 MB browser-processing limit.`);
      return;
    }

    setParseStatus('Reading file...');
    setIsProcessing(true);

    const reader = new FileReader();

    reader.onload = (event) => {
      const text = String(event.target?.result ?? '');
      setImportedFileInfo({ name: file.name, size: file.size });
      setBaseFilename(file.name.replace(/\.json$/i, '') || 'kivarotools_export');
      setInput(text);
    };

    reader.onerror = () => {
      setError('Failed to read file.');
      setIsProcessing(false);
      setParseStatus('Failed');
    };

    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const selectCellForInspection = (
    rowIdx: number,
    col: string,
    val: CellValue,
  ) => {
    let type: string = typeof val;
    if (val === null) type = 'null';
    else if (val === undefined) type = 'undefined';

    setSelectedCell({
      row: rowIdx,
      column: col,
      value: val,
      type,
      length: val === null || val === undefined ? 0 : String(val).length,
    });
    setCellCopied(false);
  };

  const copyCellValue = async () => {
    if (!selectedCell) return;
    const str = selectedCell.value === null || selectedCell.value === undefined
      ? ''
      : String(selectedCell.value);

    try {
      await navigator.clipboard.writeText(str);
      setCellCopied(true);
      window.setTimeout(() => setCellCopied(false), 1500);
    } catch {
      setCellCopied(false);
    }
  };

  // Build clean export row structures for selected columns with formula-injection protection
  const getExportData = useCallback(
    () =>
      parsedData.map((row) => {
        const exportRow: Record<string, string | number | boolean> = {};
        visibleColumnList.forEach((column) => {
          exportRow[column] = safeSpreadsheetValue(row[column]);
        });
        return exportRow;
      }),
    [parsedData, visibleColumnList],
  );

  // 1. CSV Export (RFC 4180 compliant with UTF-8 BOM)
  const exportCSV = () => {
    const data = getExportData();
    if (!data.length || !visibleColumnList.length) return;

    const escapeCsvField = (val: string | number | boolean): string => {
      const str = String(val);
      if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headerLine = visibleColumnList.map(escapeCsvField).join(',');
    const rowsLines = data.map((row) =>
      visibleColumnList.map((col) => escapeCsvField(row[col] ?? '')).join(','),
    );

    const csvContent = '\uFEFF' + [headerLine, ...rowsLines].join('\r\n');
    triggerDownload(
      new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }),
      `${baseFilename}.csv`,
    );
  };

  // 2. TSV Export (Tab-separated with UTF-8 BOM)
  const exportTSV = () => {
    const data = getExportData();
    if (!data.length || !visibleColumnList.length) return;

    const escapeTsvField = (val: string | number | boolean): string => {
      const str = String(val);
      if (str.includes('\t') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headerLine = visibleColumnList.map(escapeTsvField).join('\t');
    const rowsLines = data.map((row) =>
      visibleColumnList.map((col) => escapeTsvField(row[col] ?? '')).join('\t'),
    );

    const tsvContent = '\uFEFF' + [headerLine, ...rowsLines].join('\r\n');
    triggerDownload(
      new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' }),
      `${baseFilename}.tsv`,
    );
  };

  // 3. XLSX Export with auto-filter, column widths, freeze pane & fallback
  const exportExcel = async () => {
    const data = getExportData();
    if (!data.length || !visibleColumnList.length) return;

    // Excel worksheet boundary validation
    if (data.length > 1_048_576) {
      setError(
        `Excel limits a worksheet to 1,048,576 rows (dataset has ${data.length.toLocaleString()}). Use CSV or JSONL for large datasets.`,
      );
      return;
    }

    if (visibleColumnList.length > 16_384) {
      setError(
        `Excel limits a worksheet to 16,384 columns (dataset has ${visibleColumnList.length.toLocaleString()}). Deselect columns to proceed.`,
      );
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data, {
      header: visibleColumnList,
    });

    worksheet['!autofilter'] = {
      ref: XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: {
          r: data.length,
          c: Math.max(visibleColumnList.length - 1, 0),
        },
      }),
    };

    worksheet['!cols'] = visibleColumnList.map((column) => {
      const sample = data.slice(0, 300);
      let longest = column.length;
      for (const row of sample) {
        const len = String(row[column] ?? '').length;
        if (len > longest) longest = len;
      }
      return { wch: Math.min(Math.max(longest + 2, 10), 45) };
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    try {
      const xlsxBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      const zip = await JSZip.loadAsync(xlsxBuffer);
      const sheetPath = 'xl/worksheets/sheet1.xml';
      const sheetFile = zip.file(sheetPath);

      if (sheetFile) {
        let sheetXml = await sheetFile.async('string');
        const freezeXml =
          '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView></sheetViews>';

        if (/<sheetViews[\s\S]*?<\/sheetViews>/.test(sheetXml)) {
          sheetXml = sheetXml.replace(
            /<sheetViews[\s\S]*?<\/sheetViews>/,
            freezeXml,
          );
        } else {
          sheetXml = sheetXml.replace('<sheetData>', `${freezeXml}<sheetData>`);
        }

        zip.file(sheetPath, sheetXml);

        const patchedBlob = await zip.generateAsync({
          type: 'blob',
          mimeType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 },
        });

        // Verify readable structure before delivering to user
        const testBuf = await patchedBlob.arrayBuffer();
        XLSX.read(testBuf, { type: 'array' });

        triggerDownload(patchedBlob, `${baseFilename}.xlsx`);
        return;
      }
    } catch {
      // Safe fallback if JSZip or OOXML patch encounters unexpected structure
    }

    // Fallback standard SheetJS export
    XLSX.writeFile(workbook, `${sanitizeFilename(baseFilename)}.xlsx`);
  };

  // 4. JSONL Export
  const exportJSONL = () => {
    const data = getExportData();
    if (!data.length) return;

    const content = data.map((row) => JSON.stringify(row)).join('\n');
    triggerDownload(
      new Blob([content], { type: 'application/x-ndjson;charset=utf-8;' }),
      `${baseFilename}.jsonl`,
    );
  };

  // 5. Flattened JSON Export
  const exportFlattenedJSON = () => {
    const data = getExportData();
    if (!data.length) return;

    triggerDownload(
      new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json;charset=utf-8;',
      }),
      `${baseFilename}.json`,
    );
  };

  // 6. Secure HTML Export with complete entity escaping
  const exportHTML = () => {
    const data = getExportData();
    if (!data.length || !visibleColumnList.length) return;

    const escapeHtml = (val: unknown) =>
      String(val ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

    const head = visibleColumnList
      .map((column) => `<th>${escapeHtml(column)}</th>`)
      .join('');

    const body = data
      .map(
        (row) =>
          `<tr>${visibleColumnList
            .map((column) => `<td>${escapeHtml(row[column])}</td>`)
            .join('')}</tr>`,
      )
      .join('');

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(baseFilename)}</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; padding: 24px; background: #f8fafc; color: #0f172a; margin: 0; }
.container { max-width: 100%; overflow-x: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
table { border-collapse: collapse; width: 100%; font-size: 14px; text-align: left; }
th, td { border-bottom: 1px solid #e2e8f0; padding: 10px 14px; white-space: nowrap; max-width: 320px; overflow: hidden; text-overflow: ellipsis; }
th { background: #f1f5f9; color: #334155; font-weight: 600; position: sticky; top: 0; }
tr:hover td { background: #f8fafc; }
.header { margin-bottom: 16px; }
.header h1 { margin: 0 0 4px 0; font-size: 20px; color: #1e293b; }
.header p { margin: 0; font-size: 13px; color: #64748b; }
</style>
</head>
<body>
<div class="header">
  <h1>${escapeHtml(baseFilename)}</h1>
  <p>Exported from KivaroTools JSON Converter • ${data.length.toLocaleString()} rows • ${visibleColumnList.length.toLocaleString()} columns</p>
</div>
<div class="container">
  <table>
    <thead><tr>${head}</tr></thead>
    <tbody>${body}</tbody>
  </table>
</div>
</body>
</html>`;

    triggerDownload(
      new Blob([html], { type: 'text/html;charset=utf-8;' }),
      `${baseFilename}.html`,
    );
  };

  const copySummary = async () => {
    const summary = [
      'KivaroTools JSON Dataset Summary',
      '==============================',
      `Rows: ${parsedData.length.toLocaleString()}`,
      `Total Columns: ${allColumns.length.toLocaleString()}`,
      `Selected Columns: ${visibleColumns.size.toLocaleString()}`,
      `Total Cells: ${metrics.cells.toLocaleString()}`,
      `Flatten Depth: ${maxDepth}`,
      `Array Mode: ${arrayMode}`,
      `Separator: "${separator}"`,
      `Processing Time: ${metrics.durationMs} ms`,
      `Client Privacy: 100% In-Browser Local Processing`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      showToast('Dataset summary copied');
      setAriaAnnouncement('Dataset summary copied to clipboard.');
    } catch {
      // ignore
    }
  };

  // 7. YAML Export
  const exportYAML = () => {
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      const yamlContent = jsonToYaml(parsed);
      triggerDownload(
        new Blob([yamlContent], { type: 'text/yaml;charset=utf-8;' }),
        `${baseFilename}.yaml`,
      );
      setAriaAnnouncement('YAML export downloaded.');
      showToast('YAML file downloaded');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate YAML export.');
    }
  };

  // 8. XML Export
  const exportXML = () => {
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      const xmlContent = jsonToXml(parsed);
      triggerDownload(
        new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' }),
        `${baseFilename}.xml`,
      );
      setAriaAnnouncement('XML export downloaded.');
      showToast('XML file downloaded');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate XML export.');
    }
  };

  // Quick Copy for all supported formats
  const copyFormat = async (format: 'yaml' | 'xml' | 'csv' | 'tsv' | 'jsonl') => {
    try {
      if (!input.trim()) return;
      let textToCopy = '';
      if (format === 'yaml') {
        textToCopy = jsonToYaml(JSON.parse(input));
      } else if (format === 'xml') {
        textToCopy = jsonToXml(JSON.parse(input));
      } else {
        const data = getExportData();
        if (format === 'csv') {
          textToCopy = jsonToCsv(data, visibleColumnList);
        } else if (format === 'tsv') {
          textToCopy = jsonToTsv(data, visibleColumnList);
        } else if (format === 'jsonl') {
          textToCopy = jsonToJsonl(data);
        }
      }

      await navigator.clipboard.writeText(textToCopy);
      showToast(`${format.toUpperCase()} copied to clipboard!`);
      setAriaAnnouncement(`${format.toUpperCase()} copied to clipboard.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to copy ${format.toUpperCase()}.`);
    }
  };

  // Real-time converted code preview
  const codePreviewContent = useMemo(() => {
    if (!input.trim() || error) return '';
    try {
      const parsed = JSON.parse(input);
      switch (codeFormat) {
        case 'yaml':
          return jsonToYaml(parsed);
        case 'xml':
          return jsonToXml(parsed);
        case 'csv': {
          const data = getExportData();
          return jsonToCsv(data, visibleColumnList);
        }
        case 'tsv': {
          const data = getExportData();
          return jsonToTsv(data, visibleColumnList);
        }
        case 'jsonl': {
          const data = getExportData();
          return jsonToJsonl(data);
        }
        default:
          return '';
      }
    } catch {
      return '';
    }
  }, [input, error, codeFormat, getExportData, visibleColumnList]);

  const canExport = parsedData.length > 0 && visibleColumns.size > 0 && !isProcessing;

  return (
    <div className="flex flex-col gap-6 bg-gray-50 dark:bg-[#0B1120] transition-colors -m-6 md:-m-8 p-6 md:p-8 rounded-3xl min-h-screen">
      {/* Mobile Workflow Switcher */}
      <div className="flex lg:hidden rounded-2xl bg-gray-200 dark:bg-slate-800 p-1">
        <button
          type="button"
          onClick={() => setMobileTab('input')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            mobileTab === 'input'
              ? 'bg-white dark:bg-[#111827] text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          1. Input &amp; Options
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('output')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            mobileTab === 'output'
              ? 'bg-white dark:bg-[#111827] text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          2. Preview &amp; Export ({parsedData.length} rows)
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT COLUMN: Data Source & Options */}
        <div
          className={`flex-grow flex-col gap-4 lg:w-1/3 xl:w-2/5 ${
            mobileTab === 'input' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FileJson className="w-5 h-5 text-blue-600 dark:text-blue-500" />
              JSON Data Source
            </h2>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% In-Browser</span>
            </div>
          </div>

          {/* Sample Dataset Quick-Loaders */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-[#111827] p-2.5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Load Sample:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => loadSample('users')}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Users (Nested)
              </button>
              <button
                type="button"
                onClick={() => loadSample('ecommerce')}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                E-Commerce
              </button>
              <button
                type="button"
                onClick={() => loadSample('geo')}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Geo Data
              </button>
            </div>
          </div>

        {/* Upload Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Upload JSON file"
          className={`h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-[0_0_20px_rgba(37,99,235,0.15)]'
              : 'border-gray-300 dark:border-slate-700 bg-white dark:bg-[#111827] hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-slate-800'
          }`}
        >
          <UploadCloud className="w-8 h-8 text-blue-600 dark:text-blue-500 mb-2" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Drag & Drop .json file
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-500">
            or click to browse local filesystem (up to 50 MB)
          </p>
          <input
            type="file"
            accept=".json,application/json"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files?.[0]) processFile(e.target.files[0]);
            }}
            className="hidden"
          />
        </div>

        {importedFileInfo && (
          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 px-3.5 py-2 rounded-xl text-xs">
            <span className="font-semibold text-blue-800 dark:text-blue-300 truncate max-w-[200px]">
              📁 {importedFileInfo.name}
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-mono">
              {formatBytes(importedFileInfo.size)}
            </span>
          </div>
        )}

        {/* Editor Actions */}
        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-[#111827] p-2 rounded-xl border border-gray-200 dark:border-slate-800 shrink-0">
          <button
            onClick={handleFormat}
            disabled={!input.trim() || isProcessing}
            aria-label="Format JSON"
            className="flex-1 min-w-[100px] flex justify-center items-center gap-1.5 px-3 py-2 bg-gray-50 dark:bg-[#0a0f1a] text-slate-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-semibold disabled:opacity-50"
          >
            <Wand2 className="w-4 h-4" /> Format
          </button>
          <button
            onClick={handleMinify}
            disabled={!input.trim() || isProcessing}
            aria-label="Minify JSON"
            className="flex-1 min-w-[100px] flex justify-center items-center gap-1.5 px-3 py-2 bg-gray-50 dark:bg-[#0a0f1a] text-slate-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-semibold disabled:opacity-50"
          >
            Minify
          </button>
          <button
            onClick={handleClear}
            disabled={!input && !error && parsedData.length === 0}
            aria-label="Clear JSON input"
            className="flex-1 min-w-[100px] flex justify-center items-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-sm font-semibold disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" /> Clear
          </button>
        </div>

        {/* Flattening Options Card */}
        <div className="bg-white dark:bg-[#111827] p-3.5 rounded-2xl border border-gray-200 dark:border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-500" />
              Flattening Engine Options
            </span>
            <button
              onClick={() => setShowRulesHelp(!showRulesHelp)}
              aria-label="View flattening rules"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3" />
              {showRulesHelp ? 'Hide Rules' : 'Rules'}
            </button>
          </div>

          {showRulesHelp && (
            <div className="text-xs text-slate-600 dark:text-slate-400 bg-gray-50 dark:bg-[#0a0f1a] p-3 rounded-xl border border-gray-200 dark:border-slate-800 space-y-1.5">
              <p>
                <strong>Separator:</strong> Used to join nested keys (e.g. <code>user{separator}address</code>).
              </p>
              <p>
                <strong>Array Modes:</strong>
                <br />• <em>JSON:</em> Serializes array as JSON string.
                <br />• <em>Join:</em> Joins primitive items with comma.
                <br />• <em>Indexed:</em> Expands elements into columns (e.g. <code>tags{separator}0</code>).
              </p>
              <p>
                <strong>Key Collisions:</strong> If keys collide after flattening, they are preserved with a <code>_2</code> suffix to guarantee zero data loss.
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Separator
              <input
                value={separator}
                maxLength={4}
                onChange={(e) => setSeparator(e.target.value)}
                className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#0a0f1a] text-sm text-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="_"
              />
            </label>

            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Array Mode
              <select
                value={arrayMode}
                onChange={(e) =>
                  setArrayMode(e.target.value as FlattenOptions['arrayMode'])
                }
                className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#0a0f1a] text-sm text-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="json">JSON String</option>
                <option value="join">Join Values</option>
                <option value="indexed">Indexed Keys</option>
              </select>
            </label>

            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Max Depth
              <input
                type="number"
                min={1}
                max={50}
                value={maxDepth}
                onChange={(e) => setMaxDepth(Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 20)))}
                className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#0a0f1a] text-sm text-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </label>
          </div>
        </div>

        {/* Raw JSON Input Textarea */}
        <div className="relative flex-grow flex flex-col">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={'Paste raw JSON here...\n[\n  {\n    "id": 101,\n    "user": { "name": "Ali", "city": "Multan" },\n    "roles": ["developer", "admin"]\n  }\n]'}
            className="w-full flex-grow min-h-[300px] p-4 bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800 dark:text-slate-300 font-mono text-sm tracking-tight resize-none shadow-inner transition-all [scrollbar-width:thin]"
            spellCheck={false}
            aria-label="Raw JSON Input"
          />

          {isProcessing && (
            <div className="absolute inset-0 bg-white/70 dark:bg-[#111827]/70 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3 z-10">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                <Clock className="w-4 h-4 animate-spin" />
                <span>{parseStatus}</span>
              </div>
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 text-xs font-bold rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-200"
              >
                Cancel Parse
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Column Manager, Live Grid, Value Inspector, Exports */}
      <div
        className={`flex-col gap-6 lg:w-2/3 xl:w-3/5 ${
          mobileTab === 'output' ? 'flex' : 'hidden lg:flex'
        }`}
      >
        {/* Dataset Insights & Status Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-[#111827] p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Rows</span>
            <span className="text-lg font-bold text-slate-800 dark:text-white">
              {parsedData.length.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Columns</span>
            <span className="text-lg font-bold text-slate-800 dark:text-white">
              {visibleColumns.size} / {allColumns.length}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Cells</span>
            <span className="text-lg font-bold text-slate-800 dark:text-white">
              {metrics.cells.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Processing Time</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.durationMs > 0 ? `${metrics.durationMs} ms` : '—'}
            </span>
          </div>
        </div>

        {/* Column Manager */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-5 md:p-6 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-gray-200 dark:border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Columns className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
              Column Manager
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-lg">
                {visibleColumns.size} of {allColumns.length} selected
              </span>
            </div>
          </div>

          {allColumns.length > 0 ? (
            <>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={columnSearch}
                  onChange={(e) => setColumnSearch(e.target.value)}
                  placeholder="Search columns by name..."
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#0a0f1a] text-sm text-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  aria-label="Filter columns"
                />
                <button
                  onClick={() => selectFiltered(true)}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-blue-500"
                >
                  All
                </button>
                <button
                  onClick={() => selectFiltered(false)}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-blue-500"
                >
                  None
                </button>
                <button
                  onClick={invertFiltered}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-blue-500"
                >
                  Invert
                </button>
              </div>

              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-2 [scrollbar-width:thin]">
                {displayedColumnChips.map((col) => {
                  const isVisible = visibleColumns.has(col);

                  return (
                    <button
                      key={col}
                      onClick={() => toggleColumn(col)}
                      aria-pressed={isVisible}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isVisible
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50'
                          : 'bg-gray-50 dark:bg-[#0a0f1a] text-slate-500 border-gray-200 dark:border-slate-800 hover:text-slate-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {isVisible ? (
                        <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span className="truncate max-w-[180px]">{col}</span>
                    </button>
                  );
                })}
                {filteredColumns.length > MAX_VISIBLE_COLUMN_CHIPS && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 self-center italic px-2">
                    +{filteredColumns.length - MAX_VISIBLE_COLUMN_CHIPS} more matching columns. Use search to refine.
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500 dark:text-slate-500 py-2">
              No data loaded yet. Paste JSON or upload a .json file to manage columns.
            </div>
          )}
        </div>

        {/* Live Data Grid */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-5 md:p-6 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col flex-grow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 dark:border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOutputViewTab('table')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all ${
                  outputViewTab === 'table'
                    ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.3)]'
                    : 'bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Table2 className="w-4 h-4" /> Tabular Grid
              </button>
              <button
                type="button"
                onClick={() => setOutputViewTab('code')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all ${
                  outputViewTab === 'code'
                    ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.3)]'
                    : 'bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Code2 className="w-4 h-4" /> Code Preview ({codeFormat.toUpperCase()})
              </button>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-lg">
                {parsedData.length.toLocaleString()} Total Rows
              </span>
              {parsedData.length > MAX_PREVIEW_ROWS && outputViewTab === 'table' && (
                <span className="bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-lg">
                  Preview: first {MAX_PREVIEW_ROWS} rows
                </span>
              )}
              {visibleColumnList.length > MAX_PREVIEW_COLS && outputViewTab === 'table' && (
                <span className="bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-lg">
                  Preview: first {MAX_PREVIEW_COLS} cols
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 p-4 rounded-xl text-sm mb-4 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <pre className="font-mono text-xs whitespace-pre-wrap break-all overflow-x-auto max-h-48 leading-relaxed">
                {error}
              </pre>
            </div>
          )}

          {outputViewTab === 'code' ? (
            <div className="flex flex-col gap-3 flex-grow">
              {/* Code Format Selector Pills and Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 dark:bg-[#0a0f1a] p-2.5 rounded-2xl border border-gray-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {(['yaml', 'xml', 'csv', 'tsv', 'jsonl'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      data-format-pill={fmt}
                      onClick={() => setCodeFormat(fmt)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-colors ${
                        codeFormat === fmt
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-400 hover:text-blue-600 border border-gray-200 dark:border-slate-700'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyFormat(codeFormat)}
                    disabled={!codePreviewContent}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:border-blue-500 disabled:opacity-50"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy {codeFormat.toUpperCase()}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (codeFormat === 'yaml') exportYAML();
                      else if (codeFormat === 'xml') exportXML();
                      else if (codeFormat === 'csv') exportCSV();
                      else if (codeFormat === 'tsv') exportTSV();
                      else if (codeFormat === 'jsonl') exportJSONL();
                    }}
                    disabled={!codePreviewContent}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              </div>

              {/* Monospace Code Preview Box */}
              <div className="relative flex-grow min-h-[320px] max-h-[500px] overflow-auto rounded-xl border border-gray-200 dark:border-slate-800 bg-[#0f172a] text-slate-100 p-4 font-mono text-xs leading-relaxed [scrollbar-width:thin]">
                {codePreviewContent ? (
                  <pre className="whitespace-pre overflow-x-auto selection:bg-blue-500/30">
                    <code>{codePreviewContent}</code>
                  </pre>
                ) : (
                  <div className="h-full min-h-[220px] flex items-center justify-center text-slate-500 text-sm">
                    {error ? 'Fix JSON syntax error on the left to preview output.' : 'Enter valid JSON to preview transformed code.'}
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 px-1">
                <span>Format: {codeFormat.toUpperCase()}</span>
                <span>{codePreviewContent.length.toLocaleString()} characters • {codePreviewContent ? codePreviewContent.split('\n').length.toLocaleString() : 0} lines</span>
              </div>
            </div>
          ) : (
            <>
              {/* Table Container */}
              <div className="flex-grow overflow-auto max-h-[460px] border border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50 dark:bg-[#0a0f1a] [scrollbar-width:thin]">
                {parsedData.length > 0 && visibleColumnList.length > 0 ? (
                  <table className="w-full text-left border-collapse whitespace-nowrap text-sm">
                    <thead className="sticky top-0 bg-gray-100 dark:bg-slate-800 z-10 shadow-sm">
                      <tr>
                        <th className="p-3 font-mono text-xs text-slate-400 dark:text-slate-500 border-b border-gray-200 dark:border-slate-700 w-12 text-center">
                          #
                        </th>
                        {previewColumns.map((col) => (
                          <th
                            key={col}
                            className="p-3 font-semibold text-slate-700 dark:text-slate-300 border-b border-gray-200 dark:border-slate-700"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-800 font-mono text-xs">
                      {previewRows.map((row, i) => (
                        <tr
                          key={i}
                          className="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors"
                        >
                          <td className="p-2.5 text-slate-400 dark:text-slate-600 border-r border-gray-200 dark:border-slate-800 text-center font-mono select-none">
                            {i + 1}
                          </td>
                          {previewColumns.map((col) => {
                            const val = row[col];
                            const isSelected =
                              selectedCell?.row === i && selectedCell?.column === col;

                            return (
                              <td
                                key={col}
                                onClick={() => selectCellForInspection(i, col, val)}
                                tabIndex={0}
                                role="button"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    selectCellForInspection(i, col, val);
                                  }
                                }}
                                className={`p-2.5 max-w-[260px] truncate cursor-pointer transition-colors focus:outline-none ${
                                  isSelected
                                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-200 font-bold ring-2 ring-blue-500'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
                                }`}
                                title="Click to inspect full cell value"
                              >
                                {val !== undefined && val !== null ? (
                                  typeof val === 'boolean' ? (
                                    <span className="text-purple-600 dark:text-purple-400 font-bold">
                                      {String(val)}
                                    </span>
                                  ) : typeof val === 'number' ? (
                                    <span className="text-emerald-600 dark:text-emerald-400">
                                      {val}
                                    </span>
                                  ) : (
                                    String(val)
                                  )
                                ) : (
                                  <span className="text-gray-400 dark:text-slate-600 italic">
                                    null
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-gray-500 dark:text-slate-500 gap-2 p-6 text-center">
                    <Table2 className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                    <p className="font-medium">
                      {parsedData.length > 0
                        ? 'All columns are currently unselected. Check columns above to view data.'
                        : 'Interactive tabular preview will appear here once JSON is loaded.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Interactive Cell Value Inspector */}
              {selectedCell && (
                <div className="mt-4 bg-slate-50 dark:bg-[#0a0f1a] border border-blue-200 dark:border-blue-900/50 rounded-2xl p-4 flex flex-col gap-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <Eye className="w-4 h-4 text-blue-500" />
                      <span>Value Inspector</span>
                      <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-[11px] font-mono">
                        Column: {selectedCell.column} • Row #{selectedCell.row + 1}
                      </span>
                      <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded text-[11px] font-mono">
                        Type: {selectedCell.type}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        ({selectedCell.length.toLocaleString()} chars)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={copyCellValue}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        {cellCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy Value
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setSelectedCell(null)}
                        aria-label="Close Inspector"
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-[#111827] p-3 rounded-xl border border-gray-200 dark:border-slate-800 font-mono text-xs max-h-36 overflow-y-auto break-all text-slate-800 dark:text-slate-200 [scrollbar-width:thin]">
                    {selectedCell.value === null ? (
                      <span className="italic text-slate-400">null</span>
                    ) : selectedCell.value === undefined ? (
                      <span className="italic text-slate-400">undefined</span>
                    ) : (
                      String(selectedCell.value)
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Primary Export Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <button
              onClick={exportCSV}
              disabled={!canExport}
              className="flex justify-center items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.25)] disabled:opacity-50 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
            >
              <FileText className="w-4 h-4" /> CSV (RFC 4180)
            </button>
            <button
              onClick={exportExcel}
              disabled={!canExport}
              className="flex justify-center items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] disabled:opacity-50 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
            >
              <FileSpreadsheet className="w-4 h-4" /> Excel (.xlsx)
            </button>
            <button
              onClick={exportYAML}
              disabled={!input.trim() || !!error}
              className="flex justify-center items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.25)] disabled:opacity-50 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
            >
              <FileCode className="w-4 h-4" /> YAML (.yaml)
            </button>
            <button
              onClick={exportXML}
              disabled={!input.trim() || !!error}
              className="flex justify-center items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-3 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(217,119,6,0.25)] disabled:opacity-50 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
            >
              <Code2 className="w-4 h-4" /> XML (.xml)
            </button>
          </div>

          {/* Secondary Formats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
            <button
              onClick={exportTSV}
              disabled={!canExport}
              className="flex justify-center items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:border-blue-500 disabled:opacity-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> TSV
            </button>
            <button
              onClick={exportJSONL}
              disabled={!canExport}
              className="flex justify-center items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:border-blue-500 disabled:opacity-50 transition-colors"
            >
              JSONL
            </button>
            <button
              onClick={exportFlattenedJSON}
              disabled={!canExport}
              className="flex justify-center items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:border-blue-500 disabled:opacity-50 transition-colors"
            >
              Flattened JSON
            </button>
            <button
              onClick={exportHTML}
              disabled={!canExport}
              className="flex justify-center items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:border-blue-500 disabled:opacity-50 transition-colors"
            >
              HTML Table
            </button>
          </div>

          {/* Quick Copy Action Bar */}
          <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 mt-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase px-2 select-none">Quick Copy:</span>
            <button
              type="button"
              onClick={() => copyFormat('csv')}
              disabled={!canExport}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:border-blue-500 disabled:opacity-50"
            >
              CSV
            </button>
            <button
              type="button"
              onClick={() => copyFormat('yaml')}
              disabled={!input.trim() || !!error}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:border-blue-500 disabled:opacity-50"
            >
              YAML
            </button>
            <button
              type="button"
              onClick={() => copyFormat('xml')}
              disabled={!input.trim() || !!error}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:border-blue-500 disabled:opacity-50"
            >
              XML
            </button>
            <button
              type="button"
              onClick={() => copyFormat('tsv')}
              disabled={!canExport}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:border-blue-500 disabled:opacity-50"
            >
              TSV
            </button>
            <button
              type="button"
              onClick={() => copyFormat('jsonl')}
              disabled={!canExport}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:border-blue-500 disabled:opacity-50"
            >
              JSONL
            </button>
            <button
              type="button"
              onClick={copySummary}
              disabled={!parsedData.length}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:border-blue-500 disabled:opacity-50 ml-auto"
            >
              Summary
            </button>
          </div>

          {/* Filename Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-3">
            <div className="flex-1 flex items-center bg-gray-50 dark:bg-[#0a0f1a] rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-1">
              <span className="text-xs text-slate-400 font-mono select-none pr-1">export/</span>
              <input
                value={baseFilename}
                onChange={(e) => setBaseFilename(e.target.value)}
                placeholder="Filename (without extension)"
                className="flex-1 bg-transparent py-1.5 text-sm text-slate-800 dark:text-slate-300 focus:outline-none font-mono"
                aria-label="Export base filename"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Floating Copy Feedback Toast */}
      {copyToast && (
        <div
          role="alert"
          className="fixed bottom-6 right-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-2"
        >
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{copyToast}</span>
        </div>
      )}

      {/* Screen Reader ARIA Live Region */}
      <div role="status" aria-live="polite" className="sr-only">
        {ariaAnnouncement}
      </div>
    </div>
  );
}
