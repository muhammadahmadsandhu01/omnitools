'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle, ArrowDownToLine, ArrowRightLeft, Check, Clipboard,
  Download, FileCode2, FileText, Info, Lock, RefreshCw, Trash2,
  UploadCloud, X, Zap
} from 'lucide-react';

type Mode = 'text' | 'file';
type Operation = 'encode' | 'decode';
type EncodeOutput = 'base64' | 'data-uri';
type DecodeMode = 'text' | 'file' | 'auto';

const MAX_FILE = 25 * 1024 * 1024;
const MAX_TEXT = 12 * 1024 * 1024;

const MIME_EXT: Record<string, string> = {
  'application/pdf': '.pdf', 'application/json': '.json', 'application/zip': '.zip',
  'application/octet-stream': '.bin', 'text/plain': '.txt', 'text/csv': '.csv',
  'text/html': '.html', 'text/css': '.css', 'text/javascript': '.js',
  'application/javascript': '.js', 'application/xml': '.xml', 'text/xml': '.xml',
  'image/png': '.png', 'image/jpeg': '.jpg', 'image/gif': '.gif', 'image/webp': '.webp',
  'image/svg+xml': '.svg', 'audio/mpeg': '.mp3', 'video/mp4': '.mp4', 'audio/wav': '.wav',
  'audio/ogg': '.ogg', 'video/webm': '.webm'
};

type DataUriInfo = { mime: string; isBase64: boolean; payload: string };
type MimeDetection = { mime: string; confidence: 'high' | 'medium' | 'low' };

type NativeBase64 = {
  toBase64?: (options?: { alphabet?: 'base64' | 'base64url'; omitPadding?: boolean }) => string;
};
type NativeFromBase64 = {
  fromBase64?: (value: string, options?: {
    alphabet?: 'base64' | 'base64url';
    lastChunkHandling?: 'loose' | 'strict' | 'stop-before-partial';
  }) => Uint8Array;
};

const isSafePreviewImage = (mime: string) =>
  /^(?:image\/(?:png|jpeg|jpg|gif|webp|bmp|ico|avif))$/i.test(mime.trim());

