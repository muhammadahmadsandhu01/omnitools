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
  isAnimated?: boolean;
  errorMessage?: string;
  status: 'idle' | 'converting' | 'success' | 'error';
  resultBlob?: Blob;
  resultUrl?: string;
  resultSize?: number;
  resultFilename?: string;
}

export interface WebpValidationResult {
  isValid: boolean;
  isAnimated?: boolean;
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

  if (!isRiff || !isWebp) return false;

  // Declared RIFF payload length (bytes 4..7 little-endian uint32): must be >= 4 (to contain 'WEBP')
  const riffSize =
    (headerBytes[4] |
      (headerBytes[5] << 8) |
      (headerBytes[6] << 16) |
      (headerBytes[7] << 24)) >>>
    0;

  return riffSize >= 4;
}

/**
 * Detect whether a WebP file contains an animation stream.
 * Validates the WebP RIFF container structure and walks chunks sequentially:
 * - Checks RIFF....WEBP magic bytes
 * - Inspects chunk FourCC headers at valid chunk boundaries (with 2-byte word padding)
 * - Checks VP8X chunk feature flag (bit 1 / 0x02 indicates Animation)
 * - Checks ANIM (global animation control) and ANMF (animation frame) chunk headers
 * Does NOT perform arbitrary byte substring searches to prevent false positives from
 * compressed VP8/VP8L bitstream payloads that coincidentally contain 'ANIM' or 'ANMF'.
 */
export function isAnimatedWebp(bytes: Uint8Array): boolean {
  if (bytes.length < 16) return false;
  if (!checkWebpMagicBytes(bytes)) return false;

  const declaredRiffSize =
    (bytes[4] | (bytes[5] << 8) | (bytes[6] << 16) | (bytes[7] << 24)) >>> 0;
  const containerEnd = 8 + declaredRiffSize;
  const maxOffset = Math.min(bytes.length, containerEnd);

  let offset = 12;
  let vp8xAnimFlag = false;
  let hasAnim = false;
  let hasAnmf = false;

  while (offset + 8 <= maxOffset) {
    const b0 = bytes[offset];
    const b1 = bytes[offset + 1];
    const b2 = bytes[offset + 2];
    const b3 = bytes[offset + 3];

    // Read 32-bit unsigned little-endian chunk size
    const size =
      (bytes[offset + 4] |
        (bytes[offset + 5] << 8) |
        (bytes[offset + 6] << 16) |
        (bytes[offset + 7] << 24)) >>>
      0;

    // Check bounds before inspecting payload
    if (offset + 8 + size > maxOffset) {
      return false;
    }

    // 1. Check VP8X chunk (Extended WebP)
    if (b0 === 0x56 && b1 === 0x50 && b2 === 0x38 && b3 === 0x58) {
      if (size >= 10 && offset + 8 + 10 <= maxOffset) {
        const flags = bytes[offset + 8];
        if ((flags & 0x02) !== 0) {
          vp8xAnimFlag = true;
        }
      }
    }

    // 2. Check ANIM chunk FourCC (spec requires exactly 6 bytes payload)
    if (b0 === 0x41 && b1 === 0x4e && b2 === 0x49 && b3 === 0x4d) {
      if (size === 6) {
        hasAnim = true;
      }
    }

    // 3. Check ANMF chunk FourCC (spec requires at least 16 bytes frame header)
    if (b0 === 0x41 && b1 === 0x4e && b2 === 0x4d && b3 === 0x46) {
      if (size >= 16) {
        hasAnmf = true;
      }
    }

    // Advance to next chunk: 8-byte header + payload padded to even byte boundary
    const paddedSize = size + (size & 1);
    if (paddedSize <= 0 || !Number.isFinite(paddedSize)) {
      break;
    }

    if (offset + 8 + paddedSize > maxOffset) {
      return false;
    }

    // If odd size, padding byte must be 0x00 per WebP specification
    if ((size & 1) && offset + 8 + size < bytes.length && bytes[offset + 8 + size] !== 0) {
      return false;
    }

    offset += 8 + paddedSize;
  }

  // Animation requires VP8X animation flag AND ANIM control chunk AND ANMF frame chunk
  return vp8xAnimFlag && hasAnim && hasAnmf;
}

/**
 * Validate the RIFF/WebP container structure against corruption and edge cases.
 * - Confirms RIFF....WEBP magic signatures
 * - Validates declared RIFF length against actual file length and minimum payload (>= 12)
 * - Checks that chunk parsing is strictly bounded by both buffer length and declared RIFF container end
 * - Checks that the initial chunk is valid (VP8, VP8L, or VP8X)
 * - Verifies chunk boundaries, sizes, and 2-byte word padding
 * - Checks VP8X chunk payload length (must be >= 10 bytes)
 * - Validates full consistency between VP8X animation flag, ANIM chunk, and ANMF frames
 * - Keeps container validity strictly separate from animation detection
 */
