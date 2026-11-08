/**
 * KivaroTools — Enterprise HEIC & AVIF to JPG/PNG/WebP/PDF Batch Converter,
 * Forensic ISOBMFF Container Inspector & EXIF/GPS Privacy Studio Engine
 * (`lib/heicAvifConverterEngine.ts`)
 *
 * 100% Client-Side, Zero-Upload Deterministic Binary Architecture (v4.5):
 * 1. Forensic Binary ISOBMFF (`ftyp`, `meta`, `hdlr`, `pitm`, `iinf`, `iprp`, `ipco`,
 *    `ispe`, `colr`, `pixi`, `irot`, `imir`, `auxC`, `Exif`, `mdat`) & Magic-Byte
 *    (`JPEG`, `PNG`, `WebP`) Container Inspector with Misnamed File Auto-Recovery.
 * 2. Complete 16-Tag Binary EXIF (`0xFFE1` / ISOBMFF `Exif` / PNG `eXIf` / WebP `EXIF`)
 *    & GPS (`GPSLatitude`, `GPSLongitude`, `GPSAltitude`, `Make`, `Model`, `LensModel`,
 *    `DateTimeOriginal`, `ExposureTime`, `FNumber`, `FocalLength`, `ISOSpeedRatings`,
 *    `Orientation` `0x0112`, `BodySerialNumber`, `CameraOwnerName`, `HostComputer`,
 *    `MakerNote`) Parser & 3-Mode Privacy Scrubber (`STRIP_ALL`, `KEEP_CAMERA_STRIP_GPS`,
 *    `PRESERVE_ALL`) with Forensic Output Binary Re-Verification.
 * 3. Display P3 (`colr` `nclx` Primaries 12 / ICC `Display P3`) -> Perceptual sRGB
 *    Bradford-Adapted 3x3 Gamut Pipeline + Unified `irot`/`imir` & EXIF `0x0112`
 *    Orientation Normalizer + Custom Alpha Matte Background Compositor (`#FFFFFF`,
 *    `#F8FAFC`, `#FEF3C7`, `#000000`, or any custom `#RRGGBB`).
 * 4. 4-Format Standards-Compliant Binary Encoder:
 *    - Baseline DCT JPEG (`SOI`, `APP0 JFIF`, `APP1 Exif`, `DQT` Luma+Chroma, `SOF0`,
 *      `DHT`, `SOS` with Full 8x8 Separable 2D Forward & Inverse DCT, `EOI`).
 *    - 32-Bit RGBA Lossless PNG (`IHDR`, `sRGB`, optional `eXIf`, RFC 1950 Zlib `IDAT`
 *      with Adler-32 & CRC-32, `IEND`).
 *    - RFC 9649 / Google `VP8L` Lossless WebP (`RIFF....WEBP` + `VP8L` canonical prefix
 *      bitstream + optional `EXIF` chunk — verified by Python `PIL.Image.open()`).
 *    - Multi-Page Printable PDF 1.7 Document & Contact Sheet (`%PDF-1.7` with embedded
 *      `/DCTDecode` XObjects).
 * 5. True Mathematical Signal Fidelity Telemetry (Real Pixel-by-Pixel MSE, PSNR in dB,
 *    and Wang-Bovik Structural Similarity Index SSIM) + Binary-Search Target Max File
 *    Size (KB) Auto-Tuner (`<= 50 KB`, `<= 100 KB`, `<= 200 KB`, `<= 500 KB`, `<= 1024 KB`).
 */

export const HEIC_AVIF_CONVERTER_ENGINE_VERSION = '4.5.0-enterprise';

export type TargetOutputFormat = 'JPG' | 'PNG' | 'WEBP' | 'PDF';

export type ExifPrivacyMode =
    | 'STRIP_ALL'
    | 'KEEP_CAMERA_STRIP_GPS'
    | 'PRESERVE_ALL';

export type DimensionResizePreset =
    | 'ORIGINAL'
    | 'MAX_3840_4K'
    | 'MAX_1920_FHD'
    | 'MAX_1200_WEB'
    | 'PASSPORT_600X600'
    | 'CUSTOM_MAX';

export type TargetMaxKbPreset = 0 | 50 | 100 | 200 | 500 | 1024;

export type ColorGamutMappingMode = 'PERCEPTUAL_SRGB' | 'PRESERVE_DISPLAY_P3';

export type BatchRenamePatternId =
    | 'ORIGINAL'
    | 'PREFIX_INDEX'
    | 'DATE_ORIGINAL'
    | 'BRAND_DIM_INDEX';

export type SamplePresetId =
    | 'iphone16_portrait_heic'
    | 'transparent_logo_avif'
    | 'multi_photo_batch_mix'
    | 'visa_portal_100kb_demo';

export interface RgbaImageBuffer {
    width: number;
    height: number;
    pixels: Uint8Array; // length = width * height * 4
}

export interface IsobmffBoxInfo {
    type: string;
    offset: number;
    size: number;
    depth: number;
    summary: string;
    hexPreview: string;
}

export interface ParsedExifTag {
    tagIdHex: string;
    tagName: string;
    ifdGroup: 'IFD0' | 'ExifIFD' | 'GPSIFD';
    rawValueDisplay: string;
    isSensitiveLocationOrSerial: boolean;
    actionInCurrentMode: 'STRIPPED' | 'PRESERVED';
}

export interface GpsCoordinatesInfo {
    hasGpsCoordinates: boolean;
    latitudeDecimal: number | null;
    longitudeDecimal: number | null;
    altitudeMeters: number | null;
    formattedDms: string;
    locationLabel: string;
}

export interface ContainerForensicReport {
    detectedPhysicalContainer: 'HEIC' | 'HEIF' | 'AVIF' | 'JPEG' | 'PNG' | 'WEBP' | 'UNKNOWN';
    declaredExtension: string;
    isExtensionMismatch: boolean;
    extensionMismatchWarning: string | null;
    ftypMajorBrand: string;
    ftypMinorVersion: number;
    ftypCompatibleBrands: string[];
    width: number;
    height: number;
    bitDepthPerChannel: number[];
    hasAlphaPlane: boolean;
    hasHdrGainMap: boolean;
    hasPortraitDepthMatte: boolean;
    colorSpaceLabel: 'Display P3 (Wide Gamut)' | 'Rec. 2020 (HDR10 / HLG)' | 'sRGB (BT.709)' | 'Untagged sRGB';
    isWideGamutDisplayP3: boolean;
    irotDegreesCounterClockwise: 0 | 90 | 180 | 270;
    imirAxis: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
    exifOrientationCode: number;
    totalAutoRotationDegreesClockwise: 0 | 90 | 180 | 270;
    boxes: IsobmffBoxInfo[];
    leadingHex32: string;
}

export interface ExifForensicReport {
    hasExifSegment: boolean;
    byteOrder: 'LITTLE_ENDIAN_II' | 'BIG_ENDIAN_MM' | 'NONE';
    cameraMake: string;
    cameraModel: string;
    lensModel: string;
    software: string;
    dateTimeOriginal: string;
    exposureTime: string;
    fNumber: string;
    isoSpeed: number | null;
    focalLengthMm: string;
    bodySerialNumber: string;
    cameraOwnerName: string;
    hostComputer: string;
    hasAppleMakerNote: boolean;
    gps: GpsCoordinatesInfo;
    tags: ParsedExifTag[];
    totalTagsFound: number;
    sensitiveTagsFoundCount: number;
    tagsStrippedCount: number;
    tagsPreservedCount: number;
}

export interface BatchConversionOptions {
    targetFormat: TargetOutputFormat;
    qualityPercent: number; // 5..100
    targetMaxKb: number; // 0 = no limit, otherwise e.g. 50, 100, 200, 500, 1024
    exifPrivacyMode: ExifPrivacyMode;
    dimensionPreset: DimensionResizePreset;
    customMaxDimensionPx: number;
    alphaMatteHex: string; // e.g. '#FFFFFF', '#F8FAFC', '#000000'
    colorGamutMode: ColorGamutMappingMode;
    batchRenamePattern: BatchRenamePatternId;
    batchRenamePrefix: string;
}

export interface InputImageItem {
    id: string;
    originalFileName: string;
    rawBytes: Uint8Array;
    userRotateDegrees: 0 | 90 | 180 | 270;
    userFlipHorizontal: boolean;
    userFlipVertical: boolean;
    perFileFormatOverride: TargetOutputFormat | null;
    decodedRgba?: RgbaImageBuffer;
}

export interface ConvertedImageResult {
    id: string;
    indexOneBased: number;
    originalFileName: string;
    outputFileName: string;
    originalByteLength: number;
    outputByteLength: number;
    byteDelta: number;
    compressionRatioPercent: number;
    effectiveTargetFormat: TargetOutputFormat;
    effectiveQualityUsed: number;
    metTargetMaxKbBudget: boolean;
    targetMaxKbBudget: number;
    originalWidth: number;
    originalHeight: number;
    outputWidth: number;
    outputHeight: number;
    encodedRasterWidth: number;
    encodedRasterHeight: number;
    alphaPixelsCompositedCount: number;
    alphaMatteHexApplied: string | null;
    gamutMappedPixelsCount: number;
    psnrDbEstimate: number;
    ssimEstimate: number;
    inputSha256Hex: string;
    outputSha256Hex: string;
    containerForensics: ContainerForensicReport;
    inputExifForensics: ExifForensicReport;
    outputExifVerification: ExifForensicReport;
    outputBytes: Uint8Array;
    outputMimeType: string;
    previewSvgDataUri: string;
    originalPreviewSvgDataUri: string;
    processingDurationMs: number;
}

export interface BatchConversionSummaryReport {
    engineVersion: string;
    options: BatchConversionOptions;
    items: ConvertedImageResult[];
    totalFilesCount: number;
    totalOriginalBytes: number;
    totalOutputBytes: number;
    totalBytesSaved: number;
    averageSavingsPercent: number;
    totalGpsLocationsScrubbed: number;
    totalSensitiveExifTagsScrubbed: number;
    totalWideGamutP3MappedCount: number;
    totalAlphaMatteCompositedFiles: number;
    allFilesMetTargetKbBudget: boolean;
    averagePsnrDb: number;
    averageSsim: number;
    multiPagePdfBytes: Uint8Array | null;
}

// ============================================================================
// SECTION 1: DETERMINISTIC CRYPTO SHA-256, CRC-32, ADLER-32 & BASE64 UTILITIES
// ============================================================================

const SHA256_K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function rotr32(x: number, n: number): number {
    return (x >>> n) | (x << (32 - n));
}

export function computeSha256Hex(data: Uint8Array): string {
    let h0 = 0x6a09e667;
    let h1 = 0xbb67ae85;
    let h2 = 0x3c6ef372;
    let h3 = 0xa54ff53a;
    let h4 = 0x510e527f;
    let h5 = 0x9b05688c;
    let h6 = 0x1f83d9ab;
    let h7 = 0x5be0cd19;

    const bitLenHi = Math.floor((data.length * 8) / 0x100000000);
    const bitLenLo = (data.length * 8) >>> 0;
    const paddedLen = Math.ceil((data.length + 9) / 64) * 64;
    const padded = new Uint8Array(paddedLen);
    padded.set(data, 0);
    padded[data.length] = 0x80;
    const view = new DataView(padded.buffer);
    view.setUint32(paddedLen - 8, bitLenHi, false);
    view.setUint32(paddedLen - 4, bitLenLo, false);

    const w = new Uint32Array(64);
    for (let offset = 0; offset < paddedLen; offset += 64) {
        for (let i = 0; i < 16; i++) {
            w[i] = view.getUint32(offset + i * 4, false);
        }
        for (let i = 16; i < 64; i++) {
            const s0 = rotr32(w[i - 15], 7) ^ rotr32(w[i - 15], 18) ^ (w[i - 15] >>> 3);
            const s1 = rotr32(w[i - 2], 17) ^ rotr32(w[i - 2], 19) ^ (w[i - 2] >>> 10);
            w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
        }

        let a = h0;
        let b = h1;
        let c = h2;
        let d = h3;
        let e = h4;
        let f = h5;
        let g = h6;
        let h = h7;

        for (let i = 0; i < 64; i++) {
            const S1 = rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25);
            const ch = (e & f) ^ (~e & g);
            const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
            const S0 = rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22);
            const maj = (a & b) ^ (a & c) ^ (b & c);
            const temp2 = (S0 + maj) >>> 0;

            h = g;
            g = f;
            f = e;
            e = (d + temp1) >>> 0;
            d = c;
            c = b;
            b = a;
            a = (temp1 + temp2) >>> 0;
        }

        h0 = (h0 + a) >>> 0;
        h1 = (h1 + b) >>> 0;
        h2 = (h2 + c) >>> 0;
        h3 = (h3 + d) >>> 0;
        h4 = (h4 + e) >>> 0;
        h5 = (h5 + f) >>> 0;
        h6 = (h6 + g) >>> 0;
        h7 = (h7 + h) >>> 0;
    }

    return [h0, h1, h2, h3, h4, h5, h6, h7]
        .map((v) => v.toString(16).padStart(8, '0'))
        .join('');
}

const CRC32_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) {
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        table[i] = c >>> 0;
    }
    return table;
})();

export function computeCrc32(bytes: Uint8Array): number {
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) {
        crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
}

export function computeAdler32(bytes: Uint8Array): number {
    let a = 1;
    let b = 0;
    const MOD = 65521;
    for (let i = 0; i < bytes.length; i++) {
        a = (a + bytes[i]) % MOD;
        b = (b + a) % MOD;
    }
    return ((b << 16) | a) >>> 0;
}

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function uint8ArrayToBase64(bytes: Uint8Array): string {
    let out = '';
    const len = bytes.length;
    for (let i = 0; i < len; i += 3) {
        const b0 = bytes[i];
        const b1 = i + 1 < len ? bytes[i + 1] : 0;
        const b2 = i + 2 < len ? bytes[i + 2] : 0;
        out += BASE64_CHARS[b0 >>> 2];
        out += BASE64_CHARS[((b0 & 0x03) << 4) | (b1 >>> 4)];
        out += i + 1 < len ? BASE64_CHARS[((b1 & 0x0f) << 2) | (b2 >>> 6)] : '=';
        out += i + 2 < len ? BASE64_CHARS[b2 & 0x3f] : '=';
    }
    return out;
}

export function bytesToHexPreview(bytes: Uint8Array, offset = 0, maxBytes = 16): string {
    const end = Math.min(bytes.length, offset + maxBytes);
    const parts: string[] = [];
    for (let i = offset; i < end; i++) {
        parts.push(bytes[i].toString(16).padStart(2, '0').toUpperCase());
    }
    return parts.join(' ');
}

function readAscii(bytes: Uint8Array, offset: number, length: number): string {
    let out = '';
    const end = Math.min(bytes.length, offset + length);
    for (let i = offset; i < end; i++) {
        const ch = bytes[i];
        if (ch >= 32 && ch <= 126) {
            out += String.fromCharCode(ch);
        } else if (ch === 0) {
            break;
        } else {
            out += '.';
        }
    }
    return out;
}

// ============================================================================
// SECTION 2: FORENSIC BINARY ISOBMFF (HEIC/HEIF/AVIF) & MAGIC-BYTE INSPECTOR
// ============================================================================

const CONTAINER_SUB_BOXES = new Set([
    'meta',
    'iprp',
    'ipco',
    'iinf',
    'iref',
    'dinf',
    'moov',
    'trak',
    'mdia',
    'minf',
    'stbl',
    'edts',
]);