const bytesToBase64 = (bytes: Uint8Array, urlSafe = false, omitPadding = false) => {
  const native = (Uint8Array.prototype as Uint8Array & NativeBase64).toBase64;
  if (native) {
    try {
      return native.call(bytes, { alphabet: urlSafe ? 'base64url' : 'base64', omitPadding });
    } catch {
      // Fall through to stack-safe fallback
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
    // Sub-slices of 1024 ensure zero stack overflow across all browser engines
    for (let j = 0; j < slice.length; j += 1024) {
      const sub = slice.subarray(j, Math.min(j + 1024, slice.length));
      binStr += String.fromCharCode(...sub);
    }
    chunks.push(btoa(binStr));
  }

  let result = chunks.join('');
  if (urlSafe) result = result.replace(/\+/g, '-').replace(/\//g, '_');
  if (omitPadding) result = result.replace(/=+$/g, '');
  return result;
};

const parseDataUri = (value: string): DataUriInfo | null => {
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

const normalizeBase64 = (value: string) => {
  const dataUri = parseDataUri(value);
  let s = (dataUri ? dataUri.payload : value).trim();
  s = s.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  if (!s) return { normalized: '', dataUri };
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(s) || s.length % 4 === 1) {
    throw new Error('Invalid Base64 characters, padding, or length.');
  }

  const padMatch = s.match(/=+$/);
  const padCount = padMatch?.[0].length || 0;
  const firstPad = s.indexOf('=');
  if (firstPad >= 0 && firstPad !== s.length - padCount) {
    throw new Error('Base64 padding is only allowed at the end.');
  }
  if (padCount > 2 || (padCount > 0 && s.length % 4 !== 0)) {
    throw new Error('Invalid Base64 padding.');
  }

  const unpaddedLength = s.length - padCount;
  s += '='.repeat((4 - s.length % 4) % 4);

  // RFC 4648 canonical pad-bit validation
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  if (unpaddedLength % 4 === 2) {
    const v = alphabet.indexOf(s[unpaddedLength - 1]);
    if (v < 0 || (v & 0x0f) !== 0) throw new Error('Non-canonical Base64: unused pad bits are not zero.');
  } else if (unpaddedLength % 4 === 3) {
    const v = alphabet.indexOf(s[unpaddedLength - 1]);
    if (v < 0 || (v & 0x03) !== 0) throw new Error('Non-canonical Base64: unused pad bits are not zero.');
  }

  return { normalized: s, dataUri };
};

const base64ToBytes = (value: string) => {
  const { normalized } = normalizeBase64(value);
  if (!normalized) return new Uint8Array();

  const native = (Uint8Array as typeof Uint8Array & NativeFromBase64).fromBase64;
  if (native) {
    try {
      return native(normalized, { alphabet: 'base64', lastChunkHandling: 'strict' });
    } catch {
      throw new Error('Invalid Base64 payload.');
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

const fmt = (n: number) => {
  if (!n) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
  return `${(n / 1024 ** i).toFixed(i ? 2 : 0)} ${units[i]}`;
};

const ascii = (b: Uint8Array, start: number, length: number) =>
  String.fromCharCode(...b.slice(start, start + length));

const inferMime = (b: Uint8Array): MimeDetection => {
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

const isTextMime = (m: string) => m.startsWith('text/') || /json|javascript|xml|csv/.test(m);
const ext = (m: string) => MIME_EXT[m.toLowerCase()] || '';

const download = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const wrap = (s: string, width: number) => {
  if (!width || width <= 0) return s;
  const rows: string[] = [];
  for (let i = 0; i < s.length; i += width) rows.push(s.slice(i, i + width));
  return rows.join('\n');
};

const sameBytes = (a: Uint8Array, b: Uint8Array) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
};

const safeName = (name: string) => name.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').slice(0, 180) || 'decoded-file';

export default function Base64Encoder() {
  const [mode, setMode] = useState<Mode>('text');
  const [operation, setOperation] = useState<Operation>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [urlSafe, setUrlSafe] = useState(false);
  const [stripPadding, setStripPadding] = useState(true);
  const [encodeOutput, setEncodeOutput] = useState<EncodeOutput>('base64');
  const [decodeMode, setDecodeMode] = useState<DecodeMode>('text');
  const [wrapWidth, setWrapWidth] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [decoded, setDecoded] = useState<{ blob: Blob; name: string; type: string; url: string } | null>(null);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [outputByteCount, setOutputByteCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const jobRef = useRef(0);
  const activeBlobUrlRef = useRef<string | null>(null);

  const cleanup = () => {
    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }
    setDecoded(null);
  };

  useEffect(() => {
    return () => {
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
        activeBlobUrlRef.current = null;
      }
    };
  }, []);

  const process = async () => {
    const job = ++jobRef.current;
    setBusy(true);
    setError('');
    setWarning('');
    setCopied(false);
    cleanup();

    try {
      await new Promise<void>(r => requestAnimationFrame(() => r()));
      if (job !== jobRef.current) return;

      if (operation === 'encode') {
        let bytes: Uint8Array;
        let mime = 'text/plain;charset=utf-8';

        if (mode === 'file') {
          if (!file) throw new Error('Select a file first.');
          if (file.size > MAX_FILE) throw new Error(`File is too large. Maximum is ${fmt(MAX_FILE)}.`);
          bytes = new Uint8Array(await file.arrayBuffer());
          if (job !== jobRef.current) return;
          const detected = inferMime(bytes);
          const declared = file.type.trim().toLowerCase();
          mime = declared || detected.mime;
          if (declared && detected.confidence === 'high' && declared !== detected.mime) {
            setWarning(`The file declares ${declared}, but its content signature looks like ${detected.mime}. The declared MIME was kept for compatibility.`);
          }
        } else {
          bytes = new TextEncoder().encode(input);
          if (bytes.length > MAX_TEXT) throw new Error(`Text is too large. Maximum is ${fmt(MAX_TEXT)}.`);
        }

        const b64 = bytesToBase64(bytes, urlSafe, urlSafe && stripPadding);
        const result = encodeOutput === 'data-uri' ? `data:${mime};base64,${b64}` : b64;
        if (job !== jobRef.current) return;

        setOutput(wrap(result, wrapWidth));
        setOutputByteCount(bytes.length);

        // Round-trip verification: the generated Base64 must reproduce the exact bytes.
        if (!sameBytes(bytes, base64ToBytes(result))) {
          throw new Error('Internal verification failed: encoded output did not round-trip to the original bytes.');
        }
      } else {
        if (!input.trim()) {
          setOutput('');
          setOutputByteCount(0);
          return;
        }
        const dataUri = parseDataUri(input);
        const bytes = base64ToBytes(input);
        if (bytes.length > MAX_FILE) throw new Error(`Decoded data is too large. Maximum is ${fmt(MAX_FILE)}.`);

        if (mode === 'text' && decodeMode === 'text') {
          try {
            setOutput(new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes));
            setOutputByteCount(bytes.length);
          } catch {
            throw new Error('Decoded bytes are not valid UTF-8 text. Use file mode to download binary data.');
          }
        } else {
          const detected = inferMime(bytes);
          if (mode === 'file' && decodeMode === 'auto' && isTextMime(detected.mime)) {
            try {
              setOutput(new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes));
              setOutputByteCount(bytes.length);
              return;
            } catch {}
          }
          const finalMime = dataUri?.mime || (detected.confidence === 'high' ? detected.mime : mode === 'text' && decodeMode === 'file' ? 'application/octet-stream' : detected.mime);
          const blob = new Blob([bytes as unknown as BlobPart], { type: finalMime });
          const name = safeName(`decoded${ext(finalMime) || '.bin'}`);
          const url = URL.createObjectURL(blob);
          if (job !== jobRef.current) {
            URL.revokeObjectURL(url);
            return;
          }
          activeBlobUrlRef.current = url;
          setDecoded({ blob, name, type: finalMime, url });
          setOutput(`Decoded ${fmt(bytes.length)} · ${finalMime}`);
          setOutputByteCount(bytes.length);
        }
      }
    } catch (e) {
      if (job === jobRef.current) {
        setOutput('');
        setOutputByteCount(0);
        setError(e instanceof Error ? e.message : 'Unable to process input.');
      }
    } finally {
      if (job === jobRef.current) setBusy(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => void process(), 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, operation, input, file, urlSafe, stripPadding, encodeOutput, decodeMode, wrapWidth]);

  const inputBytes = mode === 'file' ? file?.size || 0 : new TextEncoder().encode(input).length;
  const outputBytes = outputByteCount;
  const overhead = inputBytes ? ((Math.ceil(inputBytes / 3) * 4 / inputBytes) - 1) * 100 : 0;

  const copy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('Clipboard access was blocked by the browser.');
    }
  };

  const clear = () => {
    jobRef.current++;
    setInput('');
    setOutput('');
    setOutputByteCount(0);
    setFile(null);
    setError('');
    setWarning('');
    setCopied(false);
    cleanup();
    if (inputRef.current) inputRef.current.value = '';
  };

  const swap = () => {
    if (decoded) return;
    jobRef.current++;
    const nextInput = output;
    const nextOp = operation === 'encode' ? 'decode' : 'encode';
    setInput(nextInput);
    setOutput('');
    setOutputByteCount(0);
    setOperation(nextOp);
    setError('');
    setWarning('');
    setCopied(false);
    cleanup();
  };

  const onFile = async (f: File) => {
    jobRef.current++;
    setError('');
    setWarning('');
    if (f.size > MAX_FILE) {
      setError(`File is too large. Maximum is ${fmt(MAX_FILE)}.`);
      return;
    }
    setFile(f);
    setMode('file');
    setOperation('encode');
  };

  const downloadOutput = () => {
    if (decoded) {
      download(decoded.blob, decoded.name);
      return;
    }
    if (!output) return;
    download(
      new Blob([output], { type: 'text/plain;charset=utf-8' }),
      operation === 'encode' ? 'base64-output.txt' : 'decoded-text.txt'
    );
  };

  const status = busy
    ? 'Processing…'
    : error
      ? 'Needs attention'
      : warning
        ? 'Check detected type'
        : output
          ? 'Ready'
          : 'Waiting for input';

  return (
    <section className="mx-auto w-full max-w-[1320px] overflow-hidden rounded-[28px] border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#070b14] shadow-2xl">
      <header className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/70 px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20">
              <FileCode2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">Base64 Encoder & Decoder</h2>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                  Pro
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-500">
                UTF-8 text, binary files, URL-safe Base64, Data URIs and browser-side decoding.
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold ${warning ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-400' : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-400'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${busy ? 'animate-pulse bg-blue-400' : error || warning ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            {status}
          </div>
        </div>
      </header>

      <div className="grid xl:grid-cols-2">
        <div className="min-w-0 border-b border-slate-200 p-4 sm:p-6 xl:border-b-0 xl:border-r dark:border-slate-800">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950/70 p-1">
              {(['text', 'file'] as Mode[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(''); setWarning(''); setOutput(''); setOutputByteCount(0); cleanup(); }}
                  className={`rounded-lg px-4 py-2 text-xs font-bold ${mode === m ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-950 dark:text-slate-500 dark:hover:text-slate-200'}`}
                >
                  {m === 'text' ? 'Text' : 'File'}
                </button>
              ))}
            </div>
            <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Local processing <Lock className="h-3.5 w-3.5 text-emerald-400" />
            </span>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950/60 p-1">
              {(['encode', 'decode'] as Operation[]).map(o => (
                <button
                  key={o}
                  type="button"
                  onClick={() => { setOperation(o); setError(''); setWarning(''); setOutput(''); setOutputByteCount(0); cleanup(); }}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-bold ${operation === o ? 'bg-slate-200 text-blue-700 dark:bg-slate-800 dark:text-blue-300' : 'text-slate-600 hover:text-slate-950 dark:text-slate-500 dark:hover:text-slate-200'}`}
                >
                  {o === 'encode' ? 'Encode' : 'Decode'}
                </button>
              ))}
            </div>
            {mode === 'text' && !decoded && (
              <button
                type="button"
                onClick={swap}
                disabled={!output && !input}
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-600 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
                title="Swap input and output"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" /> Swap
              </button>
            )}
            {operation === 'encode' ? (
              <select
                value={encodeOutput}
                onChange={e => setEncodeOutput(e.target.value as EncodeOutput)}
                className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-700 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
              >
                <option value="base64">Pure Base64</option>
                <option value="data-uri">Data URI</option>
              </select>
            ) : (
              <select
                value={decodeMode}
                onChange={e => setDecodeMode(e.target.value as DecodeMode)}
                className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-700 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
              >
                <option value="text">UTF-8 Text</option>
                <option value="file">Download File</option>
                {mode === 'file' && <option value="auto">Auto Detect</option>}
              </select>
            )}
          </div>

          {mode === 'file' && operation === 'encode' ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) void onFile(f); }}
              onClick={() => inputRef.current?.click()}
              className={`flex min-h-[310px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center ${
                dragging
                  ? 'border-blue-400 bg-blue-500/10'
                  : 'border-slate-300 bg-slate-50 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-950/40 dark:hover:border-slate-600'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) void onFile(f); }}
              />
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                <UploadCloud className="h-6 w-6" />
              </div>
              {file ? (
                <>
                  <p className="mt-4 max-w-full truncate text-sm font-bold text-slate-900 dark:text-slate-100">{file.name}</p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-500">{fmt(file.size)} · {file.type || 'unknown MIME'}</p>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setFile(null); setOutput(''); setOutputByteCount(0); setWarning(''); }}
                    className="mt-4 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:text-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white"
                  >
                    Remove file
                  </button>
                </>
              ) : (
                <>
                  <p className="mt-4 text-sm font-bold text-slate-900 dark:text-slate-200">Drop a file here</p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-500">or click to browse · up to {fmt(MAX_FILE)}</p>
                  <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-700">PDF · PNG · JPG · SVG · ZIP · TXT · JSON · binary</p>
                </>
              )}
            </div>
          ) : (
            <div className="relative">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                spellCheck={false}
                className="min-h-[310px] w-full resize-y rounded-2xl border border-slate-200 bg-white p-4 font-mono text-xs leading-6 text-slate-900 dark:border-slate-800 dark:bg-[#050914] dark:text-slate-200 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-700 focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10"
                placeholder={operation === 'encode' ? 'Type or paste text here…\n\nUnicode, Urdu, Arabic and emoji are supported.' : 'Paste Base64 here…\n\nWhitespace, URL-safe Base64 and Data URI prefixes are accepted.'}
              />
              {input && (
                <button
                  type="button"
                  onClick={() => { setInput(''); setOutput(''); setOutputByteCount(0); }}
                  className="absolute right-3 top-3 rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-600 dark:hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-500">Encoding options</p>
                <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-700">RFC 4648 alphabet with optional URL-safe output.</p>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={urlSafe}
                  onChange={e => setUrlSafe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 bg-white text-blue-600 dark:border-slate-700 dark:bg-slate-950"
                />
                URL-safe
              </label>
            </div>
            {urlSafe && operation === 'encode' && (
              <label className="mt-3 flex cursor-pointer items-center gap-2 text-[11px] text-slate-600 dark:text-slate-500">
                <input
                  type="checkbox"
                  checked={stripPadding}
                  onChange={e => setStripPadding(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 bg-white text-blue-600 dark:border-slate-700 dark:bg-slate-950"
                />
                Remove trailing = padding
              </label>
            )}
            {mode === 'text' && operation === 'encode' && (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Line wrap</span>
                <select
                  value={wrapWidth}
                  onChange={e => setWrapWidth(Number(e.target.value))}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-semibold text-slate-700 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                >
                  <option value={0}>Off</option>
                  <option value={64}>64</option>
                  <option value={76}>76</option>
                  <option value={80}>80</option>
                  <option value={128}>128</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 bg-slate-50 p-4 sm:p-6 dark:bg-[#080d18]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-500">Output</p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-600">
                {output ? `${output.length.toLocaleString()} characters` : 'Generated automatically.'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!output}
                onClick={copy}
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-600 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:text-white disabled:opacity-30 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Clipboard className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                type="button"
                disabled={!output && !decoded}
                onClick={downloadOutput}
                className="inline-flex h-9 items-center gap-2 rounded-xl bg-blue-600 px-3 text-[11px] font-bold text-white hover:bg-blue-500 disabled:opacity-30 transition-colors"
              >
                <ArrowDownToLine className="h-3.5 w-3.5" /> Download
              </button>
              <button
                type="button"
                onClick={clear}
                className="rounded-xl border border-slate-200 bg-white px-3 text-slate-600 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-500 dark:hover:text-white transition-colors"
                title="Clear all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {decoded ? (
            <div className="flex min-h-[310px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 text-center dark:border-slate-800 dark:bg-[#050914]">
              {isSafePreviewImage(decoded.type) ? (
                <div className="mb-5 max-h-[180px] max-w-full overflow-hidden rounded-xl border border-slate-800 bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={decoded.url} alt="Decoded preview" className="max-h-[160px] max-w-full object-contain" />
                </div>
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                  {decoded.type === 'image/svg+xml' ? <FileCode2 className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                </div>
              )}
              <p className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">{decoded.name}</p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-500">{fmt(decoded.blob.size)} · {decoded.type}</p>
              <button
                type="button"
                onClick={() => download(decoded.blob, decoded.name)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
              >
                <Download className="h-4 w-4" /> Download decoded file
              </button>
            </div>
          ) : (
            <div className="relative">
              <textarea
                readOnly
                value={output}
                spellCheck={false}
                className="min-h-[310px] w-full resize-y rounded-2xl border border-slate-200 bg-white p-4 font-mono text-xs leading-6 text-emerald-700 dark:border-slate-800 dark:bg-[#050914] dark:text-emerald-300 outline-none"
                placeholder="Output…"
              />
              {busy && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/75 backdrop-blur-[2px] dark:bg-slate-950/60">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-400" /> Processing locally…
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          {warning && !error && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {warning}
            </div>
          )}
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Stat label="Input" value={fmt(inputBytes)} />
            <Stat label="Decoded / source" value={fmt(outputBytes)} />
            <Stat label="Base64 overhead" value={operation === 'encode' && inputBytes ? `+${overhead.toFixed(1)}%` : '—'} />
          </div>
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-500/10 dark:bg-blue-500/5">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
            <p className="text-[10px] leading-5 text-slate-600 dark:text-slate-500">
              This component performs conversion in the browser. It does not send files to an API. A {fmt(MAX_FILE)} cap prevents accidental memory-heavy operations.
            </p>
          </div>
        </div>
      </div>

      <footer className="flex flex-col gap-2 border-t border-slate-200 bg-slate-100 px-4 py-4 text-[10px] text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-blue-400" /> Unicode-safe · Binary-safe · URL-safe · Data URI aware
        </span>
        <span className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-emerald-400" /> Client-side processing
        </span>
      </footer>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-600">{label}</p>
      <p className="mt-1 font-mono text-sm font-bold text-slate-800 dark:text-slate-300">{value}</p>
    </div>
  );
}
