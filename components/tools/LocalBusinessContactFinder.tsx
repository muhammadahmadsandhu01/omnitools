'use client';

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useDeferredValue,
  type ChangeEvent,
  type DragEvent,
} from 'react';
import {
  Search,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  Globe,
  Download,
  Copy,
  Check,
  Trash2,
  Upload,
  Sparkles,
  Filter,
  FileSpreadsheet,
  FileText,
  FileJson,
  Contact,
  Code2,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Navigation,
  Building2,
} from 'lucide-react';

import {
  PROFESSION_REGISTRY,
  CITY_PRESETS,
  COUNTRY_DIAL_META,
  INDUSTRY_SECTOR_LABELS,
  SAMPLE_BUSINESS_DATASETS,
  MAX_SAFE_PASTE_BYTES,
  buildOverpassBusinessQuery,
  fetchLiveOverpassBusinesses,
  resolveCityCoordinatesViaNominatim,
  extractContactsFromUnstructuredInput,
  mergeAndDeduplicateRecords,
  getDefaultContactFilterOptions,
  filterAndAnalyzeContacts,
  formatEmailsOnlyOutput,
  formatPhonesOnlyOutput,
  verifyEmailDomainMx,
  exportBusinessContactsCsv,
  exportBusinessContactsJson,
  exportBusinessContactsVCard,
  exportBusinessContactsGeoJson,
  exportBusinessContactsXlsx,
  type IndustrySectorId,
  type OutputViewMode,
  type EmailCopyFormat,
  type PhoneCopyFormat,
  type SupportedCountryCode,
  type BusinessContactRecord,
  type ContactFilterOptions,
} from '@/lib/localBusinessContactEngine';

type InputEngineTab = 'live_city_search' | 'smart_paste_enricher';

