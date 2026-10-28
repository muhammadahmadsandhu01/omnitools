import JSZip from 'jszip';
import {
  extractPdfPages,
  parsePdfPageRangeString,
  type PdfPageExtraction,
} from './pdfClientEngine';

export type PdfToWordMode = 'editable_flow' | 'exact_page_breaks';
export type PdfToWordExportFormat = 'docx' | 'md' | 'txt';

export interface ReconstructedDocBlock {
  type: 'heading1' | 'heading2' | 'heading3' | 'bullet' | 'table' | 'paragraph' | 'page_break';
  text?: string;
  rows?: string[][];
  pageNumber: number;
}

export interface PdfToWordResult {
  fileName: string;
  pageCount: number;
  wordCount: number;
  characterCount: number;
  tableCount: number;
  headingCount: number;
  blocks: ReconstructedDocBlock[];
  docxBlob: Blob;
  docxBytes: Uint8Array;
  markdownText: string;
  plainText: string;
}

export function escapeXml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    // Strip control characters invalid in XML 1.0
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

/**
 * Reconstructs structured semantic blocks (Headings, Tables, Bullets, Paragraphs)
 * from extracted PDF page lines using X/Y spatial coordinates and font size distribution.
 */
export function reconstructBlocksFromPages(
  pages: PdfPageExtraction[],
  mode: PdfToWordMode = 'editable_flow'
): ReconstructedDocBlock[] {
  const blocks: ReconstructedDocBlock[] = [];

  for (let pIdx = 0; pIdx < pages.length; pIdx++) {
    const page = pages[pIdx];
    const lines = page.lines;

    let pendingTableRows: string[][] = [];
    let pendingParagraphLines: string[] = [];

    const flushParagraph = () => {
      if (pendingParagraphLines.length > 0) {
        blocks.push({
          type: 'paragraph',
          text: pendingParagraphLines.join(' ').replace(/\s+/g, ' ').trim(),
          pageNumber: page.pageNumber,
        });
        pendingParagraphLines = [];
      }
    };

    const flushTable = () => {
      if (pendingTableRows.length >= 2) {
        // Normalize column counts
        const maxCols = Math.max(...pendingTableRows.map((r) => r.length));
        const normalizedRows = pendingTableRows.map((r) => {
          const copy = [...r];
          while (copy.length < maxCols) copy.push('');
          return copy;
        });
        blocks.push({
          type: 'table',
          rows: normalizedRows,
          pageNumber: page.pageNumber,
        });
      } else if (pendingTableRows.length === 1) {
        blocks.push({
          type: 'paragraph',
          text: pendingTableRows[0].join('   '),
          pageNumber: page.pageNumber,
        });
      }
      pendingTableRows = [];
    };

    for (let lIdx = 0; lIdx < lines.length; lIdx++) {
      const line = lines[lIdx];
      const text = line.text.trim();
      if (!text) continue;

      // Check if line has multiple distinct X-separated columns (Table candidate)
      const distinctColumns: string[] = [];
      if (line.items.length >= 2) {
        let curCell = line.items[0].text;
        let lastRight = line.items[0].x + line.items[0].width;
        for (let i = 1; i < line.items.length; i++) {
          const item = line.items[i];
          const gap = item.x - lastRight;
          if (gap > Math.max(18, line.fontSize * 1.4)) {
            distinctColumns.push(curCell.trim());
            curCell = item.text;
          } else {
            curCell += ' ' + item.text;
          }
          lastRight = Math.max(lastRight, item.x + item.width);
        }
        distinctColumns.push(curCell.trim());
      }

      if (distinctColumns.length >= 2) {
        flushParagraph();
        pendingTableRows.push(distinctColumns);
        continue;
      } else {
        flushTable();
      }

      // Check for Heading by fontSize
      if (line.fontSize >= 17.5 && text.length < 140) {
        flushParagraph();
        blocks.push({
          type: 'heading1',
          text,
          pageNumber: page.pageNumber,
        });
        continue;
      }
      if (line.fontSize >= 14 && text.length < 160) {
        flushParagraph();
        blocks.push({
          type: 'heading2',
          text,
          pageNumber: page.pageNumber,
        });
        continue;
      }
      if (line.fontSize >= 12.5 && text.length < 120 && /^[A-Z0-9\s:&—–-]+$/.test(text)) {
        flushParagraph();
        blocks.push({
          type: 'heading3',
          text,
          pageNumber: page.pageNumber,
        });
        continue;
      }

      // Check for Bullet / Numbered List item
      if (/^([•●▪▸*-]|\d+[.)])\s+/.test(text)) {
        flushParagraph();
        blocks.push({
          type: 'bullet',
          text: text.replace(/^([•●▪▸*-]|\d+[.)])\s+/, '').trim(),
          pageNumber: page.pageNumber,
        });
        continue;
      }

      // Otherwise accumulate into paragraph (or flush if vertical gap to next line is large)
      pendingParagraphLines.push(text);
      const nextLine = lines[lIdx + 1];
      if (!nextLine || Math.abs(line.y - nextLine.y) > line.fontSize * 1.9 || mode === 'exact_page_breaks') {
        flushParagraph();
      }
    }

    flushParagraph();
    flushTable();

    if (pIdx < pages.length - 1) {
      blocks.push({
        type: 'page_break',
        pageNumber: page.pageNumber,
      });
    }
  }

  return blocks;
}

