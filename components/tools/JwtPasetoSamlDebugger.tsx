"use client";

import React, { useState, useMemo, useRef } from 'react';
import {
    KeyRound,
    Sparkles,
    RotateCcw,
    SlidersHorizontal,
    ShieldCheck,
    ShieldAlert,
    AlertTriangle,
    CheckCircle2,
    Download,
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
    ChevronDown,
    Cpu,
    Terminal,
    Layers,
} from 'lucide-react';

import {
    JWT_PASETO_SAML_ENGINE_VERSION,
    DEFAULT_REFERENCE_UNIX_SEC,
    analyzeTokenAndCompileReport,
    autoFixTokenVulnerabilities,
    signJwtHs256,
    createPasetoToken,
    createJwe5PartToken,
    generateVerificationCodeSnippet,
    exportSecurityAuditCsv,
    exportSecurityAuditXlsx,
    getDefaultDebuggerInputs,
    getPresetDebuggerInputs,
    type TokenProtocolFamily,
    type PresetScenarioId,
    type CodeGeneratorLanguage,
    type DebuggerInputs,
} from '@/lib/jwtPasetoSamlEngine';

type DeepDiveTab =
    | 'decoded_claims_editor'
    | 'security_linter_16'
    | 'cross_protocol_saml'
    | 'key_studio_xray'
    | 'polyglot_code_export';

const QUICK_SCENARIO_PRESETS: {
    id: PresetScenarioId;
    label: string;
    badge: string;
}[] = [
        {
            id: 'oidc_jwt_hs256_verified',
            label: 'OIDC / OAuth2 JWT (HS256 Verified)',
            badge: 'Bearer Auto-Strip + 100/100 A+',
        },
        {
            id: 'vulnerable_jwt_audit_demo',
            label: 'Vulnerable JWT Demo (7 Security Alerts)',
            badge: 'Cracked "secret" + jku SSRF + 1-Click Fix',
        },
        {
            id: 'paseto_v4_public_footer_pae',
            label: 'PASETO v4.public + Footer & PAE',
            badge: 'LE64 PAE + Implicit Assertion',
        },
        {
            id: 'jwe_5part_encrypted_a256gcm',
            label: '5-Part Encrypted JWE (dir / A256GCM)',
            badge: '96-Bit IV + 128-Bit GCM Tag',
        },
        {
            id: 'saml2_response_xsw_audit',
            label: 'SAML 2.0 SSO Response + XSW Audit',
            badge: 'Base64/Deflate + XSW & NameID Check',
        },
    ];