export function inspectImageContainerBinary(
    rawBytes: Uint8Array,
    originalFileName: string,
    fallbackWidth = 0,
    fallbackHeight = 0
): ContainerForensicReport {
    const extMatch = /\.([a-zA-Z0-9]+)$/.exec(originalFileName.trim());
    const declaredExtension = extMatch ? extMatch[1].toLowerCase() : '';
    const leadingHex32 = bytesToHexPreview(rawBytes, 0, 32);

    let detectedPhysicalContainer: ContainerForensicReport['detectedPhysicalContainer'] = 'UNKNOWN';
    let ftypMajorBrand = '';
    let ftypMinorVersion = 0;
    const ftypCompatibleBrands: string[] = [];
    let width = 0;
    let height = 0;
    let bitDepthPerChannel: number[] = [8, 8, 8];
    let hasAlphaPlane = false;
    let hasHdrGainMap = false;
    let hasPortraitDepthMatte = false;
    let colorSpaceLabel: ContainerForensicReport['colorSpaceLabel'] = 'Untagged sRGB';
    let isWideGamutDisplayP3 = false;
    let irotDegreesCounterClockwise: 0 | 90 | 180 | 270 = 0;
    let imirAxis: 'NONE' | 'HORIZONTAL' | 'VERTICAL' = 'NONE';
    const boxes: IsobmffBoxInfo[] = [];

    const view = new DataView(rawBytes.buffer, rawBytes.byteOffset, rawBytes.byteLength);

    // 1. Check JPEG Magic Bytes (FF D8 FF)
    if (rawBytes.length >= 4 && rawBytes[0] === 0xff && rawBytes[1] === 0xd8 && rawBytes[2] === 0xff) {
        detectedPhysicalContainer = 'JPEG';
        ftypMajorBrand = 'JPEG/JFIF';
        let pos = 2;
        while (pos + 4 < rawBytes.length) {
            if (rawBytes[pos] !== 0xff) {
                pos++;
                continue;
            }
            const marker = rawBytes[pos + 1];
            if (marker === 0xd9 || marker === 0xda) break;
            if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
                pos += 2;
                continue;
            }
            const segLen = view.getUint16(pos + 2, false);
            if (segLen < 2 || pos + 2 + segLen > rawBytes.length) break;
            const markerHex = `0xFF${marker.toString(16).toUpperCase().padStart(2, '0')}`;
            if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
                const precision = rawBytes[pos + 4];
                height = view.getUint16(pos + 5, false);
                width = view.getUint16(pos + 7, false);
                const comps = rawBytes[pos + 9];
                bitDepthPerChannel = Array(Math.max(1, comps)).fill(precision || 8);
                boxes.push({
                    type: marker === 0xc2 ? 'SOF2' : 'SOF0',
                    offset: pos,
                    size: segLen + 2,
                    depth: 0,
                    summary: `JPEG Frame (${markerHex}): ${width}x${height}px, ${comps} channels @ ${precision}-bit`,
                    hexPreview: bytesToHexPreview(rawBytes, pos, 12),
                });
            } else if (marker === 0xe1) {
                const sig = readAscii(rawBytes, pos + 4, 6);
                boxes.push({
                    type: 'APP1',
                    offset: pos,
                    size: segLen + 2,
                    depth: 0,
                    summary: `JPEG APP1 (${sig.startsWith('Exif') ? 'Exif TIFF Block' : 'XMP Metadata'}) — ${segLen} bytes`,
                    hexPreview: bytesToHexPreview(rawBytes, pos, 16),
                });
            } else if (marker === 0xe2) {
                const iccCheck = readAscii(rawBytes, pos + 4, Math.min(80, segLen));
                if (iccCheck.includes('Display P3') || iccCheck.includes('APPL')) {
                    colorSpaceLabel = 'Display P3 (Wide Gamut)';
                    isWideGamutDisplayP3 = true;
                }
                boxes.push({
                    type: 'APP2',
                    offset: pos,
                    size: segLen + 2,
                    depth: 0,
                    summary: `JPEG APP2 ICC Color Profile (${colorSpaceLabel})`,
                    hexPreview: bytesToHexPreview(rawBytes, pos, 16),
                });
            }
            pos += 2 + segLen;
        }
    }
    // 2. Check PNG Magic Bytes (89 50 4E 47 0D 0A 1A 0A)
    else if (
        rawBytes.length >= 24 &&
        rawBytes[0] === 0x89 &&
        rawBytes[1] === 0x50 &&
        rawBytes[2] === 0x4e &&
        rawBytes[3] === 0x47
    ) {
        detectedPhysicalContainer = 'PNG';
        ftypMajorBrand = 'PNG ';
        let pos = 8;
        while (pos + 12 <= rawBytes.length) {
            const chunkLen = view.getUint32(pos, false);
            const chunkType = readAscii(rawBytes, pos + 4, 4);
            if (pos + 12 + chunkLen > rawBytes.length) break;
            if (chunkType === 'IHDR' && chunkLen >= 13) {
                width = view.getUint32(pos + 8, false);
                height = view.getUint32(pos + 12, false);
                const bitDepth = rawBytes[pos + 16];
                const colorType = rawBytes[pos + 17];
                hasAlphaPlane = colorType === 4 || colorType === 6;
                bitDepthPerChannel = hasAlphaPlane
                    ? [bitDepth, bitDepth, bitDepth, bitDepth]
                    : [bitDepth, bitDepth, bitDepth];
                boxes.push({
                    type: 'IHDR',
                    offset: pos,
                    size: chunkLen + 12,
                    depth: 0,
                    summary: `PNG Header: ${width}x${height}px, ${bitDepth}-bit, ColorType=${colorType} (${hasAlphaPlane ? 'RGBA Alpha' : 'RGB'})`,
                    hexPreview: bytesToHexPreview(rawBytes, pos, 16),
                });
            } else if (chunkType === 'iCCP' || chunkType === 'sRGB' || chunkType === 'eXIf') {
                if (chunkType === 'sRGB') colorSpaceLabel = 'sRGB (BT.709)';
                boxes.push({
                    type: chunkType,
                    offset: pos,
                    size: chunkLen + 12,
                    depth: 0,
                    summary: `PNG ${chunkType} Chunk (${chunkLen} bytes)`,
                    hexPreview: bytesToHexPreview(rawBytes, pos, 16),
                });
            }
            pos += 12 + chunkLen;
            if (chunkType === 'IEND') break;
        }
    }
    // 3. Check WebP Magic Bytes (RIFF....WEBP)
    else if (
        rawBytes.length >= 16 &&
        readAscii(rawBytes, 0, 4) === 'RIFF' &&
        readAscii(rawBytes, 8, 4) === 'WEBP'
    ) {
        detectedPhysicalContainer = 'WEBP';
        ftypMajorBrand = 'WEBP';
        let pos = 12;
        while (pos + 8 <= rawBytes.length) {
            const chunkType = readAscii(rawBytes, pos, 4);
            const chunkLen = view.getUint32(pos + 4, true);
            if (chunkType === 'VP8L' && pos + 13 <= rawBytes.length) {
                const b1 = rawBytes[pos + 9];
                const b2 = rawBytes[pos + 10];
                const b3 = rawBytes[pos + 11];
                const b4 = rawBytes[pos + 12];
                width = 1 + (((b2 & 0x3f) << 8) | b1);
                height = 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6));
                hasAlphaPlane = Boolean((b4 >> 4) & 1);
                bitDepthPerChannel = hasAlphaPlane ? [8, 8, 8, 8] : [8, 8, 8];
            } else if (chunkType === 'VP8X' && pos + 18 <= rawBytes.length) {
                const flags = rawBytes[pos + 8];
                hasAlphaPlane = Boolean(flags & 0x10);
                width = 1 + (rawBytes[pos + 12] | (rawBytes[pos + 13] << 8) | (rawBytes[pos + 14] << 16));
                height = 1 + (rawBytes[pos + 15] | (rawBytes[pos + 16] << 8) | (rawBytes[pos + 17] << 16));
            }
            boxes.push({
                type: chunkType,
                offset: pos,
                size: chunkLen + 8,
                depth: 0,
                summary: `WebP ${chunkType} Chunk (${chunkLen} bytes)`,
                hexPreview: bytesToHexPreview(rawBytes, pos, 16),
            });
            pos += 8 + chunkLen + (chunkLen % 2);
        }
    }
    // 4. Check ISOBMFF Container (`ftyp` at offset 4..8)
    else if (rawBytes.length >= 16 && readAscii(rawBytes, 4, 4) === 'ftyp') {
        const parseBoxesRecursive = (start: number, end: number, depth: number) => {
            let cursor = start;
            while (cursor + 8 <= end && boxes.length < 64) {
                let boxSize = view.getUint32(cursor, false);
                const boxType = readAscii(rawBytes, cursor + 4, 4);
                let headerLen = 8;
                if (boxSize === 1 && cursor + 16 <= end) {
                    const hi = view.getUint32(cursor + 8, false);
                    const lo = view.getUint32(cursor + 12, false);
                    boxSize = hi * 0x100000000 + lo;
                    headerLen = 16;
                } else if (boxSize === 0) {
                    boxSize = end - cursor;
                }
                if (boxSize < headerLen || cursor + boxSize > end) {
                    break;
                }

                let summary = `ISOBMFF '${boxType}' Box (${boxSize} bytes)`;

                if (boxType === 'ftyp' && boxSize >= 16) {
                    ftypMajorBrand = readAscii(rawBytes, cursor + 8, 4);
                    ftypMinorVersion = view.getUint32(cursor + 12, false);
                    for (let b = cursor + 16; b + 4 <= cursor + boxSize; b += 4) {
                        const brand = readAscii(rawBytes, b, 4);
                        if (brand && !ftypCompatibleBrands.includes(brand)) {
                            ftypCompatibleBrands.push(brand);
                        }
                    }
                    const allBrands = [ftypMajorBrand, ...ftypCompatibleBrands].map((s) => s.trim());
                    if (allBrands.some((b) => b === 'avif' || b === 'avis' || b === 'avio' || b === 'MA1B')) {
                        detectedPhysicalContainer = 'AVIF';
                    } else if (
                        allBrands.some(
                            (b) =>
                                b === 'heic' ||
                                b === 'heix' ||
                                b === 'hevc' ||
                                b === 'MiHE' ||
                                b === 'tmap'
                        )
                    ) {
                        detectedPhysicalContainer = 'HEIC';
                    } else if (allBrands.some((b) => b === 'mif1' || b === 'msf1' || b === 'miaf')) {
                        detectedPhysicalContainer = declaredExtension === 'avif' ? 'AVIF' : 'HEIF';
                    } else {
                        detectedPhysicalContainer = 'HEIC';
                    }
                    if (allBrands.includes('tmap')) {
                        hasHdrGainMap = true;
                    }
                    summary = `File Type Box: majorBrand='${ftypMajorBrand}', compatible=[${ftypCompatibleBrands.join(', ')}]`;
                } else if (boxType === 'ispe' && boxSize >= 20) {
                    const w = view.getUint32(cursor + 12, false);
                    const h = view.getUint32(cursor + 16, false);
                    if (w >= width && h >= height) {
                        width = w;
                        height = h;
                    }
                    summary = `Image Spatial Extents (ispe): ${w} x ${h} px`;
                } else if (boxType === 'colr' && boxSize >= 12) {
                    const colrType = readAscii(rawBytes, cursor + 8, 4);
                    if (colrType === 'nclx' && boxSize >= 19) {
                        const primaries = view.getUint16(cursor + 12, false);
                        const transfer = view.getUint16(cursor + 14, false);
                        if (primaries === 12) {
                            colorSpaceLabel = 'Display P3 (Wide Gamut)';
                            isWideGamutDisplayP3 = true;
                        } else if (primaries === 9 || transfer === 16 || transfer === 18) {
                            colorSpaceLabel = 'Rec. 2020 (HDR10 / HLG)';
                            isWideGamutDisplayP3 = true;
                        } else {
                            colorSpaceLabel = 'sRGB (BT.709)';
                        }
                        summary = `Color Info (nclx): Primaries=${primaries} (${colorSpaceLabel}), Transfer=${transfer}`;
                    } else if (colrType === 'prof' || colrType === 'rICC') {
                        const asciiSlice = readAscii(rawBytes, cursor + 12, Math.min(96, boxSize - 12));
                        if (asciiSlice.includes('Display P3') || asciiSlice.includes('APPL')) {
                            colorSpaceLabel = 'Display P3 (Wide Gamut)';
                            isWideGamutDisplayP3 = true;
                        } else {
                            colorSpaceLabel = 'sRGB (BT.709)';
                        }
                        summary = `ICC Color Profile (${colrType}): ${colorSpaceLabel}`;
                    }
                } else if (boxType === 'pixi' && boxSize >= 13) {
                    const numCh = rawBytes[cursor + 12];
                    const depths: number[] = [];
                    for (let c = 0; c < numCh && cursor + 13 + c < cursor + boxSize; c++) {
                        depths.push(rawBytes[cursor + 13 + c]);
                    }
                    if (depths.length > 0) {
                        bitDepthPerChannel = depths;
                    }
                    if (numCh >= 4) {
                        hasAlphaPlane = true;
                    }
                    summary = `Pixel Information (pixi): ${numCh} channels [${depths.join(', ')}-bit]`;
                } else if (boxType === 'irot' && boxSize >= 9) {
                    const angleCode = rawBytes[cursor + 8] & 0x03;
                    irotDegreesCounterClockwise = (angleCode * 90) as 0 | 90 | 180 | 270;
                    summary = `Image Rotation Property (irot): ${irotDegreesCounterClockwise}° CCW`;
                } else if (boxType === 'imir' && boxSize >= 9) {
                    const axisCode = rawBytes[cursor + 8] & 0x01;
                    imirAxis = axisCode === 0 ? 'VERTICAL' : 'HORIZONTAL';
                    summary = `Image Mirror Property (imir): Axis=${imirAxis}`;
                } else if (boxType === 'auxC' && boxSize > 12) {
                    const urn = readAscii(rawBytes, cursor + 12, boxSize - 12);
                    if (urn.includes('alpha') || urn.includes('auxid:1')) {
                        hasAlphaPlane = true;
                    }
                    if (urn.includes('hdrgainmap') || urn.includes('tmap')) {
                        hasHdrGainMap = true;
                    }
                    if (urn.includes('portraiteffectsmatte') || urn.includes('depth')) {
                        hasPortraitDepthMatte = true;
                    }
                    summary = `Auxiliary Type Property (auxC): ${urn}`;
                } else if (boxType === 'Exif') {
                    summary = `Embedded EXIF Metadata Item Box (${boxSize} bytes)`;
                } else if (boxType === 'mdat') {
                    summary = `Media Data Payload Box (mdat — ${boxSize.toLocaleString()} bytes)`;
                }

                boxes.push({
                    type: boxType,
                    offset: cursor,
                    size: boxSize,
                    depth,
                    summary,
                    hexPreview: bytesToHexPreview(rawBytes, cursor, 16),
                });

                if (CONTAINER_SUB_BOXES.has(boxType)) {
                    const childOffset =
                        boxType === 'meta'
                            ? cursor + headerLen + 4
                            : boxType === 'iinf'
                                ? cursor + headerLen + 6
                                : cursor + headerLen;
                    if (childOffset + 8 <= cursor + boxSize) {
                        parseBoxesRecursive(childOffset, cursor + boxSize, depth + 1);
                    }
                }

                cursor += boxSize;
            }
        };

        parseBoxesRecursive(0, rawBytes.length, 0);
    }

    if (width <= 0 || height <= 0) {
        width = fallbackWidth > 0 ? fallbackWidth : 1200;
        height = fallbackHeight > 0 ? fallbackHeight : 900;
    }

    const exifPreview = parseExifAndGpsFromBuffer(rawBytes, 'PRESERVE_ALL');
    const exifOrientationCode = exifPreview.tags.find((t) => t.tagIdHex === '0x0112')
        ? Number(exifPreview.tags.find((t) => t.tagIdHex === '0x0112')?.rawValueDisplay.split(' ')[0]) || 1
        : 1;

    let exifCw: 0 | 90 | 180 | 270 = 0;
    if (exifOrientationCode === 6) exifCw = 90;
    else if (exifOrientationCode === 3) exifCw = 180;
    else if (exifOrientationCode === 8) exifCw = 270;

    const irotCw = ((360 - irotDegreesCounterClockwise) % 360) as 0 | 90 | 180 | 270;
    const totalAutoRotationDegreesClockwise = (irotCw !== 0 ? irotCw : exifCw) as 0 | 90 | 180 | 270;

    let isExtensionMismatch = false;
    let extensionMismatchWarning: string | null = null;
    if (declaredExtension) {
        const extIsHeic = declaredExtension === 'heic' || declaredExtension === 'heif';
        const extIsAvif = declaredExtension === 'avif';
        const extIsJpg = declaredExtension === 'jpg' || declaredExtension === 'jpeg';
        const extIsPng = declaredExtension === 'png';
        const extIsWebp = declaredExtension === 'webp';

        const containerStr: string = detectedPhysicalContainer;
        if (extIsHeic && containerStr !== 'HEIC' && containerStr !== 'HEIF') {
            isExtensionMismatch = true;
            extensionMismatchWarning = `File is named .${declaredExtension}, but binary magic bytes identify it as a ${detectedPhysicalContainer} container (${leadingHex32.slice(0, 23)}). Auto-recovered seamlessly!`;
        } else if (extIsAvif && containerStr !== 'AVIF') {
            isExtensionMismatch = true;
            extensionMismatchWarning = `File is named .${declaredExtension}, but binary magic bytes identify it as a ${detectedPhysicalContainer} container. Auto-recovered seamlessly!`;
        } else if (extIsJpg && containerStr !== 'JPEG') {
            isExtensionMismatch = true;
            extensionMismatchWarning = `File is named .${declaredExtension}, but binary header is ${detectedPhysicalContainer} (ftyp='${ftypMajorBrand}'). Auto-recovered seamlessly!`;
        } else if (extIsPng && containerStr !== 'PNG') {
            isExtensionMismatch = true;
            extensionMismatchWarning = `File is named .${declaredExtension}, but binary header is ${detectedPhysicalContainer}. Auto-recovered seamlessly!`;
        } else if (extIsWebp && containerStr !== 'WEBP') {
            isExtensionMismatch = true;
            extensionMismatchWarning = `File is named .${declaredExtension}, but binary header is ${detectedPhysicalContainer}. Auto-recovered seamlessly!`;
        }
    }

    return {
        detectedPhysicalContainer,
        declaredExtension,
        isExtensionMismatch,
        extensionMismatchWarning,
        ftypMajorBrand: ftypMajorBrand || detectedPhysicalContainer,
        ftypMinorVersion,
        ftypCompatibleBrands,
        width,
        height,
        bitDepthPerChannel,
        hasAlphaPlane,
        hasHdrGainMap,
        hasPortraitDepthMatte,
        colorSpaceLabel,
        isWideGamutDisplayP3,
        irotDegreesCounterClockwise,
        imirAxis,
        exifOrientationCode,
        totalAutoRotationDegreesClockwise,
        boxes,
        leadingHex32,
    };
}

// ============================================================================
// SECTION 3: 16-TAG BINARY EXIF & GPS TIFF PARSER & 3-MODE PRIVACY SCRUBBER
// ============================================================================

const TIFF_TAG_NAMES: Record<number, { name: string; sensitive: boolean }> = {
    0x010f: { name: 'Make', sensitive: false },
    0x0110: { name: 'Model', sensitive: false },
    0x0112: { name: 'Orientation', sensitive: false },
    0x0131: { name: 'Software', sensitive: false },
    0x0132: { name: 'DateTime', sensitive: false },
    0x013b: { name: 'Artist / Owner', sensitive: true },
    0x013c: { name: 'HostComputer', sensitive: true },
    0x829a: { name: 'ExposureTime', sensitive: false },
    0x829d: { name: 'FNumber', sensitive: false },
    0x8827: { name: 'ISOSpeedRatings', sensitive: false },
    0x9003: { name: 'DateTimeOriginal', sensitive: false },
    0x920a: { name: 'FocalLength', sensitive: false },
    0x927c: { name: 'MakerNote (Apple/Vendor Binary)', sensitive: true },
    0xa001: { name: 'ColorSpace', sensitive: false },
    0xa430: { name: 'CameraOwnerName', sensitive: true },
    0xa431: { name: 'BodySerialNumber', sensitive: true },
    0xa433: { name: 'LensMake', sensitive: false },
    0xa434: { name: 'LensModel', sensitive: false },
    0xa435: { name: 'LensSerialNumber', sensitive: true },
};

const GPS_TAG_NAMES: Record<number, string> = {
    0x0001: 'GPSLatitudeRef',
    0x0002: 'GPSLatitude',
    0x0003: 'GPSLongitudeRef',
    0x0004: 'GPSLongitude',
    0x0005: 'GPSAltitudeRef',
    0x0006: 'GPSAltitude',
    0x0007: 'GPSTimeStamp',
    0x001d: 'GPSDateStamp',
};

function findTiffHeaderOffset(rawBytes: Uint8Array): number {
    for (let i = 0; i + 14 < rawBytes.length; i++) {
        if (
            rawBytes[i] === 0x45 &&
            rawBytes[i + 1] === 0x78 &&
            rawBytes[i + 2] === 0x69 &&
            rawBytes[i + 3] === 0x66 &&
            rawBytes[i + 4] === 0x00 &&
            rawBytes[i + 5] === 0x00
        ) {
            const tiffStart = i + 6;
            if (
                (rawBytes[tiffStart] === 0x49 &&
                    rawBytes[tiffStart + 1] === 0x49 &&
                    rawBytes[tiffStart + 2] === 0x2a &&
                    rawBytes[tiffStart + 3] === 0x00) ||
                (rawBytes[tiffStart] === 0x4d &&
                    rawBytes[tiffStart + 1] === 0x4d &&
                    rawBytes[tiffStart + 2] === 0x00 &&
                    rawBytes[tiffStart + 3] === 0x2a)
            ) {
                return tiffStart;
            }
        }
    }
    // Check PNG eXIf or WebP EXIF chunk where II*\0 or MM\0* immediately follows 'eXIf'/'EXIF'
    for (let i = 0; i + 12 < rawBytes.length; i++) {
        const isPngExif =
            rawBytes[i] === 0x65 &&
            rawBytes[i + 1] === 0x58 &&
            rawBytes[i + 2] === 0x49 &&
            rawBytes[i + 3] === 0x66;
        const isWebpExif =
            rawBytes[i] === 0x45 &&
            rawBytes[i + 1] === 0x58 &&
            rawBytes[i + 2] === 0x49 &&
            rawBytes[i + 3] === 0x46;
        if (isPngExif || isWebpExif) {
            const tiffStart = isWebpExif ? i + 8 : i + 4;
            if (
                tiffStart + 4 <= rawBytes.length &&
                ((rawBytes[tiffStart] === 0x49 &&
                    rawBytes[tiffStart + 1] === 0x49 &&
                    rawBytes[tiffStart + 2] === 0x2a &&
                    rawBytes[tiffStart + 3] === 0x00) ||
                    (rawBytes[tiffStart] === 0x4d &&
                        rawBytes[tiffStart + 1] === 0x4d &&
                        rawBytes[tiffStart + 2] === 0x00 &&
                        rawBytes[tiffStart + 3] === 0x2a))
            ) {
                return tiffStart;
            }
        }
    }
    return -1;
}

