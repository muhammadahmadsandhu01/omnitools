"use client";

import React, { useState, useMemo, useRef } from 'react';
import {
    KeyRound,
    Sparkles,
    RotateCcw,
    ShieldCheck,
    ShieldAlert,
    AlertTriangle,
    CheckCircle2,
    Download,
    Upload,
    Copy,
    Check,
    Share2,
    FileSpreadsheet,
    FileCode,
    FileText,
    Lock,
    Unlock,
    Wrench,
    Clock,
    ArrowRightLeft,
    Info,
    Cpu,
    Terminal,
    Layers,
    Eye,
    Edit3,
    Table as TableIcon,
    Code2,
} from 'lucide-react';

import {
    JWT_PASETO_SAML_ENGINE_VERSION,
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
    type TokenProtocolFamily,
    type PresetScenarioId,
    type CodeGeneratorLanguage,
    type DebuggerInputs,
    type TokenVisualSegment,
} from '@/lib/jwtPasetoSamlEngine';

type DeepDiveTab =
    | 'decoded_claims_editor'
    | 'security_linter_16'
    | 'cross_protocol_saml'
    | 'key_studio_xray'
    | 'polyglot_code_export';

type PayloadViewMode = 'json_pretty' | 'claims_table' | 'live_editor';

const QUICK_SCENARIO_PRESETS: {
    id: PresetScenarioId;
    title: string;
    subtitle: string;
    badge: string;
    protocolTag: string;
}[] = [
        {
            id: 'oidc_jwt_hs256_verified',
            title: '1. OIDC / OAuth 2.0 JWT (HS256 Verified)',
            subtitle: 'Auto-strips "Authorization: Bearer ", verifies 256-bit HMAC signature & RFC 7638 thumbprint.',
            badge: '100/100 Grade A+',
            protocolTag: 'JWT / JWS',
        },
        {
            id: 'vulnerable_jwt_audit_demo',
            title: '2. Vulnerable JWT Demo (9 Security Alerts)',
            subtitle: 'Cracked weak secret ("secret"), jku SSRF, inline JWK, kid path traversal, expired exp & PII.',
            badge: 'Test 1-Click Auto-Fix',
            protocolTag: 'Security Audit',
        },
        {
            id: 'sd_jwt_selective_disclosure_rfc9901',
            title: '3. IETF RFC 9901 SD-JWT (~ Disclosures)',
            subtitle: 'Verifies SHA-256 _sd digests against 2 selective disclosure tuples (national_id & clearance).',
            badge: 'RFC 9901 Verified',
            protocolTag: 'SD-JWT (~)',
        },
        {
            id: 'paseto_v4_public_footer_pae',
            title: '4. PASETO v4.public + Footer & PAE',
            subtitle: 'Inspects 64-bit LE64 Pre-Authentication Encoding (PAE), JSON footer (kid/wpk) & Implicit Assertion.',
            badge: 'LE64 PAE Verified',
            protocolTag: 'PASETO v4',
        },
        {
            id: 'jwe_5part_encrypted_a256gcm',
            title: '5. 5-Part Encrypted JWE (dir / A256GCM)',
            subtitle: 'Decrypts AEAD ciphertext in browser memory and inspects the 96-bit IV & 128-bit GCM Auth Tag.',
            badge: 'AEAD Decrypted',
            protocolTag: '5-Part JWE',
        },
        {
            id: 'saml2_response_xsw_audit',
            title: '6. SAML 2.0 SSO Response + XSW Audit',
            subtitle: 'Decodes Base64/Deflate SAML 2.0 XML, detects XSW wrapping & <NameID> comment truncation.',
            badge: 'SAML XSW + Auto-Fix',
            protocolTag: 'SAML 2.0 XML',
        },
    ];

const CODE_LANGUAGES: { id: CodeGeneratorLanguage; label: string; badge: string }[] = [
    { id: 'nodejs_jose', label: 'Node.js / Next.js (jose v5)', badge: 'TypeScript' },
    { id: 'python_pyjwt', label: 'Python 3.11+ (PyJWT / pyseto)', badge: 'Python' },
    { id: 'go_jwt_v5', label: 'Go (golang-jwt/v5)', badge: 'Golang' },
    { id: 'rust_jsonwebtoken', label: 'Rust (jsonwebtoken v9)', badge: 'Rust' },
    { id: 'java_nimbus', label: 'Java 21 / Spring (Nimbus)', badge: 'Java' },
    { id: 'csharp_dotnet', label: 'C# / .NET 8 (JwtBearer)', badge: '.NET' },
    { id: 'php_firebase', label: 'PHP 8.3 (firebase/php-jwt)', badge: 'PHP' },
    { id: 'cloudflare_workers', label: 'Cloudflare Workers (WebCrypto)', badge: 'Edge' },
];

function getSegmentColorClasses(role: TokenVisualSegment['role']): {
    text: string;
    bg: string;
    border: string;
    badge: string;
} {
    switch (role) {
        case 'HEADER':
            return {
                text: 'text-rose-600 dark:text-rose-400',
                bg: 'bg-rose-50/70 dark:bg-rose-950/30',
                border: 'border-rose-200 dark:border-rose-900/60',
                badge: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300',
            };
        case 'PAYLOAD':
            return {
                text: 'text-violet-600 dark:text-violet-400',
                bg: 'bg-violet-50/70 dark:bg-violet-950/30',
                border: 'border-violet-200 dark:border-violet-900/60',
                badge: 'bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300',
            };
        case 'SIGNATURE':
            return {
                text: 'text-sky-600 dark:text-sky-400',
                bg: 'bg-sky-50/70 dark:bg-sky-950/30',
                border: 'border-sky-200 dark:border-sky-900/60',
                badge: 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300',
            };
        case 'JWE_KEY_OR_IV':
            return {
                text: 'text-amber-600 dark:text-amber-400',
                bg: 'bg-amber-50/70 dark:bg-amber-950/30',
                border: 'border-amber-200 dark:border-amber-900/60',
                badge: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300',
            };
        case 'DISCLOSURE_OR_FOOTER':
        default:
            return {
                text: 'text-emerald-600 dark:text-emerald-400',
                bg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
                border: 'border-emerald-200 dark:border-emerald-900/60',
                badge: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300',
            };
    }
}