/**
 * Builds a valid ECMA-376 OpenXML Word (.docx) binary archive from reconstructed blocks using JSZip.
 */
export async function buildDocxFromBlocks(
  blocks: ReconstructedDocBlock[],
  title = 'Converted Document'
): Promise<Uint8Array> {
  const zip = new JSZip();

  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
</Types>`
  );

  zip.folder('_rels')?.file(
    '.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>`
  );

  zip.folder('docProps')?.file(
    'core.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${escapeXml(title)}</dc:title>
  <dc:creator>KivaroTools Client-Side PDF to Word Engine</dc:creator>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
</cp:coreProperties>`
  );

  const wordFolder = zip.folder('word');
  wordFolder?.folder('_rels')?.file(
    'document.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
  );

  wordFolder?.file(
    'styles.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="280" w:after="120"/></w:pPr>
    <w:rPr><w:b/><w:color w:val="0F172A"/><w:sz w:val="36"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="220" w:after="100"/></w:pPr>
    <w:rPr><w:b/><w:color w:val="1E293B"/><w:sz w:val="28"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="180" w:after="80"/></w:pPr>
    <w:rPr><w:b/><w:color w:val="334155"/><w:sz w:val="24"/></w:rPr>
  </w:style>
</w:styles>`
  );

  const bodyParts: string[] = [];

  for (const b of blocks) {
    if (b.type === 'page_break') {
      bodyParts.push(`<w:p><w:r><w:br w:type="page"/></w:r></w:p>`);
    } else if (b.type === 'heading1' || b.type === 'heading2' || b.type === 'heading3') {
      const styleId =
        b.type === 'heading1' ? 'Heading1' : b.type === 'heading2' ? 'Heading2' : 'Heading3';
      bodyParts.push(
        `<w:p><w:pPr><w:pStyle w:val="${styleId}"/></w:pPr><w:r><w:t xml:space="preserve">${escapeXml(
          b.text || ''
        )}</w:t></w:r></w:p>`
      );
    } else if (b.type === 'bullet') {
      bodyParts.push(
        `<w:p><w:pPr><w:ind w:left="480" w:hanging="240"/></w:pPr><w:r><w:t xml:space="preserve">•  ${escapeXml(
          b.text || ''
        )}</w:t></w:r></w:p>`
      );
    } else if (b.type === 'table' && b.rows && b.rows.length > 0) {
      const trXml = b.rows
        .map((row, rIdx) => {
          const tcXml = row
            .map(
              (cell) =>
                `<w:tc>
                  <w:tcPr>
                    <w:tcBorders>
                      <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                      <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                      <w:left w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                      <w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                    </w:tcBorders>
                    ${rIdx === 0 ? '<w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>' : ''}
                  </w:tcPr>
                  <w:p><w:r>${rIdx === 0 ? '<w:rPr><w:b/></w:rPr>' : ''}<w:t xml:space="preserve">${escapeXml(
                  cell
                )}</w:t></w:r></w:p>
                </w:tc>`
            )
            .join('');
          return `<w:tr>${tcXml}</w:tr>`;
        })
        .join('');
      bodyParts.push(
        `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/></w:tblPr>${trXml}</w:tbl><w:p/>`
      );
    } else if (b.text) {
      bodyParts.push(
        `<w:p><w:r><w:t xml:space="preserve">${escapeXml(b.text)}</w:t></w:r></w:p>`
      );
    }
  }

  if (bodyParts.length === 0) {
    bodyParts.push(
      `<w:p><w:r><w:t xml:space="preserve">[No extractable text layer found in PDF. This document may be a flat image scan.]</w:t></w:r></w:p>`
    );
  }

  wordFolder?.file(
    'document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyParts.join('\n    ')}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`
  );

  return await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
}

