/**
 * OmniTools Image Compressor Engine
 *
 * Core algorithmic engine for client-side image compression, candidate ranking,
 * format detection, aspect-ratio preservation, target-size bisection, and batch metrics.
 */

export type OutputFormat = 'auto' | 'original' | 'webp' | 'avif' | 'jpeg' | 'png';
export type OptimizationMode = 'smart' | 'target' | 'lossless' | 'maximum';
export type ImageStatus = 'pending' | 'compressing' | 'done' | 'error' | 'already_optimized';

export interface CompressionCandidate {
  format: Exclude<OutputFormat, 'auto'>;
  quality: number;
  dimension: number;
  width: number;
  height: number;
  sizeBytes: number;
  score: number;
}

export interface BatchStats {
  processed: number;
  originalBytes: number;
  outputBytes: number;
  savedBytes: number;
  savings: number;
  compressionRatio: number;
}

export interface SavingsResult {
  savingsPercent: number;
  bytesSaved: number;
  isIncrease: boolean;
}

export interface ImageAnalysisMetrics {
  hasTransparency: boolean;
  edgeEnergy: number;
  lumaMean: number;
  lumaVariance: number;
  saturationMean: number;
  detailLevel: number;
  flatness: number;
  isLikelyPhoto: boolean;
  isLikelyTextGraphic: boolean;
  contentType: 'photo' | 'text-graphic' | 'transparent-graphic' | 'graphic';
}

export const MAX_FILES = 100;
export const MAX_FILE_SIZE_MB = 100;

/**
 * Formats byte values into readable units (B, KB, MB, GB).
 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 2))} ${units[i]}`;
}

/**
 * Calculates compression savings with truthful reporting of increases.
 */
export function calculateSavings(orig: number, comp: number): SavingsResult {
  if (!Number.isFinite(orig) || orig <= 0) {
    return { savingsPercent: 0, bytesSaved: 0, isIncrease: false };
  }
  if (!Number.isFinite(comp) || comp < 0) {
    return { savingsPercent: 0, bytesSaved: 0, isIncrease: false };
  }

  const bytesSaved = orig - comp;
  const isIncrease = comp > orig;
  const rawPercent = ((orig - comp) / orig) * 100;
  const savingsPercent = Math.round(rawPercent);

  return {
    savingsPercent,
    bytesSaved,
    isIncrease,
  };
}

/**
 * Calculates proportional aspect-ratio fit given source dimensions and a maximum boundary.
 */
export function calculateAspectRatioFit(
  srcWidth: number,
  srcHeight: number,
  maxDimension: number
): { width: number; height: number; scale: number } {
  if (srcWidth <= 0 || srcHeight <= 0) {
    return { width: 1, height: 1, scale: 1 };
  }

  const maxSrcDim = Math.max(srcWidth, srcHeight);
  if (maxDimension <= 0 || maxDimension >= maxSrcDim) {
    return { width: srcWidth, height: srcHeight, scale: 1 };
  }

  const scale = maxDimension / maxSrcDim;
  const width = Math.max(1, Math.round(srcWidth * scale));
  const height = Math.max(1, Math.round(srcHeight * scale));

  return { width, height, scale };
}

/**
 * Extracts clean lowercase file extension.
 */
export function getExtension(name: string): string {
  if (!name) return '';
  const parts = name.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase().trim() : '';
}

/**
 * Extracts base filename without extension.
 */
export function getBaseName(name: string): string {
  if (!name) return 'image';
  return name.replace(/\.[^/.]+$/, '').trim() || 'image';
}

/**
 * Determines output filename extension based on target format and mime.
 */
export function getOutputExtension(
  format: OutputFormat,
  sourceName: string,
  mime: string
): string {
  if (format === 'jpeg') return 'jpg';
  if (format === 'webp') return 'webp';
  if (format === 'avif') return mime === 'image/avif' ? 'avif' : 'webp';
  if (format === 'png') return 'png';

  const sourceExt = getExtension(sourceName);
  if (sourceExt && sourceExt !== 'jpeg') return sourceExt;
  if (sourceExt === 'jpeg') return 'jpg';

  const mimeSubtype = mime?.split('/')[1]?.toLowerCase();
  if (mimeSubtype === 'jpeg') return 'jpg';
  if (mimeSubtype) return mimeSubtype;
  return 'jpg';
}

/**
 * Maps format choice to standard MIME type.
 */
export function getMimeForFormat(format: OutputFormat, sourceType: string): string {
  if (format === 'webp') return 'image/webp';
  if (format === 'avif') return 'image/avif';
  if (format === 'jpeg') return 'image/jpeg';
  if (format === 'png') return 'image/png';
  return sourceType || 'image/jpeg';
}

