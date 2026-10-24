/**
 * KivaroTools Base64 Engine
 *
 * Core pure-function engine for Base64 encoding, decoding, validation,
 * Data URI parsing, URL-safe translation, and MIME detection.
 *
 * Standards Compliance: RFC 4648 (Base64 & Base64URL)
 */

export type DataUriInfo = { mime: string; isBase64: boolean; payload: string };
export type MimeDetection = { mime: string; confidence: 'high' | 'medium' | 'low' };

type NativeBase64 = {
  toBase64?: (options?: { alphabet?: 'base64' | 'base64url'; omitPadding?: boolean }) => string;
};
type NativeFromBase64 = {
  fromBase64?: (value: string, options?: {
    alphabet?: 'base64' | 'base64url';
    lastChunkHandling?: 'loose' | 'strict' | 'stop-before-partial';
  }) => Uint8Array;
};

export const MAX_FILE = 25 * 1024 * 1024;
export const MAX_TEXT = 12 * 1024 * 1024;

export const MIME_EXT: Record<string, string> = {
  'application/pdf': '.pdf', 'application/json': '.json', 'application/zip': '.zip',
  'application/octet-stream': '.bin', 'text/plain': '.txt', 'text/csv': '.csv',
  'text/html': '.html', 'text/css': '.css', 'text/javascript': '.js',
  'application/javascript': '.js', 'application/xml': '.xml', 'text/xml': '.xml',
  'image/png': '.png', 'image/jpeg': '.jpg', 'image/gif': '.gif', 'image/webp': '.webp',
  'image/svg+xml': '.svg', 'audio/mpeg': '.mp3', 'video/mp4': '.mp4', 'audio/wav': '.wav',
  'audio/ogg': '.ogg', 'video/webm': '.webm'
};

export const isSafePreviewImage = (mime: string): boolean =>
  /^(?:image\/(?:png|jpeg|jpg|gif|webp|bmp|ico|avif))$/i.test(mime.trim());

/**
 * Encodes Uint8Array bytes to Base64 or Base64URL.
 */
