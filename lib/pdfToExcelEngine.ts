import * as XLSX from 'xlsx';
import {
  extractPdfPages,
  parsePdfPageRangeString,
  type PdfPageExtraction,
} from './pdfClientEngine';

export type PdfExcelSheetMode = 'merged_single_sheet' | 'sheet_per_page';

export interface ExtractedPdfTableSheet {
  sheetName: string;
  pageNumber: number;
  rows: string[][];
}

export interface PdfToExcelResult {
  fileName: string;
  pageCount: number;
  totalRows: number;
  maxColumns: number;
  sheets: ExtractedPdfTableSheet[];
  xlsxBytes: Uint8Array;
  xlsxBlob: Blob;
  csvText: string;
  jsonText: string;
}

/**
 * CWE-1236 CSV Formula Injection Defense:
 * Prefixes cells starting with =, +, -, @, \t, or \r (unless it's a pure negative number like -150.25)
 * with a single quote so Excel/Google Sheets never execute malicious formulas.
 */
export function sanitizeSpreadsheetCell(val: string): string {
  const trimmed = String(val ?? '').trim();
  if (!trimmed) return '';
  if (/^-[\d.,]+%?$/.test(trimmed)) {
    return trimmed; // Valid negative numeric value
  }
  if (/^[=+\-@\t\r]/.test(trimmed)) {
    return "'" + trimmed;
  }
  return trimmed;
}

export function formatRfc4180Csv(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const safe = sanitizeSpreadsheetCell(cell);
          if (/[",\r\n]/.test(safe)) {
            return `"${safe.replace(/"/g, '""')}"`;
          }
          return safe;
        })
        .join(',')
    )
    .join('\r\n');
}

/**
 * Reconstructs tabular rows and columns from a PDF page using spatial X-coordinate clustering
 * and multi-space / tab delimiter fallback.
 */
export function extractTableFromPdfPage(page: PdfPageExtraction): string[][] {
  const rows: string[][] = [];

  for (const line of page.lines) {
    if (!line.items || line.items.length === 0) continue;

    if (line.items.length >= 2) {
      const cells: string[] = [];
      let curCell = line.items[0].text;
      let lastRight = line.items[0].x + line.items[0].width;

      for (let i = 1; i < line.items.length; i++) {
        const item = line.items[i];
        const gap = item.x - lastRight;
        if (gap > Math.max(12, line.fontSize * 1.1)) {
          cells.push(curCell.trim());
          curCell = item.text;
        } else {
          curCell += ' ' + item.text;
        }
        lastRight = Math.max(lastRight, item.x + item.width);
      }
      cells.push(curCell.trim());
      rows.push(cells);
    } else {
      // Single span on the line: check if it contains tab or 2+ spaces separating columns
      const raw = line.text.trim();
      if (!raw) continue;
      if (/\t|\s{2,}/.test(raw)) {
        const splitCells = raw.split(/\t|\s{2,}/).map((c) => c.trim());
        rows.push(splitCells);
      } else {
        rows.push([raw]);
      }
    }
  }

  // Normalize column count across rows
  const maxCols = rows.reduce((max, r) => Math.max(max, r.length), 1);
  return rows.map((r) => {
    const copy = [...r];
    while (copy.length < maxCols) copy.push('');
    return copy;
  });
}

/**
 * Converts a PDF file buffer into an Excel (.xlsx) workbook, RFC-4180 CSV, and JSON array.
 */
export async function convertPdfToExcel(
  pdfBytes: Uint8Array,
  originalFileName = 'statement.pdf',
  options: {
    sheetMode?: PdfExcelSheetMode;
    pageRange?: string;
    sanitizeFormulas?: boolean;
  } = {}
): Promise<PdfToExcelResult> {
  const sheetMode = options.sheetMode || 'merged_single_sheet';
  const sanitizeFormulas = options.sanitizeFormulas ?? true;

  const allPages = await extractPdfPages(pdfBytes);
  const selectedNums = parsePdfPageRangeString(options.pageRange || 'all', allPages.length);
  const selectedSet = new Set(selectedNums);
  const pages = allPages.filter((p) => selectedSet.has(p.pageNumber));

  const sheets: ExtractedPdfTableSheet[] = [];
  const allMergedRows: string[][] = [];
  let maxColumns = 1;

  for (const page of pages) {
    const pageRowsRaw = extractTableFromPdfPage(page);
    const pageRows = sanitizeFormulas
      ? pageRowsRaw.map((r) => r.map(sanitizeSpreadsheetCell))
      : pageRowsRaw;

    for (const r of pageRows) {
      if (r.length > maxColumns) maxColumns = r.length;
      allMergedRows.push(r);
    }

    sheets.push({
      sheetName: `Page_${page.pageNumber}`,
      pageNumber: page.pageNumber,
      rows: pageRows,
    });
  }

  // Normalize allMergedRows width
  const normalizedMerged = allMergedRows.map((r) => {
    const copy = [...r];
    while (copy.length < maxColumns) copy.push('');
    return copy;
  });

  const wb = XLSX.utils.book_new();
  if (sheetMode === 'sheet_per_page' && sheets.length > 0) {
    for (const sh of sheets) {
      const ws = XLSX.utils.aoa_to_sheet(sh.rows.length > 0 ? sh.rows : [['']]);
      XLSX.utils.book_append_sheet(wb, ws, sh.sheetName.slice(0, 31));
    }
  } else {
    const ws = XLSX.utils.aoa_to_sheet(normalizedMerged.length > 0 ? normalizedMerged : [['']]);
    XLSX.utils.book_append_sheet(wb, ws, 'Extracted_Table');
  }

  const rawXlsxOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const xlsxBytes = new Uint8Array(rawXlsxOut);
  const xlsxBlob = new Blob([xlsxBytes as unknown as BlobPart], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const csvText = '\uFEFF' + formatRfc4180Csv(normalizedMerged);

  // Build JSON records using row 0 as headers if >=2 rows exist
  let jsonRecords: unknown[] = [];
  if (normalizedMerged.length >= 2) {
    const headers = normalizedMerged[0].map((h, idx) => h.trim() || `Column_${idx + 1}`);
    jsonRecords = normalizedMerged.slice(1).map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        obj[h] = row[idx] ?? '';
      });
      return obj;
    });
  } else {
    jsonRecords = normalizedMerged;
  }

  const baseName = originalFileName.replace(/\.pdf$/i, '') || 'statement';

  return {
    fileName: `${baseName}.xlsx`,
    pageCount: pages.length,
    totalRows: normalizedMerged.length,
    maxColumns,
    sheets,
    xlsxBytes,
    xlsxBlob,
    csvText,
    jsonText: JSON.stringify(jsonRecords, null, 2),
  };
}
