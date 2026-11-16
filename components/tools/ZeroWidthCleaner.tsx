'use client';

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useDeferredValue,
  type DragEvent,
  type ChangeEvent,
} from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  Trash2,
  Upload,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  FileCheck2,
  Search,
  Unlock,
  Code2,
  Sliders,
  Layers,
  RefreshCw,
  ChevronRight,
  Wand2,
  CheckCircle2,
  Zap,
  Cpu,
} from 'lucide-react';

import {
  scanAndCleanUnicodeText,
  getDefaultCleanerOptions,
  encodeStegoWatermark,
  exportUnicodeAuditCsv,
  exportUnicodeAuditXlsx,
  generateCleanlinessCertificateJson,
  ZERO_WIDTH_SAMPLE_PRESETS,
  MAX_SAFE_TEXT_BYTES,
  type CleanerOptions,
  type CleanerPresetId,
  type ThreatCategory,
  type UnicodeNormalizationForm,
  type CodePointFinding,
  type StegoEncodeOptions,
} from '@/lib/zeroWidthCleanerEngine';

type WorkbenchTab =
  | 'cleaner_xray'
  | 'forensic_ledger'
  | 'stego_decoder'
  | 'secops_audit'
  | 'sandbox_encoder';

const PRESET_DEFINITIONS: Array<{
  id: CleanerPresetId;
  label: string;
  shortBadge: string;
  description: string;
}> = [
    {
      id: 'smart_ai_watermark',
      label: 'Smart AI Watermark Clean (Recommended)',
      shortBadge: 'Context-Safe',
      description:
        'Strips ChatGPT/Claude/Gemini zero-width watermarks, normalizes U+202F/U+00A0 spaces to ASCII space, and preserves valid Emojis (👨‍👩‍👧, ❤️), Regional Flags (🏴󠁧󠁢󠁥󠁮󠁧󠁿), and Urdu/Persian/Indic ZWNJ.',
    },
    {
      id: 'prompt_injection_forensic',
      label: 'Prompt-Injection & Steganography Forensic',
      shortBadge: 'AI Security',
      description:
        'Decodes and strips Plane 14 Tag ASCII smuggling, Variation Selector Supplement (VS17–VS256) byte payloads, Base-4 math operators, and binary ZWSP/ZWNJ steganography while keeping valid emojis intact.',
    },
    {
      id: 'source_code_secops',
      label: 'Source Code & DevSecOps Strict (CVE Guard)',
      shortBadge: 'Trojan Source + Homoglyphs',
      description:
        'Neutralizes Trojan Source BiDi overrides (CVE-2021-42574), folds mixed-script Cyrillic/Greek homoglyphs (CVE-2021-42694) to ASCII, and converts smart quotes/em-dashes for clean compiler builds.',
    },
    {
      id: 'multilingual_preserve',
      label: 'Multilingual & RTL Script Safe (Urdu / Arabic / Indic)',
      shortBadge: 'RTL + CJK Safe',
      description:
        'Removes zero-width watermarks and tag smuggling while preserving legitimate RTL directional marks and script-joining ZWNJ with NFC normalization.',
    },
    {
      id: 'strict_nuclear_strip',
      label: 'Strict Nuclear Strip (All Non-ASCII Invisibles + NFKC)',
      shortBadge: 'Maximum Strip',
      description:
        'Strips all zero-width joiners, variation selectors, BiDi controls, tag characters, folds homoglyphs, and applies NFKC compatibility normalization.',
    },
  ];

const CATEGORY_METADATA: Record<
  ThreatCategory,
  { label: string; badgeClass: string; dotClass: string }
> = {
  zero_width: {
    label: 'Zero-Width Formatters',
    badgeClass:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/70',
    dotClass: 'bg-rose-500',
  },
  invisible_math: {
    label: 'Invisible Math Operators',
    badgeClass:
      'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800/70',
    dotClass: 'bg-orange-500',
  },
  bidi_control: {
    label: 'Trojan Source BiDi Controls',
    badgeClass:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/80',
    dotClass: 'bg-red-600',
  },
  tag_smuggling: {
    label: 'Plane 14 Tag Smuggling',
    badgeClass:
      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/70',
    dotClass: 'bg-purple-500',
  },
  variation_selector: {
    label: 'Variation Selectors (VS1–VS256)',
    badgeClass:
      'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-950/50 dark:text-fuchsia-300 dark:border-fuchsia-800/70',
    dotClass: 'bg-fuchsia-500',
  },
  blank_filler: {
    label: 'Blank / Braille / Hangul Fillers',
    badgeClass:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/70',
    dotClass: 'bg-amber-500',
  },
  unusual_space: {
    label: 'AI Watermark Spaces (NNBSP / NBSP)',
    badgeClass:
      'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/70',
    dotClass: 'bg-sky-500',
  },
  line_separator: {
    label: 'Unicode Line / Paragraph Breaks',
    badgeClass:
      'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800/70',
    dotClass: 'bg-cyan-500',
  },
  control_char: {
    label: 'C0 / C1 Control Codes',
    badgeClass:
      'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dotClass: 'bg-slate-500',
  },
  homoglyph: {
    label: 'Mixed-Script Homoglyphs',
    badgeClass:
      'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/70',
    dotClass: 'bg-indigo-500',
  },
  llm_typography: {
    label: 'LLM Smart Typography',
    badgeClass:
      'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/70',
    dotClass: 'bg-teal-500',
  },
};

const MAX_RENDERED_XRAY_SEGMENTS = 1200;
const MAX_RENDERED_LEDGER_ROWS = 500;