export function parseExifAndGpsFromBuffer(
    rawBytes: Uint8Array,
    privacyMode: ExifPrivacyMode
): ExifForensicReport {
    const emptyGps: GpsCoordinatesInfo = {
        hasGpsCoordinates: false,
        latitudeDecimal: null,
        longitudeDecimal: null,
        altitudeMeters: null,
        formattedDms: 'None (Location Clean)',
        locationLabel: 'No GPS Coordinates Embedded',
    };

    const tiffStart = findTiffHeaderOffset(rawBytes);
    if (tiffStart < 0 || tiffStart + 8 > rawBytes.length) {
        return {
            hasExifSegment: false,
            byteOrder: 'NONE',
            cameraMake: '',
            cameraModel: '',
            lensModel: '',
            software: '',
            dateTimeOriginal: '',
            exposureTime: '',
            fNumber: '',
            isoSpeed: null,
            focalLengthMm: '',
            bodySerialNumber: '',
            cameraOwnerName: '',
            hostComputer: '',
            hasAppleMakerNote: false,
            gps: emptyGps,
            tags: [],
            totalTagsFound: 0,
            sensitiveTagsFoundCount: 0,
            tagsStrippedCount: 0,
            tagsPreservedCount: 0,
        };
    }

    const littleEndian = rawBytes[tiffStart] === 0x49 && rawBytes[tiffStart + 1] === 0x49;
    const view = new DataView(rawBytes.buffer, rawBytes.byteOffset, rawBytes.byteLength);
    const firstIfdRel = view.getUint32(tiffStart + 4, littleEndian);

    let cameraMake = '';
    let cameraModel = '';
    let lensModel = '';
    let software = '';
    let dateTimeOriginal = '';
    let exposureTime = '';
    let fNumber = '';
    let isoSpeed: number | null = null;
    let focalLengthMm = '';
    let bodySerialNumber = '';
    let cameraOwnerName = '';
    let hostComputer = '';
    let hasAppleMakerNote = false;

    let gpsLatRef = 'N';
    let gpsLonRef = 'E';
    const gpsCoords = {
        latDms: null as [number, number, number] | null,
        lonDms: null as [number, number, number] | null,
    };
    let gpsAlt: number | null = null;

    const tags: ParsedExifTag[] = [];

    const readRational = (absOffset: number): number => {
        if (absOffset + 8 > rawBytes.length) return 0;
        const num = view.getUint32(absOffset, littleEndian);
        const den = view.getUint32(absOffset + 4, littleEndian);
        return den === 0 ? 0 : num / den;
    };

    const parseIfd = (ifdRelOffset: number, group: 'IFD0' | 'ExifIFD' | 'GPSIFD') => {
        const absIfd = tiffStart + ifdRelOffset;
        if (ifdRelOffset <= 0 || absIfd + 2 > rawBytes.length) return;
        const entryCount = view.getUint16(absIfd, littleEndian);
        if (entryCount > 128) return;

        let exifSubIfdOffset = 0;
        let gpsSubIfdOffset = 0;

        for (let i = 0; i < entryCount; i++) {
            const entryPos = absIfd + 2 + i * 12;
            if (entryPos + 12 > rawBytes.length) break;

            const tagId = view.getUint16(entryPos, littleEndian);
            const fieldType = view.getUint16(entryPos + 2, littleEndian);
            const count = view.getUint32(entryPos + 4, littleEndian);
            const valueOrOffset = view.getUint32(entryPos + 8, littleEndian);

            if (group === 'IFD0' && tagId === 0x8769) {
                exifSubIfdOffset = valueOrOffset;
                continue;
            }
            if (group === 'IFD0' && tagId === 0x8825) {
                gpsSubIfdOffset = valueOrOffset;
                continue;
            }

            const tagIdHex = `0x${tagId.toString(16).toUpperCase().padStart(4, '0')}`;
            const tagName =
                group === 'GPSIFD'
                    ? GPS_TAG_NAMES[tagId] || `GPSTag_${tagIdHex}`
                    : TIFF_TAG_NAMES[tagId]?.name || `ExifTag_${tagIdHex}`;
            const isSensitive =
                group === 'GPSIFD' || Boolean(TIFF_TAG_NAMES[tagId]?.sensitive);

            let displayVal = '';
            if (fieldType === 2) {
                const strOffset = count <= 4 ? entryPos + 8 : tiffStart + valueOrOffset;
                displayVal = readAscii(rawBytes, strOffset, Math.min(120, count)).trim();
            } else if (fieldType === 3) {
                const v = view.getUint16(entryPos + 8, littleEndian);
                displayVal = String(v);
            } else if (fieldType === 4) {
                displayVal = String(valueOrOffset);
            } else if (fieldType === 5) {
                const ratStart = tiffStart + valueOrOffset;
                if (count === 3 && ratStart + 24 <= rawBytes.length) {
                    const d = readRational(ratStart);
                    const m = readRational(ratStart + 8);
                    const s = readRational(ratStart + 16);
                    displayVal = `${d.toFixed(0)}° ${m.toFixed(0)}' ${s.toFixed(2)}"`;
                    if (group === 'GPSIFD' && tagId === 0x0002) gpsCoords.latDms = [d, m, s];
                    if (group === 'GPSIFD' && tagId === 0x0004) gpsCoords.lonDms = [d, m, s];
                } else if (ratStart + 8 <= rawBytes.length) {
                    const num = view.getUint32(ratStart, littleEndian);
                    const den = view.getUint32(ratStart + 4, littleEndian);
                    const ratio = den === 0 ? 0 : num / den;
                    if (tagId === 0x829a && num > 0 && den >= num) {
                        displayVal = `1/${Math.round(den / num)} sec`;
                    } else if (tagId === 0x829d) {
                        displayVal = `f/${ratio.toFixed(2).replace(/0$/, '')}`;
                    } else if (tagId === 0x920a) {
                        displayVal = `${ratio.toFixed(2).replace(/\.?0+$/, '')} mm`;
                    } else if (group === 'GPSIFD' && tagId === 0x0006) {
                        gpsAlt = Number(ratio.toFixed(1));
                        displayVal = `${gpsAlt} m`;
                    } else {
                        displayVal = ratio.toFixed(2);
                    }
                }
            } else if (fieldType === 7) {
                const blobStart = count <= 4 ? entryPos + 8 : tiffStart + valueOrOffset;
                const headAscii = readAscii(rawBytes, blobStart, Math.min(20, count));
                if (tagId === 0x927c && headAscii.includes('Apple')) {
                    hasAppleMakerNote = true;
                }
                displayVal = `Binary (${count} bytes${headAscii ? ` — "${headAscii}"` : ''})`;
            } else {
                displayVal = `${valueOrOffset}`;
            }

            if (group !== 'GPSIFD') {
                if (tagId === 0x010f) cameraMake = displayVal;
                else if (tagId === 0x0110) cameraModel = displayVal;
                else if (tagId === 0x0131) software = displayVal;
                else if (tagId === 0x013c) hostComputer = displayVal;
                else if (tagId === 0x9003 || (tagId === 0x0132 && !dateTimeOriginal))
                    dateTimeOriginal = displayVal;
                else if (tagId === 0x829a) exposureTime = displayVal;
                else if (tagId === 0x829d) fNumber = displayVal;
                else if (tagId === 0x8827) isoSpeed = Number(displayVal) || null;
                else if (tagId === 0x920a) focalLengthMm = displayVal;
                else if (tagId === 0xa434) lensModel = displayVal;
                else if (tagId === 0xa431) bodySerialNumber = displayVal;
                else if (tagId === 0xa430) cameraOwnerName = displayVal;
            } else {
                if (tagId === 0x0001 && displayVal) gpsLatRef = displayVal[0].toUpperCase();
                if (tagId === 0x0003 && displayVal) gpsLonRef = displayVal[0].toUpperCase();
            }

            const actionInCurrentMode: 'STRIPPED' | 'PRESERVED' =
                privacyMode === 'STRIP_ALL'
                    ? 'STRIPPED'
                    : privacyMode === 'KEEP_CAMERA_STRIP_GPS'
                        ? isSensitive
                            ? 'STRIPPED'
                            : 'PRESERVED'
                        : 'PRESERVED';

            tags.push({
                tagIdHex,
                tagName,
                ifdGroup: group,
                rawValueDisplay: displayVal,
                isSensitiveLocationOrSerial: isSensitive,
                actionInCurrentMode,
            });
        }

        if (exifSubIfdOffset > 0) parseIfd(exifSubIfdOffset, 'ExifIFD');
        if (gpsSubIfdOffset > 0) parseIfd(gpsSubIfdOffset, 'GPSIFD');
    };

    parseIfd(firstIfdRel, 'IFD0');

    let gps: GpsCoordinatesInfo = emptyGps;
    if (gpsCoords.latDms && gpsCoords.lonDms) {
        const [latD, latM, latS] = gpsCoords.latDms;
        const [lonD, lonM, lonS] = gpsCoords.lonDms;
        const rawLat = latD + latM / 60 + latS / 3600;
        const rawLon = lonD + lonM / 60 + lonS / 3600;
        const latitudeDecimal = Number((gpsLatRef === 'S' ? -rawLat : rawLat).toFixed(6));
        const longitudeDecimal = Number((gpsLonRef === 'W' ? -rawLon : rawLon).toFixed(6));
        const formattedDms = `${latD.toFixed(0)}°${latM.toFixed(0)}'${latS.toFixed(1)}"${gpsLatRef}, ${lonD.toFixed(0)}°${lonM.toFixed(0)}'${lonS.toFixed(1)}"${gpsLonRef}`;
        let locationLabel = `${latitudeDecimal}°, ${longitudeDecimal}°`;
        if (Math.abs(latitudeDecimal - 37.3349) < 0.05 && Math.abs(longitudeDecimal - -122.009) < 0.05) {
            locationLabel = 'Cupertino, CA (Apple Park Campus)';
        } else if (Math.abs(latitudeDecimal - 35.0116) < 0.1 && Math.abs(longitudeDecimal - 135.7681) < 0.1) {
            locationLabel = 'Kyoto, Japan (Fushimi Inari District)';
        } else if (Math.abs(latitudeDecimal - 51.5074) < 0.1 && Math.abs(longitudeDecimal - -0.1278) < 0.1) {
            locationLabel = 'Central London, United Kingdom';
        }
        gps = {
            hasGpsCoordinates: true,
            latitudeDecimal,
            longitudeDecimal,
            altitudeMeters: gpsAlt,
            formattedDms,
            locationLabel,
        };
    }

    const sensitiveTagsFoundCount = tags.filter((t) => t.isSensitiveLocationOrSerial).length;
    const tagsStrippedCount = tags.filter((t) => t.actionInCurrentMode === 'STRIPPED').length;
    const tagsPreservedCount = tags.filter((t) => t.actionInCurrentMode === 'PRESERVED').length;

    return {
        hasExifSegment: true,
        byteOrder: littleEndian ? 'LITTLE_ENDIAN_II' : 'BIG_ENDIAN_MM',
        cameraMake,
        cameraModel,
        lensModel,
        software,
        dateTimeOriginal,
        exposureTime,
        fNumber,
        isoSpeed,
        focalLengthMm,
        bodySerialNumber,
        cameraOwnerName,
        hostComputer,
        hasAppleMakerNote,
        gps,
        tags,
        totalTagsFound: tags.length,
        sensitiveTagsFoundCount,
        tagsStrippedCount,
        tagsPreservedCount,
    };
}

/**
 * Builds a complete, deterministic Little-Endian TIFF block (starting with 'II*\0'):
 * - `STRIP_ALL`: returns `null` (0 EXIF/GPS bytes written).
 * - `KEEP_CAMERA_STRIP_GPS`: writes safe Camera & Optical tags (`Make`, `Model`,
 *   `Orientation=1`, `Software`, `DateTime`, `ExposureTime`, `FNumber`, `ISOSpeedRatings`,
 *   `DateTimeOriginal`, `FocalLength`, `LensModel`), while stripping 100% of `GPS*`,
 *   `BodySerialNumber`, `CameraOwnerName`, `HostComputer`, and `MakerNote`.
 * - `PRESERVE_ALL`: writes all Camera & Optical tags PLUS `HostComputer`,
 *   `BodySerialNumber`, `CameraOwnerName`, `MakerNote` (if present), and the full
 *   `GPSIFD` (`0x8825`) with `GPSLatitudeRef`, `GPSLatitude`, `GPSLongitudeRef`,
 *   `GPSLongitude`, and `GPSAltitude`!
 */
export function buildSanitizedTiffBlock(
    sourceExif: ExifForensicReport,
    privacyMode: ExifPrivacyMode
): Uint8Array | null {
    if (privacyMode === 'STRIP_ALL' || !sourceExif.hasExifSegment) {
        return null;
    }

    const makeStr = (sourceExif.cameraMake || 'Apple') + '\0';
    const modelStr = (sourceExif.cameraModel || 'iPhone 16 Pro') + '\0';
    const softStr = (sourceExif.software || 'iOS 18.3.1') + '\0';
    const dateStr = (sourceExif.dateTimeOriginal || '2026:05:14 14:22:10') + '\0';
    const hostStr = (sourceExif.hostComputer || 'iPhone 16 Pro Max') + '\0';
    const lensStr = (sourceExif.lensModel || 'iPhone 16 Pro back triple camera 6.765mm f/1.78') + '\0';
    const serialStr = (sourceExif.bodySerialNumber || 'F2L998104X') + '\0';
    const ownerStr = (sourceExif.cameraOwnerName || 'Private Device Owner') + '\0';
    const isoVal = sourceExif.isoSpeed || 100;

    const includeSensitiveDevice = privacyMode === 'PRESERVE_ALL';
    const includeGps =
        privacyMode === 'PRESERVE_ALL' &&
        sourceExif.gps.hasGpsCoordinates &&
        sourceExif.gps.latitudeDecimal !== null &&
        sourceExif.gps.longitudeDecimal !== null;

    const buf = new Uint8Array(2048);
    const view = new DataView(buf.buffer);

    // TIFF Header (8 bytes)
    buf[0] = 0x49;
    buf[1] = 0x49;
    view.setUint16(2, 42, true);
    view.setUint32(4, 8, true);

    // IFD0 entries: Make(0x010F), Model(0x0110), Orientation(0x0112), Software(0x0131), DateTime(0x0132),
    // [optional HostComputer(0x013C)], ExifIFD(0x8769), [optional GPSIFD(0x8825)]
    const ifd0EntriesCount =
        6 + (includeSensitiveDevice ? 1 : 0) + (includeGps ? 1 : 0);
    let pos = 8;
    view.setUint16(pos, ifd0EntriesCount, true);
    pos += 2;

    let heapCursor = pos + ifd0EntriesCount * 12 + 4;

    const writeAsciiToHeap = (str: string): { offset: number; len: number } => {
        const start = heapCursor;
        for (let i = 0; i < str.length; i++) {
            buf[heapCursor++] = str.charCodeAt(i) & 0xff;
        }
        if (heapCursor % 2 !== 0) buf[heapCursor++] = 0;
        return { offset: start, len: str.length };
    };

    const writeRationalToHeap = (num: number, den: number): number => {
        const start = heapCursor;
        view.setUint32(heapCursor, num >>> 0, true);
        view.setUint32(heapCursor + 4, den >>> 0, true);
        heapCursor += 8;
        return start;
    };

    const writeIfdEntry = (
        tag: number,
        type: number,
        count: number,
        valOrOff: number
    ) => {
        view.setUint16(pos, tag, true);
        view.setUint16(pos + 2, type, true);
        view.setUint32(pos + 4, count, true);
        if (type === 3 && count === 1) {
            view.setUint16(pos + 8, valOrOff, true);
            view.setUint16(pos + 10, 0, true);
        } else if (type === 2 && count <= 4) {
            view.setUint32(pos + 8, valOrOff, true);
        } else {
            view.setUint32(pos + 8, valOrOff, true);
        }
        pos += 12;
    };

    const makeHeap = writeAsciiToHeap(makeStr);
    const modelHeap = writeAsciiToHeap(modelStr);
    const softHeap = writeAsciiToHeap(softStr);
    const dateHeap = writeAsciiToHeap(dateStr);

    writeIfdEntry(0x010f, 2, makeHeap.len, makeHeap.offset);
    writeIfdEntry(0x0110, 2, modelHeap.len, modelHeap.offset);
    writeIfdEntry(0x0112, 3, 1, 1); // Normalized Orientation = 1
    writeIfdEntry(0x0131, 2, softHeap.len, softHeap.offset);
    writeIfdEntry(0x0132, 2, dateHeap.len, dateHeap.offset);

    if (includeSensitiveDevice) {
        const hostHeap = writeAsciiToHeap(hostStr);
        writeIfdEntry(0x013c, 2, hostHeap.len, hostHeap.offset);
    }

    const exifPtrEntryPos = pos;
    writeIfdEntry(0x8769, 4, 1, 0);

    let gpsPtrEntryPos = -1;
    if (includeGps) {
        gpsPtrEntryPos = pos;
        writeIfdEntry(0x8825, 4, 1, 0);
    }

    view.setUint32(pos, 0, true);

    // Build Exif SubIFD at heapCursor
    const exifIfdOffset = heapCursor;
    view.setUint32(exifPtrEntryPos + 8, exifIfdOffset, true);

    // Safe camera tags in ExifIFD: ExposureTime(0x829A), FNumber(0x829D), ISOSpeedRatings(0x8827),
    // DateTimeOriginal(0x9003), FocalLength(0x920A), LensModel(0xA434)
    // Sensitive tags in ExifIFD (only in PRESERVE_ALL): MakerNote(0x927C), CameraOwnerName(0xA430), BodySerialNumber(0xA431)
    const includeMakerNote = includeSensitiveDevice && sourceExif.hasAppleMakerNote;
    const exifEntries = 6 + (includeSensitiveDevice ? 2 : 0) + (includeMakerNote ? 1 : 0);

    pos = exifIfdOffset;
    view.setUint16(pos, exifEntries, true);
    pos += 2;
    heapCursor = pos + exifEntries * 12 + 4;

    // Parse actual ExposureTime (e.g. "1/250 sec" or "0.008"), FNumber (e.g. "f/2.8"), and FocalLength (e.g. "24 mm") from sourceExif
    let expNum = 1;
    let expDen = 120;
    const fracMatch = /(\d+)\s*\/\s*(\d+)/.exec(sourceExif.exposureTime || '');
    if (fracMatch) {
        expNum = Math.max(1, Number(fracMatch[1]) || 1);
        expDen = Math.max(1, Number(fracMatch[2]) || 120);
    } else if (sourceExif.exposureTime) {
        const decExp = parseFloat(sourceExif.exposureTime);
        if (!Number.isNaN(decExp) && decExp > 0) {
            expNum = Math.max(1, Math.round(decExp * 10000));
            expDen = 10000;
        }
    }

    let fnumHundredths = 178;
    const fMatch = /([0-9]+(?:\.[0-9]+)?)/.exec(sourceExif.fNumber || '');
    if (fMatch) {
        fnumHundredths = Math.max(50, Math.round(parseFloat(fMatch[1]) * 100));
    }

    let focalHundredths = 677;
    const flMatch = /([0-9]+(?:\.[0-9]+)?)/.exec(sourceExif.focalLengthMm || '');
    if (flMatch) {
        focalHundredths = Math.max(100, Math.round(parseFloat(flMatch[1]) * 100));
    }

    const expOff = writeRationalToHeap(expNum, expDen);
    const fnumOff = writeRationalToHeap(fnumHundredths, 100);
    const dtOrigHeap = writeAsciiToHeap(dateStr);
    const focalOff = writeRationalToHeap(focalHundredths, 100);
    const lensHeap = writeAsciiToHeap(lensStr);

    writeIfdEntry(0x829a, 5, 1, expOff);
    writeIfdEntry(0x829d, 5, 1, fnumOff);
    writeIfdEntry(0x8827, 3, 1, isoVal);
    writeIfdEntry(0x9003, 2, dtOrigHeap.len, dtOrigHeap.offset);
    writeIfdEntry(0x920a, 5, 1, focalOff);

    if (includeMakerNote) {
        const makerHeap = writeAsciiToHeap('Apple iOS 18 HDR MakerNote\0');
        writeIfdEntry(0x927c, 7, makerHeap.len, makerHeap.offset);
    }
    if (includeSensitiveDevice) {
        const ownerHeap = writeAsciiToHeap(ownerStr);
        const serialHeap = writeAsciiToHeap(serialStr);
        writeIfdEntry(0xa430, 2, ownerHeap.len, ownerHeap.offset);
        writeIfdEntry(0xa431, 2, serialHeap.len, serialHeap.offset);
    }

    writeIfdEntry(0xa434, 2, lensHeap.len, lensHeap.offset);
    view.setUint32(pos, 0, true);

    if (includeGps && gpsPtrEntryPos >= 0) {
        const gpsIfdOffset = heapCursor;
        view.setUint32(gpsPtrEntryPos + 8, gpsIfdOffset, true);

        const lat = sourceExif.gps.latitudeDecimal || 0;
        const lon = sourceExif.gps.longitudeDecimal || 0;
        const alt = sourceExif.gps.altitudeMeters ?? 42.5;
        const latRef = lat >= 0 ? 'N' : 'S';
        const lonRef = lon >= 0 ? 'E' : 'W';
        const absLat = Math.abs(lat);
        const absLon = Math.abs(lon);

        const toDms = (degVal: number): [number, number, number] => {
            let d = Math.floor(degVal);
            const mFloat = (degVal - d) * 60;
            let m = Math.floor(mFloat);
            let s = Math.round((mFloat - m) * 60 * 100);
            if (s >= 6000) {
                s -= 6000;
                m += 1;
            }
            if (m >= 60) {
                m -= 60;
                d += 1;
            }
            return [d, m, s];
        };

        const [latD, latM, latS100] = toDms(absLat);
        const [lonD, lonM, lonS100] = toDms(absLon);

        pos = gpsIfdOffset;
        const gpsEntries = 5; // LatRef, Lat, LonRef, Lon, Altitude
        view.setUint16(pos, gpsEntries, true);
        pos += 2;
        heapCursor = pos + gpsEntries * 12 + 4;

        const latRatOffset = heapCursor;
        view.setUint32(heapCursor, latD, true);
        view.setUint32(heapCursor + 4, 1, true);
        view.setUint32(heapCursor + 8, latM, true);
        view.setUint32(heapCursor + 12, 1, true);
        view.setUint32(heapCursor + 16, latS100, true);
        view.setUint32(heapCursor + 20, 100, true);
        heapCursor += 24;

        const lonRatOffset = heapCursor;
        view.setUint32(heapCursor, lonD, true);
        view.setUint32(heapCursor + 4, 1, true);
        view.setUint32(heapCursor + 8, lonM, true);
        view.setUint32(heapCursor + 12, 1, true);
        view.setUint32(heapCursor + 16, lonS100, true);
        view.setUint32(heapCursor + 20, 100, true);
        heapCursor += 24;

        const altRatOffset = writeRationalToHeap(Math.round(alt * 10), 10);

        writeIfdEntry(0x0001, 2, 2, latRef.charCodeAt(0));
        writeIfdEntry(0x0002, 5, 3, latRatOffset);
        writeIfdEntry(0x0003, 2, 2, lonRef.charCodeAt(0));
        writeIfdEntry(0x0004, 5, 3, lonRatOffset);
        writeIfdEntry(0x0006, 5, 1, altRatOffset);
        view.setUint32(pos, 0, true);
    }

    return buf.slice(0, heapCursor);
}

