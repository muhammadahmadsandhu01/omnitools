import JSZip from 'jszip';

export type OutputFormat = 'jpg' | 'png';

export interface WebpConversionOptions {
  format: OutputFormat;
  quality: number; // 0.1 to 1.0 (for JPG, default 0.90)
  backgroundColor: string; // Hex color for JPG transparency background, default '#ffffff'
}

export interface WebpQueueItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl: string;
  width: number;
  height: number;
  isValid: boolean;
  errorMessage?: string;
  status: 'idle' | 'converting' | 'success' | 'error';
  resultBlob?: Blob;
  resultUrl?: string;
  resultSize?: number;
  resultFilename?: string;
}

export interface WebpValidationResult {
  isValid: boolean;
  width?: number;
  height?: number;
  errorMessage?: string;
}

export interface ConversionSummary {
  total: number;
  converted: number;
  failed: number;
  totalOriginalBytes: number;
  totalOutputBytes: number;
}

export const MAX_FILES = 50;
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB per file
export const MAX_TOTAL_BYTES = 250 * 1024 * 1024; // 250 MB total queue

export const DEFAULT_OPTIONS: WebpConversionOptions = {
  format: 'jpg',
  quality: 0.9,
  backgroundColor: '#ffffff',
};

/**
 * Format bytes to readable string (B, KB, MB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = bytes / Math.pow(k, i);
  return `${val.toFixed(val >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
}

/**
 * Parse hex color string to RGB components (0-255)
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleaned = hex.replace(/^#/, '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(cleaned, 16);
  if (isNaN(num) || cleaned.length !== 6) {
    return { r: 255, g: 255, b: 255 }; // Default white on error
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Strict filename sanitization preventing directory traversal and reserving target extension.
 */
export function sanitizeOutputFilename(
  rawName: string,
  targetFormat: OutputFormat
): string {
  if (!rawName || typeof rawName !== 'string') {
    return `converted_image.${targetFormat}`;
  }

  // Strip path separators and null bytes
  let sanitized = rawName
    .replace(/[/\\?%*:|"<>]/g, '_')
    .replace(/\.\.+/g, '_')
    .trim();

  // Strip existing extension
  sanitized = sanitized.replace(/\.[^/.]+$/, '');

  // Fallback if empty
  if (!sanitized || sanitized === '_') {
    sanitized = 'converted_image';
  }

  return `${sanitized}.${targetFormat}`;
}

/**
 * Inspect raw buffer header to verify RIFF....WEBP magic bytes.
 */
export function checkWebpMagicBytes(headerBytes: Uint8Array): boolean {
  if (headerBytes.length < 12) return false;

  // RIFF at 0..3 (0x52, 0x49, 0x46, 0x46)
  const isRiff =
    headerBytes[0] === 0x52 &&
    headerBytes[1] === 0x49 &&
    headerBytes[2] === 0x46 &&
    headerBytes[3] === 0x46;

  // WEBP at 8..11 (0x57, 0x45, 0x42, 0x50)
  const isWebp =
    headerBytes[8] === 0x57 &&
    headerBytes[9] === 0x45 &&
    headerBytes[10] === 0x42 &&
    headerBytes[11] === 0x50;

  return isRiff && isWebp;
}

/**
 * Validate WebP file: check non-empty, file size limit, extension, and magic header.
 */
export async function validateWebpFile(
  file: File | Blob,
  filename?: string
): Promise<WebpValidationResult> {
  const name = filename || ('name' in file ? (file as File).name : 'image.webp');

  // Check 0-byte or empty
  if (file.size === 0) {
    return {
      isValid: false,
      errorMessage: `File "${name}" is empty (0 bytes).`,
    };
  }

  // Check size limit
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      errorMessage: `File "${name}" exceeds the ${formatBytes(MAX_FILE_SIZE_BYTES)} size limit.`,
    };
  }

  // Check extension if name available
  const lowerName = name.toLowerCase();
  const hasWebpExtension = lowerName.endsWith('.webp');
  const hasWebpMime = file.type === 'image/webp';

  if (!hasWebpExtension && !hasWebpMime) {
    return {
      isValid: false,
      errorMessage: `File "${name}" is not a recognized WebP image (must have .webp extension or image/webp MIME type).`,
    };
  }

  // Check magic bytes
  try {
    const slice = file.slice(0, 16);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    if (!checkWebpMagicBytes(bytes)) {
      return {
        isValid: false,
        errorMessage: `File "${name}" has invalid WebP header signature (not a valid RIFF/WEBP file).`,
      };
    }
  } catch (err) {
    return {
      isValid: false,
      errorMessage: `Could not read file header: ${(err as Error).message}`,
    };
  }

  return { isValid: true };
}

