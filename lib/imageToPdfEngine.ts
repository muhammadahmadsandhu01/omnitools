import { PDFDocument, rgb } from 'pdf-lib';
import JSZip from 'jszip';

export type PageSizePreset = 'a4' | 'a3' | 'a5' | 'letter' | 'legal' | 'fit' | 'custom';
export type PageOrientation = 'auto' | 'portrait' | 'landscape';
export type MarginPreset = 'none' | 'small' | 'large' | 'custom';
export type ImagePlacement = 'contain' | 'cover' | 'actual';
export type QualityPreset = 'original' | 'high' | 'medium' | 'low';
export type OutputMode = 'single' | 'separate';

export interface CustomDimensions {
  width: number;
  height: number;
  unit: 'mm' | 'in' | 'pt';
}

export interface ImageToPdfOptions {
  pageSize: PageSizePreset;
  customDimensions?: CustomDimensions;
  orientation: PageOrientation;
  margin: MarginPreset;
  customMarginPt?: number;
  placement: ImagePlacement;
  backgroundColor: string; // Hex string e.g. '#ffffff'
  quality: QualityPreset;
  outputFilename: string;
  outputMode: OutputMode;
}

export interface ImageQueueItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl: string;
  width: number;
  height: number;
  rotation: number; // 0, 90, 180, 270
  isValid: boolean;
  errorMessage?: string;
}

export interface ConversionProgress {
  phase: 'preparing' | 'processing' | 'generating' | 'packaging' | 'complete';
  currentImageIndex: number;
  totalImages: number;
  percentage: number;
  message: string;
}

export interface ConversionResult {
  blob: Blob;
  downloadUrl: string;
  filename: string;
  byteSize: number;
  pageCount: number;
  isZip: boolean;
}

// 1 inch = 72 pt, 1 mm = 72 / 25.4 pt = ~2.83464567 pt
export const MM_TO_PT = 72 / 25.4;
export const IN_TO_PT = 72;

export const PAGE_SIZE_POINTS: Record<Exclude<PageSizePreset, 'fit' | 'custom'>, { width: number; height: number; name: string }> = {
  a4: { width: 595.28, height: 841.89, name: 'A4 (210 × 297 mm)' },
  a3: { width: 841.89, height: 1190.55, name: 'A3 (297 × 420 mm)' },
  a5: { width: 419.53, height: 595.28, name: 'A5 (148 × 210 mm)' },
  letter: { width: 612.0, height: 792.0, name: 'US Letter (8.5 × 11 in)' },
  legal: { width: 612.0, height: 1008.0, name: 'US Legal (8.5 × 14 in)' },
};

export const MARGIN_POINTS: Record<Exclude<MarginPreset, 'custom'>, number> = {
  none: 0,
  small: 20, // ~7.0 mm
  large: 40, // ~14.1 mm
};

export const QUALITY_CONFIG: Record<QualityPreset, { label: string; quality: number; format: 'original' | 'jpeg' }> = {
  original: { label: 'Original / Lossless', quality: 1.0, format: 'original' },
  high: { label: 'High (92%)', quality: 0.92, format: 'jpeg' },
  medium: { label: 'Standard (80%)', quality: 0.80, format: 'jpeg' },
  low: { label: 'Compressed (60%)', quality: 0.60, format: 'jpeg' },
};

export const SUPPORTED_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif', 'svg', 'heic', 'heif'
];

export const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/bmp',
  'image/x-ms-bmp',
  'image/gif',
  'image/svg+xml',
  'image/heic',
  'image/heif',
];

/**
 * Parses a hex color string (e.g. #ffffff or #f3f4f6) into pdf-lib RGB values (0 to 1).
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  if (!hex || typeof hex !== 'string') return { r: 1, g: 1, b: 1 };
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16) / 255;
    const g = parseInt(clean[1] + clean[1], 16) / 255;
    const b = parseInt(clean[2] + clean[2], 16) / 255;
    if (isNaN(r) || isNaN(g) || isNaN(b)) return { r: 1, g: 1, b: 1 };
    return { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    if (isNaN(r) || isNaN(g) || isNaN(b)) return { r: 1, g: 1, b: 1 };
    return { r, g, b };
  }
  return { r: 1, g: 1, b: 1 }; // Default to white
}

/**
 * Calculates page dimensions in points (pt) given options and image dimensions.
 */