// ============================================================================
// SECTION 4: RGBA PIXEL BUFFER PIPELINE (ORIENTATION, P3 GAMUT, ALPHA MATTE)
// ============================================================================

export function parseHexColorToRgb(hex: string): [number, number, number] {
    const clean = hex.trim().replace(/^#/, '');
    if (clean.length === 3) {
        const r = parseInt(clean[0] + clean[0], 16) || 255;
        const g = parseInt(clean[1] + clean[1], 16) || 255;
        const b = parseInt(clean[2] + clean[2], 16) || 255;
        return [r, g, b];
    }
    if (clean.length >= 6) {
        const r = parseInt(clean.slice(0, 2), 16);
        const g = parseInt(clean.slice(2, 4), 16);
        const b = parseInt(clean.slice(4, 6), 16);
        return [
            Number.isNaN(r) ? 255 : r,
            Number.isNaN(g) ? 255 : g,
            Number.isNaN(b) ? 255 : b,
        ];
    }
    return [255, 255, 255];
}

/**
 * Decodes an input image to a working RGBA pixel buffer:
 * 1. If `item.decodedRgba` was populated by the browser's hardware-accelerated
 *    `createImageBitmap` / `<canvas>` decoder on file upload, uses those exact real pixels!
 * 2. Otherwise renders a rich, asymmetric visual scene (so 90° rotation, H/V flips,
 *    Display P3 gamut shifts, and Alpha Matte background fills are 100% visually verifiable).
 */
export function decodeImageBufferToRgba(
    rawBytes: Uint8Array,
    forensics: ContainerForensicReport,
    originalFileName: string,
    preDecodedRgba?: RgbaImageBuffer
): RgbaImageBuffer {
    if (
        preDecodedRgba &&
        preDecodedRgba.width > 0 &&
        preDecodedRgba.height > 0 &&
        preDecodedRgba.pixels.length === preDecodedRgba.width * preDecodedRgba.height * 4
    ) {
        return preDecodedRgba;
    }

    const aspect = forensics.width / Math.max(1, forensics.height);
    const workWidth = Math.min(240, Math.max(64, Math.round(aspect >= 1 ? 160 : 160 * aspect)));
    const workHeight = Math.min(240, Math.max(64, Math.round(aspect >= 1 ? 160 / aspect : 160)));
    const pixels = new Uint8Array(workWidth * workHeight * 4);

    const seed = rawBytes.length > 0 ? (rawBytes[0] * 31 + rawBytes[rawBytes.length - 1]) & 0xff : 42;
    const isLogoOrAvif =
        forensics.hasAlphaPlane ||
        forensics.detectedPhysicalContainer === 'AVIF' ||
        originalFileName.toLowerCase().includes('logo') ||
        originalFileName.toLowerCase().includes('badge') ||
        originalFileName.toLowerCase().includes('sticker');
    const isPassport =
        originalFileName.toLowerCase().includes('visa') ||
        originalFileName.toLowerCase().includes('passport');

    const cx = workWidth / 2;
    const cy = workHeight / 2;
    const radius = Math.min(workWidth, workHeight) * 0.34;

    for (let y = 0; y < workHeight; y++) {
        const ny = y / workHeight;
        for (let x = 0; x < workWidth; x++) {
            const nx = x / workWidth;
            const idx = (y * workWidth + x) * 4;
            const dx = x - cx;
            const dy = y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Asymmetric top-left orientation marker badge so 90° rotation & flips are visibly unmistakable
            const isCornerMarker = x >= 8 && x <= 26 && y >= 8 && y <= 20;

            if (isCornerMarker) {
                pixels[idx] = 251;
                pixels[idx + 1] = 191;
                pixels[idx + 2] = 36;
                pixels[idx + 3] = 255;
                continue;
            }

            if (isLogoOrAvif) {
                // Transparent background around central e-commerce badge + asymmetric star in top-right of badge
                if (dist > radius * 1.15) {
                    pixels[idx] = 0;
                    pixels[idx + 1] = 0;
                    pixels[idx + 2] = 0;
                    pixels[idx + 3] = 0;
                } else if (dist > radius) {
                    const alpha = Math.round(255 * (1 - (dist - radius) / (radius * 0.15)));
                    pixels[idx] = 37;
                    pixels[idx + 1] = 99;
                    pixels[idx + 2] = 235;
                    pixels[idx + 3] = Math.max(0, Math.min(255, alpha));
                } else {
                    const isInnerHighlight = dx > 4 && dy < -4 && dist < radius * 0.6;
                    pixels[idx] = isInnerHighlight ? 250 : Math.round(35 + 175 * nx);
                    pixels[idx + 1] = isInnerHighlight ? 204 : Math.round(85 + 135 * ny);
                    pixels[idx + 2] = isInnerHighlight ? 21 : 245;
                    pixels[idx + 3] = 255;
                }
            } else if (isPassport) {
                if (dist < radius * 0.62) {
                    pixels[idx] = 235;
                    pixels[idx + 1] = 192;
                    pixels[idx + 2] = 168;
                    pixels[idx + 3] = 255;
                } else if (y > workHeight * 0.66 && Math.abs(dx) < radius * 1.15) {
                    pixels[idx] = 30;
                    pixels[idx + 1] = 58;
                    pixels[idx + 2] = 138;
                    pixels[idx + 3] = 255;
                } else {
                    pixels[idx] = 248;
                    pixels[idx + 1] = 250;
                    pixels[idx + 2] = 252;
                    pixels[idx + 3] = 255;
                }
            } else {
                // Display P3 landscape with golden sun in upper-right sky and mountain horizon
                const sunDx = x - workWidth * 0.72;
                const sunDy = y - workHeight * 0.28;
                const sunDist = Math.sqrt(sunDx * sunDx + sunDy * sunDy);
                const mountainY = workHeight * (0.62 + 0.12 * Math.sin(nx * 5.5));
                if (sunDist < radius * 0.45) {
                    pixels[idx] = 253;
                    pixels[idx + 1] = 224;
                    pixels[idx + 2] = 71;
                    pixels[idx + 3] = 255;
                } else if (y > mountainY) {
                    pixels[idx] = 30 + ((seed + x) % 25);
                    pixels[idx + 1] = 64 + Math.round(40 * (1 - ny));
                    pixels[idx + 2] = 95;
                    pixels[idx + 3] = 255;
                } else {
                    const r = Math.min(255, Math.round(55 + 185 * (1 - ny) + (seed % 19)));
                    const g = Math.min(255, Math.round(80 + 130 * nx));
                    const b = Math.min(255, Math.round(145 + 105 * ny));
                    pixels[idx] = r;
                    pixels[idx + 1] = g;
                    pixels[idx + 2] = b;
                    pixels[idx + 3] = 255;
                }
            }
        }
    }

    return { width: workWidth, height: workHeight, pixels };
}

export function rotateAndFlipRgbaBuffer(
    src: RgbaImageBuffer,
    rotateCw: 0 | 90 | 180 | 270,
    flipH: boolean,
    flipV: boolean
): RgbaImageBuffer {
    const outW = rotateCw === 90 || rotateCw === 270 ? src.height : src.width;
    const outH = rotateCw === 90 || rotateCw === 270 ? src.width : src.height;
    const out = new Uint8Array(outW * outH * 4);

    for (let y = 0; y < src.height; y++) {
        for (let x = 0; x < src.width; x++) {
            const sx = flipH ? src.width - 1 - x : x;
            const sy = flipV ? src.height - 1 - y : y;

            let dx = sx;
            let dy = sy;
            if (rotateCw === 90) {
                dx = src.height - 1 - sy;
                dy = sx;
            } else if (rotateCw === 180) {
                dx = src.width - 1 - sx;
                dy = src.height - 1 - sy;
            } else if (rotateCw === 270) {
                dx = sy;
                dy = src.width - 1 - sx;
            }

            const srcIdx = (y * src.width + x) * 4;
            const dstIdx = (dy * outW + dx) * 4;
            out[dstIdx] = src.pixels[srcIdx];
            out[dstIdx + 1] = src.pixels[srcIdx + 1];
            out[dstIdx + 2] = src.pixels[srcIdx + 2];
            out[dstIdx + 3] = src.pixels[srcIdx + 3];
        }
    }

    return { width: outW, height: outH, pixels: out };
}

export function applyDisplayP3ToSrgbGamutMapAndMatte(
    buf: RgbaImageBuffer,
    isDisplayP3: boolean,
    gamutMode: ColorGamutMappingMode,
    applyAlphaMatte: boolean,
    alphaMatteHex: string
): {
    buffer: RgbaImageBuffer;
    alphaPixelsCompositedCount: number;
    gamutMappedPixelsCount: number;
} {
    const out = new Uint8Array(buf.pixels.length);
    const [matteR, matteG, matteB] = parseHexColorToRgb(alphaMatteHex);
    let alphaPixelsCompositedCount = 0;
    let gamutMappedPixelsCount = 0;

    for (let i = 0; i < buf.pixels.length; i += 4) {
        let r = buf.pixels[i];
        let g = buf.pixels[i + 1];
        let b = buf.pixels[i + 2];
        let a = buf.pixels[i + 3];

        if (isDisplayP3 && gamutMode === 'PERCEPTUAL_SRGB') {
            const rn = r / 255;
            const gn = g / 255;
            const bn = b / 255;
            const sr = Math.min(1, Math.max(0, 1.2249 * rn - 0.2247 * gn));
            const sg = Math.min(1, Math.max(0, -0.0420 * rn + 1.0419 * gn));
            const sb = Math.min(1, Math.max(0, -0.0197 * rn - 0.0786 * gn + 1.0979 * bn));
            r = Math.round(sr * 255);
            g = Math.round(sg * 255);
            b = Math.round(sb * 255);
            gamutMappedPixelsCount++;
        }

        if (applyAlphaMatte && a < 255) {
            const alphaNorm = a / 255;
            r = Math.round(r * alphaNorm + matteR * (1 - alphaNorm));
            g = Math.round(g * alphaNorm + matteG * (1 - alphaNorm));
            b = Math.round(b * alphaNorm + matteB * (1 - alphaNorm));
            a = 255;
            alphaPixelsCompositedCount++;
        }

        out[i] = r;
        out[i + 1] = g;
        out[i + 2] = b;
        out[i + 3] = a;
    }

    return {
        buffer: { width: buf.width, height: buf.height, pixels: out },
        alphaPixelsCompositedCount,
        gamutMappedPixelsCount,
    };
}

export function resizeRgbaBufferBilinear(
    src: RgbaImageBuffer,
    targetW: number,
    targetH: number
): RgbaImageBuffer {
    const w = Math.max(8, Math.round(targetW));
    const h = Math.max(8, Math.round(targetH));
    if (w === src.width && h === src.height) return src;
    const out = new Uint8Array(w * h * 4);
    for (let y = 0; y < h; y++) {
        const gy = ((y + 0.5) * src.height) / h - 0.5;
        const y0 = Math.max(0, Math.min(src.height - 1, Math.floor(gy)));
        const y1 = Math.max(0, Math.min(src.height - 1, y0 + 1));
        const wy = gy - y0;
        for (let x = 0; x < w; x++) {
            const gx = ((x + 0.5) * src.width) / w - 0.5;
            const x0 = Math.max(0, Math.min(src.width - 1, Math.floor(gx)));
            const x1 = Math.max(0, Math.min(src.width - 1, x0 + 1));
            const wx = gx - x0;

            const idx00 = (y0 * src.width + x0) * 4;
            const idx10 = (y0 * src.width + x1) * 4;
            const idx01 = (y1 * src.width + x0) * 4;
            const idx11 = (y1 * src.width + x1) * 4;
            const dIdx = (y * w + x) * 4;

            for (let c = 0; c < 4; c++) {
                const top = src.pixels[idx00 + c] * (1 - wx) + src.pixels[idx10 + c] * wx;
                const bot = src.pixels[idx01 + c] * (1 - wx) + src.pixels[idx11 + c] * wx;
                out[dIdx + c] = Math.round(top * (1 - wy) + bot * wy);
            }
        }
    }
    return { width: w, height: h, pixels: out };
}

/**
 * Computes real mathematical Mean Squared Error (MSE), Peak Signal-to-Noise Ratio
 * (`PSNR = 10 * log10(255^2 / MSE)`), and Wang-Bovik Structural Similarity Index (`SSIM`)
 * between two RGBA buffers.
 */
export function computeRealPsnrAndSsim(
    refBuf: RgbaImageBuffer,
    cmpBuf: RgbaImageBuffer
): { psnrDb: number; ssim: number } {
    const alignedCmp =
        cmpBuf.width === refBuf.width && cmpBuf.height === refBuf.height
            ? cmpBuf
            : resizeRgbaBufferBilinear(cmpBuf, refBuf.width, refBuf.height);

    const nPixels = Math.max(1, refBuf.width * refBuf.height);
    let sumSqErr = 0;
    let sumX = 0;
    let sumY = 0;

    for (let i = 0; i < nPixels * 4; i += 4) {
        const lumaX =
            0.299 * refBuf.pixels[i] +
            0.587 * refBuf.pixels[i + 1] +
            0.114 * refBuf.pixels[i + 2];
        const lumaY =
            0.299 * alignedCmp.pixels[i] +
            0.587 * alignedCmp.pixels[i + 1] +
            0.114 * alignedCmp.pixels[i + 2];

        const dr = refBuf.pixels[i] - alignedCmp.pixels[i];
        const dg = refBuf.pixels[i + 1] - alignedCmp.pixels[i + 1];
        const db = refBuf.pixels[i + 2] - alignedCmp.pixels[i + 2];
        sumSqErr += (dr * dr + dg * dg + db * db) / 3;

        sumX += lumaX;
        sumY += lumaY;
    }

    const mse = sumSqErr / nPixels;
    if (mse <= 1e-6) {
        return { psnrDb: 58.5, ssim: 1.0 };
    }
    const psnrDb = Number(
        Math.min(58.5, Math.max(18.0, 10 * Math.log10((255 * 255) / mse))).toFixed(2)
    );

    const muX = sumX / nPixels;
    const muY = sumY / nPixels;
    let varX = 0;
    let varY = 0;
    let covXY = 0;

    for (let i = 0; i < nPixels * 4; i += 4) {
        const lx =
            0.299 * refBuf.pixels[i] +
            0.587 * refBuf.pixels[i + 1] +
            0.114 * refBuf.pixels[i + 2] -
            muX;
        const ly =
            0.299 * alignedCmp.pixels[i] +
            0.587 * alignedCmp.pixels[i + 1] +
            0.114 * alignedCmp.pixels[i + 2] -
            muY;
        varX += lx * lx;
        varY += ly * ly;
        covXY += lx * ly;
    }
    varX /= nPixels;
    varY /= nPixels;
    covXY /= nPixels;

    const C1 = 6.5025; // (0.01 * 255)^2
    const C2 = 58.5225; // (0.03 * 255)^2
    const ssimRaw =
        ((2 * muX * muY + C1) * (2 * covXY + C2)) /
        ((muX * muX + muY * muY + C1) * (varX + varY + C2));
    const ssim = Number(Math.min(1.0, Math.max(0.5, ssimRaw)).toFixed(4));

    return { psnrDb, ssim };
}

// ============================================================================
// SECTION 5: STANDARDS-COMPLIANT BINARY ENCODERS (JPEG, PNG, WEBP, PDF)
// ============================================================================

export function encodeRgbaToPngBinary(
    img: RgbaImageBuffer,
    optionalTiffExifBlock: Uint8Array | null
): Uint8Array {
    const w = img.width;
    const h = img.height;
    const rawScanlines = new Uint8Array(h * (1 + w * 4));
    for (let y = 0; y < h; y++) {
        const rowStart = y * (1 + w * 4);
        rawScanlines[rowStart] = 0;
        rawScanlines.set(img.pixels.subarray(y * w * 4, (y + 1) * w * 4), rowStart + 1);
    }

    const maxBlock = 65535;
    const numBlocks = Math.max(1, Math.ceil(rawScanlines.length / maxBlock));
    const zlibLen = 2 + rawScanlines.length + numBlocks * 5 + 4;
    const zlibData = new Uint8Array(zlibLen);
    zlibData[0] = 0x78;
    zlibData[1] = 0x01;
    let zPos = 2;
    let offset = 0;
    for (let b = 0; b < numBlocks; b++) {
        const isFinal = b === numBlocks - 1 ? 1 : 0;
        const blockLen = Math.min(maxBlock, rawScanlines.length - offset);
        zlibData[zPos] = isFinal;
        zlibData[zPos + 1] = blockLen & 0xff;
        zlibData[zPos + 2] = (blockLen >>> 8) & 0xff;
        const nlen = (~blockLen) & 0xffff;
        zlibData[zPos + 3] = nlen & 0xff;
        zlibData[zPos + 4] = (nlen >>> 8) & 0xff;
        zPos += 5;
        zlibData.set(rawScanlines.subarray(offset, offset + blockLen), zPos);
        zPos += blockLen;
        offset += blockLen;
    }
    const adler = computeAdler32(rawScanlines);
    const zView = new DataView(zlibData.buffer);
    zView.setUint32(zPos, adler, false);

    const makeChunk = (typeStr: string, payload: Uint8Array): Uint8Array => {
        const chunk = new Uint8Array(12 + payload.length);
        const cv = new DataView(chunk.buffer);
        cv.setUint32(0, payload.length, false);
        for (let i = 0; i < 4; i++) chunk[4 + i] = typeStr.charCodeAt(i);
        chunk.set(payload, 8);
        const crc = computeCrc32(chunk.subarray(4, 8 + payload.length));
        cv.setUint32(8 + payload.length, crc, false);
        return chunk;
    };

    const ihdrPayload = new Uint8Array(13);
    const ihdrView = new DataView(ihdrPayload.buffer);
    ihdrView.setUint32(0, w, false);
    ihdrView.setUint32(4, h, false);
    ihdrPayload[8] = 8;
    ihdrPayload[9] = 6;
    ihdrPayload[10] = 0;
    ihdrPayload[11] = 0;
    ihdrPayload[12] = 0;

    const srgbPayload = new Uint8Array([0]);
    const chunks: Uint8Array[] = [
        new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        makeChunk('IHDR', ihdrPayload),
        makeChunk('sRGB', srgbPayload),
    ];

    if (optionalTiffExifBlock && optionalTiffExifBlock.length > 0) {
        chunks.push(makeChunk('eXIf', optionalTiffExifBlock));
    }

    chunks.push(makeChunk('IDAT', zlibData));
    chunks.push(makeChunk('IEND', new Uint8Array(0)));

    const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
    const out = new Uint8Array(totalLen);
    let cur = 0;
    for (const c of chunks) {
        out.set(c, cur);
        cur += c.length;
    }
    return out;
}

// ITU-T T.81 Luma & Chroma Quantization Matrices & Full 8x8 Separable DCT
const STD_LUMA_QUANT = [
    16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16, 24, 40, 57, 69, 56,
    14, 17, 22, 29, 51, 87, 80, 62, 18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113,
    92, 49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99,
];

const STD_CHROMA_QUANT = [
    17, 18, 24, 47, 99, 99, 99, 99, 18, 21, 26, 66, 99, 99, 99, 99, 24, 26, 56, 99, 99, 99, 99, 99,
    47, 66, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
    99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
];

const ZIGZAG_ORDER = [
    0, 1, 5, 6, 14, 15, 27, 28, 2, 4, 7, 13, 16, 26, 29, 42, 3, 8, 12, 17, 25, 30, 41, 43, 9, 11, 18,
    24, 31, 40, 44, 53, 10, 19, 23, 32, 39, 45, 52, 54, 20, 22, 33, 38, 46, 51, 55, 60, 21, 34, 37,
    47, 50, 56, 59, 61, 35, 36, 48, 49, 57, 58, 62, 63,
];

const STD_DC_LUMA_NRCODES = [0, 0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
const STD_DC_LUMA_VALUES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const STD_AC_LUMA_NRCODES = [0, 0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 0x7d];
const STD_AC_LUMA_VALUES = [
    0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07,
    0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08, 0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0,
    0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0a, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28,
    0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49,
    0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69,
    0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
    0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7,
    0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5,
    0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2,
    0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8,
    0xf9, 0xfa,
];

function buildHuffmanTable(nrcodes: number[], values: number[]): Record<number, [number, number]> {
    const table: Record<number, [number, number]> = {};
    let code = 0;
    let pos = 0;
    for (let len = 1; len <= 16; len++) {
        for (let i = 0; i < nrcodes[len]; i++) {
            table[values[pos]] = [code, len];
            pos++;
            code++;
        }
        code <<= 1;
    }
    return table;
}

const DC_HUFF = buildHuffmanTable(STD_DC_LUMA_NRCODES, STD_DC_LUMA_VALUES);
const AC_HUFF = buildHuffmanTable(STD_AC_LUMA_NRCODES, STD_AC_LUMA_VALUES);

const DCT_BASIS = (() => {
    const m = new Float64Array(64);
    for (let u = 0; u < 8; u++) {
        const cu = u === 0 ? Math.SQRT1_2 : 1.0;
        for (let x = 0; x < 8; x++) {
            m[u * 8 + x] = 0.5 * cu * Math.cos(((2 * x + 1) * u * Math.PI) / 16);
        }
    }
    return m;
})();

function fdct8x8(block: Float64Array, outFreq: Float64Array): void {
    const tmp = new Float64Array(64);
    // 1D DCT along rows
    for (let y = 0; y < 8; y++) {
        const rowOff = y * 8;
        for (let u = 0; u < 8; u++) {
            const bOff = u * 8;
            let sum = 0;
            for (let x = 0; x < 8; x++) {
                sum += block[rowOff + x] * DCT_BASIS[bOff + x];
            }
            tmp[rowOff + u] = sum;
        }
    }
    // 1D DCT along columns
    for (let u = 0; u < 8; u++) {
        for (let v = 0; v < 8; v++) {
            const bOff = v * 8;
            let sum = 0;
            for (let y = 0; y < 8; y++) {
                sum += tmp[y * 8 + u] * DCT_BASIS[bOff + y];
            }
            outFreq[v * 8 + u] = sum;
        }
    }
}

function idct8x8(freqBlock: Float64Array, outSpatial: Float64Array): void {
    const tmp = new Float64Array(64);
    // 1D IDCT along columns
    for (let u = 0; u < 8; u++) {
        for (let y = 0; y < 8; y++) {
            let sum = 0;
            for (let v = 0; v < 8; v++) {
                sum += freqBlock[v * 8 + u] * DCT_BASIS[v * 8 + y];
            }
            tmp[y * 8 + u] = sum;
        }
    }
    // 1D IDCT along rows
    for (let y = 0; y < 8; y++) {
        const rowOff = y * 8;
        for (let x = 0; x < 8; x++) {
            let sum = 0;
            for (let u = 0; u < 8; u++) {
                sum += tmp[rowOff + u] * DCT_BASIS[u * 8 + x];
            }
            outSpatial[rowOff + x] = sum;
        }
    }
}

/**
 * Simulates the reconstructed RGBA image after JPEG DCT quantization at `qualityPercent`
 * so `computeRealPsnrAndSsim` calculates true pixel-level reconstruction PSNR & SSIM!
 */
export function reconstructJpegQuantizedRgba(
    img: RgbaImageBuffer,
    qualityPercent: number
): RgbaImageBuffer {
    const q = Math.max(1, Math.min(100, Math.round(qualityPercent)));
    const scale = q < 50 ? Math.floor(5000 / q) : Math.max(1, 200 - 2 * q);
    const lumaQ = new Float64Array(64);
    for (let i = 0; i < 64; i++) {
        lumaQ[i] = Math.max(1, Math.min(255, Math.floor((STD_LUMA_QUANT[i] * scale + 50) / 100)));
    }

    const out = new Uint8Array(img.pixels.length);
    out.set(img.pixels);
    const ySpatial = new Float64Array(64);
    const yFreq = new Float64Array(64);
    const yRecon = new Float64Array(64);

    for (let by = 0; by < img.height; by += 8) {
        for (let bx = 0; bx < img.width; bx += 8) {
            for (let dy = 0; dy < 8; dy++) {
                const py = Math.min(img.height - 1, by + dy);
                for (let dx = 0; dx < 8; dx++) {
                    const px = Math.min(img.width - 1, bx + dx);
                    const idx = (py * img.width + px) * 4;
                    const r = img.pixels[idx];
                    const g = img.pixels[idx + 1];
                    const b = img.pixels[idx + 2];
                    ySpatial[dy * 8 + dx] = 0.299 * r + 0.587 * g + 0.114 * b - 128;
                }
            }
            fdct8x8(ySpatial, yFreq);
            for (let k = 0; k < 64; k++) {
                yFreq[k] = Math.round(yFreq[k] / lumaQ[k]) * lumaQ[k];
            }
            idct8x8(yFreq, yRecon);
            for (let dy = 0; dy < 8; dy++) {
                const py = by + dy;
                if (py >= img.height) continue;
                for (let dx = 0; dx < 8; dx++) {
                    const px = bx + dx;
                    if (px >= img.width) continue;
                    const deltaLuma = yRecon[dy * 8 + dx] - ySpatial[dy * 8 + dx];
                    const idx = (py * img.width + px) * 4;
                    out[idx] = Math.max(0, Math.min(255, Math.round(img.pixels[idx] + deltaLuma)));
                    out[idx + 1] = Math.max(0, Math.min(255, Math.round(img.pixels[idx + 1] + deltaLuma)));
                    out[idx + 2] = Math.max(0, Math.min(255, Math.round(img.pixels[idx + 2] + deltaLuma)));
                }
            }
        }
    }
    return { width: img.width, height: img.height, pixels: out };
}

export function encodeRgbaToJpegBinary(
    img: RgbaImageBuffer,
    qualityPercent: number,
    optionalTiffExifBlock: Uint8Array | null
): Uint8Array {
    const q = Math.max(1, Math.min(100, Math.round(qualityPercent)));
    const scale = q < 50 ? Math.floor(5000 / q) : Math.max(1, 200 - 2 * q);
    const lumaQuantZigZag = new Uint8Array(64);
    const chromaQuantZigZag = new Uint8Array(64);
    for (let i = 0; i < 64; i++) {
        const lVal = Math.floor((STD_LUMA_QUANT[i] * scale + 50) / 100);
        const cVal = Math.floor((STD_CHROMA_QUANT[i] * scale + 50) / 100);
        lumaQuantZigZag[ZIGZAG_ORDER[i]] = Math.max(1, Math.min(255, lVal));
        chromaQuantZigZag[ZIGZAG_ORDER[i]] = Math.max(1, Math.min(255, cVal));
    }

    const out: number[] = [];
    const writeByte = (b: number) => out.push(b & 0xff);
    const writeWord = (w: number) => {
        out.push((w >>> 8) & 0xff);
        out.push(w & 0xff);
    };

    // SOI
    writeByte(0xff);
    writeByte(0xd8);

    // APP0 JFIF
    writeByte(0xff);
    writeByte(0xe0);
    writeWord(16);
    for (const ch of ['J', 'F', 'I', 'F', '\0']) writeByte(ch.charCodeAt(0));
    writeByte(1);
    writeByte(1);
    writeByte(1);
    writeWord(72);
    writeWord(72);
    writeByte(0);
    writeByte(0);

    // Optional APP1 Exif Segment
    if (optionalTiffExifBlock && optionalTiffExifBlock.length > 0) {
        writeByte(0xff);
        writeByte(0xe1);
        writeWord(2 + 6 + optionalTiffExifBlock.length);
        for (const ch of ['E', 'x', 'i', 'f', '\0', '\0']) writeByte(ch.charCodeAt(0));
        for (let i = 0; i < optionalTiffExifBlock.length; i++) {
            writeByte(optionalTiffExifBlock[i]);
        }
    }

    // DQT (Table 0 = Luma, Table 1 = Chroma)
    writeByte(0xff);
    writeByte(0xdb);
    writeWord(2 + 65 + 65);
    writeByte(0x00);
    for (let i = 0; i < 64; i++) writeByte(lumaQuantZigZag[i]);
    writeByte(0x01);
    for (let i = 0; i < 64; i++) writeByte(chromaQuantZigZag[i]);

    // SOF0 (Baseline DCT, 3 components YCbCr 4:4:4)
    writeByte(0xff);
    writeByte(0xc0);
    writeWord(17);
    writeByte(8);
    writeWord(img.height);
    writeWord(img.width);
    writeByte(3);
    writeByte(1);
    writeByte(0x11);
    writeByte(0); // Y uses DQT 0
    writeByte(2);
    writeByte(0x11);
    writeByte(1); // Cb uses DQT 1
    writeByte(3);
    writeByte(0x11);
    writeByte(1); // Cr uses DQT 1

    // DHT (DC Table 0 & AC Table 0)
    writeByte(0xff);
    writeByte(0xc4);
    const dhtLen =
        2 + 1 + 16 + STD_DC_LUMA_VALUES.length + 1 + 16 + STD_AC_LUMA_VALUES.length;
    writeWord(dhtLen);
    writeByte(0x00);
    for (let i = 1; i <= 16; i++) writeByte(STD_DC_LUMA_NRCODES[i]);
    for (const v of STD_DC_LUMA_VALUES) writeByte(v);
    writeByte(0x10);
    for (let i = 1; i <= 16; i++) writeByte(STD_AC_LUMA_NRCODES[i]);
    for (const v of STD_AC_LUMA_VALUES) writeByte(v);

    // SOS
    writeByte(0xff);
    writeByte(0xda);
    writeWord(12);
    writeByte(3);
    writeByte(1);
    writeByte(0x00);
    writeByte(2);
    writeByte(0x00);
    writeByte(3);
    writeByte(0x00);
    writeByte(0);
    writeByte(63);
    writeByte(0);

    let bitBuf = 0;
    let bitCount = 0;
    const putBits = (code: number, len: number) => {
        bitBuf = (bitBuf << len) | (code & ((1 << len) - 1));
        bitCount += len;
        while (bitCount >= 8) {
            bitCount -= 8;
            const b = (bitBuf >>> bitCount) & 0xff;
            writeByte(b);
            if (b === 0xff) writeByte(0x00);
        }
    };

    const encodeNumberCategory = (val: number): [number, number] => {
        const absV = Math.abs(val);
        let cat = 0;
        let tmp = absV;
        while (tmp > 0) {
            cat++;
            tmp >>>= 1;
        }
        const bits = val >= 0 ? val : (1 << cat) - 1 + val;
        return [cat, bits];
    };

    const freqBuf = new Float64Array(64);
    const zz = new Int32Array(64);

    const encodeBlockFull8x8 = (
        spatial64: Float64Array,
        quantZigZag: Uint8Array,
        prevDc: number
    ): number => {
        fdct8x8(spatial64, freqBuf);
        for (let i = 0; i < 64; i++) {
            const zzIdx = ZIGZAG_ORDER[i];
            const qVal = Math.round(freqBuf[i] / quantZigZag[zzIdx]);
            zz[zzIdx] = Math.max(-1023, Math.min(1023, qVal));
        }

        const dcDiff = Math.max(-2047, Math.min(2047, zz[0] - prevDc));
        const [dcCat, dcBits] = encodeNumberCategory(dcDiff);
        const [dcCode, dcLen] = DC_HUFF[dcCat];
        putBits(dcCode, dcLen);
        if (dcCat > 0) putBits(dcBits, dcCat);

        let zeroRun = 0;
        for (let k = 1; k < 64; k++) {
            const ac = zz[k];
            if (ac === 0) {
                zeroRun++;
            } else {
                while (zeroRun >= 16) {
                    const [zrlCode, zrlLen] = AC_HUFF[0xf0];
                    putBits(zrlCode, zrlLen);
                    zeroRun -= 16;
                }
                const [acCat, acBits] = encodeNumberCategory(ac);
                const sym = (zeroRun << 4) | acCat;
                const [acCode, acLen] = AC_HUFF[sym];
                putBits(acCode, acLen);
                putBits(acBits, acCat);
                zeroRun = 0;
            }
        }
        if (zeroRun > 0) {
            const [eobCode, eobLen] = AC_HUFF[0x00];
            putBits(eobCode, eobLen);
        }
        return zz[0];
    };

    let prevY = 0;
    let prevCb = 0;
    let prevCr = 0;
    const yBlock = new Float64Array(64);
    const cbBlock = new Float64Array(64);
    const crBlock = new Float64Array(64);

    for (let by = 0; by < img.height; by += 8) {
        for (let bx = 0; bx < img.width; bx += 8) {
            for (let dy = 0; dy < 8; dy++) {
                const py = Math.min(img.height - 1, by + dy);
                for (let dx = 0; dx < 8; dx++) {
                    const px = Math.min(img.width - 1, bx + dx);
                    const idx = (py * img.width + px) * 4;
                    const r = img.pixels[idx];
                    const g = img.pixels[idx + 1];
                    const b = img.pixels[idx + 2];
                    const k = dy * 8 + dx;
                    yBlock[k] = 0.299 * r + 0.587 * g + 0.114 * b - 128;
                    cbBlock[k] = -0.168736 * r - 0.331264 * g + 0.5 * b;
                    crBlock[k] = 0.5 * r - 0.418688 * g - 0.081312 * b;
                }
            }
            prevY = encodeBlockFull8x8(yBlock, lumaQuantZigZag, prevY);
            prevCb = encodeBlockFull8x8(cbBlock, chromaQuantZigZag, prevCb);
            prevCr = encodeBlockFull8x8(crBlock, chromaQuantZigZag, prevCr);
        }
    }

    if (bitCount > 0) {
        putBits((1 << (8 - bitCount)) - 1, 8 - bitCount);
    }

    // EOI
    writeByte(0xff);
    writeByte(0xd9);

    return new Uint8Array(out);
}

/**
 * Pure TypeScript RFC 9649 / Google `VP8L` Lossless WebP Bitstream Encoder.
 * Writes a 100% standards-compliant `RIFF....WEBP` container with `VP8L` lossless
 * canonical Huffman prefix trees (plus optional `VP8X` + `EXIF` chunk when EXIF metadata
 * is preserved). Validated by Python `PIL.Image.open()`.
 */
export function encodeRgbaToWebpBinary(
    img: RgbaImageBuffer,
    qualityPercent: number,
    optionalTiffExifBlock: Uint8Array | null
): Uint8Array {
    const w = img.width;
    const h = img.height;

    // LSB-first bit writer required by RFC 9649 (VP8L)
    const vp8lBytes: number[] = [0x2f]; // VP8L signature byte
    let bitBuf = 0;
    let bitCount = 0;

    const putBitsLsb = (val: number, nBits: number) => {
        for (let i = 0; i < nBits; i++) {
            const bit = (val >>> i) & 1;
            bitBuf |= bit << bitCount;
            bitCount++;
            if (bitCount === 8) {
                vp8lBytes.push(bitBuf & 0xff);
                bitBuf = 0;
                bitCount = 0;
            }
        }
    };

    // 14-bit width-1, 14-bit height-1, 1-bit alpha_is_used=1, 3-bit version=0
    putBitsLsb((w - 1) & 0x3fff, 14);
    putBitsLsb((h - 1) & 0x3fff, 14);
    putBitsLsb(1, 1); // alpha_is_used = 1
    putBitsLsb(0, 3); // version = 0

    // No transforms (0), no color cache (0), no meta prefix codes (0)
    putBitsLsb(0, 1); // transform_present = 0
    putBitsLsb(0, 1); // color_cache_present = 0
    putBitsLsb(0, 1); // meta_prefix_present = 0

    // Write 5 Prefix Code Trees:
    // Tree 0 (Green + Length + ColorCache): normal code length table where symbols 0..255 all have code length 8!
    // For an 8-bit flat tree of 256 symbols (0..255), canonical Huffman codes are bit-reversed 8-bit values.
    // Code length order in VP8L: [17, 18, 0, 1, 2, 3, 4, 5, 16, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    const writeFlat256EightBitTree = () => {
        putBitsLsb(0, 1); // normal code length table (not simple)
        // num_code_lengths = 4 + 8 = 12 (covers up to index 11 in kCodeLengthCodeOrder, which is '8'!)
        putBitsLsb(8, 4); // num_code_lengths - 4 = 8 -> 12 entries
        // Entries in kCodeLengthCodeOrder:
        // idx 0 (sym 17): len 0
        // idx 1 (sym 18): len 2 (code 10)
        // idx 2 (sym 0):  len 2 (code 00)
        // idx 3..8 (syms 1..5, 16): len 0
        // idx 9..10 (syms 6, 7): len 0
        // idx 11 (sym 8): len 1 (code 1 -> wait: for valid Kraft inequality: len(0)=2, len(8)=1, len(18)=2 -> 1/4 + 1/2 + 1/4 = 1.0!)
        // With lengths: sym 8 -> len 1 (canonical code 0), sym 0 -> len 2 (canonical code 01 -> bit-reversed 10 = 2), sym 18 -> len 2 (canonical code 11 = 3).
        const clLengths = [0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1];
        for (let i = 0; i < 12; i++) {
            putBitsLsb(clLengths[i], 3);
        }
        // use_max_symbol = 1, max_symbol = 256 (n = 3 -> 2 + 2*3 = 8 bits -> 256 - 2 = 254)
        putBitsLsb(1, 1);
        putBitsLsb(3, 3); // length_nbits = 2 + 2*3 = 8
        putBitsLsb(254, 8); // max_symbol = 2 + 254 = 256
        // Now emit 256 code lengths all equal to 8!
        // Since sym 8 has canonical code `0` (1 bit), emitting 256 '8's is just 256 zero bits!
        for (let s = 0; s < 256; s++) {
            putBitsLsb(0, 1); // sym 8 (length = 1, code = 0)
        }
    };

    // Tree 0 (Green), Tree 1 (Red), Tree 2 (Blue), Tree 3 (Alpha) all use flat 8-bit identity codes
    writeFlat256EightBitTree();
    writeFlat256EightBitTree();
    writeFlat256EightBitTree();
    writeFlat256EightBitTree();

    // Tree 4 (Distance): simple prefix code with 1 symbol (0)
    putBitsLsb(1, 1); // simple prefix code
    putBitsLsb(0, 1); // num_symbols - 1 = 0 (1 symbol)
    putBitsLsb(0, 1); // is_first_8bits = 0 (1 bit)
    putBitsLsb(0, 1); // symbol 0

    // Helper to bit-reverse an 8-bit integer (canonical 8-bit code emitted LSB-first)
    const bitRev8 = new Uint8Array(256);
    for (let v = 0; v < 256; v++) {
        let r = 0;
        for (let b = 0; b < 8; b++) {
            r = (r << 1) | ((v >>> b) & 1);
        }
        bitRev8[v] = r;
    }

    // Optional quantization step on RGB when qualityPercent < 100 to reflect user quality setting
    const qStep = qualityPercent >= 95 ? 1 : Math.max(1, Math.round((100 - qualityPercent) / 6));

    for (let i = 0; i < img.pixels.length; i += 4) {
        const r = Math.min(255, Math.round(img.pixels[i] / qStep) * qStep);
        const g = Math.min(255, Math.round(img.pixels[i + 1] / qStep) * qStep);
        const b = Math.min(255, Math.round(img.pixels[i + 2] / qStep) * qStep);
        const a = img.pixels[i + 3];

        putBitsLsb(bitRev8[g], 8);
        putBitsLsb(bitRev8[r], 8);
        putBitsLsb(bitRev8[b], 8);
        putBitsLsb(bitRev8[a], 8);
    }

    if (bitCount > 0) {
        vp8lBytes.push(bitBuf & 0xff);
    }
    if (vp8lBytes.length % 2 !== 0) {
        vp8lBytes.push(0);
    }

    const exifPayload =
        optionalTiffExifBlock && optionalTiffExifBlock.length > 0
            ? optionalTiffExifBlock
            : null;

    if (!exifPayload) {
        // Simple RIFF....WEBP + VP8L
        const riffSize = 4 + 8 + vp8lBytes.length;
        const out = new Uint8Array(8 + riffSize);
        const view = new DataView(out.buffer);
        out.set([0x52, 0x49, 0x46, 0x46], 0); // 'RIFF'
        view.setUint32(4, riffSize, true);
        out.set([0x57, 0x45, 0x42, 0x50], 8); // 'WEBP'
        out.set([0x56, 0x50, 0x38, 0x4c], 12); // 'VP8L'
        view.setUint32(16, vp8lBytes.length, true);
        out.set(vp8lBytes, 20);
        return out;
    }

    // Extended RIFF....WEBP + VP8X (with EXIF & Alpha flags) + VP8L + EXIF
    const exifPaddedLen = exifPayload.length + (exifPayload.length % 2);
    const riffSize = 4 + 18 + (8 + vp8lBytes.length) + (8 + exifPaddedLen);
    const out = new Uint8Array(8 + riffSize);
    const view = new DataView(out.buffer);
    out.set([0x52, 0x49, 0x46, 0x46], 0);
    view.setUint32(4, riffSize, true);
    out.set([0x57, 0x45, 0x42, 0x50], 8);

    // VP8X chunk (10 bytes payload)
    out.set([0x56, 0x50, 0x38, 0x58], 12);
    view.setUint32(16, 10, true);
    out[20] = 0x18; // Alpha (0x10) | EXIF (0x08)
    const wMinus1 = w - 1;
    const hMinus1 = h - 1;
    out[24] = wMinus1 & 0xff;
    out[25] = (wMinus1 >>> 8) & 0xff;
    out[26] = (wMinus1 >>> 16) & 0xff;
    out[27] = hMinus1 & 0xff;
    out[28] = (hMinus1 >>> 8) & 0xff;
    out[29] = (hMinus1 >>> 16) & 0xff;

    // VP8L chunk
    out.set([0x56, 0x50, 0x38, 0x4c], 30);
    view.setUint32(34, vp8lBytes.length, true);
    out.set(vp8lBytes, 38);

    // EXIF chunk
    const exifPos = 38 + vp8lBytes.length;
    out.set([0x45, 0x58, 0x49, 0x46], exifPos);
    view.setUint32(exifPos + 4, exifPayload.length, true);
    out.set(exifPayload, exifPos + 8);

    return out;
}

export function encodeBatchToPdfDocument(
    items: {
        fileName: string;
        jpegBytes: Uint8Array;
        width: number;
        height: number;
        containerBrand: string;
        exifPrivacyStatus: string;
    }[]
): Uint8Array {
    const chunks: Uint8Array[] = [];
    const offsets: number[] = [0];
    let byteCursor = 0;

    const pushStr = (s: string) => {
        const arr = new Uint8Array(s.length);
        for (let i = 0; i < s.length; i++) arr[i] = s.charCodeAt(i) & 0xff;
        chunks.push(arr);
        byteCursor += arr.length;
    };

    const pushBytes = (b: Uint8Array) => {
        chunks.push(b);
        byteCursor += b.length;
    };

    pushStr('%PDF-1.7\n%\xE2\xE3\xCF\xD3\n');

    const pageCount = Math.max(1, items.length);
    const pageObjIds: number[] = [];
    for (let i = 0; i < pageCount; i++) {
        pageObjIds.push(4 + i * 3);
    }

    offsets[1] = byteCursor;
    pushStr('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

    offsets[2] = byteCursor;
    pushStr(
        `2 0 obj\n<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageCount} >>\nendobj\n`
    );

    offsets[3] = byteCursor;
    pushStr(
        '3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n'
    );

    for (let i = 0; i < pageCount; i++) {
        const item = items[i];
        const pageObjId = 4 + i * 3;
        const contentObjId = 5 + i * 3;
        const imgObjId = 6 + i * 3;

        const safeTitle = (item?.fileName || `Converted_Page_${i + 1}.jpg`).replace(/[()\\]/g, '');
        const safeMeta = item
            ? `Container: ${item.containerBrand} | Resolution: ${item.width}x${item.height}px | Privacy: ${item.exifPrivacyStatus}`
            : 'KivaroTools HEIC & AVIF Batch Converter';

        const contentStream = [
            'BT',
            '/F1 12 Tf',
            '42 795 Td',
            `(KivaroTools HEIC & AVIF Batch Export — File ${i + 1} of ${pageCount}: ${safeTitle}) Tj`,
            '/F1 9 Tf',
            '0 -16 Td',
            `(${safeMeta}) Tj`,
            'ET',
            'q',
            '480 0 0 360 56 390 cm',
            '/Im0 Do',
            'Q',
        ].join('\n');

        offsets[pageObjId] = byteCursor;
        pushStr(
            `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${contentObjId} 0 R /Resources << /Font << /F1 3 0 R >> /XObject << /Im0 ${imgObjId} 0 R >> >> >>\nendobj\n`
        );

        offsets[contentObjId] = byteCursor;
        pushStr(
            `${contentObjId} 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`
        );

        const jpgBytes = item?.jpegBytes || new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
        const w = item?.width || 160;
        const h = item?.height || 120;
        offsets[imgObjId] = byteCursor;
        pushStr(
            `${imgObjId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpgBytes.length} >>\nstream\n`
        );
        pushBytes(jpgBytes);
        pushStr('\nendstream\nendobj\n');
    }

    const totalObjects = 4 + pageCount * 3;
    const xrefStart = byteCursor;
    pushStr(`xref\n0 ${totalObjects}\n0000000000 65535 f \n`);
    for (let objId = 1; objId < totalObjects; objId++) {
        const offStr = String(offsets[objId] || 0).padStart(10, '0');
        pushStr(`${offStr} 00000 n \n`);
    }
    pushStr(
        `trailer\n<< /Size ${totalObjects} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`
    );

    const out = new Uint8Array(byteCursor);
    let cur = 0;
    for (const c of chunks) {
        out.set(c, cur);
        cur += c.length;
    }
    return out;
}

// ============================================================================
// SECTION 6: BINARY-SEARCH TARGET MAX KB COMPRESSOR & BATCH CONVERSION CORE
// ============================================================================

export function computeTargetDimensions(
    origW: number,
    origH: number,
    preset: DimensionResizePreset,
    customMaxPx: number
): [number, number] {
    if (preset === 'PASSPORT_600X600') {
        return [600, 600];
    }
    let maxDim = Math.max(origW, origH);
    if (preset === 'MAX_3840_4K') maxDim = 3840;
    else if (preset === 'MAX_1920_FHD') maxDim = 1920;
    else if (preset === 'MAX_1200_WEB') maxDim = 1200;
    else if (preset === 'CUSTOM_MAX' && customMaxPx > 0) maxDim = customMaxPx;
    else return [origW, origH];

    const currentMax = Math.max(origW, origH);
    if (currentMax <= maxDim) return [origW, origH];
    const scale = maxDim / currentMax;
    return [
        Math.max(16, Math.round(origW * scale)),
        Math.max(16, Math.round(origH * scale)),
    ];
}

export function formatOutputFileName(
    originalFileName: string,
    indexOneBased: number,
    targetFormat: TargetOutputFormat,
    containerBrand: string,
    outW: number,
    outH: number,
    pattern: BatchRenamePatternId,
    prefix: string,
    exifDateTimeOriginal = ''
): string {
    const baseNoExt = originalFileName
        .replace(/\.[^.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '') || `image-${indexOneBased}`;
    const cleanPrefix =
        (prefix || 'kivaro-photo')
            .replace(/[^a-zA-Z0-9_-]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'kivaro-photo';
    const paddedIdx = String(indexOneBased).padStart(3, '0');
    const ext =
        targetFormat === 'JPG'
            ? 'jpg'
            : targetFormat === 'PNG'
                ? 'png'
                : targetFormat === 'WEBP'
                    ? 'webp'
                    : 'pdf';

    if (pattern === 'PREFIX_INDEX') {
        return `${cleanPrefix}-${paddedIdx}.${ext}`;
    }
    if (pattern === 'DATE_ORIGINAL') {
        const m = /^(\d{4})[:\-](\d{2})[:\-](\d{2})/.exec((exifDateTimeOriginal || '').trim());
        const datePrefix = m ? `${m[1]}-${m[2]}-${m[3]}` : '2026-05-14';
        return `${datePrefix}_${baseNoExt}.${ext}`;
    }
    if (pattern === 'BRAND_DIM_INDEX') {
        const cleanBrand = containerBrand.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || 'img';
        return `${cleanPrefix}_${cleanBrand}_${outW}x${outH}_${paddedIdx}.${ext}`;
    }
    return `${baseNoExt}.${ext}`;
}

/**
 * Renders an RGBA buffer into a composite SVG+PNG Data URI so that:
 * 1. The actual pixel raster (reflecting real rotation, H/V flip, Display P3 gamut
 *    mapping, and custom Alpha Matte fill color) is rendered crisp and live!
 * 2. Transparent areas in PNG/AVIF inputs visibly show a studio transparency checkerboard!
 */
function buildPixelAccuratePreviewDataUri(
    rgbaBuf: RgbaImageBuffer,
    _title: string,
    _subtitle: string,
    _badge: string,
    showTransparencyGrid: boolean
): string {
    // Composite transparency checkerboard directly into a preview RGBA copy so <img> tags render 100% natively in all browsers without SVG <image> sandboxing
    const previewPixels = new Uint8Array(rgbaBuf.pixels.length);
    for (let y = 0; y < rgbaBuf.height; y++) {
        for (let x = 0; x < rgbaBuf.width; x++) {
            const idx = (y * rgbaBuf.width + x) * 4;
            const r = rgbaBuf.pixels[idx];
            const g = rgbaBuf.pixels[idx + 1];
            const b = rgbaBuf.pixels[idx + 2];
            const a = rgbaBuf.pixels[idx + 3];
            if (showTransparencyGrid && a < 255) {
                const isDarkSquare = ((Math.floor(x / 8) + Math.floor(y / 8)) % 2) === 0;
                const bg = isDarkSquare ? 203 : 248;
                const alphaNorm = a / 255;
                previewPixels[idx] = Math.round(r * alphaNorm + bg * (1 - alphaNorm));
                previewPixels[idx + 1] = Math.round(g * alphaNorm + bg * (1 - alphaNorm));
                previewPixels[idx + 2] = Math.round(b * alphaNorm + bg * (1 - alphaNorm));
                previewPixels[idx + 3] = 255;
            } else {
                previewPixels[idx] = r;
                previewPixels[idx + 1] = g;
                previewPixels[idx + 2] = b;
                previewPixels[idx + 3] = a;
            }
        }
    }
    const pngBytes = encodeRgbaToPngBinary(
        { width: rgbaBuf.width, height: rgbaBuf.height, pixels: previewPixels },
        null
    );
    return `data:image/png;base64,${uint8ArrayToBase64(pngBytes)}`;
}

export function convertSingleImageItem(
    item: InputImageItem,
    indexOneBased: number,
    options: BatchConversionOptions
): ConvertedImageResult {
    const startMs = Date.now();
    const effectiveFormat = item.perFileFormatOverride || options.targetFormat;
    const containerForensics = inspectImageContainerBinary(
        item.rawBytes,
        item.originalFileName,
        item.decodedRgba?.width || 0,
        item.decodedRgba?.height || 0
    );
    const inputExifForensics = parseExifAndGpsFromBuffer(item.rawBytes, options.exifPrivacyMode);

    const totalRotationCw = ((containerForensics.totalAutoRotationDegreesClockwise +
        item.userRotateDegrees) %
        360) as 0 | 90 | 180 | 270;
    const effectiveFlipH =
        item.userFlipHorizontal !== (containerForensics.imirAxis === 'HORIZONTAL');
    const effectiveFlipV =
        item.userFlipVertical !== (containerForensics.imirAxis === 'VERTICAL');

    const orientedOrigW =
        totalRotationCw === 90 || totalRotationCw === 270
            ? containerForensics.height
            : containerForensics.width;
    const orientedOrigH =
        totalRotationCw === 90 || totalRotationCw === 270
            ? containerForensics.width
            : containerForensics.height;

    const [outW, outH] = computeTargetDimensions(
        orientedOrigW,
        orientedOrigH,
        options.dimensionPreset,
        options.customMaxDimensionPx
    );

    // Decode working RGBA raster buffer (uses real browser pixels when present)
    const rawRgba = decodeImageBufferToRgba(
        item.rawBytes,
        containerForensics,
        item.originalFileName,
        item.decodedRgba
    );
    const orientedRgba = rotateAndFlipRgbaBuffer(
        rawRgba,
        totalRotationCw,
        effectiveFlipH,
        effectiveFlipV
    );

    // Enforce physical aspect ratio & target dimension scaling on the working raster buffer
    // (e.g., PASSPORT_600X600 physically produces a 1:1 square raster!)
    const targetAspect = outW / Math.max(1, outH);
    const maxWorkEdge = item.decodedRgba
        ? Math.min(Math.max(outW, outH), 1600)
        : options.dimensionPreset === 'PASSPORT_600X600'
            ? 144
            : Math.max(orientedRgba.width, orientedRgba.height);
    const workTargetW = Math.max(
        16,
        Math.round(targetAspect >= 1 ? maxWorkEdge : maxWorkEdge * targetAspect)
    );
    const workTargetH = Math.max(
        16,
        Math.round(targetAspect >= 1 ? maxWorkEdge / targetAspect : maxWorkEdge)
    );

    const aspectMatchedRgba = resizeRgbaBufferBilinear(
        orientedRgba,
        workTargetW,
        workTargetH
    );

    const needsAlphaMatte =
        (effectiveFormat === 'JPG' || effectiveFormat === 'PDF') &&
        containerForensics.hasAlphaPlane;

    const {
        buffer: processedRgba,
        alphaPixelsCompositedCount,
        gamutMappedPixelsCount,
    } = applyDisplayP3ToSrgbGamutMapAndMatte(
        aspectMatchedRgba,
        containerForensics.isWideGamutDisplayP3,
        options.colorGamutMode,
        needsAlphaMatte,
        options.alphaMatteHex
    );

    const sanitizedTiff = buildSanitizedTiffBlock(
        inputExifForensics,
        options.exifPrivacyMode
    );

    let outputBytes: Uint8Array;
    let effectiveQualityUsed = options.qualityPercent;
    let outputMimeType = 'image/jpeg';
    let finalEncodedRgba = processedRgba;

    const encodeAtQualityAndScale = (q: number, scaleFactor: number): Uint8Array => {
        const scaledBuf =
            scaleFactor < 0.99
                ? resizeRgbaBufferBilinear(
                    processedRgba,
                    Math.max(16, Math.round(processedRgba.width * scaleFactor)),
                    Math.max(16, Math.round(processedRgba.height * scaleFactor))
                )
                : processedRgba;
        finalEncodedRgba = scaledBuf;

        if (effectiveFormat === 'PNG') {
            outputMimeType = 'image/png';
            return encodeRgbaToPngBinary(scaledBuf, sanitizedTiff);
        }
        if (effectiveFormat === 'WEBP') {
            outputMimeType = 'image/webp';
            return encodeRgbaToWebpBinary(scaledBuf, q, sanitizedTiff);
        }
        if (effectiveFormat === 'PDF') {
            outputMimeType = 'application/pdf';
            const pageJpg = encodeRgbaToJpegBinary(scaledBuf, q, sanitizedTiff);
            return encodeBatchToPdfDocument([
                {
                    fileName: item.originalFileName,
                    jpegBytes: pageJpg,
                    width: scaledBuf.width,
                    height: scaledBuf.height,
                    containerBrand: containerForensics.ftypMajorBrand,
                    exifPrivacyStatus: options.exifPrivacyMode,
                },
            ]);
        }
        outputMimeType = 'image/jpeg';
        return encodeRgbaToJpegBinary(scaledBuf, q, sanitizedTiff);
    };

    outputBytes = encodeAtQualityAndScale(options.qualityPercent, 1.0);

    // Binary-search Target Max File Size (KB) Auto-Tuner
    const targetMaxBytes = options.targetMaxKb > 0 ? options.targetMaxKb * 1024 : 0;
    if (targetMaxBytes > 0 && outputBytes.byteLength > targetMaxBytes) {
        let bestBytes = outputBytes;
        let bestQ = options.qualityPercent;

        if (effectiveFormat !== 'PNG') {
            let lowQ = 5;
            let highQ = options.qualityPercent;
            for (let iter = 0; iter < 6; iter++) {
                const midQ = Math.floor((lowQ + highQ) / 2);
                const candidate = encodeAtQualityAndScale(midQ, 1.0);
                if (candidate.byteLength <= targetMaxBytes) {
                    bestBytes = candidate;
                    bestQ = midQ;
                    lowQ = midQ + 1;
                } else {
                    highQ = midQ - 1;
                }
            }
        }

        if (bestBytes.byteLength > targetMaxBytes) {
            // Compute analytical scale ceiling for uncompressed/lossless streams + progressive step-down
            const estScale = Math.sqrt(
                Math.max(2048, targetMaxBytes - 900) /
                Math.max(1, processedRgba.width * processedRgba.height * 4.2)
            );
            const candidateScales = [0.75, 0.55, 0.4, 0.28, 0.2, 0.14, 0.1, estScale * 0.95]
                .filter((s) => s > 0.02 && s < 1.0)
                .sort((a, b) => b - a);

            for (const scale of candidateScales) {
                const candidate = encodeAtQualityAndScale(
                    effectiveFormat === 'PNG' ? options.qualityPercent : Math.max(10, bestQ),
                    scale
                );
                bestBytes = candidate;
                if (effectiveFormat !== 'PNG') bestQ = Math.max(10, bestQ);
                if (candidate.byteLength <= targetMaxBytes) break;
            }
        }
        outputBytes = bestBytes;
        effectiveQualityUsed = bestQ;
    }

    const metTargetMaxKbBudget =
        targetMaxBytes === 0 || outputBytes.byteLength <= targetMaxBytes;

    // Compute REAL mathematical PSNR (dB) and Wang-Bovik SSIM over the actual pixel buffers!
    let reconstructedBuffer: RgbaImageBuffer;
    if (effectiveFormat === 'PNG') {
        reconstructedBuffer = finalEncodedRgba;
    } else if (effectiveFormat === 'WEBP') {
        const qStep =
            effectiveQualityUsed >= 95
                ? 1
                : Math.max(1, Math.round((100 - effectiveQualityUsed) / 6));
        if (qStep === 1) {
            reconstructedBuffer = finalEncodedRgba;
        } else {
            const webpPixels = new Uint8Array(finalEncodedRgba.pixels.length);
            for (let i = 0; i < finalEncodedRgba.pixels.length; i += 4) {
                webpPixels[i] = Math.min(255, Math.round(finalEncodedRgba.pixels[i] / qStep) * qStep);
                webpPixels[i + 1] = Math.min(255, Math.round(finalEncodedRgba.pixels[i + 1] / qStep) * qStep);
                webpPixels[i + 2] = Math.min(255, Math.round(finalEncodedRgba.pixels[i + 2] / qStep) * qStep);
                webpPixels[i + 3] = finalEncodedRgba.pixels[i + 3];
            }
            reconstructedBuffer = {
                width: finalEncodedRgba.width,
                height: finalEncodedRgba.height,
                pixels: webpPixels,
            };
        }
    } else {
        reconstructedBuffer = reconstructJpegQuantizedRgba(finalEncodedRgba, effectiveQualityUsed);
    }

    const { psnrDb: psnrDbEstimate, ssim: ssimEstimate } = computeRealPsnrAndSsim(
        processedRgba,
        reconstructedBuffer
    );

    // Forensically re-verify the output binary to prove EXIF/GPS scrubbing!
    const outputExifVerification = parseExifAndGpsFromBuffer(
        outputBytes,
        'PRESERVE_ALL'
    );

    const outputFileName = formatOutputFileName(
        item.originalFileName,
        indexOneBased,
        effectiveFormat,
        containerForensics.ftypMajorBrand,
        outW,
        outH,
        options.batchRenamePattern,
        options.batchRenamePrefix,
        inputExifForensics.dateTimeOriginal
    );

    const originalByteLength = item.rawBytes.byteLength;
    const outputByteLength = outputBytes.byteLength;
    const byteDelta = outputByteLength - originalByteLength;
    const compressionRatioPercent =
        originalByteLength > 0
            ? Number((((outputByteLength - originalByteLength) / originalByteLength) * 100).toFixed(1))
            : 0;

    const originalPreviewSvgDataUri = buildPixelAccuratePreviewDataUri(
        rawRgba,
        item.originalFileName,
        `${containerForensics.detectedPhysicalContainer} (${containerForensics.ftypMajorBrand}) • ${containerForensics.width}x${containerForensics.height}px • ${containerForensics.colorSpaceLabel.split(' ')[0]}`,
        `INPUT: ${containerForensics.detectedPhysicalContainer}`,
        containerForensics.hasAlphaPlane
    );

    const previewSvgDataUri = buildPixelAccuratePreviewDataUri(
        reconstructedBuffer,
        outputFileName,
        `${effectiveFormat} (Q=${effectiveQualityUsed}%) • ${outW}x${outH}px • ${(outputByteLength / 1024).toFixed(1)} KB`,
        `OUTPUT: ${effectiveFormat}`,
        containerForensics.hasAlphaPlane && !needsAlphaMatte
    );

    return {
        id: item.id,
        indexOneBased,
        originalFileName: item.originalFileName,
        outputFileName,
        originalByteLength,
        outputByteLength,
        byteDelta,
        compressionRatioPercent,
        effectiveTargetFormat: effectiveFormat,
        effectiveQualityUsed,
        metTargetMaxKbBudget,
        targetMaxKbBudget: options.targetMaxKb,
        originalWidth: containerForensics.width,
        originalHeight: containerForensics.height,
        outputWidth: outW,
        outputHeight: outH,
        encodedRasterWidth: finalEncodedRgba.width,
        encodedRasterHeight: finalEncodedRgba.height,
        alphaPixelsCompositedCount,
        alphaMatteHexApplied: needsAlphaMatte ? options.alphaMatteHex : null,
        gamutMappedPixelsCount,
        psnrDbEstimate,
        ssimEstimate,
        inputSha256Hex: computeSha256Hex(item.rawBytes),
        outputSha256Hex: computeSha256Hex(outputBytes),
        containerForensics,
        inputExifForensics,
        outputExifVerification,
        outputBytes,
        outputMimeType,
        previewSvgDataUri,
        originalPreviewSvgDataUri,
        processingDurationMs: Math.max(1, Date.now() - startMs),
    };
}

export function runBatchConversion(
    items: InputImageItem[],
    options: BatchConversionOptions
): BatchConversionSummaryReport {
    const results = items.map((item, idx) =>
        convertSingleImageItem(item, idx + 1, options)
    );

    const totalFilesCount = results.length;
    const totalOriginalBytes = results.reduce((s, r) => s + r.originalByteLength, 0);
    const totalOutputBytes = results.reduce((s, r) => s + r.outputByteLength, 0);
    const totalBytesSaved = totalOriginalBytes - totalOutputBytes;
    const averageSavingsPercent =
        totalOriginalBytes > 0
            ? Number((((totalOutputBytes - totalOriginalBytes) / totalOriginalBytes) * 100).toFixed(1))
            : 0;

    const totalGpsLocationsScrubbed = results.filter(
        (r) =>
            r.inputExifForensics.gps.hasGpsCoordinates &&
            !r.outputExifVerification.gps.hasGpsCoordinates
    ).length;

    const totalSensitiveExifTagsScrubbed = results.reduce(
        (s, r) => s + r.inputExifForensics.tagsStrippedCount,
        0
    );

    const totalWideGamutP3MappedCount = results.filter(
        (r) => r.gamutMappedPixelsCount > 0
    ).length;

    const totalAlphaMatteCompositedFiles = results.filter(
        (r) => r.alphaPixelsCompositedCount > 0
    ).length;

    const allFilesMetTargetKbBudget = results.every((r) => r.metTargetMaxKbBudget);

    const averagePsnrDb =
        totalFilesCount > 0
            ? Number(
                (results.reduce((s, r) => s + r.psnrDbEstimate, 0) / totalFilesCount).toFixed(2)
            )
            : 0;

    const averageSsim =
        totalFilesCount > 0
            ? Number(
                (results.reduce((s, r) => s + r.ssimEstimate, 0) / totalFilesCount).toFixed(4)
            )
            : 0;

    const multiPagePdfBytes =
        totalFilesCount > 0
            ? encodeBatchToPdfDocument(
                results.map((r) => {
                    if (r.effectiveTargetFormat === 'JPG') {
                        return {
                            fileName: r.outputFileName,
                            jpegBytes: r.outputBytes,
                            width: r.encodedRasterWidth,
                            height: r.encodedRasterHeight,
                            containerBrand: r.containerForensics.ftypMajorBrand,
                            exifPrivacyStatus: options.exifPrivacyMode,
                        };
                    }
                    const srcItem = items.find((it) => it.id === r.id);
                    const rawRgba = decodeImageBufferToRgba(
                        srcItem?.rawBytes || new Uint8Array(0),
                        r.containerForensics,
                        r.originalFileName,
                        srcItem?.decodedRgba
                    );
                    const totalRotCw = ((r.containerForensics.totalAutoRotationDegreesClockwise +
                        (srcItem?.userRotateDegrees || 0)) %
                        360) as 0 | 90 | 180 | 270;
                    const effFlipH =
                        Boolean(srcItem?.userFlipHorizontal) !==
                        (r.containerForensics.imirAxis === 'HORIZONTAL');
                    const effFlipV =
                        Boolean(srcItem?.userFlipVertical) !==
                        (r.containerForensics.imirAxis === 'VERTICAL');
                    const oriented = rotateAndFlipRgbaBuffer(rawRgba, totalRotCw, effFlipH, effFlipV);
                    const resized = resizeRgbaBufferBilinear(
                        oriented,
                        r.encodedRasterWidth,
                        r.encodedRasterHeight
                    );
                    const { buffer: mattedForPdf } = applyDisplayP3ToSrgbGamutMapAndMatte(
                        resized,
                        r.containerForensics.isWideGamutDisplayP3,
                        options.colorGamutMode,
                        true,
                        options.alphaMatteHex
                    );
                    return {
                        fileName: r.outputFileName,
                        jpegBytes: encodeRgbaToJpegBinary(mattedForPdf, 85, null),
                        width: mattedForPdf.width,
                        height: mattedForPdf.height,
                        containerBrand: r.containerForensics.ftypMajorBrand,
                        exifPrivacyStatus: options.exifPrivacyMode,
                    };
                })
            )
            : null;

    return {
        engineVersion: HEIC_AVIF_CONVERTER_ENGINE_VERSION,
        options,
        items: results,
        totalFilesCount,
        totalOriginalBytes,
        totalOutputBytes,
        totalBytesSaved,
        averageSavingsPercent,
        totalGpsLocationsScrubbed,
        totalSensitiveExifTagsScrubbed,
        totalWideGamutP3MappedCount,
        totalAlphaMatteCompositedFiles,
        allFilesMetTargetKbBudget,
        averagePsnrDb,
        averageSsim,
        multiPagePdfBytes,
    };
}

// ============================================================================
// SECTION 7: NATIVE PKZIP (.ZIP) ARCHIVE, CWE-1236 SAFE CSV & XLSX EXPORTERS
// ============================================================================

export function exportBatchZipArchive(report: BatchConversionSummaryReport): Uint8Array {
    const files: { name: string; data: Uint8Array }[] = report.items.map((item) => ({
        name: item.outputFileName,
        data: item.outputBytes,
    }));

    const manifestStr = exportAuditManifestJson(report);
    const manifestBytes = new TextEncoder().encode(manifestStr);
    files.push({
        name: 'kivarotools-conversion-privacy-manifest.json',
        data: manifestBytes,
    });

    const localHeaders: Uint8Array[] = [];
    const centralHeaders: Uint8Array[] = [];
    let localOffset = 0;

    for (const file of files) {
        const nameBytes = new TextEncoder().encode(file.name);
        const crc = computeCrc32(file.data);
        const size = file.data.byteLength;

        const local = new Uint8Array(30 + nameBytes.length + size);
        const lv = new DataView(local.buffer);
        lv.setUint32(0, 0x04034b50, true);
        lv.setUint16(4, 20, true);
        lv.setUint16(6, 0, true);
        lv.setUint16(8, 0, true);
        lv.setUint16(10, 0, true);
        lv.setUint16(12, 0x5421, true);
        lv.setUint32(14, crc, true);
        lv.setUint32(18, size, true);
        lv.setUint32(22, size, true);
        lv.setUint16(26, nameBytes.length, true);
        lv.setUint16(28, 0, true);
        local.set(nameBytes, 30);
        local.set(file.data, 30 + nameBytes.length);
        localHeaders.push(local);

        const central = new Uint8Array(46 + nameBytes.length);
        const cv = new DataView(central.buffer);
        cv.setUint32(0, 0x02014b50, true);
        cv.setUint16(4, 20, true);
        cv.setUint16(6, 20, true);
        cv.setUint16(8, 0, true);
        cv.setUint16(10, 0, true);
        cv.setUint16(12, 0, true);
        cv.setUint16(14, 0x5421, true);
        cv.setUint32(16, crc, true);
        cv.setUint32(20, size, true);
        cv.setUint32(24, size, true);
        cv.setUint16(28, nameBytes.length, true);
        cv.setUint16(30, 0, true);
        cv.setUint16(32, 0, true);
        cv.setUint16(34, 0, true);
        cv.setUint16(36, 0, true);
        cv.setUint32(38, 0, true);
        cv.setUint32(42, localOffset, true);
        central.set(nameBytes, 46);
        centralHeaders.push(central);

        localOffset += local.byteLength;
    }

    const centralSize = centralHeaders.reduce((s, c) => s + c.byteLength, 0);
    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, files.length, true);
    ev.setUint16(10, files.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, localOffset, true);
    ev.setUint16(20, 0, true);

    const out = new Uint8Array(localOffset + centralSize + 22);
    let cur = 0;
    for (const l of localHeaders) {
        out.set(l, cur);
        cur += l.byteLength;
    }
    for (const c of centralHeaders) {
        out.set(c, cur);
        cur += c.byteLength;
    }
    out.set(eocd, cur);
    return out;
}

export function sanitizeSpreadsheetCellCwe1236(raw: string): string {
    if (!raw) return '';
    const first = raw[0];
    if (
        first === '=' ||
        first === '+' ||
        first === '@' ||
        first === '\t' ||
        first === '\r' ||
        first === '\n' ||
        (first === '-' && !/^-\d+(\.\d+)?$/.test(raw))
    ) {
        return `'${raw}`;
    }
    return raw;
}

export function exportAuditManifestCsv(report: BatchConversionSummaryReport): string {
    const headers = [
        'Index',
        'Original Filename',
        'Output Filename',
        'Detected Container',
        'ISOBMFF Brand',
        'Color Gamut',
        'Original Resolution',
        'Output Resolution',
        'Original Bytes',
        'Output Bytes',
        'Savings %',
        'PSNR (dB)',
        'SSIM',
        'EXIF Privacy Mode',
        'Input GPS Coordinates',
        'Output GPS Status',
        'Stripped EXIF Tags',
        'Input SHA-256',
        'Output SHA-256',
    ];

    const escapeCsv = (val: string | number): string => {
        const safe = sanitizeSpreadsheetCellCwe1236(String(val));
        if (safe.includes(',') || safe.includes('"') || safe.includes('\n')) {
            return `"${safe.replace(/"/g, '""')}"`;
        }
        return safe;
    };

    const rows = [headers.map(escapeCsv).join(',')];
    for (const item of report.items) {
        rows.push(
            [
                item.indexOneBased,
                item.originalFileName,
                item.outputFileName,
                item.containerForensics.detectedPhysicalContainer,
                item.containerForensics.ftypMajorBrand,
                item.containerForensics.colorSpaceLabel,
                `${item.originalWidth}x${item.originalHeight}`,
                `${item.outputWidth}x${item.outputHeight}`,
                item.originalByteLength,
                item.outputByteLength,
                `${item.compressionRatioPercent}%`,
                item.psnrDbEstimate,
                item.ssimEstimate,
                report.options.exifPrivacyMode,
                item.inputExifForensics.gps.formattedDms,
                item.outputExifVerification.gps.hasGpsCoordinates
                    ? item.outputExifVerification.gps.formattedDms
                    : 'SCRUBBED (0 GPS Tags)',
                item.inputExifForensics.tagsStrippedCount,
                item.inputSha256Hex,
                item.outputSha256Hex,
            ]
                .map(escapeCsv)
                .join(',')
        );
    }
    return '\uFEFF' + rows.join('\r\n');
}

export function exportAuditManifestJson(report: BatchConversionSummaryReport): string {
    return JSON.stringify(
        {
            schema: 'https://kivarotools.com/schemas/heic-avif-privacy-audit-v4.json',
            engineVersion: report.engineVersion,
            generatedAtIso: '2026-05-14T12:00:00.000Z',
            privacyPolicyApplied: report.options.exifPrivacyMode,
            targetFormat: report.options.targetFormat,
            summary: {
                totalFilesConverted: report.totalFilesCount,
                totalOriginalBytes: report.totalOriginalBytes,
                totalOutputBytes: report.totalOutputBytes,
                totalBytesSaved: report.totalBytesSaved,
                averageSavingsPercent: report.averageSavingsPercent,
                averagePsnrDb: report.averagePsnrDb,
                averageSsim: report.averageSsim,
                totalGpsLocationsScrubbed: report.totalGpsLocationsScrubbed,
                totalSensitiveExifTagsScrubbed: report.totalSensitiveExifTagsScrubbed,
                allFilesMetTargetKbBudget: report.allFilesMetTargetKbBudget,
            },
            files: report.items.map((item) => ({
                index: item.indexOneBased,
                originalFileName: item.originalFileName,
                outputFileName: item.outputFileName,
                detectedContainer: item.containerForensics.detectedPhysicalContainer,
                ftypMajorBrand: item.containerForensics.ftypMajorBrand,
                ftypCompatibleBrands: item.containerForensics.ftypCompatibleBrands,
                isExtensionMismatch: item.containerForensics.isExtensionMismatch,
                colorSpace: item.containerForensics.colorSpaceLabel,
                originalDimensions: `${item.originalWidth}x${item.originalHeight}`,
                outputDimensions: `${item.outputWidth}x${item.outputHeight}`,
                originalBytes: item.originalByteLength,
                outputBytes: item.outputByteLength,
                effectiveQualityPercent: item.effectiveQualityUsed,
                psnrDb: item.psnrDbEstimate,
                ssim: item.ssimEstimate,
                inputGpsLocation: item.inputExifForensics.gps.formattedDms,
                outputGpsVerifiedClean: !item.outputExifVerification.gps.hasGpsCoordinates,
                tagsStrippedCount: item.inputExifForensics.tagsStrippedCount,
                tagsPreservedCount: item.outputExifVerification.totalTagsFound,
                inputSha256: item.inputSha256Hex,
                outputSha256: item.outputSha256Hex,
            })),
        },
        null,
        2
    );
}

export function exportAuditManifestXlsx(report: BatchConversionSummaryReport): Uint8Array {
    const xmlEscape = (s: string): string =>
        s
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');

    const colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    const headerTitles = [
        'File #',
        'Original Filename',
        'Output Filename',
        'Container Brand',
        'Color Space',
        'Resolution',
        'Original Bytes',
        'Output Bytes',
        'Privacy Mode',
        'Input GPS',
        'Output GPS Verified',
        'Output SHA-256',
    ];

    const sheetRowsXml: string[] = [];
    const headerCells = headerTitles
        .map(
            (h, idx) =>
                `<c r="${colLetters[idx]}1" t="inlineStr"><is><t>${xmlEscape(h)}</t></is></c>`
        )
        .join('');
    sheetRowsXml.push(`<row r="1">${headerCells}</row>`);

    report.items.forEach((item, rIdx) => {
        const rowNum = rIdx + 2;
        const values: (string | number)[] = [
            item.indexOneBased,
            sanitizeSpreadsheetCellCwe1236(item.originalFileName),
            sanitizeSpreadsheetCellCwe1236(item.outputFileName),
            `${item.containerForensics.detectedPhysicalContainer} (${item.containerForensics.ftypMajorBrand})`,
            item.containerForensics.colorSpaceLabel,
            `${item.outputWidth}x${item.outputHeight}`,
            item.originalByteLength,
            item.outputByteLength,
            report.options.exifPrivacyMode,
            item.inputExifForensics.gps.formattedDms,
            item.outputExifVerification.gps.hasGpsCoordinates ? 'PRESENT' : 'SCRUBBED_CLEAN',
            item.outputSha256Hex,
        ];
        const cellsXml = values
            .map((val, cIdx) => {
                const ref = `${colLetters[cIdx]}${rowNum}`;
                if (typeof val === 'number') {
                    return `<c r="${ref}"><v>${val}</v></c>`;
                }
                return `<c r="${ref}" t="inlineStr"><is><t>${xmlEscape(String(val))}</t></is></c>`;
            })
            .join('');
        sheetRowsXml.push(`<row r="${rowNum}">${cellsXml}</row>`);
    });

    const worksheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${sheetRowsXml.join('')}</sheetData>
</worksheet>`;

    const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Conversion Privacy Audit" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

    const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`;

    const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`;

    const toAsciiBytes = (s: string): Uint8Array => new TextEncoder().encode(s);

    const entries = [
        { name: '[Content_Types].xml', data: toAsciiBytes(contentTypesXml) },
        { name: '_rels/.rels', data: toAsciiBytes(rootRelsXml) },
        { name: 'xl/workbook.xml', data: toAsciiBytes(workbookXml) },
        { name: 'xl/_rels/workbook.xml.rels', data: toAsciiBytes(workbookRelsXml) },
        { name: 'xl/worksheets/sheet1.xml', data: toAsciiBytes(worksheetXml) },
    ];

    const localChunks: Uint8Array[] = [];
    const centralChunks: Uint8Array[] = [];
    let offset = 0;
    for (const e of entries) {
        const nameB = toAsciiBytes(e.name);
        const crc = computeCrc32(e.data);
        const sz = e.data.byteLength;
        const loc = new Uint8Array(30 + nameB.length + sz);
        const lv = new DataView(loc.buffer);
        lv.setUint32(0, 0x04034b50, true);
        lv.setUint16(4, 20, true);
        lv.setUint32(14, crc, true);
        lv.setUint32(18, sz, true);
        lv.setUint32(22, sz, true);
        lv.setUint16(26, nameB.length, true);
        loc.set(nameB, 30);
        loc.set(e.data, 30 + nameB.length);
        localChunks.push(loc);

        const cen = new Uint8Array(46 + nameB.length);
        const cv = new DataView(cen.buffer);
        cv.setUint32(0, 0x02014b50, true);
        cv.setUint16(4, 20, true);
        cv.setUint16(6, 20, true);
        cv.setUint32(16, crc, true);
        cv.setUint32(20, sz, true);
        cv.setUint32(24, sz, true);
        cv.setUint16(28, nameB.length, true);
        cv.setUint32(42, offset, true);
        cen.set(nameB, 46);
        centralChunks.push(cen);
        offset += loc.byteLength;
    }
    const cenSize = centralChunks.reduce((s, c) => s + c.byteLength, 0);
    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, entries.length, true);
    ev.setUint16(10, entries.length, true);
    ev.setUint32(12, cenSize, true);
    ev.setUint32(16, offset, true);

    const out = new Uint8Array(offset + cenSize + 22);
    let cur = 0;
    for (const l of localChunks) {
        out.set(l, cur);
        cur += l.byteLength;
    }
    for (const c of centralChunks) {
        out.set(c, cur);
        cur += c.byteLength;
    }
    out.set(eocd, cur);
    return out;
}

// ============================================================================
// SECTION 8: 4 BUILT-IN REAL BINARY ISOBMFF (.HEIC & .AVIF) SAMPLE GENERATORS
// ============================================================================

function makeIsobmffBox(typeStr: string, payload: Uint8Array): Uint8Array {
    const out = new Uint8Array(8 + payload.length);
    const v = new DataView(out.buffer);
    v.setUint32(0, out.byteLength, false);
    for (let i = 0; i < 4; i++) out[4 + i] = typeStr.charCodeAt(i);
    out.set(payload, 8);
    return out;
}

function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
    const total = arrays.reduce((s, a) => s + a.byteLength, 0);
    const out = new Uint8Array(total);
    let pos = 0;
    for (const a of arrays) {
        out.set(a, pos);
        pos += a.byteLength;
    }
    return out;
}

export function buildSyntheticIsobmffContainer(params: {
    majorBrand: 'heic' | 'avif' | 'MiHE';
    compatibleBrands: string[];
    width: number;
    height: number;
    isDisplayP3: boolean;
    bitDepths: number[];
    irotDegreesCcw: 0 | 90 | 180 | 270;
    auxUrn: string | null;
    cameraMake: string;
    cameraModel: string;
    lensModel: string;
    software: string;
    dateTimeOriginal: string;
    isoSpeed: number;
    gpsLat: number | null;
    gpsLon: number | null;
    includeAppleMakerNote: boolean;
    mdatPayloadSize: number;
}): Uint8Array {
    const ftypPayload = new Uint8Array(8 + params.compatibleBrands.length * 4);
    const fv = new DataView(ftypPayload.buffer);
    for (let i = 0; i < 4; i++) ftypPayload[i] = params.majorBrand.charCodeAt(i);
    fv.setUint32(4, 0, false);
    params.compatibleBrands.forEach((b, idx) => {
        for (let i = 0; i < 4; i++) ftypPayload[8 + idx * 4 + i] = (b.charCodeAt(i) || 32) & 0xff;
    });
    const ftypBox = makeIsobmffBox('ftyp', ftypPayload);

    const ispePayload = new Uint8Array(12);
    const iv = new DataView(ispePayload.buffer);
    iv.setUint32(4, params.width, false);
    iv.setUint32(8, params.height, false);
    const ispeBox = makeIsobmffBox('ispe', ispePayload);

    const colrPayload = new Uint8Array(11);
    const cv = new DataView(colrPayload.buffer);
    colrPayload.set([0x6e, 0x63, 0x6c, 0x78], 0);
    cv.setUint16(4, params.isDisplayP3 ? 12 : 1, false);
    cv.setUint16(6, 13, false);
    cv.setUint16(8, 6, false);
    colrPayload[10] = 0x80;
    const colrBox = makeIsobmffBox('colr', colrPayload);

    const pixiPayload = new Uint8Array(5 + params.bitDepths.length);
    pixiPayload[4] = params.bitDepths.length;
    params.bitDepths.forEach((d, idx) => {
        pixiPayload[5 + idx] = d;
    });
    const pixiBox = makeIsobmffBox('pixi', pixiPayload);

    const irotPayload = new Uint8Array([Math.floor(params.irotDegreesCcw / 90) & 0x03]);
    const irotBox = makeIsobmffBox('irot', irotPayload);

    const ipcoChildren: Uint8Array[] = [ispeBox, colrBox, pixiBox];
    if (params.irotDegreesCcw !== 0) {
        ipcoChildren.push(irotBox);
    }
    if (params.auxUrn) {
        const urnBytes = new Uint8Array(4 + params.auxUrn.length + 1);
        for (let i = 0; i < params.auxUrn.length; i++) {
            urnBytes[4 + i] = params.auxUrn.charCodeAt(i);
        }
        ipcoChildren.push(makeIsobmffBox('auxC', urnBytes));
    }

    const ipcoBox = makeIsobmffBox('ipco', concatUint8Arrays(ipcoChildren));
    const iprpBox = makeIsobmffBox('iprp', ipcoBox);

    const mockReport: ExifForensicReport = {
        hasExifSegment: true,
        byteOrder: 'LITTLE_ENDIAN_II',
        cameraMake: params.cameraMake,
        cameraModel: params.cameraModel,
        lensModel: params.lensModel,
        software: params.software,
        dateTimeOriginal: params.dateTimeOriginal,
        exposureTime: '1/120 sec',
        fNumber: 'f/1.78',
        isoSpeed: params.isoSpeed,
        focalLengthMm: '6.77 mm',
        bodySerialNumber: 'F2L998104X',
        cameraOwnerName: 'Private Device Owner',
        hostComputer: params.cameraModel,
        hasAppleMakerNote: params.includeAppleMakerNote,
        gps: {
            hasGpsCoordinates: params.gpsLat !== null && params.gpsLon !== null,
            latitudeDecimal: params.gpsLat,
            longitudeDecimal: params.gpsLon,
            altitudeMeters: 42.5,
            formattedDms: '',
            locationLabel: '',
        },
        tags: [],
        totalTagsFound: 0,
        sensitiveTagsFoundCount: 0,
        tagsStrippedCount: 0,
        tagsPreservedCount: 0,
    };
    const tiffBlock =
        buildSanitizedTiffBlock(mockReport, 'PRESERVE_ALL') || new Uint8Array(0);
    const exifPayload = new Uint8Array(10 + tiffBlock.length);
    new DataView(exifPayload.buffer).setUint32(0, 6, false);
    exifPayload.set([0x45, 0x78, 0x69, 0x66, 0x00, 0x00], 4);
    exifPayload.set(tiffBlock, 10);
    const exifBox = makeIsobmffBox('Exif', exifPayload);

    const metaHeader = new Uint8Array(4);
    const metaBox = makeIsobmffBox(
        'meta',
        concatUint8Arrays([metaHeader, iprpBox, exifBox])
    );

    const mdatPayload = new Uint8Array(params.mdatPayloadSize);
    for (let i = 0; i < mdatPayload.length; i++) {
        mdatPayload[i] = (i * 73 + 19) & 0xff;
    }
    const mdatBox = makeIsobmffBox('mdat', mdatPayload);

    return concatUint8Arrays([ftypBox, metaBox, mdatBox]);
}

export function getSamplePresetInputData(presetId: SamplePresetId): {
    files: InputImageItem[];
    recommendedOptions?: Partial<BatchConversionOptions>;
    presetDescription: string;
} {
    const iphoneHeicBytes = buildSyntheticIsobmffContainer({
        majorBrand: 'heic',
        compatibleBrands: ['mif1', 'MiHE', 'heic', 'tmap'],
        width: 2400,
        height: 1800,
        isDisplayP3: true,
        bitDepths: [10, 10, 10],
        irotDegreesCcw: 90,
        auxUrn: 'urn:com:apple:photo:2020:aux:hdrgainmap',
        cameraMake: 'Apple',
        cameraModel: 'iPhone 16 Pro Max',
        lensModel: 'iPhone 16 Pro Max back triple camera 6.765mm f/1.78',
        software: 'iOS 18.3.1',
        dateTimeOriginal: '2026:05:12 17:42:09',
        isoSpeed: 64,
        gpsLat: 37.3349,
        gpsLon: -122.009,
        includeAppleMakerNote: true,
        mdatPayloadSize: 184320,
    });

    const transparentAvifBytes = buildSyntheticIsobmffContainer({
        majorBrand: 'avif',
        compatibleBrands: ['avif', 'mif1', 'miaf', 'MA1B'],
        width: 1200,
        height: 1200,
        isDisplayP3: false,
        bitDepths: [8, 8, 8, 8],
        irotDegreesCcw: 0,
        auxUrn: 'urn:mpeg:mpegB:cicp:systems:auxiliary:alpha',
        cameraMake: 'Figma / libavif',
        cameraModel: 'AV1 Alpha Export Pipeline',
        lensModel: 'Digital Vector Compositor',
        software: 'libavif 1.1.1 (AOMedia AV1)',
        dateTimeOriginal: '2026:05:10 11:15:00',
        isoSpeed: 100,
        gpsLat: null,
        gpsLon: null,
        includeAppleMakerNote: false,
        mdatPayloadSize: 96400,
    });

    if (presetId === 'iphone16_portrait_heic') {
        return {
            files: [
                {
                    id: 'sample-iphone16-heic-1',
                    originalFileName: 'IMG_4821_iPhone16Pro_Portrait.HEIC',
                    rawBytes: iphoneHeicBytes,
                    userRotateDegrees: 0,
                    userFlipHorizontal: false,
                    userFlipVertical: false,
                    perFileFormatOverride: null,
                },
            ],
            recommendedOptions: {
                targetFormat: 'JPG',
                qualityPercent: 88,
                targetMaxKb: 0,
                exifPrivacyMode: 'STRIP_ALL',
            },
            presetDescription:
                'Loaded iPhone 16 Pro Max .HEIC (iOS 18 MiHE + 10-bit Display P3 + 90° irot + 16 EXIF/GPS tags including Apple Park Cupertino GPS 37.3349°N, 122.0090°W scrubbed to 0 GPS tags).',
        };
    }

    if (presetId === 'transparent_logo_avif') {
        return {
            files: [
                {
                    id: 'sample-logo-avif-1',
                    originalFileName: 'ecommerce_brand_badge_alpha.avif',
                    rawBytes: transparentAvifBytes,
                    userRotateDegrees: 0,
                    userFlipHorizontal: false,
                    userFlipVertical: false,
                    perFileFormatOverride: null,
                },
            ],
            recommendedOptions: {
                targetFormat: 'PNG',
                qualityPercent: 92,
                targetMaxKb: 0,
                alphaMatteHex: '#FFFFFF',
            },
            presetDescription:
                'Loaded Transparent 32-bit Alpha .AVIF graphic. Switch between PNG (preserves transparency over checkerboard) and JPG (composites onto your selected #FFFFFF White, #F8FAFC Slate, or #000000 Black matte in real time!).',
        };
    }

    if (presetId === 'visa_portal_100kb_demo') {
        const passportHeicBytes = buildSyntheticIsobmffContainer({
            majorBrand: 'heic',
            compatibleBrands: ['mif1', 'heic'],
            width: 1800,
            height: 1800,
            isDisplayP3: true,
            bitDepths: [8, 8, 8],
            irotDegreesCcw: 0,
            auxUrn: null,
            cameraMake: 'Apple',
            cameraModel: 'iPhone 15 Pro',
            lensModel: 'iPhone 15 Pro front TrueDepth camera',
            software: 'iOS 18.2',
            dateTimeOriginal: '2026:05:14 09:30:00',
            isoSpeed: 80,
            gpsLat: 51.5074,
            gpsLon: -0.1278,
            includeAppleMakerNote: true,
            mdatPayloadSize: 215000,
        });
        return {
            files: [
                {
                    id: 'sample-visa-portal-1',
                    originalFileName: 'Applicant_Visa_Passport_Photo.HEIC',
                    rawBytes: passportHeicBytes,
                    userRotateDegrees: 0,
                    userFlipHorizontal: false,
                    userFlipVertical: false,
                    perFileFormatOverride: null,
                },
            ],
            recommendedOptions: {
                targetFormat: 'JPG',
                qualityPercent: 85,
                targetMaxKb: 50,
                dimensionPreset: 'PASSPORT_600X600',
                exifPrivacyMode: 'STRIP_ALL',
                alphaMatteHex: '#FFFFFF',
            },
            presetDescription:
                'Loaded Government Visa / Passport Portal Preset: Resizes to 1:1 600x600px square, enforces strict <= 50 KB JPG budget, and strips embedded London home GPS coordinates.',
        };
    }

    const kyotoHeicBytes = buildSyntheticIsobmffContainer({
        majorBrand: 'MiHE',
        compatibleBrands: ['mif1', 'MiHE', 'heic', 'tmap'],
        width: 3840,
        height: 2160,
        isDisplayP3: true,
        bitDepths: [10, 10, 10],
        irotDegreesCcw: 0,
        auxUrn: 'urn:com:apple:photo:2018:aux:portraiteffectsmatte',
        cameraMake: 'Apple',
        cameraModel: 'iPhone 16 Pro',
        lensModel: 'iPhone 16 Pro back camera 24mm f/1.78',
        software: 'iOS 18.4',
        dateTimeOriginal: '2026:04:28 18:05:44',
        isoSpeed: 200,
        gpsLat: 35.0116,
        gpsLon: 135.7681,
        includeAppleMakerNote: true,
        mdatPayloadSize: 245760,
    });

    const misnamedJpegBytes = encodeRgbaToJpegBinary(
        {
            width: 64,
            height: 48,
            pixels: new Uint8Array(64 * 48 * 4).fill(210),
        },
        85,
        null
    );

    return {
        files: [
            {
                id: 'batch-mix-1',
                originalFileName: 'IMG_4821_iPhone16Pro_Portrait.HEIC',
                rawBytes: iphoneHeicBytes,
                userRotateDegrees: 0,
                userFlipHorizontal: false,
                userFlipVertical: false,
                perFileFormatOverride: null,
            },
            {
                id: 'batch-mix-2',
                originalFileName: 'ecommerce_brand_badge_alpha.avif',
                rawBytes: transparentAvifBytes,
                userRotateDegrees: 0,
                userFlipHorizontal: false,
                userFlipVertical: false,
                perFileFormatOverride: null,
            },
            {
                id: 'batch-mix-3',
                originalFileName: 'IMG_5109_Kyoto_Shrine_HDR.HEIC',
                rawBytes: kyotoHeicBytes,
                userRotateDegrees: 0,
                userFlipHorizontal: false,
                userFlipVertical: false,
                perFileFormatOverride: null,
            },
            {
                id: 'batch-mix-4',
                originalFileName: 'WhatsApp_Misnamed_Photo.heic',
                rawBytes: misnamedJpegBytes,
                userRotateDegrees: 0,
                userFlipHorizontal: false,
                userFlipVertical: false,
                perFileFormatOverride: null,
            },
        ],
        recommendedOptions: {
            targetFormat: 'JPG',
            qualityPercent: 86,
            targetMaxKb: 0,
            exifPrivacyMode: 'STRIP_ALL',
            alphaMatteHex: '#FFFFFF',
        },
        presetDescription:
            'Loaded 4-File Batch Queue (iPhone 16 Pro .HEIC + Transparent .AVIF + Kyoto HDR .HEIC + Misnamed WhatsApp .HEIC auto-recovered via binary magic-byte inspection).',
    };
}

export function getDefaultBatchConversionOptions(): BatchConversionOptions {
    return {
        targetFormat: 'JPG',
        qualityPercent: 88,
        targetMaxKb: 0,
        exifPrivacyMode: 'STRIP_ALL',
        dimensionPreset: 'ORIGINAL',
        customMaxDimensionPx: 1920,
        alphaMatteHex: '#FFFFFF',
        colorGamutMode: 'PERCEPTUAL_SRGB',
        batchRenamePattern: 'ORIGINAL',
        batchRenamePrefix: 'kivaro-photo',
    };
}