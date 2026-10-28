import * as XLSX from 'xlsx';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { sanitizeWinAnsiText } from './wordToPdfEngine';

export type ExcelPdfPageSize = 'a4' | 'letter' | 'legal';
export type ExcelPdfOrientation = 'auto' | 'landscape' | 'portrait';

export interface ParsedSpreadsheetSheet {
  name: string;
  rows: string[][];
  rowCount: number;
  columnCount: number;
}

export interface ExcelToPdfResult {
  fileName: string;
  pageCount: number;
  sheetCount: number;
  totalRowsRendered: number;
  sheets: ParsedSpreadsheetSheet[];
  pdfBytes: Uint8Array;
  pdfBlob: Blob;
}

/**
 * Parses an Excel (.xlsx, .xls) or CSV/TSV file into normalized 2D string grids per sheet.
 */
export function parseSpreadsheetFile(
  fileBytes: Uint8Array,
  fileName = 'workbook.xlsx'
): ParsedSpreadsheetSheet[] {
  const lower = fileName.toLowerCase();

  if (lower.endsWith('.csv') || lower.endsWith('.tsv')) {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(fileBytes).replace(/^\uFEFF/, '');
    const sep = lower.endsWith('.tsv') ? '\t' : ',';
    const rawLines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const rows = rawLines.map((line) => line.split(sep).map((c) => c.replace(/^"|"$/g, '').trim()));
    const maxCols = rows.reduce((m, r) => Math.max(m, r.length), 1);
    const normalized = rows.map((r) => {
      const copy = [...r];
      while (copy.length < maxCols) copy.push('');
      return copy;
    });
    return [
      {
        name: fileName.replace(/\.(csv|tsv)$/i, '') || 'Sheet1',
        rows: normalized,
        rowCount: normalized.length,
        columnCount: maxCols,
      },
    ];
  }

  const wb = XLSX.read(fileBytes, { type: 'array' });
  const sheets: ParsedSpreadsheetSheet[] = [];

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;
    const rawGrid = (XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as unknown[][]) || [];
    const stringGrid = rawGrid
      .map((row) => (Array.isArray(row) ? row.map((cell) => String(cell ?? '').trim()) : []))
      .filter((row) => row.some((c) => c !== ''));

    const maxCols = stringGrid.reduce((m, r) => Math.max(m, r.length), 1);
    const normalized = stringGrid.map((r) => {
      const copy = [...r];
      while (copy.length < maxCols) copy.push('');
      return copy;
    });

    sheets.push({
      name: sheetName,
      rows: normalized,
      rowCount: normalized.length,
      columnCount: maxCols,
    });
  }

  return sheets;
}

/**
 * Renders parsed spreadsheet sheets into a vector-sharp, paginated PDF table document.
 */
