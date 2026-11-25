'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
    KeyRound,
    Sparkles,
    ShieldCheck,
    ShieldAlert,
    CheckCircle2,
    Download,
    Upload,
    Copy,
    Check,
    FileSpreadsheet,
    FileCode,
    FileText,
    Wrench,
    ArrowRightLeft,
    Terminal,
    Code2,
    Sliders,
    Trash2,
    ChevronDown,
    X,
    RefreshCw,
} from 'lucide-react';

import {
    DEFAULT_REFERENCE_UNIX_SEC,
    analyzeTokenAndCompileReport,
    autoFixTokenVulnerabilities,
    signJwtHs256,
    createPasetoToken,
    createJwe5PartToken,
    translateTokenAcrossProtocols,
    uint8ArrayToBase64Url,
    utf8ToBytes,
    computeSha256Bytes,
    generateVerificationCodeSnippet,
    exportSecurityAuditCsv,
    exportSecurityAuditXlsx,
    getDefaultDebuggerInputs,
    getPresetDebuggerInputs,
    type PresetScenarioId,
    type CodeGeneratorLanguage,
    type DebuggerInputs,
    type TokenVisualSegment,
} from '@/lib/jwtPasetoSamlEngine';

type PayloadViewMode = 'json' | 'claims' | 'edit';
type InspectorTab = 'audit' | 'forensics' | 'keys' | 'code';

const EXAMPLE_PRESETS: {
    id: PresetScenarioId;
    label: string;
    description: string;
}[] = [
        {
            id: 'oidc_jwt_hs256_verified',
            label: 'OIDC JWT',
            description: 'HS256 verified Bearer token with RFC 7638 thumbprint (100/100 A+).',
        },
        {
            id: 'vulnerable_jwt_audit_demo',
            label: 'Vulnerable Audit',
            description: 'Cracked weak secret, jku SSRF, inline JWK, kid traversal & expired TTL.',
        },
        {
            id: 'sd_jwt_selective_disclosure_rfc9901',
            label: 'SD-JWT (~)',
            description: 'IETF RFC 9901 selective disclosure with SHA-256 _sd digest verification.',
        },
        {
            id: 'paseto_v4_public_footer_pae',
            label: 'PASETO v4',
            description: 'PASETO v4.public with LE64 PAE, JSON footer & implicit assertion.',
        },
        {
            id: 'jwe_5part_encrypted_a256gcm',
            label: 'JWE 5-Part',
            description: 'Encrypted 5-part JWE (dir / A256GCM) with 96-bit IV & 128-bit GCM tag.',
        },
        {
            id: 'saml2_response_xsw_audit',
            label: 'SAML 2.0',
            description: 'Base64 SAML 2.0 XML response with XSW & NameID comment audit.',
        },
    ];

const CODE_LANGUAGES: { id: CodeGeneratorLanguage; label: string }[] = [
    { id: 'nodejs_jose', label: 'Node.js (jose)' },
    { id: 'python_pyjwt', label: 'Python (PyJWT)' },
    { id: 'go_jwt_v5', label: 'Go (jwt/v5)' },
    { id: 'rust_jsonwebtoken', label: 'Rust' },
    { id: 'java_nimbus', label: 'Java (Nimbus)' },
    { id: 'csharp_dotnet', label: 'C# (.NET)' },
    { id: 'php_firebase', label: 'PHP' },
    { id: 'cloudflare_workers', label: 'CF Workers' },
];

function segmentTextClass(role: TokenVisualSegment['role']): string {
    switch (role) {
        case 'HEADER':
            return 'text-rose-400';
        case 'PAYLOAD':
            return 'text-violet-400';
        case 'SIGNATURE':
            return 'text-sky-400';
        case 'JWE_KEY_OR_IV':
            return 'text-amber-400';
        case 'DISCLOSURE_OR_FOOTER':
        default:
            return 'text-emerald-400';
    }
}

