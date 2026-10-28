import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';
import {
  renderPdfPageToDataUrl,
  parsePdfPageRangeString,
} from './pdfClientEngine';

export type PdfImageOutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';
export type PdfImageDpiTier = 72 | 150 | 300 | 600;

export interface RenderedPdfPageImage {
  pageNumber: number;
  fileName: string;
  dataUrl: string;
  widthPx: number;
  heightPx: number;
  byteSize: number;
}

export interface PdfToJpgResult {
  zipFileName: string;
  pageCount: number;
  totalPagesInPdf: number;
  format: PdfImageOutputFormat;
  dpi: PdfImageDpiTier;
  images: RenderedPdfPageImage[];
  zipBytes: Uint8Array;
  zipBlob: Blob;
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] || '';
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }
  const bin = atob(base64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}

/**
 * Converts selected pages of a PDF into high-DPI JPG, PNG, or WebP images and packages them into a ZIP archive.
 */
export async function convertPdfToImages(
  pdfBytes: Uint8Array,
  originalFileName = 'document.pdf',
  options: {
    format?: PdfImageOutputFormat;
    dpi?: PdfImageDpiTier;
    quality?: number;
    pageRange?: string;
    backgroundColor?: string;
    onProgress?: (current: number, total: number) => void;
  } = {}
): Promise<PdfToJpgResult> {
  const format = options.format || 'image/jpeg';
  const dpi = options.dpi || 150;
  const quality = options.quality ?? 0.92;
  const backgroundColor = options.backgroundColor || '#ffffff';

  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();
  const selectedPages = parsePdfPageRangeString(options.pageRange || 'all', totalPages);

  const ext =
    format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg';
  const baseName = originalFileName.replace(/\.pdf$/i, '') || 'document';

  const zip = new JSZip();
  const images: RenderedPdfPageImage[] = [];

  for (let i = 0; i < selectedPages.length; i++) {
    const pageNum = selectedPages[i];
    options.onProgress?.(i + 1, selectedPages.length);

    const rendered = await renderPdfPageToDataUrl(pdfBytes, pageNum, {
      dpi,
      format,
      quality,
      backgroundColor,
    });

    const imgBytes = dataUrlToBytes(rendered.dataUrl);
    const padded = String(pageNum).padStart(String(totalPages).length || 2, '0');
    const imgFileName = `${baseName}_page_${padded}.${ext}`;

    zip.file(imgFileName, imgBytes);

    images.push({
      pageNumber: pageNum,
      fileName: imgFileName,
      dataUrl: rendered.dataUrl,
      widthPx: rendered.widthPx,
      heightPx: rendered.heightPx,
      byteSize: imgBytes.byteLength,
    });
  }

  const zipBytes = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
  const zipBlob = new Blob([zipBytes as unknown as BlobPart], { type: 'application/zip' });

  return {
    zipFileName: `${baseName}_${ext}_${dpi}dpi.zip`,
    pageCount: images.length,
    totalPagesInPdf: totalPages,
    format,
    dpi,
    images,
    zipBytes,
    zipBlob,
  };
}


export const MAX_CANVAS_SIDE = 4096;

export function calculateDpiDimensions(
  widthPt: number,
  heightPt: number,
  dpi: 72 | 150 | 300 | 600
): { widthPx: number; heightPx: number; scale: number } {
  const rawScale = dpi / 72;
  let widthPx = Math.round(widthPt * rawScale);
  let heightPx = Math.round(heightPt * rawScale);
  const maxEdge = Math.max(widthPx, heightPx);
  if (maxEdge > MAX_CANVAS_SIDE) {
    const clampRatio = MAX_CANVAS_SIDE / maxEdge;
    widthPx = Math.round(widthPx * clampRatio);
    heightPx = Math.round(heightPx * clampRatio);
  }
  return { widthPx, heightPx, scale: widthPx / widthPt };
}
