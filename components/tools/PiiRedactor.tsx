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
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Copy,
  Check,
  Trash2,
  Upload,
  Download,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
  FileCheck2,
  Search,
  Sliders,
  Layers,
  RefreshCw,
  Plus,
  Sparkles,
  CheckCircle2,
  Zap,
  KeyRound,
  Code2,
  ArrowRightLeft,
  Bot,
} from 'lucide-react';

import {
  scanAndRedactPii,
  formatPartialMask,
  getDefaultPiiOptions,
  restoreAnonymizedAiResponse,
  generateSimulatedAiReply,
  exportSessionVaultJson,
  exportPiiAuditCsv,
  exportPiiAuditXlsx,
  generatePiiComplianceCertificateJson,
  PII_ENTITY_REGISTRY,
  ALL_PII_ENTITY_TYPES,
  PII_SAMPLE_PRESETS,
  MAX_SAFE_PROMPT_BYTES,
  type PiiRedactorOptions,
  type PiiPresetId,
  type PiiMaskingMode,
  type PiiEntityType,
  type PiiDomainCategory,
  type DetectedPiiMatch,
  type PiiVaultEntry,
} from '@/lib/piiRedactorEngine';

type PiiWorkbenchTab =
  | 'sanitize_prompt'
  | 'restore_response'
  | 'token_vault'
  | 'custom_rules'
  | 'compliance_exports';

const WORKFLOW_PRESETS: Array<{
  id: PiiPresetId;
  label: string;
  shortBadge: string;
  description: string;
}> = [
    {
      id: 'ai_prompt_reversible',
      label: 'AI Prompt Safe — Reversible Tokens (ChatGPT / Claude / Cursor)',
      shortBadge: 'Reversible [TOKEN_01]',
      description:
        'Replaces emails, cloud API keys, credit cards, IBANs, SSNs, phones, and names with deterministic tokens ([EMAIL_01], [OPENAI_KEY_01]) and prepends an AI system instruction so you can restore original values in 1 click in Tab 2.',
    },
    {
      id: 'devops_log_scrubber',
      label: 'DevOps Log, Stack-Trace & HAR/JSON Credential Scrubber',
      shortBadge: 'Secrets + Public IPs',
      description:
        'Scrubs 12 classes of API keys, JWTs, PEM private keys, Postgres/Mongo/Redis URI passwords, customer emails, and public IPs while keeping local loopback/private IPs (127.0.0.1) intact for debugging.',
    },
    {
      id: 'csv_json_dataset_synthetic',
      label: 'CSV & JSON Dataset Masker (Format-Preserving Synthetic Faker)',
      shortBadge: 'Synthetic Faker',
      description:
        'Replaces real PII with realistic, format-preserving synthetic values (user01@example.org, +1-555-0101, Alex Morgan) so SQL/JSON parsers and LLM code generators execute without syntax errors.',
    },
    {
      id: 'legal_contract_nda',
      label: 'Legal Contract, NDA & M&A Document Anonymizer',
      shortBadge: 'Parties + Orgs + Addresses',
      description:
        'Anonymizes person names, corporate legal entities (Inc., LLC, Ltd., GmbH, Pvt. Ltd.), street addresses, bank wire routing numbers, and signatory emails before AI summarization.',
    },
    {
      id: 'hipaa_clinical_safe',
      label: 'HIPAA Clinical Note & Patient Record De-Identifier',
      shortBadge: 'MRN + DOB + Patient NER',
      description:
        'Scrubs Patient Medical Record Numbers (MRN), context-verified Dates of Birth, doctor/patient names, SSNs, phones, and addresses across clinical notes.',
    },
    {
      id: 'pci_financial_support',
      label: 'PCI-DSS Financial & Customer Support Ticket Masker',
      shortBadge: 'Partial Mask (••••1111)',
      description:
        'Applies shape-preserving partial masking (j••••@••••.com, ••••-••••-1111) to payment cards, IBANs, and emails while permanently redacting API secrets.',
    },
  ];

const MASKING_MODE_DEFINITIONS: Array<{
  mode: PiiMaskingMode;
  label: string;
  example: string;
  reversible: boolean;
}> = [
    {
      mode: 'token',
      label: 'Reversible Indexed Token',
      example: '[EMAIL_01], [OPENAI_KEY_01]',
      reversible: true,
    },
    {
      mode: 'synthetic',
      label: 'Synthetic Faker (Format-Safe)',
      example: 'user01@example.org, Alex Morgan',
      reversible: true,
    },
    {
      mode: 'partial',
      label: 'Partial Shape Mask',
      example: 's••••@••••.org, ••••-••••-1111',
      reversible: false,
    },
    {
      mode: 'hash',
      label: 'Salted SHA-256 Digest',
      example: '[EMAIL_SHA256:9f86d081]',
      reversible: false,
    },
    {
      mode: 'redact',
      label: 'Solid Blackout Block',
      example: '████████████',
      reversible: false,
    },
    {
      mode: 'type_label',
      label: 'Static Type Label',
      example: '[EMAIL_ADDRESS], [CREDIT_CARD]',
      reversible: false,
    },
  ];

const DOMAIN_METADATA: Record<
  PiiDomainCategory,
  { label: string; pillClass: string; dotClass: string }
