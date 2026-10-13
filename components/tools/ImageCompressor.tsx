/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import JSZip from 'jszip';
import {
  UploadCloud,
  ShieldCheck,
  Download,
  Trash2,
  Settings2,
  SlidersHorizontal,
  ArrowRight,
  Loader2,
  FileArchive,
  Zap,
  RotateCcw,
  Maximize2,
  Target,
  CheckCircle2,
  AlertCircle,
  Copy,
  Sparkles,
  Gauge,
  Shield,
} from 'lucide-react';

import {
  type OutputFormat,
  type OptimizationMode,
  type ImageStatus,
  type CompressionCandidate,
  formatBytes,
  calculateSavings,
  getExtension,
  getBaseName,
  getOutputExtension,
  getMimeForFormat,
  isAnimatedBytes,
  calculateBatchStats,
  selectOptimalCandidate,
  MAX_FILES,
  MAX_FILE_SIZE_MB,
} from './imageCompressorEngine';

const formatSize = formatBytes;

interface ImageFile {
  id: string;
  originalFile: File;
  originalUrl: string;
  originalSize: number;
  compressedFile: File | null;
  compressedUrl: string | null;
  compressedSize: number | null;
  status: ImageStatus;
  finalExtension: string;
  finalMime: string;
  width: number | null;
  height: number | null;
  originalWidth: number | null;
  originalHeight: number | null;
  errorMessage?: string;
  optimizationNote?: string;
  qualityScore?: number;
  isAnimated?: boolean;
}

const makeId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const isAnimatedImage = async (file: File): Promise<boolean> => {
  const lowerName = file.name.toLowerCase();
  const lowerType = file.type.toLowerCase();
  if (lowerType === 'image/gif' || lowerName.endsWith('.gif')) {
    return true;
  }
  if (lowerType === 'image/webp' || lowerName.endsWith('.webp')) {
    try {
      const slice = file.slice(0, 1024);
      const buffer = await slice.arrayBuffer();
      return isAnimatedBytes(new Uint8Array(buffer));
    } catch {
      // Fallback safely
    }
  }
  return false;
};