export function validateWebpContainer(
  bytes: Uint8Array,
  totalFileSize?: number
): { isValid: boolean; errorMessage?: string; isAnimated: boolean } {
  if (bytes.length < 12) {
    return {
      isValid: false,
      errorMessage: 'Truncated file: header is shorter than the 12-byte RIFF/WEBP minimum.',
      isAnimated: false,
    };
  }

  if (!checkWebpMagicBytes(bytes)) {
    return {
      isValid: false,
      errorMessage: 'Invalid WebP header signature (not a valid RIFF/WEBP file).',
      isAnimated: false,
    };
  }

  const declaredRiffSize =
    (bytes[4] | (bytes[5] << 8) | (bytes[6] << 16) | (bytes[7] << 24)) >>> 0;

  // Minimum valid WebP container must hold at least 4 bytes ('WEBP') + 8 bytes (first chunk header) = 12 bytes
  if (declaredRiffSize < 12) {
    return {
      isValid: false,
      errorMessage: `Declared RIFF size (${declaredRiffSize} bytes) is too small to contain a WebP chunk header (minimum 12 bytes).`,
      isAnimated: false,
    };
  }

  const actualSize = totalFileSize !== undefined ? totalFileSize : bytes.length;
  const containerEnd = 8 + declaredRiffSize;

  // RIFF size indicates total file size minus 8 bytes.
  // Container declared end cannot exceed actual physical file size.
  if (containerEnd > actualSize) {
    return {
      isValid: false,
      errorMessage: `Declared RIFF size (${containerEnd} bytes) exceeds actual file length (${actualSize} bytes).`,
      isAnimated: false,
    };
  }

  // Minimum valid WebP container must have at least 12 bytes header + 8 bytes chunk header = 20 bytes
  if (actualSize < 20 || bytes.length < 20) {
    return {
      isValid: false,
      errorMessage: 'Truncated WebP container: file ends before the first chunk header.',
      isAnimated: false,
    };
  }

  // Check first chunk FourCC: must be VP8, VP8L, or VP8X per WebP specification
  const firstFourCC = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]);
  if (firstFourCC !== 'VP8 ' && firstFourCC !== 'VP8L' && firstFourCC !== 'VP8X') {
    return {
      isValid: false,
      errorMessage: `Malformed WebP container: initial chunk must be VP8, VP8L, or VP8X, but found "${firstFourCC}".`,
      isAnimated: false,
    };
  }

  let offset = 12;
  // Bounded by BOTH buffer length AND declared container end
  const maxScanOffset = Math.min(bytes.length, containerEnd);
  let hasVp8x = false;
  let vp8xAnimFlag = false;
  let hasAnimChunk = false;
  let hasAnmfChunk = false;

  while (offset + 8 <= maxScanOffset) {
    const chunkFourCC = String.fromCharCode(
      bytes[offset],
      bytes[offset + 1],
      bytes[offset + 2],
      bytes[offset + 3]
    );

    const chunkSize =
      (bytes[offset + 4] |
        (bytes[offset + 5] << 8) |
        (bytes[offset + 6] << 16) |
        (bytes[offset + 7] << 24)) >>>
      0;

    // Verify chunk does not overrun declared RIFF container or actual file boundary
    if (offset + 8 + chunkSize > containerEnd) {
      return {
        isValid: false,
        errorMessage: `Malformed chunk "${chunkFourCC}": declared payload size (${chunkSize} bytes) exceeds declared RIFF container end (${containerEnd} bytes).`,
        isAnimated: false,
      };
    }

    if (offset + 8 + chunkSize > actualSize) {
      return {
        isValid: false,
        errorMessage: `Malformed chunk "${chunkFourCC}": declared payload size (${chunkSize} bytes) exceeds file boundary (${actualSize} bytes).`,
        isAnimated: false,
      };
    }

    const paddedSize = chunkSize + (chunkSize & 1);

    // If chunk size is odd, verify that the required 1-byte padding does not exceed container or file bounds
    if (chunkSize & 1) {
      if (offset + 8 + paddedSize > containerEnd) {
        return {
          isValid: false,
          errorMessage: `Malformed chunk "${chunkFourCC}": required odd-chunk padding byte falls outside declared RIFF container boundary.`,
          isAnimated: false,
        };
      }
      if (offset + 8 + paddedSize > actualSize) {
        return {
          isValid: false,
          errorMessage: `Malformed chunk "${chunkFourCC}": missing odd-byte padding at end of file.`,
          isAnimated: false,
        };
      }
      // If the padding byte is physically present within the buffer, verify it is 0x00 per WebP specification
      if (offset + 8 + chunkSize < bytes.length && bytes[offset + 8 + chunkSize] !== 0) {
        return {
          isValid: false,
          errorMessage: `Malformed chunk "${chunkFourCC}": odd-chunk padding byte must be 0x00, found 0x${bytes[offset + 8 + chunkSize].toString(16)}.`,
          isAnimated: false,
        };
      }
    }

    if (chunkFourCC === 'VP8X') {
      if (hasVp8x) {
        return {
          isValid: false,
          errorMessage: 'Malformed WebP container: duplicate VP8X chunks detected.',
          isAnimated: false,
        };
      }
      hasVp8x = true;

      // Extended WebP spec requires VP8X payload to be at least 10 bytes
      if (chunkSize < 10) {
        return {
          isValid: false,
          errorMessage: `Malformed VP8X chunk: payload length must be at least 10 bytes (declared ${chunkSize}).`,
          isAnimated: false,
        };
      }

      if (offset + 8 + 10 <= maxScanOffset) {
        const flags = bytes[offset + 8];
        if ((flags & 0x02) !== 0) {
          vp8xAnimFlag = true;
        }
      } else {
        return {
          isValid: false,
          errorMessage: 'Truncated VP8X chunk: buffer ends before feature flags byte.',
          isAnimated: false,
        };
      }
    }

    if (chunkFourCC === 'ANIM') {
      if (chunkSize !== 6) {
        return {
          isValid: false,
          errorMessage: `Malformed ANIM chunk: payload length must be exactly 6 bytes (declared ${chunkSize}).`,
          isAnimated: false,
        };
      }
      hasAnimChunk = true;
    }

    if (chunkFourCC === 'ANMF') {
      if (chunkSize < 16) {
        return {
          isValid: false,
          errorMessage: `Malformed ANMF chunk: payload length must be at least 16 bytes (declared ${chunkSize}).`,
          isAnimated: false,
        };
      }
      hasAnmfChunk = true;
    }

    if (paddedSize <= 0 || !Number.isFinite(paddedSize)) {
      return {
        isValid: false,
        errorMessage: `Invalid chunk size in "${chunkFourCC}".`,
        isAnimated: false,
      };
    }

    offset += 8 + paddedSize;
  }

  // Check if buffer/file ended with a truncated chunk header or extra unparsed bytes
  const effectiveEnd = Math.min(actualSize, containerEnd);
  if (bytes.length >= effectiveEnd && offset < effectiveEnd) {
    return {
      isValid: false,
      errorMessage: 'Malformed WebP container: truncated chunk header at end of data.',
      isAnimated: false,
    };
  }

  // Check animation consistency:
  // 1. If VP8X animation flag is set, container MUST have both ANIM and ANMF chunks
  if (vp8xAnimFlag) {
    if (!hasAnimChunk && !hasAnmfChunk) {
      return {
        isValid: false,
        errorMessage: 'Inconsistent WebP container: VP8X animation flag is set but missing ANIM and ANMF chunks.',
        isAnimated: false,
      };
    }
    if (!hasAnimChunk) {
      return {
        isValid: false,
        errorMessage: 'Inconsistent WebP container: VP8X animation flag is set with ANMF frames but missing ANIM control chunk.',
        isAnimated: false,
      };
    }
    if (!hasAnmfChunk) {
      return {
        isValid: false,
        errorMessage: 'Inconsistent WebP container: VP8X animation flag is set with ANIM chunk but missing ANMF frame chunks.',
        isAnimated: false,
      };
    }
  }

  // 2. If ANIM or ANMF appear without VP8X animation flag, it is an inconsistent container
  if ((hasAnimChunk || hasAnmfChunk) && !vp8xAnimFlag) {
    return {
      isValid: false,
      errorMessage: 'Inconsistent WebP container: animation chunks present without VP8X animation flag.',
      isAnimated: false,
    };
  }

  const isAnimated = vp8xAnimFlag && hasAnimChunk && hasAnmfChunk;
  return { isValid: true, isAnimated };
}