export function calculatePageDimensions(
  pageSize: PageSizePreset,
  orientation: PageOrientation,
  imgWidth: number,
  imgHeight: number,
  customDimensions?: CustomDimensions
): { width: number; height: number } {
  if (pageSize === 'fit') {
    // When fitting to image, 1 image pixel = 1 pt at 72 DPI
    return { width: Math.max(1, imgWidth), height: Math.max(1, imgHeight) };
  }

  let baseWidth: number;
  let baseHeight: number;

  if (pageSize === 'custom' && customDimensions) {
    const unitFactor = customDimensions.unit === 'mm' ? MM_TO_PT : customDimensions.unit === 'in' ? IN_TO_PT : 1;
    baseWidth = Math.max(10, customDimensions.width * unitFactor);
    baseHeight = Math.max(10, customDimensions.height * unitFactor);
  } else {
    const preset = PAGE_SIZE_POINTS[pageSize as keyof typeof PAGE_SIZE_POINTS] || PAGE_SIZE_POINTS.a4;
    baseWidth = preset.width;
    baseHeight = preset.height;
  }

  // Ensure standard portrait orientation for comparison (width <= height)
  const portraitWidth = Math.min(baseWidth, baseHeight);
  const portraitHeight = Math.max(baseWidth, baseHeight);

  if (orientation === 'landscape') {
    return { width: portraitHeight, height: portraitWidth };
  } else if (orientation === 'portrait') {
    return { width: portraitWidth, height: portraitHeight };
  } else {
    // Auto: match the aspect ratio of the image
    const isImageLandscape = imgWidth > imgHeight;
    return isImageLandscape
      ? { width: portraitHeight, height: portraitWidth }
      : { width: portraitWidth, height: portraitHeight };
  }
}

/**
 * Calculates the bounding box and position of an image inside a page with margins and placement modes.
 */
export function calculateImagePlacement(
  pageWidth: number,
  pageHeight: number,
  marginPt: number,
  imgWidth: number,
  imgHeight: number,
  placement: ImagePlacement
): { x: number; y: number; width: number; height: number } {
  const printableWidth = Math.max(1, pageWidth - marginPt * 2);
  const printableHeight = Math.max(1, pageHeight - marginPt * 2);

  if (placement === 'actual') {
    // 1:1 image sizing (at 72 DPI: 1 px = 1 pt). If it exceeds printable area, downscale to contain.
    if (imgWidth <= printableWidth && imgHeight <= printableHeight) {
      const x = marginPt + (printableWidth - imgWidth) / 2;
      const y = marginPt + (printableHeight - imgHeight) / 2;
      return { x, y, width: imgWidth, height: imgHeight };
    }
  }

  if (placement === 'cover') {
    // Scale up to cover printable area, centering it
    const scale = Math.max(printableWidth / imgWidth, printableHeight / imgHeight);
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;
    const x = marginPt + (printableWidth - drawWidth) / 2;
    const y = marginPt + (printableHeight - drawHeight) / 2;
    return { x, y, width: drawWidth, height: drawHeight };
  }

  // Default: contain / fit
  const scale = Math.min(printableWidth / imgWidth, printableHeight / imgHeight);
  const drawWidth = imgWidth * scale;
  const drawHeight = imgHeight * scale;
  const x = marginPt + (printableWidth - drawWidth) / 2;
  const y = marginPt + (printableHeight - drawHeight) / 2;
  return { x, y, width: drawWidth, height: drawHeight };
}

/**
 * Safely sanitizes a user-specified PDF filename.
 */