export default function JwtPasetoSamlDebugger() {
    const [activePresetId, setActivePresetId] = useState<PresetScenarioId | null>('oidc_jwt_hs256_verified');
    const [inputs, setInputs] = useState<DebuggerInputs>(
        () => getPresetDebuggerInputs('oidc_jwt_hs256_verified').inputs
    );
    const [payloadViewMode, setPayloadViewMode] = useState<PayloadViewMode>('json');
    const [editablePayloadText, setEditablePayloadText] = useState<string>('');
    const [showOptionsDrawer, setShowOptionsDrawer] = useState<boolean>(false);
    const [showInspector, setShowInspector] = useState<boolean>(false);
    const [activeInspectorTab, setActiveInspectorTab] = useState<InspectorTab>('audit');
    const [selectedCodeLang, setSelectedCodeLang] = useState<CodeGeneratorLanguage>('nodejs_jose');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [statusNotice, setStatusNotice] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const report = useMemo(() => analyzeTokenAndCompileReport(inputs), [inputs]);
    const isTokenLoaded = report.detectedProtocol !== 'NONE';
    const isVerified =
        report.verificationStatus === 'SIGNATURE_VERIFIED' ||
        report.verificationStatus === 'DECRYPTED_VERIFIED';
    const isErrorStatus =
        report.verificationStatus === 'WEAK_SECRET_CRACKED' ||
        report.verificationStatus === 'INVALID_SIGNATURE' ||
        report.verificationStatus === 'INSECURE_ALG_NONE' ||
        report.verificationStatus === 'MALFORMED_TOKEN';

    const activeCodeSnippet = useMemo(
        () => generateVerificationCodeSnippet(report, selectedCodeLang),
        [report, selectedCodeLang]
    );

    const copyText = (text: string, id: string) => {
        if (!text) return;
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            void navigator.clipboard.writeText(text);
        }
        setCopiedId(id);
        setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1800);
    };

    const triggerDownload = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    const handleSelectPreset = (presetId: PresetScenarioId) => {
        const presetData = getPresetDebuggerInputs(presetId);
        setActivePresetId(presetId);
        setInputs(presetData.inputs);
        setEditablePayloadText('');
        setPayloadViewMode('json');
        if (presetId === 'vulnerable_jwt_audit_demo' || presetId === 'saml2_response_xsw_audit') {
            setActiveInspectorTab('audit');
            setShowInspector(true);
        }
        setStatusNotice(null);
    };

    const handleClear = () => {
        setActivePresetId(null);
        setInputs(getDefaultDebuggerInputs());
        setEditablePayloadText('');
        setPayloadViewMode('json');
        setStatusNotice(null);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            setActivePresetId(null);
            setInputs((prev) => ({
                ...prev,
                rawTokenInput: text.trim(),
                forcedProtocolMode: 'AUTO',
                simulatedCurrentUnixTimestamp: null,
            }));
            setEditablePayloadText('');
            setStatusNotice(`Imported "${file.name}" (${(file.size / 1024).toFixed(1)} KB) locally.`);
        } catch {
            setStatusNotice('Unable to read the selected file.');
        }
        e.target.value = '';
    };

    const handleAutoFix = () => {
        if (!isTokenLoaded) return;
        const { nextInputs, fixSummary } = autoFixTokenVulnerabilities(inputs);
        setInputs(nextInputs);
        setEditablePayloadText('');
        setStatusNotice(fixSummary);
    };

    const handleReSignEditedPayload = () => {
        const textToParse = (editablePayloadText || report.payloadJsonFormatted).trim();
        try {
            const parsedPayload = JSON.parse(textToParse) as Record<string, unknown>;
            const secret = inputs.secretOrKeyInput || 'kivaro-256-bit-production-hmac-key-2026!';

            if (report.detectedProtocol === 'PASETO') {
                const nextTok = createPasetoToken({
                    version: report.pasetoForensics?.version || 'v4',
                    purpose: report.pasetoForensics?.purpose || 'public',
                    payloadJson: JSON.stringify(parsedPayload),
                    footerText: report.pasetoForensics?.footerRawText || inputs.pasetoFooterInput || '',
                    implicitAssertion: inputs.pasetoImplicitAssertion || '',
                    secretKeyString: secret,
                });
                setInputs((prev) => ({ ...prev, rawTokenInput: nextTok }));
                setEditablePayloadText('');
                setStatusNotice('Re-signed PASETO token with updated claims.');
            } else if (report.detectedProtocol === 'JWE_5PART') {
                const nextTok = createJwe5PartToken(JSON.stringify(parsedPayload), secret);
                setInputs((prev) => ({ ...prev, rawTokenInput: nextTok }));
                setEditablePayloadText('');
                setStatusNotice('Re-encrypted 5-Part JWE (dir / A256GCM) with updated claims.');
            } else if (report.detectedProtocol === 'SD_JWT') {
                const baseClaims = { ...parsedPayload };
                const discB64List: string[] = [];
                const digestList: string[] = [];
                for (const disc of report.sdJwtDisclosures) {
                    const updatedVal =
                        disc.claimName in baseClaims ? baseClaims[disc.claimName] : disc.claimValueDisplay;
                    delete baseClaims[disc.claimName];
                    const tupleStr = JSON.stringify([
                        disc.salt || `salt_${disc.index}_kivaro`,
                        disc.claimName,
                        updatedVal,
                    ]);
                    const dB64 = uint8ArrayToBase64Url(utf8ToBytes(tupleStr));
                    const digB64 = uint8ArrayToBase64Url(computeSha256Bytes(utf8ToBytes(dB64)));
                    discB64List.push(dB64);
                    digestList.push(digB64);
                }
                baseClaims._sd_alg = 'sha-256';
                baseClaims._sd = digestList;
                const sdHdr =
                    Object.keys(report.headerObject).length > 0
                        ? { ...report.headerObject, typ: report.headerObject.typ || 'vc+sd-jwt' }
                        : { alg: 'HS256', typ: 'vc+sd-jwt', kid: report.rfc7638Thumbprint };
                const baseJwt = signJwtHs256(sdHdr, baseClaims, secret, inputs.secretEncoding || 'utf8');
                const nextSdJwt = discB64List.length > 0 ? `${baseJwt}~${discB64List.join('~')}~` : `${baseJwt}~`;
                setInputs((prev) => ({ ...prev, rawTokenInput: nextSdJwt, forcedProtocolMode: 'AUTO' }));
                setEditablePayloadText('');
                setStatusNotice('Re-signed RFC 9901 SD-JWT and recomputed SHA-256 _sd digests.');
            } else if (report.detectedProtocol === 'SAML2') {
                const translated = translateTokenAcrossProtocols(
                    parsedPayload,
                    secret,
                    report.rfc7638Thumbprint
                );
                setInputs((prev) => ({
                    ...prev,
                    rawTokenInput: translated.saml2AssertionXml,
                    forcedProtocolMode: 'SAML2',
                }));
                setEditablePayloadText('');
                setStatusNotice('Updated SAML 2.0 Assertion XML with edited claims.');
            } else {
                const hdr =
                    Object.keys(report.headerObject).length > 0
                        ? report.headerObject
                        : { alg: 'HS256', typ: 'at+jwt', kid: report.rfc7638Thumbprint };
                const nextTok = signJwtHs256(hdr, parsedPayload, secret, inputs.secretEncoding || 'utf8');
                setInputs((prev) => ({ ...prev, rawTokenInput: nextTok, forcedProtocolMode: 'JWT_JWS' }));
                setEditablePayloadText('');
                setStatusNotice('Re-signed JWT with updated payload claims.');
            }
        } catch {
            setStatusNotice('Invalid JSON syntax in payload editor — check commas and quotes.');
        }
    };

    const handleDownloadCsv = () => {
        const csv = exportSecurityAuditCsv(report);
        triggerDownload(
            new Blob([csv], { type: 'text/csv;charset=utf-8' }),
            `kivarotools-token-audit-${report.detectedProtocol.toLowerCase()}.csv`
        );
    };

    const handleDownloadXlsx = () => {
        const bytes = exportSecurityAuditXlsx(report);
        const ab = new ArrayBuffer(bytes.byteLength);
        new Uint8Array(ab).set(bytes);
        triggerDownload(
            new Blob([ab], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
            `kivarotools-token-audit-${report.detectedProtocol.toLowerCase()}.xlsx`
        );
    };

    const handleDownloadJsonReport = () => {
        triggerDownload(
            new Blob([JSON.stringify(report, null, 2)], { type: 'application/json;charset=utf-8' }),
            `kivarotools-token-report-${report.detectedProtocol.toLowerCase()}.json`
        );
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-3.5 min-w-0 text-slate-900 dark:text-slate-100">
            {/* ============================================================================
                1. SINGLE SLEEK TOOLBAR (EXAMPLES + SECURITY SCORE PILL + OPTIONS DRAWER)
                ============================================================================ */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-xs space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
                    {/* Compact Example Pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 inline-flex items-center gap-1 mr-1">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            Examples:
                        </span>
                        {EXAMPLE_PRESETS.map((preset) => {
                            const isSelected = activePresetId === preset.id;
                            return (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => handleSelectPreset(preset.id)}
                                    title={preset.description}
                                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${isSelected
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                            : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                                        }`}
                                >
                                    {preset.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Side: Live Score Pill + Options Toggle */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {isTokenLoaded && (
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveInspectorTab('audit');
                                    setShowInspector(true);
                                }}
                                title="Open 16-Rule Security Audit"
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-semibold border transition cursor-pointer ${report.securityScore >= 90 && !isErrorStatus
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                                        : report.criticalFindingsCount > 0 || isErrorStatus
                                            ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                                    }`}
                            >
                                <span>{report.algorithmLabel}</span>
                                <span>·</span>
                                <span>
                                    Score {report.securityScore}/100 ({report.securityGrade})
                                </span>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => setShowOptionsDrawer((v) => !v)}
                            aria-expanded={showOptionsDrawer}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${showOptionsDrawer
                                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-400'
                                }`}
                        >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Options</span>
                            <ChevronDown
                                className={`w-3.5 h-3.5 transition-transform ${showOptionsDrawer ? 'rotate-180' : ''}`}
                            />
                        </button>
                    </div>
                </div>

                {/* Collapsible Options Drawer */}
                {showOptionsDrawer && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
                        <div>
                            <label htmlFor="jwt-proto-mode" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                Protocol Mode
                            </label>
                            <select
                                id="jwt-proto-mode"
                                value={inputs.forcedProtocolMode}
                                onChange={(e) =>
                                    setInputs((prev) => ({
                                        ...prev,
                                        forcedProtocolMode: e.target.value as DebuggerInputs['forcedProtocolMode'],
                                    }))
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                            >
                                <option value="AUTO">Auto-Detect (All 5)</option>
                                <option value="JWT_JWS">JWT / JWS (RFC 7519)</option>
                                <option value="SD_JWT">SD-JWT (RFC 9901)</option>
                                <option value="JWE_5PART">5-Part JWE (RFC 7516)</option>
                                <option value="PASETO">PASETO v1–v4</option>
                                <option value="SAML2">SAML 2.0 XML</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="jwt-clock-skew" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                Clock Skew (sec)
                            </label>
                            <input
                                id="jwt-clock-skew"
                                type="number"
                                min={0}
                                max={600}
                                value={inputs.clockSkewToleranceSeconds}
                                onChange={(e) =>
                                    setInputs((prev) => ({
                                        ...prev,
                                        clockSkewToleranceSeconds: Math.max(0, Number(e.target.value) || 0),
                                    }))
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs"
                            />
                        </div>

                        <div>
                            <label htmlFor="jwt-exp-iss" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                Expected Issuer (iss)
                            </label>
                            <input
                                id="jwt-exp-iss"
                                type="text"
                                value={inputs.expectedIssuer}
                                onChange={(e) =>
                                    setInputs((prev) => ({ ...prev, expectedIssuer: e.target.value }))
                                }
                                placeholder="https://auth.example.com"
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs"
                            />
                        </div>

                        <div>
                            <label htmlFor="jwt-exp-aud" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                Expected Audience (aud)
                            </label>
                            <input
                                id="jwt-exp-aud"
                                type="text"
                                value={inputs.expectedAudience}
                                onChange={(e) =>
                                    setInputs((prev) => ({ ...prev, expectedAudience: e.target.value }))
                                }
                                placeholder="https://api.example.com"
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs"
                            />
                        </div>

                        <div>
                            <label htmlFor="jwt-paseto-ia" className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                PASETO Implicit Assertion
                            </label>
                            <input
                                id="jwt-paseto-ia"
                                type="text"
                                value={inputs.pasetoImplicitAssertion}
                                onChange={(e) =>
                                    setInputs((prev) => ({ ...prev, pasetoImplicitAssertion: e.target.value }))
                                }
                                placeholder="tenant:prod (v3/v4 optional)"
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs"
                            />
                        </div>

                        <div className="sm:col-span-2 lg:col-span-5 flex flex-wrap items-center justify-between gap-2 pt-1">
                            <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={inputs.simulatedCurrentUnixTimestamp === null}
                                    onChange={(e) =>
                                        setInputs((prev) => ({
                                            ...prev,
                                            simulatedCurrentUnixTimestamp: e.target.checked
                                                ? null
                                                : DEFAULT_REFERENCE_UNIX_SEC,
                                        }))
                                    }
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span>Use live system clock for exp/nbf validation</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => handleSelectPreset('oidc_jwt_hs256_verified')}
                                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 cursor-pointer"
                            >
                                Reset defaults
                            </button>
                        </div>
                    </div>
                )}

                {statusNotice && (
                    <div
                        role="status"
                        className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-medium"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <span className="truncate">{statusNotice}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setStatusNotice(null)}
                            aria-label="Dismiss notice"
                            className="p-0.5 hover:opacity-75 shrink-0 cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>

            {/* ============================================================================
                2. 50/50 CLEAN SPLIT WORKBENCH (LEFT: ENCODED TOKEN | RIGHT: DECODED & VERIFY)
                ============================================================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                {/* LEFT PANE: ENCODED TOKEN */}
                <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden min-w-0">
                    <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                Encoded Token
                            </span>
                            {isTokenLoaded && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/70">
                                    {report.detectedProtocol}
                                </span>
                            )}
                            {report.strippedWrapperType !== 'NONE' && (
                                <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                                    Stripped {report.strippedWrapperType.replace('_', ' ')}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".jwt,.txt,.xml,.json,.pem,.jwk"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                title="Import a token, XML, PEM, or JWK file"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold transition cursor-pointer"
                            >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Import</span>
                            </button>

                            {report.securityFindings.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleAutoFix}
                                    title="Remediate detected security vulnerabilities in 1 click"
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer"
                                >
                                    <Wrench className="w-3.5 h-3.5" />
                                    <span>Auto-Fix ({report.securityFindings.length})</span>
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => copyText(report.cleanTokenString, 'clean_token')}
                                disabled={!isTokenLoaded}
                                title="Copy clean token"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-400 disabled:opacity-40 text-xs font-semibold transition cursor-pointer"
                            >
                                {copiedId === 'clean_token' ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                )}
                                <span className="hidden sm:inline">
                                    {copiedId === 'clean_token' ? 'Copied' : 'Copy'}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={handleClear}
                                disabled={!inputs.rawTokenInput}
                                title="Clear token input"
                                aria-label="Clear token input"
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-400 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-40 text-slate-600 dark:text-slate-400 transition cursor-pointer"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Iconic Color-Coded Segment Strip (jwt.io style) */}
                    {isTokenLoaded && report.tokenSegments.length > 0 && (
                        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="inline-flex items-center gap-1 text-rose-400">
                                        <span className="w-2 h-2 rounded-full bg-rose-500" /> Header
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-violet-400">
                                        <span className="w-2 h-2 rounded-full bg-violet-500" /> Payload
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-sky-400">
                                        <span className="w-2 h-2 rounded-full bg-sky-500" /> Signature
                                    </span>
                                    {(report.detectedProtocol === 'SD_JWT' ||
                                        report.detectedProtocol === 'PASETO') && (
                                            <span className="inline-flex items-center gap-1 text-emerald-400">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500" />{' '}
                                                {report.detectedProtocol === 'SD_JWT' ? 'Disclosures' : 'Footer'}
                                            </span>
                                        )}
                                    {report.detectedProtocol === 'JWE_5PART' && (
                                        <span className="inline-flex items-center gap-1 text-amber-400">
                                            <span className="w-2 h-2 rounded-full bg-amber-500" /> CEK / IV
                                        </span>
                                    )}
                                </div>
                                <span className="font-mono text-[10px] text-slate-500">
                                    {report.tokenSegments.length} parts
                                </span>
                            </div>

                            <div className="font-mono text-xs leading-relaxed break-all max-h-[116px] overflow-y-auto select-all">
                                {report.tokenSegments.map((seg, idx) => (
                                    <React.Fragment key={seg.index}>
                                        {idx > 0 && (
                                            <span className="text-slate-500 font-bold">
                                                {report.detectedProtocol === 'SD_JWT' && idx >= 3 ? '~' : '.'}
                                            </span>
                                        )}
                                        <span className={segmentTextClass(seg.role)} title={seg.summary}>
                                            {seg.rawSegmentText}
                                        </span>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Clean Editable Token Textarea */}
                    <div className="relative flex-1 flex flex-col min-h-[260px] lg:min-h-[360px]">
                        <textarea
                            aria-label="Encoded JWT, SD-JWT, JWE, PASETO, or SAML 2.0 token input"
                            value={inputs.rawTokenInput}
                            onChange={(e) => {
                                setActivePresetId(null);
                                setEditablePayloadText('');
                                setInputs((prev) => ({
                                    ...prev,
                                    rawTokenInput: e.target.value,
                                    simulatedCurrentUnixTimestamp: null,
                                }));
                            }}
                            spellCheck={false}
                            placeholder="Paste a JWT (eyJ...), Authorization: Bearer ..., SD-JWT (~), 5-Part JWE, PASETO (v4.public....), or SAML 2.0 XML/Base64..."
                            className="w-full flex-1 p-4 font-mono text-xs sm:text-[13px] leading-relaxed bg-slate-950 text-slate-100 placeholder-slate-500 focus:outline-none resize-y break-all min-h-[260px] lg:min-h-[360px]"
                        />
                    </div>

                    {/* Left Footer: Verification Status + Byte Budget */}
                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                            {!isTokenLoaded ? (
                                <span className="text-slate-500 font-medium">Paste a token or pick an example</span>
                            ) : isVerified ? (
                                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                                    <ShieldCheck className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{report.verificationBadgeLabel}</span>
                                </span>
                            ) : isErrorStatus ? (
                                <span className="inline-flex items-center gap-1.5 font-semibold text-rose-600 dark:text-rose-400">
                                    <ShieldAlert className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{report.verificationBadgeLabel}</span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400">
                                    <KeyRound className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{report.verificationBadgeLabel}</span>
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                            <span>{report.totalByteLength.toLocaleString()} B</span>
                            <span>·</span>
                            <span className={report.fits4kbCookieLimit ? '' : 'text-rose-500 font-bold'}>
                                Cookie {report.cookieBudgetUsagePercent}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANE: DECODED HEADER, PAYLOAD & SIGNATURE VERIFICATION */}
                <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden min-w-0 divide-y divide-slate-200 dark:divide-slate-800">
                    {/* 2A. HEADER */}
                    <div className="flex flex-col">
                        <div className="px-4 py-2 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                                    Header
                                </span>
                                {isTokenLoaded && (
                                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                        alg: {report.algorithmLabel}
                                        {report.keyIdKid !== '—' ? ` · kid: ${report.keyIdKid}` : ''}
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => copyText(report.headerJsonFormatted, 'header_json')}
                                disabled={!isTokenLoaded}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 disabled:opacity-40 cursor-pointer"
                            >
                                {copiedId === 'header_json' ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                )}
                                <span>{copiedId === 'header_json' ? 'Copied' : 'Copy'}</span>
                            </button>
                        </div>
                        <pre className="p-3.5 bg-slate-950 text-rose-300 font-mono text-xs leading-relaxed overflow-x-auto max-h-[136px]">
                            {report.headerJsonFormatted}
                        </pre>
                    </div>

                    {/* 2B. PAYLOAD / CLAIMS */}
                    <div className="flex flex-col flex-1">
                        <div className="px-4 py-2 bg-slate-50/80 dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                                    Payload
                                </span>
                                {isTokenLoaded && (
                                    <span
                                        className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold ${report.isExpired
                                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                            }`}
                                    >
                                        {report.ttlHumanLabel}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-1.5">
                                <div className="inline-flex rounded-lg bg-slate-200/70 dark:bg-slate-800 p-0.5 text-[11px] font-semibold">
                                    {(
                                        [
                                            { id: 'json', label: 'JSON' },
                                            { id: 'claims', label: `Claims (${report.claimRows.length})` },
                                            { id: 'edit', label: 'Edit & Sign' },
                                        ] as const
                                    ).map((m) => (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => {
                                                if (m.id === 'edit' && !editablePayloadText) {
                                                    setEditablePayloadText(report.payloadJsonFormatted);
                                                }
                                                setPayloadViewMode(m.id);
                                            }}
                                            className={`px-2 py-0.5 rounded-md transition cursor-pointer ${payloadViewMode === m.id
                                                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                        >
                                            {m.label}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => copyText(report.payloadJsonFormatted, 'payload_json')}
                                    disabled={!isTokenLoaded}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 disabled:opacity-40 cursor-pointer"
                                >
                                    {copiedId === 'payload_json' ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {payloadViewMode === 'json' && (
                            <pre className="p-3.5 bg-slate-950 text-violet-200 font-mono text-xs leading-relaxed overflow-x-auto flex-1 min-h-[180px] max-h-[240px]">
                                {report.payloadJsonFormatted}
                            </pre>
                        )}

                        {payloadViewMode === 'claims' && (
                            <div className="overflow-x-auto max-h-[240px] flex-1 bg-white dark:bg-slate-950">
                                {report.claimRows.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-slate-500">
                                        No decoded claims yet.
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead className="bg-slate-50 dark:bg-slate-900 text-[11px] text-slate-500 border-b border-slate-200 dark:border-slate-800 sticky top-0">
                                            <tr>
                                                <th className="py-2 px-3 font-mono">Claim</th>
                                                <th className="py-2 px-3 font-mono">Value</th>
                                                <th className="py-2 px-3">Meaning</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                                            {report.claimRows.map((row) => (
                                                <tr
                                                    key={row.key}
                                                    className={
                                                        row.isSensitivePiiOrSecret
                                                            ? 'bg-rose-50/70 dark:bg-rose-950/30'
                                                            : ''
                                                    }
                                                >
                                                    <td className="py-1.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                                                        {row.key}
                                                    </td>
                                                    <td className="py-1.5 px-3 font-mono text-[11px] break-all max-w-[160px]">
                                                        {row.rawValue}
                                                    </td>
                                                    <td className="py-1.5 px-3 text-[11px] text-slate-600 dark:text-slate-400">
                                                        {row.humanExplanation}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {payloadViewMode === 'edit' && (
                            <div className="flex flex-col flex-1 bg-slate-950">
                                <textarea
                                    aria-label="Editable JSON payload claims"
                                    value={editablePayloadText}
                                    onChange={(e) => setEditablePayloadText(e.target.value)}
                                    spellCheck={false}
                                    rows={8}
                                    className="w-full flex-1 p-3.5 bg-slate-950 text-emerald-300 font-mono text-xs leading-relaxed focus:outline-none min-h-[150px]"
                                />
                                <div className="px-3.5 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2">
                                    <span className="text-[11px] text-slate-400">
                                        Edit JSON claims and re-sign locally with the key below.
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleReSignEditedPayload}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer shrink-0"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        <span>Re-Sign Token</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2C. VERIFY SIGNATURE */}
                    <div className="p-3.5 bg-slate-50/70 dark:bg-slate-900 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                                    Verify Signature
                                </span>
                            </div>

                            <div className="inline-flex rounded-lg bg-slate-200/70 dark:bg-slate-800 p-0.5 text-[11px] font-semibold">
                                {(['utf8', 'base64url'] as const).map((enc) => (
                                    <button
                                        key={enc}
                                        type="button"
                                        onClick={() => setInputs((prev) => ({ ...prev, secretEncoding: enc }))}
                                        className={`px-2 py-0.5 rounded-md transition cursor-pointer ${(inputs.secretEncoding || 'utf8') === enc
                                                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                                                : 'text-slate-600 dark:text-slate-400'
                                            }`}
                                    >
                                        {enc === 'utf8' ? 'UTF-8' : 'Base64URL'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <input
                            type="text"
                            aria-label="HMAC secret, JWK JSON, PASERK key, or Public Key PEM"
                            value={inputs.secretOrKeyInput}
                            onChange={(e) =>
                                setInputs((prev) => ({ ...prev, secretOrKeyInput: e.target.value }))
                            }
                            placeholder="your-256-bit-secret, JWK JSON, PASERK (k4.local...), or PEM public key"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />

                        {isTokenLoaded && (
                            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                                <span className="text-slate-500 dark:text-slate-400 font-mono truncate">
                                    sub: {report.subjectLabel} · iss: {report.issuerLabel}
                                </span>
                                <span className="text-slate-400">Local browser processing</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ============================================================================
                3. COLLAPSIBLE INSPECTOR DRAWER (AUDIT, FORENSICS, KEYS & PKCE, 8-LANG CODE)
                ============================================================================ */}
            {isTokenLoaded && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-2">
                        <div
                            role="tablist"
                            aria-label="Token inspector tabs"
                            className="flex flex-wrap items-center gap-1.5"
                        >
                            {[
                                {
                                    id: 'audit' as const,
                                    icon: ShieldCheck,
                                    label: `Security Audit (${report.securityFindings.length})`,
                                },
                                {
                                    id: 'forensics' as const,
                                    icon: ArrowRightLeft,
                                    label: 'Forensics & Translate',
                                },
                                {
                                    id: 'keys' as const,
                                    icon: KeyRound,
                                    label: 'Key Studio & PKCE',
                                },
                                {
                                    id: 'code' as const,
                                    icon: Code2,
                                    label: 'Verify Code (8 Langs)',
                                },
                            ].map((tab) => {
                                const Icon = tab.icon;
                                const active = showInspector && activeInspectorTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => {
                                            if (showInspector && activeInspectorTab === tab.id) {
                                                setShowInspector(false);
                                            } else {
                                                setActiveInspectorTab(tab.id);
                                                setShowInspector(true);
                                            }
                                        }}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${active
                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                            }`}
                                    >
                                        <Icon className="w-3.5 h-3.5 shrink-0" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowInspector((v) => !v)}
                            aria-expanded={showInspector}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 cursor-pointer"
                        >
                            <span>{showInspector ? 'Hide Inspector' : 'Open Inspector'}</span>
                            <ChevronDown
                                className={`w-4 h-4 transition-transform ${showInspector ? 'rotate-180' : ''}`}
                            />
                        </button>
                    </div>

                    {showInspector && (
                        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800">
                            {/* TAB 1: 16-RULE SECURITY AUDIT + EXPORTS */}
                            {activeInspectorTab === 'audit' && (
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                                        <div>
                                            <span className="text-sm font-bold">
                                                Security Score: {report.securityScore}/100 ({report.securityGrade})
                                            </span>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {report.criticalFindingsCount} critical · {report.warningFindingsCount}{' '}
                                                warning · RFC 8725 &amp; OWASP JWT / SAML checks.
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                                            {report.securityFindings.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={handleAutoFix}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                                                >
                                                    <Wrench className="w-3.5 h-3.5" />
                                                    <span>1-Click Auto-Fix</span>
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={handleDownloadXlsx}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                                            >
                                                <FileSpreadsheet className="w-3.5 h-3.5" />
                                                <span>.XLSX</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleDownloadCsv}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                                            >
                                                <FileText className="w-3.5 h-3.5" />
                                                <span>.CSV</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleDownloadJsonReport}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                                            >
                                                <FileCode className="w-3.5 h-3.5" />
                                                <span>.JSON</span>
                                            </button>
                                        </div>
                                    </div>

                                    {report.securityFindings.length === 0 ? (
                                        <div className="p-5 text-center rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/70 text-xs text-emerald-800 dark:text-emerald-200 font-medium">
                                            Zero security vulnerabilities detected across all 16 RFC 8725 / SAML / PASETO rules.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {report.securityFindings.map((f) => (
                                                <div
                                                    key={f.ruleId}
                                                    className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs"
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span
                                                            className={`font-mono font-bold ${f.severity === 'CRITICAL'
                                                                    ? 'text-rose-600 dark:text-rose-400'
                                                                    : f.severity === 'WARNING'
                                                                        ? 'text-amber-600 dark:text-amber-400'
                                                                        : 'text-indigo-600 dark:text-indigo-400'
                                                                }`}
                                                        >
                                                            {f.severity} · {f.ruleId}
                                                        </span>
                                                        <span className="font-mono text-[10px] text-slate-500">
                                                            {f.cweOrRfcRef}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white">
                                                        {f.title}
                                                    </h4>
                                                    <p className="text-slate-600 dark:text-slate-400">{f.evidence}</p>
                                                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                                                        Fix: {f.remediation}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB 2: PROTOCOL FORENSICS & CROSS-PROTOCOL TRANSLATOR */}
                            {activeInspectorTab === 'forensics' && (
                                <div className="space-y-5 text-xs">
                                    {report.sdJwtDisclosures.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="font-bold uppercase tracking-wider text-slate-500">
                                                RFC 9901 SD-JWT Selective Disclosures ({report.sdJwtDisclosures.length})
                                            </h4>
                                            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                                                <table className="w-full text-left border-collapse">
                                                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] text-slate-500">
                                                        <tr>
                                                            <th className="py-2 px-3">Claim</th>
                                                            <th className="py-2 px-3">Value</th>
                                                            <th className="py-2 px-3">SHA-256 Digest</th>
                                                            <th className="py-2 px-3">_sd Match</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                                                        {report.sdJwtDisclosures.map((d) => (
                                                            <tr key={d.index}>
                                                                <td className="py-2 px-3 font-bold">{d.claimName}</td>
                                                                <td className="py-2 px-3">{d.claimValueDisplay}</td>
                                                                <td className="py-2 px-3 text-slate-500 truncate max-w-[200px]">
                                                                    {d.computedSha256DigestB64Url}
                                                                </td>
                                                                <td className="py-2 px-3">
                                                                    {d.matchedInPayloadSdArray ? (
                                                                        <span className="text-emerald-600 font-bold">✓ Verified</span>
                                                                    ) : (
                                                                        <span className="text-rose-600 font-bold">✕ Unmatched</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {report.jweForensics && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                                            {[
                                                ['Key Mgmt / Enc', `${report.jweForensics.keyManagementAlg} / ${report.jweForensics.contentEncryptionAlg}`],
                                                ['IV (96-bit Hex)', report.jweForensics.ivHex || '—'],
                                                ['Ciphertext Size', `${report.jweForensics.ciphertextBytes} bytes`],
                                                ['GCM Auth Tag', report.jweForensics.authTagHex || '—'],
                                            ].map(([label, val]) => (
                                                <div key={label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                                                    <div className="text-[10px] font-bold uppercase text-slate-500">{label}</div>
                                                    <div className="font-mono font-semibold mt-1 break-all">{val}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {report.pasetoForensics && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                                            {[
                                                ['Cipher Suite', report.pasetoForensics.cipherSuiteDescription],
                                                ['PAE Buffer', `${report.pasetoForensics.paeTotalByteLength} B (${report.pasetoForensics.paePiecesCount} LE64 pieces)`],
                                                ['Implicit Assertion', report.pasetoForensics.implicitAssertionUsed],
                                                ['Footer', report.pasetoForensics.footerRawText || '(empty)'],
                                            ].map(([label, val]) => (
                                                <div key={label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                                                    <div className="text-[10px] font-bold uppercase text-slate-500">{label}</div>
                                                    <div className="font-mono font-semibold mt-1 break-all">{val}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {report.samlForensics && (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                                                {[
                                                    ['Binding', report.samlForensics.detectedInputBinding],
                                                    ['Assertions / Sigs', `${report.samlForensics.totalAssertionCount} / ${report.samlForensics.totalSignatureCount}`],
                                                    ['NameID', report.samlForensics.nameId || '—'],
                                                    ['Destination', report.samlForensics.destination || '—'],
                                                ].map(([label, val]) => (
                                                    <div key={label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                                                        <div className="text-[10px] font-bold uppercase text-slate-500">{label}</div>
                                                        <div className="font-mono font-semibold mt-1 break-all">{val}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <pre className="p-3.5 rounded-xl bg-slate-950 text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-[220px]">
                                                {report.samlForensics.formattedXml}
                                            </pre>
                                        </div>
                                    )}

                                    {/* Cross-Protocol Translator */}
                                    <div className="space-y-2">
                                        <h4 className="font-bold uppercase tracking-wider text-slate-500">
                                            Cross-Protocol Translator (Load Current Claims As)
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setInputs((p) => ({
                                                        ...p,
                                                        rawTokenInput: report.crossProtocolTranslations.jwtHs256Token,
                                                        forcedProtocolMode: 'JWT_JWS',
                                                    }));
                                                    setStatusNotice('Translated claims to signed JWT (HS256).');
                                                }}
                                                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer"
                                            >
                                                Load as JWT (HS256)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setInputs((p) => ({
                                                        ...p,
                                                        rawTokenInput: report.crossProtocolTranslations.pasetoV4PublicToken,
                                                        forcedProtocolMode: 'PASETO',
                                                    }));
                                                    setStatusNotice('Translated claims to PASETO v4.public.');
                                                }}
                                                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 text-white font-semibold cursor-pointer"
                                            >
                                                Load as PASETO v4.public
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setInputs((p) => ({
                                                        ...p,
                                                        rawTokenInput: report.crossProtocolTranslations.saml2AssertionXml,
                                                        forcedProtocolMode: 'SAML2',
                                                    }));
                                                    setStatusNotice('Translated claims to SAML 2.0 Assertion XML.');
                                                }}
                                                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 font-semibold cursor-pointer"
                                            >
                                                Load as SAML 2.0 XML
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: KEY STUDIO (RFC 7638 JWK / JWKS / PASERK) & PKCE */}
                            {activeInspectorTab === 'keys' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold uppercase tracking-wider text-slate-500">
                                                RFC 7638 JWK &amp; JWKS (kid: {report.keyStudio.rfc7638ThumbprintKid})
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => copyText(report.keyStudio.jwksJsonSet, 'jwks_json')}
                                                className="text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer"
                                            >
                                                {copiedId === 'jwks_json' ? 'Copied' : 'Copy JWKS'}
                                            </button>
                                        </div>
                                        <pre className="p-3 rounded-xl bg-slate-950 text-sky-300 font-mono text-[11px] overflow-x-auto max-h-[200px]">
                                            {report.keyStudio.jwksJsonSet}
                                        </pre>
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1 font-mono text-[11px]">
                                            <div className="break-all">
                                                <span className="text-slate-500">PASERK Public: </span>
                                                {report.keyStudio.paserkPublic}
                                            </div>
                                            <div className="break-all">
                                                <span className="text-slate-500">PASERK Local: </span>
                                                {report.keyStudio.paserkLocal}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <h4 className="font-bold uppercase tracking-wider text-slate-500">
                                            OAuth 2.0 PKCE (RFC 7636 S256 Verifier)
                                        </h4>
                                        <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                                            <div>
                                                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                                    code_verifier
                                                </label>
                                                <input
                                                    type="text"
                                                    value={inputs.pkceCodeVerifier}
                                                    onChange={(e) =>
                                                        setInputs((p) => ({ ...p, pkceCodeVerifier: e.target.value }))
                                                    }
                                                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-xs"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                                    Expected code_challenge (S256)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={inputs.pkceExpectedChallenge}
                                                    onChange={(e) =>
                                                        setInputs((p) => ({
                                                            ...p,
                                                            pkceExpectedChallenge: e.target.value,
                                                        }))
                                                    }
                                                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-xs"
                                                />
                                            </div>
                                            <div className="pt-1 flex items-center justify-between gap-2 font-mono text-[11px]">
                                                <span className="truncate text-slate-500">
                                                    Computed: {report.pkceVerification.computedChallengeS256}
                                                </span>
                                                <span
                                                    className={
                                                        report.pkceVerification.matchesExpectedChallenge
                                                            ? 'text-emerald-600 font-bold shrink-0'
                                                            : 'text-rose-600 font-bold shrink-0'
                                                    }
                                                >
                                                    {report.pkceVerification.matchesExpectedChallenge
                                                        ? '✓ Match'
                                                        : '✕ Mismatch'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 4: 8-LANGUAGE HARDENED VERIFICATION CODE */}
                            {activeInspectorTab === 'code' && (
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex flex-wrap items-center gap-1">
                                            {CODE_LANGUAGES.map((lang) => (
                                                <button
                                                    key={lang.id}
                                                    type="button"
                                                    onClick={() => setSelectedCodeLang(lang.id)}
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${selectedCodeLang === lang.id
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                        }`}
                                                >
                                                    {lang.label}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => copyText(activeCodeSnippet, 'code_snippet')}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                                            >
                                                {copiedId === 'code_snippet' ? (
                                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5" />
                                                )}
                                                <span>{copiedId === 'code_snippet' ? 'Copied' : 'Copy'}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    triggerDownload(
                                                        new Blob([activeCodeSnippet], {
                                                            type: 'text/plain;charset=utf-8',
                                                        }),
                                                        `verify-token-${selectedCodeLang}.txt`
                                                    )
                                                }
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                <span>Download</span>
                                            </button>
                                        </div>
                                    </div>

                                    <pre className="p-4 rounded-xl bg-slate-950 text-emerald-300 font-mono text-xs leading-relaxed overflow-x-auto max-h-[320px]">
                                        {activeCodeSnippet}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}