/**
 * Validate WebP file: check non-empty, file size limit, extension, magic header, and animation status.
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

  // Check container structure, magic bytes, and animation status
  try {
    const slice = file.slice(0, 65536);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    const validation = validateWebpContainer(bytes, file.size);
    if (!validation.isValid) {
      return {
        isValid: false,
        errorMessage: `File "${name}" has invalid WebP container: ${validation.errorMessage}`,
      };
    }

    return { isValid: true, isAnimated: validation.isAnimated };
  } catch (err) {
    return {
      isValid: false,
      errorMessage: `Could not read file header: ${(err as Error).message}`,
    };
  }
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
  isAnimated?: boolean;
}> {
  const targetMime = options.format === 'jpg' ? 'image/jpeg' : 'image/png';

  // 1. Validate magic bytes and size
  const validation = await validateWebpFile(file);
  if (!validation.isValid) {
    throw new Error(validation.errorMessage || 'Invalid WebP file.');
  }

  const isAnimated = validation.isAnimated;

  // 2. Decode in browser
  if (typeof createImageBitmap === 'function') {
    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await createImageBitmap(file);
      const width = bitmap.width;
      const height = bitmap.height;
      const blob = await convertCanvasToTargetBlob(bitmap, width, height, options);
      bitmap.close();
      return { blob, width, height, format: options.format, mimeType: targetMime, isAnimated };
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
      return { blob, width, height, format: options.format, mimeType: targetMime, isAnimated };
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