export function sanitizePdfFilename(name: string, fallback: string = 'images-to-pdf.pdf'): string {
  if (!name || typeof name !== 'string') return fallback;
  let cleaned = name.trim().replace(/\.pdf$/i, '');
  cleaned = cleaned.replace(/\.\.+/g, '_').replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
  cleaned = cleaned.replace(/[. ]+$/, '');
  if (!cleaned) return fallback;
  return `${cleaned}.pdf`;
}

/**
 * Checks if a file has an acceptable image extension or MIME type.
 */
export function isSupportedImageFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (SUPPORTED_EXTENSIONS.includes(ext)) return true;
  if (SUPPORTED_MIME_TYPES.includes(file.type.toLowerCase())) return true;
  return false;
}

/**
 * Decodes an image file and rotates/re-encodes it via Canvas.
 * Supports JPEG, PNG, WebP, BMP, GIF (first frame), SVG, and HEIC (via heic2any).
 */
export async function processImageForPdf(
  file: File,
  rotation: number,
  quality: QualityPreset,
  backgroundColor: string
): Promise<{
  bytes: Uint8Array;
  format: 'jpeg' | 'png';
  width: number;
  height: number;
}> {
  let sourceBlob: Blob = file;

  // Handle HEIC / HEIF files using dynamic import of heic2any
  const lowerName = file.name.toLowerCase();
  const lowerType = file.type.toLowerCase();
  if (lowerType.includes('heic') || lowerType.includes('heif') || lowerName.endsWith('.heic') || lowerName.endsWith('.heif')) {
    try {
      const heic2anyModule = await import('heic2any');
      const heic2any = heic2anyModule.default || heic2anyModule;
      const converted = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.95,
      });
      sourceBlob = Array.isArray(converted) ? converted[0] : converted;
    } catch (err: unknown) {
      throw new Error(`Failed to decode HEIC image: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Load image into HTMLImageElement
  const imageUrl = URL.createObjectURL(sourceBlob);
  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to decode image data for "${file.name}". File may be corrupt or an unsupported format.`));
    img.src = imageUrl;
  });

  URL.revokeObjectURL(imageUrl);

  const naturalWidth = img.naturalWidth || img.width;
  const naturalHeight = img.naturalHeight || img.height;

  if (naturalWidth === 0 || naturalHeight === 0) {
    throw new Error(`Invalid dimensions (0x0) detected in image "${file.name}".`);
  }

  // Normalized rotation in 90-degree increments
  const normRot = ((rotation % 360) + 360) % 360;
  const isRotated90or270 = normRot === 90 || normRot === 270;
  const canvasWidth = isRotated90or270 ? naturalHeight : naturalWidth;
  const canvasHeight = isRotated90or270 ? naturalWidth : naturalHeight;

  // Determine if direct embedding without canvas is possible
  const isOriginalQuality = quality === 'original';
  const isPureJpg = (lowerType === 'image/jpeg' || lowerType === 'image/jpg' || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) && sourceBlob === file;
  const isPurePng = (lowerType === 'image/png' || lowerName.endsWith('.png')) && sourceBlob === file;

  // If no rotation is applied, original quality is requested, and format is direct JPG/PNG:
  if (normRot === 0 && isOriginalQuality && (isPureJpg || isPurePng)) {
    const arrayBuffer = await file.arrayBuffer();
    return {
      bytes: new Uint8Array(arrayBuffer),
      format: isPureJpg ? 'jpeg' : 'png',
      width: naturalWidth,
      height: naturalHeight,
    };
  }

  // Canvas processing for rotation, WebP/BMP/GIF/SVG conversion, or quality compression
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    throw new Error('Canvas 2D context could not be initialized.');
  }

  // Determine output format: retain PNG when original quality is requested on PNG source
  const shouldOutputPng = (isPurePng || lowerType === 'image/png') && isOriginalQuality;
  const mimeType = shouldOutputPng ? 'image/png' : 'image/jpeg';
  const compressionRatio = shouldOutputPng ? 1.0 : QUALITY_CONFIG[quality].quality;

  // Fill canvas background for JPEG output (since JPEG lacks an alpha channel)
  if (!shouldOutputPng && backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // Apply rotation transformation
  ctx.save();
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.rotate((normRot * Math.PI) / 180);
  ctx.drawImage(img, -naturalWidth / 2, -naturalHeight / 2);
  ctx.restore();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Canvas image serialization failed.'));
      },
      mimeType,
      compressionRatio
    );
  });

  const arrayBuffer = await blob.arrayBuffer();

  return {
    bytes: new Uint8Array(arrayBuffer),
    format: shouldOutputPng ? 'png' : 'jpeg',
    width: canvasWidth,
    height: canvasHeight,
  };
}