export default function JwtPasetoSamlDebugger() {
    // Clean zero initial state on page load / refresh (empty token input until user clicks a preset or pastes a token)
    const [activePresetId, setActivePresetId] = useState<PresetScenarioId | null>(null);
    const [inputs, setInputs] = useState<DebuggerInputs>(() => getDefaultDebuggerInputs());
    const [payloadViewMode, setPayloadViewMode] = useState<PayloadViewMode>('json_pretty');
    const [activeDeepDiveTab, setActiveDeepDiveTab] = useState<DeepDiveTab>('decoded_claims_editor');
    const [selectedCodeLang, setSelectedCodeLang] = useState<CodeGeneratorLanguage>('nodejs_jose');
    const [editablePayloadText, setEditablePayloadText] = useState<string>('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [statusNotice, setStatusNotice] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const deepDiveRef = useRef<HTMLDivElement | null>(null);

    const report = useMemo(() => analyzeTokenAndCompileReport(inputs), [inputs]);

    const copyText = (text: string, id: string) => {
        if (!text) return;
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            void navigator.clipboard.writeText(text);
        }
        setCopiedId(id);
        setTimeout(() => {
            setCopiedId((prev) => (prev === id ? null : prev));
        }, 1800);
    };

    const handleSelectPreset = (presetId: PresetScenarioId) => {
        const presetData = getPresetDebuggerInputs(presetId);
        setActivePresetId(presetId);
        setInputs(presetData.inputs);
        setEditablePayloadText('');
        if (presetId === 'vulnerable_jwt_audit_demo' || presetId === 'saml2_response_xsw_audit') {
            setActiveDeepDiveTab('security_linter_16');
        } else if (presetId === 'sd_jwt_selective_disclosure_rfc9901') {
            setActiveDeepDiveTab('decoded_claims_editor');
        }
        setStatusNotice(presetData.description);
    };

    const handleResetToZero = () => {
        setActivePresetId(null);
        setInputs(getDefaultDebuggerInputs());
        setEditablePayloadText('');
        setPayloadViewMode('json_pretty');
        setStatusNotice(
            'Workspace reset to clean 0 state. Click any of the 6 Cryptographic Presets above or paste your own JWT, SD-JWT, JWE, PASETO, or SAML 2.0 token.'
        );
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
            }));
            setEditablePayloadText('');
            setStatusNotice(`Loaded token file "${file.name}" (${file.size.toLocaleString()} bytes) locally in browser memory.`);
        } catch {
            setStatusNotice('Unable to read the selected file.');
        }
        e.target.value = '';
    };

    const handleAutoFix = () => {
        if (report.detectedProtocol === 'NONE') return;
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
                    footerText:
                        report.pasetoForensics?.footerRawText ||
                        inputs.pasetoFooterInput ||
                        '',
                    implicitAssertion: inputs.pasetoImplicitAssertion || '',
                    secretKeyString: secret,
                });
                setInputs((prev) => ({ ...prev, rawTokenInput: nextTok }));
                setEditablePayloadText('');
                setStatusNotice('Re-signed PASETO token with updated JSON claims and LE64 PAE binding.');
            } else if (report.detectedProtocol === 'JWE_5PART') {
                const nextTok = createJwe5PartToken(JSON.stringify(parsedPayload), secret);
                setInputs((prev) => ({ ...prev, rawTokenInput: nextTok }));
                setEditablePayloadText('');
                setStatusNotice('Re-encrypted 5-Part JWE (dir / A256GCM) with updated JSON claims.');
            } else if (report.detectedProtocol === 'SD_JWT') {
                const baseClaims = { ...parsedPayload };
                const discB64List: string[] = [];
                const digestList: string[] = [];
                for (const disc of report.sdJwtDisclosures) {
                    const updatedVal =
                        disc.claimName in baseClaims
                            ? baseClaims[disc.claimName]
                            : disc.claimValueDisplay;
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
                const nextSdJwt =
                    discB64List.length > 0
                        ? `${baseJwt}~${discB64List.join('~')}~`
                        : `${baseJwt}~`;
                setInputs((prev) => ({
                    ...prev,
                    rawTokenInput: nextSdJwt,
                    forcedProtocolMode: 'AUTO',
                }));
                setEditablePayloadText('');
                setStatusNotice('Re-signed RFC 9901 SD-JWT and recomputed SHA-256 _sd disclosure digests.');
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
                setStatusNotice('Updated OASIS SAML 2.0 Assertion XML with edited claims.');
            } else {
                const hdr =
                    Object.keys(report.headerObject).length > 0
                        ? report.headerObject
                        : { alg: 'HS256', typ: 'at+jwt', kid: report.rfc7638Thumbprint };
                const nextTok = signJwtHs256(hdr, parsedPayload, secret, inputs.secretEncoding || 'utf8');
                setInputs((prev) => ({
                    ...prev,
                    rawTokenInput: nextTok,
                    forcedProtocolMode: 'JWT_JWS',
                }));
                setEditablePayloadText('');
                setStatusNotice('Minted and signed JWT with updated JSON claims in browser memory.');
            }
        } catch {
            setStatusNotice('Invalid JSON syntax in payload editor — check commas and quotes before re-signing.');
        }
    };

    const handleDownloadCsv = () => {
        const csv = exportSecurityAuditCsv(report);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kivarotools-token-security-audit-${report.detectedProtocol.toLowerCase()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
    };

    const handleDownloadXlsx = () => {
        const bytes = exportSecurityAuditXlsx(report);
        const ab = new ArrayBuffer(bytes.byteLength);
        new Uint8Array(ab).set(bytes);
        const blob = new Blob([ab], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kivarotools-token-security-audit-${report.detectedProtocol.toLowerCase()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
    };

    const handleDownloadJsonReport = () => {
        const json = JSON.stringify(report, null, 2);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kivarotools-token-forensic-report-${report.detectedProtocol.toLowerCase()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
    };

    const handleCopyShareLink = () => {
        if (typeof window === 'undefined') return;
        const url = new URL(window.location.href);
        url.searchParams.set('protocol', report.detectedProtocol);
        if (activePresetId) url.searchParams.set('preset', activePresetId);
        copyText(url.toString(), 'share_link');
    };

    const activeCodeSnippet = useMemo(
        () => generateVerificationCodeSnippet(report, selectedCodeLang),
        [report, selectedCodeLang]
    );

    const isTokenLoaded = report.detectedProtocol !== 'NONE';

    return (
        <div className="space-y-6 w-full min-w-0 max-w-full overflow-x-hidden text-slate-900 dark:text-slate-100">
            {/* ============================================================================
          SECTION 1: TOP STUDIO HEADER, FILE LOADER & 6 INSTANT 1-CLICK SCENARIO CARDS
          ============================================================================ */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <Lock className="w-3.5 h-3.5 shrink-0" />
                                <span>100% Client-Side Cryptographic Engine (0 Server Uploads)</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                <Cpu className="w-3.5 h-3.5 shrink-0" />
                                <span>v{JWT_PASETO_SAML_ENGINE_VERSION}</span>
                            </span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            JWT (JWS / JWE / SD-JWT), PASETO (v1–v4) &amp; SAML 2.0 Debugger &amp; 16-Rule Security Linter
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            Decode, verify, and audit <code>JWT / JWS</code>, <code>IETF SD-JWT (~)</code>, <code>5-Part JWE (A256GCM)</code>,{' '}
                            <code>PASETO v1–v4</code>, and <code>SAML 2.0 (XML / Base64 / Deflate)</code> tokens locally in browser RAM.
                            Audit weak HMAC secrets, detect SAML XSW attacks, translate claims across protocols, and generate hardened
                            verification code.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
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
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-xs transition cursor-pointer"
                        >
                            <Upload className="w-4 h-4 shrink-0" />
                            <span>Open Token / XML File</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleResetToZero}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-400 transition cursor-pointer"
                            title="Reset workspace and all counters to 0"
                        >
                            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                            <span>Reset (0)</span>
                        </button>
                    </div>
                </div>

                {/* 6 Instant 1-Click Scenario Cards in 2-Column Responsive Grid (Never Cramped!) */}
                <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>
                                Instant 1-Click Cryptographic Scenario Presets (Click Any Preset to Test Live Decoding &amp; Linter):
                            </span>
                        </div>
                        <span className="text-[11px] font-medium text-slate-400">6 Real Protocol Samples</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {QUICK_SCENARIO_PRESETS.map((preset) => {
                            const isSelected = activePresetId === preset.id;
                            return (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => handleSelectPreset(preset.id)}
                                    className={`min-w-0 text-left p-3.5 rounded-xl border transition group cursor-pointer ${isSelected
                                        ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/90 dark:bg-indigo-950/60 ring-2 ring-indigo-500/25 shadow-xs'
                                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/60 dark:bg-slate-800/40'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 break-words">
                                            {preset.title}
                                        </span>
                                        <span
                                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${isSelected
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                                }`}
                                        >
                                            {isSelected ? '✓ Active' : 'Load'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                                            {preset.protocolTag}
                                        </span>
                                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                                            {preset.badge}
                                        </span>
                                    </div>
                                    <p className="text-[11px] leading-snug text-slate-600 dark:text-slate-400 break-words">
                                        {preset.subtitle}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Live Status Notice Banner */}
                {statusNotice && (
                    <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/80 bg-indigo-50/80 dark:bg-indigo-950/40 px-3.5 py-2.5 flex items-start sm:items-center justify-between gap-3 text-xs text-indigo-950 dark:text-indigo-200">
                        <div className="flex items-start sm:items-center gap-2 min-w-0">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                            <span className="break-words">{statusNotice}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setStatusNotice(null)}
                            className="text-indigo-700 dark:text-indigo-300 hover:underline font-bold shrink-0 cursor-pointer"
                        >
                            Dismiss
                        </button>
                    </div>
                )}
            </div>

            {/* ============================================================================
          SECTION 2: LIVE CRYPTOGRAPHIC VERIFICATION & SECURITY SCORE STATUS BAR
          ============================================================================ */}
            <div
                className={`rounded-2xl border p-4 sm:p-5 shadow-sm transition ${!isTokenLoaded
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-900 text-white'
                    : report.criticalFindingsCount > 0 ||
                        report.verificationStatus === 'WEAK_SECRET_CRACKED' ||
                        report.verificationStatus === 'INVALID_SIGNATURE' ||
                        report.verificationStatus === 'INSECURE_ALG_NONE'
                        ? 'border-rose-500/40 bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white'
                        : report.warningFindingsCount > 0
                            ? 'border-amber-500/40 bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 text-white'
                            : 'border-emerald-500/40 bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white'
                    }`}
            >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${!isTokenLoaded
                                    ? 'bg-slate-800 text-slate-300'
                                    : report.verificationStatus === 'SIGNATURE_VERIFIED' ||
                                        report.verificationStatus === 'DECRYPTED_VERIFIED'
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                                        : report.criticalFindingsCount > 0 ||
                                            report.verificationStatus === 'WEAK_SECRET_CRACKED' ||
                                            report.verificationStatus === 'INVALID_SIGNATURE'
                                            ? 'bg-rose-500/25 text-rose-200 border border-rose-400/40'
                                            : 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/30'
                                    }`}
                            >
                                {report.verificationStatus === 'SIGNATURE_VERIFIED' ||
                                    report.verificationStatus === 'DECRYPTED_VERIFIED' ? (
                                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : report.criticalFindingsCount > 0 ? (
                                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                                ) : (
                                    <KeyRound className="w-4 h-4 text-indigo-300 shrink-0" />
                                )}
                                <span>{report.verificationBadgeLabel}</span>
                            </span>

                            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-white/10 text-white">
                                Protocol: {report.detectedProtocol === 'NONE' ? 'IDLE (0)' : report.detectedProtocol}
                            </span>

                            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-white/10 text-white">
                                Alg: {report.algorithmLabel}
                            </span>

                            {report.strippedWrapperType !== 'NONE' && (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30">
                                    Auto-Stripped: {report.strippedWrapperType}
                                </span>
                            )}
                        </div>

                        <div className="text-base sm:text-lg font-extrabold tracking-tight text-white break-words">
                            {!isTokenLoaded
                                ? '0 Active Tokens — Select a Cryptographic Preset Above or Paste a Token Below'
                                : `Subject: ${report.subjectLabel} • ${report.claimRows.length} Decoded Claims (${report.totalByteLength.toLocaleString()} Bytes)`}
                        </div>

                        <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span>
                                <strong>Issuer:</strong> <span className="font-mono break-all">{report.issuerLabel}</span>
                            </span>
                            <span>
                                <strong>TTL Status:</strong> <span className="font-mono">{report.ttlHumanLabel}</span>
                            </span>
                            <span>
                                <strong>4 KB Cookie Budget:</strong>{' '}
                                <span className="font-mono">{isTokenLoaded ? `${report.cookieBudgetUsagePercent}%` : '0%'}</span>
                            </span>
                        </div>
                    </div>

                    {/* Right Side: Security Score + 1-Click Auto-Fix Button */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <div className="rounded-xl bg-white/10 border border-white/15 px-3.5 py-2 text-left">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                                16-Rule Security Score
                            </div>
                            <div className="flex items-baseline gap-2 mt-0.5">
                                <span
                                    className={`text-lg font-black font-mono ${!isTokenLoaded
                                        ? 'text-slate-300'
                                        : report.securityScore >= 90
                                            ? 'text-emerald-400'
                                            : report.securityScore >= 70
                                                ? 'text-amber-300'
                                                : 'text-rose-400'
                                        }`}
                                >
                                    {isTokenLoaded ? `${report.securityScore}/100 (${report.securityGrade})` : '0 / 100'}
                                </span>
                                <span className="text-xs font-semibold text-slate-300">
                                    • {report.criticalFindingsCount} Crit / {report.warningFindingsCount} Warn
                                </span>
                            </div>
                        </div>

                        {report.securityFindings.length > 0 && (
                            <button
                                type="button"
                                onClick={handleAutoFix}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm transition cursor-pointer"
                            >
                                <Wrench className="w-4 h-4 shrink-0" />
                                <span>1-Click Auto-Fix ({report.securityFindings.length} Alerts)</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ============================================================================
          SECTION 3: ENCODED TOKEN INPUT & COLOR-CODED SEGMENT INSPECTOR (jwt.io + oauth.tools Style)
          ============================================================================ */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-4">
                {/* Protocol Mode Selector Bar (Flex-Wrap so buttons NEVER squish or clip!) */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="space-y-1">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Protocol Detection &amp; Parser Mode
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                            {(
                                [
                                    { mode: 'AUTO', label: 'Auto-Detect (All 5)' },
                                    { mode: 'JWT_JWS', label: 'JWT / JWS (RFC 7519)' },
                                    { mode: 'SD_JWT', label: 'IETF SD-JWT (~)' },
                                    { mode: 'JWE_5PART', label: '5-Part JWE (RFC 7516)' },
                                    { mode: 'PASETO', label: 'PASETO v1–v4' },
                                    { mode: 'SAML2', label: 'SAML 2.0 (XML/Deflate)' },
                                ] as const
                            ).map((item) => {
                                const isSelected = inputs.forcedProtocolMode === item.mode;
                                return (
                                    <button
                                        key={item.mode}
                                        type="button"
                                        onClick={() =>
                                            setInputs((prev) => ({
                                                ...prev,
                                                forcedProtocolMode: item.mode,
                                            }))
                                        }
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${isSelected
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                            : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => copyText(report.cleanTokenString, 'clean_token')}
                            disabled={!isTokenLoaded}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 disabled:opacity-40 transition cursor-pointer"
                        >
                            {copiedId === 'clean_token' ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                                <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{copiedId === 'clean_token' ? 'Copied Token!' : 'Copy Clean Token'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleCopyShareLink}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition cursor-pointer"
                        >
                            {copiedId === 'share_link' ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                                <Share2 className="w-3.5 h-3.5" />
                            )}
                            <span>{copiedId === 'share_link' ? 'Copied URL!' : 'Share Workspace'}</span>
                        </button>
                    </div>
                </div>

                {/* Full-Width Encoded Token Textarea */}
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <label
                            htmlFor="kivaro-token-input"
                            className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                        >
                            <Terminal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <span>Encoded Token / Authorization Bearer Header / SAML 2.0 XML or Base64</span>
                        </label>
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            {report.totalByteLength.toLocaleString()} Bytes • SHA-256:{' '}
                            {isTokenLoaded ? `${report.inputSha256Fingerprint.slice(0, 16)}…` : '0'}
                        </span>
                    </div>

                    <textarea
                        id="kivaro-token-input"
                        rows={4}
                        value={inputs.rawTokenInput}
                        onChange={(e) => {
                            setActivePresetId(null);
                            setInputs((prev) => ({ ...prev, rawTokenInput: e.target.value }));
                        }}
                        placeholder="Paste JWT (eyJ...), Authorization: Bearer ..., SD-JWT (eyJ...~WyI...), 5-Part JWE, PASETO (v4.public....), or SAML 2.0 XML / Base64 / Deflate URL..."
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 px-3.5 py-3 text-xs sm:text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed break-all"
                    />
                </div>

                {/* Color-Coded Segment Visualizer (jwt.io Style Upgraded for JWT, SD-JWT, JWE, PASETO & SAML 2.0) */}
                {isTokenLoaded && report.tokenSegments.length > 0 && (
                    <div className="space-y-3 pt-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                <span>Color-Coded Cryptographic Segment Breakdown ({report.tokenSegments.length} Segments)</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                                <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
                                    <span className="w-2 h-2 rounded-full bg-rose-500" /> Header
                                </span>
                                <span className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400">
                                    <span className="w-2 h-2 rounded-full bg-violet-500" /> Payload / Claims
                                </span>
                                <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400">
                                    <span className="w-2 h-2 rounded-full bg-sky-500" /> Signature / Tag
                                </span>
                                {(report.detectedProtocol === 'SD_JWT' || report.detectedProtocol === 'PASETO') && (
                                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Disclosure / Footer
                                    </span>
                                )}
                                {report.detectedProtocol === 'JWE_5PART' && (
                                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                        <span className="w-2 h-2 rounded-full bg-amber-500" /> CEK / 96-Bit IV
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Interactive Color-Coded Segment Cards (Full-Width Stacked List — Never Overflows!) */}
                        <div className="grid grid-cols-1 gap-2">
                            {report.tokenSegments.map((seg) => {
                                const colors = getSegmentColorClasses(seg.role);
                                return (
                                    <div
                                        key={seg.index}
                                        className={`rounded-xl border ${colors.border} ${colors.bg} p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0`}
                                    >
                                        <div className="min-w-0 space-y-1 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${colors.badge}`}>
                                                    {seg.label}
                                                </span>
                                                <span className="text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300">
                                                    {seg.byteLength.toLocaleString()} Bytes
                                                </span>
                                                <span className="text-[11px] text-slate-500 dark:text-slate-400 break-words">
                                                    • {seg.summary}
                                                </span>
                                            </div>
                                            <div className={`font-mono text-xs ${colors.text} break-all line-clamp-2`}>
                                                {seg.rawSegmentText}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => copyText(seg.rawSegmentText, `seg_${seg.index}`)}
                                            className="self-start sm:self-center inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 shrink-0 cursor-pointer"
                                        >
                                            {copiedId === `seg_${seg.index}` ? (
                                                <Check className="w-3 h-3 text-emerald-600" />
                                            ) : (
                                                <Copy className="w-3 h-3" />
                                            )}
                                            <span>{copiedId === `seg_${seg.index}` ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* ============================================================================
          SECTION 4: STANDARD 3-PANEL DECODED WORKBENCH (HEADER + PAYLOAD + SIGNATURE VERIFIER)
          Stacked & Responsive so every box has 100% width and zero overflow!
          ============================================================================ */}
            <div className="space-y-4">
                {/* PANEL A + PANEL B: Decoded Header & Decoded Payload */}
                <div className="grid grid-cols-1 gap-4">
                    {/* PANEL 1: DECODED HEADER & RFC 7638 KEY THUMBPRINT */}
                    <div className="rounded-2xl border-2 border-rose-200/80 dark:border-rose-900/60 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-3 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                                <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                                    1. Decoded Header &amp; Cryptographic Key Metadata (Algorithm &amp; Token Type)
                                </h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300">
                                    {report.headerByteLength} Bytes
                                </span>
                                <button
                                    type="button"
                                    onClick={() => copyText(report.headerJsonFormatted, 'header_json')}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition cursor-pointer"
                                >
                                    {copiedId === 'header_json' ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                    )}
                                    <span>{copiedId === 'header_json' ? 'Copied' : 'Copy Header'}</span>
                                </button>
                            </div>
                        </div>

                        <pre className="rounded-xl bg-slate-950 text-rose-300 p-3.5 text-xs font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap break-all">
                            {report.headerJsonFormatted}
                        </pre>

                        {/* Full-Width Key ID & RFC 7638 Thumbprint Strip (Never clips!) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 min-w-0">
                                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                    Token Header Key ID (<code>kid</code>) &amp; Algorithm
                                </div>
                                <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 break-all">
                                    {isTokenLoaded ? `${report.algorithmLabel} • kid="${report.keyIdKid}"` : '0 (No Token Loaded)'}
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 min-w-0">
                                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                    RFC 7638 Canonical JWK SHA-256 Thumbprint
                                </div>
                                <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 break-all">
                                    {isTokenLoaded ? report.rfc7638Thumbprint : '0'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PANEL 2: DECODED PAYLOAD / CLAIMS TABLE / LIVE EDITOR (jwt.io + jwt.ms Style) */}
                    <div className="rounded-2xl border-2 border-violet-200/80 dark:border-violet-900/60 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-3 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shrink-0" />
                                <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-violet-700 dark:text-violet-300">
                                    2. Decoded Payload, Annotated Claims &amp; Live JSON Editor ({report.claimRows.length} Claims)
                                </h3>
                            </div>

                            {/* View Mode Switcher: JSON Pretty vs Annotated Table (jwt.ms) vs Live Re-Sign Editor */}
                            <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setPayloadViewMode('json_pretty')}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${payloadViewMode === 'json_pretty'
                                        ? 'bg-violet-600 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                        }`}
                                >
                                    <Code2 className="w-3.5 h-3.5" />
                                    <span>JSON Payload</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPayloadViewMode('claims_table')}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${payloadViewMode === 'claims_table'
                                        ? 'bg-violet-600 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                        }`}
                                >
                                    <TableIcon className="w-3.5 h-3.5" />
                                    <span>Claims Table ({report.claimRows.length})</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (isTokenLoaded) {
                                            setEditablePayloadText(report.payloadJsonFormatted);
                                        }
                                        setPayloadViewMode('live_editor');
                                    }}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${payloadViewMode === 'live_editor'
                                        ? 'bg-violet-600 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                        }`}
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Edit &amp; Re-Sign</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => copyText(report.payloadJsonFormatted, 'payload_json')}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition cursor-pointer"
                                >
                                    {copiedId === 'payload_json' ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                    )}
                                    <span>{copiedId === 'payload_json' ? 'Copied' : 'Copy'}</span>
                                </button>
                            </div>
                        </div>

                        {payloadViewMode === 'json_pretty' && (
                            <pre className="rounded-xl bg-slate-950 text-violet-300 p-3.5 text-xs font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap break-all max-h-80">
                                {report.payloadJsonFormatted}
                            </pre>
                        )}

                        {payloadViewMode === 'claims_table' && (
                            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                                {report.claimRows.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-slate-500">
                                        0 Claims Decoded. Load a preset or paste a token above to inspect claims.
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                                                <th className="py-2.5 px-3">Claim Key</th>
                                                <th className="py-2.5 px-3">Decoded Value</th>
                                                <th className="py-2.5 px-3">RFC 7519 / OIDC Specification &amp; Timestamp Analysis</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                            {report.claimRows.map((row) => (
                                                <tr
                                                    key={row.key}
                                                    className={
                                                        row.isSensitivePiiOrSecret ? 'bg-rose-50/70 dark:bg-rose-950/30' : ''
                                                    }
                                                >
                                                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap align-top">
                                                        {row.key}
                                                        {row.isStandardRfcClaim && (
                                                            <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                                                RFC
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-2.5 px-3 font-mono text-slate-900 dark:text-slate-100 break-all align-top">
                                                        {row.rawValue}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 break-words align-top">
                                                        {row.humanExplanation}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {payloadViewMode === 'live_editor' && (
                            <div className="space-y-2.5">
                                <textarea
                                    rows={7}
                                    value={editablePayloadText || report.payloadJsonFormatted}
                                    onChange={(e) => setEditablePayloadText(e.target.value)}
                                    className="w-full rounded-xl border border-violet-300 dark:border-violet-800 bg-slate-950 text-emerald-300 p-3.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 leading-relaxed"
                                />
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Modify any claim above and click Re-Sign to generate a newly signed JWT, PASETO, or 5-Part JWE token.
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleReSignEditedPayload}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-xs transition cursor-pointer"
                                    >
                                        <KeyRound className="w-3.5 h-3.5" />
                                        <span>Re-Sign / Re-Encrypt Updated Claims</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Temporal Claims Summary Strip (iat / nbf / exp) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 min-w-0">
                                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                    Issued At (<code>iat</code>)
                                </div>
                                <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 break-all">
                                    {report.issuedAtIso}
                                </div>
                            </div>
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 min-w-0">
                                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                    Not Before (<code>nbf</code>)
                                </div>
                                <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 break-all">
                                    {report.notBeforeIso}
                                </div>
                            </div>
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 min-w-0">
                                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                    Expires At (<code>exp</code>) &amp; TTL
                                </div>
                                <div
                                    className={`font-mono font-bold mt-0.5 break-all ${report.isExpired
                                        ? 'text-rose-600 dark:text-rose-400'
                                        : 'text-emerald-600 dark:text-emerald-400'
                                        }`}
                                >
                                    {isTokenLoaded ? `${report.expiresAtIso} (${report.ttlHumanLabel})` : '—'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PANEL 3: VERIFY SIGNATURE, SECRET / PEM / JWK / PASERK KEY & CLOCK SKEW CONTROLS */}
                    <div className="rounded-2xl border-2 border-sky-200/80 dark:border-sky-900/60 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-4 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
                                <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                                    3. Verify Signature, Secret / Public-Private Key &amp; Clock-Skew Tolerance
                                </h3>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <span
                                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${inputs.secretOrKeyInput.length >= 32
                                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                        }`}
                                >
                                    Key Entropy: {inputs.secretOrKeyInput.length * 8} bits (
                                    {inputs.secretOrKeyInput.length >= 32 ? 'RFC 7518 Compliant ≥256-bit' : 'Weak <256-bit'})
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            {/* Left 7 cols: Secret / PEM / JWK / PASERK Key Input */}
                            <div className="min-w-0 md:col-span-7 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <label
                                        htmlFor="kivaro-secret-input"
                                        className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                                    >
                                        HMAC Secret / RSA-ECDSA-Ed25519 PEM / JWK / PASERK Key
                                    </label>
                                    <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
                                        <button
                                            type="button"
                                            onClick={() => setInputs((p) => ({ ...p, secretEncoding: 'utf8' }))}
                                            className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${(inputs.secretEncoding || 'utf8') === 'utf8'
                                                ? 'bg-sky-600 text-white'
                                                : 'text-slate-600 dark:text-slate-300'
                                                }`}
                                        >
                                            UTF-8 Secret
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setInputs((p) => ({ ...p, secretEncoding: 'base64url' }))}
                                            className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${inputs.secretEncoding === 'base64url'
                                                ? 'bg-sky-600 text-white'
                                                : 'text-slate-600 dark:text-slate-300'
                                                }`}
                                        >
                                            Base64URL Secret
                                        </button>
                                    </div>
                                </div>

                                <textarea
                                    id="kivaro-secret-input"
                                    rows={3}
                                    value={inputs.secretOrKeyInput}
                                    onChange={(e) =>
                                        setInputs((prev) => ({ ...prev, secretOrKeyInput: e.target.value }))
                                    }
                                    placeholder="Enter 256-bit HMAC secret, PUBLIC/PRIVATE KEY PEM, JWK JSON, or PASERK (k4.local... / k4.public...)..."
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 break-all"
                                />
                            </div>

                            {/* Right 5 cols: Clock Skew Tolerance Slider & PASETO Implicit Assertion */}
                            <div className="min-w-0 md:col-span-5 space-y-3">
                                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3 space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                            <span>Clock Skew Leeway (±{inputs.clockSkewToleranceSeconds}s)</span>
                                        </span>
                                        <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                                            {inputs.clockSkewToleranceSeconds} sec
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min={0}
                                        max={300}
                                        step={5}
                                        value={inputs.clockSkewToleranceSeconds}
                                        onChange={(e) =>
                                            setInputs((prev) => ({
                                                ...prev,
                                                clockSkewToleranceSeconds: Number(e.target.value) || 0,
                                            }))
                                        }
                                        className="w-full accent-sky-600 cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                        <span>0s (Strict)</span>
                                        <span>60s (OIDC Std)</span>
                                        <span>300s (SAML Skew)</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label
                                        htmlFor="kivaro-implicit-input"
                                        className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                                    >
                                        PASETO v3/v4 Implicit Assertion (Unstored AEAD Context)
                                    </label>
                                    <input
                                        id="kivaro-implicit-input"
                                        type="text"
                                        value={inputs.pasetoImplicitAssertion}
                                        onChange={(e) =>
                                            setInputs((prev) => ({
                                                ...prev,
                                                pasetoImplicitAssertion: e.target.value,
                                            }))
                                        }
                                        placeholder="Optional e.g. tenant:kivaro-global-prod"
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ============================================================================
          SECTION 5: 4 FULL-WIDTH HORIZONTAL SUMMARY ROWS (100% Overflow-Proof grid-cols-1)
          ============================================================================ */}
            <div className="grid grid-cols-1 gap-2.5 text-xs min-w-0">
                {/* Row 1: Protocol, Algorithm & RFC 7638 Key Thumbprint */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0 shadow-2xs">
                    <div className="min-w-0 space-y-0.5">
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                            1. Protocol Family, Signing Algorithm &amp; RFC 7638 Key Thumbprint (<code>kid</code>)
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono break-all">
                            {isTokenLoaded
                                ? `kid="${report.keyIdKid}" • RFC 7638 SHA-256="${report.rfc7638Thumbprint}"`
                                : '0 active keys — select a preset or paste a token to compute RFC 7638 thumbprint'}
                        </div>
                    </div>
                    <div className="text-sm font-extrabold font-mono text-slate-900 dark:text-white shrink-0">
                        {isTokenLoaded ? `${report.detectedProtocol} • ${report.algorithmLabel}` : '0'}
                    </div>
                </div>

                {/* Row 2: Identity Subject (sub / NameID), Issuer & Audience */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0 shadow-2xs">
                    <div className="min-w-0 space-y-0.5">
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                            2. Principal Subject (<code>sub</code> / <code>NameID</code>), Issuer (<code>iss</code>) &amp; Audience (<code>aud</code>)
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono break-all">
                            {isTokenLoaded
                                ? `iss="${report.issuerLabel}" → aud="${report.audienceLabel}"`
                                : '0 identity claims decoded'}
                        </div>
                    </div>
                    <div className="text-sm font-extrabold font-mono text-indigo-600 dark:text-indigo-400 break-all sm:text-right">
                        {isTokenLoaded ? report.subjectLabel : '0'}
                    </div>
                </div>

                {/* Row 3: Temporal Validity Window (iat / nbf / exp) & Clock Skew */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0 shadow-2xs">
                    <div className="min-w-0 space-y-0.5">
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                            3. Temporal Validity Window (<code>iat</code> / <code>nbf</code> / <code>exp</code>) &amp; Clock Skew
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono break-all">
                            {isTokenLoaded
                                ? `Issued: ${report.issuedAtIso} • Expires: ${report.expiresAtIso} (±${inputs.clockSkewToleranceSeconds}s skew)`
                                : '0 timestamps evaluated'}
                        </div>
                    </div>
                    <div
                        className={`text-sm font-extrabold font-mono shrink-0 ${!isTokenLoaded
                            ? 'text-slate-900 dark:text-white'
                            : report.isExpired
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                    >
                        {isTokenLoaded ? report.ttlHumanLabel : '0s'}
                    </div>
                </div>

                {/* Row 4: HTTP Cookie (4 KB) & Authorization Header (8 KB) Size Budget */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0 shadow-2xs">
                    <div className="min-w-0 space-y-0.5">
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                            4. Browser HTTP Cookie (4,096 B) &amp; Proxy Header (8,192 B) Footprint
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono break-words">
                            {isTokenLoaded
                                ? `Header: ${report.headerByteLength} B • Payload: ${report.payloadByteLength} B • Signature/Tag: ${report.signatureOrTagByteLength} B`
                                : 'Header: 0 B • Payload: 0 B • Signature/Tag: 0 B'}
                        </div>
                    </div>
                    <div
                        className={`text-sm font-extrabold font-mono shrink-0 ${!isTokenLoaded
                            ? 'text-slate-900 dark:text-white'
                            : report.fits4kbCookieLimit
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-amber-600 dark:text-amber-400'
                            }`}
                    >
                        {isTokenLoaded
                            ? `${report.totalByteLength} B (${report.cookieBudgetUsagePercent}% of 4 KB)`
                            : '0 B (0%)'}
                    </div>
                </div>
            </div>

            {/* ============================================================================
          SECTION 6: 5 DEEP-DIVE ENTERPRISE STUDIO TABS
          ============================================================================ */}
            <div
                ref={deepDiveRef}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden"
            >
                {/* Responsive 5-Tab Navigation Bar */}
                <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 p-2 flex flex-wrap gap-1.5">
                    <button
                        type="button"
                        onClick={() => setActiveDeepDiveTab('decoded_claims_editor')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeDeepDiveTab === 'decoded_claims_editor'
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                            }`}
                    >
                        <Layers className="w-3.5 h-3.5 shrink-0" />
                        <span>1. SD-JWT, 5-Part JWE &amp; PASETO PAE Forensics</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveDeepDiveTab('security_linter_16')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeDeepDiveTab === 'security_linter_16'
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                            }`}
                    >
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        <span>2. 16-Rule Security Linter ({report.securityFindings.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveDeepDiveTab('cross_protocol_saml')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeDeepDiveTab === 'cross_protocol_saml'
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                            }`}
                    >
                        <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" />
                        <span>3. SAML 2.0 XML &amp; Cross-Protocol Translator</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveDeepDiveTab('key_studio_xray')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeDeepDiveTab === 'key_studio_xray'
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                            }`}
                    >
                        <KeyRound className="w-3.5 h-3.5 shrink-0" />
                        <span>4. Key Studio (JWK / PEM / PASERK) &amp; PKCE</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveDeepDiveTab('polyglot_code_export')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeDeepDiveTab === 'polyglot_code_export'
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                            }`}
                    >
                        <Terminal className="w-3.5 h-3.5 shrink-0" />
                        <span>5. 8-Lang Code Generator &amp; XLSX/CSV Audit</span>
                    </button>
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                    {/* ====================================================================
              TAB 1: SD-JWT DISCLOSURES, 5-PART JWE & PASETO PAE FORENSICS
              ==================================================================== */}
                    {activeDeepDiveTab === 'decoded_claims_editor' && (
                        <div className="space-y-5">
                            {/* SD-JWT Selective Disclosure Table */}
                            <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                                        IETF RFC 9901 SD-JWT Selective Disclosures (<code>~</code> Separated SHA-256Digests)
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleSelectPreset('sd_jwt_selective_disclosure_rfc9901')}
                                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition cursor-pointer"
                                    >
                                        Load SD-JWT Demo
                                    </button>
                                </div>

                                {report.sdJwtDisclosures.length === 0 ? (
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                        No <code>~</code>-delimited SD-JWT disclosures in the current token. Click{' '}
                                        <strong>Load SD-JWT Demo</strong> above to inspect RFC 9901 selective disclosure SHA-256 digest
                                        verification.
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-emerald-50/80 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 text-[11px] font-bold uppercase text-emerald-900 dark:text-emerald-200">
                                                    <th className="py-2 px-3">#</th>
                                                    <th className="py-2 px-3">Disclosed Claim</th>
                                                    <th className="py-2 px-3">Disclosed Value</th>
                                                    <th className="py-2 px-3">Salt</th>
                                                    <th className="py-2 px-3">SHA-256 _sd Digest Match</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                                {report.sdJwtDisclosures.map((d) => (
                                                    <tr key={d.index}>
                                                        <td className="py-2 px-3 font-mono font-bold">{d.index}</td>
                                                        <td className="py-2 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                                            {d.claimName}
                                                        </td>
                                                        <td className="py-2 px-3 font-mono break-all">{d.claimValueDisplay}</td>
                                                        <td className="py-2 px-3 font-mono text-slate-500 break-all">{d.salt}</td>
                                                        <td className="py-2 px-3 font-mono break-all">
                                                            <span
                                                                className={`inline-block px-2 py-0.5 rounded font-bold ${d.matchedInPayloadSdArray
                                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                                    : 'bg-rose-100 text-rose-800'
                                                                    }`}
                                                            >
                                                                {d.matchedInPayloadSdArray
                                                                    ? `✓ Matched (${d.computedSha256DigestB64Url.slice(0, 14)}…)`
                                                                    : '✕ Digest Mismatch'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* 5-Part JWE Forensic Breakdown */}
                            <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
                                        RFC 7516 5-Part Encrypted JWE Inspector (Header • CEK • 96-Bit IV • Ciphertext • 128-Bit GCM Tag)
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleSelectPreset('jwe_5part_encrypted_a256gcm')}
                                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition cursor-pointer"
                                    >
                                        Load 5-Part JWE Demo
                                    </button>
                                </div>

                                {!report.jweForensics ? (
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                        Current token is not a 5-part encrypted JWE. Click <strong>Load 5-Part JWE Demo</strong> to inspect
                                        AEAD <code>A256GCM</code> decryption, 96-bit IV, and 128-bit Authentication Tag verification.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                                        <div className="rounded-lg bg-white dark:bg-slate-900 p-3 border border-indigo-100 dark:border-indigo-900 min-w-0">
                                            <span className="text-slate-500 block">Key Mgmt (alg) / Content Enc (enc)</span>
                                            <span className="font-mono font-bold text-slate-900 dark:text-white break-all">
                                                {report.jweForensics.keyManagementAlg} / {report.jweForensics.contentEncryptionAlg}
                                            </span>
                                        </div>
                                        <div className="rounded-lg bg-white dark:bg-slate-900 p-3 border border-indigo-100 dark:border-indigo-900 min-w-0">
                                            <span className="text-slate-500 block">Initialization Vector (IV — {report.jweForensics.ivBytes} B)</span>
                                            <span className="font-mono font-bold text-slate-900 dark:text-white break-all">
                                                0x{report.jweForensics.ivHex}
                                            </span>
                                        </div>
                                        <div className="rounded-lg bg-white dark:bg-slate-900 p-3 border border-indigo-100 dark:border-indigo-900 min-w-0">
                                            <span className="text-slate-500 block">Ciphertext Length</span>
                                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                                                {report.jweForensics.ciphertextBytes} Bytes
                                            </span>
                                        </div>
                                        <div className="rounded-lg bg-white dark:bg-slate-900 p-3 border border-indigo-100 dark:border-indigo-900 min-w-0">
                                            <span className="text-slate-500 block">GCM Authentication Tag ({report.jweForensics.authTagBytes} B)</span>
                                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 break-all">
                                                0x{report.jweForensics.authTagHex}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* PASETO v1-v4 LE64 PAE Inspector */}
                            <div className="rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 p-4 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="text-xs font-extrabold uppercase tracking-wider text-purple-800 dark:text-purple-300">
                                        PASETO v1–v4 Binary LE64 Pre-Authentication Encoding (PAE) &amp; Implicit Assertion Inspector
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleSelectPreset('paseto_v4_public_footer_pae')}
                                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-600 text-white hover:bg-purple-500 transition cursor-pointer"
                                    >
                                        Load PASETO v4 Demo
                                    </button>
                                </div>

                                {!report.pasetoForensics ? (
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                        Current token is not a PASETO token. Click <strong>Load PASETO v4 Demo</strong> to inspect 64-bit
                                        little-endian PAE framing, JSON footer metadata, and implicit assertions.
                                    </p>
                                ) : (
                                    <div className="space-y-2.5 text-xs">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                            <div className="rounded-lg bg-white dark:bg-slate-900 p-3 border border-purple-100 dark:border-purple-900 min-w-0">
                                                <span className="text-slate-500 block">Cipher Suite</span>
                                                <span className="font-mono font-bold text-slate-900 dark:text-white break-words">
                                                    {report.pasetoForensics.cipherSuiteDescription}
                                                </span>
                                            </div>
                                            <div className="rounded-lg bg-white dark:bg-slate-900 p-3 border border-purple-100 dark:border-purple-900 min-w-0">
                                                <span className="text-slate-500 block">PAE Framing Buffer</span>
                                                <span className="font-mono font-bold text-slate-900 dark:text-white">
                                                    {report.pasetoForensics.paePiecesCount} Pieces • {report.pasetoForensics.paeTotalByteLength} B
                                                </span>
                                            </div>
                                            <div className="rounded-lg bg-white dark:bg-slate-900 p-3 border border-purple-100 dark:border-purple-900 min-w-0">
                                                <span className="text-slate-500 block">Implicit Assertion Bound</span>
                                                <span className="font-mono font-bold text-purple-700 dark:text-purple-300 break-all">
                                                    {report.pasetoForensics.implicitAssertionUsed}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="rounded-lg bg-slate-950 text-purple-300 p-3 font-mono text-[11px] break-all">
                                            <strong>PAE LE64 Hex Stream (First 48 Bytes):</strong> 0x{report.pasetoForensics.paeHexPreview64}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ====================================================================
              TAB 2: 16-RULE AUTOMATED SECURITY VULNERABILITY LINTER
              ==================================================================== */}
                    {activeDeepDiveTab === 'security_linter_16' && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                        16-Rule Automated SSO &amp; Token Security Vulnerability Audit
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Audits RFC 8725 JWT Best Current Practices, 65 weak HMAC dictionary secrets, JKU/JWK injection, kid
                                        traversal, SAML XSW1–XSW8 wrapping, and CVE-2017-11427 NameID comment truncation.
                                    </p>
                                </div>
                                {report.securityFindings.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleAutoFix}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs transition cursor-pointer"
                                    >
                                        <Wrench className="w-4 h-4" />
                                        <span>1-Click Auto-Fix All ({report.securityFindings.length})</span>
                                    </button>
                                )}
                            </div>

                            {report.securityFindings.length === 0 ? (
                                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/30 p-5 flex items-center gap-3 text-emerald-900 dark:text-emerald-200">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                                    <div className="text-xs sm:text-sm">
                                        <div className="font-bold">
                                            {!isTokenLoaded
                                                ? 'Ready to Audit — Load a Token or Click "2. Vulnerable JWT Demo" Above'
                                                : 'All 16 Cryptographic & Protocol Security Rules Passed (Score: 100/100 Grade A+)'}
                                        </div>
                                        <p className="text-xs opacity-85 mt-0.5">
                                            Zero alg:none bypasses, weak dictionary secrets, SSRF headers, SAML XSW injections, or plaintext
                                            PII leaks detected.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {report.securityFindings.map((finding) => (
                                        <div
                                            key={finding.ruleId}
                                            className={`rounded-xl border p-4 space-y-2 ${finding.severity === 'CRITICAL'
                                                ? 'border-rose-300 dark:border-rose-900/80 bg-rose-50/60 dark:bg-rose-950/25'
                                                : finding.severity === 'WARNING'
                                                    ? 'border-amber-300 dark:border-amber-900/80 bg-amber-50/60 dark:bg-amber-950/25'
                                                    : 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20'
                                                }`}
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${finding.severity === 'CRITICAL'
                                                            ? 'bg-rose-600 text-white'
                                                            : finding.severity === 'WARNING'
                                                                ? 'bg-amber-500 text-slate-950'
                                                                : 'bg-indigo-600 text-white'
                                                            }`}
                                                    >
                                                        {finding.severity}
                                                    </span>
                                                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                                                        {finding.ruleId}
                                                    </span>
                                                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                                        {finding.title}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] font-mono font-semibold text-slate-500">
                                                    {finding.cweOrRfcRef}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-700 dark:text-slate-300 font-mono break-all">
                                                <strong>Forensic Evidence:</strong> {finding.evidence}
                                            </p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                                <strong>Remediation:</strong> {finding.remediation}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ====================================================================
              TAB 3: SAML 2.0 XML WORKBENCH & CROSS-PROTOCOL TRANSLATOR
              ==================================================================== */}
                    {activeDeepDiveTab === 'cross_protocol_saml' && (
                        <div className="space-y-6">
                            {report.samlForensics && (
                                <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 space-y-3">
                                    <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
                                        OASIS SAML 2.0 Assertion &amp; Binding Inspector ({report.samlForensics.detectedInputBinding})
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                                        <div className="rounded-lg bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 min-w-0">
                                            <span className="text-slate-500 block">Destination vs. Recipient</span>
                                            <span className="font-mono font-bold break-all">
                                                {report.samlForensics.destination || '—'} / {report.samlForensics.recipient || '—'}
                                            </span>
                                        </div>
                                        <div className="rounded-lg bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 min-w-0">
                                            <span className="text-slate-500 block">Assertions / XML-DSig Blocks</span>
                                            <span className="font-mono font-bold">
                                                {report.samlForensics.totalAssertionCount} Assertion(s) •{' '}
                                                {report.samlForensics.totalSignatureCount} Signature(s)
                                            </span>
                                        </div>
                                        <div className="rounded-lg bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 min-w-0">
                                            <span className="text-slate-500 block">NameID Comment Truncation Check</span>
                                            <span
                                                className={`font-mono font-bold ${report.samlForensics.hasXmlCommentsInNameId ? 'text-rose-600' : 'text-emerald-600'
                                                    }`}
                                            >
                                                {report.samlForensics.hasXmlCommentsInNameId
                                                    ? '🚨 XML Comment Detected in <NameID>'
                                                    : '✓ Clean Canonical <NameID>'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1">
                                    Cross-Protocol Identity Claim Translator (SAML 2.0 ↔ OIDC JWT ↔ PASETO v4.public)
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                                    Automatically translates your current token&apos;s identity claims (<code>iss</code>, <code>sub</code>,{' '}
                                    <code>aud</code>, <code>exp</code>, <code>email</code>, <code>role</code>) across all three modern
                                    SSO protocols.Click <strong>Load in Debugger</strong> on any card to inspect it immediately.
                                </p>

                                <div className="grid grid-cols-1 gap-4">
                                    {/* Card 1: OIDC JWT (HS256) */}
                                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 min-w-0">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                                1. Equivalent RFC 9068 OIDC / OAuth 2.0 Access JWT (HS256)
                                            </span>
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => copyText(report.crossProtocolTranslations.jwtHs256Token, 'trans_jwt')}
                                                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 cursor-pointer"
                                                >
                                                    {copiedId === 'trans_jwt' ? 'Copied!' : 'Copy JWT'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditablePayloadText('');
                                                        setInputs((prev) => ({
                                                            ...prev,
                                                            rawTokenInput: report.crossProtocolTranslations.jwtHs256Token,
                                                            forcedProtocolMode: 'JWT_JWS',
                                                            secretOrKeyInput:
                                                                prev.secretOrKeyInput && prev.secretOrKeyInput.length >= 32
                                                                    ? prev.secretOrKeyInput
                                                                    : 'kivaro-256-bit-production-hmac-key-2026!',
                                                        }));
                                                    }}
                                                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer"
                                                >
                                                    Load in Debugger
                                                </button>
                                            </div>
                                        </div>
                                        <pre className="rounded-lg bg-slate-950 text-slate-200 p-3 text-[11px] font-mono break-all whitespace-pre-wrap">
                                            {report.crossProtocolTranslations.jwtHs256Token}
                                        </pre>
                                    </div>

                                    {/* Card 2: PASETO v4.public */}
                                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 min-w-0">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                                                2. Equivalent PASETO v4.public Token + JSON Footer
                                            </span>
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => copyText(report.crossProtocolTranslations.pasetoV4PublicToken, 'trans_paseto')}
                                                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 cursor-pointer"
                                                >
                                                    {copiedId === 'trans_paseto' ? 'Copied!' : 'Copy PASETO'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditablePayloadText('');
                                                        setInputs((prev) => ({
                                                            ...prev,
                                                            rawTokenInput: report.crossProtocolTranslations.pasetoV4PublicToken,
                                                            forcedProtocolMode: 'PASETO',
                                                            pasetoImplicitAssertion: '',
                                                            secretOrKeyInput:
                                                                prev.secretOrKeyInput && prev.secretOrKeyInput.length >= 32
                                                                    ? prev.secretOrKeyInput
                                                                    : 'kivaro-256-bit-production-hmac-key-2026!',
                                                        }));
                                                    }}
                                                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-600 text-white hover:bg-purple-500 cursor-pointer"
                                                >
                                                    Load in Debugger
                                                </button>
                                            </div>
                                        </div>
                                        <pre className="rounded-lg bg-slate-950 text-purple-200 p-3 text-[11px] font-mono break-all whitespace-pre-wrap">
                                            {report.crossProtocolTranslations.pasetoV4PublicToken}
                                        </pre>
                                    </div>

                                    {/* Card 3: OASIS SAML 2.0 Assertion XML, HTTP-POST Base64 & HTTP-Redirect Deflate URL */}
                                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 min-w-0">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                                3. Equivalent OASIS SAML 2.0 Response XML &amp; HTTP-Redirect (DEFLATE) Binding
                                            </span>
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => copyText(report.crossProtocolTranslations.saml2AssertionXml, 'trans_saml_xml')}
                                                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 cursor-pointer"
                                                >
                                                    {copiedId === 'trans_saml_xml' ? 'Copied XML!' : 'Copy XML'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditablePayloadText('');
                                                        setInputs((prev) => ({
                                                            ...prev,
                                                            rawTokenInput: report.crossProtocolTranslations.saml2AssertionXml,
                                                            forcedProtocolMode: 'SAML2',
                                                        }));
                                                    }}
                                                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"
                                                >
                                                    Load SAML XML in Debugger
                                                </button>
                                            </div>
                                        </div>
                                        <pre className="rounded-lg bg-slate-950 text-emerald-200 p-3 text-[11px] font-mono overflow-x-auto max-h-60">
                                            {report.crossProtocolTranslations.saml2AssertionXml}
                                        </pre>

                                        {/* HTTP-Redirect (RFC 1951 DEFLATE + Base64 + URL) & HTTP-POST (Base64) Encodings */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 space-y-1.5 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                                        HTTP-Redirect (RFC 1951 DEFLATE + Base64 + URL)
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            copyText(
                                                                report.samlForensics?.httpRedirectUrlQueryParam ||
                                                                report.crossProtocolTranslations.saml2HttpRedirectDeflateUrl,
                                                                'saml_redirect_url'
                                                            )
                                                        }
                                                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer shrink-0"
                                                    >
                                                        {copiedId === 'saml_redirect_url' ? 'Copied!' : 'Copy Redirect URL'}
                                                    </button>
                                                </div>
                                                <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400 break-all max-h-20 overflow-y-auto">
                                                    {report.samlForensics?.httpRedirectUrlQueryParam ||
                                                        report.crossProtocolTranslations.saml2HttpRedirectDeflateUrl}
                                                </div>
                                            </div>

                                            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 space-y-1.5 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                                        HTTP-POST Binding (Base64 Encoded SAML)
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            copyText(
                                                                report.samlForensics?.httpPostBase64Encoded ||
                                                                report.crossProtocolTranslations.saml2HttpPostBase64,
                                                                'saml_post_b64'
                                                            )
                                                        }
                                                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer shrink-0"
                                                    >
                                                        {copiedId === 'saml_post_b64' ? 'Copied!' : 'Copy POST Base64'}
                                                    </button>
                                                </div>
                                                <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400 break-all max-h-20 overflow-y-auto">
                                                    {report.samlForensics?.httpPostBase64Encoded ||
                                                        report.crossProtocolTranslations.saml2HttpPostBase64}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ====================================================================
              TAB 4: KEY STUDIO (JWK / JWKS / PEM / PASERK) & OAUTH 2.0 PKCE S256
              ==================================================================== */}
                    {activeDeepDiveTab === 'key_studio_xray' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2.5 min-w-0">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                            RFC 7517 Public JWK &amp; Discovery JWKS.json (<code>kid</code>)
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => copyText(report.keyStudio.jwkPublicJson, 'key_jwk')}
                                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer"
                                            >
                                                {copiedId === 'key_jwk' ? 'Copied JWK!' : 'Copy JWK'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => copyText(report.keyStudio.jwksJsonSet, 'key_jwks')}
                                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-white hover:bg-slate-700 cursor-pointer"
                                            >
                                                {copiedId === 'key_jwks' ? 'Copied JWKS!' : 'Copy JWKS.json'}
                                            </button>
                                        </div>
                                    </div>
                                    <pre className="rounded-lg bg-slate-950 text-indigo-300 p-3 text-xs font-mono overflow-x-auto">
                                        {report.keyStudio.jwkPublicJson}
                                    </pre>
                                </div>

                                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 min-w-0">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                            PASERK v4 Key Representations (<code>k4.public</code> / <code>k4.local</code> / <code>k4.pid</code> / <code>k4.lid</code>)
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => copyText(report.keyStudio.paserkLocal, 'key_paserk_local')}
                                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600 text-white hover:bg-purple-500 cursor-pointer"
                                        >
                                            {copiedId === 'key_paserk_local' ? 'Copied!' : 'Copy k4.local'}
                                        </button>
                                    </div>
                                    <div className="space-y-1.5 text-xs font-mono">
                                        <div className="p-2 rounded-lg bg-slate-950 text-emerald-300 break-all">
                                            <div className="text-[10px] text-slate-400">PASERK Public Key (k4.public):</div>
                                            {report.keyStudio.paserkPublic}
                                        </div>
                                        <div className="p-2 rounded-lg bg-slate-950 text-sky-300 break-all">
                                            <div className="text-[10px] text-slate-400">PASERK Symmetric Local Key (k4.local):</div>
                                            {report.keyStudio.paserkLocal}
                                        </div>
                                        <div className="p-2 rounded-lg bg-slate-950 text-amber-300 break-all">
                                            <div className="text-[10px] text-slate-400">PASERK Public Key ID (k4.pid):</div>
                                            {report.keyStudio.paserkPid}
                                        </div>
                                        <div className="p-2 rounded-lg bg-slate-950 text-purple-300 break-all">
                                            <div className="text-[10px] text-slate-400">PASERK Symmetric Key ID (k4.lid):</div>
                                            {report.keyStudio.paserkLid}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SPKI Public Key PEM & PKCS#8 Private Key PEM */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                            X.509 SPKI Public Key PEM
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => copyText(report.keyStudio.spkiPublicPem, 'key_spki_pem')}
                                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"
                                        >
                                            {copiedId === 'key_spki_pem' ? 'Copied PEM!' : 'Copy Public PEM'}
                                        </button>
                                    </div>
                                    <pre className="rounded-lg bg-slate-950 text-emerald-300 p-3 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap break-all">
                                        {report.keyStudio.spkiPublicPem}
                                    </pre>
                                </div>

                                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                            PKCS#8 Private Key PEM
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => copyText(report.keyStudio.pkcs8PrivatePem, 'key_pkcs8_pem')}
                                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white hover:bg-rose-500 cursor-pointer"
                                        >
                                            {copiedId === 'key_pkcs8_pem' ? 'Copied PEM!' : 'Copy Private PEM'}
                                        </button>
                                    </div>
                                    <pre className="rounded-lg bg-slate-950 text-rose-300 p-3 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap break-all">
                                        {report.keyStudio.pkcs8PrivatePem}
                                    </pre>
                                </div>
                            </div>

                            {/* OAuth 2.0 PKCE (RFC 7636) S256 Verifier */}
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-4 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                                        OAuth 2.0 PKCE (RFC 7636) <code>code_verifier</code> → <code>code_challenge</code> (S256) Verifier
                                    </div>
                                    <span
                                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${report.pkceVerification.matchesExpectedChallenge
                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                            }`}
                                    >
                                        {report.pkceVerification.matchesExpectedChallenge
                                            ? '✓ PKCE S256 Challenge Matched'
                                            : '✕ PKCE S256 Challenge Mismatch'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                    <div>
                                        <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                            PKCE <code>code_verifier</code> (43–128 chars)
                                        </label>
                                        <input
                                            type="text"
                                            value={inputs.pkceCodeVerifier}
                                            onChange={(e) =>
                                                setInputs((prev) => ({ ...prev, pkceCodeVerifier: e.target.value }))
                                            }
                                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 font-mono text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                            Computed <code>code_challenge</code> (S256)
                                        </label>
                                        <div className="rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 px-3 py-2 font-mono font-bold text-emerald-900 dark:text-emerald-300 break-all">
                                            {report.pkceVerification.computedChallengeS256}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                            Expected <code>code_challenge</code> (Optional Verify)
                                        </label>
                                        <input
                                            type="text"
                                            value={inputs.pkceExpectedChallenge}
                                            onChange={(e) =>
                                                setInputs((prev) => ({ ...prev, pkceExpectedChallenge: e.target.value }))
                                            }
                                            placeholder="Paste expected S256 challenge..."
                                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 font-mono text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ====================================================================
              TAB 5: 8-LANGUAGE BACKEND VERIFICATION CODE & XLSX/CSV AUDIT EXPORT
              ==================================================================== */}
                    {activeDeepDiveTab === 'polyglot_code_export' && (
                        <div className="space-y-5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap gap-1.5">
                                    {CODE_LANGUAGES.map((lang) => (
                                        <button
                                            key={lang.id}
                                            type="button"
                                            onClick={() => setSelectedCodeLang(lang.id)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${selectedCodeLang === lang.id
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                                }`}
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => copyText(activeCodeSnippet, 'code_snippet')}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-700 transition cursor-pointer"
                                >
                                    {copiedId === 'code_snippet' ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                    )}
                                    <span>{copiedId === 'code_snippet' ? 'Copied Code!' : 'Copy Snippet'}</span>
                                </button>
                            </div>

                            <pre className="rounded-xl bg-slate-950 text-emerald-300 p-4 text-xs font-mono overflow-x-auto leading-relaxed">
                                {activeCodeSnippet}
                            </pre>

                            {/* CWE-1236 Safe Audit Report Exports (.xlsx / .csv / .json) */}
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 flex flex-wrap items-center justify-between gap-3">
                                <div className="space-y-0.5">
                                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                        Export Compliance &amp; Penetration Testing Audit Report (CWE-1236 Safe)
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Includes all decoded claims, 16-rule security findings, CWE/RFC references, and SHA-256 token
                                        fingerprints.
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleDownloadXlsx}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs transition cursor-pointer"
                                    >
                                        <FileSpreadsheet className="w-3.5 h-3.5" />
                                        <span>Export Audit .XLSX</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDownloadCsv}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xs transition cursor-pointer"
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>Export Audit .CSV</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDownloadJsonReport}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white shadow-2xs transition cursor-pointer"
                                    >
                                        <FileCode className="w-3.5 h-3.5" />
                                        <span>Export Forensic .JSON</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ============================================================================
          SECTION 7: TECHNICAL SPECIFICATION & ZERO-UPLOAD PRIVACY DISCLOSURE
          ============================================================================ */}
            <details className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-xs text-slate-600 dark:text-slate-400">
                <summary className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer flex items-center justify-between">
                    <span className="inline-flex items-center gap-2">
                        <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>
                            Cryptographic Verification Methodology, RFC 8725 / PASETO / SAML 2.0 Standards &amp; Zero-Upload Privacy
                            Disclosure
                        </span>
                    </span>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold shrink-0">
                        Click to expand
                    </span>
                </summary>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 leading-relaxed">
                    <p>
                        <strong>100% Local Browser Execution:</strong> All JWT, SD-JWT, 5-Part JWE, PASETO v1–v4, and SAML 2.0
                        tokens, HMAC secrets, and PEM/JWK keys are processed exclusively inside your browser&apos;s local memory.
                        Zero tokens or keys are ever transmitted to any server.
                    </p>
                    <p>
                        <strong>Cryptographic Verification Scope:</strong> Symmetric HMAC signatures (<code>HS256</code>,{' '}
                        <code>HS384</code>, <code>HS512</code>), RFC 9901 SD-JWT SHA-256 <code>_sd</code> disclosures, RFC 7638 JWK
                        thumbprints, OAuth 2.0 PKCE <code>S256</code> challenges, and PASETO 64-bit Little-Endian Pre-Authentication
                        Encoding (<code>PAE</code>) frames are computed bit-for-bit in TypeScript. SAML 2.0 XML-DSig structural
                        audits inspect <code>&lt;ds:Reference URI&gt;</code> bindings, XSW assertion counts, and{' '}
                        <code>&lt;NameID&gt;</code> comment truncation.
                    </p>
                </div>
            </details>
        </div>
    );
}