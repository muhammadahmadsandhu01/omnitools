'use client';

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  Copy,
  Check,
  Download,
  Trash2,
  ArrowUpDown,
  Sparkles,
  ShieldCheck,
  FileText,
  Sliders,
  Type,
  Code2,
  Scissors,
  CheckCircle2,
  Globe,
  Search,
  X,
  Info,
  ChevronDown,
} from 'lucide-react';
import {
  type CaseMode,
  type CleanupAction,
  CASE_MODES,
  convertText,
  cleanupText,
  calculateTextStats,
} from '@/lib/textCaseEngine';
import {
  ISO_LANGUAGES,
  SPECIAL_CASING_LANGUAGES,
  getLanguageByBcp47,
  searchLanguages,
  type IsoLanguageEntry,
} from '@/lib/textCaseLocales';

const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog.
hello-world XMLHttpRequest parseJSONResponse userID
version2Update foo.bar.baz database_column_name`;

const CLEANUP_ACTIONS: ReadonlyArray<{
  action: CleanupAction;
  label: string;
  toastLabel: string;
  title: string;
}> = [
    {
      action: 'trim',
      label: 'Trim Outer',
      toastLabel: 'Trim Whitespace',
      title: 'Trim leading and trailing spaces from the entire text',
    },
    {
      action: 'normalize-spaces',
      label: 'Single Spaces',
      toastLabel: 'Normalized Spaces',
      title: 'Collapse multiple consecutive spaces and tabs into a single space',
    },
    {
      action: 'remove-blank-lines',
      label: 'Remove Blank Lines',
      toastLabel: 'Removed Blank Lines',
      title: 'Delete empty or whitespace-only lines',
    },
    {
      action: 'trim-lines',
      label: 'Trim Lines',
      toastLabel: 'Trimmed Each Line',
      title: 'Trim leading and trailing whitespace from each line',
    },
    {
      action: 'normalize-line-endings',
      label: 'CRLF → LF',
      toastLabel: 'Normalized Line Endings (CRLF → LF)',
      title: 'Convert Windows CRLF and classic Mac CR line endings to Unix LF',
    },
  ];

export default function TextCaseConverter() {
  const [inputText, setInputText] = useState<string>('');
  const [activeMode, setActiveMode] = useState<CaseMode>('sentence');
  const [activeGroup, setActiveGroup] = useState<'standard' | 'developer'>('standard');
  const [preserveLines, setPreserveLines] = useState<boolean>(true);
  const [locale, setLocale] = useState<string>('en-US');
  const [isLocaleModalOpen, setIsLocaleModalOpen] = useState<boolean>(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);
  const [languageSearchQuery, setLanguageSearchQuery] = useState<string>('');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'bicameral' | 'unicameral'>('all');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [notification, setNotification] = useState<string>('');
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>('');

  const outputRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const notificationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const announce = useCallback((msg: string) => {
    setAriaAnnouncement(msg);
  }, []);

  const showNotification = useCallback(
    (msg: string) => {
      setNotification(msg);
      announce(msg);
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
      notificationTimerRef.current = setTimeout(() => {
        setNotification('');
      }, 2500);
    },
    [announce]
  );

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const currentLanguage = useMemo(() => {
    return getLanguageByBcp47(locale) || ISO_LANGUAGES[0];
  }, [locale]);

  const filteredLanguages = useMemo(() => {
    return searchLanguages(languageSearchQuery, languageFilter);
  }, [languageSearchQuery, languageFilter]);

  const handleSelectLanguage = (lang: IsoLanguageEntry) => {
    setLocale(lang.bcp47);
    setIsLocaleModalOpen(false);
    showNotification(
      `Language set to ${lang.name} (${lang.bcp47})${lang.hasBicameralCasing ? '' : ' • Unicameral Script'}`
    );
  };

  // Keyboard accessibility: close modal on Escape
  useEffect(() => {
    if (!isLocaleModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLocaleModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocaleModalOpen]);

  // Live converted output
  const outputText = useMemo(() => {
    if (!inputText) return '';
    return convertText(inputText, activeMode, { locale, preserveLines });
  }, [inputText, activeMode, locale, preserveLines]);

  // Live text statistics (6 verified counters)
  const stats = useMemo(() => {
    return calculateTextStats(inputText);
  }, [inputText]);

  const triggerCopyFeedback = () => {
    setCopySuccess(true);
    showNotification('Converted text copied to clipboard!');
    if (copyTimerRef.current) {
      clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  };

  // Actions
  const handleCopy = async () => {
    if (!outputText) return;

    // Stage 1: Modern Async Clipboard API
    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === 'function'
      ) {
        await navigator.clipboard.writeText(outputText);
        triggerCopyFeedback();
        return;
      }
    } catch {
      // Primary API rejected (e.g. denied permission, insecure context, or unfocused window)
    }

    // Stage 2: Fallback via textarea selection and execCommand
    try {
      if (outputRef.current) {
        outputRef.current.focus();
        outputRef.current.select();
        const successful = document.execCommand('copy');
        if (successful) {
          triggerCopyFeedback();
          return;
        }
      }
    } catch {
      // Fallback failed
    }

    // Stage 3: Honest notification when clipboard permissions are denied / restricted
    showNotification('Could not copy to clipboard. Please select and copy manually.');
  };

  const handleDownload = () => {
    if (!outputText) return;
    try {
      const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted-${activeMode}-text.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification('Downloaded converted text file (.txt).');
    } catch {
      showNotification('Failed to generate text download.');
    }
  };

  const handleSelectAll = () => {
    if (!outputText) return;
    if (outputRef.current) {
      outputRef.current.focus();
      outputRef.current.select();
      showNotification('Output text selected.');
    }
  };

  const handleSwap = () => {
    if (!outputText) return;
    setInputText(outputText);
    showNotification('Swapped output back to input for further conversion.');
  };

  const handleClear = () => {
    setInputText('');
    showNotification('Input cleared.');
    inputRef.current?.focus();
  };

  const handleLoadSample = () => {
    setInputText(SAMPLE_TEXT);
    showNotification('Sample text loaded.');
  };

  const handleCleanup = (action: CleanupAction, label: string) => {
    if (!inputText) return;
    const cleaned = cleanupText(inputText, action);
    setInputText(cleaned);
    showNotification(`Applied: ${label}`);
  };

  const filteredModes = useMemo(() => {
    return CASE_MODES.filter((m) => m.group === activeGroup);
  }, [activeGroup]);

  const activeModeDetails = useMemo(() => {
    return CASE_MODES.find((m) => m.id === activeMode) || CASE_MODES[0];
  }, [activeMode]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5">
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

      {/* COMPACT TOP TOOLBAR: PRIVACY TRUST SIGNAL + QUICK ACTIONS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60">
          <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" aria-hidden="true" />
          <span>Runs locally in your browser • Text stays on your device</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleLoadSample}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 min-h-[40px] sm:min-h-[34px] px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            <span>Load Sample</span>
          </button>

          <button
            id="clearButton"
            type="button"
            disabled={!inputText}
            onClick={handleClear}
            className="inline-flex items-center justify-center gap-1.5 min-h-[40px] sm:min-h-[34px] px-3 py-1.5 text-xs font-semibold rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
            title="Clear input text"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* NOTIFICATION BANNER */}
      {notification && (
        <div
          role="status"
          className="px-3.5 py-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 flex items-center justify-between text-xs sm:text-sm text-purple-800 dark:text-purple-200 shadow-xs transition-all"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" aria-hidden="true" />
            <span>{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification('')}
            className="text-purple-500 hover:text-purple-700 dark:hover:text-purple-300 p-1 rounded-lg font-bold cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* STEP 1: CASE FORMAT SELECTOR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" aria-hidden="true" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Choose Target Case Format
            </h2>
          </div>

          {/* GROUP TABS (Standard vs Developer) */}
          <div
            role="tablist"
            aria-label="Case category groups"
            className="grid grid-cols-2 sm:inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
          >
            <button
              id="standardCasesTab"
              role="tab"
              aria-selected={activeGroup === 'standard'}
              aria-controls="caseModesPanel"
              type="button"
              onClick={() => {
                setActiveGroup('standard');
                if (activeModeDetails.group !== 'standard') {
                  setActiveMode('sentence');
                  announce('Switched to Standard Writing Cases: Sentence case.');
                }
              }}
              className={`inline-flex items-center justify-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-xl transition-all cursor-pointer ${activeGroup === 'standard'
                  ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              <Type className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Writing (7)</span>
            </button>

            <button
              id="developerCasesTab"
              role="tab"
              aria-selected={activeGroup === 'developer'}
              aria-controls="caseModesPanel"
              type="button"
              onClick={() => {
                setActiveGroup('developer');
                if (activeModeDetails.group !== 'developer') {
                  setActiveMode('camel');
                  announce('Switched to Developer Formats: camelCase.');
                }
              }}
              className={`inline-flex items-center justify-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-xl transition-all cursor-pointer ${activeGroup === 'developer'
                  ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              <Code2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Developer (8)</span>
            </button>
          </div>
        </div>

        {/* MODE PILLS GRID */}
        <div
          id="caseModesPanel"
          role="tabpanel"
          aria-labelledby={activeGroup === 'standard' ? 'standardCasesTab' : 'developerCasesTab'}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2"
        >
          {filteredModes.map((mode) => {
            const isSelected = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                id={`mode-${mode.id}`}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  setActiveMode(mode.id);
                  announce(`Switched to ${mode.name}.`);
                }}
                className={`flex flex-col items-start min-h-[56px] p-3 rounded-2xl border text-left transition-all cursor-pointer ${isSelected
                    ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 text-purple-900 dark:text-purple-100 shadow-xs ring-2 ring-purple-600/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200'
                  }`}
              >
                <div className="flex items-center justify-between w-full gap-1">
                  <span className="text-xs font-bold truncate">{mode.name}</span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" aria-hidden="true" />
                  )}
                </div>
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate w-full">
                  {mode.example}
                </span>
              </button>
            );
          })}
        </div>

        {/* ACTIVE MODE SUMMARY & PROGRESSIVE-DISCLOSURE OPTIONS BAR */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Active:</span>
              <span className="font-mono px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
                {activeModeDetails.name}
              </span>
              <span className="hidden md:inline text-slate-500 dark:text-slate-400">
                — {activeModeDetails.description}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Preserve Lines toggle always 1-click accessible */}
              <label className="inline-flex items-center gap-2 min-h-[36px] px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer text-slate-700 dark:text-slate-200 select-none font-medium">
                <input
                  id="preserveLinesCheckbox"
                  type="checkbox"
                  checked={preserveLines}
                  onChange={(e) => setPreserveLines(e.target.checked)}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <span>Preserve Lines</span>
              </label>

              {/* Locale & Advanced Options toggle (1-click disclosure, retains state when collapsed) */}
              <button
                type="button"
                aria-expanded={isAdvancedOpen}
                aria-controls="localeOptionsPanel"
                onClick={() => setIsAdvancedOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-semibold transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate max-w-[110px] sm:max-w-none">
                  {currentLanguage.name} ({currentLanguage.bcp47})
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          {/* COLLAPSIBLE LOCALE & SCRIPT OPTIONS PANEL */}
          {isAdvancedOpen && (
            <div
              id="localeOptionsPanel"
              className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Unicode Language Locale (191 ISO Entries)
                </span>
                <span className="text-slate-500 dark:text-slate-400 block">
                  Applies locale-specific rules (Turkish İ/ı, Dutch IJ, German ß→SS, Greek final ς).
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="openLocaleModalButton"
                  type="button"
                  onClick={() => setIsLocaleModalOpen(true)}
                  className="inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-xl bg-white hover:bg-purple-50 dark:bg-slate-900 dark:hover:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer"
                  title="Search ISO 639 language registry (191 supported languages: 184 ISO 639-1 + 7 ISO 639-3)"
                >
                  <Search className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Search 191 Languages</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${currentLanguage.hasBicameralCasing
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      }`}
                  >
                    {currentLanguage.hasBicameralCasing ? 'Bicameral' : 'Unicameral'}
                  </span>
                </button>

                {/* Standard HTML Select synchronized with complete 191 ISO registry */}
                <select
                  id="localeSelect"
                  value={locale}
                  onChange={(e) => {
                    setLocale(e.target.value);
                    const lang = getLanguageByBcp47(e.target.value);
                    if (lang) {
                      showNotification(
                        `Language set to ${lang.name} (${lang.bcp47})${lang.hasBicameralCasing ? '' : ' • Unicameral Script'}`
                      );
                    }
                  }}
                  aria-label="Casing locale"
                  className="min-h-[38px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none max-w-[200px]"
                >
                  <optgroup label="Specialized Casing Rules">
                    {SPECIAL_CASING_LANGUAGES.map((lang) => (
                      <option key={`special-${lang.bcp47}`} value={lang.bcp47}>
                        {lang.name} ({lang.bcp47})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="All ISO 639 Languages">
                    {ISO_LANGUAGES.map((lang) => (
                      <option key={`all-${lang.bcp47}`} value={lang.bcp47}>
                        {lang.name} ({lang.bcp47}) — {lang.hasBicameralCasing ? 'Bicameral' : 'Unicameral'}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* UNICAMERAL SCRIPT ADVISORY BANNER */}
      {!currentLanguage.hasBicameralCasing && (
        <div
          role="note"
          className="p-3 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
            <span>
              <strong>Unicameral Script ({currentLanguage.name}):</strong> Characters in the {currentLanguage.script} script family do not distinguish upper and lower case. Case transformations preserve native characters and apply to embedded Latin or bicameral segments.
            </span>
          </div>
        </div>
      )}

      {/* STEP 2: SIDE-BY-SIDE INPUT & OUTPUT EDITORS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* LEFT COLUMN: SOURCE INPUT */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xs flex flex-col space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" aria-hidden="true" />
              <label htmlFor="inputTextarea" className="text-sm font-bold text-slate-900 dark:text-white">
                Source Text
              </label>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {stats.characters} chars • {stats.words} words
            </span>
          </div>

          <textarea
            id="inputTextarea"
            ref={inputRef}
            rows={10}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste or type your text, headlines, or code identifiers here..."
            className="w-full flex-1 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 font-mono text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-y min-h-[220px]"
          />

          {/* 5 VERIFIED TEXT CLEANUP UTILITIES */}
          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-purple-500" aria-hidden="true" />
                <span>Text Cleanups (5)</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {CLEANUP_ACTIONS.map((item) => (
                <button
                  key={item.action}
                  type="button"
                  disabled={!inputText}
                  onClick={() => handleCleanup(item.action, item.toastLabel)}
                  className="min-h-[34px] px-2.5 py-1 text-xs font-medium rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-45 disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-800 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  title={item.title}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CONVERTED OUTPUT */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xs flex flex-col space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" aria-hidden="true" />
              <label htmlFor="outputTextarea" className="text-sm font-bold text-slate-900 dark:text-white">
                Converted Result
              </label>
            </div>

            <div className="flex items-center gap-1.5">
              {outputText && (
                <button
                  type="button"
                  onClick={handleSwap}
                  className="inline-flex items-center gap-1 min-h-[32px] px-2.5 py-1 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  title="Swap output back to input editor"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Swap</span>
                </button>
              )}
            </div>
          </div>

          <textarea
            id="outputTextarea"
            ref={outputRef}
            rows={10}
            readOnly
            value={outputText}
            placeholder="Converted text appears here automatically as you type..."
            className="w-full flex-1 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-purple-50/30 dark:bg-slate-950 font-mono text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-y min-h-[220px]"
          />

          {/* PRIMARY & SECONDARY OUTPUT ACTIONS */}
          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
            <button
              id="copyButton"
              type="button"
              disabled={!outputText}
              onClick={handleCopy}
              className="flex-1 min-w-[140px] min-h-[44px] py-2.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {copySuccess ? (
                <>
                  <Check className="w-4 h-4" aria-hidden="true" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" aria-hidden="true" />
                  <span>Copy Result</span>
                </>
              )}
            </button>

            <button
              id="selectAllButton"
              type="button"
              disabled={!outputText}
              onClick={handleSelectAll}
              className="min-h-[44px] py-2.5 px-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
              title="Select all converted text"
            >
              Select All
            </button>

            <button
              id="downloadButton"
              type="button"
              disabled={!outputText}
              onClick={handleDownload}
              className="min-h-[44px] py-2.5 px-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              title="Download result as a .txt file"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Download (.txt)</span>
            </button>
          </div>
        </div>
      </div>

      {/* LIVE TEXT STATISTICS BAR (6 VERIFIED COUNTERS) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Live Text Statistics
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 text-center">
          <div
            className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
            title="User-perceived characters (grapheme clusters via Intl.Segmenter with Unicode code point fallback)"
          >
            <span id="statCharacters" className="block text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-mono">
              {stats.characters}
            </span>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Characters
            </span>
          </div>

          <div
            className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
            title="Characters excluding whitespace (grapheme clusters)"
          >
            <span id="statNoSpaces" className="block text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-mono">
              {stats.charactersNoSpaces}
            </span>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              No Spaces
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span id="statWords" className="block text-lg sm:text-xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">
              {stats.words}
            </span>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Words
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span id="statLines" className="block text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-mono">
              {stats.lines}
            </span>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Lines
            </span>
          </div>

          <div
            className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
            title="Estimated sentence count based on terminal punctuation heuristics (. ! ?)"
          >
            <span id="statSentences" className="block text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-mono">
              {stats.sentences}
            </span>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Sentences
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span id="statParagraphs" className="block text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-mono">
              {stats.paragraphs}
            </span>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Paragraphs
            </span>
          </div>
        </div>
      </div>

      {/* FULL SEARCHABLE ISO LANGUAGE / LOCALE REGISTRY MODAL */}
      {isLocaleModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="localeModalTitle"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setIsLocaleModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Globe className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <h3 id="localeModalTitle" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    ISO 639 Language &amp; BCP 47 Locale Registry
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-10">
                  Search across 191 ISO entries (184 ISO 639-1 + 7 ISO 639-3). Casing rules apply to bicameral scripts.
                </p>
              </div>

              <button
                id="closeLocaleModalButton"
                type="button"
                onClick={() => setIsLocaleModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close language selector modal"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Search Input & Filter Pills */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
                <input
                  id="languageSearchInput"
                  type="text"
                  value={languageSearchQuery}
                  onChange={(e) => setLanguageSearchQuery(e.target.value)}
                  placeholder="Search by language name, native name, ISO code, or BCP 47 tag (e.g., Turkish, tr, nl, el)..."
                  aria-label="Search languages"
                  className="w-full pl-10 pr-14 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
                {languageSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setLanguageSearchQuery('')}
                    aria-label="Clear language search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Filter:</span>
                {(['all', 'bicameral', 'unicameral'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    aria-pressed={languageFilter === filter}
                    onClick={() => setLanguageFilter(filter)}
                    className={`min-h-[32px] px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${languageFilter === filter
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-purple-300'
                      }`}
                  >
                    {filter === 'all' && `All (${filteredLanguages.length})`}
                    {filter === 'bicameral' && 'Bicameral Only'}
                    {filter === 'unicameral' && 'Unicameral Only'}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selection List */}
            <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[50vh]">
              {filteredLanguages.length === 0 ? (
                <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <p className="text-sm font-medium">No languages match &ldquo;{languageSearchQuery}&rdquo;</p>
                  <p className="text-xs mt-1">
                    Try searching by English name, native script, ISO code (e.g. &ldquo;el&rdquo;), or BCP 47 tag.
                  </p>
                </div>
              ) : (
                filteredLanguages.map((lang) => {
                  const isSelected = locale === lang.bcp47;
                  return (
                    <button
                      key={lang.bcp47}
                      type="button"
                      onClick={() => handleSelectLanguage(lang)}
                      className={`w-full text-left p-3 rounded-2xl flex items-center justify-between gap-3 transition-colors cursor-pointer ${isSelected
                          ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-100 border border-purple-200 dark:border-purple-800'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                        }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm truncate">{lang.name}</span>
                          {lang.nativeName && lang.nativeName !== lang.name && (
                            <span className="text-xs text-slate-400 dark:text-slate-500 truncate">
                              ({lang.nativeName})
                            </span>
                          )}
                          {lang.casingNotes && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                              title={lang.casingNotes}
                            >
                              Special Casing
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            Tag: <code className="font-bold">{lang.bcp47}</code>
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            ISO: {lang.iso639_1 || lang.iso639_3}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${lang.hasBicameralCasing
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                          >
                            {lang.hasBicameralCasing ? 'Bicameral' : 'Unicameral'}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-5">
              <span>
                Selected: <strong className="text-slate-900 dark:text-white">{currentLanguage.name}</strong> ({currentLanguage.bcp47})
              </span>
              <button
                type="button"
                onClick={() => setIsLocaleModalOpen(false)}
                className="min-h-[34px] px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}