/**
 * Decode image dimensions in browser via createImageBitmap or Image element.
 */
export async function decodeImageDimensions(
  blob: Blob
): Promise<{ width: number; height: number }> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(blob);
      const dimensions = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      return dimensions;
    } catch {
      // Fallback to HTMLImageElement
    }
  }

  if (typeof window !== 'undefined' && typeof Image === 'function') {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        const dimensions = { width: img.naturalWidth, height: img.naturalHeight };
        URL.revokeObjectURL(url);
        resolve(dimensions);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to decode WebP image content.'));
      };
      img.src = url;
    });
  }

  throw new Error('Image decoding is only supported in a browser environment.');
}

/**
 * Convert a decoded image/bitmap to JPEG or PNG Blob using Canvas.
 */
export async function convertCanvasToTargetBlob(
  source: CanvasImageSource,
  width: number,
  height: number,
  options: WebpConversionOptions
): Promise<Blob> {
  const targetMime = options.format === 'jpg' ? 'image/jpeg' : 'image/png';
  const quality = options.format === 'jpg' ? Math.max(0.1, Math.min(1.0, options.quality)) : undefined;

  // Try OffscreenCanvas if supported
  if (typeof OffscreenCanvas !== 'undefined') {
    try {
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (options.format === 'jpg') {
          // Fill background for transparency
          ctx.fillStyle = options.backgroundColor || '#ffffff';
          ctx.fillRect(0, 0, width, height);
        } else {
          ctx.clearRect(0, 0, width, height);
        }
        ctx.drawImage(source, 0, 0, width, height);
        const blob = await canvas.convertToBlob({ type: targetMime, quality });
        if (blob && blob.size > 0) return blob;
      }
    } catch {
      // Fallback to DOM canvas
    }
  }

  // DOM Canvas fallback
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not obtain 2D canvas rendering context.');

    if (options.format === 'jpg') {
      ctx.fillStyle = options.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.clearRect(0, 0, width, height);
    }

    ctx.drawImage(source, 0, 0, width, height);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size > 0) {
            resolve(blob);
          } else {
            reject(new Error(`Failed to encode image to ${options.format.toUpperCase()}.`));
          }
        },
        targetMime,
        quality
      );
    });
  }

  throw new Error('Canvas conversion requires a browser environment.');
}

/**
 * End-to-end conversion of a single WebP File/Blob to JPG or PNG Blob.
 */
export async function convertWebpFile(
  file: File | Blob,
  options: WebpConversionOptions
): Promise<{
  blob: Blob;
  width: number;
  height: number;
  format: OutputFormat;
  mimeType: string;
}> {
  const targetMime = options.format === 'jpg' ? 'image/jpeg' : 'image/png';

  // 1. Validate magic bytes and size
  const validation = await validateWebpFile(file);
  if (!validation.isValid) {
    throw new Error(validation.errorMessage || 'Invalid WebP file.');
  }

  // 2. Decode in browser
  if (typeof createImageBitmap === 'function') {
    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await createImageBitmap(file);
      const width = bitmap.width;
      const height = bitmap.height;
      const blob = await convertCanvasToTargetBlob(bitmap, width, height, options);
      bitmap.close();
      return { blob, width, height, format: options.format, mimeType: targetMime };
    } catch {
      if (bitmap) bitmap.close();
      // Try Image element fallback
    }
  }

  // HTMLImageElement fallback
  if (typeof window !== 'undefined' && typeof Image === 'function') {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to decode WebP image content.'));
        img.src = objectUrl;
      });

      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const blob = await convertCanvasToTargetBlob(img, width, height, options);
      return { blob, width, height, format: options.format, mimeType: targetMime };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  throw new Error('WebP conversion requires a browser or canvas-enabled environment.');
}

/**
 * Package multiple converted files into a ZIP archive using JSZip.
 */
export async function createBatchZip(
  items: Array<{ filename: string; blob: Blob }>
): Promise<Blob> {
  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let finalName = item.filename;
    let counter = 1;
    const ext = finalName.includes('.') ? `.${finalName.split('.').pop()}` : '';
    const base = finalName.replace(/\.[^/.]+$/, '');

    while (usedNames.has(finalName)) {
      finalName = `${base} (${counter})${ext}`;
      counter++;
    }
    usedNames.add(finalName);

    zip.file(finalName, item.blob);
  }

  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/zip',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}
