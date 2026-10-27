import JSZip from 'jszip';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export type WordPdfPageSize = 'a4' | 'letter' | 'legal';
export type WordPdfMargin = 'normal' | 'narrow' | 'wide';

export interface ParsedWordBlock {
  type: 'heading1' | 'heading2' | 'heading3' | 'bullet' | 'table' | 'paragraph';
  text?: string;
  bold?: boolean;
  italic?: boolean;
  rows?: string[][];
}

export interface WordToPdfResult {
  fileName: string;
  pageCount: number;
  wordCount: number;
  paragraphCount: number;
  tableCount: number;
  blocks: ParsedWordBlock[];
  pdfBytes: Uint8Array;
  pdfBlob: Blob;
}

function unescapeXmlEntities(str: string): string {
  return String(str || '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * Strips any character outside WinAnsi (Latin-1 printable range) so pdf-lib StandardFonts
 * never throw WinAnsi encoding errors on smart quotes, em-dashes, or bullets.
 */
export function sanitizeWinAnsiText(input: string): string {
  return String(input || '')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[\u2022\u25CF\u25AA\u25B8]/g, '*')
    .replace(/\u00A0/g, ' ')
    // Replace remaining non-Latin1 characters with ASCII fallback or space
    .replace(/[^\x20-\x7E\xA1-\xFF\n\r\t]/g, '');
}

/**
 * Parses an OpenXML .docx binary archive (or .txt/.md file) into structured blocks.
 */
export async function parseDocxOrTextToBlocks(
  fileBytes: Uint8Array,
  fileName = 'document.docx'
): Promise<ParsedWordBlock[]> {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.txt') || lower.endsWith('.md')) {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(fileBytes);
    const lines = text.split(/\r?\n/);
    const blocks: ParsedWordBlock[] = [];
    let pendingTableRows: string[][] = [];

    const flushTable = () => {
      if (pendingTableRows.length > 0) {
        blocks.push({ type: 'table', rows: pendingTableRows });
        pendingTableRows = [];
      }
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        flushTable();
        continue;
      }
      if (line.startsWith('|') && line.endsWith('|') && line.length > 2) {
        const inner = line.slice(1, -1).split('|').map((c) => c.trim());
        // Skip markdown separator row like | --- | --- |
        if (inner.every((c) => /^[-:]+$/.test(c))) {
          continue;
        }
        pendingTableRows.push(inner);
        continue;
      }
      flushTable();
      if (line.startsWith('# ')) {
        blocks.push({ type: 'heading1', text: line.slice(2).trim(), bold: true });
      } else if (line.startsWith('## ')) {
        blocks.push({ type: 'heading2', text: line.slice(3).trim(), bold: true });
      } else if (line.startsWith('### ')) {
        blocks.push({ type: 'heading3', text: line.slice(4).trim(), bold: true });
      } else if (/^([-*•]|\d+\.)\s+/.test(line)) {
        blocks.push({ type: 'bullet', text: line.replace(/^([-*•]|\d+\.)\s+/, '').trim() });
      } else {
        blocks.push({ type: 'paragraph', text: line });
      }
    }
    flushTable();
    return blocks;
  }

  // Parse .docx ZIP archive
  const zip = await JSZip.loadAsync(fileBytes);
  const docXmlFile = zip.file('word/document.xml');
  if (!docXmlFile) {
    throw new Error('Invalid .docx file: missing word/document.xml inside OpenXML package.');
  }

  const xml = await docXmlFile.async('string');
  const blocks: ParsedWordBlock[] = [];

  // Tokenize top-level <w:tbl>...</w:tbl> and <w:p>...</w:p> in document order
  const tokenRegex = /<w:tbl[\s>][\s\S]*?<\/w:tbl>|<w:p[\s>][\s\S]*?<\/w:p>/g;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(xml)) !== null) {
    const chunk = match[0];
    if (chunk.startsWith('<w:tbl')) {
      const rows: string[][] = [];
      const trRegex = /<w:tr[\s>][\s\S]*?<\/w:tr>/g;
      let trMatch: RegExpExecArray | null;
      while ((trMatch = trRegex.exec(chunk)) !== null) {
        const rowCells: string[] = [];
        const tcRegex = /<w:tc[\s>][\s\S]*?<\/w:tc>/g;
        let tcMatch: RegExpExecArray | null;
        while ((tcMatch = tcRegex.exec(trMatch[0])) !== null) {
          const tMatches = tcMatch[0].match(/<w:t(?:\s+[^>]*)?>([\s\S]*?)<\/w:t>/g) || [];
          const cellText = tMatches
            .map((t) => unescapeXmlEntities(t.replace(/<\/?w:t[^>]*>/g, '')))
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
          rowCells.push(cellText);
        }
        if (rowCells.length > 0) {
          rows.push(rowCells);
        }
      }
      if (rows.length > 0) {
        blocks.push({ type: 'table', rows });
      }
    } else if (chunk.startsWith('<w:p')) {
      const tMatches = chunk.match(/<w:t(?:\s+[^>]*)?>([\s\S]*?)<\/w:t>/g) || [];
      const text = tMatches
        .map((t) => unescapeXmlEntities(t.replace(/<\/?w:t[^>]*>/g, '')))
        .join('')
        .replace(/\s+/g, ' ')
        .trim();
      if (!text) continue;

      const styleMatch = chunk.match(/<w:pStyle\s+w:val="([^"]+)"/i);
      const styleVal = styleMatch ? styleMatch[1].toLowerCase() : '';
      const isList = /<w:numPr[\s>]/.test(chunk);
      const isBold = /<w:b(?:\s|\/|>)/.test(chunk);
      const isItalic = /<w:i(?:\s|\/|>)/.test(chunk);

      if (styleVal.includes('heading1') || styleVal === 'title') {
        blocks.push({ type: 'heading1', text, bold: true });
      } else if (styleVal.includes('heading2') || styleVal === 'subtitle') {
        blocks.push({ type: 'heading2', text, bold: true });
      } else if (styleVal.includes('heading3') || styleVal.includes('heading4')) {
        blocks.push({ type: 'heading3', text, bold: true });
      } else if (isList || styleVal.includes('list')) {
        blocks.push({ type: 'bullet', text, bold: isBold, italic: isItalic });
      } else {
        blocks.push({ type: 'paragraph', text, bold: isBold, italic: isItalic });
      }
    }
  }

  return blocks;
}