export async function convertSpreadsheetSheetsToPdf(
  sheets: ParsedSpreadsheetSheet[],
  originalFileName = 'workbook.xlsx',
  options: {
    selectedSheetNames?: string[];
    pageSize?: ExcelPdfPageSize;
    orientation?: ExcelPdfOrientation;
    repeatHeaderRow?: boolean;
    zebraStriping?: boolean;
    showGridlines?: boolean;
  } = {}
): Promise<ExcelToPdfResult> {
  const pageSize = options.pageSize || 'a4';
  const orientationOpt = options.orientation || 'auto';
  const repeatHeaderRow = options.repeatHeaderRow ?? true;
  const zebraStriping = options.zebraStriping ?? true;
  const showGridlines = options.showGridlines ?? true;

  const activeSheets =
    options.selectedSheetNames && options.selectedSheetNames.length > 0
      ? sheets.filter((s) => options.selectedSheetNames!.includes(s.name))
      : sheets;

  const sheetsToRender = activeSheets.length > 0 ? activeSheets : sheets;

  const baseDims =
    pageSize === 'letter'
      ? { w: 612, h: 792 }
      : pageSize === 'legal'
      ? { w: 612, h: 1008 }
      : { w: 595.28, h: 841.89 };

  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let totalRowsRendered = 0;

  for (const sheet of sheetsToRender) {
    const colCount = Math.max(1, sheet.columnCount);
    const isWide =
      orientationOpt === 'landscape' || (orientationOpt === 'auto' && colCount >= 6);

    const pageWidth = isWide ? baseDims.h : baseDims.w;
    const pageHeight = isWide ? baseDims.w : baseDims.h;
    const marginPt = 36;
    const usableWidth = pageWidth - marginPt * 2;

    // Calculate proportional column widths based on max character length in each column (clamped [25, 180])
    const colWeights: number[] = Array(colCount).fill(35);
    for (let rIdx = 0; rIdx < Math.min(sheet.rows.length, 60); rIdx++) {
      const r = sheet.rows[rIdx];
      for (let cIdx = 0; cIdx < colCount; cIdx++) {
        const len = (r[cIdx] || '').length;
        colWeights[cIdx] = Math.min(180, Math.max(colWeights[cIdx], len * 5.5 + 14));
      }
    }
    const totalWeight = colWeights.reduce((acc, w) => acc + w, 0) || 1;
    const colWidths = colWeights.map((w) => (w / totalWeight) * usableWidth);

    const fontSize = colCount > 10 ? 7.5 : colCount > 7 ? 8.5 : 9.5;
    const rowHeight = fontSize + 10;

    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let cursorY = pageHeight - marginPt;

    // Draw Sheet Title Header
    const titleStr = sanitizeWinAnsiText(`${sheet.name} (${sheet.rowCount} rows)`);
    currentPage.drawText(titleStr, {
      x: marginPt,
      y: cursorY - 12,
      size: 12,
      font: fontBold,
      color: rgb(0.08, 0.12, 0.2),
    });
    cursorY -= 24;

    const drawRow = (rowCells: string[], isHeader: boolean, rowIndex: number) => {
      const rowBottom = cursorY - rowHeight;

      if (isHeader) {
        currentPage.drawRectangle({
          x: marginPt,
          y: rowBottom,
          width: usableWidth,
          height: rowHeight,
          color: rgb(0.12, 0.23, 0.54),
        });
      } else if (zebraStriping && rowIndex % 2 === 1) {
        currentPage.drawRectangle({
          x: marginPt,
          y: rowBottom,
          width: usableWidth,
          height: rowHeight,
          color: rgb(0.96, 0.97, 0.99),
        });
      }

      let cellX = marginPt;
      for (let cIdx = 0; cIdx < colCount; cIdx++) {
        const cw = colWidths[cIdx];
        if (showGridlines) {
          currentPage.drawRectangle({
            x: cellX,
            y: rowBottom,
            width: cw,
            height: rowHeight,
            borderColor: isHeader ? rgb(0.2, 0.32, 0.65) : rgb(0.84, 0.87, 0.91),
            borderWidth: 0.4,
          });
        }

        const rawText = sanitizeWinAnsiText(rowCells[cIdx] || '');
        const activeFont = isHeader ? fontBold : fontRegular;
        let display = rawText;
        while (
          display.length > 1 &&
          activeFont.widthOfTextAtSize(display, fontSize) > cw - 6
        ) {
          display = display.slice(0, -2) + '..';
        }

        currentPage.drawText(display, {
          x: cellX + 3,
          y: rowBottom + 4.5,
          size: fontSize,
          font: activeFont,
          color: isHeader ? rgb(1, 1, 1) : rgb(0.12, 0.16, 0.23),
        });

        cellX += cw;
      }

      cursorY = rowBottom;
    };

    const headerRow = sheet.rows[0] || Array(colCount).fill('');
    if (sheet.rows.length > 0) {
      drawRow(headerRow, true, 0);
      totalRowsRendered++;
    }

    for (let rIdx = 1; rIdx < sheet.rows.length; rIdx++) {
      if (cursorY - rowHeight < marginPt + 20) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        cursorY = pageHeight - marginPt;
        if (repeatHeaderRow) {
          drawRow(headerRow, true, 0);
        }
      }
      drawRow(sheet.rows[rIdx], false, rIdx);
      totalRowsRendered++;
    }
  }

  // Add Page Footers
  const pages = pdfDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    const { width } = p.getSize();
    const label = `Page ${i + 1} of ${pages.length}`;
    const lw = fontRegular.widthOfTextAtSize(label, 8.5);
    p.drawText(label, {
      x: (width - lw) / 2,
      y: 16,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.45, 0.5, 0.58),
    });
  }

  const pdfBytes = await pdfDoc.save();
  const pdfBlob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const baseName = originalFileName.replace(/\.(xlsx|xls|csv|tsv)$/i, '') || 'spreadsheet';

  return {
    fileName: `${baseName}.pdf`,
    pageCount: pages.length,
    sheetCount: sheetsToRender.length,
    totalRowsRendered,
    sheets,
    pdfBytes,
    pdfBlob,
  };
}


export const EXCEL_PAGE_DIMENSIONS: Record<'a4' | 'letter' | 'legal' | 'a3', { width: number; height: number }> = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
  legal: { width: 612, height: 1008 },
  a3: { width: 841.89, height: 1190.55 },
};

export function computeColumnWidths(rows: string[][], availableWidth: number): number[] {
  const colCount = rows.reduce((m, r) => Math.max(m, r.length), 0);
  if (colCount === 0) return [];
  const sample = rows.slice(0, 200);
  const weights = Array.from({ length: colCount }, (_, cIdx) => {
    const lengths = sample.map((r) => (r[cIdx] || '').trim().length).sort((a, b) => a - b);
    const p95 = lengths[Math.floor(lengths.length * 0.95)] || 8;
    return Math.min(45, Math.max(6, p95));
  });
  const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;
  return weights.map((w) => (w / totalWeight) * availableWidth);
}