> = {
  secrets: {
    label: 'Cloud Keys & Secrets',
    pillClass:
      'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700',
    dotClass: 'bg-rose-500',
  },
  financial: {
    label: 'Financial & Cards',
    pillClass:
      'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700',
    dotClass: 'bg-amber-500',
  },
  government_id: {
    label: 'Gov, Tax & HIPAA IDs',
    pillClass:
      'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-700',
    dotClass: 'bg-purple-500',
  },
  personal_ner: {
    label: 'Personal & Local NER',
    pillClass:
      'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-700',
    dotClass: 'bg-blue-500',
  },
  network: {
    label: 'Network & Infra',
    pillClass:
      'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-700',
    dotClass: 'bg-cyan-500',
  },
  custom: {
    label: 'Custom Org Rules',
    pillClass:
      'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700',
    dotClass: 'bg-emerald-500',
  },
};

const MAX_RENDERED_HIGHLIGHT_SEGMENTS = 1200;

export default function PiiRedactor() {
  const [inputText, setInputText] = useState<string>(
    PII_SAMPLE_PRESETS[0]?.sampleText ?? ''
  );
  const deferredInputText = useDeferredValue(inputText);

  const [options, setOptions] = useState<PiiRedactorOptions>(() =>
    getDefaultPiiOptions('ai_prompt_reversible')
  );
  const [activeTab, setActiveTab] = useState<PiiWorkbenchTab>('sanitize_prompt');
  const [showDetectorDrawer, setShowDetectorDrawer] = useState<boolean>(false);
  const [selectedMatch, setSelectedMatch] = useState<DetectedPiiMatch | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showAllSegments, setShowAllSegments] = useState<boolean>(false);

  // Tab 2: AI Response Restorer state
  const [aiResponseInput, setAiResponseInput] = useState<string>('');
  const [importedVaultEntries, setImportedVaultEntries] = useState<PiiVaultEntry[] | null>(
    null
  );
  const [copiedRestored, setCopiedRestored] = useState<boolean>(false);

  // Tab 3: Token Vault state
  const [vaultSearch, setVaultSearch] = useState<string>('');
  const [revealRawInVault, setRevealRawInVault] = useState<boolean>(false);

  // Tab 4: Custom Rule Builder state
  const [newRuleLabel, setNewRuleLabel] = useState<string>('PROJECT_CODENAME');
  const [newRulePattern, setNewRulePattern] = useState<string>('');
  const [newRuleIsRegex, setNewRuleIsRegex] = useState<boolean>(false);

  // Tab 5: Export options
  const [includeRawInExports, setIncludeRawInExports] = useState<boolean>(false);

  // Copy feedback states
  const [copiedSanitized, setCopiedSanitized] = useState<boolean>(false);
  const [copiedPromptWrapped, setCopiedPromptWrapped] = useState<boolean>(false);
  const [copiedCert, setCopiedCert] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const vaultFileInputRef = useRef<HTMLInputElement | null>(null);

  // Run core deterministic PII & Secret Scanner
  const redactionResult = useMemo(() => {
    return scanAndRedactPii(deferredInputText, options);
  }, [deferredInputText, options]);

  // Active vault entries (combines live scan vault + any imported session vault)
  const activeVaultEntries = useMemo(() => {
    if (!importedVaultEntries || importedVaultEntries.length === 0) {
      return redactionResult.vaultEntries;
    }
    const merged = new Map<string, PiiVaultEntry>();
    for (const entry of importedVaultEntries) {
      merged.set(entry.tokenKey, entry);
    }
    for (const entry of redactionResult.vaultEntries) {
      merged.set(entry.tokenKey, entry);
    }
    return Array.from(merged.values());
  }, [redactionResult.vaultEntries, importedVaultEntries]);

  // Run 1-Click AI Response De-Anonymizer for Tab 2
  const restoreResult = useMemo(() => {
    return restoreAnonymizedAiResponse(aiResponseInput, activeVaultEntries);
  }, [aiResponseInput, activeVaultEntries]);

  // Select workflow preset
  const handleSelectPreset = useCallback((presetId: PiiPresetId) => {
    setOptions((prev) => ({
      ...getDefaultPiiOptions(presetId),
      customRules: prev.customRules,
    }));
  }, []);

  // Load sample preset
  const handleLoadSample = useCallback((sampleId: string) => {
    const found = PII_SAMPLE_PRESETS.find((s) => s.id === sampleId);
    if (!found) return;
    setFileError(null);
    setUploadedFileName(null);
    setSelectedMatch(null);
    setOptions((prev) => ({
      ...getDefaultPiiOptions(found.recommendedPreset),
      customRules: prev.customRules,
    }));
    setInputText(found.sampleText);
  }, []);

  // Toggle individual entity type detector on/off
  const handleToggleEntityType = useCallback((type: PiiEntityType) => {
    setOptions((prev) => ({
      ...prev,
      enabledTypes: {
        ...prev.enabledTypes,
        [type]: !prev.enabledTypes[type],
      },
    }));
  }, []);

  // Toggle whitelist for a specific raw value
  const handleToggleWhitelistValue = useCallback((rawValue: string) => {
    setOptions((prev) => {
      const exists = prev.whitelistedValues.includes(rawValue);
      const nextList = exists
        ? prev.whitelistedValues.filter((v) => v !== rawValue)
        : [...prev.whitelistedValues, rawValue];
      return {
        ...prev,
        whitelistedValues: nextList,
      };
    });
  }, []);

  // Add custom rule
  const handleAddCustomRule = useCallback(() => {
    if (!newRulePattern.trim()) return;
    const cleanLabel =
      newRuleLabel
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9_]/g, '_') || 'CUSTOM';
    setOptions((prev) => ({
      ...prev,
      customRules: [
        ...prev.customRules,
        {
          id: `rule-${Date.now()}`,
          label: cleanLabel,
          pattern: newRulePattern.trim(),
          isRegex: newRuleIsRegex,
          caseSensitive: false,
          enabled: true,
        },
      ],
    }));
    setNewRulePattern('');
  }, [newRuleLabel, newRulePattern, newRuleIsRegex]);

  const handleRemoveCustomRule = useCallback((id: string) => {
    setOptions((prev) => ({
      ...prev,
      customRules: prev.customRules.filter((r) => r.id !== id),
    }));
  }, []);

  // File Upload handler
  const processUploadedFile = useCallback((file: File) => {
    setFileError(null);
    if (file.size > MAX_SAFE_PROMPT_BYTES) {
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
      setSelectedMatch(null);
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

  // Import Session Vault JSON
  const handleVaultImportChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(String(ev.target?.result || '{}'));
        if (Array.isArray(parsed.entries)) {
          setImportedVaultEntries(parsed.entries);
        } else {
          setFileError('Invalid Session Vault JSON format.');
        }
      } catch {
        setFileError('Failed to parse Session Vault JSON file.');
      }
    };
    reader.readAsText(file, 'utf-8');
    event.target.value = '';
  }, []);

  // Download helper
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

  const sanitizedDownloadFileName = useMemo(() => {
    if (!uploadedFileName) return 'kivarotools-sanitized-prompt.txt';
    const dotIdx = uploadedFileName.lastIndexOf('.');
    if (dotIdx <= 0) return `${uploadedFileName}-sanitized.txt`;
    const base = uploadedFileName.slice(0, dotIdx);
    const ext = uploadedFileName.slice(dotIdx);
    return `${base}.sanitized${ext}`;
  }, [uploadedFileName]);

  const handleDownloadSanitizedFile = useCallback(() => {
    const blob = new Blob([redactionResult.sanitizedText], {
      type: 'text/plain;charset=utf-8',
    });
    triggerBlobDownload(blob, sanitizedDownloadFileName);
  }, [redactionResult.sanitizedText, sanitizedDownloadFileName, triggerBlobDownload]);

  const handleDownloadVaultJson = useCallback(() => {
    const json = exportSessionVaultJson(redactionResult);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    triggerBlobDownload(blob, 'kivarotools-pii-session-vault.json');
  }, [redactionResult, triggerBlobDownload]);

  const handleDownloadAuditXlsx = useCallback(() => {
    const bytes = exportPiiAuditXlsx(redactionResult, includeRawInExports);
    const blob = new Blob([bytes as unknown as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    triggerBlobDownload(blob, 'kivarotools-pii-redaction-audit.xlsx');
  }, [redactionResult, includeRawInExports, triggerBlobDownload]);

  const handleDownloadAuditCsv = useCallback(() => {
    const csv = exportPiiAuditCsv(redactionResult, includeRawInExports);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    triggerBlobDownload(blob, 'kivarotools-pii-redaction-ledger.csv');
  }, [redactionResult, includeRawInExports, triggerBlobDownload]);

  const handleDownloadCertificateJson = useCallback(() => {
    const json = generatePiiComplianceCertificateJson(redactionResult);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    triggerBlobDownload(blob, 'kivarotools-pii-sanitization-certificate.json');
  }, [redactionResult, triggerBlobDownload]);

  // Simulate AI Reply & switch to Tab 2
  const handleSimulateAiReply = useCallback(() => {
    const simulated = generateSimulatedAiReply(redactionResult);
    setAiResponseInput(simulated);
    setActiveTab('restore_response');
  }, [redactionResult]);

  // Detected type chips for instant 1-click toggling above the editor
  const detectedTypeChips = useMemo(() => {
    const counts = new Map<PiiEntityType, number>();
    for (const m of redactionResult.matches) {
      counts.set(m.entityType, (counts.get(m.entityType) || 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [redactionResult.matches]);

  const filteredVaultEntries = useMemo(() => {
    const q = vaultSearch.trim().toLowerCase();
    if (!q) return activeVaultEntries;
    return activeVaultEntries.filter(
      (v) =>
        v.tokenKey.toLowerCase().includes(q) ||
        v.entityType.toLowerCase().includes(q) ||
        v.syntheticValue.toLowerCase().includes(q) ||
        (revealRawInVault && v.rawValue.toLowerCase().includes(q))
    );
  }, [activeVaultEntries, vaultSearch, revealRawInVault]);

  const visibleHighlighterSegments = useMemo(() => {
    if (
      showAllSegments ||
      redactionResult.highlighterSegments.length <= MAX_RENDERED_HIGHLIGHT_SEGMENTS
    ) {
      return redactionResult.highlighterSegments;
    }
    return redactionResult.highlighterSegments.slice(0, MAX_RENDERED_HIGHLIGHT_SEGMENTS);
  }, [redactionResult.highlighterSegments, showAllSegments]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 overflow-x-hidden">
      {/* Top Privacy & Zero-Upload Architecture Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:px-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:via-[#0F172A] dark:to-slate-900 text-white border border-slate-700/80 shadow-sm">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-bold tracking-tight text-white">
                100% Client-Side PII Redactor, Secret Scrubber &amp; Reversible AI Prompt Sanitizer
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Zero Server Uploads
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Scans 34 entity types (Cloud API keys, Luhn cards, Mod-97 IBANs, SSN/CNIC/NINO, emails, phones &amp; local NER names) in browser RAM with 1-click AI response de-anonymization.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-[11px] font-mono text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            {redactionResult.executionTimeMs.toFixed(2)} ms
          </span>
          {redactionResult.zeroLeakVerified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-[11px] font-semibold text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" /> 0 Leaks Verified
            </span>
          )}
        </div>
      </div>

      {/* Control Bar: Preset Selector, Masking Strategy, and 1-Click Sample Payloads */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Workflow Preset & Masking Mode (7 cols) */}
          <div className="lg:col-span-7 space-y-3 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="min-w-0">
                <label
                  htmlFor="pii-preset-select"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1"
                >
                  1. Industry Workflow Preset
                </label>
                <select
                  id="pii-preset-select"
                  value={options.preset}
                  onChange={(e) => handleSelectPreset(e.target.value as PiiPresetId)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {WORKFLOW_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="pii-masking-mode-select"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1"
                >
                  2. Anonymization / Masking Style
                </label>
                <select
                  id="pii-masking-mode-select"
                  value={options.maskingMode}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      maskingMode: e.target.value as PiiMaskingMode,
                    }))
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MASKING_MODE_DEFINITIONS.map((m) => (
                    <option key={m.mode} value={m.mode}>
                      {m.label} — {m.example}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-1 min-w-[200px]">
                {WORKFLOW_PRESETS.find((p) => p.id === options.preset)?.description}
              </p>
              <button
                type="button"
                onClick={() => setShowDetectorDrawer((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors shrink-0 ${showDetectorDrawer
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-blue-500'
                  }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                {showDetectorDrawer ? 'Hide 34 Detectors' : 'Configure Detectors (34)'}
              </button>
            </div>
          </div>

          {/* 1-Click Sample Presets (5 cols) */}
          <div className="lg:col-span-5 min-w-0">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Load Real-World B2B / Dev Sample
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-1.5">
              {PII_SAMPLE_PRESETS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleLoadSample(sample.id)}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:border-blue-500 dark:hover:border-blue-500 transition-all text-left min-w-0"
                >
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {sample.title}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-100/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-semibold shrink-0">
                    {sample.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Collapsible 34-Detector Configuration Drawer */}
        {showDetectorDrawer && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.preserveLoopbackAndPrivateIps}
                    onChange={() =>
                      setOptions((prev) => ({
                        ...prev,
                        preserveLoopbackAndPrivateIps: !prev.preserveLoopbackAndPrivateIps,
                      }))
                    }
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Keep Loopback/Private IPs (127.0.0.1, 10.x, 192.168.x)
                </label>

                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.enableStructureAwareKeyScan}
                    onChange={() =>
                      setOptions((prev) => ({
                        ...prev,
                        enableStructureAwareKeyScan: !prev.enableStructureAwareKeyScan,
                      }))
                    }
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Structure-Aware JSON/CSV/.env Key Scanner
                </label>

                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeAiSystemPromptWrapper}
                    onChange={() =>
                      setOptions((prev) => ({
                        ...prev,
                        includeAiSystemPromptWrapper: !prev.includeAiSystemPromptWrapper,
                      }))
                    }
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Include AI System Instruction on Copy
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const allOn = {} as Record<PiiEntityType, boolean>;
                    ALL_PII_ENTITY_TYPES.forEach((t) => (allOn[t] = true));
                    setOptions((prev) => ({ ...prev, enabledTypes: allOn }));
                  }}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Enable All 34
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button
                  type="button"
                  onClick={() => {
                    const allOff = {} as Record<PiiEntityType, boolean>;
                    ALL_PII_ENTITY_TYPES.forEach((t) => (allOff[t] = false));
                    setOptions((prev) => ({ ...prev, enabledTypes: allOff }));
                  }}
                  className="text-xs font-bold text-slate-500 hover:underline"
                >
                  Disable All
                </button>
              </div>
            </div>

            {/* Per-Domain Masking Strategy Overrides */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Per-Category Masking Style Override (Optional — Defaults to Global Style)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {(Object.keys(DOMAIN_METADATA) as PiiDomainCategory[]).map((domKey) => (
                  <div key={domKey} className="min-w-0">
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate mb-1">
                      {DOMAIN_METADATA[domKey].label}
                    </label>
                    <select
                      value={options.categoryModeOverrides[domKey] || "GLOBAL"}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOptions((prev) => {
                          const nextOverrides = { ...prev.categoryModeOverrides };
                          if (val === "GLOBAL") delete nextOverrides[domKey];
                          else nextOverrides[domKey] = val as PiiMaskingMode;
                          return { ...prev, categoryModeOverrides: nextOverrides };
                        });
                      }}
                      className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[11px] font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <option value="GLOBAL">Use Global ({options.maskingMode})</option>
                      {MASKING_MODE_DEFINITIONS.map((m) => (
                        <option key={m.mode} value={m.mode}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {ALL_PII_ENTITY_TYPES.map((typeKey) => {
                const meta = PII_ENTITY_REGISTRY[typeKey];
                const domMeta = DOMAIN_METADATA[meta.domain];
                return (
                  <label
                    key={typeKey}
                    className="flex items-start gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 cursor-pointer hover:border-blue-400 transition-colors min-w-0"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(options.enabledTypes[typeKey])}
                      onChange={() => handleToggleEntityType(typeKey)}
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${domMeta.dotClass}`} />
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                          {meta.label}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        [{meta.shortPrefix}_01]
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Real-Time Privacy Scorecards (Responsive 2-col mobile, 5-col desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total PII &amp; Secrets
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {redactionResult.totalMatchesCount}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              {redactionResult.activeRedactedCount} Masked
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {redactionResult.uniqueEntitiesCount} unique entities in Vault
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Cloud Keys &amp; Creds
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">
              {redactionResult.domainBreakdown.secrets}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Critical</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            API keys, JWTs, PEM &amp; DB URIs
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Cards, IBAN &amp; Gov IDs
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
              {redactionResult.domainBreakdown.financial +
                redactionResult.domainBreakdown.government_id}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
              Checksummed
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Luhn Cards, Mod-97 IBAN, SSN, CNIC
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Contact &amp; Local NER
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
              {redactionResult.domainBreakdown.personal_ner +
                redactionResult.domainBreakdown.network}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Emails/Names/IPs</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Names, Orgs, Phones, Emails &amp; IPs
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Exposure Risk Score
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={`text-xl sm:text-2xl font-extrabold font-mono ${redactionResult.privacyRiskScore >= 60
                  ? 'text-rose-600 dark:text-rose-400'
                  : redactionResult.privacyRiskScore >= 25
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
            >
              {redactionResult.privacyRiskScore}/100
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              → 0 After Scrub
            </span>
          </div>
          <div
            className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate"
            title={redactionResult.privacyRiskVerdict}
          >
            {redactionResult.privacyRiskVerdict}
          </div>
        </div>
      </div>

      {/* 5-Tab Responsive Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] border-b border-slate-200 dark:border-slate-800">
        {[
          {
            id: 'sanitize_prompt' as const,
            label: '1. Sanitize Prompt & X-Ray',
            icon: Lock,
            badge: redactionResult.activeRedactedCount,
          },
          {
            id: 'restore_response' as const,
            label: '2. Restore AI Response (1-Click)',
            icon: ArrowRightLeft,
            badge: restoreResult.totalRestoredReplacements || null,
            highlight: restoreResult.totalRestoredReplacements > 0,
          },
          {
            id: 'token_vault' as const,
            label: '3. Token Vault & Whitelist',
            icon: KeyRound,
            badge: activeVaultEntries.length,
          },
          {
            id: 'custom_rules' as const,
            label: '4. Custom Regex & Org Dictionary',
            icon: Code2,
            badge: options.customRules.length || null,
          },
          {
            id: 'compliance_exports' as const,
            label: '5. Audit Reports (.XLSX / .CSV / SHA-256)',
            icon: FileSpreadsheet,
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
                      ? 'bg-emerald-600 text-white font-extrabold'
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

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.log,.json,.csv,.md,.env,.yaml,.yml,.sql,.xml,.py,.ts,.js"
        className="hidden"
        onChange={handleFileInputChange}
      />
      <input
        ref={vaultFileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleVaultImportChange}
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
          TAB 1: SANITIZE PROMPT & INTERACTIVE X-RAY
         ===================================================================== */}
      {activeTab === 'sanitize_prompt' && (
        <div className="space-y-5">
          {/* Interactive Detected Entity Type Chips (1-Click Toggle Bar) */}
          {detectedTypeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
                Detected Types (Click Chip to Toggle):
              </span>
              {detectedTypeChips.map(([typeKey, count]) => {
                const meta = PII_ENTITY_REGISTRY[typeKey];
                const isEnabled = options.enabledTypes[typeKey];
                const domMeta = DOMAIN_METADATA[meta.domain];
                return (
                  <button
                    key={typeKey}
                    type="button"
                    onClick={() => handleToggleEntityType(typeKey)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all ${isEnabled
                        ? domMeta.pillClass
                        : 'bg-slate-100 text-slate-400 border-slate-200 line-through dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
                      }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${domMeta.dotClass}`} />
                    <span>{meta.shortPrefix}</span>
                    <span className="font-mono text-[11px] opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Dual Pane Editor: Confidential Input (Left) & Sanitized Output (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* LEFT PANE: RAW CONFIDENTIAL INPUT */}
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
                      ? `Confidential Input (${uploadedFileName})`
                      : 'Confidential Input (Logs, Prompt, JSON, CSV, Contract)'}
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
                      setSelectedMatch(null);
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
                  placeholder="Paste your raw logs, customer support ticket, JSON payload, CSV table, .env config, or legal contract here..."
                  spellCheck={false}
                  aria-label="Confidential input text"
                  className="w-full h-full min-h-[260px] sm:min-h-[320px] p-4 bg-transparent text-slate-800 dark:text-slate-200 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none resize-y"
                />
                {isDragging && (
                  <div className="absolute inset-0 bg-blue-600/10 dark:bg-blue-500/20 backdrop-blur-xs flex items-center justify-center pointer-events-none">
                    <div className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 shadow-md border border-blue-500 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Drop file to scrub PII in browser RAM
                    </div>
                  </div>
                )}
              </div>

              <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>
                  Bytes: <strong>{redactionResult.originalByteLength.toLocaleString()}</strong> |
                  Detected: <strong>{redactionResult.totalMatchesCount}</strong>
                </span>
                <span className="truncate max-w-[240px]" title={redactionResult.originalSha256}>
                  SHA-256: {redactionResult.originalSha256.slice(0, 12)}…
                </span>
              </div>
            </div>

            {/* RIGHT PANE: SANITIZED SAFE OUTPUT */}
            <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs overflow-hidden min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-emerald-50/60 dark:bg-emerald-950/20 border-b border-gray-200 dark:border-slate-800">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                    Safe Sanitized Output (Ready for ChatGPT / Claude / Tickets)
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(redactionResult.sanitizedText);
                      setCopiedSanitized(true);
                      setTimeout(() => setCopiedSanitized(false), 2000);
                    }}
                    disabled={!redactionResult.sanitizedText}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-40"
                  >
                    {copiedSanitized ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Safe Text
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(redactionResult.promptWrappedText);
                      setCopiedPromptWrapped(true);
                      setTimeout(() => setCopiedPromptWrapped(false), 2000);
                    }}
                    disabled={!redactionResult.sanitizedText}
                    title="Copies sanitized text with a system instruction telling ChatGPT/Claude to preserve [TOKEN_01] placeholders in its reply"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-40"
                  >
                    {copiedPromptWrapped ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copied AI Prompt!
                      </>
                    ) : (
                      <>
                        <Bot className="w-3.5 h-3.5" /> Copy + AI Wrapper
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSanitizedFile}
                    disabled={!redactionResult.sanitizedText}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-500 text-xs font-semibold transition-colors disabled:opacity-40"
                  >
                    <Download className="w-3.5 h-3.5" /> Save
                  </button>
                </div>
              </div>

              <div className="relative flex-1 min-h-[260px] sm:min-h-[320px]">
                <textarea
                  readOnly
                  value={redactionResult.sanitizedText}
                  placeholder="Sanitized output will appear here automatically..."
                  spellCheck={false}
                  aria-label="Sanitized output text"
                  className="w-full h-full min-h-[260px] sm:min-h-[320px] p-4 bg-emerald-50/10 dark:bg-emerald-950/5 text-slate-800 dark:text-slate-200 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none resize-y"
                />
              </div>

              <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>
                  Bytes: <strong>{redactionResult.sanitizedByteLength.toLocaleString()}</strong> |
                  Mode: <strong>{options.maskingMode.toUpperCase()}</strong>
                </span>
                <button
                  type="button"
                  onClick={handleSimulateAiReply}
                  className="text-blue-600 dark:text-blue-400 font-sans font-bold hover:underline flex items-center gap-1"
                >
                  Test 1-Click AI Response Restore in Tab 2 →
                </button>
              </div>
            </div>
          </div>

          {/* Interactive X-Ray PII Highlighter (Click any detected badge to inspect or whitelist) */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 sm:px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    Interactive PII &amp; Secret X-Ray Inspector (Click Any Highlighted Entity to Inspect or Whitelist)
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Shows every detected secret and PII span in context. Click any badge to see why it matched (e.g. Luhn or Mod-97 checksum) or whitelist that specific value.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold shrink-0">
                {Object.entries(DOMAIN_METADATA).map(([key, meta]) => (
                  <span
                    key={key}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${meta.pillClass}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dotClass}`} />
                    {meta.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Selected Match Popover Banner */}
            {selectedMatch && (
              <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-xs font-bold">
                      {selectedMatch.tokenKey}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {PII_ENTITY_REGISTRY[selectedMatch.entityType]?.label ||
                        selectedMatch.entityType}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      (Line {selectedMatch.line}, Col {selectedMatch.column})
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all">
                    Raw: <strong>{selectedMatch.rawValue}</strong> &rarr; Masked:{' '}
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {selectedMatch.replacement}
                    </strong>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    <strong>Validation Method:</strong> {selectedMatch.validationMethod}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggleWhitelistValue(selectedMatch.rawValue)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${options.whitelistedValues.includes(selectedMatch.rawValue)
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-blue-500'
                      }`}
                  >
                    {options.whitelistedValues.includes(selectedMatch.rawValue)
                      ? 'Whitelisted (Click to Re-Mask)'
                      : 'Whitelist This Value'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMatch(null)}
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Highlighted Content Stream */}
            <div className="p-4 sm:p-5 max-h-[340px] overflow-y-auto font-mono text-xs sm:text-sm leading-7 whitespace-pre-wrap break-words text-slate-800 dark:text-slate-200">
              {visibleHighlighterSegments.length === 0 ? (
                <span className="text-slate-400 italic">
                  Paste text above to inspect detected PII and secrets in X-Ray mode...
                </span>
              ) : (
                visibleHighlighterSegments.map((seg, idx) => {
                  if (seg.type === 'text') {
                    return <React.Fragment key={idx}>{seg.text}</React.Fragment>;
                  }
                  const m = seg.match!;
                  const domMeta = DOMAIN_METADATA[m.domain];
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMatch(m)}
                      title={`${m.entityType}: ${m.rawValue} → ${m.replacement} (${m.validationMethod})`}
                      className={`inline-flex items-center gap-1 mx-0.5 px-1.5 py-0.5 rounded-md border text-[11px] font-mono font-bold align-baseline cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all ${m.isWhitelisted
                          ? 'bg-slate-100 text-slate-500 border-slate-300 line-through dark:bg-slate-800 dark:text-slate-400'
                          : domMeta.pillClass
                        }`}
                    >
                      <span>{m.tokenKey}</span>
                      <span className="opacity-75 font-normal max-w-[160px] truncate">
                        {m.rawValue}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {redactionResult.highlighterSegments.length > MAX_RENDERED_HIGHLIGHT_SEGMENTS &&
              !showAllSegments && (
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Showing first {MAX_RENDERED_HIGHLIGHT_SEGMENTS.toLocaleString()} segments for fast mobile rendering.
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAllSegments(true)}
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
          TAB 2: 1-CLICK AI RESPONSE RESTORER (ROUND-TRIP DE-ANONYMIZER)
         ===================================================================== */}
      {activeTab === 'restore_response' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/80">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                Fuzzy-Tolerant 1-Click AI Response De-Anonymizer
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Paste the reply from ChatGPT, Claude, Gemini, or Cursor on the left. Our engine automatically swaps all <code>[EMAIL_01]</code>, <code>[OPENAI_KEY_01]</code>, bare <code>EMAIL_01</code>, or synthetic faker tokens back to your original confidential values in browser RAM.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSimulateAiReply}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Load Simulated ChatGPT/Claude Reply
              </button>
              <button
                type="button"
                onClick={() => vaultFileInputRef.current?.click()}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:border-blue-500 transition-colors"
              >
                Import Vault (.JSON)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: AI Model Response Input */}
            <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs overflow-hidden min-w-0">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/70 border-b border-gray-200 dark:border-slate-800">
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                  Paste AI Assistant Reply (Containing [TOKEN_01] Placeholders)
                </span>
                <button
                  type="button"
                  onClick={() => setAiResponseInput('')}
                  disabled={!aiResponseInput}
                  className="text-xs font-semibold text-red-600 dark:text-red-400 disabled:opacity-40"
                >
                  Clear
                </button>
              </div>
              <textarea
                value={aiResponseInput}
                onChange={(e) => setAiResponseInput(e.target.value)}
                placeholder="Paste the response from ChatGPT, Claude, or DeepSeek here (or click 'Load Simulated ChatGPT/Claude Reply' above to test)..."
                rows={12}
                spellCheck={false}
                className="w-full flex-1 p-4 bg-transparent text-slate-800 dark:text-slate-200 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none resize-y"
              />
            </div>

            {/* Right: Restored Original Text */}
            <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs overflow-hidden min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-emerald-50/60 dark:bg-emerald-950/20 border-b border-gray-200 dark:border-slate-800">
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                  Restored Confidential Output ({restoreResult.totalRestoredReplacements} Tokens Swapped)
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(restoreResult.restoredText);
                    setCopiedRestored(true);
                    setTimeout(() => setCopiedRestored(false), 2000);
                  }}
                  disabled={!restoreResult.restoredText}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-40"
                >
                  {copiedRestored ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied Restored Text!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Restored Output
                    </>
                  )}
                </button>
              </div>
              <textarea
                readOnly
                value={restoreResult.restoredText}
                placeholder="Restored text with original emails, names, and keys will appear here..."
                rows={12}
                spellCheck={false}
                className="w-full flex-1 p-4 bg-emerald-50/10 dark:bg-emerald-950/5 text-slate-800 dark:text-slate-200 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none resize-y"
              />
            </div>
          </div>

          {/* Restoration Summary Pills */}
          {restoreResult.restoredItems.length > 0 && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Restored Entities Breakdown ({restoreResult.uniqueTokensRestored} Unique Tokens,{' '}
                {restoreResult.totalRestoredReplacements} Total Replacements in{' '}
                {restoreResult.executionTimeMs.toFixed(2)} ms)
              </div>
              <div className="flex flex-wrap gap-2">
                {restoreResult.restoredItems.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 font-mono text-xs text-emerald-900 dark:text-emerald-200"
                  >
                    <strong>{item.tokenMatched}</strong> &rarr; {item.restoredValue} (×{item.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 3: TOKEN VAULT & PER-ENTITY WHITELIST MANAGER
         ===================================================================== */}
      {activeTab === 'token_vault' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 sm:px-5 bg-slate-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                In-Memory Session Token Vault ({activeVaultEntries.length} Unique Entities)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Inspect deterministic token mappings, whitelist specific values you want to keep unmasked, or export the vault JSON for multi-day LLM sessions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:w-52 min-w-[150px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={vaultSearch}
                  onChange={(e) => setVaultSearch(e.target.value)}
                  placeholder="Filter token or type..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <button
                type="button"
                onClick={() => setRevealRawInVault((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                {revealRawInVault ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" /> Hide Raw Values
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" /> Reveal Raw Values
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadVaultJson}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Export Vault (.JSON)
              </button>
            </div>
          </div>

          {filteredVaultEntries.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No entities in the current vault match your search.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[460px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Token Key</th>
                    <th className="py-2.5 px-3">Custom Alias / Applied</th>
                    <th className="py-2.5 px-3">Original Raw Value</th>
                    <th className="py-2.5 px-3">Entity Type</th>
                    <th className="py-2.5 px-3 text-right">Count</th>
                    <th className="py-2.5 px-3">Validation Rule</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-800 font-mono">
                  {filteredVaultEntries.map((entry) => (
                    <tr
                      key={entry.tokenKey}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        {entry.tokenKey}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <input
                          type="text"
                          value={options.customTokenOverrides[entry.rawValue] ?? ""}
                          placeholder={entry.appliedReplacement}
                          onChange={(e) => {
                            const val = e.target.value;
                            setOptions((prev) => {
                              const nextMap = { ...prev.customTokenOverrides };
                              if (!val.trim()) delete nextMap[entry.rawValue];
                              else nextMap[entry.rawValue] = val;
                              return { ...prev, customTokenOverrides: nextMap };
                            });
                          }}
                          aria-label={`Custom replacement for ${entry.tokenKey}`}
                          className="w-40 px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-200"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200 break-all max-w-[240px]">
                        {revealRawInVault
                          ? entry.rawValue
                          : formatPartialMask(entry.rawValue, entry.entityType)}
                      </td>
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {PII_ENTITY_REGISTRY[entry.entityType]?.label || entry.entityType}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {entry.occurrences}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {entry.validationMethod}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap font-sans">
                        <button
                          type="button"
                          onClick={() => handleToggleWhitelistValue(entry.rawValue)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${entry.isWhitelisted
                              ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300 hover:border-blue-500 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                            }`}
                        >
                          {entry.isWhitelisted ? 'Whitelisted (Keep)' : 'Masking Active'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 4: CUSTOM REGEX & ORGANIZATION DICTIONARY BUILDER
         ===================================================================== */}
      {activeTab === 'custom_rules' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Custom Organization Keywords &amp; Proprietary Regex Rules
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Add internal project codenames (e.g., <code>Project Titan</code>), custom employee badge numbers (<code>EMP-\d&#123;5&#125;</code>), or confidential client names so they are automatically tokenized alongside built-in PII detectors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Token Prefix Label
              </label>
              <input
                type="text"
                value={newRuleLabel}
                onChange={(e) => setNewRuleLabel(e.target.value)}
                placeholder="e.g. PROJECT_CODE"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Exact Keyword or Regular Expression Pattern
              </label>
              <input
                type="text"
                value={newRulePattern}
                onChange={(e) => setNewRulePattern(e.target.value)}
                placeholder="e.g. Project Apollo OR EMP-\d{5}"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="sm:col-span-3 flex items-center gap-2">
              <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newRuleIsRegex}
                  onChange={() => setNewRuleIsRegex((prev) => !prev)}
                  className="rounded border-slate-300 text-blue-600"
                />
                Regex
              </label>
              <button
                type="button"
                onClick={handleAddCustomRule}
                disabled={!newRulePattern.trim()}
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" /> Add Rule
              </button>
            </div>
          </div>

          {options.customRules.length === 0 ? (
            <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
              No custom rules configured yet. Add a keyword or regex pattern above to scrub custom company identifiers.
            </div>
          ) : (
            <div className="space-y-2">
              {options.customRules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold">
                      [{rule.label}]
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">
                      {rule.pattern}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {rule.isRegex ? 'RegExp' : 'Literal Keyword'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomRule(rule.id)}
                    className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 5: COMPLIANCE AUDIT & SPREADSHEET EXPORTS
         ===================================================================== */}
      {activeTab === 'compliance_exports' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Compliance Audit Deliverables (3-Sheet .XLSX, .CSV, Vault .JSON &amp; SHA-256 Receipt)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                All spreadsheet exports are protected against CWE-1236 formula injection. By default, raw PII values are omitted from audit spreadsheets so you can safely attach them to compliance tickets.
              </p>
            </div>
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={includeRawInExports}
                onChange={() => setIncludeRawInExports((prev) => !prev)}
                className="rounded border-slate-300 text-blue-600"
              />
              Include Raw Unmasked Values in CSV/XLSX
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                  3-Sheet Native Workbook
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  Excel Audit Report (.XLSX)
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Includes Executive Summary, Entity Token Vault, and Occurrence Ledger sheets.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadAuditXlsx}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" /> Download .XLSX
              </button>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase">
                  RFC 4180 Spreadsheet
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  Redaction Ledger (.CSV)
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Line, column, UTF-16 offset, token key, and checksum validation method per match.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadAuditCsv}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
              >
                <FileText className="w-4 h-4" /> Download .CSV
              </button>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase">
                  Reversible Mapping Dictionary
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  Session Token Vault (.JSON)
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Save your token map locally to restore AI responses in future browser sessions.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadVaultJson}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors"
              >
                <KeyRound className="w-4 h-4" /> Export Vault .JSON
              </button>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                  Cryptographic Proof
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  SHA-256 Receipt (.JSON)
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Before/after SHA-256 hashes, zero-leak verification status, and domain counts.
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDownloadCertificateJson}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold transition-colors"
                >
                  <FileCheck2 className="w-3.5 h-3.5" /> .JSON
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      generatePiiComplianceCertificateJson(redactionResult)
                    );
                    setCopiedCert(true);
                    setTimeout(() => setCopiedCert(false), 2000);
                  }}
                  className="px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  {copiedCert ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}