/**
 * Converts a PDF byte buffer into a structured Word (.docx) document, Markdown, and Plain Text.
 */
export async function convertPdfToWord(
  pdfBytes: Uint8Array,
  originalFileName = 'document.pdf',
  options: {
    mode?: PdfToWordMode;
    pageRange?: string;
  } = {}
): Promise<PdfToWordResult> {
  const allPages = await extractPdfPages(pdfBytes);
  const selectedPageNumbers = parsePdfPageRangeString(options.pageRange || 'all', allPages.length);
  const selectedSet = new Set(selectedPageNumbers);
  const filteredPages = allPages.filter((p) => selectedSet.has(p.pageNumber));

  const blocks = reconstructBlocksFromPages(filteredPages, options.mode || 'editable_flow');
  const baseName = originalFileName.replace(/\.pdf$/i, '') || 'document';
  const docxBytes = await buildDocxFromBlocks(blocks, baseName);
  const docxBlob = new Blob([docxBytes as unknown as BlobPart], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  const mdLines: string[] = [];
  const txtLines: string[] = [];
  let tableCount = 0;
  let headingCount = 0;

  for (const b of blocks) {
    if (b.type === 'heading1') {
      headingCount++;
      mdLines.push(`# ${b.text}\n`);
      txtLines.push(`${b.text}\n`);
    } else if (b.type === 'heading2') {
      headingCount++;
      mdLines.push(`## ${b.text}\n`);
      txtLines.push(`${b.text}\n`);
    } else if (b.type === 'heading3') {
      headingCount++;
      mdLines.push(`### ${b.text}\n`);
      txtLines.push(`${b.text}\n`);
    } else if (b.type === 'bullet') {
      mdLines.push(`- ${b.text}`);
      txtLines.push(`• ${b.text}`);
    } else if (b.type === 'table' && b.rows && b.rows.length > 0) {
      tableCount++;
      const header = b.rows[0];
      mdLines.push(`| ${header.join(' | ')} |`);
      mdLines.push(`| ${header.map(() => '---').join(' | ')} |`);
      for (let i = 1; i < b.rows.length; i++) {
        mdLines.push(`| ${b.rows[i].join(' | ')} |`);
      }
      mdLines.push('');
      for (const r of b.rows) {
        txtLines.push(r.join('\t'));
      }
      txtLines.push('');
    } else if (b.type === 'page_break') {
      mdLines.push(`\n---\n`);
      txtLines.push(`\n--- Page Break ---\n`);
    } else if (b.text) {
      mdLines.push(`${b.text}\n`);
      txtLines.push(`${b.text}\n`);
    }
  }

  const plainText = txtLines.join('\n').trim();
  const markdownText = mdLines.join('\n').trim();
  const words = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;

  return {
    fileName: `${baseName}.docx`,
    pageCount: filteredPages.length,
    wordCount: words,
    characterCount: plainText.length,
    tableCount,
    headingCount,
    blocks,
    docxBlob,
    docxBytes,
    markdownText,
    plainText,
  };
}


export function blocksToMarkdown(blocks: Array<{ type: string; text?: string; items?: string[]; rows?: string[][] }>): string {
  const out: string[] = [];
  for (const b of blocks) {
    if (b.type === 'heading1') out.push(`# ${b.text || ''}`);
    else if (b.type === 'heading2') out.push(`## ${b.text || ''}`);
    else if (b.type === 'heading3') out.push(`### ${b.text || ''}`);
    else if (b.type === 'paragraph' && b.text) out.push(b.text);
    else if (b.type === 'list' && b.items) out.push(b.items.map((it) => `- ${it}`).join('\n'));
    else if (b.type === 'table' && b.rows && b.rows.length > 0) {
      const header = b.rows[0];
      out.push(`| ${header.join(' | ')} |`);
      out.push(`| ${header.map(() => '---').join(' | ')} |`);
      for (const r of b.rows.slice(1)) out.push(`| ${r.join(' | ')} |`);
    }
  }
  return out.join('\n\n');
}

export function blocksToPlainText(blocks: Array<{ type: string; text?: string; items?: string[]; rows?: string[][] }>): string {
  const out: string[] = [];
  for (const b of blocks) {
    if (b.text) out.push(b.text);
    else if (b.type === 'list' && b.items) out.push(b.items.map((it) => `• ${it}`).join('\n'));
    else if (b.type === 'table' && b.rows) out.push(b.rows.map((r) => r.join('\t')).join('\n'));
  }
  return out.join('\n\n');
}
