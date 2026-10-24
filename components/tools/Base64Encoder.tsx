'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle, ArrowDownToLine, ArrowRightLeft, Check, Clipboard,
  Download, FileCode2, FileText, Info, Lock, RefreshCw, Trash2,
  UploadCloud, X, Zap
} from 'lucide-react';

import {
  bytesToBase64,
  parseDataUri,
  base64ToBytes,
  inferMime,
  isTextMime,
  isSafePreviewImage,
  ext,
  wrap,
  sameBytes,
  safeName,
  fmt,
  MAX_FILE,
  MAX_TEXT,
} from '@/lib/base64Engine';

type Mode = 'text' | 'file';
type Operation = 'encode' | 'decode';
type EncodeOutput = 'base64' | 'data-uri';
type DecodeMode = 'text' | 'file' | 'auto';

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

const SAMPLE_PRESETS = [
  {
    label: 'Hello, World!',
    badge: 'RFC 4648',
    op: 'encode' as Operation,
    mode: 'text' as Mode,
    value: 'Hello, World!',
  },
  {
    label: 'Unicode & Emoji',
    badge: 'UTF-8',
    op: 'encode' as Operation,
    mode: 'text' as Mode,
    value: '🚀 KivaroTools: Café, 日本語, العربية, & Zürich ✨',
  },
  {
    label: 'JWT Header',
    badge: 'Base64URL',
    op: 'decode' as Operation,
    mode: 'text' as Mode,
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  },
  {
    label: '1×1 PNG Pixel',
    badge: 'Data URI',
    op: 'decode' as Operation,
    mode: 'file' as Mode,
    value: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  },
];