/**
 * Validates the generated output PDF byte stream before triggering download.
 */
export async function verifyOutputPdfIntegrity(
  bytes: Uint8Array,
  expectedPages: number
): Promise<void> {
  if (!bytes || bytes.byteLength === 0) {
    throw new Error('Generated PDF byte stream is empty.');
  }

  // Header magic check (%PDF-)
  const magic = [0x25, 0x50, 0x44, 0x46, 0x2d];
  let hasMagic = false;
  for (let i = 0; i < Math.min(1024, bytes.byteLength - 5); i++) {
    if (
      bytes[i] === magic[0] &&
      bytes[i + 1] === magic[1] &&
      bytes[i + 2] === magic[2] &&
      bytes[i + 3] === magic[3] &&
      bytes[i + 4] === magic[4]
    ) {
      hasMagic = true;
      break;
    }
  }

  if (!hasMagic) {
    throw new Error('Generated output is missing valid PDF header bytes (%PDF-).');
  }

  const reloaded = await PDFDocument.load(bytes, { updateMetadata: false });
  const actualPages = reloaded.getPageCount();
  if (actualPages !== expectedPages) {
    throw new Error(
      `Page count mismatch during verification: expected ${expectedPages} page(s), but produced ${actualPages}.`
    );
  }
}

/**
 * Builds a single combined multi-page PDF from a queue of images.
 */
export async function generateCombinedPdf(
  items: ImageQueueItem[],
  options: ImageToPdfOptions,
  onProgress?: (progress: ConversionProgress) => void
): Promise<ConversionResult> {
  const validItems = items.filter((i) => i.isValid);
  if (validItems.length === 0) {
    throw new Error('No valid images available for PDF generation.');
  }

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(options.outputFilename.replace(/\.pdf$/i, ''));
  pdfDoc.setCreator('KivaroTools Image to PDF Converter');
  pdfDoc.setProducer('KivaroTools Document Studio');
  pdfDoc.setCreationDate(new Date());

  const bgRgb = hexToRgb(options.backgroundColor);
  const marginPt = options.margin === 'custom' ? (options.customMarginPt || 0) : MARGIN_POINTS[options.margin];

  onProgress?.({
    phase: 'preparing',
    currentImageIndex: 0,
    totalImages: validItems.length,
    percentage: 5,
    message: 'Initializing PDF document...'
  });

  for (let idx = 0; idx < validItems.length; idx++) {
    const item = validItems[idx];
    const itemProgressStart = 10 + Math.round((idx / validItems.length) * 75);

    onProgress?.({
      phase: 'processing',
      currentImageIndex: idx + 1,
      totalImages: validItems.length,
      percentage: itemProgressStart,
      message: `Processing page ${idx + 1} of ${validItems.length}: ${item.name}...`
    });

    const processed = await processImageForPdf(
      item.file,
      item.rotation,
      options.quality,
      options.backgroundColor
    );

    const embeddedImage = processed.format === 'png'
      ? await pdfDoc.embedPng(processed.bytes)
      : await pdfDoc.embedJpg(processed.bytes);

    const pageDims = calculatePageDimensions(
      options.pageSize,
      options.orientation,
      processed.width,
      processed.height,
      options.customDimensions
    );

    const page = pdfDoc.addPage([pageDims.width, pageDims.height]);

    // Fill background color if not default white or if custom non-white
    if (options.backgroundColor !== '#ffffff' && options.backgroundColor !== '#FFFFFF' && options.backgroundColor.toLowerCase() !== 'transparent') {
      page.drawRectangle({
        x: 0,
        y: 0,
        width: pageDims.width,
        height: pageDims.height,
        color: rgb(bgRgb.r, bgRgb.g, bgRgb.b),
      });
    }

    const placement = calculateImagePlacement(
      pageDims.width,
      pageDims.height,
      marginPt,
      processed.width,
      processed.height,
      options.placement
    );

    page.drawImage(embeddedImage, {
      x: placement.x,
      y: placement.y,
      width: placement.width,
      height: placement.height,
    });
  }

  onProgress?.({
    phase: 'generating',
    currentImageIndex: validItems.length,
    totalImages: validItems.length,
    percentage: 90,
    message: 'Serializing PDF binary stream...'
  });

  const pdfBytes = await pdfDoc.save();

  // Validate output integrity (header, page count, parseability)
  await verifyOutputPdfIntegrity(pdfBytes, validItems.length);

  const pdfBlob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(pdfBlob);
  const cleanFilename = sanitizePdfFilename(options.outputFilename);

  onProgress?.({
    phase: 'complete',
    currentImageIndex: validItems.length,
    totalImages: validItems.length,
    percentage: 100,
    message: 'Conversion completed successfully!'
  });

  return {
    blob: pdfBlob,
    downloadUrl,
    filename: cleanFilename,
    byteSize: pdfBlob.size,
    pageCount: validItems.length,
    isZip: false,
  };
}

