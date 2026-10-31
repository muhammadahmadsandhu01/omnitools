'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  FileUp,
  Hash as HashIcon,
  Key,
  Lock,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Search,
  Code2,
  Scale,
  Eye,
  EyeOff,
  ShieldAlert,
  Info,
  RotateCcw,
  List,
} from 'lucide-react';
import {
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  DEFAULT_PASSWORD_LENGTH,
  MIN_WORD_COUNT,
  MAX_WORD_COUNT,
  DEFAULT_WORD_COUNT,
  bytesToHex,
  generatePassword as engineGeneratePassword,
  generatePassphrase as engineGeneratePassphrase,
  generateBulkPasswords as engineGenerateBulkPasswords,
  makeSecret,
  analyzePassword,
  strengthFor,
  normalizeHash,
  looksLikeHex,
  constantTimeTextEqual,
} from '@/lib/passwordEngine';

const MAX_TEXT_HASH_BYTES = 8 * 1024 * 1024; // 8 MB
const MAX_FILE_BYTES = 1024 * 1024 * 1024; // 1 GB (1,024 MB) client-side browser limit

type Hashes = {
  sha256: string;
  sha384: string;
  sha512: string;
  sha1: string;
  md5: string;
};
type HashAlgorithm = keyof Hashes;
type FileHashAlgorithm = 'SHA-256' | 'SHA-384' | 'SHA-512';

async function sha1Hex(input: string): Promise<string> {
  const buffer = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(input));
  return bytesToHex(new Uint8Array(buffer));
}

