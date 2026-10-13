/**
 * OmniTools JSON Converter Engine
 * High-performance, client-side transformation engine for JSON data.
 * Supports tabular conversion (CSV, TSV, Excel, JSONL, HTML) and
 * structured data serialization (YAML, XML).
 */

export type CellValue = string | number | boolean | null | undefined;

export interface FlattenOptions {
  separator: string;
  arrayMode: 'json' | 'join' | 'indexed';
  maxDepth: number;
}

export interface ParseResult {
  rows: Record<string, CellValue>[];
  columns: string[];
  totalCells: number;
  durationMs: number;
}

export interface StrictJsonDiagnostic {
  isValid: boolean;
  error: string | null;
  line: number | null;
  column: number | null;
  snippet: string | null;
}

// Resource safety limits
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
export const MAX_ROOT_ROWS = 200_000;
export const MAX_COLUMNS = 10_000;
export const MAX_CELLS = 5_000_000; // 5 Million cells maximum

export const DEFAULT_OPTIONS: FlattenOptions = {
  separator: '_',
  arrayMode: 'json',
  maxDepth: 20,
};

export const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Format bytes into human-readable string.
 */
export const formatBytes = (bytes: number): string => {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

/**
 * Sanitize user-provided export filename.
 * Removes path traversal, control chars, and invalid filesystem characters.
 */
export const sanitizeFilename = (filename: string): string => {
  if (!filename || typeof filename !== 'string') return 'omnitools_export';
  let cleaned = filename.trim().replace(/\.\.+/g, '_').replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
  cleaned = cleaned.replace(/[. ]+$/, '');
  return cleaned.slice(0, 80) || 'omnitools_export';
};

/**
 * Prototype pollution safe cell definition.
 * Uses Object.defineProperty on null-prototype objects.
 */
export const defineCell = (
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
 * Spreadsheet formula injection protection.
 * Protects =, +, -, @, tabs, returns, newlines, and fullwidth Unicode variants.
 * Distinguishes legitimate numbers from executable formula strings.
 */
export const safeSpreadsheetValue = (
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
    // Prefix unsafe formula string with apostrophe to neutralize execution in Excel/Sheets
    return `'${str}`;
  }

  return str;
};

/**
 * Flatten arrays into safe cell representation based on arrayMode.
 */
export const stringifyArray = (
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
export const flattenObject = (
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
export const normaliseRoot = (
  parsed: unknown,
  options: FlattenOptions = DEFAULT_OPTIONS,
): Record<string, CellValue>[] => {
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
 * Strict JSON parsing with diagnostics, extracting line and column numbers.
 */
export const parseJsonStrict = (text: string): StrictJsonDiagnostic => {
  if (!text || !text.trim()) {
    return {
      isValid: false,
      error: 'Input is empty.',
      line: null,
      column: null,
      snippet: null,
    };
  }

  try {
    JSON.parse(text);
    return {
      isValid: true,
      error: null,
      line: null,
      column: null,
      snippet: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    
    // Attempt to extract position from V8 error: "at position 123" or "line X column Y"
    let line = 1;
    let column = 1;
    let position: number | null = null;

    const posMatch = message.match(/position\s+(\d+)/i);
    if (posMatch) {
      position = parseInt(posMatch[1], 10);
      const lines = text.slice(0, position).split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    } else {
      const lineColMatch = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);
      if (lineColMatch) {
        line = parseInt(lineColMatch[1], 10);
        column = parseInt(lineColMatch[2], 10);
      }
    }

    // Generate context snippet around the error line
    const allLines = text.split('\n');
    const errorLineIdx = Math.max(0, line - 1);
    const snippetLine = allLines[errorLineIdx] || '';
    const pointer = ' '.repeat(Math.max(0, column - 1)) + '^';
    const snippet = `${snippetLine}\n${pointer}`;

    return {
      isValid: false,
      error: message,
      line,
      column,
      snippet,
    };
  }
};

/**
 * Comprehensive parser with explicit resource budget enforcement.
 */
export const parseJsonToTable = (
  text: string,
  options: FlattenOptions = DEFAULT_OPTIONS,
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

  // Column discovery with order preservation
  const columnOrder: string[] = [];
  const columnSet = new Set<string>();

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (const key in row) {
      if (!columnSet.has(key)) {
        columnSet.add(key);
        columnOrder.push(key);

        if (columnOrder.length > MAX_COLUMNS) {
          throw new Error(
            `Dataset exceeds the maximum column limit of ${MAX_COLUMNS.toLocaleString()} columns. Adjust flattening depth or array handling.`,
          );
        }
      }
    }
  }

  const totalCells = rows.length * columnOrder.length;
  if (totalCells > MAX_CELLS) {
    throw new Error(
      `Dataset total cell volume (${totalCells.toLocaleString()}) exceeds the browser safety limit of 5,000,000 cells. Deselect columns or reduce rows.`,
    );
  }

  return {
    rows,
    columns: columnOrder,
    totalCells,
    durationMs: Math.round(performance.now() - startTime),
  };
};

/**
 * Escapes a cell value according to RFC 4180 CSV specifications.
 */
export const escapeCsvField = (raw: CellValue): string => {
  const val = safeSpreadsheetValue(raw);
  const str = String(val);

  if (
    str.includes(',') ||
    str.includes('"') ||
    str.includes('\n') ||
    str.includes('\r')
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Converts tabular dataset into RFC 4180 compliant CSV string with UTF-8 BOM.
 */
export const jsonToCsv = (
  data: Record<string, CellValue>[],
  columns: string[],
): string => {
  if (!data.length || !columns.length) return '';

  const headerLine = columns.map(escapeCsvField).join(',');
  const rowLines = data.map((row) =>
    columns.map((col) => escapeCsvField(row[col] ?? '')).join(','),
  );

  return '\uFEFF' + [headerLine, ...rowLines].join('\r\n');
};

/**
 * Converts tabular dataset into TSV (Tab-separated values) with UTF-8 BOM.
 */
export const jsonToTsv = (
  data: Record<string, CellValue>[],
  columns: string[],
): string => {
  if (!data.length || !columns.length) return '';

  const escapeTsvField = (val: CellValue): string => {
    const str = String(safeSpreadsheetValue(val));
    if (str.includes('\t') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = columns.map(escapeTsvField).join('\t');
  const rowLines = data.map((row) =>
    columns.map((col) => escapeTsvField(row[col] ?? '')).join('\t'),
  );

  return '\uFEFF' + [headerLine, ...rowLines].join('\r\n');
};

/**
 * Converts JSON data into clean, valid YAML representation.
 * Supports primitives, arrays, nested objects, multiline strings, and keyword escaping.
 */
export const jsonToYaml = (input: unknown, indent = 2): string => {
  const formatYamlValue = (val: unknown, currentIndent: number): string => {
    const spaces = ' '.repeat(currentIndent);

    if (val === null || val === undefined) {
      return 'null';
    }

    if (typeof val === 'boolean') {
      return val ? 'true' : 'false';
    }

    if (typeof val === 'number') {
      return Number.isFinite(val) ? String(val) : 'null';
    }

    if (typeof val === 'string') {
      if (val === '') return '""';

      // Check if string needs quotation (looks like number, boolean, null, or has YAML syntax characters)
      const needsQuotes =
        /^(true|false|null|~|yes|no|on|off)$/i.test(val) ||
        /^[+-]?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(val) ||
        /^0[xob][0-9a-fA-F_]+$/.test(val) ||
        /[:#\{\}\[\]\,\&\*\#\?\|\-\<\>\=\!\%\@\`]/.test(val) ||
        /^[\s\t]/.test(val) ||
        /[\s\t]$/.test(val) ||
        val.includes('\n') ||
        val.includes('\r');

      if (val.includes('\n')) {
        // Multi-line string as literal block scalar with correct chomping indicator
        const chomping = val.endsWith('\n\n') ? '|+' : val.endsWith('\n') ? '|' : '|-';
        const cleanVal = val.replace(/\r/g, '').replace(/\n+$/, '');
        const lines = cleanVal.split('\n');
        const childSpaces = ' '.repeat(currentIndent + indent);
        return `${chomping}\n${lines.map((l) => `${childSpaces}${l}`).join('\n')}`;
      }

      if (needsQuotes) {
        return JSON.stringify(val);
      }

      return val;
    }

    if (Array.isArray(val)) {
      if (val.length === 0) return '[]';

      return val
        .map((item) => {
          if (isPlainObject(item)) {
            const formattedObj = formatYamlObject(item, currentIndent + indent, true);
            return `${spaces}- ${formattedObj.trimStart()}`;
          }
          if (Array.isArray(item)) {
            const childSpaces = ' '.repeat(currentIndent + indent);
            return `${spaces}-\n${childSpaces}${formatYamlValue(item, currentIndent + indent).trimStart()}`;
          }
          return `${spaces}- ${formatYamlValue(item, currentIndent + indent)}`;
        })
        .join('\n');
    }

    if (isPlainObject(val)) {
      return formatYamlObject(val, currentIndent, false);
    }

    return String(val);
  };

  const formatYamlObject = (
    obj: Record<string, unknown>,
    currentIndent: number,
    isFirstInline = false,
  ): string => {
    const entries = Object.entries(obj);
    if (entries.length === 0) return '{}';

    const spaces = ' '.repeat(currentIndent);

    return entries
      .map(([key, value], idx) => {
        // Sanitize or quote YAML key if necessary
        const safeKey = /^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(key) ? key : JSON.stringify(key);
        const prefix = idx === 0 && isFirstInline ? '' : spaces;

        if (isPlainObject(value)) {
          if (Object.keys(value).length === 0) return `${prefix}${safeKey}: {}`;
          return `${prefix}${safeKey}:\n${formatYamlValue(value, currentIndent + indent)}`;
        }

        if (Array.isArray(value)) {
          if (value.length === 0) return `${prefix}${safeKey}: []`;
          return `${prefix}${safeKey}:\n${formatYamlValue(value, currentIndent + indent)}`;
        }

        return `${prefix}${safeKey}: ${formatYamlValue(value, currentIndent + indent)}`;
      })
      .join('\n');
  };

  if (isPlainObject(input)) {
    return formatYamlObject(input, 0, false);
  }

  if (Array.isArray(input)) {
    return formatYamlValue(input, 0);
  }

  return formatYamlValue(input, 0);
};

/**
 * Converts JSON data into clean, well-formed XML string.
 * Automatically wraps array items in <item> tags and sanitizes element tag names.
 */
export const jsonToXml = (input: unknown, rootName = 'root', indent = 2): string => {
  const sanitizeTagName = (key: string): string => {
    let clean = key.replace(/[^a-zA-Z0-9_-]/g, '_');
    if (/^[0-9]/.test(clean)) {
      clean = `item_${clean}`;
    }
    return clean || 'item';
  };

  const escapeXmlText = (str: unknown): string => {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const serializeNode = (val: unknown, tagName: string, level: number): string => {
    const spaces = ' '.repeat(level * indent);

    if (val === null || val === undefined) {
      return `${spaces}<${tagName} xsi:nil="true"/>`;
    }

    if (typeof val === 'boolean' || typeof val === 'number') {
      return `${spaces}<${tagName}>${val}</${tagName}>`;
    }

    if (typeof val === 'string') {
      return `${spaces}<${tagName}>${escapeXmlText(val)}</${tagName}>`;
    }

    if (Array.isArray(val)) {
      if (val.length === 0) {
        return `${spaces}<${tagName}/>`;
      }
      return val.map((item) => serializeNode(item, 'item', level)).join('\n');
    }

    if (isPlainObject(val)) {
      const entries = Object.entries(val);
      if (entries.length === 0) {
        return `${spaces}<${tagName}/>`;
      }

      const childNodes = entries
        .map(([k, v]) => {
          const safeKey = sanitizeTagName(k);
          if (Array.isArray(v)) {
            if (v.length === 0) return `${spaces}${' '.repeat(indent)}<${safeKey}/>`;
            const arrayItems = v.map((item) => serializeNode(item, 'item', level + 2)).join('\n');
            return `${spaces}${' '.repeat(indent)}<${safeKey}>\n${arrayItems}\n${spaces}${' '.repeat(indent)}</${safeKey}>`;
          }
          return serializeNode(v, safeKey, level + 1);
        })
        .join('\n');

      return `${spaces}<${tagName}>\n${childNodes}\n${spaces}</${tagName}>`;
    }

    return `${spaces}<${tagName}>${escapeXmlText(val)}</${tagName}>`;
  };

  const rootTag = sanitizeTagName(rootName);
  let innerXml = '';

  if (Array.isArray(input)) {
    innerXml = input.map((item) => serializeNode(item, 'item', 1)).join('\n');
  } else if (isPlainObject(input)) {
    innerXml = Object.entries(input)
      .map(([k, v]) => {
        const safeKey = sanitizeTagName(k);
        if (Array.isArray(v)) {
          if (v.length === 0) return `  <${safeKey}/>`;
          const arrayItems = v.map((item) => serializeNode(item, 'item', 2)).join('\n');
          return `  <${safeKey}>\n${arrayItems}\n  </${safeKey}>`;
        }
        return serializeNode(v, safeKey, 1);
      })
      .join('\n');
  } else {
    innerXml = `  ${escapeXmlText(input)}`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootTag} xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n${innerXml}\n</${rootTag}>`;
};

/**
 * Converts array of records into JSONL (NDJSON) string.
 */
export const jsonToJsonl = (data: Record<string, CellValue>[]): string => {
  return data.map((row) => JSON.stringify(row)).join('\n');
};

/**
 * Converts tabular dataset into a self-contained, clean HTML table document.
 */
export const jsonToHtmlTable = (
  data: Record<string, CellValue>[],
  columns: string[],
  title = 'OmniTools Export',
): string => {
  const escapeHtml = (val: unknown) =>
    String(val ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

  const head = columns
    .map((column) => `<th>${escapeHtml(column)}</th>`)
    .join('');

  const body = data
    .map(
      (row) =>
        `<tr>${columns
          .map((column) => `<td>${escapeHtml(row[column])}</td>`)
          .join('')}</tr>`,
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; background: #f8fafc; color: #0f172a; margin: 0; }
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
  <h1>${escapeHtml(title)}</h1>
  <p>Exported from OmniTools JSON Converter • ${data.length.toLocaleString()} rows • ${columns.length.toLocaleString()} columns</p>
</div>
<div class="container">
  <table>
    <thead><tr>${head}</tr></thead>
    <tbody>${body}</tbody>
  </table>
</div>
</body>
</html>`;
};

/**
 * Pre-loaded sample datasets for instant user exploration.
 */
export const SAMPLE_DATASETS = {
  users: JSON.stringify(
    [
      {
        id: 101,
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'Engineering Lead',
        department: { name: 'Core Infrastructure', floor: 4 },
        tags: ['fullstack', 'typescript', 'systems'],
        active: true,
        salary: 145000,
      },
      {
        id: 102,
        name: 'Bob Smith',
        email: 'bob@example.com',
        role: 'Data Scientist',
        department: { name: 'Analytics & ML', floor: 2 },
        tags: ['python', 'statistics'],
        active: true,
        salary: 132000,
      },
      {
        id: 103,
        name: 'Catherine Vance',
        email: 'catherine@example.com',
        role: 'Product Designer',
        department: { name: 'User Experience', floor: 3 },
        tags: ['ui', 'figma', 'accessibility'],
        active: false,
        salary: 118000,
      },
    ],
    null,
    2,
  ),
  ecommerce: JSON.stringify(
    [
      {
        orderId: 'ORD-98421',
        customer: { name: 'Diana Prince', location: 'Metropolis' },
        items: [
          { sku: 'LAPTOP-PRO-16', qty: 1, price: 2199.99 },
          { sku: 'MOUSE-WIRELESS', qty: 2, price: 49.5 },
        ],
        payment: { method: 'Credit Card', status: 'PAID' },
        discountApplied: false,
        shipped: true,
      },
      {
        orderId: 'ORD-98422',
        customer: { name: 'Bruce Wayne', location: 'Gotham' },
        items: [{ sku: 'MONITOR-4K-32', qty: 3, price: 699.0 }],
        payment: { method: 'Wire Transfer', status: 'PENDING' },
        discountApplied: true,
        shipped: false,
      },
    ],
    null,
    2,
  ),
  geo: JSON.stringify(
    {
      country: 'Canada',
      countryCode: 'CA',
      provinces: [
        { name: 'Ontario', capital: 'Toronto', population: 14223942 },
        { name: 'Quebec', capital: 'Quebec City', population: 8501833 },
        { name: 'British Columbia', capital: 'Victoria', population: 5000879 },
      ],
      metrics: { totalAreaSqKm: 9984670, landWaterRatio: 0.91 },
    },
    null,
    2,
  ),
};