/**
 * Builds separate individual PDFs for each image and bundles them into a ZIP archive.
 */
export async function generateSeparatePdfsZip(
  items: ImageQueueItem[],
  options: ImageToPdfOptions,
  onProgress?: (progress: ConversionProgress) => void
): Promise<ConversionResult> {
  const validItems = items.filter((i) => i.isValid);
  if (validItems.length === 0) {
    throw new Error('No valid images available for PDF generation.');
  }

  const zip = new JSZip();
  const bgRgb = hexToRgb(options.backgroundColor);
  const marginPt = options.margin === 'custom' ? (options.customMarginPt || 0) : MARGIN_POINTS[options.margin];

  for (let idx = 0; idx < validItems.length; idx++) {
    const item = validItems[idx];

    onProgress?.({
      phase: 'processing',
      currentImageIndex: idx + 1,
      totalImages: validItems.length,
      percentage: Math.round(10 + (idx / validItems.length) * 70),
      message: `Generating individual PDF for ${item.name}...`
    });

    const singleDoc = await PDFDocument.create();
    singleDoc.setTitle(item.name.replace(/\.[^/.]+$/, ''));
    singleDoc.setCreator('KivaroTools Image to PDF Converter');

    const processed = await processImageForPdf(
      item.file,
      item.rotation,
      options.quality,
      options.backgroundColor
    );

    const embeddedImage = processed.format === 'png'
      ? await singleDoc.embedPng(processed.bytes)
      : await singleDoc.embedJpg(processed.bytes);

    const pageDims = calculatePageDimensions(
      options.pageSize,
      options.orientation,
      processed.width,
      processed.height,
      options.customDimensions
    );

    const page = singleDoc.addPage([pageDims.width, pageDims.height]);

    if (options.backgroundColor !== '#ffffff' && options.backgroundColor !== '#FFFFFF' && options.backgroundColor.toLowerCase() !== 'transparent') {
      page.drawRectangle({
        x: 0,
        y: 0,
        width: pageDims.width,
        height: pageDims.height,
        color: rgb(bgRgb.r, bgRgb.g, bgRgb.b),
      });
    }

    const placement = calculateImagePlacement(
      pageDims.width,
      pageDims.height,
      marginPt,
      processed.width,
      processed.height,
      options.placement
    );

    page.drawImage(embeddedImage, {
      x: placement.x,
      y: placement.y,
      width: placement.width,
      height: placement.height,
    });

    const singleBytes = await singleDoc.save();
    const baseName = item.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const pdfName = `${String(idx + 1).padStart(2, '0')}_${baseName}.pdf`;

    zip.file(pdfName, singleBytes);
  }

  onProgress?.({
    phase: 'packaging',
    currentImageIndex: validItems.length,
    totalImages: validItems.length,
    percentage: 85,
    message: 'Compressing individual PDFs into ZIP archive...'
  });

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const downloadUrl = URL.createObjectURL(zipBlob);
  const cleanFilename = (options.outputFilename || 'images-to-pdf')
    .replace(/\.zip$/i, '')
    .replace(/\.pdf$/i, '')
    .trim() + '.zip';

  onProgress?.({
    phase: 'complete',
    currentImageIndex: validItems.length,
    totalImages: validItems.length,
    percentage: 100,
    message: 'ZIP archive generation complete!'
  });

  return {
    blob: zipBlob,
    downloadUrl,
    filename: cleanFilename,
    byteSize: zipBlob.size,
    pageCount: validItems.length,
    isZip: true,
  };
}