export default function ImageCompressor() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [quality, setQuality] = useState(80);
  const [optimizationMode, setOptimizationMode] = useState<OptimizationMode>('smart');
  // Size-first mode: users can set a KB target and the optimizer will work
  // toward that target before falling back to quality/dimension reductions.
  const [format, setFormat] = useState<OutputFormat>('auto');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [maxDimension, setMaxDimension] = useState(0);
  const [targetSizeKB, setTargetSizeKB] = useState(500);
  const [stripMetadata, setStripMetadata] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<ImageFile[]>([]);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);
  const activeBatchIdRef = useRef(0);

  // Release object URLs only when the component actually unmounts.
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => {
        URL.revokeObjectURL(img.originalUrl);
        if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
      });
    };
  }, []);

  const stats = useMemo(() => {
    return calculateBatchStats(images);
  }, [images]);

  const getImageDimensions = (file: File) =>
    new Promise<{ width: number; height: number }>((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('This image format could not be decoded by your browser.'));
      };
      img.src = url;
    });

  const addFiles = async (fileList: FileList | File[]) => {
    setNotice(null);

    const incoming = Array.from(fileList);
    const accepted: File[] = [];
    const rejected: string[] = [];

    for (const file of incoming) {
      const lower = file.name.toLowerCase();
      if (lower.endsWith('.svg') || file.type === 'image/svg+xml') {
        rejected.push(`${file.name}: SVG is a vector format. Please use the SVG Optimizer.`);
        continue;
      }
      const supportedExtension = /\.(heic|heif|tiff|tif|raw|dng|bmp|ico)$/i.test(lower);
      if (!file.type.startsWith('image/') && !supportedExtension) {
        rejected.push(`${file.name}: unsupported file type`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        rejected.push(`${file.name}: larger than ${MAX_FILE_SIZE_MB} MB`);
        continue;
      }
      accepted.push(file);
    }

    const remaining = Math.max(0, MAX_FILES - images.length);
    const filesToAdd = accepted.slice(0, remaining);

    if (accepted.length > remaining) {
      rejected.push(`Only ${MAX_FILES} images can be queued at once.`);
    }

    const newImages: ImageFile[] = await Promise.all(
      filesToAdd.map(async (file) => {
        let dimensions: { width: number; height: number } | null = null;
        try {
          dimensions = await getImageDimensions(file);
        } catch {
          // Some formats (e.g. RAW/TIFF/HEIC) need conversion before a browser can decode them.
        }

        const isAnimated = await isAnimatedImage(file);

        return {
          id: makeId(),
          originalFile: file,
          originalUrl: URL.createObjectURL(file),
          originalSize: file.size,
          compressedFile: null,
          compressedUrl: null,
          compressedSize: null,
          status: 'pending' as ImageStatus,
          finalExtension: getExtension(file.name) || 'jpg',
          finalMime: file.type || 'image/jpeg',
          width: dimensions?.width ?? null,
          height: dimensions?.height ?? null,
          originalWidth: dimensions?.width ?? null,
          originalHeight: dimensions?.height ?? null,
          isAnimated,
        };
      })
    );

    if (newImages.length) {
      setImages((prev) => [...prev, ...newImages]);
    }

    if (rejected.length) {
      setNotice(rejected.slice(0, 4).join(' • ') + (rejected.length > 4 ? ' • More files were skipped.' : ''));
    }

    // Browser-friendly output for formats that are commonly difficult to preserve.
    if (
      format === 'original' &&
      filesToAdd.some((f) => /\.(heic|heif|tiff|tif|raw|dng)$/i.test(f.name))
    ) {
      setFormat('webp');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) void addFiles(e.dataTransfer.files);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((img) => img.id === id);
      if (item) {
        URL.revokeObjectURL(item.originalUrl);
        if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
    if (previewId === id) setPreviewId(null);
  };

  const clearAll = () => {
    activeBatchIdRef.current++;
    setIsProcessingBatch(false);
    images.forEach((img) => {
      URL.revokeObjectURL(img.originalUrl);
      if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
    });
    setImages([]);
    setPreviewId(null);
    setNotice(null);
  };

  const convertHeicIfNeeded = async (file: File) => {
    if (!/\.(heic|heif)$/i.test(file.name)) return file;

    const heic2any = (await import('heic2any')).default;
    const converted = (await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.95,
    })) as Blob | Blob[];

    const blob = Array.isArray(converted) ? converted[0] : converted;
    return new File([blob], `${getBaseName(file.name)}.jpg`, { type: 'image/jpeg' });
  };

  const compressSingleImage = async (img: ImageFile) => {
    setImages((prev) => prev.map((i) => i.id === img.id ? { ...i, status: 'compressing', errorMessage: undefined } : i));

    try {
      // Decode once. HEIC/HEIF is converted at high quality first so the optimizer
      // does not throw away visible detail before the real optimization pass.
      const baseFile = await convertHeicIfNeeded(img.originalFile);
      if (!baseFile.type.startsWith('image/')) {
        throw new Error('This image format could not be decoded in this browser.');
      }

      const sourceImage = await new Promise<HTMLImageElement>((resolve, reject) => {
        const url = URL.createObjectURL(baseFile);
        const image = new Image();
        image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
        image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('This image could not be decoded by the browser.')); };
        image.src = url;
      });

      const sourceWidth = sourceImage.naturalWidth || img.originalWidth || 0;
      const sourceHeight = sourceImage.naturalHeight || img.originalHeight || 0;
      if (!sourceWidth || !sourceHeight) throw new Error('Could not determine the image dimensions.');

      const sourceMaxDimension = Math.max(sourceWidth, sourceHeight);
      const requestedTargetBytes = optimizationMode === 'target' && targetSizeKB > 0
        ? Math.max(1, targetSizeKB * 1024)
        : undefined;

      const loadImage = (file: File) => new Promise<HTMLImageElement>((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
        image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode')); };
        image.src = url;
      });

      const supportedMime = (mime: string) => {
        const canvas = document.createElement('canvas');
        try {
          return canvas.toDataURL(mime).startsWith(`data:${mime}`);
        } catch {
          return false;
        }
      };

      const analysisSize = 160;
      const sourceAnalysis = document.createElement('canvas');
      sourceAnalysis.width = sourceAnalysis.height = analysisSize;
      const sourceCtx = sourceAnalysis.getContext('2d', { willReadFrequently: true });
      if (!sourceCtx) throw new Error('Could not create the image analysis canvas.');
      sourceCtx.clearRect(0, 0, analysisSize, analysisSize);
      sourceCtx.drawImage(sourceImage, 0, 0, analysisSize, analysisSize);
      const sourceData = sourceCtx.getImageData(0, 0, analysisSize, analysisSize).data;

      let hasTransparency = false;
      let edgeEnergy = 0;
      let lumaMean = 0;
      let lumaVariance = 0;
      let saturationMean = 0;
      const sourceLuma = new Float32Array(analysisSize * analysisSize);
      const sourceSat = new Float32Array(analysisSize * analysisSize);

      for (let y = 0; y < analysisSize; y++) {
        for (let x = 0; x < analysisSize; x++) {
          const i = y * analysisSize + x;
          const p = i * 4;
          const r = sourceData[p];
          const g = sourceData[p + 1];
          const b = sourceData[p + 2];
          const a = sourceData[p + 3];
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const yv = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          const sat = max === 0 ? 0 : (max - min) / max;

          if (a < 250) hasTransparency = true;
          sourceLuma[i] = yv;
          sourceSat[i] = sat;
          lumaMean += yv;
          saturationMean += sat;

          if (x > 0) edgeEnergy += Math.abs(yv - sourceLuma[i - 1]);
          if (y > 0) edgeEnergy += Math.abs(yv - sourceLuma[i - analysisSize]);
        }
      }

      const pixelCount = sourceLuma.length;
      lumaMean /= pixelCount;
      saturationMean /= pixelCount;
      for (let i = 0; i < pixelCount; i++) {
        const d = sourceLuma[i] - lumaMean;
        lumaVariance += d * d;
      }
      lumaVariance /= pixelCount;

      const detailLevel = Math.min(1, edgeEnergy / (pixelCount * 32));
      const flatness = Math.max(0, Math.min(1, 1 - lumaVariance / 5000));
      const isLikelyPhoto = !hasTransparency && !flatness && (saturationMean > 0.08 || lumaVariance > 1700);
      const isLikelyTextGraphic = detailLevel > 0.42 && saturationMean < 0.30 && lumaVariance < 3200;
      const contentType = hasTransparency
        ? 'transparent-graphic'
        : isLikelyTextGraphic
          ? 'text-graphic'
          : isLikelyPhoto
            ? 'photo'
            : 'graphic';

      // A small, browser-local quality model. It is intentionally used only to
      // compare candidates generated from the same source; it is not a formal
      // standardized image-quality measurement.
      const scoreCandidate = async (candidate: File, candidateDimension: number): Promise<number> => {
        try {
          const image = await loadImage(candidate);
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = analysisSize;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) return 0;
          ctx.clearRect(0, 0, analysisSize, analysisSize);
          ctx.drawImage(image, 0, 0, analysisSize, analysisSize);
          const data = ctx.getImageData(0, 0, analysisSize, analysisSize).data;

          const candidateLuma = new Float32Array(pixelCount);
          let absError = 0;
          let squareError = 0;
          let alphaError = 0;
          let edgeError = 0;
          let colorError = 0;

          for (let y = 0; y < analysisSize; y++) {
            for (let x = 0; x < analysisSize; x++) {
              const i = y * analysisSize + x;
              const p = i * 4;
              const r = data[p];
              const g = data[p + 1];
              const b = data[p + 2];
              const a = data[p + 3];
              const yv = 0.2126 * r + 0.7152 * g + 0.0722 * b;
              candidateLuma[i] = yv;
              const d = Math.abs(sourceLuma[i] - yv);
              absError += d;
              squareError += d * d;
              colorError += Math.abs(sourceData[p] - r) + Math.abs(sourceData[p + 1] - g) + Math.abs(sourceData[p + 2] - b);
              if (hasTransparency) alphaError += Math.abs(sourceData[p + 3] - a);

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
              const ssim = ((2 * muA * muB + c1) * (2 * cov + c2)) /
                ((muA * muA + muB * muB + c1) * (varA + varB + c2));
              ssimSum += Math.max(0, Math.min(1, ssim));
              blocks++;
            }
          }

          const mae = absError / pixelCount;
          const rmse = Math.sqrt(squareError / pixelCount);
          const normalizedEdgeError = edgeError / Math.max(1, pixelCount * 2);
          const normalizedColorError = colorError / Math.max(1, pixelCount * 3);
          const alphaPenalty = hasTransparency ? (alphaError / pixelCount) * 0.10 : 0;
          const structure = ssimSum / Math.max(1, blocks);
          const maeScore = Math.max(0, 1 - mae / 42);
          const rmseScore = Math.max(0, 1 - rmse / 58);
          const colorScore = Math.max(0, 1 - normalizedColorError / 42);
          const edgeScore = Math.max(0, 1 - normalizedEdgeError / 18);
          const resolutionRatio = Math.min(1, candidateDimension / Math.max(sourceMaxDimension, 1));
          const resolutionPenalty = resolutionRatio < 1
            ? (1 - resolutionRatio) * (0.50 + detailLevel * 0.50)
            : 0;

          const perceptual = (
            maeScore * 0.20 +
            rmseScore * 0.10 +
            colorScore * 0.12 +
            structure * 0.34 +
            edgeScore * 0.24
          );
          return 100 * Math.max(0, Math.min(1, perceptual - alphaPenalty - resolutionPenalty));
        } catch {
          return 0;
        }
      };

      const encodeCanvas = async (mime: string, q: number, dimension: number) => {
        const scale = Math.min(1, dimension / sourceMaxDimension);
        const width = Math.max(1, Math.round(sourceWidth * scale));
        const height = Math.max(1, Math.round(sourceHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context could not be created.');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // JPEG has no alpha channel. Paint transparent sources onto solid white
        // so transparent pixels do not turn black in the JPEG output.
        if (mime === 'image/jpeg' && hasTransparency) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
        }
        ctx.drawImage(sourceImage, 0, 0, width, height);

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (value) => {
              if (value) resolve(value);
              else reject(new Error(`Your browser could not encode ${mime}.`));
            },
            mime,
            q
          );
        });

        canvas.width = 0;
        canvas.height = 0;

        return { blob, width, height };
      };

      const encodeCandidate = async (
        candidateFormat: Exclude<OutputFormat, 'auto'>,
        q: number,
        dimension: number,
      ): Promise<{ file: File; format: Exclude<OutputFormat, 'auto'>; width: number; height: number }> => {
        let finalFormat = candidateFormat;
        if (finalFormat === 'avif' && !supportedMime('image/avif')) finalFormat = 'webp';

        const mime = getMimeForFormat(finalFormat, baseFile.type);
        const shouldResize = dimension < sourceMaxDimension;

        if (finalFormat === 'original' && !shouldResize && !stripMetadata) {
          return { file: baseFile, format: 'original', width: sourceWidth, height: sourceHeight };
        }

        const { blob, width: encodedWidth, height: encodedHeight } = await encodeCanvas(mime, q, dimension);
        let actualBlob = blob;
        let actualFormat = finalFormat;

        if (finalFormat === 'avif' && blob.type !== 'image/avif') {
          const fallback = await encodeCanvas('image/webp', q, dimension);
          actualBlob = fallback.blob;
          actualFormat = 'webp';
        }

        const ext = getOutputExtension(actualFormat, baseFile.name, actualBlob.type || mime);
        const file = new File([actualBlob], `${getBaseName(baseFile.name)}.${ext}`, {
          type: actualBlob.type || mime,
        });

        return {
          file,
          format: actualFormat,
          width: encodedWidth,
          height: encodedHeight,
        };
      };

      type Candidate = {
        file: File;
        score: number;
        format: Exclude<OutputFormat, 'auto'>;
        dimension: number;
        quality: number;
        width: number;
        height: number;
      };

      const originalExt = getExtension(baseFile.name);
      const sourceMime = baseFile.type.toLowerCase();
      const sourceIsPng = sourceMime === 'image/png' || originalExt === 'png';
      const sourceIsGif = sourceMime === 'image/gif' || originalExt === 'gif';
      const sourceIsSvg = sourceMime === 'image/svg+xml' || originalExt === 'svg';

      // Lossless mode is intentionally pixel-preserving. If a resize is entered,
      // the engine ignores it rather than silently turning "lossless" into lossy.
      if (optimizationMode === 'lossless') {
        const oldCompressedUrl = img.compressedUrl;
        if (oldCompressedUrl) URL.revokeObjectURL(oldCompressedUrl);
        setImages((prev) => prev.map((i) => i.id === img.id ? {
          ...i,
          compressedFile: baseFile,
          compressedUrl: URL.createObjectURL(baseFile),
          compressedSize: baseFile.size,
          status: 'already_optimized',
          finalExtension: originalExt || 'jpg',
          finalMime: baseFile.type || 'image/jpeg',
          width: sourceWidth,
          height: sourceHeight,
          qualityScore: 100,
          optimizationNote: maxDimension > 0
            ? 'Lossless mode preserved the original pixels and ignored the resize limit. Use Smart/Maximum mode when you want resizing.'
            : stripMetadata
              ? 'Lossless mode preserved the original pixels. Metadata was kept because removing metadata requires re-encoding.'
              : 'Lossless mode preserved the original pixels and file data.',
          errorMessage: undefined,
        } : i));
        return;
      }

      const qualityCeiling = Math.min(0.98, Math.max(0.10, quality / 100));
      const qualityFloor = optimizationMode === 'maximum'
        ? (detailLevel > 0.65 ? 0.40 : 0.35)
        : optimizationMode === 'target'
          ? (detailLevel > 0.65 ? 0.55 : 0.45)
          : (detailLevel > 0.65 ? 0.65 : 0.55);

      const forcedDimension = maxDimension > 0
        ? Math.min(maxDimension, sourceMaxDimension)
        : sourceMaxDimension;

      const baseDimensions = [forcedDimension];
      if (forcedDimension > 1400) baseDimensions.push(Math.round(forcedDimension * 0.92));
      if (forcedDimension > 2200) baseDimensions.push(Math.round(forcedDimension * 0.84));
      if (optimizationMode === 'target' && forcedDimension > 1800) baseDimensions.push(Math.round(forcedDimension * 0.74));

      const dimensionCandidates = Array.from(new Set(baseDimensions))
        .map((d) => Math.max(320, Math.min(forcedDimension, d)))
        .filter((d) => d > 0);

      let formatCandidates: Exclude<OutputFormat, 'auto'>[];
      if (format === 'original') {
        formatCandidates = ['original'];
      } else if (format !== 'auto') {
        formatCandidates = [format];
      } else if (sourceIsSvg) {
        formatCandidates = ['original'];
      } else if (hasTransparency) {
        formatCandidates = ['webp', 'avif', 'png'];
      } else if (contentType === 'photo') {
        formatCandidates = ['avif', 'webp', 'jpeg'];
      } else if (contentType === 'text-graphic') {
        formatCandidates = ['webp', 'avif', 'png'];
      } else {
        formatCandidates = ['avif', 'webp', sourceIsPng ? 'png' : 'jpeg'];
      }

      // Map unsupported AVIF to WebP and deduplicate candidates
      formatCandidates = Array.from(
        new Set(
          formatCandidates.map((candidate) => {
            if (candidate === 'avif' && !supportedMime('image/avif')) return 'webp';
            return candidate;
          })
        )
      ).filter((candidate) => {
        if (candidate === 'png') return supportedMime('image/png');
        if (candidate === 'webp') return supportedMime('image/webp');
        return true;
      });

      if (!formatCandidates.length) {
        formatCandidates = ['webp'];
      }

      const candidates: Candidate[] = [];
      const pushCandidate = async (candidateFormat: Exclude<OutputFormat, 'auto'>, dimension: number, q: number) => {
        const encoded = await encodeCandidate(candidateFormat, q, dimension);
        const score = await scoreCandidate(encoded.file, Math.max(encoded.width, encoded.height));
        candidates.push({
          file: encoded.file,
          score,
          format: encoded.format,
          dimension,
          quality: q,
          width: encoded.width,
          height: encoded.height,
        });
      };

      // Baseline is a real candidate for Auto/Original modes.
      if (format === 'auto' || format === 'original') {
        candidates.push({
          file: baseFile,
          score: 100,
          format: 'original',
          dimension: sourceMaxDimension,
          quality: 1,
          width: sourceWidth,
          height: sourceHeight,
        });
      }

      for (const candidateFormat of formatCandidates) {
        const dimensions = optimizationMode === 'smart'
          ? dimensionCandidates.slice(0, Math.min(2, dimensionCandidates.length))
          : dimensionCandidates;

        for (const dimension of dimensions) {
          if (requestedTargetBytes) {
            if (baseFile.size <= requestedTargetBytes && dimension === sourceMaxDimension) {
              continue;
            }

            let low = qualityFloor;
            let high = qualityCeiling;
            for (let pass = 0; pass < 5; pass++) {
              const q = (low + high) / 2;
              const encoded = await encodeCandidate(candidateFormat, q, dimension);
              const score = await scoreCandidate(encoded.file, Math.max(encoded.width, encoded.height));
              candidates.push({ file: encoded.file, score, format: encoded.format, dimension, quality: q, width: encoded.width, height: encoded.height });
              if (encoded.file.size <= requestedTargetBytes) low = q;
              else high = q;
            }
            await pushCandidate(candidateFormat, dimension, qualityFloor);
            await pushCandidate(candidateFormat, dimension, qualityCeiling);
          } else if (optimizationMode === 'maximum') {
            await pushCandidate(candidateFormat, dimension, qualityFloor);
            await pushCandidate(candidateFormat, dimension, Math.max(0.35, qualityFloor - 0.10));
          } else {
            await pushCandidate(candidateFormat, dimension, qualityCeiling);
            const mid = Math.max(qualityFloor, qualityCeiling - 0.10);
            await pushCandidate(candidateFormat, dimension, mid);
            if (mid > qualityFloor) await pushCandidate(candidateFormat, dimension, qualityFloor);
          }
        }
      }

      const uniqueCandidates = candidates.filter((candidate, index, arr) =>
        arr.findIndex((other) =>
          other.file.size === candidate.file.size &&
          other.format === candidate.format &&
          other.dimension === candidate.dimension &&
          Math.abs(other.quality - candidate.quality) < 0.001
        ) === index
      );

      const fallbackCandidate: Candidate = {
        file: baseFile,
        score: 100,
        format: 'original',
        dimension: sourceMaxDimension,
        quality: 1,
        width: sourceWidth,
        height: sourceHeight,
      };

      const originalBytes = baseFile.size;
      const requestedConversion = format !== 'auto' && format !== 'original';
      const requestedResize = maxDimension > 0 && maxDimension < sourceMaxDimension;
      const candidateList: CompressionCandidate[] = uniqueCandidates.map((c) => ({
        format: c.format,
        quality: c.quality,
        dimension: c.dimension,
        width: c.width,
        height: c.height,
        sizeBytes: c.file.size,
        score: c.score,
      }));

      const selectionResult = selectOptimalCandidate(
        candidateList,
        originalBytes,
        optimizationMode,
        requestedTargetBytes,
        requestedConversion,
        requestedResize,
        contentType
      );

      const matchedCandidate = uniqueCandidates.find(
        (c) =>
          c.format === selectionResult.selected.format &&
          c.dimension === selectionResult.selected.dimension &&
          Math.abs(c.quality - selectionResult.selected.quality) < 0.001 &&
          c.file.size === selectionResult.selected.sizeBytes
      );

      const selected = matchedCandidate || fallbackCandidate;
      const optimizationNote = selectionResult.note;
      const dimensionsChanged = selected.width !== sourceWidth || selected.height !== sourceHeight;

      const autoConversionNeedsWin =
        format === 'auto' &&
        selected.format !== 'original' &&
        selected.file.size >= baseFile.size * 0.995;

      const finalFile =
        selectionResult.shouldKeepOriginal || autoConversionNeedsWin
          ? baseFile
          : selected.file;
      const finalStatus: ImageStatus =
        finalFile === baseFile ? 'already_optimized' : 'done';

      const oldCompressedUrl = img.compressedUrl;
      if (oldCompressedUrl) URL.revokeObjectURL(oldCompressedUrl);

      const finalDimensions = finalFile === baseFile
        ? { width: sourceWidth, height: sourceHeight }
        : { width: selected.width, height: selected.height };
      const finalMime = finalFile.type || sourceMime || 'image/jpeg';
      const finalExt = finalFile === baseFile
        ? originalExt || 'jpg'
        : getOutputExtension(selected.format, baseFile.name, finalMime);

      const formatNote = finalFile !== baseFile && selected.format !== 'original'
        ? ` Output format: ${selected.format.toUpperCase()}.`
        : '';
      const dimensionNote = dimensionsChanged && finalFile !== baseFile
        ? ` Resized to ${finalDimensions.width}×${finalDimensions.height}.`
        : '';
      const transparencyNote = (selected.format === 'jpeg' && hasTransparency)
        ? ' Transparent background rendered on white for JPEG output.'
        : '';
      const animationNote = (img.isAnimated || sourceIsGif || baseFile.type === 'image/gif')
        ? ' Animated images are processed as a single frame.'
        : '';
      const avifFallbackNote = (format === 'avif' && !supportedMime('image/avif'))
        ? ' AVIF is unsupported by your browser; WebP was used instead.'
        : '';

      // Check if image still exists in state
      if (!imagesRef.current.some((i) => i.id === img.id)) return;

      setImages((prev) => prev.map((i) => i.id === img.id ? {
        ...i,
        compressedFile: finalFile,
        compressedUrl: URL.createObjectURL(finalFile),
        compressedSize: finalFile.size,
        status: finalStatus,
        finalExtension: finalExt,
        finalMime,
        width: finalDimensions.width,
        height: finalDimensions.height,
        qualityScore: finalFile === baseFile ? 100 : selected.score,
        optimizationNote: (finalFile === baseFile && autoConversionNeedsWin)
          ? 'The original file was already the safer result; Auto avoided a format conversion without a meaningful size benefit.'
          : optimizationNote + formatNote + dimensionNote + transparencyNote + animationNote + avifFallbackNote,
        errorMessage: undefined,
      } : i));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Compression failed.';
      setImages((prev) => prev.map((i) => i.id === img.id ? {
        ...i,
        status: 'error',
        errorMessage: message,
      } : i));
    }
  };

  const processAll = async () => {
    if (isProcessingBatch) return;

    const batchId = ++activeBatchIdRef.current;
    setIsProcessingBatch(true);
    setNotice(null);

    const pendingImages = images.filter(
      (i) => i.status === 'pending' || i.status === 'error'
    );

    for (const img of pendingImages) {
      if (activeBatchIdRef.current !== batchId) break;
      if (!imagesRef.current.some((i) => i.id === img.id)) continue;
      await compressSingleImage(img);
    }

    if (activeBatchIdRef.current === batchId) {
      setIsProcessingBatch(false);
    }
  };

  const retryImage = async (id: string) => {
    const img = images.find((i) => i.id === id);
    if (!img) return;
    await compressSingleImage(img);
  };

  const downloadImage = (img: ImageFile) => {
    if (!img.compressedUrl || !img.compressedFile) return;

    const link = document.createElement('a');
    link.href = img.compressedUrl;
    link.download = `${getBaseName(img.originalFile.name)}_omnitools.${img.finalExtension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const downloadAllAsZip = async () => {
    const processedImages = images.filter(
      (img) =>
        (img.status === 'done' || img.status === 'already_optimized') &&
        img.compressedFile
    );
    if (!processedImages.length) return;

    const zip = new JSZip();
    const usedNames = new Set<string>();

    processedImages.forEach((img) => {
      const base = `${getBaseName(img.originalFile.name)}_omnitools`;
      let fileName = `${base}.${img.finalExtension}`;
      let suffix = 2;

      while (usedNames.has(fileName.toLowerCase())) {
        fileName = `${base}_${suffix}.${img.finalExtension}`;
        suffix++;
      }

      usedNames.add(fileName.toLowerCase());
      zip.file(fileName, img.compressedFile!);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'OmniTools_Optimized_Images.zip';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const copySummary = async () => {
    const text = `OmniTools Image Optimizer: ${stats.processed} image(s), ${formatSize(
      stats.originalBytes
    )} → ${formatSize(stats.outputBytes)}, saved ${formatSize(stats.savedBytes)} (${stats.savings}%).`;

    try {
      await navigator.clipboard.writeText(text);
      setNotice('Optimization summary copied.');
      setTimeout(() => setNotice(null), 2500);
    } catch {
      setNotice('Could not copy the summary in this browser.');
    }
  };

  const activePreview = images.find((i) => i.id === previewId);
  const processedCount = images.filter(
    (i) => i.status === 'done' || i.status === 'already_optimized'
  ).length;
  const pendingCount = images.filter((i) => i.status === 'pending' || i.status === 'error').length;

  return (
    <div className="flex flex-col gap-8 bg-white dark:bg-[#0a0f1a] transition-colors">
      {images.length === 0 && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Drag and drop or press Enter to upload images for compression"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`h-72 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 shadow-[0_0_20px_rgba(37,99,235,0.2)]'
              : 'border-gray-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:bg-gray-50 dark:hover:bg-[#0d1424]'
          }`}
        >
          <div className="bg-blue-600/10 dark:bg-blue-500/10 p-4 rounded-full mb-4">
            <UploadCloud className="w-10 h-10 text-blue-600 dark:text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            Drag & Drop Images Here
          </h3>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
            JPEG, PNG, WebP, AVIF, HEIC, TIFF, RAW & more
          </p>
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-xs font-semibold border border-emerald-200 dark:border-emerald-800/50">
            <ShieldCheck className="w-4 h-4" /> Smart compression • local browser processing
          </div>
          <input
            type="file"
            multiple
            accept="image/*,.heic,.heif,.tiff,.tif,.raw,.dng,.bmp,.ico"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files) void addFiles(e.target.files);
              e.currentTarget.value = '';
            }}
            className="hidden"
          />
        </div>
      )}

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 rounded-2xl px-4 py-3 text-sm"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {images.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-sm dark:shadow-black/20">
              <p className="text-xs text-gray-500 dark:text-slate-400">Total Files</p>
              <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{images.length}</p>
            </div>
            <div className="bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-sm dark:shadow-black/20">
              <p className="text-xs text-gray-500 dark:text-slate-400">Processed</p>
              <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{processedCount}</p>
            </div>
            <div className="bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-sm dark:shadow-black/20">
              <p className="text-xs text-gray-500 dark:text-slate-400">Space Saved</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatSize(stats.savedBytes)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-sm dark:shadow-black/20">
              <p className="text-xs text-gray-500 dark:text-slate-400">Overall Reduction</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.savings}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-slate-700/70 p-7 rounded-3xl h-fit shadow-sm dark:shadow-[0_8px_30px_rgba(0,0,0,0.18)]">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-6">
                <Settings2 className="w-5 h-5 text-blue-600" /> Optimize Settings
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Optimization Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3 p-1">
                    {[
                      { id: 'smart', label: 'Best Optimize', icon: Sparkles, help: 'Automatically find the best result' },
                      { id: 'target', label: 'Target KB', icon: Target, help: 'Fit a specific file size' },
                      { id: 'maximum', label: 'Maximum', icon: Gauge, help: 'Smallest practical file' },
                      { id: 'lossless', label: 'Lossless', icon: Shield, help: 'Preserve visual pixels' },
                    ].map((mode) => {
                      const Icon = mode.icon;
                      const active = optimizationMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setOptimizationMode(mode.id as OptimizationMode)}
                          className={`text-left p-3 rounded-xl border transition-colors ${active ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm dark:shadow-[0_0_0_1px_rgba(59,130,246,0.08)]' : 'border-gray-200 dark:border-slate-700/80 bg-white dark:bg-[#0a0f1a] shadow-sm dark:shadow-[0_4px_14px_rgba(0,0,0,0.16)]'}`}
                        >
                          <span className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"><Icon className="w-4 h-4 text-blue-600" />{mode.label}</span>
                          <span className="block text-[10px] text-gray-500 dark:text-slate-400 mt-1">{mode.help}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {optimizationMode === 'target' && (
                  <div>
                    <label htmlFor="target-size-kb" className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      <span className="flex items-center gap-2"><Target className="w-4 h-4 text-blue-600" /> Target File Size</span>
                      <span className="text-blue-600 dark:text-blue-400">KB</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="target-size-kb"
                        aria-label="Target file size in kilobytes"
                        type="number" min="10" max="102400" value={targetSizeKB}
                        onChange={(e) => setTargetSizeKB(Math.min(102400, Math.max(10, Number(e.target.value) || 10)))}
                        className="w-full px-4 py-3 bg-white dark:bg-[#0a0f1a] border border-blue-200 dark:border-blue-900/50 rounded-xl text-sm text-slate-800 dark:text-slate-300 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <span className="flex items-center text-sm font-semibold text-gray-500">KB</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-2">The optimizer searches for the highest practical quality that fits your target, then reduces dimensions if necessary.</p>
                  </div>
                )}

                <div>
                  <label htmlFor="quality-slider" className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    <span>Quality Ceiling</span><span className="text-blue-600 dark:text-blue-400">{quality}%</span>
                  </label>
                  <input
                    id="quality-slider"
                    aria-label="Quality ceiling percentage"
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-between text-[11px] text-gray-400 mt-1"><span>More compression</span><span>Higher quality</span></div>
                  <p className="text-[11px] text-gray-500 mt-2">Quality ceiling controls lossy compression (JPEG, WebP, AVIF). Best Optimize decides the final setting automatically.</p>
                </div>

                <div>
                  <label htmlFor="output-format-select" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Convert Format To
                  </label>
                  <select
                    id="output-format-select"
                    aria-label="Convert format to"
                    value={format}
                    onChange={(e) => setFormat(e.target.value as OutputFormat)}
                    className="w-full px-4 py-3 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm text-slate-800 dark:text-slate-300 font-medium"
                  >
                    <option value="auto">Auto — Best for Image Type</option>
                    <option value="webp">WebP (Modern, high compression)</option>
                    <option value="avif">AVIF (Next-gen, fallback to WebP)</option>
                    <option value="jpeg">JPG (Standard photo format)</option>
                    <option value="png">PNG (Lossless with transparency)</option>
                  </select>
                  {format === 'png' && (
                    <p className="text-[11px] text-gray-500 mt-1.5">Note: PNG uses lossless compression; quality ceiling applies to lossy formats (JPEG/WebP/AVIF).</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setAdvancedOpen((v) => !v)}
                  className="w-full flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-300 pt-4 border-t border-gray-200 dark:border-slate-800"
                >
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                    Advanced Optimization
                  </span>
                  <span className="text-xs text-blue-600">{advancedOpen ? 'Hide' : 'Show'}</span>
                </button>

                {advancedOpen && (
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="max-dimension-select" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        <Maximize2 className="w-4 h-4 text-blue-600" /> Max Width / Height
                      </label>
                      <select
                        id="max-dimension-select"
                        aria-label="Maximum width or height dimension"
                        value={maxDimension}
                        onChange={(e) => setMaxDimension(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value={0}>Keep Original Dimensions</option>
                        <option value={4096}>4096 px</option>
                        <option value={3000}>3000 px</option>
                        <option value={2560}>2560 px</option>
                        <option value={2048}>2048 px</option>
                        <option value={1920}>1920 px</option>
                        <option value={1600}>1600 px</option>
                        <option value={1280}>1280 px</option>
                        <option value={1024}>1024 px</option>
                      </select>
                    </div>

                    <label htmlFor="strip-metadata-checkbox" className="flex items-center justify-between gap-3 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl p-3 cursor-pointer">
                      <span>
                        <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Remove metadata</span>
                        <span className="block text-[11px] text-gray-500 mt-1">
                          {stripMetadata
                            ? 'Strip EXIF/GPS data to protect privacy. Visual orientation is normalized.'
                            : 'Keep metadata if original file is preserved. Note: Browser re-encoding strips arbitrary EXIF/ICC profiles.'}
                        </span>
                      </span>
                      <input
                        id="strip-metadata-checkbox"
                        aria-label="Remove metadata and EXIF tags"
                        type="checkbox"
                        checked={stripMetadata}
                        onChange={(e) => setStripMetadata(e.target.checked)}
                        className="h-4 w-4 accent-blue-600"
                      />
                    </label>

                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-300">
                      <strong>Best Optimize is the default.</strong> The optimizer tests multiple local encodes and keeps the smallest candidate that remains visually close to the source. Target KB mode is available when an exact size constraint matters.
                    </div>

                    <div className="bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-xs text-gray-500 dark:text-slate-400">
                      <strong className="text-slate-700 dark:text-slate-300">Privacy:</strong> compression happens locally in your browser. Files are not uploaded by this component to an OmniTools server.
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 dark:border-slate-800 flex flex-col gap-3">
                  <button
                    onClick={processAll}
                    disabled={isProcessingBatch || pendingCount === 0}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {isProcessingBatch ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <SlidersHorizontal className="w-5 h-5" />
                    )}
                    {isProcessingBatch ? 'Optimizing...' : optimizationMode === 'smart' ? 'Best Optimize Images' : 'Optimize Images'}
                  </button>

                  {processedCount > 0 && (
                    <>
                      <button
                        onClick={downloadAllAsZip}
                        className="w-full bg-slate-800 hover:bg-slate-700 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-[#0a0f1a] px-4 py-3.5 rounded-xl font-bold transition-all flex justify-center items-center gap-2"
                      >
                        <FileArchive className="w-5 h-5" /> Download All (ZIP)
                      </button>
                      <button
                        onClick={copySummary}
                        className="w-full bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-3 rounded-xl font-semibold transition-all flex justify-center items-center gap-2"
                      >
                        <Copy className="w-4 h-4" /> Copy Savings Summary
                      </button>
                    </>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 text-sm text-blue-600 font-medium hover:underline mt-2"
                    >
                      + Add more images
                    </button>
                    <button
                      onClick={clearAll}
                      className="text-sm text-gray-500 hover:text-red-500 font-medium mt-2 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Clear
                    </button>
                  </div>

                  <input
                    type="file"
                    multiple
                    accept="image/*,.heic,.heif,.tiff,.tif,.raw,.dng,.bmp,.ico"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files) void addFiles(e.target.files);
                      e.currentTarget.value = '';
                    }}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 flex flex-col gap-6">
              {activePreview &&
                (activePreview.status === 'done' || activePreview.status === 'already_optimized') && (
                  <div className="bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl relative h-80 flex items-center justify-center group">
                    <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-lg text-xs backdrop-blur-md z-10 border border-white/10">
                      Original
                    </div>
                    <div className="absolute top-4 right-4 bg-blue-600/80 text-white px-3 py-1 rounded-lg text-xs backdrop-blur-md z-10 border border-white/10">
                      {activePreview.finalExtension.toUpperCase()}
                    </div>

                    <div className="relative w-full h-full select-none">
                      <img
                        src={activePreview.compressedUrl!}
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                        alt="Optimized preview"
                      />

                      <div
                        className="absolute inset-0 overflow-hidden"
                        style={{ width: `${sliderPos}%` }}
                      >
                        <div className="w-full h-full relative">
                          <img
                            src={activePreview.originalUrl}
                            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                            alt="Original preview"
                          />
                        </div>
                      </div>

                      <div
                        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20"
                        style={{ left: `calc(${sliderPos}% - 2px)` }}
                      >
                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-blue-600">
                          <ArrowRight className="w-3 h-3 text-blue-600" />
                        </div>
                      </div>

                      <input
                        aria-label="Original and optimized preview comparison"
                        type="range"
                        min="0"
                        max="100"
                        value={sliderPos}
                        onChange={(e) => setSliderPos(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                      />
                    </div>
                  </div>
                )}

              <div className="space-y-3">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-700/80 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 hover:border-blue-500/50 transition-colors"
                  >
                    <div className="w-16 h-16 shrink-0 bg-gray-100 dark:bg-[#0a0f1a] rounded-xl overflow-hidden flex items-center justify-center text-xs text-gray-400 relative">
                      <img
                        src={img.originalUrl}
                        alt={img.originalFile.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      {img.originalFile.name.toLowerCase().match(/\.(heic|heif|tiff|tif|raw|dng)$/) && (
                        <span className="absolute font-bold bg-black/50 text-white px-1 rounded">SOURCE</span>
                      )}
                    </div>

                    <div className="flex-grow w-full text-center sm:text-left min-w-0">
                      <div className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate mb-1">
                        {img.originalFile.name}
                      </div>

                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">
                          {formatSize(img.originalSize)}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span
                          className={`text-sm font-bold ${
                            img.status === 'done' || img.status === 'already_optimized'
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {img.compressedSize != null ? formatSize(img.compressedSize) : 'Pending'}
                        </span>
                        {img.originalWidth && img.originalHeight && (
                          <span className="text-xs text-gray-400">
                            {img.originalWidth}×{img.originalHeight}
                            {img.width && img.height && (img.width !== img.originalWidth || img.height !== img.originalHeight)
                              ? ` → ${img.width}×${img.height}`
                              : ''}
                          </span>
                        )}
                      </div>

                      {img.status === 'done' && img.compressedSize != null && (
                        img.compressedSize < img.originalSize ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                            <CheckCircle2 className="w-3 h-3" />
                            Saved {calculateSavings(img.originalSize, img.compressedSize).savingsPercent}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/40">
                            Output larger than source (+{Math.round(((img.compressedSize - img.originalSize) / Math.max(1, img.originalSize)) * 100)}%)
                          </span>
                        )
                      )}

                      {img.status === 'already_optimized' && (
                        <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/50">
                          <Zap className="w-3 h-3" /> Already Optimized
                        </span>
                      )}

                      {(img.isAnimated || img.originalFile.type === 'image/gif' || img.originalFile.name.toLowerCase().endsWith('.gif')) && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/40 ml-1">
                          Single frame
                        </span>
                      )}

                      {img.optimizationNote && (img.status === 'done' || img.status === 'already_optimized') && (
                        <>
                          {img.qualityScore != null && (
                            <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800/40 mr-1">
                              Quality match {img.qualityScore.toFixed(1)}/100
                            </span>
                          )}
                          <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">{img.optimizationNote}</p>
                        </>
                      )}

                      {img.status === 'compressing' && (
                        <span className="text-xs text-blue-500 flex items-center gap-1 justify-center sm:justify-start">
                          <Loader2 className="w-3 h-3 animate-spin" /> Processing...
                        </span>
                      )}

                      {img.status === 'error' && (
                        <span className="text-xs text-red-500 flex items-center gap-1 justify-center sm:justify-start mt-1">
                          <AlertCircle className="w-3 h-3" />
                          {img.errorMessage || 'Error processing file'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end mt-2 sm:mt-0">
                      {img.status === 'error' && (
                        <button
                          onClick={() => void retryImage(img.id)}
                          className="text-xs font-semibold px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Retry
                        </button>
                      )}

                      {(img.status === 'done' || img.status === 'already_optimized') && (
                        <>
                          <button
                            onClick={() => setPreviewId(img.id)}
                            className="text-xs font-semibold px-3 py-2 bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => downloadImage(img)}
                            className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                            aria-label={`Download ${img.originalFile.name}`}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => removeImage(img.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        aria-label={`Remove ${img.originalFile.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