export default function LocalBusinessContactFinder() {
  // 1. Active Input Engine Tab
  const [activeEngineTab, setActiveEngineTab] =
    useState<InputEngineTab>('live_city_search');

  // 2. Engine 1 State (Live City & Profession Overpass Search)
  const [selectedCityPresetId, setSelectedCityPresetId] =
    useState<string>('pk-multan');
  const [customCityName, setCustomCityName] = useState<string>('Multan');
  const [customCountryName, setCustomCountryName] =
    useState<string>('Pakistan');
  const [customLat, setCustomLat] = useState<string>('30.1575');
  const [customLon, setCustomLon] = useState<string>('71.5249');
  const [radiusKm, setRadiusKm] = useState<number>(15);
  const [liveProfessionId, setLiveProfessionId] = useState<string>('all');
  const [mergeLiveResults, setMergeLiveResults] = useState<boolean>(true);
  const [isFetchingLive, setIsFetchingLive] = useState<boolean>(false);
  const [liveStatusMessage, setLiveStatusMessage] = useState<string>('');
  const [liveErrorMessage, setLiveErrorMessage] = useState<string>('');
  const [activeEndpointUsed, setActiveEndpointUsed] = useState<string>('');

  // 3. Engine 2 State (Smart Copy-Paste / File Enricher)
  const [rawPasteText, setRawPasteText] = useState<string>(
    SAMPLE_BUSINESS_DATASETS[0].rawPasteSample
  );
  const [isUsingInitialSample, setIsUsingInitialSample] =
    useState<boolean>(true);
  const deferredPasteText = useDeferredValue(rawPasteText);
  const [liveOverpassRecords, setLiveOverpassRecords] = useState<
    BusinessContactRecord[]
  >([]);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 4. Filter & Output View Mode State
  const [filterOptions, setFilterOptions] = useState<ContactFilterOptions>(
    getDefaultContactFilterOptions
  );
  const [outputViewMode, setOutputViewMode] =
    useState<OutputViewMode>('complete_profiles');
  const [emailCopyFormat, setEmailCopyFormat] =
    useState<EmailCopyFormat>('plain_newline');
  const [phoneCopyFormat, setPhoneCopyFormat] =
    useState<PhoneCopyFormat>('e164_newline');

  // 5. Copy & MX Verification Feedback State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [mxCheckMap, setMxCheckMap] = useState<
    Record<string, { checking: boolean; hasMx?: boolean; records?: string[] }>
  >({});

  // Sync City Preset Selection
  const activeCityPreset = useMemo(
    () =>
      CITY_PRESETS.find((c) => c.id === selectedCityPresetId) ||
      CITY_PRESETS[0],
    [selectedCityPresetId]
  );

  const handleSelectCityPreset = useCallback((presetId: string) => {
    setSelectedCityPresetId(presetId);
    const found = CITY_PRESETS.find((c) => c.id === presetId);
    if (found) {
      setCustomCityName(found.name);
      setCustomCountryName(found.countryName);
      setCustomLat(String(found.latitude));
      setCustomLon(String(found.longitude));
      setRadiusKm(found.defaultRadiusKm);
      setFilterOptions((prev) => ({
        ...prev,
        defaultCountryCode: found.countryCode,
      }));
    }
  }, []);

  // Build Overpass QL preview
  const generatedOverpassQl = useMemo(() => {
    const lat = Number(customLat) || activeCityPreset.latitude;
    const lon = Number(customLon) || activeCityPreset.longitude;
    const profIds =
      liveProfessionId === 'all'
        ? [
          'dentist',
          'doctors_clinic',
          'hospital',
          'pharmacy',
          'plumber',
          'electrician',
          'lawyer_legal',
          'accountant_tax',
          'real_estate',
          'software_it',
        ]
        : [liveProfessionId];
    return buildOverpassBusinessQuery({
      latitude: lat,
      longitude: lon,
      radiusKm,
      professionIds: profIds,
      maxResults: 250,
    });
  }, [customLat, customLon, activeCityPreset, radiusKm, liveProfessionId]);

  // Parse Engine 2 pasted text and merge with Engine 1 live Overpass records
  const extractionResult = useMemo(() => {
    const pastedRecords = extractContactsFromUnstructuredInput(
      deferredPasteText,
      {
        defaultCity: customCityName || activeCityPreset.name,
        defaultCountryName: customCountryName || activeCityPreset.countryName,
        defaultCountryCode: filterOptions.defaultCountryCode,
        fallbackProfessionId:
          liveProfessionId === 'all' ? 'doctors_clinic' : liveProfessionId,
      }
    );

    const combined = mergeAndDeduplicateRecords(
      liveOverpassRecords,
      pastedRecords
    );

    return filterAndAnalyzeContacts(
      combined,
      filterOptions,
      generatedOverpassQl,
      activeEndpointUsed
    );
  }, [
    deferredPasteText,
    liveOverpassRecords,
    customCityName,
    customCountryName,
    activeCityPreset,
    filterOptions,
    liveProfessionId,
    generatedOverpassQl,
    activeEndpointUsed,
  ]);

  // Distinct cities & professions present in the current dataset for dynamic filter dropdowns
  const availableCities = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of extractionResult.records) {
      if (r.city) {
        map.set(r.city, (map.get(r.city) || 0) + 1);
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [extractionResult.records]);

  const availableProfessions = useMemo(() => {
    const map = new Map<string, { label: string; count: number }>();
    for (const r of extractionResult.records) {
      const curr = map.get(r.professionId);
      if (curr) {
        curr.count += 1;
      } else {
        map.set(r.professionId, { label: r.professionLabel, count: 1 });
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1].count - a[1].count);
  }, [extractionResult.records]);

  // Formatted outputs for Emails Only and Phones Only modes
  const emailsOnlyText = useMemo(
    () =>
      formatEmailsOnlyOutput(
        extractionResult.filteredRecords,
        emailCopyFormat,
        filterOptions.corporateEmailOnly
      ),
    [
      extractionResult.filteredRecords,
      emailCopyFormat,
      filterOptions.corporateEmailOnly,
    ]
  );

  const phonesOnlyText = useMemo(
    () =>
      formatPhonesOnlyOutput(
        extractionResult.filteredRecords,
        phoneCopyFormat,
        filterOptions.mobileWhatsappOnly
      ),
    [
      extractionResult.filteredRecords,
      phoneCopyFormat,
      filterOptions.mobileWhatsappOnly,
    ]
  );

  // Handler: 1-Click Worldwide City Geocoding via OpenStreetMap Nominatim
  const handleLocateCustomCity = useCallback(async () => {
    const query = customCityName.trim();
    if (!query) return;
    setIsFetchingLive(true);
    setLiveErrorMessage('');
    setLiveStatusMessage(`Locating "${query}" worldwide via OpenStreetMap Nominatim...`);
    try {
      const geo = await resolveCityCoordinatesViaNominatim(query, '');
      if (!geo) {
        setLiveErrorMessage(`Could not find coordinates for "${query}". Try adding the country name (e.g., "ashiya, Japan" or "Austin, USA").`);
        setLiveStatusMessage('');
        return;
      }
      setCustomCityName(geo.resolvedCityName);
      setCustomCountryName(geo.resolvedCountryName);
      setCustomLat(String(geo.latitude));
      setCustomLon(String(geo.longitude));
      if (geo.resolvedCountryCode) {
        setFilterOptions((prev) => ({
          ...prev,
          defaultCountryCode: geo.resolvedCountryCode!,
        }));
      }
      setLiveStatusMessage(
        `Located ${geo.resolvedCityName}, ${geo.resolvedCountryName} (${geo.latitude}, ${geo.longitude}). Click "Fetch Live Businesses" to query POIs.`
      );
    } finally {
      setIsFetchingLive(false);
    }
  }, [customCityName]);

  // Handler: Trigger Live Overpass Query (with automatic Nominatim geocoding for custom typed cities)
  const handleRunLiveCityQuery = useCallback(async () => {
    setIsFetchingLive(true);
    setLiveErrorMessage('');

    let targetCity = customCityName.trim() || activeCityPreset.name;
    let targetCountry = customCountryName.trim() || activeCityPreset.countryName;
    let targetCountryCode = filterOptions.defaultCountryCode;
    let lat = Number(customLat) || activeCityPreset.latitude;
    let lon = Number(customLon) || activeCityPreset.longitude;

    // If user typed a custom city name different from the active preset without changing coordinates, auto-geocode it
    if (
      targetCity.toLowerCase() !== activeCityPreset.name.toLowerCase() &&
      Math.abs(lat - activeCityPreset.latitude) < 0.0001 &&
      Math.abs(lon - activeCityPreset.longitude) < 0.0001
    ) {
      setLiveStatusMessage(`Resolving GPS coordinates for ${targetCity}...`);
      const geo = await resolveCityCoordinatesViaNominatim(targetCity, '');
      if (geo) {
        lat = geo.latitude;
        lon = geo.longitude;
        targetCity = geo.resolvedCityName;
        targetCountry = geo.resolvedCountryName;
        setCustomLat(String(geo.latitude));
        setCustomLon(String(geo.longitude));
        setCustomCountryName(geo.resolvedCountryName);
        if (geo.resolvedCountryCode) {
          targetCountryCode = geo.resolvedCountryCode;
          setFilterOptions((prev) => ({
            ...prev,
            defaultCountryCode: geo.resolvedCountryCode!,
          }));
        }
      }
    }

    setLiveStatusMessage(
      `Querying OpenStreetMap Overpass API around ${targetCity} (${radiusKm} km radius)...`
    );
    const profIds =
      liveProfessionId === 'all'
        ? [
          'dentist',
          'doctors_clinic',
          'hospital',
          'pharmacy',
          'plumber',
          'electrician',
          'hvac_cooling',
          'lawyer_legal',
          'accountant_tax',
          'real_estate',
          'software_it',
          'restaurant_cafe',
        ]
        : [liveProfessionId];

    try {
      const res = await fetchLiveOverpassBusinesses({
        latitude: lat,
        longitude: lon,
        radiusKm,
        professionIds: profIds,
        cityName: targetCity,
        countryName: targetCountry,
        countryCode: targetCountryCode,
        maxResults: 250,
      });

      // Clear initial Multan demo sample when user runs their first live city query
      if (isUsingInitialSample) {
        setRawPasteText('');
        setIsUsingInitialSample(false);
      }

      setActiveEndpointUsed(res.endpointUsed);
      setLiveOverpassRecords((prev) =>
        mergeLiveResults && !isUsingInitialSample
          ? mergeAndDeduplicateRecords(res.records, prev)
          : res.records
      );

      if (liveProfessionId !== 'all') {
        setFilterOptions((prev) => ({
          ...prev,
          selectedProfessionId: liveProfessionId,
        }));
      }

      setLiveStatusMessage(
        `Fetched ${res.records.length} live mapped businesses in ${customCityName} via ${new URL(res.endpointUsed).hostname}.`
      );
    } catch (err) {
      setLiveErrorMessage(
        `Live Overpass query could not reach the public endpoint (${err instanceof Error ? err.message : 'Network error'}). You can still use the Smart Paste Enricher tab or retry in a few seconds.`
      );
      setLiveStatusMessage('');
    } finally {
      setIsFetchingLive(false);
    }
  }, [
    customCityName,
    customCountryName,
    customLat,
    customLon,
    activeCityPreset,
    radiusKm,
    liveProfessionId,
    filterOptions.defaultCountryCode,
    mergeLiveResults,
    isUsingInitialSample,
  ]);

  // Handler: Load Sample Preset
  const handleLoadSamplePreset = useCallback(
    (sampleId: string) => {
      const sample = SAMPLE_BUSINESS_DATASETS.find((s) => s.id === sampleId);
      if (!sample) return;
      handleSelectCityPreset(sample.cityPresetId);
      setRawPasteText(sample.rawPasteSample);
      setIsUsingInitialSample(false);
      setFilterOptions((prev) => ({
        ...prev,
        selectedSector: 'all',
        selectedProfessionId: 'all',
        selectedCityFilter: 'all',
      }));
      setLiveStatusMessage(`Loaded sample dataset: ${sample.label}`);
      setLiveErrorMessage('');
    },
    [handleSelectCityPreset]
  );

  // Handler: Copy to Clipboard
  const handleCopy = useCallback(async (text: string, key: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 2000);
    } catch {
      // Fallback
    }
  }, []);

  // Handler: File Upload (.txt, .html, .csv, .json, .vcf)
  const processUploadedFile = useCallback((file: File) => {
    if (file.size > MAX_SAFE_PASTE_BYTES) {
      setLiveErrorMessage('File exceeds the 15 MB local browser safety limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = typeof e.target?.result === 'string' ? e.target.result : '';
      setIsUsingInitialSample(false);
      setRawPasteText((prev) => (prev.trim() && !isUsingInitialSample ? `${prev}\n\n${text}` : text));
      setActiveEngineTab('smart_paste_enricher');
      setLiveStatusMessage(
        `Imported ${file.name} (${(file.size / 1024).toFixed(1)} KB) locally.`
      );
    };
    reader.readAsText(file);
  }, [isUsingInitialSample]);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processUploadedFile(file);
      e.target.value = '';
    },
    [processUploadedFile]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDraggingFile(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processUploadedFile(file);
    },
    [processUploadedFile]
  );

  // Handler: Verify Domain MX via Cloudflare DoH
  const handleVerifyDomainMx = useCallback(async (domain: string) => {
    setMxCheckMap((prev) => ({
      ...prev,
      [domain]: { checking: true },
    }));
    const res = await verifyEmailDomainMx(domain);
    setMxCheckMap((prev) => ({
      ...prev,
      [domain]: {
        checking: false,
        hasMx: res.hasMx,
        records: res.mxRecords,
      },
    }));
  }, []);

  // Handler: Trigger File Downloads (.xlsx, .csv, .vcf, .geojson, .json, .txt)
  const triggerDownload = useCallback(
    (content: string | Uint8Array, filename: string, mimeType: string) => {
      const blob =
        content instanceof Uint8Array
          ? new Blob([content as unknown as BlobPart], { type: mimeType })
          : new Blob([content], { type: `${mimeType};charset=utf-8` });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    []
  );

  const citySlug = (customCityName || 'global')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

  return (
    <div className="w-full min-w-0 max-w-full space-y-6">
      {/* ============================================================================
          TOP BAR: SAMPLE DATASETS & LOCAL EXECUTION STATUS BADGE
         ============================================================================ */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              <Sparkles className="h-3.5 w-3.5" />
              Dual-Engine Business &amp; Contact Studio
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              100% Client-Side RAM + Free Overpass API
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Instant Sample Packs:
            </span>
            {SAMPLE_BUSINESS_DATASETS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleLoadSamplePreset(sample.id)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:bg-blue-50/60 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-blue-500"
              >
                {sample.badge}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setRawPasteText('');
                setLiveOverpassRecords([]);
                setIsUsingInitialSample(false);
                setLiveStatusMessage('Cleared all workspace records.');
                setLiveErrorMessage('');
              }}
              className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50/70 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================================
          DUAL-ENGINE INPUT WORKBENCH (TAB 1: LIVE CITY FINDER | TAB 2: SMART PASTE)
         ============================================================================ */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
        {/* Engine Switcher Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveEngineTab('live_city_search')}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold transition ${activeEngineTab === 'live_city_search'
                ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
          >
            <MapPin className="h-4 w-4 shrink-0" />
            <span>Engine 1: Live City &amp; Profession Finder (OpenStreetMap)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveEngineTab('smart_paste_enricher')}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold transition ${activeEngineTab === 'smart_paste_enricher'
                ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
          >
            <FileText className="h-4 w-4 shrink-0" />
            <span>Engine 2: Google Search / Maps &amp; Directory Paste Enricher</span>
          </button>
        </div>

        {/* ENGINE 1 PANEL: LIVE CITY & PROFESSION SEARCH */}
        {activeEngineTab === 'live_city_search' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* 1. City Preset Dropdown (60 Global Cities Across 6 Continents) */}
              <div className="space-y-1.5 min-w-0">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  1. Global City Preset (60 Cities / 6 Continents)
                </label>
                <select
                  aria-label="Select City Preset"
                  value={selectedCityPresetId}
                  onChange={(e) => handleSelectCityPreset(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <optgroup label="Americas (US, Canada, Mexico, Brazil)">
                    {CITY_PRESETS.filter((c) =>
                      ['US', 'CA', 'MX', 'BR'].includes(c.countryCode)
                    ).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.dialCode}) — {c.countryName}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="UK & Europe (London, Paris, Berlin, Madrid, Milan, Zurich...)">
                    {CITY_PRESETS.filter((c) =>
                      ['GB', 'DE', 'FR', 'ES', 'IT', 'NL', 'CH', 'SE', 'PL', 'IE', 'TR'].includes(
                        c.countryCode
                      )
                    ).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.dialCode}) — {c.countryName}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Middle East & Africa (Dubai, Riyadh, Doha, Cairo, Lagos...)">
                    {CITY_PRESETS.filter((c) =>
                      ['AE', 'SA', 'QA', 'OM', 'KW', 'EG', 'ZA', 'NG', 'KE'].includes(
                        c.countryCode
                      )
                    ).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.dialCode}) — {c.countryName}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="South Asia (Pakistan, India, Bangladesh — 18 Cities)">
                    {CITY_PRESETS.filter((c) =>
                      ['PK', 'IN', 'BD'].includes(c.countryCode)
                    ).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.localAreaCode || c.dialCode}) — {c.countryName}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="East Asia, SE Asia & Oceania (Tokyo, Seoul, Singapore, Sydney...)">
                    {CITY_PRESETS.filter((c) =>
                      ['AU', 'SG', 'MY', 'JP', 'KR', 'ID'].includes(c.countryCode)
                    ).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.dialCode}) — {c.countryName}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* 2. Profession / Category Selector */}
              <div className="space-y-1.5 min-w-0">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  2. Target Profession (36 Categories)
                </label>
                <select
                  aria-label="Select Target Profession"
                  value={liveProfessionId}
                  onChange={(e) => setLiveProfessionId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="all">
                    All Top Professions (Clinics, Dentists, Plumbers, IT, Legal)
                  </option>
                  {(
                    Object.keys(INDUSTRY_SECTOR_LABELS) as IndustrySectorId[]
                  ).map((sectorKey) => (
                    <optgroup
                      key={sectorKey}
                      label={INDUSTRY_SECTOR_LABELS[sectorKey]}
                    >
                      {PROFESSION_REGISTRY.filter(
                        (p) => p.sector === sectorKey
                      ).map((prof) => (
                        <option key={prof.id} value={prof.id}>
                          {prof.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* 3. Any City Worldwide Input + Nominatim Locate & Radius */}
              <div className="space-y-1.5 min-w-0">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  3. Any City Worldwide &amp; Radius ({radiusKm} km)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={customCityName}
                    onChange={(e) => setCustomCityName(e.target.value)}
                    placeholder="Type any city on Earth..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleLocateCustomCity}
                    title="Auto-resolve GPS coordinates for any city worldwide"
                    className="shrink-0 rounded-xl border border-blue-200 bg-blue-50 px-2.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                  >
                    Locate
                  </button>
                  <input
                    type="range"
                    min={2}
                    max={40}
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    aria-label="Search Radius in Kilometers"
                    className="w-20 accent-blue-600 shrink-0"
                  />
                </div>
              </div>

              {/* 4. GPS Center Coordinates */}
              <div className="space-y-1.5 min-w-0">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  4. Center Coordinates (Lat / Lon)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    placeholder="Latitude"
                    aria-label="Center Latitude"
                    className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <input
                    type="text"
                    value={customLon}
                    onChange={(e) => setCustomLon(e.target.value)}
                    placeholder="Longitude"
                    aria-label="Center Longitude"
                    className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Quick Profession Pills for 1-Tap Selection */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
                Quick Profession Pick:
              </span>
              {[
                { id: 'all', label: 'All Professions' },
                { id: 'dentist', label: 'Dental Clinics' },
                { id: 'doctors_clinic', label: 'Doctors & Clinics' },
                { id: 'hospital', label: 'Hospitals' },
                { id: 'pharmacy', label: 'Pharmacies' },
                { id: 'plumber', label: 'Plumbers' },
                { id: 'electrician', label: 'Electricians & Solar' },
                { id: 'lawyer_legal', label: 'Lawyers' },
                { id: 'software_it', label: 'Software & IT' },
                { id: 'real_estate', label: 'Real Estate' },
                { id: 'restaurant_cafe', label: 'Restaurants' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setLiveProfessionId(pill.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${liveProfessionId === pill.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Live Action Row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mergeLiveResults}
                  onChange={(e) => setMergeLiveResults(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  Merge &amp; deduplicate live Overpass results with existing
                  pasted directory records
                </span>
              </label>

              <button
                type="button"
                disabled={isFetchingLive}
                onClick={handleRunLiveCityQuery}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
              >
                {isFetchingLive ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Querying Live OpenStreetMap Database...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>
                      Fetch Live Businesses in {customCityName || 'Selected City'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ENGINE 2 PANEL: GOOGLE SEARCH/MAPS & DIRECTORY SMART PASTE ENRICHER */}
        {activeEngineTab === 'smart_paste_enricher' && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingFile(true);
            }}
            onDragLeave={() => setIsDraggingFile(false)}
            onDrop={handleDrop}
            className={`space-y-4 rounded-2xl border-2 border-dashed p-4 transition ${isDraggingFile
                ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30'
                : 'border-slate-200 dark:border-slate-800'
              }`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Paste Google Search / Google Maps Listings, Web Directories, Raw HTML, CSV, or vCard (.vcf)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Search any profession on Google or Maps (e.g., <em>&quot;best plumber in Multan&quot;</em> or <em>&quot;dental clinics in Lahore&quot;</em>), press <code>Ctrl+A</code> then <code>Ctrl+C</code>, and paste below to extract &amp; merge every business name, email, phone, and location.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.html,.htm,.csv,.tsv,.json,.vcf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload File (.HTML / .CSV / .VCF)
                </button>
              </div>
            </div>

            <textarea
              value={rawPasteText}
              onChange={(e) => {
                setIsUsingInitialSample(false);
                setRawPasteText(e.target.value);
              }}
              rows={7}
              placeholder="Paste copied Google Maps search results, directory listings (Marham, Oladoc, YellowPages), website HTML source, CSV rows, or vCard (.vcf) contacts here..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 font-mono text-xs leading-relaxed text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200"
            />
          </div>
        )}

        {/* Status / Error Banner */}
        {(liveStatusMessage || liveErrorMessage) && (
          <div
            className={`flex items-start gap-2.5 rounded-2xl p-3.5 text-xs font-medium ${liveErrorMessage
                ? 'border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200'
                : 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200'
              }`}
          >
            {liveErrorMessage ? (
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            )}
            <span>{liveErrorMessage || liveStatusMessage}</span>
          </div>
        )}
      </div>

      {/* ============================================================================
          LIVE KPI TELEMETRY STRIP
         ============================================================================ */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Matching Businesses
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {extractionResult.metrics.filteredRecords}
            </span>
            <span className="text-xs text-slate-500">
              / {extractionResult.metrics.totalRecords} total
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Official Emails
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
              {extractionResult.metrics.filteredUniqueEmails}
            </span>
            <span className="text-xs text-slate-500">
              ({extractionResult.metrics.corporateEmailsCount} corp)
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Phone Numbers (E.164)
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {extractionResult.metrics.filteredUniquePhones}
            </span>
            <span className="text-xs text-slate-500">
              ({extractionResult.metrics.whatsappMobileCount} mobile)
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            De-Obfuscated Emails
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
              {extractionResult.metrics.obfuscatedRecoveredCount}
            </span>
            <span className="text-xs text-slate-500">[at] / hex decoded</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Both Email + Phone
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {extractionResult.metrics.recordsWithBothEmailAndPhone}
            </span>
            <span className="text-xs text-slate-500">complete leads</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Parse Speed
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {extractionResult.metrics.executionTimeMs}
            </span>
            <span className="text-xs text-slate-500">ms in RAM</span>
          </div>
        </div>
      </div>

      {/* ============================================================================
          SMART FILTERING & 1-CLICK OUTPUT VIEW SWITCHER BAR
         ============================================================================ */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
        {/* 1-Click Output View Switcher (Complete Details vs. Emails Only vs. Phones Only) */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setOutputViewMode('complete_profiles')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition ${outputViewMode === 'complete_profiles'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
            >
              <Building2 className="h-4 w-4" />
              <span>
                Complete Business Details ({extractionResult.metrics.filteredRecords})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setOutputViewMode('emails_only')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition ${outputViewMode === 'emails_only'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300'
                }`}
            >
              <Mail className="h-4 w-4" />
              <span>
                Emails Only ({extractionResult.metrics.filteredUniqueEmails})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setOutputViewMode('phones_only')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition ${outputViewMode === 'phones_only'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300'
                }`}
            >
              <Phone className="h-4 w-4" />
              <span>
                Phone Numbers &amp; WhatsApp Only (
                {extractionResult.metrics.filteredUniquePhones})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setOutputViewMode('overpass_ql')}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${outputViewMode === 'overpass_ql'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
            >
              <Code2 className="h-4 w-4" />
              <span>Overpass QL Query</span>
            </button>
          </div>

          {/* 5-Format Export Buttons (.XLSX, .CSV, .VCF, .GeoJSON, .JSON) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const bytes = exportBusinessContactsXlsx(extractionResult);
                triggerDownload(
                  bytes,
                  `kivarotools-business-contacts-${citySlug}.xlsx`,
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                );
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Excel (.XLSX)
            </button>

            <button
              type="button"
              onClick={() => {
                const csv = exportBusinessContactsCsv(
                  extractionResult.filteredRecords
                );
                triggerDownload(
                  csv,
                  `kivarotools-business-contacts-${citySlug}.csv`,
                  'text/csv'
                );
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </button>

            <button
              type="button"
              onClick={() => {
                const vcf = exportBusinessContactsVCard(
                  extractionResult.filteredRecords
                );
                triggerDownload(
                  vcf,
                  `kivarotools-contacts-${citySlug}.vcf`,
                  'text/vcard'
                );
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Contact className="h-3.5 w-3.5" />
              Mobile vCard (.VCF)
            </button>

            <button
              type="button"
              onClick={() => {
                const geojson = exportBusinessContactsGeoJson(
                  extractionResult.filteredRecords
                );
                triggerDownload(
                  geojson,
                  `kivarotools-map-${citySlug}.geojson`,
                  'application/geo+json'
                );
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Navigation className="h-3.5 w-3.5" />
              GeoJSON
            </button>

            <button
              type="button"
              onClick={() => {
                const jsonStr = exportBusinessContactsJson(extractionResult);
                triggerDownload(
                  jsonStr,
                  `kivarotools-business-contacts-${citySlug}.json`,
                  'application/json'
                );
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <FileJson className="h-3.5 w-3.5" />
              JSON
            </button>
          </div>
        </div>

        {/* Multi-Dimensional Filter Controls (Search, Sector, Profession, City, Dial Format) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Keyword Search */}
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={filterOptions.searchQuery}
              onChange={(e) =>
                setFilterOptions((prev) => ({
                  ...prev,
                  searchQuery: e.target.value,
                }))
              }
              placeholder="Search name, email, phone, street..."
              className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Filter by Macro Industry Sector */}
          <div className="min-w-0">
            <select
              aria-label="Filter by Industry Sector"
              value={filterOptions.selectedSector}
              onChange={(e) =>
                setFilterOptions((prev) => ({
                  ...prev,
                  selectedSector: e.target.value as IndustrySectorId | 'all',
                  selectedProfessionId: 'all',
                }))
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="all">All 6 Industry Sectors</option>
              {(
                Object.keys(INDUSTRY_SECTOR_LABELS) as IndustrySectorId[]
              ).map((secKey) => (
                <option key={secKey} value={secKey}>
                  {INDUSTRY_SECTOR_LABELS[secKey]} (
                  {extractionResult.metrics.sectorBreakdown[secKey] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Profession */}
          <div className="min-w-0">
            <select
              aria-label="Filter by Profession"
              value={filterOptions.selectedProfessionId}
              onChange={(e) =>
                setFilterOptions((prev) => ({
                  ...prev,
                  selectedProfessionId: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="all">
                All Professions in Dataset ({extractionResult.records.length})
              </option>
              {availableProfessions.map(([profId, info]) => (
                <option key={profId} value={profId}>
                  {info.label} ({info.count})
                </option>
              ))}
            </select>
          </div>

          {/* Filter by City */}
          <div className="min-w-0">
            <select
              aria-label="Filter by City"
              value={filterOptions.selectedCityFilter}
              onChange={(e) =>
                setFilterOptions((prev) => ({
                  ...prev,
                  selectedCityFilter: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="all">All Cities ({availableCities.length})</option>
              {availableCities.map(([city, count]) => (
                <option key={city} value={city}>
                  {city} ({count})
                </option>
              ))}
            </select>
          </div>

          {/* Default Country Dial Code Parser */}
          <div className="min-w-0">
            <select
              aria-label="Default Regional Phone Format"
              value={filterOptions.defaultCountryCode}
              onChange={(e) =>
                setFilterOptions((prev) => ({
                  ...prev,
                  defaultCountryCode: e.target.value as SupportedCountryCode,
                }))
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {(
                Object.entries(COUNTRY_DIAL_META) as Array<
                  [SupportedCountryCode, (typeof COUNTRY_DIAL_META)['US']]
                >
              ).map(([code, meta]) => (
                <option key={code} value={code}>
                  Dial Plan: {meta.name} (+{meta.dial})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 1-Click Boolean Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Filter className="h-3.5 w-3.5" />
            Quick Filters:
          </span>

          {[
            {
              key: 'requireEmail' as const,
              label: 'Has Email Only',
            },
            {
              key: 'requirePhone' as const,
              label: 'Has Phone Number Only',
            },
            {
              key: 'corporateEmailOnly' as const,
              label: 'Corporate Domain Emails Only',
            },
            {
              key: 'mobileWhatsappOnly' as const,
              label: 'Mobile / WhatsApp Numbers Only',
            },
            {
              key: 'requireWebsite' as const,
              label: 'Has Official Website',
            },
          ].map((chip) => {
            const active = filterOptions[chip.key];
            return (
              <button
                key={chip.key}
                type="button"
                onClick={() =>
                  setFilterOptions((prev) => ({
                    ...prev,
                    [chip.key]: !prev[chip.key],
                  }))
                }
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${active
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
              >
                {chip.label}
              </button>
            );
          })}

          {(filterOptions.requireEmail ||
            filterOptions.requirePhone ||
            filterOptions.corporateEmailOnly ||
            filterOptions.mobileWhatsappOnly ||
            filterOptions.requireWebsite ||
            filterOptions.selectedSector !== 'all' ||
            filterOptions.selectedProfessionId !== 'all' ||
            filterOptions.selectedCityFilter !== 'all' ||
            filterOptions.searchQuery) && (
              <button
                type="button"
                onClick={() => setFilterOptions(getDefaultContactFilterOptions())}
                className="text-xs font-bold text-blue-600 underline hover:text-blue-700 dark:text-blue-400"
              >
                Reset Filters
              </button>
            )}
        </div>

        {/* ============================================================================
            VIEW MODE 1: COMPLETE BUSINESS PROFILES (DESKTOP TABLE + MOBILE CARDS)
           ============================================================================ */}
        {outputViewMode === 'complete_profiles' && (
          <div className="space-y-4">
            {extractionResult.filteredRecords.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-8 text-center dark:border-slate-800 dark:bg-slate-800/30">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No business profiles match your active filters.
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Try clicking &quot;Reset Filters&quot;, loading one of the sample packs above, or running a live city query in Engine 1.
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Responsive Cards (< 768px) */}
                <div className="grid grid-cols-1 gap-3 md:hidden">
                  {extractionResult.filteredRecords.map((rec) => (
                    <div
                      key={`mob-${rec.id}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-800/30"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-slate-900 dark:text-white break-words">
                            {rec.businessName}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                              <Briefcase className="h-3 w-3" />
                              {rec.professionLabel}
                            </span>
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              {rec.city}
                            </span>
                          </div>
                        </div>
                        <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {rec.completenessScore}%
                        </span>
                      </div>

                      {rec.website && (
                        <a
                          href={
                            rec.website.startsWith('http')
                              ? rec.website
                              : `https://${rec.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400 break-all"
                        >
                          <Globe className="h-3 w-3 shrink-0" />
                          <span>{rec.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
                        </a>
                      )}

                      {rec.emails.length > 0 && (
                        <div className="space-y-1.5">
                          {rec.emails.map((em) => {
                            const mxState = mxCheckMap[em.domain];
                            return (
                              <div
                                key={em.email}
                                className="space-y-1 rounded-xl border border-slate-200/80 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-mono font-semibold text-slate-900 dark:text-white break-all">
                                    {em.email}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopy(em.email, `mob-em-${rec.id}-${em.email}`)
                                    }
                                    className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  >
                                    {copiedKey === `mob-em-${rec.id}-${em.email}` ? (
                                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                                    ) : (
                                      <Copy className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                                    {em.isCorporateDomain ? 'Corporate' : 'Webmail'}
                                  </span>
                                  {em.wasObfuscated && (
                                    <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                                      De-Obfuscated
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleVerifyDomainMx(em.domain)}
                                    className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                  >
                                    {mxState?.checking
                                      ? 'Checking MX...'
                                      : mxState?.hasMx === true
                                        ? 'MX Verified ✓'
                                        : mxState?.hasMx === false
                                          ? 'No MX Record'
                                          : 'Verify MX'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {rec.phones.length > 0 && (
                        <div className="space-y-1.5">
                          {rec.phones.map((ph) => (
                            <div
                              key={ph.e164}
                              className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                            >
                              <span className="font-mono font-bold text-slate-900 dark:text-white">
                                {ph.e164} ({ph.localDisplay})
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopy(ph.e164, `mob-ph-${rec.id}-${ph.e164}`)
                                  }
                                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  {copiedKey === `mob-ph-${rec.id}-${ph.e164}` ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                                <a
                                  href={ph.whatsappUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white"
                                >
                                  <MessageSquare className="h-2.5 w-2.5" />
                                  WhatsApp
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500">
                        <span className="break-words">
                          {rec.streetAddress}, {rec.city}
                        </span>
                        <a
                          href={rec.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400"
                        >
                          <MapPin className="h-3 w-3 text-rose-500" />
                          Maps
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Full 5-Column Table (>= 768px) */}
                <div className="hidden md:block w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="min-w-[920px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                    <thead className="bg-slate-50 text-slate-900 dark:bg-slate-800/90 dark:text-white border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="py-3 px-3.5 font-bold">
                          Business Name &amp; Profession
                        </th>
                        <th className="py-3 px-3.5 font-bold">
                          Official Emails &amp; MX Check
                        </th>
                        <th className="py-3 px-3.5 font-bold">
                          Phone Numbers &amp; WhatsApp
                        </th>
                        <th className="py-3 px-3.5 font-bold">
                          Location, Address &amp; Maps
                        </th>
                        <th className="py-3 px-3.5 font-bold text-right">
                          Score &amp; Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
                      {extractionResult.filteredRecords.map((rec) => (
                        <tr
                          key={rec.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* Column 1: Business Name, Profession, Website */}
                          <td className="py-3.5 px-3.5 align-top max-w-[250px]">
                            <div className="font-bold text-sm text-slate-900 dark:text-white break-words">
                              {rec.businessName}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                                <Briefcase className="h-3 w-3" />
                                {rec.professionLabel}
                              </span>
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                {rec.city}
                              </span>
                            </div>
                            {rec.website && (
                              <a
                                href={
                                  rec.website.startsWith('http')
                                    ? rec.website
                                    : `https://${rec.website}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:underline dark:text-blue-400 break-all"
                              >
                                <Globe className="h-3 w-3 shrink-0" />
                                <span>
                                  {rec.website.replace(/^https?:\/\/(www\.)?/, '')}
                                </span>
                              </a>
                            )}
                          </td>

                          {/* Column 2: Emails + Live DNS MX Check */}
                          <td className="py-3.5 px-3.5 align-top">
                            {rec.emails.length === 0 ? (
                              <span className="text-slate-400 italic">
                                No email listed
                              </span>
                            ) : (
                              <div className="space-y-2">
                                {rec.emails.map((em) => {
                                  const mxState = mxCheckMap[em.domain];
                                  return (
                                    <div
                                      key={em.email}
                                      className="space-y-1 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2 dark:border-slate-800 dark:bg-slate-800/40"
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white break-all">
                                          {em.email}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleCopy(
                                              em.email,
                                              `em-${rec.id}-${em.email}`
                                            )
                                          }
                                          title="Copy Email"
                                          className="rounded-lg p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-700"
                                        >
                                          {copiedKey ===
                                            `em-${rec.id}-${em.email}` ? (
                                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                                          ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                          )}
                                        </button>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <span
                                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${em.isCorporateDomain
                                              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                                              : 'bg-slate-200/70 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                            }`}
                                        >
                                          {em.isCorporateDomain
                                            ? 'Corporate Domain'
                                            : 'Webmail'}
                                        </span>
                                        {em.wasObfuscated && (
                                          <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                                            De-Obfuscated
                                          </span>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleVerifyDomainMx(em.domain)
                                          }
                                          className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300"
                                        >
                                          {mxState?.checking
                                            ? 'Checking MX...'
                                            : mxState?.hasMx === true
                                              ? 'MX Verified ✓'
                                              : mxState?.hasMx === false
                                                ? 'No MX Record'
                                                : 'Verify MX'}
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </td>

                          {/* Column 3: Phone Numbers + 1-Click WhatsApp */}
                          <td className="py-3.5 px-3.5 align-top">
                            {rec.phones.length === 0 ? (
                              <span className="text-slate-400 italic">
                                No phone listed
                              </span>
                            ) : (
                              <div className="space-y-2">
                                {rec.phones.map((ph) => (
                                  <div
                                    key={ph.e164}
                                    className="flex flex-col gap-1 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2 dark:border-slate-800 dark:bg-slate-800/40"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                                        {ph.e164}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleCopy(
                                              ph.e164,
                                              `ph-${rec.id}-${ph.e164}`
                                            )
                                          }
                                          title="Copy Phone"
                                          className="rounded-lg p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                                        >
                                          {copiedKey ===
                                            `ph-${rec.id}-${ph.e164}` ? (
                                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                                          ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                          )}
                                        </button>
                                        <a
                                          href={ph.whatsappUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-emerald-700"
                                        >
                                          <MessageSquare className="h-2.5 w-2.5" />
                                          WhatsApp
                                        </a>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                      <span>Local: {ph.localDisplay}</span>
                                      <span>•</span>
                                      <span className="uppercase font-semibold">
                                        {ph.lineType}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>

                          {/* Column 4: Physical Location, Distance & Maps Link */}
                          <td className="py-3.5 px-3.5 align-top max-w-[240px]">
                            <div className="text-xs text-slate-700 dark:text-slate-300 break-words">
                              {rec.streetAddress}
                            </div>
                            <div className="mt-1 text-[11px] font-medium text-slate-500">
                              {rec.city}, {rec.country}
                              {rec.distanceKm !== null && (
                                <span className="ml-1.5 font-mono text-blue-600 dark:text-blue-400">
                                  ({rec.distanceKm} km from center)
                                </span>
                              )}
                            </div>
                            {rec.openingHours && (
                              <div className="mt-1 text-[11px] text-slate-500">
                                Hours: {rec.openingHours}
                              </div>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <a
                                href={rec.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              >
                                <MapPin className="h-3 w-3 text-rose-500" />
                                Google Maps
                                <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            </div>
                          </td>

                          {/* Column 5: Completeness Score & Copy Full Card */}
                          <td className="py-3.5 px-3.5 align-top text-right">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${rec.completenessScore >= 75
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : rec.completenessScore >= 50
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                }`}
                            >
                              {rec.completenessScore}% Complete
                            </span>
                            <div className="mt-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopy(
                                    `${rec.businessName} (${rec.professionLabel} - ${rec.city})\nEmails: ${rec.emails.map((e) => e.email).join(', ') || 'N/A'}\nPhones: ${rec.phones.map((p) => p.e164).join(', ') || 'N/A'}\nAddress: ${rec.streetAddress}, ${rec.city}\nWebsite: ${rec.website || 'N/A'}`,
                                    `card-${rec.id}`
                                  )
                                }
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                              >
                                {copiedKey === `card-${rec.id}` ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-600" />
                                    <span>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    <span>Copy Profile</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ============================================================================
            VIEW MODE 2: EMAILS ONLY ISOLATION VIEW (SCOPED BY PROFESSION & CITY)
           ============================================================================ */}
        {outputViewMode === 'emails_only' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Email Output Format:
                </span>
                {(
                  [
                    { id: 'plain_newline', label: 'Plain List (1 per line)' },
                    { id: 'comma_separated', label: 'Comma-Separated' },
                    {
                      id: 'named_rfc5322',
                      label: 'Named ("Business <email>")',
                    },
                    { id: 'domain_grouped', label: 'Grouped by Domain' },
                  ] as const
                ).map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setEmailCopyFormat(fmt.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${emailCopyFormat === fmt.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(emailsOnlyText, 'copy-all-emails')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
                >
                  {copiedKey === 'copy-all-emails' ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Copied All Emails!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>
                        Copy {extractionResult.metrics.filteredUniqueEmails}{' '}
                        Emails
                      </span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    triggerDownload(
                      emailsOnlyText,
                      `kivarotools-emails-only-${citySlug}.txt`,
                      'text/plain'
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download .TXT
                </button>
              </div>
            </div>

            <textarea
              readOnly
              value={
                emailsOnlyText ||
                'No emails match the current profession/city filter.'
              }
              rows={10}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            />
          </div>
        )}

        {/* ============================================================================
            VIEW MODE 3: PHONE NUMBERS & WHATSAPP ONLY ISOLATION VIEW
           ============================================================================ */}
        {outputViewMode === 'phones_only' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Phone Format:
                </span>
                {(
                  [
                    { id: 'e164_newline', label: 'International E.164 (+92...)' },
                    {
                      id: 'local_newline',
                      label: 'Local Dial (061-... / 0300-...)',
                    },
                    {
                      id: 'whatsapp_links',
                      label: 'WhatsApp Click-to-Chat Links',
                    },
                    {
                      id: 'named_directory',
                      label: 'Business Name + Profession + Phone',
                    },
                  ] as const
                ).map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setPhoneCopyFormat(fmt.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${phoneCopyFormat === fmt.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(phonesOnlyText, 'copy-all-phones')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                >
                  {copiedKey === 'copy-all-phones' ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Copied All Phones!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>
                        Copy {extractionResult.metrics.filteredUniquePhones}{' '}
                        Phones
                      </span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    triggerDownload(
                      phonesOnlyText,
                      `kivarotools-phones-only-${citySlug}.txt`,
                      'text/plain'
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download .TXT
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const vcf = exportBusinessContactsVCard(
                      extractionResult.filteredRecords
                    );
                    triggerDownload(
                      vcf,
                      `kivarotools-contacts-${citySlug}.vcf`,
                      'text/vcard'
                    );
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <Contact className="h-3.5 w-3.5" />
                  Download .VCF
                </button>
              </div>
            </div>

            <textarea
              readOnly
              value={
                phonesOnlyText ||
                'No phone numbers match the current profession/city filter.'
              }
              rows={10}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            />
          </div>
        )}

        {/* ============================================================================
            VIEW MODE 4: OVERPASS QL QUERY INSPECTOR
           ============================================================================ */}
        {outputViewMode === 'overpass_ql' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Generated Overpass QL query for{' '}
                <strong>{customCityName}</strong> ({radiusKm} km radius around{' '}
                <code>
                  {customLat}, {customLon}
                </code>
                ):
              </p>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    extractionResult.generatedOverpassQl,
                    'copy-overpass-ql'
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-700"
              >
                {copiedKey === 'copy-overpass-ql' ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Copied Query</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Overpass QL</span>
                  </>
                )}
              </button>
            </div>
            <pre className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-emerald-300 dark:border-slate-800">
              {extractionResult.generatedOverpassQl}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}