/**
 * Word-wraps a line of text to fit within maxWidthPt using the provided pdf-lib font.
 */
function wrapTextLines(
  text: string,
  font: { widthOfTextAtSize: (t: string, s: number) => number },
  fontSize: number,
  maxWidthPt: number
): string[] {
  const safe = sanitizeWinAnsiText(text);
  const words = safe.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [''];

  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const candidate = `${currentLine} ${word}`;
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidthPt) {
      currentLine = candidate;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

/**
 * Renders parsed Word blocks into a paginated vector PDF document via pdf-lib.
 */
export async function convertWordBlocksToPdf(
  blocks: ParsedWordBlock[],
  originalFileName = 'document.docx',
  options: {
    pageSize?: WordPdfPageSize;
    orientation?: 'portrait' | 'landscape';
    margin?: WordPdfMargin;
    includePageNumbers?: boolean;
  } = {}
): Promise<WordToPdfResult> {
  const pageSize = options.pageSize || 'a4';
  const orientation = options.orientation || 'portrait';
  const marginPreset = options.margin || 'normal';
  const includePageNumbers = options.includePageNumbers ?? true;

  const baseDims =
    pageSize === 'letter'
      ? { w: 612, h: 792 }
      : pageSize === 'legal'
      ? { w: 612, h: 1008 }
      : { w: 595.28, h: 841.89 };

  const pageWidth = orientation === 'landscape' ? baseDims.h : baseDims.w;
  const pageHeight = orientation === 'landscape' ? baseDims.w : baseDims.h;
  const marginPt = marginPreset === 'narrow' ? 36 : marginPreset === 'wide' ? 72 : 54;
  const contentWidth = pageWidth - marginPt * 2;

  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let cursorY = pageHeight - marginPt;

  const ensureSpace = (neededPt: number) => {
    if (cursorY - neededPt < marginPt + 24) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      cursorY = pageHeight - marginPt;
    }
  };

  let wordCount = 0;
  let paragraphCount = 0;
  let tableCount = 0;

  for (const b of blocks) {
    if (b.type === 'table' && b.rows && b.rows.length > 0) {
      tableCount++;
      const colCount = Math.max(1, ...b.rows.map((r) => r.length));
      const colWidth = contentWidth / colCount;
      const rowHeight = 20;

      cursorY -= 6;
      for (let rIdx = 0; rIdx < b.rows.length; rIdx++) {
        ensureSpace(rowHeight + 4);
        const row = b.rows[rIdx];
        const rowTop = cursorY;
        const rowBottom = cursorY - rowHeight;

        if (rIdx === 0) {
          currentPage.drawRectangle({
            x: marginPt,
            y: rowBottom,
            width: contentWidth,
            height: rowHeight,
            color: rgb(0.94, 0.96, 0.98),
          });
        }

        for (let cIdx = 0; cIdx < colCount; cIdx++) {
          const cellX = marginPt + cIdx * colWidth;
          currentPage.drawRectangle({
            x: cellX,
            y: rowBottom,
            width: colWidth,
            height: rowHeight,
            borderColor: rgb(0.8, 0.84, 0.88),
            borderWidth: 0.5,
          });
          const rawCell = sanitizeWinAnsiText(row[cIdx] || '');
          wordCount += rawCell.split(/\s+/).filter(Boolean).length;
          const activeFont = rIdx === 0 ? fontBold : fontRegular;
          // Truncate cell text cleanly to fit column width
          let displayCell = rawCell;
          while (
            displayCell.length > 1 &&
            activeFont.widthOfTextAtSize(displayCell, 9.5) > colWidth - 8
          ) {
            displayCell = displayCell.slice(0, -2) + '...';
          }
          currentPage.drawText(displayCell, {
            x: cellX + 4,
            y: rowBottom + 6,
            size: 9.5,
            font: activeFont,
            color: rgb(0.1, 0.14, 0.2),
          });
        }
        cursorY = rowBottom;
      }
      cursorY -= 10;
      continue;
    }

    const rawText = b.text || '';
    if (!rawText.trim()) continue;
    paragraphCount++;
    wordCount += rawText.split(/\s+/).filter(Boolean).length;

    const fontSize =
      b.type === 'heading1'
        ? 18
        : b.type === 'heading2'
        ? 14.5
        : b.type === 'heading3'
        ? 12.5
        : 11;
    const lineHeight = fontSize * 1.42;
    const activeFont =
      b.type.startsWith('heading') || b.bold
        ? fontBold
        : b.italic
        ? fontItalic
        : fontRegular;
    const indent = b.type === 'bullet' ? 16 : 0;
    const wrapped = wrapTextLines(
      b.type === 'bullet' ? `*  ${rawText}` : rawText,
      activeFont,
      fontSize,
      contentWidth - indent
    );

    if (b.type.startsWith('heading')) {
      cursorY -= 6;
    }

    for (const line of wrapped) {
      ensureSpace(lineHeight);
      cursorY -= fontSize;
      currentPage.drawText(line, {
        x: marginPt + indent,
        y: cursorY,
        size: fontSize,
        font: activeFont,
        color: b.type.startsWith('heading') ? rgb(0.06, 0.09, 0.16) : rgb(0.15, 0.2, 0.28),
      });
      cursorY -= lineHeight - fontSize;
    }

    cursorY -= b.type === 'bullet' ? 3 : 7;
  }

  // Optional Page Numbers Footer
  const allPages = pdfDoc.getPages();
  if (includePageNumbers) {
    for (let i = 0; i < allPages.length; i++) {
      const p = allPages[i];
      const footerLabel = `Page ${i + 1} of ${allPages.length}`;
      const labelW = fontRegular.widthOfTextAtSize(footerLabel, 9);
      p.drawText(footerLabel, {
        x: (pageWidth - labelW) / 2,
        y: 22,
        size: 9,
        font: fontRegular,
        color: rgb(0.45, 0.5, 0.58),
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  const pdfBlob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const baseName = originalFileName.replace(/\.(docx|doc|txt|md)$/i, '') || 'document';

  return {
    fileName: `${baseName}.pdf`,
    pageCount: allPages.length,
    wordCount,
    paragraphCount,
    tableCount,
    blocks,
    pdfBytes,
    pdfBlob,
  };
}

/**
 * High-level helper to convert one or more .docx/.txt/.md files into a single PDF.
 */
export async function convertWordFilesToPdf(
  files: { name: string; bytes: Uint8Array }[],
  options: {
    pageSize?: WordPdfPageSize;
    orientation?: 'portrait' | 'landscape';
    margin?: WordPdfMargin;
    includePageNumbers?: boolean;
  } = {}
): Promise<WordToPdfResult> {
  const combinedBlocks: ParsedWordBlock[] = [];
  for (const f of files) {
    const blocks = await parseDocxOrTextToBlocks(f.bytes, f.name);
    combinedBlocks.push(...blocks);
  }
  const firstFileName = files[0]?.name || 'document.docx';
  return await convertWordBlocksToPdf(combinedBlocks, firstFileName, options);
}