/**
 * Validates an image file, decodes dimensions, and creates an ImageQueueItem.
 */
export async function createQueueItemFromFile(file: File, deduplicatedName?: string): Promise<ImageQueueItem> {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const displayName = deduplicatedName || file.name;

  if (!isSupportedImageFile(file)) {
    return {
      id,
      file,
      name: displayName,
      size: file.size,
      type: file.type || 'unknown',
      previewUrl: '',
      width: 0,
      height: 0,
      rotation: 0,
      isValid: false,
      errorMessage: `Unsupported image format. Please upload JPG, PNG, WebP, BMP, GIF, SVG, or HEIC files.`,
    };
  }

  if (file.size === 0) {
    return {
      id,
      file,
      name: displayName,
      size: 0,
      type: file.type || 'unknown',
      previewUrl: '',
      width: 0,
      height: 0,
      rotation: 0,
      isValid: false,
      errorMessage: `File is empty (0 bytes).`,
    };
  }

  let sourceBlob: Blob = file;
  const lowerName = file.name.toLowerCase();
  const lowerType = file.type.toLowerCase();

  if (lowerType.includes('heic') || lowerType.includes('heif') || lowerName.endsWith('.heic') || lowerName.endsWith('.heif')) {
    try {
      const heic2anyModule = await import('heic2any');
      const heic2any = heic2anyModule.default || heic2anyModule;
      const converted = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.85,
      });
      sourceBlob = Array.isArray(converted) ? converted[0] : converted;
    } catch (err: unknown) {
      return {
        id,
        file,
        name: displayName,
        size: file.size,
        type: file.type || 'image/heic',
        previewUrl: '',
        width: 0,
        height: 0,
        rotation: 0,
        isValid: false,
        errorMessage: `Failed to decode HEIC image: ${err instanceof Error ? err.message : 'Corrupt or unsupported HEIC data'}.`,
      };
    }
  }

  try {
    const previewUrl = URL.createObjectURL(sourceBlob);
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to decode image data. File may be corrupted or have a mismatched extension.'));
      img.src = previewUrl;
    });

    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;

    if (width === 0 || height === 0) {
      URL.revokeObjectURL(previewUrl);
      return {
        id,
        file,
        name: displayName,
        size: file.size,
        type: file.type || 'unknown',
        previewUrl: '',
        width: 0,
        height: 0,
        rotation: 0,
        isValid: false,
        errorMessage: `Image has invalid dimensions (0×0).`,
      };
    }

    return {
      id,
      file,
      name: displayName,
      size: file.size,
      type: file.type || 'unknown',
      previewUrl,
      width,
      height,
      rotation: 0,
      isValid: true,
    };
  } catch (err: unknown) {
    return {
      id,
      file,
      name: displayName,
      size: file.size,
      type: file.type || 'unknown',
      previewUrl: '',
      width: 0,
      height: 0,
      rotation: 0,
      isValid: false,
      errorMessage: err instanceof Error ? err.message : 'Corrupt image or failed decoding.',
    };
  }
}