export default function Base64Encoder() {
  const [mode, setMode] = useState<Mode>('text');
  const [operation, setOperation] = useState<Operation>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [urlSafe, setUrlSafe] = useState(false);
  const [stripPadding, setStripPadding] = useState(true);
  const [encodeOutput, setEncodeOutput] = useState<EncodeOutput>('base64');
  const [decodeMode, setDecodeMode] = useState<DecodeMode>('text');
  const [decodeStrictness, setDecodeStrictness] = useState<'tolerant' | 'strict'>('tolerant');
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
        if (!sameBytes(bytes, base64ToBytes(result, false))) {
          throw new Error('Internal verification failed: encoded output did not round-trip to the original bytes.');
        }
      } else {
        if (!input.trim()) {
          setOutput('');
          setOutputByteCount(0);
          return;
        }
        const dataUri = parseDataUri(input);
        const bytes = base64ToBytes(input, decodeStrictness === 'strict');
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
  }, [mode, operation, input, file, urlSafe, stripPadding, encodeOutput, decodeMode, wrapWidth, decodeStrictness]);

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

      {/* Privacy and Security Advisory Banner */}
      <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-2.5 sm:px-6 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <Lock className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
            <span><strong>100% Client-Side:</strong> All data is encoded and decoded locally in memory with zero server uploads.</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400">
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span><strong>Notice:</strong> Base64 is an encoding format, NOT encryption. Never use Base64 to secure passwords or sensitive keys.</span>
          </div>
        </div>
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {copied ? 'Output copied to clipboard' : error ? `Error: ${error}` : status}
      </div>

      <div className="grid xl:grid-cols-2">
        <div className="min-w-0 border-b border-slate-200 p-4 sm:p-6 xl:border-b-0 xl:border-r dark:border-slate-800">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950/70 p-1">
              {(['text', 'file'] as Mode[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(''); setWarning(''); setOutput(''); setOutputByteCount(0); cleanup(); }}
                  className={`min-h-[44px] rounded-lg px-4 py-2 text-xs font-bold transition-colors ${mode === m ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-100'}`}
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
                  className={`min-h-[36px] rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors ${operation === o ? 'bg-slate-200 text-blue-700 dark:bg-slate-800 dark:text-blue-300' : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-100'}`}
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
                className="inline-flex min-h-[36px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-600 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
                title="Swap input and output (Ctrl+Enter)"
                aria-label="Swap input and output"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" /> Swap
              </button>
            )}
            {operation === 'encode' ? (
              <select
                value={encodeOutput}
                onChange={e => setEncodeOutput(e.target.value as EncodeOutput)}
                className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-700 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                aria-label="Output format"
              >
                <option value="base64">Pure Base64</option>
                <option value="data-uri">Data URI</option>
              </select>
            ) : (
              <select
                value={decodeMode}
                onChange={e => setDecodeMode(e.target.value as DecodeMode)}
                className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-700 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                aria-label="Decode output mode"
              >
                <option value="text">UTF-8 Text</option>
                <option value="file">Download File</option>
                {mode === 'file' && <option value="auto">Auto Detect</option>}
              </select>
            )}
          </div>

          {/* Quick Sample Presets */}
          {mode === 'text' && (
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
                Sample Presets:
              </span>
              {SAMPLE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setMode(preset.mode);
                    setOperation(preset.op);
                    setInput(preset.value);
                    if (preset.badge === 'Base64URL') {
                      setUrlSafe(true);
                      setStripPadding(true);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:text-blue-600 hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:border-slate-700 transition-colors shadow-2xs"
                  title={`Load ${preset.label}`}
                >
                  <span>{preset.label}</span>
                  <span className="rounded bg-slate-100 px-1 py-0.5 text-[9px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {preset.badge}
                  </span>
                </button>
              ))}
            </div>
          )}

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
                onKeyDown={e => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    if (mode === 'text' && !decoded && (output || input)) {
                      swap();
                    }
                  } else if (e.key === 'Escape') {
                    clear();
                  }
                }}
                spellCheck={false}
                aria-label={operation === 'encode' ? 'Plain text input to encode' : 'Base64 input to decode'}
                className="min-h-[310px] w-full resize-y rounded-2xl border border-slate-200 bg-white p-4 font-mono text-xs leading-6 text-slate-900 dark:border-slate-800 dark:bg-[#050914] dark:text-slate-200 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-700 focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10"
                placeholder={operation === 'encode' ? 'Type or paste text here…\n\nUnicode, Urdu, Arabic and emoji are supported.' : 'Paste Base64 here…\n\nWhitespace, URL-safe Base64 and Data URI prefixes are accepted.'}
              />
              {input && (
                <button
                  type="button"
                  onClick={() => { setInput(''); setOutput(''); setOutputByteCount(0); }}
                  className="absolute right-3 top-3 rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-600 dark:hover:text-white"
                  aria-label="Clear input"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-500 px-1">
                <span>{input ? `${input.length.toLocaleString()} characters` : 'Empty input'}</span>
                <span>Keyboard: Ctrl+Enter to swap · Esc to clear</span>
              </div>
            </div>
          )}

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            {operation === 'encode' ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-500">Encoding options</p>
                    <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-600">RFC 4648 standard alphabet with optional URL-safe output.</p>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={urlSafe}
                      onChange={e => setUrlSafe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 bg-white text-blue-600 dark:border-slate-700 dark:bg-slate-950"
                    />
                    URL-safe (- and _)
                  </label>
                </div>
                {urlSafe && (
                  <label className="mt-3 flex cursor-pointer items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={stripPadding}
                      onChange={e => setStripPadding(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 bg-white text-blue-600 dark:border-slate-700 dark:bg-slate-950"
                    />
                    Remove trailing = padding (JWT format)
                  </label>
                )}
                {mode === 'text' && (
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Line wrap</span>
                    <select
                      value={wrapWidth}
                      onChange={e => setWrapWidth(Number(e.target.value))}
                      className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-semibold text-slate-700 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                    >
                      <option value={0}>Off</option>
                      <option value={64}>64 (PEM format)</option>
                      <option value={76}>76 (MIME format)</option>
                      <option value={80}>80 characters</option>
                      <option value={128}>128 characters</option>
                    </select>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-500">Validation Mode</p>
                  <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-600">Strict enforces RFC 4648 canonical pad bits; Tolerant cleans whitespace and restores padding.</p>
                </div>
                <select
                  value={decodeStrictness}
                  onChange={e => setDecodeStrictness(e.target.value as 'tolerant' | 'strict')}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                  aria-label="Validation strictness"
                >
                  <option value="tolerant">Tolerant (Whitespace & Padding)</option>
                  <option value="strict">Strict (RFC 4648 §3.5)</option>
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
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={!output}
                onClick={copy}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-white disabled:opacity-30 transition-colors shadow-2xs"
                aria-label={copied ? 'Output copied' : 'Copy output to clipboard'}
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Clipboard className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                type="button"
                disabled={!output && !decoded}
                onClick={downloadOutput}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-blue-600 px-3.5 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-30 transition-colors shadow-2xs"
                aria-label="Download output file"
              >
                <ArrowDownToLine className="h-4 w-4" /> Download
              </button>
              <button
                type="button"
                onClick={clear}
                className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-slate-600 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:text-white transition-colors shadow-2xs"
                title="Clear all (Esc)"
                aria-label="Clear all inputs and outputs"
              >
                <Trash2 className="h-4 w-4" />
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
