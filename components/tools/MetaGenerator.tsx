'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Search,
  Share2,
  Code2,
  Copy,
  Check,
  Download,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  ExternalLink,
  Laptop,
  Smartphone,
  Sliders,
  Image as ImageIcon,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
} from 'lucide-react';

import {
  MetaFormData,
  OgType,
  TwitterCardType,
  AuditResult,
  generateMetaHtml,
  calculateAuditScore,
  parseHtmlMetadata,
  getInitialFormData,
  SAMPLE_PRESETS,
  resolveEffectiveValues,
  isInstructionalPlaceholder,
  isValidCanonicalUrl,
  isDemoCanonicalUrl,
  calculateEditorCompleteness,
  isEditorEmpty,
} from '@/lib/metaGeneratorEngine';

type ActiveTab = 'editor' | 'auditor';
type PreviewPlatform = 'google' | 'facebook' | 'twitter' | 'linkedin' | 'slack';
type CodeSection = 'all' | 'basic' | 'openGraph' | 'twitter';

function TwitterIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.72a1.6 1.6 0 1 0 1.6 1.6 1.6 1.6 0 0 0-1.6-1.6z" />
    </svg>
  );
}

export default function MetaGenerator() {
  // Main Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('editor');

  // Form State - Starts completely blank on every fresh load and refresh
  const [formData, setFormData] = useState<MetaFormData>(() => getInitialFormData());

  // UI State
  const [activePreview, setActivePreview] = useState<PreviewPlatform>('google');
  const [googleDevice, setGoogleDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [codeSection, setCodeSection] = useState<CodeSection>('all');
  const [openSections, setOpenSections] = useState({
    basic: true,
    openGraph: true,
    twitter: true,
    advanced: false,
  });

  // Notification / Feedback State
  const [notification, setNotification] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>('');

  // Auditor State
  const [auditInputMode, setAuditInputMode] = useState<'paste' | 'url'>('paste');
  const [pastedHtml, setPastedHtml] = useState<string>('');
  const [inspectUrl, setInspectUrl] = useState<string>('');
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [inspectError, setInspectError] = useState<string>('');
  const [inspectedMetadata, setInspectedMetadata] = useState<Partial<MetaFormData> | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  const announce = useCallback((msg: string) => {
    setAriaAnnouncement(msg);
  }, []);

  const showNotification = useCallback(
    (msg: string) => {
      setNotification(msg);
      announce(msg);
      setTimeout(() => setNotification(''), 3000);
    },
    [announce]
  );

  // Field change handler
  const handleFieldChange = useCallback(
    <K extends keyof MetaFormData>(field: K, value: MetaFormData[K]) => {
      setFormData((prev) => {
        const next = { ...prev, [field]: value };
        return next;
      });
    },
    []
  );

  // Robots directive toggle
  const handleRobotsToggle = useCallback((directive: keyof MetaFormData['robots']) => {
    setFormData((prev) => ({
      ...prev,
      robots: {
        ...prev.robots,
        [directive]: !prev.robots[directive],
      },
    }));
  }, []);

  // Generated Code Memo
  const generatedCode = useMemo(() => {
    return generateMetaHtml(formData, codeSection);
  }, [formData, codeSection]);


  // Effective Values for Previews
  const effective = useMemo(() => {
    return resolveEffectiveValues(formData);
  }, [formData]);

  // Copy to Clipboard
  const handleCopy = async (textToCopy?: string) => {
    const text = textToCopy || generatedCode;
    if (!text) return;

    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === 'function'
      ) {
        await navigator.clipboard.writeText(text);
        setCopySuccess(true);
        showNotification('HTML meta tags copied to clipboard!');
        setTimeout(() => setCopySuccess(false), 2000);
        return;
      }
    } catch {
      // Fallback below
    }

    // Fallback using textarea
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (success) {
        setCopySuccess(true);
        showNotification('HTML meta tags copied to clipboard!');
        setTimeout(() => setCopySuccess(false), 2000);
      } else {
        showNotification('Clipboard access denied. Please manually select and copy the code.');
      }
    } catch {
      showNotification('Failed to copy to clipboard.');
    }
  };

  // Download HTML file
  const handleDownload = (extension: 'html' | 'txt') => {
    const filename = `meta-tags.${extension}`;
    const blob = new Blob([generatedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification(`Downloaded ${filename} successfully!`);
  };

  // Load Preset
  const handleLoadPreset = (key: keyof typeof SAMPLE_PRESETS) => {
    const preset = SAMPLE_PRESETS[key];
    if (preset) {
      setFormData((prev) => ({
        ...prev,
        ...preset,
      }));
      showNotification(`Loaded ${key.toUpperCase()} configuration template.`);
    }
  };

  // Reset to Blank
  const handleReset = () => {
    setFormData(getInitialFormData());
    setAuditResult(null);
    setPastedHtml('');
    setInspectUrl('');
    setInspectError('');
    setInspectedMetadata(null);
    showNotification('Cleared all metadata fields to blank defaults.');
  };

  // Custom Tag Helpers
  const handleAddCustomTag = () => {
    const newTag = {
      id: `custom-${Date.now()}`,
      type: 'name' as const,
      key: '',
      content: '',
    };
    setFormData((prev) => ({
      ...prev,
      customTags: [...prev.customTags, newTag],
    }));
  };

  const handleUpdateCustomTag = (
    id: string,
    field: 'type' | 'key' | 'content',
    val: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      customTags: prev.customTags.map((tag) =>
        tag.id === id ? { ...tag, [field]: val } : tag
      ),
    }));
  };

  const handleRemoveCustomTag = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      customTags: prev.customTags.filter((tag) => tag.id !== id),
    }));
  };

  // --- Auditor Functions ---
  const handleAuditPastedHtml = () => {
    if (!pastedHtml.trim()) {
      showNotification('Please paste HTML or <head> code to audit.');
      return;
    }
    const parsed = parseHtmlMetadata(pastedHtml);
    const completeData: MetaFormData = {
      ...getInitialFormData(),
      ...parsed,
      robots: {
        ...getInitialFormData().robots,
        ...(parsed.robots || {}),
      },
    };
    const result = calculateAuditScore(completeData);
    setAuditResult(result);
    showNotification(
      `Audit complete: Quality Score ${result.score}/100 (${result.rating})`
    );
  };

  const handleInspectRemoteUrl = async () => {
    const target = inspectUrl.trim();
    if (!target) {
      setInspectError('Please enter a valid website URL.');
      return;
    }

    if (!/^https?:\/\//i.test(target)) {
      setInspectError('URL must begin with http:// or https://');
      return;
    }

    setIsInspecting(true);
    setInspectError('');

    try {
      const res = await fetch('/api/inspect-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Inspection failed (HTTP ${res.status})`);
      }

      if (data.metadata) {
        setInspectedMetadata(data.metadata);
        const completeData: MetaFormData = {
          ...getInitialFormData(),
          ...data.metadata,
          robots: {
            ...getInitialFormData().robots,
            ...(data.metadata.robots || {}),
          },
        };
        const result = calculateAuditScore(completeData);
        setAuditResult(result);
        showNotification(
          `Inspected ${target}: Quality Score ${result.score}/100`
        );
      }
    } catch (err: unknown) {
      setInspectError(
        err instanceof Error
          ? err.message
          : 'Failed to inspect remote URL.'
      );
    } finally {
      setIsInspecting(false);
    }
  };

  const handleImportAuditedTags = () => {
    if (!auditResult) return;
    let parsed: Partial<MetaFormData> | null = null;
    if (auditInputMode === 'paste' && pastedHtml) {
      parsed = parseHtmlMetadata(pastedHtml);
    } else if (auditInputMode === 'url' && inspectedMetadata) {
      parsed = inspectedMetadata;
    } else if (inspectedMetadata) {
      parsed = inspectedMetadata;
    } else if (pastedHtml) {
      parsed = parseHtmlMetadata(pastedHtml);
    }

    if (parsed) {
      setFormData((prev) => ({
        ...prev,
        ...parsed,
        robots: {
          ...prev.robots,
          ...(parsed.robots || {}),
        },
      }));
      setActiveTab('editor');
      showNotification('Imported audited metadata into Editor! Review and export tags.');
    } else {
      showNotification('No parsed metadata available to import.');
    }
  };

  // Check if user has entered any editable metadata
  const isFormEmpty = useMemo(() => isEditorEmpty(formData), [formData]);

  // Live Editor Completeness Score (decoupled from external Page Audit)
  const editorCompleteness = useMemo(() => {
    return calculateEditorCompleteness(formData);
  }, [formData]);

  // Detect if current image is a sample preset image vs user-provided image
  const isPresetDemoImage = useMemo(() => {
    const img = effective.effectiveOgImage?.trim();
    if (!img) return false;
    return Object.values(SAMPLE_PRESETS).some((p) => p.ogImage === img);
  }, [effective.effectiveOgImage]);

  // Check if canonical URL is an example/demo domain
  const isCanonicalDemo = useMemo(() => {
    return isDemoCanonicalUrl(formData.canonicalUrl);
  }, [formData.canonicalUrl]);

  // Check if canonical URL has invalid syntax
  const isCanonicalInvalid = useMemo(() => {
    const val = formData.canonicalUrl.trim();
    return Boolean(val && !isValidCanonicalUrl(val));
  }, [formData.canonicalUrl]);

  // Clean Display URL for Previews
  const hasDomain = Boolean(
    effective.canonicalUrl?.trim() || effective.effectiveOgUrl?.trim()
  );
  const displayDomain = useMemo(() => {
    const target = effective.canonicalUrl?.trim() || effective.effectiveOgUrl?.trim();
    if (!target) return '';
    try {
      const u = new URL(target.startsWith('http') ? target : `https://${target}`);
      return u.hostname + (u.pathname !== '/' ? u.pathname : '');
    } catch {
      return target;
    }
  }, [effective.canonicalUrl, effective.effectiveOgUrl]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* SCREEN READER ANNOUNCER */}
      <div
        id="ariaAnnouncer"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {ariaAnnouncement}
      </div>

      {/* HEADER CONTROLS & PRIVACY BADGE */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Privacy Guaranteed • Real-time client-side generation & preview simulation</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 px-1.5 hidden md:inline">Presets:</span>
            <button
              type="button"
              id="preset-website"
              onClick={() => handleLoadPreset('saas')}
              className="px-2 py-0.5 text-xs font-semibold rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Website
            </button>
            <button
              type="button"
              id="preset-article"
              onClick={() => handleLoadPreset('article')}
              className="px-2 py-0.5 text-xs font-semibold rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Article
            </button>
            <button
              type="button"
              id="preset-product"
              onClick={() => handleLoadPreset('product')}
              className="px-2 py-0.5 text-xs font-semibold rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Product
            </button>
          </div>

          <button
            type="button"
            id="btn-reset"
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            title="Reset to blank inputs"
            aria-label="Reset all inputs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* NOTIFICATION BANNER */}
      {notification && (
        <div
          role="status"
          className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex items-center justify-between text-xs sm:text-sm text-blue-900 dark:text-blue-200 shadow-xs transition-all animate-fadeIn"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification('')}
            className="text-blue-500 hover:text-blue-700 p-0.5 font-bold"
            aria-label="Dismiss alert"
          >
            ✕
          </button>
        </div>
      )}

      {/* WORKSPACE NAVIGATION TABS */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2" role="tablist" aria-label="Tool sections">
          <button
            role="tab"
            id="tab-editor"
            aria-selected={activeTab === 'editor'}
            onClick={() => setActiveTab('editor')}
            className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'editor'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Metadata Generator & Previews</span>
          </button>

          <button
            role="tab"
            id="tab-auditor"
            aria-selected={activeTab === 'auditor'}
            onClick={() => setActiveTab('auditor')}
            className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'auditor'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Page SEO Auditor</span>
            <span
              id="auditor-tab-badge"
              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                auditResult
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold'
              }`}
            >
              {auditResult ? `Score: ${auditResult.score}` : 'Not audited yet'}
            </span>
          </button>
        </div>

        {/* Real-time Status Badge in Header */}
        <div id="header-score-indicator" className="hidden sm:flex items-center gap-2 text-xs">
          {activeTab === 'editor' ? (
            <>
              <span className="text-slate-500 font-medium">Editor Completeness:</span>
              {isFormEmpty ? (
                <span
                  id="editor-completeness-badge"
                  className="font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                >
                  Not started
                </span>
              ) : (
                <span
                  id="editor-completeness-badge"
                  className={`font-mono font-bold px-2 py-0.5 rounded-full ${
                    editorCompleteness.score >= 90
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : editorCompleteness.score >= 70
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  }`}
                >
                  {editorCompleteness.score}/100 • {editorCompleteness.rating}
                </span>
              )}
            </>
          ) : (
            <>
              <span className="text-slate-500 font-medium">Page Audit:</span>
              {auditResult ? (
                <span
                  id="page-audit-badge"
                  className={`font-mono font-bold px-2 py-0.5 rounded-full ${
                    auditResult.score >= 90
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : auditResult.score >= 70
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  }`}
                >
                  {auditResult.score}/100 • {auditResult.rating}
                </span>
              ) : (
                <span
                  id="page-audit-badge"
                  className="font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                >
                  Not audited yet
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: METADATA EDITOR & LIVE PREVIEWS                   */}
      {/* ======================================================== */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: FORM SECTIONS (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. PRIMARY SEO METADATA */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() =>
                  setOpenSections((p) => ({ ...p, basic: !p.basic }))
                }
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Primary SEO Metadata
                  </h3>
                </div>
                {openSections.basic ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {openSections.basic && (
                <div className="space-y-4 pt-2">
                  {/* Title */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="metaTitle"
                        className="text-xs font-bold text-slate-700 dark:text-slate-300"
                      >
                        Page Title (<code>&lt;title&gt;</code>)
                      </label>
                      <span
                        className={`text-[11px] font-mono ${
                          formData.title.length > 60
                            ? 'text-amber-600 dark:text-amber-400 font-bold'
                            : formData.title.length >= 30
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {formData.title.length} / 60 chars (approx 580px)
                      </span>
                    </div>
                    <input
                      id="metaTitle"
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      placeholder="e.g., KivaroTools — Fast & Free Online Utilities for Developers"
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Google typically truncates titles over ~60 characters on desktop and ~55 on mobile.
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="metaDesc"
                        className="text-xs font-bold text-slate-700 dark:text-slate-300"
                      >
                        Meta Description (<code>&lt;meta name=&quot;description&quot;&gt;</code>)
                      </label>
                      <span
                        className={`text-[11px] font-mono ${
                          formData.description.length > 160
                            ? 'text-amber-600 dark:text-amber-400 font-bold'
                            : formData.description.length >= 120
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {formData.description.length} / 160 chars
                      </span>
                    </div>
                    <textarea
                      id="metaDesc"
                      rows={3}
                      value={formData.description}
                      onChange={(e) =>
                        handleFieldChange('description', e.target.value)
                      }
                      placeholder="Summarize the core value of the page in 120-160 characters..."
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  {/* Canonical URL */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="metaCanonical"
                        className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                      >
                        Canonical URL (<code>&lt;link rel=&quot;canonical&quot;&gt;</code>)
                      </label>
                      {isCanonicalDemo && (
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-900/60">
                          Demo Preset Example
                        </span>
                      )}
                    </div>
                    <input
                      id="metaCanonical"
                      type="url"
                      value={formData.canonicalUrl}
                      onChange={(e) =>
                        handleFieldChange('canonicalUrl', e.target.value)
                      }
                      placeholder="https://example.com/page"
                      className={`w-full px-3.5 py-2 rounded-2xl border ${
                        isCanonicalInvalid
                          ? 'border-red-400 dark:border-red-600 bg-red-50/30 dark:bg-red-950/20'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50'
                      } text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs`}
                    />
                    {isCanonicalInvalid ? (
                      <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Invalid canonical URL format. Must be an absolute URL starting with https:// or http:// without spaces.</span>
                      </p>
                    ) : isCanonicalDemo ? (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 shrink-0" />
                        <span>Preset example URL. Replace with your actual authoritative domain before deployment.</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Authoritative public URL to consolidate duplicate variants. Canonical tags are search engine hints, not absolute guarantees, and do not replace server-side 301 redirects.
                      </p>
                    )}
                  </div>

                  {/* Robots Directives */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Robots Crawling Directives
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-950/30 cursor-pointer select-none text-xs">
                        <input
                          type="checkbox"
                          id="robots-index"
                          checked={formData.robots.index}
                          onChange={() => handleRobotsToggle('index')}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-semibold">index</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-950/30 cursor-pointer select-none text-xs">
                        <input
                          type="checkbox"
                          id="robots-follow"
                          checked={formData.robots.follow}
                          onChange={() => handleRobotsToggle('follow')}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-semibold">follow</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-950/30 cursor-pointer select-none text-xs">
                        <input
                          type="checkbox"
                          id="robots-noarchive"
                          checked={formData.robots.noarchive}
                          onChange={() => handleRobotsToggle('noarchive')}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>noarchive</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-950/30 cursor-pointer select-none text-xs">
                        <input
                          type="checkbox"
                          id="robots-nosnippet"
                          checked={formData.robots.nosnippet}
                          onChange={() => handleRobotsToggle('nosnippet')}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>nosnippet</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-950/30 cursor-pointer select-none text-xs">
                        <input
                          type="checkbox"
                          id="robots-noimageindex"
                          checked={formData.robots.noimageindex}
                          onChange={() => handleRobotsToggle('noimageindex')}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>noimageindex</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-950/30 cursor-pointer select-none text-xs">
                        <input
                          type="checkbox"
                          id="robots-notranslate"
                          checked={formData.robots.notranslate}
                          onChange={() => handleRobotsToggle('notranslate')}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>notranslate</span>
                      </label>
                    </div>

                    {(!formData.robots.index || !formData.robots.follow) && (
                      <div className="mt-2.5 p-3 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-bold">
                            Indexing Notice:{' '}
                            {!formData.robots.index && (
                              <span><code>index</code> disabled (emitting <code>noindex</code>). Search engines are instructed not to index this page in search results. </span>
                            )}
                            {!formData.robots.follow && (
                              <span><code>follow</code> disabled (emitting <code>nofollow</code>). Search engines are instructed not to crawl links found on this page.</span>
                            )}
                          </p>
                          <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                            Robots meta directives are crawler instructions, not security or access-control barriers. Crawlers must be able to fetch the page to discover this directive.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Secondary Fields (Author, Theme, Keywords) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label
                        htmlFor="metaAuthor"
                        className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Author / Publisher
                      </label>
                      <input
                        id="metaAuthor"
                        type="text"
                        value={formData.author}
                        onChange={(e) => handleFieldChange('author', e.target.value)}
                        placeholder="e.g., KivaroTools Team"
                        className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="themeColor"
                        className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Theme Color (Browser UI)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="themeColorPicker"
                          aria-label="Theme color visual picker"
                          value={formData.themeColor || '#3b82f6'}
                          onChange={(e) =>
                            handleFieldChange('themeColor', e.target.value)
                          }
                          className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer bg-transparent"
                        />
                        <input
                          id="themeColor"
                          type="text"
                          value={formData.themeColor}
                          onChange={(e) =>
                            handleFieldChange('themeColor', e.target.value)
                          }
                          placeholder="#3b82f6"
                          className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Keywords Notice */}
                  <div>
                    <label
                      htmlFor="metaKeywords"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Meta Keywords <span className="text-slate-400 font-normal">(Optional • Not used by Google)</span>
                    </label>
                    <input
                      id="metaKeywords"
                      type="text"
                      value={formData.keywords}
                      onChange={(e) => handleFieldChange('keywords', e.target.value)}
                      placeholder="tools, utilities, seo, converters"
                      className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. OPEN GRAPH PROTOCOL */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() =>
                  setOpenSections((p) => ({ ...p, openGraph: !p.openGraph }))
                }
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Open Graph (Facebook / LinkedIn / Slack)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Standard protocol used across Facebook, LinkedIn, Discord, and Slack.
                    </p>
                  </div>
                </div>
                {openSections.openGraph ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {openSections.openGraph && (
                <div className="space-y-4 pt-2">
                  {/* Sync Toggle */}
                  <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                        Synchronize Social Cards with Basic SEO
                      </span>
                      <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/70">
                        Inherit title, description, and URL automatically unless custom overrides are entered.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="toggle-social-sync"
                        aria-label="Synchronize Social Cards with Basic SEO"
                        checked={formData.syncSocialWithBasic}
                        onChange={(e) =>
                          handleFieldChange('syncSocialWithBasic', e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* og:type and og:site_name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="ogType"
                        className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Content Type (<code>og:type</code>)
                      </label>
                      <select
                        id="ogType"
                        value={formData.ogType}
                        onChange={(e) =>
                          handleFieldChange('ogType', e.target.value as OgType)
                        }
                        className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="website">website (Standard sites / homepages)</option>
                        <option value="article">article (Blog posts / news articles)</option>
                        <option value="product">product (E-commerce items)</option>
                        <option value="profile">profile (Author / personal pages)</option>
                        <option value="video.movie">video.movie (Film / video)</option>
                        <option value="music.song">music.song (Audio / track)</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="ogSiteName"
                        className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Site Name (<code>og:site_name</code>)
                      </label>
                      <input
                        id="ogSiteName"
                        type="text"
                        value={formData.ogSiteName}
                        onChange={(e) =>
                          handleFieldChange('ogSiteName', e.target.value)
                        }
                        placeholder="e.g., KivaroTools"
                        className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Social Image URL */}
                  <div>
                    <label
                      htmlFor="ogImage"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Social Preview Image (<code>og:image</code>)
                    </label>
                    <input
                      id="ogImage"
                      type="url"
                      value={formData.ogImage}
                      onChange={(e) => handleFieldChange('ogImage', e.target.value)}
                      placeholder="https://example.com/assets/og-image.jpg"
                      className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      <span>Recommended: <strong>1200 × 630 px</strong> (1.91:1 ratio, max 8MB).</span>
                      {formData.ogImage && (
                        <a
                          href={formData.ogImage}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline inline-flex items-center gap-0.5"
                        >
                          Test Image Link <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Image Alt and Dimensions */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="ogImageAlt"
                        className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Image Alt Text (<code>og:image:alt</code>)
                      </label>
                      <input
                        id="ogImageAlt"
                        type="text"
                        value={formData.ogImageAlt}
                        onChange={(e) =>
                          handleFieldChange('ogImageAlt', e.target.value)
                        }
                        placeholder="Descriptive text for accessibility"
                        className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="ogLocale"
                        className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Locale (<code>og:locale</code>)
                      </label>
                      <input
                        id="ogLocale"
                        type="text"
                        value={formData.ogLocale}
                        onChange={(e) =>
                          handleFieldChange('ogLocale', e.target.value)
                        }
                        placeholder="en_US"
                        className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Independent Overrides (when sync is disabled or explicit override is needed) */}
                  {!formData.syncSocialWithBasic && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-3">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Explicit Open Graph Overrides
                      </span>
                      <div>
                        <label
                          htmlFor="ogTitle"
                          className="block text-xs text-slate-600 dark:text-slate-400 mb-1"
                        >
                          Custom Open Graph Title (<code>og:title</code>)
                        </label>
                        <input
                          id="ogTitle"
                          type="text"
                          value={formData.ogTitle}
                          onChange={(e) =>
                            handleFieldChange('ogTitle', e.target.value)
                          }
                          placeholder={formData.title || 'Inherited from page title'}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="ogDesc"
                          className="block text-xs text-slate-600 dark:text-slate-400 mb-1"
                        >
                          Custom Open Graph Description (<code>og:description</code>)
                        </label>
                        <textarea
                          id="ogDesc"
                          rows={2}
                          value={formData.ogDescription}
                          onChange={(e) =>
                            handleFieldChange('ogDescription', e.target.value)
                          }
                          placeholder={formData.description || 'Inherited from meta description'}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Type specific fields (Article) */}
                  {formData.ogType === 'article' && (
                    <div className="p-3.5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 space-y-3">
                      <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                        Article Metadata Properties
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={formData.articleAuthor || ''}
                          onChange={(e) =>
                            handleFieldChange('articleAuthor', e.target.value)
                          }
                          placeholder="Author Name"
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                        />
                        <input
                          type="text"
                          value={formData.articleSection || ''}
                          onChange={(e) =>
                            handleFieldChange('articleSection', e.target.value)
                          }
                          placeholder="Section (e.g. Technology)"
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                        />
                        <input
                          type="datetime-local"
                          value={formData.articlePublishedTime || ''}
                          onChange={(e) =>
                            handleFieldChange('articlePublishedTime', e.target.value)
                          }
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* Type specific fields (Product) */}
                  {formData.ogType === 'product' && (
                    <div className="p-3.5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 space-y-3">
                      <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                        Product Properties
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={formData.productPriceAmount || ''}
                          onChange={(e) =>
                            handleFieldChange('productPriceAmount', e.target.value)
                          }
                          placeholder="Price (e.g. 99.00)"
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                        />
                        <input
                          type="text"
                          value={formData.productPriceCurrency || ''}
                          onChange={(e) =>
                            handleFieldChange('productPriceCurrency', e.target.value)
                          }
                          placeholder="Currency (e.g. USD)"
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. TWITTER / X CARDS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() =>
                  setOpenSections((p) => ({ ...p, twitter: !p.twitter }))
                }
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Twitter / X Cards
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Card types and profile attribution tags for X (Twitter).
                    </p>
                  </div>
                </div>
                {openSections.twitter ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {openSections.twitter && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label
                        htmlFor="twitterCard"
                        className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Card Type (<code>twitter:card</code>)
                      </label>
                      <select
                        id="twitterCard"
                        value={formData.twitterCard}
                        onChange={(e) =>
                          handleFieldChange(
                            'twitterCard',
                            e.target.value as TwitterCardType
                          )
                        }
                        className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="summary_large_image">
                          summary_large_image (Large banner)
                        </option>
                        <option value="summary">summary (Compact thumbnail)</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="twitterSite"
                        className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Website @handle (<code>twitter:site</code>)
                      </label>
                      <input
                        id="twitterSite"
                        type="text"
                        value={formData.twitterSite}
                        onChange={(e) =>
                          handleFieldChange('twitterSite', e.target.value)
                        }
                        placeholder="@brand"
                        className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor="twitterCreator"
                          className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                        >
                          Creator @handle (<code>twitter:creator</code>)
                        </label>
                        {formData.twitterCreator && isInstructionalPlaceholder(formData.twitterCreator) && (
                          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-900/60">
                            Placeholder Detected
                          </span>
                        )}
                      </div>
                      <input
                        id="twitterCreator"
                        type="text"
                        value={formData.twitterCreator}
                        onChange={(e) =>
                          handleFieldChange('twitterCreator', e.target.value)
                        }
                        placeholder="@author"
                        className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {formData.twitterCreator && isInstructionalPlaceholder(formData.twitterCreator) && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                          <Info className="w-3.5 h-3.5 shrink-0" />
                          <span>Instructional placeholder detected — this value will be omitted from generated HTML until a real handle is provided.</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. ADVANCED & CUSTOM TAGS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() =>
                  setOpenSections((p) => ({ ...p, advanced: !p.advanced }))
                }
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Document Defaults & Custom Tags
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Charset, viewport configuration, and custom arbitrary meta tags.
                    </p>
                  </div>
                </div>
                {openSections.advanced ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {openSections.advanced && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="metaCharset"
                        className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Charset (Default: UTF-8)
                      </label>
                      <input
                        id="metaCharset"
                        type="text"
                        value={formData.charset}
                        onChange={(e) => handleFieldChange('charset', e.target.value)}
                        className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-mono text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="metaViewport"
                        className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Mobile Viewport
                      </label>
                      <input
                        id="metaViewport"
                        type="text"
                        value={formData.viewport}
                        onChange={(e) =>
                          handleFieldChange('viewport', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Custom Meta Tags List */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Custom Meta Tags
                      </span>
                      <button
                        type="button"
                        onClick={handleAddCustomTag}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100"
                      >
                        <Plus className="w-3 h-3" /> Add Tag
                      </button>
                    </div>

                    {formData.customTags.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">
                        No custom meta tags added. Click &quot;Add Tag&quot; to define custom name/property tags.
                      </p>
                    ) : (
                      formData.customTags.map((tag) => (
                        <div
                          key={tag.id}
                          className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800"
                        >
                          <select
                            value={tag.type}
                            onChange={(e) =>
                              handleUpdateCustomTag(
                                tag.id,
                                'type',
                                e.target.value as 'name' | 'property' | 'http-equiv'
                              )
                            }
                            className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                          >
                            <option value="name">name</option>
                            <option value="property">property</option>
                            <option value="http-equiv">http-equiv</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Tag Key"
                            value={tag.key}
                            onChange={(e) =>
                              handleUpdateCustomTag(tag.id, 'key', e.target.value)
                            }
                            className="flex-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                          />
                          <input
                            type="text"
                            placeholder="Content Value"
                            value={tag.content}
                            onChange={(e) =>
                              handleUpdateCustomTag(
                                tag.id,
                                'content',
                                e.target.value
                              )
                            }
                            className="flex-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomTag(tag.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: LIVE PREVIEWS & GENERATED CODE (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* PREVIEW CONTAINER */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4 sticky top-6">
              {/* Preview Platform Tabs */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl overflow-x-auto max-w-full">
                  <button
                    type="button"
                    id="preview-google"
                    onClick={() => setActivePreview('google')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-xl transition-all ${
                      activePreview === 'google'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    id="preview-facebook"
                    onClick={() => setActivePreview('facebook')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-xl transition-all ${
                      activePreview === 'facebook'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Open Graph</span>
                  </button>

                  <button
                    type="button"
                    id="preview-twitter"
                    onClick={() => setActivePreview('twitter')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-xl transition-all ${
                      activePreview === 'twitter'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <TwitterIcon className="w-3.5 h-3.5" />
                    <span>X</span>
                  </button>

                  <button
                    type="button"
                    id="preview-linkedin"
                    onClick={() => setActivePreview('linkedin')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-xl transition-all ${
                      activePreview === 'linkedin'
                        ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <LinkedinIcon className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </button>
                </div>
              </div>

              {/* SIMULATION VIEWER */}
              <div>
                {/* 1. GOOGLE SEARCH SIMULATION */}
                {activePreview === 'google' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold">SERP Snippet Simulation</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          id="btn-google-desktop"
                          onClick={() => setGoogleDevice('desktop')}
                          className={`p-1 rounded-lg ${
                            googleDevice === 'desktop'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-bold'
                              : 'text-slate-400'
                          }`}
                          title="Desktop View"
                          aria-label="Desktop SERP Preview"
                        >
                          <Laptop className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          id="btn-google-mobile"
                          onClick={() => setGoogleDevice('mobile')}
                          className={`p-1 rounded-lg ${
                            googleDevice === 'mobile'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-bold'
                              : 'text-slate-400'
                          }`}
                          title="Mobile View"
                          aria-label="Mobile SERP Preview"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 shadow-xs space-y-1.5">
                      {/* URL Breadcrumb */}
                      <div className="flex items-center gap-2 text-[12px] text-slate-700 dark:text-slate-300 font-sans">
                        <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-500">
                          G
                        </div>
                        <div className="truncate">
                          {hasDomain ? (
                            <>
                              <span className="font-semibold">{displayDomain}</span>
                              {isCanonicalDemo ? (
                                <span className="text-amber-600 dark:text-amber-400 text-[10px] ml-1.5 font-medium">(Demo URL)</span>
                              ) : (
                                <span className="text-slate-400 text-[11px] ml-1">› snippet</span>
                              )}
                            </>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 italic text-[11px]">
                              No canonical URL specified
                            </span>
                          )}
                        </div>
                      </div>

                      {/* SERP Headline */}
                      <h4 id="serp-preview-headline" className="font-sans text-base leading-snug line-clamp-2">
                        {formData.title.trim() ? (
                          <span className="text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer">
                            {formData.title}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 italic font-normal text-sm">
                            No page title specified
                          </span>
                        )}
                      </h4>

                      {/* Description */}
                      <p id="serp-preview-description" className="text-[13px] font-sans leading-relaxed line-clamp-3">
                        {formData.description.trim() ? (
                          <span className="text-[#4d5156] dark:text-[#bdc1c6]">
                            {formData.description}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 italic text-xs">
                            No meta description specified
                          </span>
                        )}
                      </p>
                    </div>

                    <p className="text-[10px] text-slate-400 italic">
                      * Illustrative approximation. Actual Google snippet display depends on viewport width and query context.
                    </p>
                  </div>
                )}

                {/* 2. OPEN GRAPH / FACEBOOK PREVIEW */}
                {activePreview === 'facebook' && (
                  <div id="preview-card-facebook" className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold">Open Graph Rich Card (1.91:1)</span>
                      <span className="text-[11px] font-mono">1200 × 630</span>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950/70 shadow-xs">
                      {/* Image Preview Box */}
                      <div className="aspect-[1.91/1] w-full bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center overflow-hidden">
                        {effective.effectiveOgImage.trim() ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={effective.effectiveOgImage}
                              alt={effective.effectiveOgImageAlt || 'Social Card'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback on image load error
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <div className="absolute top-2 right-2">
                              {isPresetDemoImage ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/90 text-white shadow-xs backdrop-blur-xs">
                                  Demo Preset Image (Sample Asset)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900/80 text-white shadow-xs backdrop-blur-xs">
                                  User Image (Preview Simulation)
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5 text-slate-400 text-xs text-center p-3">
                            <ImageIcon className="w-8 h-8 opacity-40" />
                            <span className="italic">No social image specified (1200 × 630 recommended)</span>
                          </div>
                        )}
                      </div>

                      {/* Text Details Box */}
                      <div className="p-3.5 space-y-1 bg-slate-50/50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] uppercase tracking-wider font-semibold truncate block">
                          {hasDomain ? (
                            <span className="text-slate-500">{displayDomain}</span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 italic normal-case text-[10px]">
                              No domain specified
                            </span>
                          )}
                        </span>
                        <h4 id="og-card-headline" className="text-sm font-bold line-clamp-2 leading-tight">
                          {effective.effectiveOgTitle.trim() ? (
                            <span className="text-slate-900 dark:text-white">
                              {effective.effectiveOgTitle}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 italic font-normal text-xs">
                              No Open Graph title specified
                            </span>
                          )}
                        </h4>
                        <p id="og-card-description" className="text-xs line-clamp-2 leading-normal">
                          {effective.effectiveOgDesc.trim() ? (
                            <span className="text-slate-600 dark:text-slate-400">
                              {effective.effectiveOgDesc}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 italic">
                              No Open Graph description specified
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. TWITTER / X PREVIEW */}
                {activePreview === 'twitter' && (
                  <div id="preview-card-twitter" className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold">
                        X (Twitter) • {formData.twitterCard}
                      </span>
                    </div>

                    {formData.twitterCard === 'summary_large_image' ? (
                      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950/70 shadow-xs">
                        <div className="aspect-[1.91/1] w-full bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center overflow-hidden">
                          {effective.effectiveTwitterImage.trim() ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={effective.effectiveTwitterImage}
                                alt={effective.effectiveTwitterImageAlt || 'Twitter Card'}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 right-2">
                                {isPresetDemoImage ? (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/90 text-white shadow-xs backdrop-blur-xs">
                                    Demo Preset Image (Sample Asset)
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900/80 text-white shadow-xs backdrop-blur-xs">
                                    User Image (Preview Simulation)
                                  </span>
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-slate-400 text-xs text-center p-3">
                              <ImageIcon className="w-6 h-6 opacity-40" />
                              <span className="italic">No card image specified (Large image summary)</span>
                            </div>
                          )}
                          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-medium backdrop-blur-xs">
                            {hasDomain ? (
                              displayDomain
                            ) : (
                              <span className="italic text-slate-300">No domain specified</span>
                            )}
                          </div>
                        </div>

                        <div className="p-3 space-y-1">
                          <h4 id="twitter-card-headline" className="text-sm font-bold line-clamp-1 leading-snug">
                            {effective.effectiveTwitterTitle.trim() ? (
                              <span className="text-slate-900 dark:text-white">
                                {effective.effectiveTwitterTitle}
                              </span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500 italic font-normal text-xs">
                                No Twitter title specified
                              </span>
                            )}
                          </h4>
                          <p id="twitter-card-description" className="text-xs line-clamp-2 leading-normal">
                            {effective.effectiveTwitterDesc.trim() ? (
                              <span className="text-slate-600 dark:text-slate-400">
                                {effective.effectiveTwitterDesc}
                              </span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500 italic">
                                No Twitter description specified
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Compact Summary Card */
                      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-2.5 flex gap-3 items-center bg-white dark:bg-slate-950/70 shadow-xs">
                        <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden flex items-center justify-center">
                          {effective.effectiveTwitterImage.trim() ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={effective.effectiveTwitterImage}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 opacity-40 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <span className="text-[10px] uppercase font-semibold block truncate">
                            {hasDomain ? (
                              <span className="text-slate-400">{displayDomain}</span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500 italic normal-case">
                                No domain specified
                              </span>
                            )}
                          </span>
                          <h4 id="twitter-card-headline-compact" className="text-xs font-bold line-clamp-1">
                            {effective.effectiveTwitterTitle.trim() ? (
                              <span className="text-slate-900 dark:text-white">
                                {effective.effectiveTwitterTitle}
                              </span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500 italic font-normal">
                                No Twitter title specified
                              </span>
                            )}
                          </h4>
                          <p id="twitter-card-description-compact" className="text-[11px] line-clamp-2">
                            {effective.effectiveTwitterDesc.trim() ? (
                              <span className="text-slate-500">
                                {effective.effectiveTwitterDesc}
                              </span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500 italic">
                                No Twitter description specified
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. LINKEDIN PREVIEW */}
                {activePreview === 'linkedin' && (
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-slate-500">LinkedIn Feed Card</span>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950/70 shadow-xs">
                      <div className="aspect-[1.91/1] w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                        {effective.effectiveOgImage.trim() ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={effective.effectiveOgImage}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2">
                              {isPresetDemoImage ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/90 text-white shadow-xs backdrop-blur-xs">
                                  Demo Preset Image (Sample Asset)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900/80 text-white shadow-xs backdrop-blur-xs">
                                  User Image (Preview Simulation)
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-slate-400 text-xs text-center p-3">
                            <ImageIcon className="w-8 h-8 opacity-40 text-slate-400" />
                            <span className="italic">No image specified</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                        <h4 id="linkedin-card-headline" className="text-xs font-bold line-clamp-2">
                          {effective.effectiveOgTitle.trim() ? (
                            <span className="text-slate-900 dark:text-white">
                              {effective.effectiveOgTitle}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 italic font-normal">
                              No title specified
                            </span>
                          )}
                        </h4>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {hasDomain ? (
                            `${displayDomain} • 2 min read`
                          ) : (
                            <span className="italic">No domain specified</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Simulated rendering disclaimer */}
                <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                  * Social card preview is a client-side simulation. Image rendering in this editor does not guarantee remote CDN availability, correct crawler headers, or live crawler caching.
                </p>
              </div>

              {/* GENERATED CODE VIEWER */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Generated HTML (for <code>&lt;head&gt;</code>)
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      id="btn-copy-html"
                      onClick={() => handleCopy()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
                      aria-label="Copy generated HTML meta tags"
                    >
                      {copySuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy All
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      id="btn-download-html"
                      onClick={() => handleDownload('html')}
                      className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Download as HTML file"
                      aria-label="Download generated HTML file"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Section Filter Pills */}
                <div className="flex items-center gap-1 text-[11px]">
                  {(['all', 'basic', 'openGraph', 'twitter'] as const).map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      id={`code-sec-${sec}`}
                      onClick={() => setCodeSection(sec)}
                      className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                        codeSection === sec
                          ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                      }`}
                    >
                      {sec === 'all'
                        ? 'All Tags'
                        : sec === 'basic'
                        ? 'SEO Only'
                        : sec === 'openGraph'
                        ? 'OG Only'
                        : 'Twitter Only'}
                    </button>
                  ))}
                </div>

                {/* Code Block Container */}
                <div className="relative">
                  <pre className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[300px] border border-slate-800 select-all">
                    <code id="meta-code-block">{generatedCode}</code>
                  </pre>
                </div>

                <p className="text-[10px] text-slate-400">
                  Paste these tags inside the <code>&lt;head&gt;</code> element of your website or CMS template.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PAGE AUDITOR & INSPECTOR                          */}
      {/* ======================================================== */}
      {activeTab === 'auditor' && (
        <div className="space-y-6">
          {/* INPUT FORM: PASTE HTML OR INSPECT URL */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Audit Existing Webpage Metadata
                </h3>
                <p className="text-xs text-slate-500">
                  Diagnose missing social tags, bad character counts, insecure URLs, and robots conflicts.
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                <button
                  type="button"
                  id="mode-audit-paste"
                  onClick={() => setAuditInputMode('paste')}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                    auditInputMode === 'paste'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Paste HTML
                </button>
                <button
                  type="button"
                  id="mode-audit-url"
                  onClick={() => setAuditInputMode('url')}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                    auditInputMode === 'url'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Inspect Live URL
                </button>
              </div>
            </div>

            {/* MODE A: PASTE HTML */}
            {auditInputMode === 'paste' && (
              <div className="space-y-3">
                <label
                  htmlFor="pasteHtmlArea"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Paste HTML Source or <code>&lt;head&gt;</code> Snippet:
                </label>
                <textarea
                  id="pasteHtmlArea"
                  rows={6}
                  value={pastedHtml}
                  onChange={(e) => setPastedHtml(e.target.value)}
                  placeholder="<!DOCTYPE html><html><head><title>Example</title><meta name='description' content='...'></head>..."
                  className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 font-mono text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Safe client-side DOM parsing without script execution.
                  </span>
                  <button
                    type="button"
                    id="btn-audit-pasted"
                    onClick={handleAuditPastedHtml}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Audit Pasted HTML</span>
                  </button>
                </div>
              </div>
            )}

            {/* MODE B: INSPECT URL */}
            {auditInputMode === 'url' && (
              <div className="space-y-3">
                <label
                  htmlFor="inspectUrlInput"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Enter Public Webpage URL to Inspect:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="inspectUrlInput"
                    type="url"
                    value={inspectUrl}
                    onChange={(e) => setInspectUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    id="btn-inspect-url"
                    disabled={isInspecting}
                    onClick={handleInspectRemoteUrl}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs"
                  >
                    {isInspecting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Inspecting...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        <span>Inspect Page</span>
                      </>
                    )}
                  </button>
                </div>

                {inspectError && (
                  <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{inspectError}</span>
                  </div>
                )}

                <p className="text-[11px] text-slate-500">
                  Protected with strict server-side SSRF filters (blocks private networks, loopback, non-HTTP schemes).
                </p>
              </div>
            )}
          </div>

          {/* AUDIT SCORECARD & REPORT */}
          {auditResult && (
            <div className="space-y-6">
              {/* Top Score Banner */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-5">
                  {/* Circular Score Gauge */}
                  <div
                    className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 font-mono ${
                      auditResult.score >= 90
                        ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                        : auditResult.score >= 70
                        ? 'border-amber-500 text-amber-600 bg-amber-50/50 dark:bg-amber-950/30'
                        : 'border-red-500 text-red-600 bg-red-50/50 dark:bg-red-950/30'
                    }`}
                  >
                    <span className="text-2xl font-black">{auditResult.score}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      / 100
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                        {auditResult.rating}
                      </h4>
                      <span className="text-xs text-slate-400">SEO Quality Score</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" /> {auditResult.summary.errors} Errors
                      </span>
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" /> {auditResult.summary.warnings} Warnings
                      </span>
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {auditResult.summary.passed} Passed
                      </span>
                    </div>
                  </div>
                </div>

                {/* Import into Editor Button */}
                <button
                  type="button"
                  id="btn-import-audited"
                  onClick={handleImportAuditedTags}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all w-full sm:w-auto justify-center"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Import &amp; Fix in Generator</span>
                </button>
              </div>

              {/* Categorized Findings List */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Actionable Findings &amp; Diagnostics ({auditResult.findings.length})
                </h4>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {auditResult.findings.map((f) => (
                    <div key={f.id} className="py-3.5 flex items-start gap-3">
                      {f.severity === 'error' && (
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      )}
                      {f.severity === 'warning' && (
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      {f.severity === 'info' && (
                        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      )}
                      {f.severity === 'success' && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {f.title}
                          </h5>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              f.severity === 'error'
                                ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                                : f.severity === 'warning'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                : f.severity === 'info'
                                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            {f.severity}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          <strong>Observed:</strong> {f.observed}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {f.explanation}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                          <strong>Action:</strong> {f.recommendation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