/**
 * Detects whether image bytes correspond to an animated GIF or animated WebP.
 */
export function isAnimatedBytes(bytes: Uint8Array): boolean {
  if (!bytes || bytes.length < 16) return false;

  // 1. GIF detection (GIF87a / GIF89a)
  if (
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) &&
    bytes[5] === 0x61
  ) {
    // Look for Graphic Control Extension (0x21, 0xF9) indicating multiple frames
    let gceCount = 0;
    for (let i = 6; i < bytes.length - 2; i++) {
      if (bytes[i] === 0x21 && bytes[i + 1] === 0xf9) {
        gceCount++;
        if (gceCount > 1) return true;
      }
    }
    // If only 1 GCE is found in first slice, a single frame or static gif
    return gceCount > 1;
  }

  // 2. WebP detection (RIFF .... WEBP)
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    // Check VP8X chunk animation flag (bit 1 of flag byte at offset 20)
    if (
      bytes[12] === 0x56 &&
      bytes[13] === 0x50 &&
      bytes[14] === 0x38 &&
      bytes[15] === 0x58 &&
      bytes.length > 20
    ) {
      const flags = bytes[20];
      if ((flags & 0x02) !== 0) return true;
    }

    // Scan for ANIM chunk tag
    for (let i = 12; i < bytes.length - 4; i++) {
      if (
        bytes[i] === 0x41 &&
        bytes[i + 1] === 0x4e &&
        bytes[i + 2] === 0x49 &&
        bytes[i + 3] === 0x4d
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Detects MIME type from file header magic bytes.
 */
export function detectImageMimeFromMagicBytes(bytes: Uint8Array): string | null {
  if (!bytes || bytes.length < 12) return null;

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png';
  }

  // GIF: GIF87a or GIF89a
  if (
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38
  ) {
    return 'image/gif';
  }

  // WebP: RIFF .... WEBP
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp';
  }

  // AVIF / HEIC (ftyp chunk)
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]).toLowerCase();
    if (brand.startsWith('avif') || brand.startsWith('avis')) return 'image/avif';
    if (brand.startsWith('heic') || brand.startsWith('heif') || brand.startsWith('mif1')) {
      return 'image/heic';
    }
  }

  return null;
}

/**
 * Calculates consolidated batch statistics.
 */
export function calculateBatchStats(
  images: Array<{
    originalSize: number;
    compressedSize: number | null;
    status: ImageStatus;
  }>
): BatchStats {
  const processed = images.filter(
    (i) =>
      (i.status === 'done' || i.status === 'already_optimized') &&
      i.compressedSize != null
  );

  const originalBytes = processed.reduce((sum, i) => sum + i.originalSize, 0);
  const outputBytes = processed.reduce((sum, i) => sum + (i.compressedSize || 0), 0);
  const savedBytes = Math.max(0, originalBytes - outputBytes);

  const savings =
    originalBytes > 0
      ? Math.max(0, Math.round(((originalBytes - outputBytes) / originalBytes) * 100))
      : 0;

  const compressionRatio =
    outputBytes > 0 && originalBytes > 0
      ? parseFloat((originalBytes / outputBytes).toFixed(2))
      : 1;

  return {
    processed: processed.length,
    originalBytes,
    outputBytes,
    savedBytes,
    savings,
    compressionRatio,
  };
}

/**
 * Evaluates candidate image quality using structural similarity (SSIM), MAE, and edge energy.
 */