async function checkPwnedPassword(passwordValue: string): Promise<number> {
  if (!passwordValue) throw new Error('Enter a password to check.');
  const fullHash = (await sha1Hex(passwordValue)).toUpperCase();
  const prefix = fullHash.slice(0, 5);
  const suffix = fullHash.slice(5);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      method: 'GET',
      headers: { 'Add-Padding': 'true' },
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Breach check service returned HTTP ${response.status}.`);
    const text = await response.text();
    for (const line of text.split(/\r?\n/)) {
      const [returnedSuffix, countText] = line.trim().split(':');
      if (returnedSuffix && returnedSuffix.toUpperCase() === suffix) {
        return Number(countText) || 0;
      }
    }
    return 0;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function digestText(algorithm: HashAlgorithm, input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  if (bytes.byteLength > MAX_TEXT_HASH_BYTES) {
    throw new Error('Text input is limited to 8 MB for browser-safe client-side processing.');
  }
  if (algorithm === 'md5') {
    const { default: CryptoJS } = await import('crypto-js');
    return CryptoJS.MD5(input).toString();
  }
  const algoName = algorithm === 'sha256' ? 'SHA-256' : algorithm === 'sha384' ? 'SHA-384' : algorithm === 'sha512' ? 'SHA-512' : 'SHA-1';
  const buffer = await crypto.subtle.digest(algoName, bytes);
  return bytesToHex(new Uint8Array(buffer));
}

async function hmacText(algorithm: HashAlgorithm, input: string, secret: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  if (bytes.byteLength > MAX_TEXT_HASH_BYTES) {
    throw new Error('Text input is limited to 8 MB for browser-safe client-side processing.');
  }
  const { default: CryptoJS } = await import('crypto-js');
  if (algorithm === 'md5') return CryptoJS.HmacMD5(input, secret).toString();
  if (algorithm === 'sha1') return CryptoJS.HmacSHA1(input, secret).toString();
  if (algorithm === 'sha256') return CryptoJS.HmacSHA256(input, secret).toString();
  if (algorithm === 'sha384') return CryptoJS.HmacSHA384(input, secret).toString();
  return CryptoJS.HmacSHA512(input, secret).toString();
}

/**
 * Self-contained inline worker code for file integrity hashing.
 * Uses native Web Crypto in the worker thread to hash files without main-thread jank.
 */
const FILE_WORKER_SCRIPT = `
self.onmessage = async function(e) {
  var data = e.data;
  if (!data) return;
  if (data.type === 'cancel') {
    self.postMessage({ type: 'cancelled' });
    return;
  }
  if (data.type !== 'hash') return;

  var file = data.file;
  var algorithm = data.algorithm;
  var chunkSize = data.chunkSize || 4 * 1024 * 1024;

  try {
    var size = file.size;
    if (size === 0) {
      var empty = new Uint8Array(0);
      var hashBuffer = await self.crypto.subtle.digest(algorithm, empty);
      var hex = Array.from(new Uint8Array(hashBuffer), function(b) {
        return b.toString(16).padStart(2, '0');
      }).join('');
      self.postMessage({ type: 'progress', progress: 100 });
      self.postMessage({ type: 'result', hash: hex });
      return;
    }

    var fullBuffer = new Uint8Array(size);
    var offset = 0;

    while (offset < size) {
      var end = Math.min(offset + chunkSize, size);
      var slice = file.slice(offset, end);
      var chunkBuf = await slice.arrayBuffer();
      fullBuffer.set(new Uint8Array(chunkBuf), offset);
      offset = end;
      var prog = Math.min(95, Math.round((offset / size) * 90));
      self.postMessage({ type: 'progress', progress: prog });
      await new Promise(function(r) { setTimeout(r, 0); });
    }

    self.postMessage({ type: 'progress', progress: 95 });
    var digest = await self.crypto.subtle.digest(algorithm, fullBuffer);
    var hexResult = Array.from(new Uint8Array(digest), function(b) {
      return b.toString(16).padStart(2, '0');
    }).join('');
    self.postMessage({ type: 'progress', progress: 100 });
    self.postMessage({ type: 'result', hash: hexResult });
  } catch (err) {
    self.postMessage({ type: 'error', message: err instanceof Error ? err.message : 'Unable to calculate file hash.' });
  }
};
`;

const LENGTH_PRESETS = [12, 16, 20, 24, 32, 64];

export default function PasswordGenerator() {
  const [passMode, setPassMode] = useState<'random' | 'passphrase'>('random');
  const [password, setPassword] = useState('');
  const [entropy, setEntropy] = useState(0);
  const [generationError, setGenerationError] = useState('');
  const [length, setLength] = useState(DEFAULT_PASSWORD_LENGTH);
  const [wordCount, setWordCount] = useState(DEFAULT_WORD_COUNT);
  const [incUpper, setIncUpper] = useState(true);
  const [incLower, setIncLower] = useState(true);
  const [incNum, setIncNum] = useState(true);
  const [incSym, setIncSym] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [requireEach, setRequireEach] = useState(true);
  const [separator, setSeparator] = useState('-');
  const [passphraseCaps, setPassphraseCaps] = useState(false);
  const [passphraseNumber, setPassphraseNumber] = useState(true);
  const [showPassword, setShowPassword] = useState(true);
  const [showRecent, setShowRecent] = useState(false);
  const [keepHistory, setKeepHistory] = useState(false);
  const [recentPasswords, setRecentPasswords] = useState<string[]>([]);
  const [copiedPass, setCopiedPass] = useState(false);

  // Bulk generation state
  const [showBulk, setShowBulk] = useState(false);
  const [bulkCount, setBulkCount] = useState(5);
  const [bulkPasswords, setBulkPasswords] = useState<string[]>([]);
  const [copiedBulkAll, setCopiedBulkAll] = useState(false);
  const [copiedBulkIdx, setCopiedBulkIdx] = useState<number | null>(null);

  // Hash & HMAC state
  const [hashInput, setHashInput] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [hmacMode, setHmacMode] = useState(false);
  const [hashAlgorithm, setHashAlgorithm] = useState<HashAlgorithm>('sha256');
  const [hashes, setHashes] = useState<Hashes>({ sha256: '', sha384: '', sha512: '', sha1: '', md5: '' });
  const [copiedHash, setCopiedHash] = useState('');
  const [hashing, setHashing] = useState(false);
  const [hashError, setHashError] = useState('');

  // File integrity state
  const [fileHash, setFileHash] = useState('');
  const [fileHashAlgorithm, setFileHashAlgorithm] = useState<FileHashAlgorithm>('SHA-256');
  const [isFileHashing, setIsFileHashing] = useState(false);
  const [fileProgress, setFileProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Analyzer & breach checker state
  const [analysisInput, setAnalysisInput] = useState('');
  const [breachInput, setBreachInput] = useState('');
  const [breachChecking, setBreachChecking] = useState(false);
  const [breachCount, setBreachCount] = useState<number | null>(null);
  const [breachError, setBreachError] = useState('');

  // Developer secret state
  const [secretFormat, setSecretFormat] = useState<'hex' | 'base64' | 'base64url' | 'uuid'>('hex');
  const [secretBytes, setSecretBytes] = useState(32);
  const [generatedSecret, setGeneratedSecret] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Hash compare state
  const [hashA, setHashA] = useState('');
  const [hashB, setHashB] = useState('');
  const [hashCompareResult, setHashCompareResult] = useState<'match' | 'different' | 'invalid' | ''>('');

  // UI state
  const [showMethodology, setShowMethodology] = useState(false);
  const [clearMessage, setClearMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hashRequest = useRef(0);
  const fileHashRequest = useRef(0);
  const selectedFileRef = useRef<File | null>(null);
  const fileHashWorkerRef = useRef<Worker | null>(null);
  const workerUrlRef = useRef<string | null>(null);

  const terminateFileHashWorker = () => {
    if (fileHashWorkerRef.current) {
      fileHashWorkerRef.current.terminate();
      fileHashWorkerRef.current = null;
    }
    if (workerUrlRef.current) {
      URL.revokeObjectURL(workerUrlRef.current);
      workerUrlRef.current = null;
    }
  };

  const generatePassword = () => {
    setGenerationError('');
    try {
      if (passMode === 'random') {
        const result = engineGeneratePassword({
          length,
          includeUpper: incUpper,
          includeLower: incLower,
          includeNumbers: incNum,
          includeSymbols: incSym,
          excludeAmbiguous,
          requireEach,
        });
        setPassword(result.password);
        setEntropy(result.entropy);
        if (keepHistory) {
          setRecentPasswords(prev => [result.password, ...prev.filter(p => p !== result.password)].slice(0, 5));
        }
      } else {
        const result = engineGeneratePassphrase({
          wordCount,
          separator,
          capitalize: passphraseCaps,
          includeNumber: passphraseNumber,
        });
        setPassword(result.passphrase);
        setEntropy(result.entropy);
        if (keepHistory) {
          setRecentPasswords(prev => [result.passphrase, ...prev.filter(p => p !== result.passphrase)].slice(0, 5));
        }
      }
      setCopiedPass(false);
    } catch (err) {
      setPassword('');
      setEntropy(0);
      setGenerationError(err instanceof Error ? err.message : 'Error generating password.');
      setCopiedPass(false);
    }
  };

  const generateBulk = () => {
    setGenerationError('');
    try {
      if (passMode === 'random') {
        const results = engineGenerateBulkPasswords(
          {
            length,
            includeUpper: incUpper,
            includeLower: incLower,
            includeNumbers: incNum,
            includeSymbols: incSym,
            excludeAmbiguous,
            requireEach,
          },
          bulkCount
        );
        setBulkPasswords(results.map(r => r.password));
      } else {
        const list: string[] = [];
        for (let i = 0; i < bulkCount; i++) {
          const res = engineGeneratePassphrase({
            wordCount,
            separator,
            capitalize: passphraseCaps,
            includeNumber: passphraseNumber,
          });
          list.push(res.passphrase);
        }
        setBulkPasswords(list);
      }
      setCopiedBulkAll(false);
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : 'Error generating bulk passwords.');
    }
  };

  // Initial generation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      generatePassword();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = ++hashRequest.current;
    const run = async () => {
      if (!hashInput) {
        setHashes({ sha256: '', sha384: '', sha512: '', sha1: '', md5: '' });
        setHashError('');
        setHashing(false);
        return;
      }
      setHashError('');
      setHashing(true);
      try {
        const out: Hashes = { sha256: '', sha384: '', sha512: '', sha1: '', md5: '' };
        if (hmacMode) {
          out[hashAlgorithm] = await hmacText(hashAlgorithm, hashInput, secretKey);
        } else {
          const algos: HashAlgorithm[] = ['sha256', 'sha384', 'sha512', 'sha1', 'md5'];
          const results = await Promise.all(algos.map(algo => digestText(algo, hashInput)));
          algos.forEach((algo, i) => { out[algo] = results[i]; });
        }
        if (id === hashRequest.current) setHashes(out);
      } catch (e) {
        if (id === hashRequest.current) {
          setHashes({ sha256: '', sha384: '', sha512: '', sha1: '', md5: '' });
          setHashError(e instanceof Error ? e.message : 'Unable to calculate hash.');
        }
      } finally {
        if (id === hashRequest.current) setHashing(false);
      }
    };
    void run();
  }, [hashInput, secretKey, hmacMode, hashAlgorithm]);

  const hashFile = (file: File, algorithm: FileHashAlgorithm = fileHashAlgorithm) => {
    terminateFileHashWorker();
    selectedFileRef.current = file;
    setFileError('');
    setFileHash('');
    setFileName(file.name);
    setFileSize(file.size);
    setIsFileHashing(true);
    setFileProgress(0);

    if (file.size > MAX_FILE_BYTES) {
      setIsFileHashing(false);
      setFileError('Client-side browser limit: Files above 1 GB (1,024 MB) are not supported. For larger files, use a native CLI tool.');
      return;
    }

    try {
      const blob = new Blob([FILE_WORKER_SCRIPT], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      workerUrlRef.current = workerUrl;
      const worker = new Worker(workerUrl);
      fileHashWorkerRef.current = worker;

      worker.onmessage = (e: MessageEvent<{ type: string; progress?: number; hash?: string; message?: string }>) => {
        const msg = e.data;
        if (msg.type === 'progress' && typeof msg.progress === 'number') {
          setFileProgress(msg.progress);
        } else if (msg.type === 'result' && msg.hash) {
          setFileHash(msg.hash);
          setIsFileHashing(false);
          setFileProgress(100);
          terminateFileHashWorker();
        } else if (msg.type === 'error') {
          setFileError(msg.message || 'Worker hashing error');
          setIsFileHashing(false);
          terminateFileHashWorker();
        }
      };

      worker.postMessage({ type: 'hash', file, algorithm });
    } catch {
      setIsFileHashing(false);
      setFileError('Failed to initialize Web Worker for hashing.');
    }
  };

  useEffect(() => {
    const file = selectedFileRef.current;
    if (file) hashFile(file, fileHashAlgorithm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileHashAlgorithm]);

  const cancelFileHash = () => {
    fileHashRequest.current += 1;
    terminateFileHashWorker();
    setIsFileHashing(false);
    setFileProgress(0);
  };

  const copy = async (text: string, type: 'pass' | 'hash' | 'secret') => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    if (type === 'pass') setCopiedPass(true);
    else if (type === 'hash') setCopiedHash(text);
    else setCopiedSecret(true);

    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => {
      setCopiedPass(false);
      setCopiedHash('');
      setCopiedSecret(false);
    }, 2000);
  };

  const copyBulkAll = async () => {
    if (!bulkPasswords.length) return;
    try {
      await navigator.clipboard.writeText(bulkPasswords.join('\n'));
      setCopiedBulkAll(true);
      setTimeout(() => setCopiedBulkAll(false), 2000);
    } catch {
      // ignore
    }
  };

  const copyBulkSingle = async (p: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(p);
      setCopiedBulkIdx(idx);
      setTimeout(() => setCopiedBulkIdx(null), 2000);
    } catch {
      // ignore
    }
  };

  const runBreachCheck = async () => {
    if (!breachInput.trim()) {
      setBreachError('Enter an existing password in the input box below. Freshly generated passwords are never tested over the network.');
      return;
    }
    setBreachChecking(true);
    setBreachError('');
    setBreachCount(null);
    try {
      const count = await checkPwnedPassword(breachInput);
      setBreachCount(count);
    } catch (error) {
      setBreachError(error instanceof Error ? error.message : 'Unable to complete breach check.');
    } finally {
      setBreachChecking(false);
    }
  };

  const generateSecret = () => {
    try {
      setGeneratedSecret(makeSecret(secretFormat, secretBytes));
      setCopiedSecret(false);
    } catch (error) {
      setGeneratedSecret(error instanceof Error ? error.message : 'Unable to generate secret.');
    }
  };

  const compareHashes = () => {
    const a = normalizeHash(hashA);
    const b = normalizeHash(hashB);
    if (!a || !b || !looksLikeHex(a) || !looksLikeHex(b)) {
      setHashCompareResult('invalid');
      return;
    }
    setHashCompareResult(constantTimeTextEqual(a, b) ? 'match' : 'different');
  };

  const clearHistory = () => {
    setRecentPasswords([]);
    setShowRecent(false);
  };

  const resetAllState = () => {
    setPassword('');
    setEntropy(0);
    setGenerationError('');
    setBulkPasswords([]);
    setShowBulk(false);
    setAnalysisInput('');
    setHashInput('');
    setSecretKey('');
    setHashes({ sha256: '', sha384: '', sha512: '', sha1: '', md5: '' });
    setHashError('');
    setBreachInput('');
    setBreachCount(null);
    setBreachError('');
    setGeneratedSecret('');
    setHashA('');
    setHashB('');
    setHashCompareResult('');
    setRecentPasswords([]);
    setShowRecent(false);
    setFileName('');
    setFileSize(0);
    setFileHash('');
    setFileError('');
    cancelFileHash();
    selectedFileRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
    setClearMessage('All sensitive fields and in-memory state cleared (best-effort reset).');
    if (clearTimer.current) clearTimeout(clearTimer.current);
    clearTimer.current = setTimeout(() => setClearMessage(''), 3000);
  };

  const strength = strengthFor(entropy);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) hashFile(file);
  };

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
    if (clearTimer.current) clearTimeout(clearTimer.current);
    fileHashRequest.current += 1;
    hashRequest.current += 1;
    terminateFileHashWorker();
    selectedFileRef.current = null;
  }, []);

  return (
    <div className="flex flex-col gap-8 bg-white dark:bg-[#0a0f1a] transition-colors">
      {/* Privacy Notice Banner & Reset Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-xs font-semibold border border-emerald-200 dark:border-emerald-800/50">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Local processing: Generated passwords, secrets, and files are never sent to external servers or logged.</span>
        </div>
        <button
          type="button"
          onClick={resetAllState}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 bg-gray-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-200 dark:border-slate-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Reset all sensitive state"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sensitive State</span>
        </button>
      </div>

      {clearMessage && (
        <div aria-live="polite" className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 px-4 py-2.5 rounded-xl text-center">
          {clearMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: Generation, Analysis, Secrets */}
        <div className="flex flex-col gap-6">
          {/* SECURE PASSWORD GENERATOR */}
          <section aria-labelledby="heading-generator" className="bg-gray-50 dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
            <h2 id="heading-generator" className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-3">
              <Key className="w-5 h-5 text-blue-600" /> Secure Password Generator
            </h2>

            {/* Mode Switcher */}
            <div className="bg-white dark:bg-[#0a0f1a] p-1 rounded-xl flex gap-1 border border-gray-200 dark:border-slate-700" role="tablist" aria-label="Generation Mode">
              <button
                type="button"
                role="tab"
                aria-selected={passMode === 'random'}
                onClick={() => {
                  setPassMode('random');
                  setGenerationError('');
                }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${passMode === 'random' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Random Characters
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={passMode === 'passphrase'}
                onClick={() => {
                  setPassMode('passphrase');
                  setGenerationError('');
                }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${passMode === 'passphrase' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Memorable Passphrase
              </button>
            </div>

            {/* Main Output Box with Show/Hide and Copy */}
            {password ? (
              <div className="w-full bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-2xl p-5 flex items-center justify-between gap-3 shadow-inner">
                <div
                  tabIndex={0}
                  aria-label="Generated password output"
                  className="flex-1 min-w-0 break-all font-mono text-lg md:text-xl text-slate-900 dark:text-blue-100 select-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {showPassword ? password : '•'.repeat(Math.min(password.length, 36))}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <button
                    type="button"
                    aria-label="Copy generated password to clipboard"
                    onClick={() => copy(password, 'pass')}
                    className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
                  >
                    {copiedPass ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full bg-white dark:bg-[#0a0f1a] border border-dashed border-gray-300 dark:border-slate-700 rounded-2xl p-5 min-h-[80px] flex items-center justify-center text-center shadow-inner">
                <span className="text-gray-400 dark:text-slate-500 text-sm font-sans">
                  Click Generate New to create a credential.
                </span>
              </div>
            )}

            {/* Strength & Entropy Indicator */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className={`text-sm font-bold uppercase tracking-wider ${strength.cls}`}>{strength.label}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  ~{entropy} bits Shannon entropy
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden" role="progressbar" aria-valuenow={strength.width} aria-valuemin={0} aria-valuemax={100} aria-label="Password strength meter">
                <div className={`h-full transition-all duration-500 ${strength.bar}`} style={{ width: `${strength.width}%` }} />
              </div>
            </div>

            {generationError && (
              <div role="alert" className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl p-3">
                {generationError}
              </div>
            )}

            {/* Parameters Panel */}
            <div className="space-y-5 pt-4 border-t border-gray-200 dark:border-slate-800">
              {passMode === 'random' ? (
                <>
                  {/* Password Length Slider & Presets */}
                  <div>
                    <div className="flex justify-between items-center text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      <label htmlFor="input-password-length">Password Length</label>
                      <span className="text-blue-600 dark:text-blue-400 font-mono text-base">{length}</span>
                    </div>
                    <input
                      id="input-password-length"
                      type="range"
                      min={MIN_PASSWORD_LENGTH}
                      max={MAX_PASSWORD_LENGTH}
                      value={length}
                      onChange={e => {
                        const newLen = Number(e.target.value);
                        setLength(newLen);
                      }}
                      className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      aria-valuemin={MIN_PASSWORD_LENGTH}
                      aria-valuemax={MAX_PASSWORD_LENGTH}
                      aria-valuenow={length}
                    />

                    {/* Quick Presets */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quick Lengths:</span>
                      {LENGTH_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setLength(preset);
                          }}
                          className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg border transition-colors ${
                            length === preset
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white dark:bg-[#0a0f1a] text-slate-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-blue-400'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Character Class Checkboxes */}
                  <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                    <legend className="sr-only">Character types</legend>
                    <label htmlFor="checkbox-inc-upper" className="group flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none min-w-0 w-full py-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <input
                        id="checkbox-inc-upper"
                        type="checkbox"
                        checked={incUpper}
                        onChange={e => setIncUpper(e.target.checked)}
                        className="mt-0.5 w-4 h-4 shrink-0 rounded accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900"
                      />
                      <span className="min-w-0 break-words leading-tight">Uppercase (A-Z)</span>
                    </label>
                    <label htmlFor="checkbox-inc-lower" className="group flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none min-w-0 w-full py-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <input
                        id="checkbox-inc-lower"
                        type="checkbox"
                        checked={incLower}
                        onChange={e => setIncLower(e.target.checked)}
                        className="mt-0.5 w-4 h-4 shrink-0 rounded accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900"
                      />
                      <span className="min-w-0 break-words leading-tight">Lowercase (a-z)</span>
                    </label>
                    <label htmlFor="checkbox-inc-num" className="group flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none min-w-0 w-full py-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <input
                        id="checkbox-inc-num"
                        type="checkbox"
                        checked={incNum}
                        onChange={e => setIncNum(e.target.checked)}
                        className="mt-0.5 w-4 h-4 shrink-0 rounded accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900"
                      />
                      <span className="min-w-0 break-words leading-tight">Numbers (0-9)</span>
                    </label>
                    <label htmlFor="checkbox-inc-sym" className="group flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none min-w-0 w-full py-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <input
                        id="checkbox-inc-sym"
                        type="checkbox"
                        checked={incSym}
                        onChange={e => setIncSym(e.target.checked)}
                        className="mt-0.5 w-4 h-4 shrink-0 rounded accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900"
                      />
                      <span className="min-w-0 break-words leading-tight">Symbols (!@#$)</span>
                    </label>
                  </fieldset>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 pt-2 border-t border-gray-200/60 dark:border-slate-800/60">
                    <label htmlFor="checkbox-require-each" className="group flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none min-w-0 w-full py-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <input
                        id="checkbox-require-each"
                        type="checkbox"
                        checked={requireEach}
                        onChange={e => setRequireEach(e.target.checked)}
                        className="mt-0.5 w-4 h-4 shrink-0 rounded accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900"
                      />
                      <span className="min-w-0 break-words leading-tight">Guarantee selected types</span>
                    </label>
                    <label htmlFor="checkbox-exclude-ambiguous" className="group flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none min-w-0 w-full py-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <input
                        id="checkbox-exclude-ambiguous"
                        type="checkbox"
                        checked={excludeAmbiguous}
                        onChange={e => setExcludeAmbiguous(e.target.checked)}
                        className="mt-0.5 w-4 h-4 shrink-0 rounded accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900"
                      />
                      <span className="min-w-0 break-words leading-tight">Exclude ambiguous (0, O, 1, l, |)</span>
                    </label>
                  </div>
                </>
              ) : (
                <>
                  {/* Passphrase Configuration */}
                  <div>
                    <label htmlFor="input-word-count" className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      <span>Number of Words</span>
                      <span className="text-blue-600 dark:text-blue-400 font-mono">{wordCount}</span>
                    </label>
                    <input
                      id="input-word-count"
                      type="range"
                      min={MIN_WORD_COUNT}
                      max={MAX_WORD_COUNT}
                      value={wordCount}
                      onChange={e => setWordCount(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      aria-valuemin={MIN_WORD_COUNT}
                      aria-valuemax={MAX_WORD_COUNT}
                      aria-valuenow={wordCount}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="text-sm text-slate-700 dark:text-slate-300">
                      <span>Word Separator</span>
                      <select
                        aria-label="Passphrase word separator"
                        value={separator}
                        onChange={e => setSeparator(e.target.value)}
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <option value="-">Hyphen (-)</option>
                        <option value=".">Period (.)</option>
                        <option value="_">Underscore (_)</option>
                        <option value="+">Plus (+)</option>
                        <option value=" ">Space ( )</option>
                        <option value="/">Slash (/)</option>
                      </select>
                    </label>
                    <label htmlFor="checkbox-passphrase-caps" className="group flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none min-w-0 w-full py-1.5 sm:self-end sm:pb-2.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <input
                        id="checkbox-passphrase-caps"
                        type="checkbox"
                        checked={passphraseCaps}
                        onChange={e => setPassphraseCaps(e.target.checked)}
                        className="mt-0.5 w-4 h-4 shrink-0 rounded accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900"
                      />
                      <span className="min-w-0 break-words leading-tight">Capitalize words</span>
                    </label>
                  </div>
                  <label htmlFor="checkbox-passphrase-number" className="group flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none min-w-0 w-full py-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <input
                      id="checkbox-passphrase-number"
                      type="checkbox"
                      checked={passphraseNumber}
                      onChange={e => setPassphraseNumber(e.target.checked)}
                      className="mt-0.5 w-4 h-4 shrink-0 rounded accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900"
                    />
                    <span className="min-w-0 break-words leading-tight">Append random 4-digit number (+13.3 bits entropy)</span>
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sampled uniformly without replacement as an ordered sequence from an auditable 1,024-word English dictionary (keyspace P(1024, W)). Suffix adds ~13.3 bits.
                  </p>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={generatePassword}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3.5 rounded-xl font-bold shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <RefreshCw className="w-5 h-5" /> Generate New
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulk(!showBulk)}
                  className="flex items-center justify-center gap-2 bg-white dark:bg-[#0a0f1a] text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 px-4 py-3.5 rounded-xl font-semibold border border-gray-200 dark:border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-expanded={showBulk}
                >
                  <List className="w-4 h-4" /> Bulk Generator
                </button>
              </div>

              {/* Bulk Generation Drawer */}
              {showBulk && (
                <div className="bg-white dark:bg-[#0a0f1a] p-4 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800 dark:text-white">Bulk Password Batch</span>
                    <div className="flex items-center gap-2">
                      <label htmlFor="select-bulk-count" className="text-xs text-slate-500">Quantity:</label>
                      <select
                        id="select-bulk-count"
                        value={bulkCount}
                        onChange={e => setBulkCount(Number(e.target.value))}
                        className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700"
                      >
                        <option value={5}>5 Passwords</option>
                        <option value={10}>10 Passwords</option>
                        <option value={20}>20 Passwords</option>
                        <option value={50}>50 Passwords</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={generateBulk}
                    className="w-full py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold text-xs rounded-xl hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors"
                  >
                    Generate {bulkCount} Batch
                  </button>

                  {bulkPasswords.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-gray-100 dark:border-slate-800">
                        <span>Generated {bulkPasswords.length} items</span>
                        <button
                          type="button"
                          onClick={copyBulkAll}
                          className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
                        >
                          {copiedBulkAll ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedBulkAll ? 'Copied all!' : 'Copy All'}</span>
                        </button>
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
                        {bulkPasswords.map((bp, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-[#111827] text-slate-800 dark:text-slate-200">
                            <span className="truncate pr-2">{bp}</span>
                            <button
                              type="button"
                              aria-label={`Copy password ${idx + 1}`}
                              onClick={() => copyBulkSingle(bp, idx)}
                              className="text-slate-400 hover:text-blue-600 p-1 rounded"
                            >
                              {copiedBulkIdx === idx ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Session History */}
            <div className="pt-2">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowRecent(!showRecent)}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                  aria-expanded={showRecent}
                >
                  <Lock className="w-4 h-4" /> Session History {showRecent ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <label htmlFor="checkbox-keep-history" className="group flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer select-none">
                  <input
                    id="checkbox-keep-history"
                    type="checkbox"
                    checked={keepHistory}
                    onChange={e => {
                      setKeepHistory(e.target.checked);
                      if (!e.target.checked) clearHistory();
                    }}
                    className="w-4 h-4 shrink-0 rounded accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900"
                  />
                  <span>Keep in memory</span>
                </label>
              </div>
              {showRecent && (
                <div className="mt-3 space-y-2 bg-white dark:bg-[#0a0f1a] p-3 rounded-xl border border-gray-200 dark:border-slate-700">
                  {keepHistory && recentPasswords.length ? (
                    recentPasswords.map((p, i) => (
                      <div key={`${p}-${i}`} className="flex items-center justify-between text-sm font-mono text-slate-700 dark:text-slate-300 bg-gray-50 dark:bg-[#111827] p-2 rounded-lg">
                        <span className="truncate pr-4">{p}</span>
                        <button
                          type="button"
                          aria-label="Copy historical password"
                          onClick={() => copy(p, 'pass')}
                          className="text-blue-500 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-center text-slate-500">
                      History is off by default to protect privacy. Passwords are never saved to persistent storage.
                    </p>
                  )}
                  {keepHistory && recentPasswords.length > 0 && (
                    <button
                      type="button"
                      onClick={clearHistory}
                      className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 mt-2 focus-visible:outline-none"
                    >
                      <Trash2 className="w-3 h-3" /> Clear session history
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* PASSWORD SECURITY ANALYZER */}
          <section aria-labelledby="heading-analyzer" className="bg-gray-50 dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
            <h2 id="heading-analyzer" className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-3">
              <ShieldAlert className="w-5 h-5 text-blue-600" /> Password Security Analyzer
            </h2>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="textarea-analyzer" className="text-xs text-slate-500 dark:text-slate-400">
                Paste or type a password to inspect its local composition:
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAnalysisInput(password)}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Use Generated Password
                </button>
                {analysisInput && (
                  <button
                    type="button"
                    onClick={() => setAnalysisInput('')}
                    className="text-xs font-semibold text-red-500 hover:text-red-600 hover:underline ml-1"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <textarea
              id="textarea-analyzer"
              value={analysisInput}
              onChange={e => setAnalysisInput(e.target.value.slice(0, 4096))}
              placeholder="Paste or type a password to analyze locally…"
              className="w-full h-24 p-4 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white text-sm resize-none font-mono"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
              {(() => {
                const hasInput = analysisInput.length > 0;
                const a = hasInput
                  ? analyzePassword(analysisInput)
                  : {
                      score: 0,
                      entropy: 0,
                      length: 0,
                      label: 'No password' as const,
                      repeated: false,
                      sequence: false,
                      keyboard: false,
                      dictionary: false,
                      dateLike: false,
                      common: false,
                      warnings: ['Enter a password above to inspect strength and pattern vulnerabilities.'],
                    };
                return (
                  <>
                    <div className="min-w-0 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between">
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] font-medium leading-none mb-1">Score</div>
                      <div className={`font-bold ${hasInput ? (a.score >= 75 ? 'text-emerald-600 dark:text-emerald-400' : a.score >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400') : 'text-slate-400 dark:text-slate-500'} text-sm sm:text-base tracking-tight leading-tight min-w-0 whitespace-nowrap flex items-baseline gap-0.5`}>
                        <span>{a.score}</span>
                        <span className="text-xs sm:text-sm font-semibold opacity-70">/100</span>
                      </div>
                    </div>
                    <div className="min-w-0 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between">
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] font-medium leading-none mb-1">Entropy</div>
                      <div className={`font-bold ${hasInput ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'} text-sm sm:text-base tracking-tight leading-tight min-w-0 whitespace-nowrap flex items-baseline gap-1`}>
                        <span>{hasInput ? `~${a.entropy}` : '0'}</span>
                        <span className="text-[11px] sm:text-xs font-normal text-slate-500 dark:text-slate-400">bits</span>
                      </div>
                    </div>
                    <div className="min-w-0 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between">
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] font-medium leading-none mb-1">Length</div>
                      <div className={`font-bold ${hasInput ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'} text-base sm:text-lg tracking-tight leading-tight min-w-0 whitespace-nowrap`}>
                        {a.length}
                      </div>
                    </div>
                    <div className="min-w-0 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between">
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] font-medium leading-none mb-1">Verdict</div>
                      <div className={`font-bold ${hasInput ? (a.score >= 75 ? 'text-emerald-600 dark:text-emerald-400' : a.score >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400') : 'text-slate-400 dark:text-slate-500'} text-sm sm:text-base tracking-tight leading-tight min-w-0 whitespace-nowrap`}>
                        {a.label}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {(() => {
                const hasInput = analysisInput.length > 0;
                const a = hasInput ? analyzePassword(analysisInput) : null;
                const criteria = [
                  ['Repeated', a?.repeated ?? false],
                  ['Sequence', a?.sequence ?? false],
                  ['Keyboard pattern', a?.keyboard ?? false],
                  ['Dictionary-like', a?.dictionary ?? false],
                  ['Common password', a?.common ?? false],
                  ['Date/year-like', a?.dateLike ?? false],
                ] as const;

                return (
                  <>
                    {criteria.map(([lbl, bad]) => (
                      <div
                        key={String(lbl)}
                        className={`min-w-0 rounded-lg border px-2.5 py-1.5 text-xs break-words leading-tight flex items-center gap-1.5 ${
                          !hasInput
                            ? 'border-gray-200 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-900/30 text-slate-400 dark:text-slate-500'
                            : bad
                            ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-300'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-900/20 dark:text-emerald-300'
                        }`}
                      >
                        <span className="shrink-0">{!hasInput ? '—' : bad ? '⚠' : '✓'}</span>
                        <span className="min-w-0 break-words">{String(lbl)}</span>
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>
            {!analysisInput ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                Awaiting input: Enter or paste a password above to evaluate entropy, dictionary patterns, and heuristic resilience.
              </p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Local heuristic analysis — not an unhackability guarantee. High scores indicate high search space, not absolute immunity.
              </p>
            )}
          </section>

          {/* DEVELOPER SECRET GENERATOR */}
          <section aria-labelledby="heading-secret" className="bg-gray-50 dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
            <h2 id="heading-secret" className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-3">
              <Code2 className="w-5 h-5 text-blue-600" /> Developer Secret Generator
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Format</span>
                <select
                  aria-label="Secret output format"
                  value={secretFormat}
                  onChange={e => setSecretFormat(e.target.value as typeof secretFormat)}
                  className="mt-1 w-full px-3 py-2.5 text-sm normal-case font-normal rounded-xl bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <option value="hex">Hex (API keys / seeds)</option>
                  <option value="base64">Base64 (RFC 4648)</option>
                  <option value="base64url">Base64URL (JWT / OAuth)</option>
                  <option value="uuid">UUID v4 (RFC 4122)</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Random bytes</span>
                <span className="ml-2 text-blue-600 font-mono">{secretFormat === 'uuid' ? '16 (fixed)' : secretBytes}</span>
                <input
                  type="range"
                  min="8"
                  max="64"
                  step="1"
                  value={secretBytes}
                  disabled={secretFormat === 'uuid'}
                  onChange={e => setSecretBytes(Number(e.target.value))}
                  className="mt-3 w-full accent-blue-600 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Number of random bytes"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={generateSecret}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <RefreshCw className="w-4 h-4" /> Generate Cryptographic Secret
            </button>
            {generatedSecret ? (
              <div className="bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between gap-3 shadow-inner">
                <div
                  tabIndex={0}
                  aria-label="Generated secret value"
                  className="flex-1 min-w-0 font-mono text-sm break-all select-all text-slate-800 dark:text-blue-100 focus-visible:outline-none"
                >
                  {generatedSecret}
                </div>
                <button
                  type="button"
                  aria-label="Copy generated secret"
                  onClick={() => copy(generatedSecret, 'secret')}
                  className="shrink-0 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
                >
                  {copiedSecret ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#0a0f1a] border border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-4 text-center text-xs text-gray-400 dark:text-slate-500">
                Select a format and click &ldquo;Generate Cryptographic Secret&rdquo;.
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cryptographically secure bytes from browser CSPRNG. UUID v4 mode strictly applies RFC 4122 version and variant bits.
            </p>
          </section>
        </div>

        {/* RIGHT COLUMN: Hashing, File Integrity, Breach Check, Compare */}
        <div className="flex flex-col gap-6">
          {/* HASH & HMAC GENERATOR */}
          <section aria-labelledby="heading-hash" className="bg-gray-50 dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
            <h2 id="heading-hash" className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-3">
              <HashIcon className="w-5 h-5 text-blue-600" /> Hash &amp; HMAC Generator
            </h2>
            <label htmlFor="textarea-hash-input" className="text-xs text-slate-500 dark:text-slate-400">
              Text to hash (UTF-8 encoded, max 8 MB):
            </label>
            <textarea
              id="textarea-hash-input"
              value={hashInput}
              onChange={e => setHashInput(e.target.value)}
              placeholder="Enter text to hash..."
              className="w-full h-24 p-4 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white text-sm resize-none font-mono"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Mode</span>
                <select
                  aria-label="Hashing mode"
                  value={hmacMode ? 'hmac' : 'hash'}
                  onChange={e => setHmacMode(e.target.value === 'hmac')}
                  className="mt-1 w-full px-3 py-2.5 text-sm normal-case font-normal rounded-xl bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <option value="hash">Standard Hash (all algorithms)</option>
                  <option value="hmac">HMAC (keyed authentication)</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>{hmacMode ? 'HMAC Algorithm' : 'Highlight Algorithm'}</span>
                <select
                  aria-label="Hash algorithm selection"
                  value={hashAlgorithm}
                  onChange={e => setHashAlgorithm(e.target.value as HashAlgorithm)}
                  className="mt-1 w-full px-3 py-2.5 text-sm normal-case font-normal rounded-xl bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <option value="sha256">SHA-256 (Recommended)</option>
                  <option value="sha384">SHA-384 (Recommended)</option>
                  <option value="sha512">SHA-512 (Recommended)</option>
                  <option value="sha1">SHA-1 (Legacy / Insecure)</option>
                  <option value="md5">MD5 (Legacy / Insecure)</option>
                </select>
              </label>
            </div>
            {hmacMode && (
              <div>
                <label htmlFor="input-hmac-key" className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
                  HMAC Secret Key (never sent over network):
                </label>
                <input
                  id="input-hmac-key"
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  style={{ WebkitTextSecurity: 'disc' } as CSSProperties}
                  value={secretKey}
                  onChange={e => setSecretKey(e.target.value)}
                  placeholder="Enter secret key..."
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white text-sm font-mono"
                />
              </div>
            )}
            {hashError && (
              <div role="alert" className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl p-3">
                {hashError}
              </div>
            )}
            {hashing && (
              <div className="text-xs text-blue-600 flex items-center gap-2" aria-live="polite">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Computing hashes locally…</span>
              </div>
            )}
            <div className="space-y-3 mt-2">
              {(['sha256', 'sha384', 'sha512', 'sha1', 'md5'] as HashAlgorithm[]).map(algo => {
                const isLegacy = algo === 'sha1' || algo === 'md5';
                const hasHash = Boolean(hashes[algo]);
                return (
                  <div
                    key={algo}
                    className={`p-3 rounded-xl border ${
                      algo === hashAlgorithm
                        ? 'border-blue-400 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-[#0a0f1a]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        {algo.toUpperCase()} {isLegacy && <span className="text-amber-500 text-[10px] lowercase font-normal">(legacy)</span>}
                      </span>
                      {hasHash && (
                        <button
                          type="button"
                          aria-label={`Copy ${algo} hash`}
                          onClick={() => copy(hashes[algo], 'hash')}
                          className="text-xs text-blue-600 hover:text-blue-500 flex items-center gap-1 focus-visible:outline-none"
                        >
                          {copiedHash === hashes[algo] ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedHash === hashes[algo] ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                    <div
                      tabIndex={0}
                      aria-label={`${algo} hash value`}
                      className="font-mono text-xs break-all select-all text-slate-800 dark:text-slate-200 focus-visible:outline-none"
                    >
                      {hashes[algo] || <span className="text-gray-400 dark:text-slate-500 italic">Hash will appear here…</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* FILE INTEGRITY HASHER */}
          <section aria-labelledby="heading-file" className="bg-gray-50 dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
            <h2 id="heading-file" className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-3">
              <FileUp className="w-5 h-5 text-emerald-600" /> File Checksum &amp; Integrity Hasher
            </h2>
            <div className="flex items-center justify-between">
              <label htmlFor="select-file-algorithm" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Algorithm</label>
              <select
                id="select-file-algorithm"
                value={fileHashAlgorithm}
                onChange={e => setFileHashAlgorithm(e.target.value as FileHashAlgorithm)}
                className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <option value="SHA-256">SHA-256</option>
                <option value="SHA-384">SHA-384</option>
                <option value="SHA-512">SHA-512</option>
              </select>
            </div>
            <div
              tabIndex={0}
              role="button"
              aria-label="Upload file for client-side hashing"
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10'
                  : 'border-gray-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-white dark:hover:bg-[#0a0f1a]'
              }`}
            >
              <FileUp className="w-6 h-6 text-emerald-500 mb-2" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Drop a file or click to browse</p>
              <p className="text-xs text-slate-500 mt-1">Background Web Worker · Maximum supported input size: 1GB, subject to browser/device memory</p>
              <input
                type="file"
                ref={fileInputRef}
                onClick={e => { e.currentTarget.value = ''; }}
                onChange={e => { const f = e.target.files?.[0]; if (f) hashFile(f); }}
                className="hidden"
                aria-hidden="true"
              />
            </div>
            {isFileHashing && (
              <div className="space-y-2" aria-live="polite">
                <div className="flex items-center justify-between gap-3 text-sm text-emerald-600 font-medium">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Calculating {fileHashAlgorithm}… {fileProgress}%
                  </span>
                  <button
                    type="button"
                    onClick={cancelFileHash}
                    className="text-xs text-red-500 hover:text-red-600 underline font-semibold focus-visible:outline-none"
                  >
                    Cancel
                  </button>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden" role="progressbar" aria-valuenow={fileProgress} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full bg-emerald-500 transition-[width] duration-150" style={{ width: `${fileProgress}%` }} />
                </div>
              </div>
            )}
            {fileError && (
              <div role="alert" className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl p-3">
                {fileError}
              </div>
            )}
            {fileHash && (
              <div className="bg-white dark:bg-[#0a0f1a] border border-emerald-200 dark:border-emerald-800/50 p-3 rounded-xl flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-slate-500 mb-1 truncate">
                    {fileName} · {(fileSize / 1024 / 1024).toFixed(2)} MB · {fileHashAlgorithm}
                  </div>
                  <span tabIndex={0} className="font-mono text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 break-all select-all focus-visible:outline-none">
                    {fileHash}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Copy file hash"
                  onClick={() => copy(fileHash, 'hash')}
                  className="p-2 shrink-0 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {copiedHash === fileHash ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}
          </section>

          {/* COMPROMISED PASSWORD CHECK */}
          <section aria-labelledby="heading-breach" className="bg-gray-50 dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
            <h2 id="heading-breach" className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-3">
              <EyeOff className="w-5 h-5 text-emerald-600" /> Compromised Password Check
            </h2>
            <label htmlFor="input-breach-check" className="text-xs text-slate-500 dark:text-slate-400">
              Check an existing password against known public data breaches (SHA-1 k-anonymity protocol):
            </label>
            <input
              id="input-breach-check"
              type="text"
              value={breachInput}
              onChange={e => {
                setBreachInput(e.target.value);
                setBreachCount(null);
                setBreachError('');
              }}
              placeholder="Enter a test string to check SHA-1 prefix exposure..."
              autoComplete="off"
              style={{ WebkitTextSecurity: 'disc' } as CSSProperties}
              className="w-full px-4 py-3 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white text-sm"
            />
            <button
              type="button"
              onClick={runBreachCheck}
              disabled={breachChecking || !breachInput.trim()}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Search className="w-4 h-4" /> {breachChecking ? 'Checking known breaches…' : 'Check Exposure (k-Anonymity)'}
            </button>
            {breachCount !== null && (
              <div
                role="status"
                aria-live="polite"
                className={`rounded-xl p-4 border ${
                  breachCount > 0
                    ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-300'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-900/20 dark:text-emerald-300'
                }`}
              >
                <div className="font-bold">
                  {breachCount > 0
                    ? `Found in known breach datasets: ${breachCount.toLocaleString()} occurrence${breachCount === 1 ? '' : 's'}.`
                    : 'No matches found in the current Pwned Passwords dataset.'}
                </div>
                <div className="text-xs mt-1 opacity-80">
                  k-anonymity protocol: Only the first 5 characters of the locally computed SHA-1 hash are transmitted to HIBP with padding enabled. Freshly generated passwords are never tested to guarantee zero exposure.
                </div>
              </div>
            )}
            {breachError && (
              <div role="alert" className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl p-3">
                {breachError}
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Uses the Have I Been Pwned Pwned Passwords range API with Add-Padding. Freshly generated credentials remain strictly on your device.
            </p>
          </section>

          {/* HASH COMPARE */}
          <section aria-labelledby="heading-compare" className="bg-gray-50 dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
            <h2 id="heading-compare" className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-3">
              <Scale className="w-5 h-5 text-emerald-600" /> Hash Checksum Comparator
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="input-hash-a" className="sr-only">Hash A</label>
                <input
                  id="input-hash-a"
                  value={hashA}
                  onChange={e => { setHashA(e.target.value.slice(0, 1024)); setHashCompareResult(''); }}
                  placeholder="Paste Hash A"
                  className="w-full px-4 py-3 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl font-mono text-sm dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="input-hash-b" className="sr-only">Hash B</label>
                <input
                  id="input-hash-b"
                  value={hashB}
                  onChange={e => { setHashB(e.target.value.slice(0, 1024)); setHashCompareResult(''); }}
                  placeholder="Paste Hash B"
                  className="w-full px-4 py-3 bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl font-mono text-sm dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={compareHashes}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-3 rounded-xl font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Compare Hashes
            </button>
            {hashCompareResult && (
              <div
                role="status"
                aria-live="polite"
                className={`rounded-xl p-4 border ${
                  hashCompareResult === 'match'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-900/20 dark:text-emerald-300'
                    : hashCompareResult === 'different'
                    ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300'
                    : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-300'
                }`}
              >
                {hashCompareResult === 'match'
                  ? '✓ Hashes match exactly.'
                  : hashCompareResult === 'different'
                  ? '≠ Hashes are different.'
                  : 'Enter two valid even-length hexadecimal strings to compare.'}
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparison normalizes whitespace and hex casing before comparing characters via bitwise XOR without early exit for equal-length strings. Note: Client-side single-user comparisons carry no remote timing attack surface, and JavaScript JIT engines do not guarantee hardware constant-time execution.
            </p>
          </section>
        </div>
      </div>

      {/* METHODOLOGY & SECURITY DISCLOSURES PANEL */}
      <section aria-labelledby="heading-methodology" className="bg-gray-50 dark:bg-[#111827] rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 id="heading-methodology" className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" /> Security Methodology &amp; Privacy Disclosures
          </h2>
          <button
            type="button"
            onClick={() => setShowMethodology(!showMethodology)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-1 focus-visible:outline-none"
            aria-expanded={showMethodology}
          >
            {showMethodology ? 'Hide Details' : 'View Details'} {showMethodology ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showMethodology && (
          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-gray-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Cryptographic Randomness &amp; Zero Modulo Bias</h3>
              <p>
                All generation operations rely exclusively on the browser&rsquo;s native Cryptographically Secure Pseudo-Random Number Generator (CSPRNG via <code className="font-mono text-blue-600 dark:text-blue-400">crypto.getRandomValues</code>). To select elements without modulo bias, unbiased rejection sampling is applied over the 32-bit unsigned integer range.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Theoretical Entropy Estimates</h3>
              <p>
                Entropy values displayed are theoretical metrics reflecting the combinatorial keyspace size under uniform random generation. For character passwords, theoretical entropy is calculated from the active pool. For passphrases of W words sampled without replacement from a 1,024-word dictionary, the keyspace is P(1024, W) = 1024! / (1024 - W)!, yielding sum(log₂(1024 - i)) bits plus ~13.3 bits if a 4-digit numeric suffix is appended. Theoretical entropy measures the search space size and must not be interpreted as a guaranteed real-world crack-time estimate, which depends on attacker hardware, offline vs online rate limiting, and password hashing algorithms (e.g. Argon2id vs unsalted hashes).
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Passphrase Architecture</h3>
              <p>
                Passphrases are sampled uniformly without replacement as an ordered sequence from an auditable 1,024-word English dictionary. Suffix numbers are sampled uniformly from 0000 to 9999 (providing ~13.29 bits). Deterministic user settings (such as capitalization and word separator) add zero bits of random entropy and are not double-counted.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Hash Classifications &amp; Password Storage Notice</h3>
              <p>
                SHA-256, SHA-384, and SHA-512 are recommended modern cryptographic digests. MD5 and SHA-1 are retained exclusively for legacy checksum verification and are vulnerable to collision attacks. Fast cryptographic hashes are <strong>not</strong> suitable for storing passwords. For password storage, always use a dedicated memory-hard Key Derivation Function (KDF) such as Argon2id, scrypt, or bcrypt with appropriate work factors.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Breach Verification (k-Anonymity)</h3>
              <p>
                The breach checker computes the SHA-1 digest locally and transmits strictly the first 5 hexadecimal characters to the Have I Been Pwned range API with padding enabled. The remaining 35 characters are evaluated entirely inside your browser. Freshly generated passwords are never sent to HIBP to prevent unintended network disclosure.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Privacy &amp; Memory Retention</h3>
              <p>
                This tool does not store sensitive values in localStorage, sessionStorage, cookies, IndexedDB, or URL parameters. Sensitive values exist only in browser memory while the tab is active. Note that because JavaScript engines manage garbage collection, physical memory wiping cannot be cryptographically guaranteed by browser script code.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