export default function JwtPasetoSamlDebugger() {
    // Clean zero initial state on page load / refresh (empty token input until user clicks a preset or pastes a token)
    const [activePresetId, setActivePresetId] = useState<PresetScenarioId | null>(null);
    const [inputs, setInputs] = useState<DebuggerInputs>(() =>
        getDefaultDebuggerInputs()
    );
    const [activeDeepDiveTab, setActiveDeepDiveTab] = useState<DeepDiveTab>('decoded_claims_editor');
    const [selectedCodeLang, setSelectedCodeLang] = useState<CodeGeneratorLanguage>('nodejs_jose');
    const [editablePayloadText, setEditablePayloadText] = useState<string>('');
    const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);
    const [copiedTokenOut, setCopiedTokenOut] = useState<boolean>(false);
    const [copiedCodeSnippet, setCopiedCodeSnippet] = useState<boolean>(false);
    const [statusNotice, setStatusNotice] = useState<string | null>(null);

    const deepDiveRef = useRef<HTMLDivElement | null>(null);

    const report = useMemo(() => analyzeTokenAndCompileReport(inputs), [inputs]);

    const handleSelectPreset = (presetId: PresetScenarioId) => {
        const presetData = getPresetDebuggerInputs(presetId);
        setActivePresetId(presetId);
        setInputs(presetData.inputs);
        setEditablePayloadText('');
        if (presetId === 'vulnerable_jwt_audit_demo' || presetId === 'saml2_response_xsw_audit') {
            setActiveDeepDiveTab('security_linter_16');
        }
        setStatusNotice(presetData.description);
    };

    const handleResetToZero = () => {
        setActivePresetId(null);
        setInputs(getDefaultDebuggerInputs());
        setEditablePayloadText('');
        setStatusNotice(
            'Reset token input and all telemetry counters to 0. Click any Quick Scenario Preset or paste your JWT, PASETO, or SAML 2.0 payload.'
        );
    };

    const handleAutoFixVulnerabilities = () => {
        if (report.detectedProtocol === 'NONE') {
            handleSelectPreset('vulnerable_jwt_audit_demo');
            return;
        }
        const { nextInputs, fixSummary } = autoFixTokenVulnerabilities(inputs);
        setInputs(nextInputs);
        setEditablePayloadText('');
        setStatusNotice(fixSummary);
    };

    const handleReSignModifiedPayload = (targetProto: 'JWT_HS256' | 'PASETO_V4_PUBLIC' | 'JWE_A256GCM') => {
        const rawJson = editablePayloadText.trim() || report.payloadJsonFormatted;
        let parsedPayload: Record<string, unknown> = report.payloadObject;
        try {
            parsedPayload = JSON.parse(rawJson) as Record<string, unknown>;
        } catch {
            setStatusNotice('Invalid JSON in live payload editor — please check syntax before re-signing.');
            return;
        }

        const secret = inputs.secretOrKeyInput || 'kivaro-256-bit-production-hmac-key-2026!';
        if (targetProto === 'JWT_HS256') {
            const nextJwt = signJwtHs256(
                {
                    alg: 'HS256',
                    typ: 'at+jwt',
                    kid: report.rfc7638Thumbprint,
                },
                parsedPayload,
                secret
            );
            setInputs((prev) => ({
                ...prev,
                rawTokenInput: nextJwt,
                forcedProtocolMode: 'JWT_JWS',
            }));
            setStatusNotice('Minted and signed updated JWT (HS256) with your modified JSON claims.');
        } else if (targetProto === 'PASETO_V4_PUBLIC') {
            const nextPaseto = createPasetoToken({
                version: 'v4',
                purpose: 'public',
                payloadJson: JSON.stringify(parsedPayload),
                footerText: inputs.pasetoFooterInput || '{"kid":"k4.pid.kivaro-ed25519-01"}',
                implicitAssertion: inputs.pasetoImplicitAssertion,
                secretKeyString: secret,
            });
            setInputs((prev) => ({
                ...prev,
                rawTokenInput: nextPaseto,
                forcedProtocolMode: 'PASETO',
            }));
            setStatusNotice('Minted updated PASETO v4.public token with LE64 PAE binding.');
        } else {
            const nextJwe = createJwe5PartToken(
                JSON.stringify(parsedPayload),
                secret,
                'kivaro-jwe-a256gcm-01'
            );
            setInputs((prev) => ({
                ...prev,
                rawTokenInput: nextJwe,
                forcedProtocolMode: 'JWE_5PART',
            }));
            setStatusNotice('Encrypted updated payload into a 5-Part JWE (dir / A256GCM) token.');
        }
    };

    const triggerDownload = (
        content: Uint8Array | string,
        fileName: string,
        mimeType: string
    ) => {
        const blob =
            typeof content === 'string'
                ? new Blob([content], { type: mimeType })
                : new Blob([content as unknown as BlobPart], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleShareScenario = () => {
        const summaryText = `KivaroTools JWT, PASETO & SAML 2.0 Debugger | Protocol: ${report.detectedProtocol} (${report.algorithmLabel}) | Status: ${report.verificationBadgeLabel} | Security Score: ${report.securityScore}/100 (${report.securityGrade}) | Subject: ${report.subjectLabel} | Size: ${report.totalByteLength} B (${report.cookieBudgetUsagePercent}% of 4KB Cookie Limit)`;
        void navigator.clipboard?.writeText(summaryText);
        setCopiedShareLink(true);
        setTimeout(() => setCopiedShareLink(false), 2500);
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 overflow-x-hidden">
            {/* ============================================================================
          TOP ENTERPRISE CRYPTOGRAPHIC & ZERO-UPLOAD TELEMETRY STRIP
          ============================================================================ */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30 px-4 py-3 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                        <Lock className="w-3.5 h-3.5" />
                        100% Client-Side Cryptographic Engine (0 Server Uploads)
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold bg-blue-100/80 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300">
                        <Cpu className="w-3.5 h-3.5" />
                        JWT / SD-JWT • 5-Part JWE • PASETO v1–v4 • SAML 2.0
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold bg-purple-100/80 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        16-Rule Security Linter + 65-Secret Dictionary Auditor
                    </span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Engine {JWT_PASETO_SAML_ENGINE_VERSION}
                </span>
            </div>

            {/* ============================================================================
          MAIN 2-COLUMN SPLIT-SCREEN WORKBENCH (100% Matching KivaroTools UI Language)
          Left Column (lg:col-span-5): Presets + Token Input + Key/Secret/Skew Controls
          Right Column (lg:col-span-7): Royal Blue Hero Card + 4 Full-Width Rows + Dark Bar
          ============================================================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ========================================================================
            LEFT COLUMN (lg:col-span-5): TOKEN INPUT & CRYPTOGRAPHIC CONTROLS
            ======================================================================== */}
                <div className="min-w-0 lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-xs space-y-5 overflow-hidden">
                    {/* Top Header Bar: Title + Reset Button */}
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 min-w-0">
                            <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                                Token Input, Key &amp; Protocol Parameters
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={handleResetToZero}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition shrink-0 cursor-pointer"
                            title="Reset token input and counters to 0"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset
                        </button>
                    </div>

                    {/* QUICK SCENARIO PRESETS BOX */}
                    <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                Quick Scenario Presets (Real Cryptographic Tokens)
                            </span>
                            <span className="text-[11px] text-slate-400">1-Click Test</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {QUICK_SCENARIO_PRESETS.map((preset) => {
                                const isSelected = activePresetId === preset.id;
                                return (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() => handleSelectPreset(preset.id)}
                                        className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition border text-left cursor-pointer ${isSelected
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                            }`}
                                    >
                                        {preset.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* PROTOCOL MODE SELECTOR */}
                    <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                Protocol Detection Mode
                            </label>
                            <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                                Active: {report.detectedProtocol}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                            {(
                                [
                                    { mode: 'AUTO', label: 'Auto' },
                                    { mode: 'JWT_JWS', label: 'JWT/JWS' },
                                    { mode: 'SD_JWT', label: 'SD-JWT' },
                                    { mode: 'JWE_5PART', label: '5-Pt JWE' },
                                    { mode: 'PASETO', label: 'PASETO' },
                                    { mode: 'SAML2', label: 'SAML 2.0' },
                                ] as const
                            ).map((item) => (
                                <button
                                    key={item.mode}
                                    type="button"
                                    onClick={() =>
                                        setInputs((prev) => ({
                                            ...prev,
                                            forcedProtocolMode: item.mode,
                                        }))
                                    }
                                    className={`py-1.5 px-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer ${inputs.forcedProtocolMode === item.mode
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* SMART TOKEN / SAML 2.0 INPUT TEXTAREA */}
                    <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                                Encoded Token / SAML Message / Bearer Header
                            </label>
                            {report.strippedWrapperType !== 'NONE' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                    Auto-Stripped {report.strippedWrapperType}
                                </span>
                            )}
                        </div>
                        <textarea
                            rows={5}
                            value={inputs.rawTokenInput}
                            onChange={(e) => {
                                setActivePresetId(null);
                                setInputs((prev) => ({
                                    ...prev,
                                    rawTokenInput: e.target.value,
                                }));
                            }}
                            placeholder="Paste JWT (eyJ...), SD-JWT (eyJ...~...), 5-Part JWE, PASETO (v4.public. / v4.local.), Authorization: Bearer header, or SAML 2.0 (Base64 / Deflate URL / Raw XML)..."
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-3 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 break-all"
                        />
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                            <span>
                                Footprint:{' '}
                                <strong className="font-mono text-slate-700 dark:text-slate-200">
                                    {report.totalByteLength} B
                                </strong>{' '}
                                ({report.cookieBudgetUsagePercent}% of 4 KB Cookie Limit)
                            </span>
                            {report.securityFindings.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleAutoFixVulnerabilities}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[11px] transition cursor-pointer"
                                >
                                    <Wrench className="w-3 h-3" />
                                    1-Click Auto-Fix ({report.securityFindings.length} Alerts)
                                </button>
                            )}
                        </div>
                    </div>

                    {/* SECRET / PUBLIC OR PRIVATE KEY (HMAC / PEM / JWK / PASERK) */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                                Verification Secret / PEM / JWK / PASERK Key
                            </label>
                            <span className="font-mono text-[11px] text-slate-400">
                                {inputs.secretOrKeyInput.length * 8}-bit key
                            </span>
                        </div>
                        <input
                            type="text"
                            value={inputs.secretOrKeyInput}
                            onChange={(e) =>
                                setInputs((prev) => ({
                                    ...prev,
                                    secretOrKeyInput: e.target.value,
                                }))
                            }
                            placeholder="Enter HMAC secret, PEM public/private key, JWK JSON, or PASERK (k4.local./k4.public.)..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* CLOCK SKEW TOLERANCE (LEEWAY) SLIDER */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                                    Clock Skew Tolerance (Leeway)
                                </label>
                                <span className="text-[11px] text-slate-500">
                                    Grace window for JWT <code>exp</code>/<code>nbf</code> &amp; SAML <code>NotBefore</code>/<code>NotOnOrAfter</code>
                                </span>
                            </div>
                            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 w-24 shrink-0">
                                <input
                                    type="number"
                                    min={0}
                                    max={600}
                                    value={inputs.clockSkewToleranceSeconds}
                                    onChange={(e) =>
                                        setInputs((prev) => ({
                                            ...prev,
                                            clockSkewToleranceSeconds: Math.min(600, Math.max(0, Number(e.target.value) || 0)),
                                        }))
                                    }
                                    className="w-full min-w-0 bg-transparent text-right font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none"
                                />
                                <span className="text-xs font-bold text-slate-400 ml-1 shrink-0">s</span>
                            </div>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={300}
                            step={5}
                            value={Math.min(300, inputs.clockSkewToleranceSeconds)}
                            onChange={(e) =>
                                setInputs((prev) => ({
                                    ...prev,
                                    clockSkewToleranceSeconds: Number(e.target.value),
                                }))
                            }
                            className="w-full accent-blue-600 cursor-pointer"
                        />
                    </div>

                    {/* COLLAPSIBLE ADVANCED PASETO IMPLICIT ASSERTION, TIME-TRAVEL & PKCE S256 ACCORDION */}
                    <details className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 overflow-hidden">
                        <summary className="flex items-center justify-between gap-2 px-3.5 py-2.5 text-xs font-bold text-blue-600 dark:text-blue-400 cursor-pointer select-none">
                            <span className="inline-flex items-center gap-1.5">
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                                Advanced PASETO Implicit Assertion, Time-Travel &amp; PKCE S256 Options
                            </span>
                            <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                        </summary>

                        <div className="p-3.5 pt-2 border-t border-slate-200/80 dark:border-slate-800 space-y-3 text-xs">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                    PASETO v3 / v4 Implicit Assertion (Unstored AEAD / PAE Context Binding)
                                </label>
                                <input
                                    type="text"
                                    value={inputs.pasetoImplicitAssertion}
                                    onChange={(e) =>
                                        setInputs((prev) => ({
                                            ...prev,
                                            pasetoImplicitAssertion: e.target.value,
                                        }))
                                    }
                                    placeholder="e.g. tenant:kivaro-global-prod"
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs"
                                />
                            </div>

                            {/* Time-Travel Simulator Buttons */}
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                        Expiration Time-Travel Simulator:
                                    </span>
                                    <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400">
                                        Ref: {new Date((inputs.simulatedCurrentUnixTimestamp ?? DEFAULT_REFERENCE_UNIX_SEC) * 1000).toISOString().slice(0, 19)}Z
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setInputs((prev) => ({
                                                ...prev,
                                                simulatedCurrentUnixTimestamp: DEFAULT_REFERENCE_UNIX_SEC,
                                            }))
                                        }
                                        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-bold cursor-pointer"
                                    >
                                        Default Time
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setInputs((prev) => ({
                                                ...prev,
                                                simulatedCurrentUnixTimestamp:
                                                    (prev.simulatedCurrentUnixTimestamp ?? DEFAULT_REFERENCE_UNIX_SEC) + 7200,
                                            }))
                                        }
                                        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-bold text-rose-600 cursor-pointer"
                                    >
                                        Fast-Forward +2h (Test Expired)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setInputs((prev) => ({
                                                ...prev,
                                                simulatedCurrentUnixTimestamp:
                                                    (prev.simulatedCurrentUnixTimestamp ?? DEFAULT_REFERENCE_UNIX_SEC) - 7200,
                                            }))
                                        }
                                        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-bold text-amber-600 cursor-pointer"
                                    >
                                        Rewind -2h (Test Future nbf)
                                    </button>
                                </div>
                            </div>

                            {/* OAuth 2.0 PKCE S256 Verifier */}
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                    OAuth 2.0 PKCE (RFC 7636) <code>code_verifier</code> -&gt; S256 <code>code_challenge</code>:
                                </label>
                                <input
                                    type="text"
                                    value={inputs.pkceCodeVerifier}
                                    onChange={(e) =>
                                        setInputs((prev) => ({
                                            ...prev,
                                            pkceCodeVerifier: e.target.value,
                                        }))
                                    }
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-[11px]"
                                />
                                <div className="font-mono text-[10.5px] text-emerald-600 dark:text-emerald-400 break-all">
                                    S256 Challenge: {report.pkceVerification.computedChallengeS256}
                                </div>
                            </div>
                        </div>
                    </details>
                </div>

                {/* ========================================================================
            RIGHT COLUMN (lg:col-span-7): ROYAL BLUE HERO CARD + 4 FULL-WIDTH ROWS
            ======================================================================== */}
                <div className="min-w-0 lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-xs space-y-5 overflow-hidden">
                    {/* Right Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 min-w-0">
                            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                                Cryptographic Verification, Claims Telemetry &amp; Security Audit
                            </h2>
                        </div>
                        <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${report.securityScore >= 85
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                    : report.securityScore >= 60
                                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                        : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                                }`}
                        >
                            Security Score: {report.securityScore}/100 ({report.securityGrade})
                        </span>
                    </div>

                    {statusNotice && (
                        <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40 px-3.5 py-2 text-xs font-medium text-blue-900 dark:text-blue-200 flex items-center justify-between gap-2">
                            <span className="min-w-0 break-words">✓ {statusNotice}</span>
                            <button
                                type="button"
                                onClick={() => setStatusNotice(null)}
                                className="text-blue-700 dark:text-blue-300 font-bold hover:underline shrink-0 cursor-pointer"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    {/* ROYAL BLUE GRADIENT HERO CARD */}
                    <div className="rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-5 sm:p-6 shadow-md space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-blue-100">
                                {report.verificationBadgeLabel}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-xs">
                                {report.detectedProtocol === 'NONE'
                                    ? '0 Tokens Loaded'
                                    : `${report.detectedProtocol} • ${report.algorithmLabel}`}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-baseline justify-between gap-4">
                            <div>
                                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono break-all">
                                    {report.detectedProtocol === 'NONE'
                                        ? '0 Claims / 0 Bytes'
                                        : `${report.claimRows.length} Claims (${report.totalByteLength} B)`}
                                </div>
                                <p className="text-xs sm:text-sm text-blue-100 mt-1">
                                    Subject:{' '}
                                    <strong className="text-white font-mono">
                                        {report.subjectLabel}
                                    </strong>{' '}
                                    • TTL:{' '}
                                    <strong className="text-white font-mono">
                                        {report.ttlHumanLabel}
                                    </strong>
                                </p>
                            </div>

                            <div className="rounded-xl bg-white/15 backdrop-blur-xs px-3.5 py-2.5 text-right space-y-1.5">
                                <div className="text-[10px] uppercase tracking-wider text-blue-100 font-semibold">
                                    16-Rule Security Audit
                                </div>
                                <div className="text-lg sm:text-xl font-extrabold font-mono text-amber-300">
                                    {report.criticalFindingsCount} Critical • {report.warningFindingsCount} Warn
                                </div>
                                <div className="flex flex-wrap justify-end gap-1.5 pt-0.5">
                                    <button
                                        type="button"
                                        onClick={handleAutoFixVulnerabilities}
                                        className="px-2.5 py-1 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-extrabold transition cursor-pointer inline-flex items-center gap-1"
                                    >
                                        <Wrench className="w-3 h-3" />
                                        Auto-Fix Vulnerabilities
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Security Score & Cookie Budget Bar */}
                        <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-xs font-bold text-blue-100">
                                <span>Security Compliance Score: {report.securityScore}%</span>
                                <span>4 KB Cookie Budget Used: {report.cookieBudgetUsagePercent}%</span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-blue-950/60 overflow-hidden flex">
                                <div
                                    style={{ width: `${Math.min(100, Math.max(0, report.securityScore))}%` }}
                                    className="bg-emerald-400 h-full transition-all duration-300"
                                />
                                <div
                                    style={{ width: `${Math.min(100, Math.max(0, 100 - report.securityScore))}%` }}
                                    className="bg-rose-400 h-full transition-all duration-300"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 4 FULL-WIDTH HORIZONTAL SUMMARY ROWS (grid-cols-1 — Zero Boundary Overflow on Desktop & Mobile!) */}
                    <div className="grid grid-cols-1 gap-2.5 text-xs min-w-0">
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 px-4 py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 min-w-0 overflow-hidden">
                            <div className="min-w-0">
                                <span className="text-slate-700 dark:text-slate-200 font-semibold block break-words">
                                    1. Header, Algorithm &amp; RFC 7638 Key Thumbprint (kid)
                                </span>
                                <span className="text-[11px] text-slate-400 block break-all">
                                    {report.detectedProtocol === 'NONE'
                                        ? 'Inspects alg, typ, kid, JWE enc/IV/Tag, PASETO LE64 PAE & SAML XML-DSig'
                                        : `kid="${report.keyIdKid}" • RFC 7638 SHA-256 Thumbprint="${report.rfc7638Thumbprint.slice(0, 22)}..."`}
                                </span>
                            </div>
                            <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-white shrink-0">
                                {report.algorithmLabel}
                            </span>
                        </div>

                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 px-4 py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 min-w-0 overflow-hidden">
                            <div className="min-w-0">
                                <span className="text-slate-700 dark:text-slate-200 font-semibold block break-words">
                                    2. Identity Subject (sub / NameID), Issuer &amp; Audience
                                </span>
                                <span className="text-[11px] text-slate-400 block break-all">
                                    {report.detectedProtocol === 'NONE'
                                        ? 'Extracts RFC 7519 iss, sub, aud, jti, OIDC scopes & SAML AttributeStatement'
                                        : `iss="${report.issuerLabel}" • aud="${report.audienceLabel}"`}
                                </span>
                            </div>
                            <span className="font-mono text-sm font-extrabold text-indigo-600 dark:text-indigo-400 shrink-0">
                                {report.subjectLabel}
                            </span>
                        </div>

                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 px-4 py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 min-w-0 overflow-hidden">
                            <div className="min-w-0">
                                <span className="text-slate-700 dark:text-slate-200 font-semibold block break-words">
                                    3. Temporal Validity Window (iat / nbf / exp / NotOnOrAfter)
                                </span>
                                <span className="text-[11px] text-slate-400 block">
                                    {report.detectedProtocol === 'NONE'
                                        ? `Clock Skew Tolerance: ±${inputs.clockSkewToleranceSeconds}s`
                                        : `Issued: ${report.issuedAtIso} -> Expires: ${report.expiresAtIso}`}
                                </span>
                            </div>
                            <span
                                className={`font-mono text-sm font-extrabold shrink-0 ${report.isExpired
                                        ? 'text-rose-600 dark:text-rose-400'
                                        : 'text-emerald-600 dark:text-emerald-400'
                                    }`}
                            >
                                {report.detectedProtocol === 'NONE'
                                    ? '±30s Leeway'
                                    : report.isExpired
                                        ? 'EXPIRED'
                                        : 'VALID WINDOW'}
                            </span>
                        </div>

                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 px-4 py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 min-w-0 overflow-hidden">
                            <div className="min-w-0">
                                <span className="text-slate-700 dark:text-slate-200 font-semibold block break-words">
                                    4. 16-Rule Security Audit &amp; HTTP Header / Cookie Footprint
                                </span>
                                <span className="text-[11px] text-slate-400 block">
                                    {report.crackedWeakSecret
                                        ? `🚨 Cracked Weak HMAC Secret: "${report.crackedWeakSecret}"`
                                        : `Header: ${report.headerByteLength}B • Payload: ${report.payloadByteLength}B • Sig/Tag: ${report.signatureOrTagByteLength}B`}
                                </span>
                            </div>
                            <span className="font-mono text-sm font-extrabold text-amber-600 dark:text-amber-400 shrink-0 text-right">
                                {report.fits4kbCookieLimit ? 'Fits 4KB Cookie' : 'Exceeds 4KB Cookie'}
                            </span>
                        </div>
                    </div>

                    {/* DARK SUMMARY BAR */}
                    <div className="rounded-2xl bg-slate-900 dark:bg-slate-950 border border-slate-800 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-bold text-white">
                                Cryptographic Token Fingerprint &amp; Cross-Protocol Translation Status
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 font-mono truncate">
                                {report.detectedProtocol === 'NONE'
                                    ? '0 tokens loaded — click a Quick Scenario Preset on the left or paste your token'
                                    : `SHA-256: ${report.inputSha256Fingerprint.slice(0, 36)}...`}
                            </div>
                        </div>
                        <div className="text-lg sm:text-xl font-extrabold font-mono text-emerald-400 shrink-0">
                            Grade {report.securityGrade} ({report.securityScore}/100)
                        </div>
                    </div>

                    {/* BOTTOM EXPORT & SHARE ACTION PILLS */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                            type="button"
                            onClick={handleAutoFixVulnerabilities}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer"
                        >
                            <Wrench className="w-3.5 h-3.5" />
                            Auto-Fix Vulnerabilities
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                const targetReport =
                                    report.detectedProtocol !== 'NONE'
                                        ? report
                                        : analyzeTokenAndCompileReport(
                                            getPresetDebuggerInputs('oidc_jwt_hs256_verified').inputs
                                        );
                                const xlsxBytes = exportSecurityAuditXlsx(targetReport);
                                triggerDownload(
                                    xlsxBytes,
                                    'kivarotools-token-security-audit.xlsx',
                                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                                );
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition cursor-pointer"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                            Export Audit Excel (.xlsx)
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                const targetReport =
                                    report.detectedProtocol !== 'NONE'
                                        ? report
                                        : analyzeTokenAndCompileReport(
                                            getPresetDebuggerInputs('oidc_jwt_hs256_verified').inputs
                                        );
                                const csvText = exportSecurityAuditCsv(targetReport);
                                triggerDownload(
                                    csvText,
                                    'kivarotools-token-security-audit.csv',
                                    'text/csv;charset=utf-8'
                                );
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-500 transition cursor-pointer"
                        >
                            <Download className="w-3.5 h-3.5 text-blue-600" />
                            Export Claims CSV (.csv)
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                triggerDownload(
                                    report.keyStudio.jwksJsonSet,
                                    'jwks.json',
                                    'application/json'
                                )
                            }
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-500 transition cursor-pointer"
                        >
                            <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                            Download JWKS (.json)
                        </button>

                        <button
                            type="button"
                            onClick={handleShareScenario}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-500 transition cursor-pointer"
                        >
                            {copiedShareLink ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                            )}
                            {copiedShareLink ? 'Copied!' : 'Share Summary'}
                        </button>
                    </div>

                    {/* METHODOLOGY & CRYPTOGRAPHIC STANDARDS ACCORDION */}
                    <details className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 overflow-hidden">
                        <summary className="flex items-center justify-between gap-2 px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer select-none">
                            <span className="inline-flex items-center gap-2">
                                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                Methodology, RFC 7515/7516/7519, PASETO LE64 PAE &amp; SAML 2.0 XSW Standards
                            </span>
                            <ChevronDown className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180" />
                        </summary>
                        <div className="px-4 pb-4 pt-2 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
                            <p>
                                <strong>1. Pure-TypeScript RFC 2104 HMAC &amp; 65-Secret Dictionary Audit:</strong> All <code>HS256</code>, <code>HS384</code>, and <code>HS512</code> signatures are computed locally in browser memory and automatically checked against 65 common boilerplate secrets (<code>secret</code>, <code>changeme</code>, <code>your-256-bit-secret</code>, etc.) to catch weak development keys before production deployment.
                            </p>
                            <p>
                                <strong>2. PASETO Pre-Authentication Encoding (PAE) &amp; Implicit Assertions:</strong> For PASETO <code>v1–v4</code> tokens, our engine constructs the exact 64-bit Little-Endian length-prefixed <code>PAE(header, payload, footer, implicitAssertion)</code> buffer so cross-context replay and footer manipulation are impossible.
                            </p>
                            <p>
                                <strong>3. SAML 2.0 HTTP-Redirect DEFLATE &amp; XML Signature Wrapping (XSW) Detection:</strong> Decodes both HTTP-POST Base64 and HTTP-Redirect RFC 1951 raw deflated messages, and audits the XML DOM for multiple <code>&lt;Assertion&gt;</code> blocks, <code>&lt;NameID&gt;</code> comment truncation (CVE-2017-11427), and <code>&lt;ds:Reference URI&gt;</code> mismatches.
                            </p>
                        </div>
                    </details>
                </div>
            </div>

            {/* ============================================================================
          5 DEEP-DIVE INTERACTIVE STUDIO TABS BELOW MAIN SPLIT-SCREEN WORKBENCH
          ============================================================================ */}
            <div
                ref={deepDiveRef}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden"
            >
                <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 px-3 pt-2 gap-1">
                    {(
                        [
                            {
                                id: 'decoded_claims_editor',
                                label: `1. Decoded Header, Claims & Live Signer (${report.claimRows.length})`,
                                icon: Layers,
                            },
                            {
                                id: 'security_linter_16',
                                label: `2. 16-Rule Security Linter & Weak-Secret Audit (${report.securityFindings.length})`,
                                icon: ShieldAlert,
                            },
                            {
                                id: 'cross_protocol_saml',
                                label: '3. Cross-Protocol Translator (JWT ↔ PASETO ↔ SAML 2.0)',
                                icon: ArrowRightLeft,
                            },
                            {
                                id: 'key_studio_xray',
                                label: '4. Key Studio (JWK ↔ PEM ↔ PASERK) & PAE / JWE X-Ray',
                                icon: KeyRound,
                            },
                            {
                                id: 'polyglot_code_export',
                                label: '5. 8-Language Backend Verifier Code Generator',
                                icon: Terminal,
                            },
                        ] as const
                    ).map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeDeepDiveTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveDeepDiveTab(tab.id)}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition cursor-pointer ${isActive
                                        ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 sm:p-6">
                    {/* ====================================================================
              TAB 1: DECODED HEADER, PAYLOAD CLAIMS & LIVE TOKEN EDITOR / SIGNER
              ==================================================================== */}
                    {activeDeepDiveTab === 'decoded_claims_editor' && (
                        <div className="space-y-5">
                            {report.detectedProtocol === 'NONE' ? (
                                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center space-y-3">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                                        <KeyRound className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        No Token Currently Loaded (0 Claims)
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                                        Paste a JWT, SD-JWT, 5-Part JWE, PASETO (<code>v1–v4</code>), or SAML 2.0 payload into the left panel, or click one of the 5 real cryptographic presets below to start inspecting:
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-2 pt-1">
                                        {QUICK_SCENARIO_PRESETS.map((preset) => (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                onClick={() => handleSelectPreset(preset.id)}
                                                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition cursor-pointer"
                                            >
                                                Load {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                        {/* Left: Protected Header JSON */}
                                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                            <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                                                <span>Decoded Protected Header / Protocol Envelope</span>
                                                <span className="font-mono text-rose-600 dark:text-rose-400">
                                                    {report.headerByteLength} bytes
                                                </span>
                                            </div>
                                            <pre className="p-4 bg-slate-950 text-rose-300 font-mono text-xs overflow-x-auto max-h-72 leading-relaxed">
                                                {report.headerJsonFormatted}
                                            </pre>
                                        </div>

                                        {/* Right: Editable Payload Claims + 1-Click Re-Sign Buttons */}
                                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                                            <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 flex flex-wrap items-center justify-between gap-2">
                                                <span>Live Editable Payload / Claims JSON</span>
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleReSignModifiedPayload('JWT_HS256')}
                                                        className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold cursor-pointer"
                                                    >
                                                        Mint JWT (HS256)
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleReSignModifiedPayload('PASETO_V4_PUBLIC')}
                                                        className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold cursor-pointer"
                                                    >
                                                        Mint PASETO v4
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleReSignModifiedPayload('JWE_A256GCM')}
                                                        className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer"
                                                    >
                                                        Encrypt JWE
                                                    </button>
                                                </div>
                                            </div>
                                            <textarea
                                                rows={10}
                                                value={editablePayloadText || report.payloadJsonFormatted}
                                                onChange={(e) => setEditablePayloadText(e.target.value)}
                                                className="w-full flex-1 p-4 bg-slate-950 text-emerald-300 font-mono text-xs outline-none leading-relaxed"
                                            />
                                        </div>
                                    </div>

                                    {/* Claims Dictionary & RFC Explanation Table */}
                                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                        <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                                            Decoded Claims &amp; SAML Attributes Inspector ({report.claimRows.length} claims)
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse text-xs">
                                                <thead>
                                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase text-slate-500">
                                                        <th className="py-2.5 px-3">Claim Key</th>
                                                        <th className="py-2.5 px-3">Decoded Value</th>
                                                        <th className="py-2.5 px-3">Type</th>
                                                        <th className="py-2.5 px-3">RFC 7519 / OIDC / Security Interpretation</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {report.claimRows.map((row) => (
                                                        <tr key={row.key}>
                                                            <td className="py-2.5 px-3 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                                                {row.key}
                                                            </td>
                                                            <td className="py-2.5 px-3 font-mono text-slate-800 dark:text-slate-200 break-all">
                                                                {row.rawValue}
                                                            </td>
                                                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                                                                {row.typeLabel}
                                                            </td>
                                                            <td
                                                                className={`py-2.5 px-3 ${row.isSensitivePiiOrSecret
                                                                        ? 'text-rose-600 dark:text-rose-400 font-bold'
                                                                        : 'text-slate-600 dark:text-slate-300'
                                                                    }`}
                                                            >
                                                                {row.humanExplanation}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ====================================================================
              TAB 2: 16-RULE SECURITY VULNERABILITY LINTER & WEAK-SECRET AUDITOR
              ==================================================================== */}
                    {activeDeepDiveTab === 'security_linter_16' && (
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                                        16-Rule Automated Cryptographic &amp; SSO Vulnerability Audit (Score: {report.securityScore}/100 — Grade {report.securityGrade})
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Audits RFC 8725 JWT Best Current Practices, 65-Password Weak HMAC Dictionary, PASETO PAE Binding, and SAML 2.0 XML Signature Wrapping (XSW1–XSW8).
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleSelectPreset('vulnerable_jwt_audit_demo')}
                                        className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold cursor-pointer"
                                    >
                                        Load Vulnerable JWT Demo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleAutoFixVulnerabilities}
                                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Wrench className="w-3.5 h-3.5" />
                                        1-Click Auto-Fix All Findings
                                    </button>
                                </div>
                            </div>

                            {report.securityFindings.length === 0 ? (
                                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30 p-6 text-center space-y-2">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                                    <div className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                                        ✓ Zero Vulnerabilities Detected Across All 16 Cryptographic &amp; SSO Audit Rules (100/100 A+)
                                    </div>
                                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                        Click &quot;Load Vulnerable JWT Demo&quot; above or Preset #5 (&quot;SAML 2.0 SSO Response + XSW Audit&quot;) to see the linter catch real-world exploits and auto-remediate them in 1 click.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {report.securityFindings.map((finding) => (
                                        <div
                                            key={finding.ruleId}
                                            className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 bg-white dark:bg-slate-900"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${finding.severity === 'CRITICAL'
                                                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                                                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                                            }`}
                                                    >
                                                        {finding.severity}
                                                    </span>
                                                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                                                        {finding.ruleId}
                                                    </span>
                                                    <strong className="text-xs sm:text-sm text-slate-900 dark:text-white">
                                                        {finding.title}
                                                    </strong>
                                                </div>
                                                <span className="font-mono text-[11px] text-slate-400">
                                                    {finding.cweOrRfcRef}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-600 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg">
                                                Evidence: {finding.evidence}
                                            </div>
                                            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                                                ✓ Remediation: {finding.remediation}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ====================================================================
              TAB 3: CROSS-PROTOCOL TRANSLATOR (JWT ↔ PASETO v4 ↔ SAML 2.0)
              ==================================================================== */}
                    {activeDeepDiveTab === 'cross_protocol_saml' && (
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span>1. Equivalent Hardened OIDC / OAuth2 JWT (HS256)</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                void navigator.clipboard?.writeText(
                                                    report.crossProtocolTranslations.jwtHs256Token
                                                );
                                                setCopiedTokenOut(true);
                                                setTimeout(() => setCopiedTokenOut(false), 2000);
                                            }}
                                            className="text-blue-600 hover:underline cursor-pointer"
                                        >
                                            {copiedTokenOut ? 'Copied!' : 'Copy JWT'}
                                        </button>
                                    </div>
                                    <pre className="p-3 rounded-xl bg-slate-950 text-blue-300 font-mono text-[11px] break-all whitespace-pre-wrap max-h-40 overflow-y-auto">
                                        {report.crossProtocolTranslations.jwtHs256Token}
                                    </pre>
                                </div>

                                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span>2. Equivalent PASETO v4.public Token (with Footer kid)</span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setInputs((prev) => ({
                                                    ...prev,
                                                    rawTokenInput: report.crossProtocolTranslations.pasetoV4PublicToken,
                                                    forcedProtocolMode: 'PASETO',
                                                }))
                                            }
                                            className="text-indigo-600 hover:underline cursor-pointer"
                                        >
                                            Load into Inspector →
                                        </button>
                                    </div>
                                    <pre className="p-3 rounded-xl bg-slate-950 text-emerald-300 font-mono text-[11px] break-all whitespace-pre-wrap max-h-40 overflow-y-auto">
                                        {report.crossProtocolTranslations.pasetoV4PublicToken}
                                    </pre>
                                </div>
                            </div>

                            {/* SAML 2.0 XML + HTTP-Redirect DEFLATE URL + HTTP-POST Base64 */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                                    <span>
                                        3. Equivalent OASIS SAML 2.0 Response Assertion XML &amp; HTTP-Redirect (DEFLATE + Base64) Binding
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setInputs((prev) => ({
                                                ...prev,
                                                rawTokenInput: report.crossProtocolTranslations.saml2HttpPostBase64,
                                                forcedProtocolMode: 'SAML2',
                                            }))
                                        }
                                        className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] cursor-pointer"
                                    >
                                        Load SAML 2.0 into Inspector
                                    </button>
                                </div>
                                <pre className="p-3 rounded-xl bg-slate-950 text-amber-200 font-mono text-[11px] overflow-x-auto max-h-60 leading-relaxed">
                                    {report.samlForensics
                                        ? report.samlForensics.formattedXml
                                        : report.crossProtocolTranslations.saml2AssertionXml}
                                </pre>
                                <div className="text-[11px] font-mono text-slate-500 break-all">
                                    <strong>HTTP-Redirect (RFC 1951 DEFLATE + Base64 + URL):</strong>{' '}
                                    {report.samlForensics
                                        ? report.samlForensics.httpRedirectUrlQueryParam
                                        : report.crossProtocolTranslations.saml2HttpRedirectDeflateUrl}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ====================================================================
              TAB 4: CRYPTOGRAPHIC KEY STUDIO (JWK ↔ PEM ↔ PASERK) & PAE/JWE X-RAY
              ==================================================================== */}
                    {activeDeepDiveTab === 'key_studio_xray' && (
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span>RFC 7517 JWKSet (jwks.json) + RFC 7638 Thumbprint</span>
                                        <span className="font-mono text-blue-600 dark:text-blue-400">
                                            kid: {report.keyStudio.rfc7638ThumbprintKid.slice(0, 18)}...
                                        </span>
                                    </div>
                                    <pre className="p-3 rounded-xl bg-slate-950 text-emerald-300 font-mono text-xs overflow-x-auto max-h-56">
                                        {report.keyStudio.jwksJsonSet}
                                    </pre>
                                </div>

                                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                                    <div className="text-xs font-bold">
                                        SPKI Public PEM &amp; PASERK (k4.public / k4.local / k4.pid / k4.lid)
                                    </div>
                                    <pre className="p-3 rounded-xl bg-slate-950 text-purple-300 font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed">
                                        {`${report.keyStudio.spkiPublicPem}\n\nPASERK Public: ${report.keyStudio.paserkPublic}\nPASERK Local:  ${report.keyStudio.paserkLocal}\nPASERK PID:    ${report.keyStudio.paserkPid}\nPASERK LID:    ${report.keyStudio.paserkLid}`}
                                    </pre>
                                </div>
                            </div>

                            {report.pasetoForensics && (
                                <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30 p-4 space-y-2 text-xs">
                                    <div className="font-bold text-indigo-950 dark:text-indigo-200">
                                        PASETO Binary Pre-Authentication Encoding (LE64 PAE) Inspector ({report.pasetoForensics.paeTotalByteLength} bytes across {report.pasetoForensics.paePiecesCount} framing pieces)
                                    </div>
                                    <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all">
                                        PAE Hex (Leading 48B): {report.pasetoForensics.paeHexPreview64}
                                    </div>
                                    <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400 break-all">
                                        Signature / Tag Hex: {report.pasetoForensics.rawSignatureOrTagHex}
                                    </div>
                                </div>
                            )}

                            {report.jweForensics && (
                                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/30 p-4 space-y-2 text-xs">
                                    <div className="font-bold text-emerald-950 dark:text-emerald-200">
                                        5-Part JWE (RFC 7516) Segment X-Ray ({report.jweForensics.keyManagementAlg} / {report.jweForensics.contentEncryptionAlg})
                                    </div>
                                    <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                                        96-Bit IV ({report.jweForensics.ivBytes}B): {report.jweForensics.ivHex} • 128-Bit GCM Tag ({report.jweForensics.authTagBytes}B): {report.jweForensics.authTagHex}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ====================================================================
              TAB 5: 8-LANGUAGE BACKEND VERIFICATION CODE GENERATOR
              ==================================================================== */}
                    {activeDeepDiveTab === 'polyglot_code_export' && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap gap-1.5">
                                    {(
                                        [
                                            { id: 'nodejs_jose', label: 'Node.js / TS (jose)' },
                                            { id: 'python_pyjwt', label: 'Python (PyJWT)' },
                                            { id: 'go_jwt_v5', label: 'Go (jwt/v5)' },
                                            { id: 'rust_jsonwebtoken', label: 'Rust' },
                                            { id: 'java_nimbus', label: 'Java (Nimbus)' },
                                            { id: 'csharp_dotnet', label: 'C# / .NET 8' },
                                            { id: 'php_firebase', label: 'PHP 8.3' },
                                            { id: 'cloudflare_workers', label: 'Cloudflare Workers' },
                                        ] as const
                                    ).map((lang) => (
                                        <button
                                            key={lang.id}
                                            type="button"
                                            onClick={() => setSelectedCodeLang(lang.id)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${selectedCodeLang === lang.id
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                                }`}
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        const code = generateVerificationCodeSnippet(report, selectedCodeLang);
                                        void navigator.clipboard?.writeText(code);
                                        setCopiedCodeSnippet(true);
                                        setTimeout(() => setCopiedCodeSnippet(false), 2000);
                                    }}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
                                >
                                    {copiedCodeSnippet ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                    )}
                                    {copiedCodeSnippet ? 'Copied Code!' : 'Copy Verification Code'}
                                </button>
                            </div>

                            <pre className="rounded-xl bg-slate-950 text-slate-100 p-4 text-xs font-mono overflow-x-auto max-h-80 leading-relaxed">
                                {generateVerificationCodeSnippet(report, selectedCodeLang)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}