export function calculatePerceptualScore(
  sourceLuma: Float32Array,
  candidateLuma: Float32Array,
  sourceData: Uint8ClampedArray,
  candidateData: Uint8ClampedArray,
  analysisSize: number,
  hasTransparency: boolean,
  candidateDimension: number,
  sourceMaxDimension: number,
  detailLevel: number
): number {
  const pixelCount = sourceLuma.length;
  let absError = 0;
  let squareError = 0;
  let alphaError = 0;
  let edgeError = 0;
  let colorError = 0;

  for (let y = 0; y < analysisSize; y++) {
    for (let x = 0; x < analysisSize; x++) {
      const i = y * analysisSize + x;
      const p = i * 4;
      const r = candidateData[p];
      const g = candidateData[p + 1];
      const b = candidateData[p + 2];
      const a = candidateData[p + 3];

      const yv = candidateLuma[i];
      const d = Math.abs(sourceLuma[i] - yv);
      absError += d;
      squareError += d * d;

      colorError +=
        Math.abs(sourceData[p] - r) +
        Math.abs(sourceData[p + 1] - g) +
        Math.abs(sourceData[p + 2] - b);

      if (hasTransparency) {
        alphaError += Math.abs(sourceData[p + 3] - a);
      }

      if (x > 0) {
        const srcEdge = Math.abs(sourceLuma[i] - sourceLuma[i - 1]);
        const outEdge = Math.abs(candidateLuma[i] - candidateLuma[i - 1]);
        edgeError += Math.abs(srcEdge - outEdge);
      }
      if (y > 0) {
        const srcEdge = Math.abs(sourceLuma[i] - sourceLuma[i - analysisSize]);
        const outEdge = Math.abs(candidateLuma[i] - candidateLuma[i - analysisSize]);
        edgeError += Math.abs(srcEdge - outEdge);
      }
    }
  }

  // SSIM in 16x16 pixel blocks
  const block = 16;
  let ssimSum = 0;
  let blocks = 0;
  const c1 = 6.5025;
  const c2 = 58.5225;

  for (let by = 0; by < analysisSize; by += block) {
    for (let bx = 0; bx < analysisSize; bx += block) {
      let muA = 0;
      let muB = 0;
      let count = 0;
      for (let y = by; y < Math.min(by + block, analysisSize); y++) {
        for (let x = bx; x < Math.min(bx + block, analysisSize); x++) {
          const i = y * analysisSize + x;
          muA += sourceLuma[i];
          muB += candidateLuma[i];
          count++;
        }
      }
      muA /= count;
      muB /= count;

      let varA = 0;
      let varB = 0;
      let cov = 0;
      for (let y = by; y < Math.min(by + block, analysisSize); y++) {
        for (let x = bx; x < Math.min(bx + block, analysisSize); x++) {
          const i = y * analysisSize + x;
          const da = sourceLuma[i] - muA;
          const db = candidateLuma[i] - muB;
          varA += da * da;
          varB += db * db;
          cov += da * db;
        }
      }
      varA /= count;
      varB /= count;
      cov /= count;

      const ssim =
        ((2 * muA * muB + c1) * (2 * cov + c2)) /
        ((muA * muA + muB * muB + c1) * (varA + varB + c2));

      ssimSum += Math.max(0, Math.min(1, ssim));
      blocks++;
    }
  }

  const mae = absError / pixelCount;
  const rmse = Math.sqrt(squareError / pixelCount);
  const normalizedEdgeError = edgeError / Math.max(1, pixelCount * 2);
  const normalizedColorError = colorError / Math.max(1, pixelCount * 3);
  const alphaPenalty = hasTransparency ? (alphaError / pixelCount) * 0.1 : 0;
  const structure = ssimSum / Math.max(1, blocks);

  const maeScore = Math.max(0, 1 - mae / 42);
  const rmseScore = Math.max(0, 1 - rmse / 58);
  const colorScore = Math.max(0, 1 - normalizedColorError / 42);
  const edgeScore = Math.max(0, 1 - normalizedEdgeError / 18);

  const resolutionRatio = Math.min(1, candidateDimension / Math.max(sourceMaxDimension, 1));
  const resolutionPenalty =
    resolutionRatio < 1 ? (1 - resolutionRatio) * (0.5 + detailLevel * 0.5) : 0;

  const perceptual =
    maeScore * 0.2 +
    rmseScore * 0.1 +
    colorScore * 0.12 +
    structure * 0.34 +
    edgeScore * 0.24;

  return 100 * Math.max(0, Math.min(1, perceptual - alphaPenalty - resolutionPenalty));
}

/**
 * Pure candidate selector determining the winning image encoding according to selected mode.
 */