export default function ZeroWidthCleaner() {
  const [inputText, setInputText] = useState<string>(
    ZERO_WIDTH_SAMPLE_PRESETS[0]?.sampleText ?? ''
  );
  const deferredInputText = useDeferredValue(inputText);

  const [options, setOptions] = useState<CleanerOptions>(() =>
    getDefaultCleanerOptions('smart_ai_watermark')
  );
  const [activeTab, setActiveTab] = useState<WorkbenchTab>('cleaner_xray');
  const [showFineGrainedControls, setShowFineGrainedControls] = useState<boolean>(false);
  const [selectedFinding, setSelectedFinding] = useState<CodePointFinding | null>(null);
  const [ledgerSearch, setLedgerSearch] = useState<string>('');
  const [ledgerCategoryFilter, setLedgerCategoryFilter] = useState<ThreatCategory | 'ALL'>('ALL');
  const [ledgerActionFilter, setLedgerActionFilter] = useState<string>('ALL');
  const [showAllXraySegments, setShowAllXraySegments] = useState<boolean>(false);
  const [showAllLedgerRows, setShowAllLedgerRows] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Copy & UI Feedback states
  const [copiedCleaned, setCopiedCleaned] = useState<boolean>(false);
  const [copiedPayloadIndex, setCopiedPayloadIndex] = useState<number | null>(null);
  const [copiedCert, setCopiedCert] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Sandbox Watermark Encoder state (Tab 5)
  const [sandboxCarrier, setSandboxCarrier] = useState<string>(
    'Confidential Q4 Product Roadmap: Launch autonomous security scanner across all enterprise regions.'
  );
  const [sandboxSecret, setSandboxSecret] = useState<string>('LEAK-TRACE:USER-8821');
  const [sandboxProtocol, setSandboxProtocol] =
    useState<StegoEncodeOptions['protocol']>('plane14_tag_ascii');
  const [sandboxPosition, setSandboxPosition] =
    useState<StegoEncodeOptions['insertPosition']>('after_first_word');
  const [copiedSandboxOutput, setCopiedSandboxOutput] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Run the core forensic scan & cleaning engine synchronously on deferred input
  const scanResult = useMemo(() => {
    return scanAndCleanUnicodeText(deferredInputText, options);
  }, [deferredInputText, options]);

  // Compute Sandbox Watermarked Output
  const sandboxWatermarkedOutput = useMemo(() => {
    return encodeStegoWatermark(sandboxCarrier, sandboxSecret, {
      protocol: sandboxProtocol,
      insertPosition: sandboxPosition,
    });
  }, [sandboxCarrier, sandboxSecret, sandboxProtocol, sandboxPosition]);

  // Preset selector handler
  const handleSelectPreset = useCallback((presetId: CleanerPresetId) => {
    setOptions(getDefaultCleanerOptions(presetId));
  }, []);

  // Load sample preset
  const handleLoadSample = useCallback((sampleId: string) => {
    const found = ZERO_WIDTH_SAMPLE_PRESETS.find((item) => item.id === sampleId);
    if (!found) return;
    setFileError(null);
    setUploadedFileName(null);
    setSelectedFinding(null);
    setOptions(getDefaultCleanerOptions(found.recommendedPreset));
    setInputText(found.sampleText);
  }, []);

  // Toggle individual boolean option
  const handleToggleOption = useCallback((key: keyof CleanerOptions) => {
    setOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  // Change Unicode normalization form
  const handleNormalizationChange = useCallback((form: UnicodeNormalizationForm) => {
    setOptions((prev) => ({
      ...prev,
      normalizationForm: form,
    }));
  }, []);

  // Copy cleaned output
  const handleCopyCleaned = useCallback(async () => {
    if (!scanResult.cleanedText) return;
    try {
      await navigator.clipboard.writeText(scanResult.cleanedText);
      setCopiedCleaned(true);
      setTimeout(() => setCopiedCleaned(false), 2000);
    } catch {
      // Fallback copy
    }
  }, [scanResult.cleanedText]);

  // Replace input with cleaned text
  const handleApplyCleanedToInput = useCallback(() => {
    setInputText(scanResult.cleanedText);
    setSelectedFinding(null);
  }, [scanResult.cleanedText]);

  // File Upload processor
  const processUploadedFile = useCallback((file: File) => {
    setFileError(null);
    if (file.size > MAX_SAFE_TEXT_BYTES) {
      setFileError(
        `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 15 MB browser safety limit.`
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = typeof event.target?.result === 'string' ? event.target.result : '';
      setUploadedFileName(file.name);
      setInputText(content);
      setSelectedFinding(null);
    };
    reader.onerror = () => {
      setFileError('Unable to read the uploaded file as UTF-8 text.');
    };
    reader.readAsText(file, 'utf-8');
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file) processUploadedFile(file);
    },
    [processUploadedFile]
  );

  const handleFileInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) processUploadedFile(file);
      event.target.value = '';
    },
    [processUploadedFile]
  );

  // Download helpers
  const triggerBlobDownload = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, []);

  const cleanedDownloadFileName = useMemo(() => {
    if (!uploadedFileName) return 'kivarotools-cleaned-text.txt';
    const dotIdx = uploadedFileName.lastIndexOf('.');
    if (dotIdx <= 0) return `${uploadedFileName}-cleaned.txt`;
    const base = uploadedFileName.slice(0, dotIdx);
    const ext = uploadedFileName.slice(dotIdx);
    return `${base}.cleaned${ext}`;
  }, [uploadedFileName]);

  const handleDownloadCleanedFile = useCallback(() => {
    const blob = new Blob([scanResult.cleanedText], { type: 'text/plain;charset=utf-8' });
    triggerBlobDownload(blob, cleanedDownloadFileName);
  }, [scanResult.cleanedText, cleanedDownloadFileName, triggerBlobDownload]);

  const handleDownloadAuditCsv = useCallback(() => {
    const csv = exportUnicodeAuditCsv(scanResult);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    triggerBlobDownload(blob, 'kivarotools-unicode-forensic-ledger.csv');
  }, [scanResult, triggerBlobDownload]);

  const handleDownloadAuditXlsx = useCallback(() => {
    const bytes = exportUnicodeAuditXlsx(scanResult);
    const blob = new Blob([bytes as unknown as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    triggerBlobDownload(blob, 'kivarotools-unicode-forensic-audit.xlsx');
  }, [scanResult, triggerBlobDownload]);

  const handleDownloadCertificateJson = useCallback(() => {
    const json = generateCleanlinessCertificateJson(scanResult);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    triggerBlobDownload(blob, 'kivarotools-cleanliness-certificate.json');
  }, [scanResult, triggerBlobDownload]);

  const handleCopyCertificateJson = useCallback(async () => {
    const json = generateCleanlinessCertificateJson(scanResult);
    try {
      await navigator.clipboard.writeText(json);
      setCopiedCert(true);
      setTimeout(() => setCopiedCert(false), 2000);
    } catch {
      // ignore
    }
  }, [scanResult]);

  // Filtered detailed ledger findings
  const filteredFindings = useMemo(() => {
    const query = ledgerSearch.trim().toLowerCase();
    return scanResult.findings.filter((item) => {
      if (ledgerCategoryFilter !== 'ALL' && item.category !== ledgerCategoryFilter) {
        return false;
      }
      if (ledgerActionFilter !== 'ALL' && item.action !== ledgerActionFilter) {
        return false;
      }
      if (!query) return true;
      return (
        item.hexCode.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.shortLabel.toLowerCase().includes(query) ||
        item.contextSnippet.toLowerCase().includes(query) ||
        item.reason.toLowerCase().includes(query)
      );
    });
  }, [scanResult.findings, ledgerSearch, ledgerCategoryFilter, ledgerActionFilter]);

  const visibleXraySegments = useMemo(() => {
    if (showAllXraySegments || scanResult.xraySegments.length <= MAX_RENDERED_XRAY_SEGMENTS) {
      return scanResult.xraySegments;
    }
    return scanResult.xraySegments.slice(0, MAX_RENDERED_XRAY_SEGMENTS);
  }, [scanResult.xraySegments, showAllXraySegments]);

  const visibleLedgerRows = useMemo(() => {
    if (showAllLedgerRows || filteredFindings.length <= MAX_RENDERED_LEDGER_ROWS) {
      return filteredFindings;
    }
    return filteredFindings.slice(0, MAX_RENDERED_LEDGER_ROWS);
  }, [filteredFindings, showAllLedgerRows]);

  const securityAlertCount =
    scanResult.bidiAnomalies.length + scanResult.mixedScriptTokens.length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 overflow-x-hidden">
      {/* Top Privacy & Zero-Telemetry Architecture Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:px-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:via-[#0F172A] dark:to-slate-900 text-white border border-slate-700/80 shadow-sm">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-bold tracking-tight text-white">
                100% Client-Side Unicode Forensics &amp; AI Watermark Sanitizer
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Zero Server Uploads
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Scans 85+ invisible code points, Plane 14 prompt injections, Trojan Source BiDi controls, and UAX #39 homoglyphs in browser RAM while protecting Emojis &amp; Urdu/Arabic/Indic scripts.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-[11px] font-mono text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            {scanResult.executionTimeMs.toFixed(2)} ms
          </span>
          {scanResult.verificationPassed && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-[11px] font-semibold text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified Idempotent
            </span>
          )}
        </div>
      </div>

      {/* Sample Presets & Policy Mode Selector Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Policy Mode Selector */}
          <div className="flex-1 min-w-0">
            <label
              htmlFor="cleaner-preset-select"
              className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
            >
              Sanitization Policy Preset
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              <select
                id="cleaner-preset-select"
                value={options.preset}
                onChange={(e) => handleSelectPreset(e.target.value as CleanerPresetId)}
                className="w-full sm:w-auto flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PRESET_DEFINITIONS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowFineGrainedControls((prev) => !prev)}
                className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-colors shrink-0 ${showFineGrainedControls
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-blue-500'
                  }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                {showFineGrainedControls ? 'Hide Policy Rules' : 'Customize Rules (12)'}
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              {PRESET_DEFINITIONS.find((p) => p.id === options.preset)?.description}
            </p>
          </div>

          {/* 1-Click Forensic Sample Payloads */}
          <div className="lg:w-[440px] shrink-0 min-w-0">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Load Real-World Forensic Sample
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {ZERO_WIDTH_SAMPLE_PRESETS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleLoadSample(sample.id)}
                  className="flex flex-col items-start p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all text-left min-w-0"
                >
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate w-full">
                    {sample.title}
                  </span>
                  <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">
                    {sample.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Collapsible 12-Rule Fine-Grained Matrix */}
        {showFineGrainedControls && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Fine-Grained Context-Aware Sanitization Controls
              </h3>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="unicode-norm-select"
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Unicode Normalization:
                </label>
                <select
                  id="unicode-norm-select"
                  value={options.normalizationForm}
                  onChange={(e) =>
                    handleNormalizationChange(e.target.value as UnicodeNormalizationForm)
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="NONE">NONE (Preserve Canonical Forms)</option>
                  <option value="NFC">NFC (Canonical Composition)</option>
                  <option value="NFD">NFD (Canonical Decomposition)</option>
                  <option value="NFKC">NFKC (Compatibility Composition)</option>
                  <option value="NFKD">NFKD (Compatibility Decomposition)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {[
                {
                  key: 'protectEmojiAndJoiners' as const,
                  title: 'Protect Emojis & Keycaps (ZWJ / VS16)',
                  desc: 'Keep U+200D & U+FE0F inside valid 👨‍👩‍👧 & ❤️ sequences',
                },
                {
                  key: 'protectScriptZwnj' as const,
                  title: 'Protect Urdu / Persian / Indic ZWNJ',
                  desc: 'Preserve U+200C between cursive Arabic/Persian/Indic letters',
                },
                {
                  key: 'protectRegionalFlags' as const,
                  title: 'Protect Regional Subdivision Flags',
                  desc: 'Preserve valid 🏴󠁧󠁢󠁥󠁮󠁧󠁿 / 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Plane 14 tag sequences',
                },
                {
                  key: 'removeZeroWidth' as const,
                  title: 'Strip Orphan Zero-Width Spaces',
                  desc: 'Remove U+200B, U+2060, U+180E, U+00AD, and orphan joiners',
                },
                {
                  key: 'normalizeUnusualSpaces' as const,
                  title: 'Normalize AI Spaces (U+202F → Space)',
                  desc: 'Convert NNBSP, NBSP & figure spaces to U+0020 without merging words',
                },
                {
                  key: 'removeTagCharacters' as const,
                  title: 'Strip Plane 14 Tag Smuggling',
                  desc: 'Remove invisible U+E0000–U+E007F prompt-injection tags',
                },
                {
                  key: 'removeOrphanVariationSelectors' as const,
                  title: 'Strip Variation Selector Stego (VS17–256)',
                  desc: 'Remove U+E0100–U+E01EF & orphan BMP variation selectors',
                },
                {
                  key: 'removeBidiControls' as const,
                  title: 'Strip Trojan Source BiDi Controls',
                  desc: 'Remove U+202A–U+202E & U+2066–U+2069 directional overrides',
                },
                {
                  key: 'removeInvisibleMath' as const,
                  title: 'Strip Invisible Math Operators',
                  desc: 'Remove U+2061–U+2064 function application & invisible times',
                },
                {
                  key: 'removeBlankFillers' as const,
                  title: 'Strip Blank & Braille/Hangul Fillers',
                  desc: 'Remove U+2800, U+3164, U+115F, U+1160, U+FFA0 blank glyphs',
                },
                {
                  key: 'foldMixedScriptHomoglyphs' as const,
                  title: 'Fold Cyrillic/Greek Homoglyphs to ASCII',
                  desc: 'Replace mixed-script lookalikes (e.g., Cyrillic "а" → Latin "a")',
                },
                {
                  key: 'normalizeLlmTypography' as const,
                  title: 'Normalize LLM Curly Quotes & Em-Dashes',
                  desc: 'Convert “smart quotes”, ‘apostrophes’, — em-dashes & … to ASCII',
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 cursor-pointer hover:border-blue-400 transition-colors min-w-0"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(options[item.key])}
                    onChange={() => handleToggleOption(item.key)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Real-Time Forensic Scorecards (Responsive 2-col on mobile, 5-col on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: Total Findings */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Detected Anomalies
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {scanResult.totalFindingsCount.toLocaleString()}
            </span>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
              {scanResult.highRiskCount} High Risk
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Across {scanResult.aggregatedSummary.length} distinct code points
          </div>
        </div>

        {/* Card 2: Removed vs Normalized */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Sanitized &amp; Stripped
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {(scanResult.removedCount + scanResult.replacedCount).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({scanResult.removedCount} del / {scanResult.replacedCount} norm)
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {scanResult.originalByteLength - scanResult.cleanedByteLength} hidden bytes purged
          </div>
        </div>

        {/* Card 3: Context-Protected (Emoji / RTL) */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Protected In Context
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
              {scanResult.keptInContextCount.toLocaleString()}
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
              Emoji / Script Safe
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Valid ZWJ, VS16, Flags &amp; Urdu/Indic ZWNJ
          </div>
        </div>

        {/* Card 4: Hidden Steganography Payloads */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Stego / Tag Payloads
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={`text-xl sm:text-2xl font-extrabold font-mono ${scanResult.decodedPayloads.length > 0
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-slate-900 dark:text-white'
                }`}
            >
              {scanResult.decodedPayloads.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {scanResult.decodedPayloads.length > 0 ? 'Decoded!' : 'None found'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Plane 14 Tags, VS17–256 &amp; Binary ZW
          </div>
        </div>

        {/* Card 5: AI Watermark & Threat Score */}
        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Watermark / Threat Score
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={`text-xl sm:text-2xl font-extrabold font-mono ${scanResult.aiWatermarkRiskScore >= 60
                  ? 'text-rose-600 dark:text-rose-400'
                  : scanResult.aiWatermarkRiskScore >= 25
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
            >
              {scanResult.aiWatermarkRiskScore}/100
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              NNBSP: {scanResult.llmFingerprint.nnbspCount}
            </span>
          </div>
          <div
            className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate"
            title={scanResult.llmFingerprint.detectedSignatureLabel}
          >
            {scanResult.llmFingerprint.detectedSignatureLabel}
          </div>
        </div>
      </div>

      {/* Instant Steganography / Trojan Source Alert Banner when high-severity payloads exist */}
      {(scanResult.decodedPayloads.length > 0 || securityAlertCount > 0) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/80 text-rose-950 dark:text-rose-200">
          <div className="flex items-start gap-3 min-w-0">
            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="min-w-0 space-y-1">
              <div className="text-xs sm:text-sm font-bold">
                Active Hidden Unicode Payload or Security Anomaly Detected!
              </div>
              {scanResult.decodedPayloads.map((payload, idx) => (
                <div key={idx} className="text-xs font-mono break-all">
                  <span className="font-semibold text-rose-700 dark:text-rose-300">
                    [{payload.protocolLabel} @ L{payload.startLine}:C{payload.startColumn}]:
                  </span>{' '}
                  <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/70 font-bold">
                    &ldquo;{payload.decodedText}&rdquo;
                  </span>
                </div>
              ))}
              {scanResult.bidiAnomalies.length > 0 && (
                <div className="text-xs">
                  • <strong>{scanResult.bidiAnomalies.length} Trojan Source BiDi Line(s)</strong>{' '}
                  (CVE-2021-42574) detected with unclosed directional overrides/isolates.
                </div>
              )}
              {scanResult.mixedScriptTokens.length > 0 && (
                <div className="text-xs">
                  •{' '}
                  <strong>
                    {scanResult.mixedScriptTokens.length} Mixed-Script Homoglyph Token(s)
                  </strong>{' '}
                  (CVE-2021-42694) detected:{' '}
                  {scanResult.mixedScriptTokens
                    .slice(0, 3)
                    .map((t) => `"${t.word}" → "${t.foldedWord}"`)
                    .join(', ')}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {scanResult.decodedPayloads.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('stego_decoder')}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Inspect Stego Payload
              </button>
            )}
            {securityAlertCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('secops_audit')}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Open Security Audit
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5-Tab Responsive Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] border-b border-slate-200 dark:border-slate-800">
        {[
          {
            id: 'cleaner_xray' as const,
            label: 'Cleaner & X-Ray Inspector',
            icon: Eye,
            badge: scanResult.totalFindingsCount,
          },
          {
            id: 'forensic_ledger' as const,
            label: 'Forensic Character Ledger',
            icon: Layers,
            badge: scanResult.aggregatedSummary.length,
          },
          {
            id: 'stego_decoder' as const,
            label: 'Steganography & Prompt-Injection Decoder',
            icon: Unlock,
            badge: scanResult.decodedPayloads.length,
            highlight: scanResult.decodedPayloads.length > 0,
          },
          {
            id: 'secops_audit' as const,
            label: 'Trojan Source & Homoglyph Audit',
            icon: ShieldAlert,
            badge: securityAlertCount,
            highlight: securityAlertCount > 0,
          },
          {
            id: 'sandbox_encoder' as const,
            label: 'Watermark Sandbox Encoder',
            icon: Wand2,
            badge: null,
          },
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border-b-2 shrink-0 ${isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/30'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                }`}
            >
              <IconComponent className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-mono rounded-full ${tab.highlight
                      ? 'bg-rose-600 text-white font-extrabold'
                      : isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.json,.csv,.ts,.tsx,.js,.jsx,.py,.html,.xml,.yaml,.yml,.sql,.log,.env"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {fileError && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>{fileError}</span>
          <button
            type="button"
            onClick={() => setFileError(null)}
            className="text-xs font-bold underline ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* =====================================================================
          TAB 1: CLEANER & X-RAY INSPECTOR
         ===================================================================== */}
      {activeTab === 'cleaner_xray' && (
        <div className="space-y-6">
          {/* Dual Pane: Raw Input (Left) & Sanitized Output (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* LEFT PANE: RAW INPUT */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex flex-col rounded-2xl bg-white dark:bg-slate-900 border shadow-xs overflow-hidden min-w-0 ${isDragging
                  ? 'border-blue-500 ring-2 ring-blue-500/30'
                  : 'border-gray-200 dark:border-slate-800'
                }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800/70 border-b border-gray-200 dark:border-slate-800">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                  <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                    {uploadedFileName
                      ? `Raw Input (${uploadedFileName})`
                      : 'Raw Input Text / Code (Paste or Drop File)'}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-500 text-xs font-semibold transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputText('');
                      setUploadedFileName(null);
                      setSelectedFinding(null);
                    }}
                    disabled={!inputText}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 text-xs font-semibold transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </button>
                </div>
              </div>

              <div className="relative flex-1 min-h-[260px] sm:min-h-[320px]">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste AI-generated text (ChatGPT, Claude, Gemini), source code, or suspicious text here to detect and strip zero-width watermarks, hidden tags, and Trojan Source characters..."
                  spellCheck={false}
                  aria-label="Raw input text to scan for invisible characters"
                  className="w-full h-full min-h-[260px] sm:min-h-[320px] p-4 bg-transparent text-slate-800 dark:text-slate-200 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none resize-y"
                />
                {isDragging && (
                  <div className="absolute inset-0 bg-blue-600/10 dark:bg-blue-500/20 backdrop-blur-xs flex items-center justify-center pointer-events-none">
                    <div className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 shadow-md border border-blue-500 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Drop file to scan in browser RAM
                    </div>
                  </div>
                )}
              </div>

              <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>
                  UTF-8 Bytes: <strong>{scanResult.originalByteLength.toLocaleString()}</strong> |
                  Code Points:{' '}
                  <strong>{scanResult.originalCodePointCount.toLocaleString()}</strong> | Graphemes:{' '}
                  <strong>{scanResult.originalGraphemeCount.toLocaleString()}</strong>
                </span>
                <span className="truncate max-w-[240px]" title={scanResult.originalSha256}>
                  SHA-256: {scanResult.originalSha256.slice(0, 12)}…
                </span>
              </div>
            </div>

            {/* RIGHT PANE: SANITIZED OUTPUT */}
            <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs overflow-hidden min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-emerald-50/60 dark:bg-emerald-950/20 border-b border-gray-200 dark:border-slate-800">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                    Sanitized &amp; Normalized Output
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopyCleaned}
                    disabled={!scanResult.cleanedText}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-40"
                  >
                    {copiedCleaned ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Clean Text
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyCleanedToInput}
                    disabled={!scanResult.cleanedText || scanResult.cleanedText === inputText}
                    title="Replace raw input with sanitized text"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-500 text-xs font-semibold transition-colors disabled:opacity-40"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Replace Input
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadCleanedFile}
                    disabled={!scanResult.cleanedText}
                    title={`Download as ${cleanedDownloadFileName}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-500 text-xs font-semibold transition-colors disabled:opacity-40"
                  >
                    <Download className="w-3.5 h-3.5" />{' '}
                    {uploadedFileName ? 'Save Clean File' : '.TXT'}
                  </button>
                </div>
              </div>

              <div className="relative flex-1 min-h-[260px] sm:min-h-[320px]">
                <textarea
                  readOnly
                  value={scanResult.cleanedText}
                  placeholder="Sanitized output will appear here automatically..."
                  spellCheck={false}
                  aria-label="Sanitized output text"
                  className="w-full h-full min-h-[260px] sm:min-h-[320px] p-4 bg-emerald-50/10 dark:bg-emerald-950/5 text-slate-800 dark:text-slate-200 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none resize-y"
                />
              </div>

              <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>
                  UTF-8 Bytes: <strong>{scanResult.cleanedByteLength.toLocaleString()}</strong> |
                  Code Points:{' '}
                  <strong>{scanResult.cleanedCodePointCount.toLocaleString()}</strong> | Graphemes:{' '}
                  <strong>{scanResult.cleanedGraphemeCount.toLocaleString()}</strong>
                </span>
                <span className="truncate max-w-[240px]" title={scanResult.cleanedSha256}>
                  SHA-256: {scanResult.cleanedSha256.slice(0, 12)}…
                </span>
              </div>
            </div>
          </div>

          {/* Export Bar: CSV, Native 3-Sheet Excel (.xlsx), and SHA-256 Cleanliness Certificate */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                Forensic Audit Reports &amp; Cryptographic Cleanliness Certificate
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Export CWE-1236 formula-safe 3-sheet Excel workbooks or a SHA-256 before/after verification receipt for compliance and CI/CD audits.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadAuditXlsx}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Export 3-Sheet Excel (.XLSX)
              </button>
              <button
                type="button"
                onClick={handleDownloadAuditCsv}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-500 text-xs font-semibold transition-colors"
              >
                <FileText className="w-3.5 h-3.5" /> Audit Ledger (.CSV)
              </button>
              <button
                type="button"
                onClick={handleDownloadCertificateJson}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-500 text-xs font-semibold transition-colors"
              >
                <FileCheck2 className="w-3.5 h-3.5" /> SHA-256 Certificate (.JSON)
              </button>
              <button
                type="button"
                onClick={handleCopyCertificateJson}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-500 text-xs font-semibold transition-colors"
              >
                {copiedCert ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied Receipt
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Receipt
                  </>
                )}
              </button>
            </div>
          </div>

          {/* LIVE INTERACTIVE X-RAY VISUALIZER */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 sm:px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    Interactive X-Ray Character Visualizer (Click Any Badge to Inspect)
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Renders every hidden code point inline at its exact position. Red/Purple badges were stripped, Sky badges were normalized to ASCII space, and Emerald badges were protected in context.
                </p>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold shrink-0">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                  Removed
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                  Normalized → Space/ASCII
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  ✓ Kept in Context (Emoji/RTL)
                </span>
              </div>
            </div>

            {/* Selected Finding Inspector Card */}
            {selectedFinding && (
              <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-xs font-bold">
                      {selectedFinding.hexCode} ({selectedFinding.shortLabel})
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {selectedFinding.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Action: {selectedFinding.action}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 font-mono flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      Location:{' '}
                      <strong>
                        Line {selectedFinding.line}, Col {selectedFinding.column}
                      </strong>
                    </span>
                    <span>
                      UTF-8 Bytes: <strong>{selectedFinding.utf8Hex}</strong>
                    </span>
                    <span>
                      JS Escape: <strong>{selectedFinding.utf16Units}</strong>
                    </span>
                    <span>
                      Byte Offset: <strong>{selectedFinding.utf8ByteOffset}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    <strong>Forensic Reason:</strong> {selectedFinding.reason}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFinding(null)}
                  className="self-end sm:self-center px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0"
                >
                  Close Inspector
                </button>
              </div>
            )}

            {/* X-Ray Content Stream */}
            <div className="p-4 sm:p-5 max-h-[380px] overflow-y-auto font-mono text-xs sm:text-sm leading-7 whitespace-pre-wrap break-words text-slate-800 dark:text-slate-200">
              {visibleXraySegments.length === 0 ? (
                <span className="text-slate-400 italic">
                  Enter or paste text above to inspect invisible Unicode characters in X-Ray mode...
                </span>
              ) : (
                visibleXraySegments.map((seg, index) => {
                  if (seg.type === 'text') {
                    return <React.Fragment key={index}>{seg.text}</React.Fragment>;
                  }
                  const f = seg.finding!;
                  const isKept = f.action === 'KEPT_IN_CONTEXT';
                  const isNormalized =
                    f.action === 'REPLACED_WITH_SPACE' ||
                    f.action === 'CONVERTED_TO_LF' ||
                    f.action === 'FOLDED_TO_ASCII';

                  const pillClasses = isKept
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700'
                    : isNormalized
                      ? 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-700'
                      : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700';

                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFinding(f)}
                      title={`${f.hexCode} ${f.name} — ${f.action} (${f.reason})`}
                      className={`inline-flex items-center gap-1 mx-0.5 px-1.5 py-0.5 rounded-md border text-[11px] font-mono font-bold align-baseline cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all ${pillClasses}`}
                    >
                      <span>{f.hexCode}</span>
                      <span>{f.shortLabel}</span>
                      {isKept && <span>✓</span>}
                    </button>
                  );
                })
              )}
            </div>

            {scanResult.xraySegments.length > MAX_RENDERED_XRAY_SEGMENTS &&
              !showAllXraySegments && (
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Showing first {MAX_RENDERED_XRAY_SEGMENTS.toLocaleString()} of{' '}
                    {scanResult.xraySegments.length.toLocaleString()} X-Ray segments to keep mobile &amp; desktop scrolling instant.
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAllXraySegments(true)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Render All Segments
                  </button>
                </div>
              )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: FORENSIC CHARACTER LEDGER
         ===================================================================== */}
      {activeTab === 'forensic_ledger' && (
        <div className="space-y-6">
          {/* Section A: Aggregated Code Point Summary Table */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="px-4 sm:px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                  Aggregated Unicode Code Point Inventory ({scanResult.aggregatedSummary.length}{' '}
                  Distinct Code Points)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Grouped breakdown showing total count, removed count, normalized count, and context-protected count per code point.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadAuditXlsx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Download 3-Sheet .XLSX
                </button>
              </div>
            </div>

            {scanResult.aggregatedSummary.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No invisible characters, unusual spaces, or homoglyphs detected in the current input.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200 dark:border-slate-800">
                      <th className="py-2.5 px-3">Code Point</th>
                      <th className="py-2.5 px-3">UTF-8 Hex</th>
                      <th className="py-2.5 px-3">Name &amp; Label</th>
                      <th className="py-2.5 px-3">Threat Category</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                      <th className="py-2.5 px-3 text-right">Removed</th>
                      <th className="py-2.5 px-3 text-right">Normalized</th>
                      <th className="py-2.5 px-3 text-right">Kept (Safe)</th>
                      <th className="py-2.5 px-3">Sample Locations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-800 font-mono">
                    {scanResult.aggregatedSummary.map((row) => {
                      const catMeta = CATEGORY_METADATA[row.category];
                      return (
                        <tr
                          key={row.codePoint}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-2.5 px-3 font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                            {row.hexCode}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {row.utf8Hex}
                          </td>
                          <td className="py-2.5 px-3 font-sans">
                            <div className="font-bold text-slate-900 dark:text-slate-100">
                              {row.name}{' '}
                              <span className="font-mono text-[11px] text-slate-500">
                                ({row.shortLabel})
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                              {row.description}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-sans whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${catMeta.badgeClass}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${catMeta.dotClass}`} />
                              {catMeta.label}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                            {row.totalCount}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-rose-600 dark:text-rose-400">
                            {row.removedCount}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-sky-600 dark:text-sky-400">
                            {row.replacedCount}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                            {row.keptCount}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {row.sampleLocations.slice(0, 4).join(', ')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section B: Occurrence-by-Occurrence Forensic Ledger */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 sm:px-5 bg-slate-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                  Occurrence-by-Occurrence Forensic Offset Ledger (
                  {filteredFindings.length.toLocaleString()} Matches)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Pinpoints exact 1-based Line/Column, UTF-16 code unit index, and UTF-8 byte offset for every finding.
                </p>
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 sm:w-56 min-w-[160px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    placeholder="Filter hex, name, snippet..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={ledgerCategoryFilter}
                  onChange={(e) =>
                    setLedgerCategoryFilter(e.target.value as ThreatCategory | 'ALL')
                  }
                  aria-label="Filter by threat category"
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  <option value="ALL">All Categories</option>
                  {Object.entries(CATEGORY_METADATA).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label}
                    </option>
                  ))}
                </select>

                <select
                  value={ledgerActionFilter}
                  onChange={(e) => setLedgerActionFilter(e.target.value)}
                  aria-label="Filter by action taken"
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  <option value="ALL">All Actions</option>
                  <option value="REMOVED">Removed</option>
                  <option value="REPLACED_WITH_SPACE">Normalized to Space</option>
                  <option value="FOLDED_TO_ASCII">Folded to ASCII</option>
                  <option value="KEPT_IN_CONTEXT">Kept in Context (Safe)</option>
                </select>
              </div>
            </div>

            {visibleLedgerRows.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No findings match the current filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[460px]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Line:Col</th>
                      <th className="py-2.5 px-3">UTF-8 Byte</th>
                      <th className="py-2.5 px-3">Code Point</th>
                      <th className="py-2.5 px-3">Character Name</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Context Snippet</th>
                      <th className="py-2.5 px-3">Forensic Rule / Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-800 font-mono">
                    {visibleLedgerRows.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-2 px-3 whitespace-nowrap font-bold text-slate-800 dark:text-slate-200">
                          L{item.line}:C{item.column}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                          #{item.utf8ByteOffset}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap font-bold text-blue-600 dark:text-blue-400">
                          {item.hexCode} ({item.shortLabel})
                        </td>
                        <td className="py-2 px-3 font-sans font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {item.name}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.action === 'KEPT_IN_CONTEXT'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                                : item.action === 'REMOVED'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                                  : 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300'
                              }`}
                          >
                            {item.action}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {item.contextSnippet}
                        </td>
                        <td className="py-2 px-3 font-sans text-slate-500 dark:text-slate-400 min-w-[220px]">
                          {item.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredFindings.length > MAX_RENDERED_LEDGER_ROWS && !showAllLedgerRows && (
              <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Displaying first {MAX_RENDERED_LEDGER_ROWS} of{' '}
                  {filteredFindings.length.toLocaleString()} occurrences.
                </span>
                <button
                  type="button"
                  onClick={() => setShowAllLedgerRows(true)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Show All {filteredFindings.length.toLocaleString()} Rows
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: STEGANOGRAPHY & PROMPT-INJECTION DECODER
         ===================================================================== */}
      {activeTab === 'stego_decoder' && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Unlock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Multi-Protocol Unicode Steganography &amp; LLM Prompt-Injection Decoder
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Automatically inspects input text across 4 covert channels: Plane 14 Tag Block ASCII Smuggling (U+E0020–U+E007E), Variation Selector Supplement Byte Encoding (U+E0100–U+E01EF), Binary ZWSP/ZWNJ Bitstreams, and Base-4 Invisible Math Operators (U+2060–U+2063).
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleLoadSample('plane14_prompt_injection')}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 transition-colors"
                >
                  Load Plane 14 Injection Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('variation_selector_stego')}
                  className="px-3 py-1.5 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-950/50 border border-fuchsia-200 dark:border-fuchsia-800 text-fuchsia-700 dark:text-fuchsia-300 text-xs font-bold hover:bg-fuchsia-100 transition-colors"
                >
                  Load VS17–256 Demo
                </button>
              </div>
            </div>

            {scanResult.decodedPayloads.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No Hidden Steganography or Plane 14 Prompt-Injection Payloads Found
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                  The current text does not contain decodable Plane 14 ASCII tags, Variation Selector byte streams, or binary zero-width bitstreams. Click one of the demo buttons above or use the Watermark Sandbox Encoder tab to test round-trip extraction.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {scanResult.decodedPayloads.map((payload, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/25 border border-purple-200 dark:border-purple-800/80 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-purple-600 text-white text-xs font-bold">
                          {payload.protocolLabel}
                        </span>
                        <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                          Start: Line {payload.startLine}, Col {payload.startColumn} •{' '}
                          {payload.carrierCount} hidden code points
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(payload.decodedText);
                          setCopiedPayloadIndex(idx);
                          setTimeout(() => setCopiedPayloadIndex(null), 2000);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 text-xs font-bold"
                      >
                        {copiedPayloadIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Copied Secret
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy Decoded Payload
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-purple-200 dark:border-purple-900 font-mono text-xs sm:text-sm text-slate-900 dark:text-slate-100 break-all">
                      {payload.decodedText}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      <strong>Forensic Analysis:</strong> {payload.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: TROJAN SOURCE (CVE-2021-42574) & HOMOGLYPH AUDIT (CVE-2021-42694)
         ===================================================================== */}
      {activeTab === 'secops_audit' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 text-white border border-slate-800">
            <div>
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <Code2 className="w-4 h-4 text-amber-400" />
                Source Code &amp; DevSecOps Unicode Vulnerability Linter
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Audits code and configuration files against CVE-2021-42574 (Trojan Source BiDi Override/Isolate imbalance) and CVE-2021-42694 (UAX #39 Mixed-Script Confusable Identifiers &amp; IDN Homograph Phishing).
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleLoadSample('trojan_source_and_homoglyph')}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shrink-0 transition-colors"
            >
              Load CVE-2021-42574 &amp; Homoglyph Sample
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Trojan Source BiDi Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-3 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Trojan Source BiDi State-Machine Audit (CVE-2021-42574)
                </h4>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${scanResult.bidiAnomalies.length > 0
                      ? 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                    }`}
                >
                  {scanResult.bidiAnomalies.length} Line Anomalies
                </span>
              </div>

              {scanResult.bidiAnomalies.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-500 dark:text-slate-400">
                  No unbalanced BiDi overrides (LRE/RLE/LRO/RLO/PDF) or isolates (LRI/RLI/FSI/PDI) detected on any line.
                </div>
              ) : (
                <div className="space-y-3">
                  {scanResult.bidiAnomalies.map((anom, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-800/70 space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-red-800 dark:text-red-300">
                          Line {anom.line} • {anom.cveReference}
                        </span>
                        <span className="text-[11px] font-mono text-red-700 dark:text-red-400">
                          Unclosed Overrides: {anom.unclosedOverrides} | Unclosed Isolates:{' '}
                          {anom.unclosedIsolates}
                        </span>
                      </div>
                      <pre className="p-2 rounded bg-white dark:bg-slate-950 border border-red-200 dark:border-red-900 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-x-auto">
                        {anom.snippet}
                      </pre>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {anom.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* UAX #39 Mixed-Script Homoglyph Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-3 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  UAX #39 Mixed-Script Homoglyph Linter (CVE-2021-42694)
                </h4>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${scanResult.mixedScriptTokens.length > 0
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                    }`}
                >
                  {scanResult.mixedScriptTokens.length} Spoofed Tokens
                </span>
              </div>

              {scanResult.mixedScriptTokens.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-500 dark:text-slate-400">
                  No mixed-script Latin + Cyrillic/Greek confusable identifiers or domains detected.
                </div>
              ) : (
                <div className="space-y-3">
                  {scanResult.mixedScriptTokens.map((tok, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/70 space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                        <span className="font-bold text-indigo-900 dark:text-indigo-200">
                          Line {tok.line}, Col {tok.column}: &ldquo;{tok.word}&rdquo; → ASCII:{' '}
                          &ldquo;{tok.foldedWord}&rdquo;
                        </span>
                        <span className="px-2 py-0.5 rounded bg-indigo-200/70 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 text-[10px] font-bold">
                          Scripts: {tok.scriptsDetected.join(' + ')}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {tok.confusableChars.map((c, cIdx) => (
                          <span
                            key={cIdx}
                            className="px-2 py-0.5 rounded bg-white dark:bg-slate-950 border border-indigo-200 dark:border-indigo-800 font-mono text-[11px] text-slate-700 dark:text-slate-300"
                          >
                            {c.script} &ldquo;{c.char}&rdquo; ({c.hexCode}) looks like Latin &ldquo;
                            {c.latinLookalike}&rdquo;
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: WATERMARK SANDBOX ENCODER (EDUCATIONAL RED-TEAM TESTER)
         ===================================================================== */}
      {activeTab === 'sandbox_encoder' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Educational Unicode Watermark &amp; 4-Protocol Steganography Sandbox Encoder
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Generate synthetic zero-width watermarks, Plane 14 Tag payloads, Variation Selector byte streams, or Base-4 Invisible Math payloads to verify how DLP gateways, LLM guardrails, and KivaroTools detect and strip them in round-trip tests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Visible Carrier Text
              </label>
              <textarea
                value={sandboxCarrier}
                onChange={(e) => setSandboxCarrier(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Secret Payload to Hide (ASCII / UTF-8)
                </label>
                <input
                  type="text"
                  value={sandboxSecret}
                  onChange={(e) => setSandboxSecret(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Steganography Protocol (4 Supported)
                  </label>
                  <select
                    value={sandboxProtocol}
                    onChange={(e) =>
                      setSandboxProtocol(e.target.value as StegoEncodeOptions['protocol'])
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <option value="plane14_tag_ascii">
                      1. Plane 14 Tag Block (U+E0020–U+E007E)
                    </option>
                    <option value="variation_selector_bytes">
                      2. Variation Selectors (U+E0100–U+E01EF)
                    </option>
                    <option value="zwsp_zwnj_binary">
                      3. Binary ZWSP/ZWNJ (U+200B / U+200C)
                    </option>
                    <option value="octal_zw_stego">
                      4. Base-4 Invisible Math Ops (U+2060–U+2063)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Injection Position
                  </label>
                  <select
                    value={sandboxPosition}
                    onChange={(e) =>
                      setSandboxPosition(e.target.value as StegoEncodeOptions['insertPosition'])
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <option value="after_first_word">After First Word</option>
                    <option value="start">After First Code Point</option>
                    <option value="end">End of Text</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Watermarked Carrier Output (Looks Identical, Contains{' '}
                {Array.from(sandboxWatermarkedOutput).length - Array.from(sandboxCarrier).length}{' '}
                Hidden Code Points)
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(sandboxWatermarkedOutput);
                    setCopiedSandboxOutput(true);
                    setTimeout(() => setCopiedSandboxOutput(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  {copiedSandboxOutput ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Watermarked Text
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputText(sandboxWatermarkedOutput);
                    setActiveTab('stego_decoder');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Send to Cleaner &amp; Verify Round-Trip <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 break-words">
              {sandboxWatermarkedOutput}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}