export const bytesToBase64 = (bytes: Uint8Array, urlSafe = false, omitPadding = false): string => {
  const native = (Uint8Array.prototype as Uint8Array & NativeBase64).toBase64;
  if (native) {
    try {
      return native.call(bytes, { alphabet: urlSafe ? 'base64url' : 'base64', omitPadding });
    } catch {
      // Fall through to stack-safe chunked implementation
    }
  }

  // Safe chunked encoding: 6144 is a multiple of 3 and prevents stack overflow
  const CHUNK_SIZE = 6144;
  const len = bytes.length;
  const chunks: string[] = [];

  for (let i = 0; i < len; i += CHUNK_SIZE) {
    const end = Math.min(i + CHUNK_SIZE, len);
    const slice = bytes.subarray(i, end);
    let binStr = '';
    for (let j = 0; j < slice.length; j += 1024) {
      const sub = slice.subarray(j, Math.min(j + 1024, slice.length));
      for (let k = 0; k < sub.length; k++) binStr += String.fromCharCode(sub[k]);
    }
    chunks.push(btoa(binStr));
  }

  let result = chunks.join('');
  if (urlSafe) result = result.replace(/\+/g, '-').replace(/\//g, '_');
  if (omitPadding) result = result.replace(/=+$/g, '');
  return result;
};

/**
 * Encodes plain Unicode text to Base64 or Base64URL using UTF-8 bytes.
 */
export const textToBase64 = (text: string, urlSafe = false, omitPadding = false): string => {
  const bytes = new TextEncoder().encode(text);
  return bytesToBase64(bytes, urlSafe, omitPadding);
};

/**
 * Parses RFC 2397 Data URI.
 */
export const parseDataUri = (value: string): DataUriInfo | null => {
  const trimmed = value.trim();
  if (!/^data:/i.test(trimmed)) return null;
  const comma = trimmed.indexOf(',');
  if (comma < 0) throw new Error('Invalid Data URI: missing comma separator.');

  const meta = trimmed.slice(5, comma);
  const payload = trimmed.slice(comma + 1);
  const parts = meta.split(';');
  const rawMime = parts.shift()?.trim().toLowerCase() || 'text/plain';
  const isBase64 = parts.some(p => p.trim().toLowerCase() === 'base64');

  if (!isBase64) throw new Error('This Data URI is not Base64-encoded. Expected a ;base64 parameter.');
  if (!/^[a-z][a-z0-9+.-]*\/[a-z0-9!#$&^_.+-]+$/i.test(rawMime)) {
    throw new Error('Invalid Data URI media type.');
  }
  return { mime: rawMime, isBase64, payload };
};

/**
 * Normalizes and validates Base64 input.
 *
 * Requirements:
 * - Rejects any characters not in the Base64/Base64URL alphabet (e.g. `*`, `!`, `@`).
 * - Allows standard whitespace (spaces, tabs, newlines) per MIME/PEM standards.
 * - Restores omitted padding in tolerant mode.
 * - Rejects malformed padding (e.g. padding in the middle, >2 equals signs, incorrect pad count).
 * - Enforces RFC 4648 canonical pad bits when strict = true.
 */
export const normalizeBase64 = (
  value: string,
  strict = false
): { normalized: string; dataUri: DataUriInfo | null } => {
  const dataUri = parseDataUri(value);
  let s = (dataUri ? dataUri.payload : value).trim();

  // Strip allowed whitespace (spaces, tabs, newlines, CRLF)
  s = s.replace(/\s+/g, '');
  if (!s) return { normalized: '', dataUri };

  // Reject any characters outside the standard or URL-safe Base64 alphabet and padding
  if (/[^A-Za-z0-9+/=_-]/.test(s)) {
    throw new Error('Invalid Base64 input: contains invalid characters.');
  }

  // Convert URL-safe characters (- and _) to standard (+ and /)
  s = s.replace(/-/g, '+').replace(/_/g, '/');

  // Check padding character (=) placement: padding is only allowed at the end
  const padMatch = s.match(/=+$/);
  const padCount = padMatch ? padMatch[0].length : 0;
  const firstPad = s.indexOf('=');

  if (firstPad >= 0 && firstPad !== s.length - padCount) {
    throw new Error('Invalid Base64 padding: padding characters (=) are only allowed at the end.');
  }

  if (padCount > 2) {
    throw new Error('Invalid Base64 padding: cannot have more than 2 padding characters.');
  }

  const unpaddedLength = s.length - padCount;
  if (unpaddedLength === 0) {
    throw new Error('Invalid Base64 input: contains only padding.');
  }

  // Modulo 4 === 1 is mathematically impossible in Base64 (1 char = 6 bits, less than 1 byte)
  if (unpaddedLength % 4 === 1) {
    throw new Error('Invalid Base64 length: truncated input cannot have length modulo 4 equal to 1.');
  }

  const expectedPadCount = (4 - (unpaddedLength % 4)) % 4;
  if (padCount > 0 && padCount !== expectedPadCount) {
    throw new Error('Invalid Base64 padding: incorrect padding length.');
  }

  // Restore omitted padding if needed (e.g. for URL-safe unpadded strings)
  if (padCount === 0 && expectedPadCount > 0) {
    s += '='.repeat(expectedPadCount);
  }

  if (strict) {
    // RFC 4648 canonical pad-bit validation (unused bits must be zero)
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    if (unpaddedLength % 4 === 2) {
      const v = alphabet.indexOf(s[unpaddedLength - 1]);
      if (v < 0 || (v & 0x0f) !== 0) throw new Error('Non-canonical Base64: unused pad bits are not zero.');
    } else if (unpaddedLength % 4 === 3) {
      const v = alphabet.indexOf(s[unpaddedLength - 1]);
      if (v < 0 || (v & 0x03) !== 0) throw new Error('Non-canonical Base64: unused pad bits are not zero.');
    }
  }

  return { normalized: s, dataUri };
};

/**
 * Decodes Base64 or Base64URL string to Uint8Array bytes.
 */
export const base64ToBytes = (value: string, strict = false): Uint8Array => {
  const { normalized } = normalizeBase64(value, strict);
  if (!normalized) return new Uint8Array();

  const native = (Uint8Array as typeof Uint8Array & NativeFromBase64).fromBase64;
  if (native && strict) {
    try {
      return native(normalized, { alphabet: 'base64', lastChunkHandling: 'strict' });
    } catch {
      // Fall through to atob fallback
    }
  }

  try {
    const bin = atob(normalized);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  } catch {
    throw new Error('Invalid Base64 payload.');
  }
};

/**
 * Decodes Base64 string directly to UTF-8 text. Throws if invalid UTF-8.
 */
export const base64ToText = (value: string, strict = false): string => {
  const bytes = base64ToBytes(value, strict);
  if (bytes.length === 0) return '';
  return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
};

export const fmt = (n: number): string => {
  if (!n) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
  return `${(n / 1024 ** i).toFixed(i ? 2 : 0)} ${units[i]}`;
};

const ascii = (b: Uint8Array, start: number, length: number): string => {
  let res = '';
  for (let i = start; i < start + length; i++) res += String.fromCharCode(b[i]);
  return res;
};

export const inferMime = (b: Uint8Array): MimeDetection => {
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return { mime: 'image/png', confidence: 'high' };
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { mime: 'image/jpeg', confidence: 'high' };
  if (b.length >= 6 && (ascii(b, 0, 6) === 'GIF87a' || ascii(b, 0, 6) === 'GIF89a')) return { mime: 'image/gif', confidence: 'high' };
  if (b.length >= 12 && ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 4) === 'WEBP') return { mime: 'image/webp', confidence: 'high' };
  if (b.length >= 4 && ascii(b, 0, 4) === '%PDF') return { mime: 'application/pdf', confidence: 'high' };
  if (b.length >= 4 && b[0] === 0x50 && b[1] === 0x4b && ((b[2] === 0x03 && b[3] === 0x04) || (b[2] === 0x05 && b[3] === 0x06) || (b[2] === 0x07 && b[3] === 0x08))) return { mime: 'application/zip', confidence: 'high' };
  if (b.length >= 12 && ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 4) === 'WAVE') return { mime: 'audio/wav', confidence: 'high' };
  if (b.length >= 4 && ascii(b, 0, 4) === 'OggS') return { mime: 'audio/ogg', confidence: 'high' };
  if (b.length >= 8 && ascii(b, 4, 4) === 'ftyp') return { mime: 'video/mp4', confidence: 'high' };

  const sample = b.slice(0, 8192);
  let text = '';
  try {
    text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(sample).replace(/^\uFEFF/, '').trim();
  } catch {
    return { mime: 'application/octet-stream', confidence: 'low' };
  }

  if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))) {
    try {
      JSON.parse(text);
      return { mime: 'application/json', confidence: 'high' };
    } catch {}
  }

  if (/<svg(?:\s|>)/i.test(text) && (text.startsWith('<svg') || text.startsWith('<?xml') || text.includes('xmlns="http://www.w3.org/2000/svg"'))) {
    return { mime: 'image/svg+xml', confidence: 'high' };
  }

  if (/^<!doctype\s+html(?:\s|>)/i.test(text) || /^<html(?:\s|>)/i.test(text) || /<body(?:\s|>)/i.test(text)) {
    return { mime: 'text/html', confidence: 'high' };
  }

  if (/^<\?xml(?:\s|>)/i.test(text) || /^<[a-zA-Z0-9:_-]+(?:\s+[^>]*)?>[\s\S]*<\/[a-zA-Z0-9:_-]+>$/i.test(text)) {
    return { mime: 'application/xml', confidence: 'medium' };
  }

  if (/^(?:@charset|@import|@media|:[a-z]|(?:\.[a-zA-Z0-9_-]+|#[a-zA-Z0-9_-]+|[a-zA-Z0-9_-]+)\s*\{[\s\S]*\})/.test(text)) {
    return { mime: 'text/css', confidence: 'medium' };
  }

  if (/^(?:import\s+|export\s+|function\s+|const\s+|let\s+|var\s+|"use strict"|'use strict')/.test(text)) {
    return { mime: 'text/javascript', confidence: 'medium' };
  }

  if (text.includes(',') && text.includes('\n')) {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    if (lines.length >= 2) {
      const colCount = lines[0].split(',').length;
      if (colCount >= 2 && lines.slice(1, 4).every(l => l.split(',').length === colCount)) {
        return { mime: 'text/csv', confidence: 'medium' };
      }
    }
  }

  return { mime: 'text/plain', confidence: 'low' };
};

export const isTextMime = (m: string): boolean => m.startsWith('text/') || /json|javascript|xml|csv/.test(m);
export const ext = (m: string): string => MIME_EXT[m.toLowerCase()] || '';

export const wrap = (s: string, width: number): string => {
  if (!width || width <= 0) return s;
  const rows: string[] = [];
  for (let i = 0; i < s.length; i += width) rows.push(s.slice(i, i + width));
  return rows.join('\n');
};

export const sameBytes = (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
};

export const safeName = (name: string): string =>
  name.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').slice(0, 180) || 'decoded-file';