export function selectOptimalCandidate(
  candidates: CompressionCandidate[],
  originalBytes: number,
  mode: OptimizationMode,
  targetBytes?: number,
  requestedConversion?: boolean,
  requestedResize?: boolean,
  contentType: string = 'photo'
): { selected: CompressionCandidate; note: string; shouldKeepOriginal: boolean } {
  if (!candidates.length) {
    const fallback: CompressionCandidate = {
      format: 'original',
      quality: 1,
      dimension: 0,
      width: 0,
      height: 0,
      sizeBytes: originalBytes,
      score: 100,
    };
    return {
      selected: fallback,
      note: 'Original file preserved.',
      shouldKeepOriginal: true,
    };
  }

  // 1. Target Size (KB) Mode
  if (mode === 'target' && targetBytes && targetBytes > 0) {
    if (originalBytes <= targetBytes && !requestedConversion && !requestedResize) {
      const originalCandidate = candidates.find((c) => c.format === 'original') || candidates[0];
      return {
        selected: originalCandidate,
        note: `Target met: source file is already within requested target size (${formatBytes(originalBytes)}).`,
        shouldKeepOriginal: true,
      };
    }

    const underTarget = candidates.filter((c) => c.sizeBytes <= targetBytes);
    if (underTarget.length > 0) {
      const safeFloor = contentType === 'text-graphic' ? 90 : contentType === 'photo' ? 88 : 89;
      const safe = underTarget.filter((c) => c.score >= safeFloor);
      const pool = safe.length > 0 ? safe : underTarget;

      // Pick highest quality candidate that remains under the byte ceiling
      const selected = pool.reduce((best, curr) => {
        const qualityGap = curr.score - best.score;
        if (qualityGap > 0.6) return curr;
        if (Math.abs(qualityGap) <= 0.6 && curr.sizeBytes > best.sizeBytes) return curr;
        return best;
      }, pool[0]);

      return {
        selected,
        note: `Target achieved at ${formatBytes(selected.sizeBytes)} with a ${selected.score.toFixed(1)}/100 perceptual match.`,
        shouldKeepOriginal: false,
      };
    } else {
      // Best effort when target could not be met
      const safeFloor = contentType === 'text-graphic' ? 88 : 84;
      const safe = candidates.filter((c) => c.score >= safeFloor);
      const pool = safe.length > 0 ? safe : candidates;

      const selected = pool.reduce((best, curr) => {
        const currDistance = Math.abs(curr.sizeBytes - targetBytes);
        const bestDistance = Math.abs(best.sizeBytes - targetBytes);
        if (curr.score > best.score + 0.8 && currDistance <= bestDistance * 1.35) return curr;
        if (Math.abs(curr.score - best.score) <= 0.8 && currDistance < bestDistance) return curr;
        return best;
      }, pool[0]);

      return {
        selected,
        note: `Target ${formatBytes(targetBytes)} was not safely reachable. Best practical result: ${formatBytes(selected.sizeBytes)} at ${selected.score.toFixed(1)}/100.`,
        shouldKeepOriginal: false,
      };
    }
  }

  // 2. Maximum Mode (Prioritize smallest file size above acceptable quality floor)
  if (mode === 'maximum') {
    const minAcceptableScore = contentType === 'text-graphic' ? 84 : 80;
    const acceptable = candidates.filter(
      (c) => c.score >= minAcceptableScore && c.sizeBytes < originalBytes
    );
    if (acceptable.length > 0) {
      // Pick smallest file size; break ties with higher quality score
      const selected = acceptable.reduce((best, curr) => {
        if (curr.sizeBytes < best.sizeBytes) return curr;
        if (curr.sizeBytes === best.sizeBytes && curr.score > best.score) return curr;
        return best;
      }, acceptable[0]);

      return {
        selected,
        note: `Maximum mode selected ${formatBytes(selected.sizeBytes)} with a ${selected.score.toFixed(1)}/100 perceptual match.`,
        shouldKeepOriginal: false,
      };
    }
  }

  // 3. Smart Mode (Perceptually balanced compression)
  const safeFloor = contentType === 'text-graphic' ? 92 : contentType === 'photo' ? 88 : 90;
  // Consider candidates that reduce size and meet safe quality floor
  const reducingCandidates = candidates.filter(
    (c) => c.sizeBytes < originalBytes && c.score >= safeFloor
  );

  if (reducingCandidates.length > 0) {
    const maxScore = Math.max(...reducingCandidates.map((c) => c.score));
    // Candidates within 1.5 points of the top score are considered visually equivalent
    const topTier = reducingCandidates.filter((c) => c.score >= maxScore - 1.5);
    // Pick the most space-efficient among top-tier candidates
    const selected = topTier.reduce((best, curr) => {
      if (curr.sizeBytes < best.sizeBytes) return curr;
      if (curr.sizeBytes === best.sizeBytes && curr.score > best.score) return curr;
      return best;
    }, topTier[0]);

    return {
      selected,
      note: `Smart mode detected ${contentType.replace('-', ' ')} content and selected ${formatBytes(selected.sizeBytes)} at ${selected.score.toFixed(1)}/100 perceptual match.`,
      shouldKeepOriginal: false,
    };
  }

  // If no candidate achieved reduction above safe floor, choose best practical or keep original
  const anyReducing = candidates.filter((c) => c.sizeBytes < originalBytes);
  if (anyReducing.length > 0 && (requestedConversion || requestedResize)) {
    const selected = anyReducing.reduce((best, curr) => (curr.score > best.score ? curr : best), anyReducing[0]);
    return {
      selected,
      note: `Best available output selected at ${formatBytes(selected.sizeBytes)} (${selected.score.toFixed(1)}/100).`,
      shouldKeepOriginal: false,
    };
  }

  const originalCandidate = candidates.find((c) => c.format === 'original') || candidates[0];
  return {
    selected: originalCandidate,
    note: 'Original file was already optimal; kept source to prevent unnecessary quality loss or file expansion.',
    shouldKeepOriginal: true,
  };
}
