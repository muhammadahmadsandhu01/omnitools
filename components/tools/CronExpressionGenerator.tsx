"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    Clock,
    Calendar as CalendarIcon,
    Sparkles,
    RotateCcw,
    ShieldCheck,
    ShieldAlert,
    CheckCircle2,
    Copy,
    Check,
    Share2,
    FileSpreadsheet,
    FileCode,
    FileText,
    Wrench,
    ArrowRightLeft,
    Info,
    Terminal,
    Globe,
    SlidersHorizontal,
    AlertTriangle,
    ChevronDown,
} from 'lucide-react';

import {
    CRON_ENGINE_VERSION,
    SUPPORTED_IANA_TIMEZONES,
    analyzeAndSimulateCron,
    autoFixCronPitfalls,
    compileEnglishToCron,
    generateDevOpsConfigSnippet,
    exportCronScheduleIcs,
    exportCronAuditCsv,
    exportCronAuditXlsx,
    getDefaultCronInputs,
    getPresetCronInputs,
    type CronDialectId,
    type CronPresetScenarioId,
    type DevOpsConfigPlatform,
    type CronGeneratorInputs,
    type CronFieldBreakdown,
} from '@/lib/cronGeneratorEngine';

type CronStudioTab =
    | 'timeline_heatmap_collision'
    | 'reliability_linter_14'
    | 'cross_dialect_transpiler'
    | 'devops_config_compiler'
    | 'calendar_audit_exports';

const DIALECT_OPTIONS: { id: CronDialectId; label: string }[] = [
    { id: 'AUTO', label: 'Auto-Detect (All 7 Dialects)' },
    { id: 'UNIX_5', label: 'POSIX / Linux Crontab (5-Field)' },
    { id: 'K8S_CRONJOB', label: 'Kubernetes CronJob (5-Field)' },
    { id: 'GITHUB_ACTIONS', label: 'GitHub Actions (5-Field UTC)' },
    { id: 'SPRING_6', label: 'Spring Boot @Scheduled (6-Field)' },
    { id: 'QUARTZ_6_7', label: 'Java Quartz (6/7-Field)' },
    { id: 'AWS_EVENTBRIDGE_6', label: 'AWS EventBridge (6-Field)' },
    { id: 'JENKINS_HASH', label: 'Jenkins H Hash-Jitter (5-Field)' },
];

const QUICK_CRON_PRESETS: {
    id: CronPresetScenarioId;
    shortLabel: string;
    expressionPreview: string;
    tooltip: string;
}[] = [
        {
            id: 'weekday_business_hours_15m',
            shortLabel: 'Business Hours (15m)',
            expressionPreview: '*/15 9-17 * * 1-5',
            tooltip: 'Every 15 minutes from 09:00 to 17:45, Mon–Fri in UTC (100/100 A+)',
        },
        {
            id: 'vulnerable_cron_pitfalls_demo',
            shortLabel: 'Pitfalls Demo (Auto-Fix)',
            expressionPreview: '* 2 13 * 5',
            tooltip: 'Triggers 6 alerts: minute flood, DOM+DOW OR trap, DST skip, % bug & overlap',
        },
        {
            id: 'nightly_backup_dst_check',
            shortLabel: 'DST 02:15 Backup (NY)',
            expressionPreview: '15 2 * * *',
            tooltip: 'Nightly 02:15 America/New_York Kubernetes backup — flags DST 02:00 skip',
        },
        {
            id: 'quartz_last_weekday_payroll',
            shortLabel: 'Quartz Last Weekday',
            expressionPreview: '0 30 17 LW * ? *',
            tooltip: '7-field Java Quartz payroll job using LW (last weekday) & ? exclusion',
        },
        {
            id: 'aws_eventbridge_3rd_friday',
            shortLabel: 'AWS 3rd Friday',
            expressionPreview: 'cron(15 22 ? * 6#3 *)',
            tooltip: 'AWS EventBridge 6-field expression with 6#3 (3rd Friday in 1–7 indexing)',
        },
        {
            id: 'jenkins_hash_jitter_pipeline',
            shortLabel: 'Jenkins H Jitter',
            expressionPreview: 'H/20 H(0-7) * * 1-5',
            tooltip: 'CRC-32 hash-jittered Jenkins CI schedule to prevent :00 queue spikes',
        },
    ];

const DEVOPS_PLATFORMS: { id: DevOpsConfigPlatform; label: string }[] = [
    { id: 'k8s_cronjob_yaml', label: 'Kubernetes YAML' },
    { id: 'systemd_timer_unit', label: 'systemd .timer' },
    { id: 'linux_crontab_flock', label: 'Linux flock' },
    { id: 'github_actions_yaml', label: 'GitHub Actions' },
    { id: 'aws_eventbridge_terraform', label: 'AWS Terraform' },
    { id: 'vercel_cron_json', label: 'Vercel JSON' },
    { id: 'cloudflare_wrangler_toml', label: 'Cloudflare TOML' },
    { id: 'nodejs_croner_ts', label: 'Node.js (croner)' },
    { id: 'python_celery_apscheduler', label: 'Python Celery' },
    { id: 'go_spring_laravel', label: 'Go & Spring Boot' },
];

const VISUAL_FIELD_QUICK_CHIPS: Record<
    CronFieldBreakdown['fieldKey'],
    { label: string; token: string }[]
> = {
    seconds: [
        { label: 'At :00s (0)', token: '0' },
        { label: 'Every Second (*)', token: '*' },
        { label: 'Every 10s (*/10)', token: '*/10' },
        { label: 'Every 15s (*/15)', token: '*/15' },
        { label: 'Every 30s (*/30)', token: '*/30' },
    ],
    minutes: [
        { label: 'At :00 (0)', token: '0' },
        { label: 'Staggered :07 (7)', token: '7' },
        { label: 'Every Minute (*)', token: '*' },
        { label: 'Every 5m (*/5)', token: '*/5' },
        { label: 'Every 10m (*/10)', token: '*/10' },
        { label: 'Every 15m (*/15)', token: '*/15' },
        { label: 'Every 30m (*/30)', token: '*/30' },
        { label: 'Jenkins Jitter (H/15)', token: 'H/15' },
    ],
    hours: [
        { label: 'Every Hour (*)', token: '*' },
        { label: 'Midnight (0)', token: '0' },
        { label: '02:00 AM (2)', token: '2' },
        { label: '09:00 AM (9)', token: '9' },
        { label: 'Noon (12)', token: '12' },
        { label: 'Business Hours (9-17)', token: '9-17' },
        { label: 'Every 4 Hours (*/4)', token: '*/4' },
        { label: 'Every 6 Hours (*/6)', token: '*/6' },
    ],
    dayOfMonth: [
        { label: 'Every Day (*)', token: '*' },
        { label: '1st of Month (1)', token: '1' },
        { label: '1st & 15th (1,15)', token: '1,15' },
        { label: 'Last Day (L)', token: 'L' },
        { label: 'Last Weekday (LW)', token: 'LW' },
        { label: 'Nearest Weekday 15th (15W)', token: '15W' },
        { label: 'Quartz/AWS Excluded (?)', token: '?' },
    ],
    month: [
        { label: 'Every Month (*)', token: '*' },
        { label: 'Quarterly (1,4,7,10)', token: '1,4,7,10' },
        { label: 'Half-Yearly (1,7)', token: '1,7' },
        { label: 'January Only (1)', token: '1' },
        { label: 'December Only (12)', token: '12' },
    ],
    dayOfWeek: [
        { label: 'Every Weekday (*)', token: '*' },
        { label: 'Mon–Fri POSIX (1-5)', token: '1-5' },
        { label: 'Mon–Fri Symbolic (MON-FRI)', token: 'MON-FRI' },
        { label: 'Weekends POSIX (0,6)', token: '0,6' },
        { label: 'Sunday POSIX (0)', token: '0' },
        { label: '3rd Friday Quartz/AWS (6#3)', token: '6#3' },
        { label: 'Last Friday Quartz/AWS (6L)', token: '6L' },
        { label: 'Quartz/AWS Excluded (?)', token: '?' },
    ],
    year: [
        { label: 'Every Year (*)', token: '*' },
        { label: '2026 Only (2026)', token: '2026' },
        { label: '2026–2028 (2026-2028)', token: '2026-2028' },
    ],
};

function formatGhaBudgetPercent(pct: number): string {
    return pct >= 999 ? '999%+' : `${pct}%`;
}

function getLiveReferenceTimestampMs(fallbackMs: number | null): number | null {
    return typeof window !== 'undefined' ? Date.now() : fallbackMs;
}

export default function CronExpressionGenerator() {
    // Pre-load a clean weekday schedule so first-time users see live plain-English output immediately
    const [activePresetId, setActivePresetId] = useState<CronPresetScenarioId | null>(
        'weekday_business_hours_15m'
    );
    const [inputs, setInputs] = useState<CronGeneratorInputs>(
        () => getPresetCronInputs('weekday_business_hours_15m').inputs
    );
    const [activeFieldEditorKey, setActiveFieldEditorKey] =
        useState<CronFieldBreakdown['fieldKey'] | null>(null);
    const [activeStudioTab, setActiveStudioTab] =
        useState<CronStudioTab>('timeline_heatmap_collision');
    const [selectedDevOpsPlatform, setSelectedDevOpsPlatform] =
        useState<DevOpsConfigPlatform>('k8s_cronjob_yaml');
    const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [statusNotice, setStatusNotice] = useState<string | null>(null);
    const [englishError, setEnglishError] = useState<string | null>(null);

    const deepDiveRef = useRef<HTMLDivElement | null>(null);

    // Sync reference timestamp to live browser clock on mount (SSR-safe) and hydrate shared URL params
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const nowMs = Date.now();
        const params = new URLSearchParams(window.location.search);
        const sharedCron = params.get('cron');
        const sharedTz = params.get('tz');

        setInputs((prev) => ({
            ...prev,
            referenceTimestampMs: nowMs,
            ...(sharedCron && sharedCron.trim()
                ? {
                    rawExpressionInput: sharedCron.trim(),
                    selectedDialect: 'AUTO' as CronDialectId,
                }
                : {}),
            ...(sharedTz && SUPPORTED_IANA_TIMEZONES.some((t) => t.id === sharedTz)
                ? { targetTimezone: sharedTz }
                : {}),
        }));
        if (sharedCron && sharedCron.trim()) {
            setActivePresetId(null);
        }
    }, []);

    const report = useMemo(() => analyzeAndSimulateCron(inputs), [inputs]);

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

    const handleSelectPreset = (presetId: CronPresetScenarioId) => {
        const presetData = getPresetCronInputs(presetId);
        const nowMs = getLiveReferenceTimestampMs(presetData.inputs.referenceTimestampMs);
        setActivePresetId(presetId);
        setEnglishError(null);
        setInputs({
            ...presetData.inputs,
            referenceTimestampMs: nowMs,
        });
        if (presetId === 'vulnerable_cron_pitfalls_demo') {
            setActiveStudioTab('reliability_linter_14');
            setShowAdvancedSettings(true);
        } else if (presetId === 'jenkins_hash_jitter_pipeline') {
            setShowAdvancedSettings(true);
        } else if (presetId === 'nightly_backup_dst_check') {
            setActiveStudioTab('timeline_heatmap_collision');
        }
        setStatusNotice(presetData.description);
    };

    const handleResetToZero = () => {
        const defaults = getDefaultCronInputs();
        const nowMs = getLiveReferenceTimestampMs(defaults.referenceTimestampMs);
        setActivePresetId(null);
        setActiveFieldEditorKey(null);
        setEnglishError(null);
        setInputs({
            ...defaults,
            referenceTimestampMs: nowMs,
        });
        setStatusNotice(
            'Workspace cleared. Type any 5-, 6-, or 7-field cron expression, enter plain English, or click a preset.'
        );
    };

    const handleAutoFix = () => {
        if (report.isIdleEmpty) return;
        const { nextInputs, fixSummary } = autoFixCronPitfalls(inputs);
        setEnglishError(null);
        setInputs(nextInputs);
        setStatusNotice(fixSummary);
    };

    const handleCompileNaturalLanguage = () => {
        const q = inputs.naturalLanguageQuery.trim();
        const targetDialect =
            inputs.selectedDialect === 'AUTO' ? 'UNIX_5' : inputs.selectedDialect;
        const compiled = compileEnglishToCron(q, targetDialect);
        if (compiled.isValidEnglish === false || compiled.errorMessage) {
            setEnglishError(
                compiled.errorMessage ||
                'Could not recognize a valid schedule pattern. Try e.g. "every 15 mins during business hours on weekdays".'
            );
            return;
        }
        setEnglishError(null);
        setActivePresetId(null);
        setInputs((prev) => ({
            ...prev,
            rawExpressionInput: compiled.cronExpression,
            selectedDialect:
                compiled.cronExpression.split(/\s+/).length >= 6 ? 'AUTO' : prev.selectedDialect,
        }));
        setStatusNotice(`${compiled.matchedRuleSummary} → "${compiled.cronExpression}"`);
    };

    const handleDetectBrowserTimezone = () => {
        try {
            const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (detected) {
                setInputs((prev) => ({ ...prev, targetTimezone: detected }));
                setStatusNotice(`Switched evaluation timezone to "${detected}".`);
            }
        } catch {
            setStatusNotice('Could not detect browser timezone; defaulting to UTC.');
        }
    };

    const handleUpdateSingleFieldToken = (
        fieldKey: CronFieldBreakdown['fieldKey'],
        newTokenValue: string
    ) => {
        const baseExpr = report.isIdleEmpty ? '0 2 * * *' : report.cleanCronExpression;
        const toks = baseExpr.split(/\s+/);
        const dialect = report.isIdleEmpty
            ? inputs.selectedDialect === 'AUTO'
                ? 'UNIX_5'
                : inputs.selectedDialect
            : report.detectedDialect;

        let sec = '0';
        let min = '0';
        let hour = '2';
        let dom = '*';
        let month = '*';
        let dow = '*';
        let year = '*';

        if (toks.length === 5) {
            [min, hour, dom, month, dow] = toks;
        } else if (toks.length === 6) {
            if (dialect === 'AWS_EVENTBRIDGE_6') {
                [min, hour, dom, month, dow, year] = toks;
            } else {
                [sec, min, hour, dom, month, dow] = toks;
            }
        } else if (toks.length >= 7) {
            [sec, min, hour, dom, month, dow, year] = toks;
        }

        if (fieldKey === 'seconds') sec = newTokenValue;
        else if (fieldKey === 'minutes') min = newTokenValue;
        else if (fieldKey === 'hours') hour = newTokenValue;
        else if (fieldKey === 'dayOfMonth') dom = newTokenValue;
        else if (fieldKey === 'month') month = newTokenValue;
        else if (fieldKey === 'dayOfWeek') dow = newTokenValue;
        else if (fieldKey === 'year') year = newTokenValue;

        let nextDialect = dialect;
        if (
            (fieldKey === 'dayOfMonth' || fieldKey === 'dayOfWeek') &&
            /L|W|#|\?/.test(newTokenValue) &&
            nextDialect !== 'QUARTZ_6_7' &&
            nextDialect !== 'AWS_EVENTBRIDGE_6'
        ) {
            nextDialect = 'QUARTZ_6_7';
            if (fieldKey === 'dayOfMonth' && dow === '*') dow = '?';
            if (fieldKey === 'dayOfWeek' && dom === '*') dom = '?';
        } else if (/H/i.test(newTokenValue)) {
            nextDialect = 'JENKINS_HASH';
        } else if (fieldKey === 'seconds' && nextDialect === 'UNIX_5') {
            nextDialect = 'SPRING_6';
        } else if (fieldKey === 'year' && nextDialect === 'UNIX_5') {
            nextDialect = 'QUARTZ_6_7';
        }

        let nextExpr = `${min} ${hour} ${dom} ${month} ${dow}`;
        if (nextDialect === 'SPRING_6') {
            nextExpr = `${sec} ${min} ${hour} ${dom} ${month} ${dow}`;
        } else if (nextDialect === 'QUARTZ_6_7') {
            nextExpr = `${sec} ${min} ${hour} ${dom} ${month} ${dow} ${year}`;
        } else if (nextDialect === 'AWS_EVENTBRIDGE_6') {
            nextExpr = `${min} ${hour} ${dom} ${month} ${dow} ${year}`;
        }

        setActivePresetId(null);
        setInputs((prev) => ({
            ...prev,
            rawExpressionInput: nextExpr,
            selectedDialect: nextDialect,
        }));
    };

    const handleJumpToTab = (tab: CronStudioTab) => {
        setActiveStudioTab(tab);
        deepDiveRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleDownloadIcs = () => {
        const ics = exportCronScheduleIcs(report);
        const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kivarotools-cron-schedule-${report.detectedDialect.toLowerCase()}.ics`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
    };

    const handleDownloadCsv = () => {
        const csv = exportCronAuditCsv(report);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kivarotools-cron-schedule-audit-${report.detectedDialect.toLowerCase()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
    };

    const handleDownloadXlsx = () => {
        const bytes = exportCronAuditXlsx(report);
        const ab = new ArrayBuffer(bytes.byteLength);
        new Uint8Array(ab).set(bytes);
        const blob = new Blob([ab], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kivarotools-cron-schedule-audit-${report.detectedDialect.toLowerCase()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
    };

    const handleDownloadJson = () => {
        const json = JSON.stringify(report, null, 2);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kivarotools-cron-simulation-${report.detectedDialect.toLowerCase()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
    };

    const handleCopyShareLink = () => {
        if (typeof window === 'undefined') return;
        const url = new URL(window.location.href);
        if (!report.isIdleEmpty) {
            url.searchParams.set('cron', report.cleanCronExpression);
            url.searchParams.set('tz', inputs.targetTimezone);
        }
        copyText(url.toString(), 'share_link');
    };

    const activeConfigSnippet = useMemo(
        () =>
            generateDevOpsConfigSnippet(
                report,
                selectedDevOpsPlatform,
                inputs.targetTimezone,
                inputs.shellCommandToExecute
            ),
        [report, selectedDevOpsPlatform, inputs.targetTimezone, inputs.shellCommandToExecute]
    );

    const isLoaded = !report.isIdleEmpty;
    const springAnnotationText = `@Scheduled(cron = "${report.crossDialectTranslations.spring6Scheduled}", zone = "${inputs.targetTimezone}")`;
    const activeFieldBreakdown = activeFieldEditorKey
        ? report.fieldBreakdowns.find((f) => f.fieldKey === activeFieldEditorKey) || null
        : null;

    return (
        <div className="space-y-6 w-full min-w-0 max-w-full overflow-x-hidden text-slate-900 dark:text-slate-100">
            {/* ============================================================================
          1. COMPACT TOP CONTROL BAR (Dialect, Timezone, Share, Reset — Zero Clutter)
          ============================================================================ */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-end text-xs">
                <div className="md:col-span-4 space-y-1 min-w-0">
                    <label
                        htmlFor="kivaro-cron-dialect"
                        className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                    >
                        Cron Dialect
                    </label>
                    <select
                        id="kivaro-cron-dialect"
                        value={inputs.selectedDialect}
                        onChange={(e) =>
                            setInputs((prev) => ({
                                ...prev,
                                selectedDialect: e.target.value as CronDialectId,
                            }))
                        }
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {DIALECT_OPTIONS.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-5 space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <label
                            htmlFor="kivaro-cron-tz"
                            className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                        >
                            Timezone ({SUPPORTED_IANA_TIMEZONES.length} IANA)
                        </label>
                        <button
                            type="button"
                            onClick={handleDetectBrowserTimezone}
                            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                        >
                            Use Local TZ
                        </button>
                    </div>
                    <select
                        id="kivaro-cron-tz"
                        value={inputs.targetTimezone}
                        onChange={(e) =>
                            setInputs((prev) => ({ ...prev, targetTimezone: e.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {!SUPPORTED_IANA_TIMEZONES.some((tz) => tz.id === inputs.targetTimezone) && (
                            <option value={inputs.targetTimezone}>
                                {inputs.targetTimezone} (Browser Local)
                            </option>
                        )}
                        {SUPPORTED_IANA_TIMEZONES.map((tz) => (
                            <option key={tz.id} value={tz.id}>
                                {tz.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-3 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={handleCopyShareLink}
                        className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-400 transition cursor-pointer"
                    >
                        {copiedId === 'share_link' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                            <Share2 className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>{copiedId === 'share_link' ? 'Copied' : 'Share'}</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleResetToZero}
                        className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-rose-400 transition cursor-pointer"
                        title="Clear expression and reset workspace"
                    >
                        <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                        <span>Reset</span>
                    </button>
                </div>
            </div>

            {/* ============================================================================
          2. ICONIC CENTERED CRON HERO STAGE (Crontab.guru Simplicity + Enterprise Power)
          ============================================================================ */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-50/90 to-white dark:from-slate-950/80 dark:to-slate-900 p-5 sm:p-7 shadow-xs space-y-5">
                {/* Status Row + Score + Auto-Fix */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${!isLoaded
                                    ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                    : !report.isValidSyntax || report.criticalFindingsCount > 0
                                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                                        : report.warningFindingsCount > 0
                                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                }`}
                        >
                            {isLoaded && report.isValidSyntax && report.criticalFindingsCount === 0 ? (
                                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                            ) : isLoaded ? (
                                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                            ) : (
                                <Clock className="w-3.5 h-3.5 shrink-0" />
                            )}
                            <span>
                                {!isLoaded
                                    ? 'Ready'
                                    : !report.isValidSyntax
                                        ? 'Syntax Error'
                                        : `${report.reliabilityScore}/100 (${report.reliabilityGrade})`}
                            </span>
                        </span>

                        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {isLoaded ? report.detectedDialect : 'AUTO'}
                        </span>

                        {report.expandedMacroFrom && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                                Expanded {report.expandedMacroFrom}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {report.lintFindings.length > 0 && (
                            <button
                                type="button"
                                onClick={handleAutoFix}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-2xs transition cursor-pointer"
                            >
                                <Wrench className="w-3.5 h-3.5 shrink-0" />
                                <span>Auto-Fix ({report.lintFindings.length})</span>
                            </button>
                        )}
                        <span className="text-[11px] font-mono text-slate-400">
                            v{CRON_ENGINE_VERSION}
                        </span>
                    </div>
                </div>

                {/* Large Plain-English Meaning */}
                <div aria-live="polite" className="text-center space-y-1.5 max-w-3xl mx-auto">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-snug break-words">
                        &ldquo;{report.plainEnglishDescription}&rdquo;
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                        <span>
                            Next:{' '}
                            <strong className="font-mono text-emerald-700 dark:text-emerald-400">
                                {report.upcomingRuns[0]
                                    ? `${report.upcomingRuns[0].targetTimezoneFormatted} (${report.upcomingRuns[0].relativeDeltaLabel})`
                                    : '—'}
                            </strong>
                        </span>
                        {isLoaded && (
                            <>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono">
                                    {report.frequencyBudget.runsPerDay}/day ({report.frequencyBudget.runsPerMonth30d}/mo)
                                </span>
                                <span aria-hidden="true">·</span>
                                <span
                                    className={`font-semibold ${report.dstHazard.springForwardSkipRisk
                                            ? 'text-amber-600 dark:text-amber-400'
                                            : 'text-emerald-600 dark:text-emerald-400'
                                        }`}
                                >
                                    {report.dstHazard.springForwardSkipRisk ? 'DST 02:00 Skip Risk' : 'DST-Safe'}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Giant Centered Cron Input + Primary Copy Actions */}
                <div className="max-w-3xl mx-auto space-y-2.5">
                    <label htmlFor="kivaro-cron-input" className="sr-only">
                        Cron expression input
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            id="kivaro-cron-input"
                            type="text"
                            value={inputs.rawExpressionInput}
                            onChange={(e) => {
                                setActivePresetId(null);
                                setInputs((prev) => ({ ...prev, rawExpressionInput: e.target.value }));
                            }}
                            placeholder="*/15 9-17 * * 1-5   or   0 30 17 LW * ? *   or   cron(15 22 ? * 6#3 *)"
                            className={`min-w-0 flex-1 rounded-2xl border-2 px-4 py-3.5 text-center text-lg sm:text-2xl font-mono font-extrabold tracking-wide text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition ${isLoaded && !report.isValidSyntax
                                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 focus:ring-rose-500'
                                    : 'border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-950 focus:border-indigo-500 focus:ring-indigo-500/30'
                                }`}
                        />
                        <div className="flex gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => copyText(report.cleanCronExpression, 'copy_cron')}
                                disabled={!isLoaded}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 shadow-xs transition cursor-pointer"
                            >
                                {copiedId === 'copy_cron' ? (
                                    <Check className="w-4 h-4 text-emerald-300" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                                <span>{copiedId === 'copy_cron' ? 'Copied!' : 'Copy'}</span>
                            </button>

                            {(inputs.selectedDialect === 'SPRING_6' || report.detectedDialect === 'SPRING_6') && (
                                <button
                                    type="button"
                                    onClick={() => copyText(springAnnotationText, 'copy_spring_anno')}
                                    disabled={!isLoaded}
                                    title={springAnnotationText}
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 shadow-xs transition cursor-pointer"
                                >
                                    {copiedId === 'copy_spring_anno' ? (
                                        <Check className="w-4 h-4 text-white" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                    <span>
                                        {copiedId === 'copy_spring_anno' ? 'Copied!' : '@Scheduled'}
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Inline Syntax Error Banner */}
                    {isLoaded && !report.isValidSyntax && report.syntaxErrorMessage && (
                        <div
                            role="alert"
                            className="rounded-xl border border-rose-300 dark:border-rose-900/80 bg-rose-50/90 dark:bg-rose-950/40 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-rose-900 dark:text-rose-200"
                        >
                            <div className="flex items-start gap-2 min-w-0 flex-1">
                                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                                <span className="font-medium break-words">{report.syntaxErrorMessage}</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleAutoFix}
                                className="px-3 py-1 rounded-lg text-[11px] font-bold bg-rose-600 hover:bg-rose-500 text-white shrink-0 cursor-pointer"
                            >
                                Auto-Fix Syntax
                            </button>
                        </div>
                    )}

                    {/* Interactive Crontab.guru-Style Field Pills (Click Any Field to Edit!) */}
                    {isLoaded && report.fieldBreakdowns.length > 0 && (
                        <div className="pt-1 space-y-2.5">
                            <div
                                className="flex flex-wrap items-center justify-center gap-2"
                                role="group"
                                aria-label="Interactive Cron Fields — click any field to edit"
                            >
                                {report.fieldBreakdowns.map((fb) => {
                                    const isSelected = activeFieldEditorKey === fb.fieldKey;
                                    return (
                                        <button
                                            key={fb.fieldKey}
                                            type="button"
                                            aria-pressed={isSelected}
                                            onClick={() =>
                                                setActiveFieldEditorKey((prev) =>
                                                    prev === fb.fieldKey ? null : fb.fieldKey
                                                )
                                            }
                                            className={`px-3 py-2 rounded-xl border text-center transition cursor-pointer min-w-[82px] ${isSelected
                                                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400'
                                                }`}
                                        >
                                            <div
                                                className={`font-mono text-sm font-extrabold ${isSelected ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'
                                                    }`}
                                            >
                                                {fb.rawToken}
                                            </div>
                                            <div
                                                className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
                                                    }`}
                                            >
                                                {fb.label}
                                            </div>
                                        </button>
                                    );
                                })}

                                {/* Quick-add optional Seconds / Year buttons when in 5-field mode */}
                                {!report.fieldBreakdowns.some((f) => f.fieldKey === 'seconds') && (
                                    <button
                                        type="button"
                                        aria-pressed={activeFieldEditorKey === 'seconds'}
                                        onClick={() =>
                                            setActiveFieldEditorKey((prev) =>
                                                prev === 'seconds' ? null : 'seconds'
                                            )
                                        }
                                        className={`px-2.5 py-2 rounded-xl border border-dashed text-center text-[11px] font-semibold transition cursor-pointer ${activeFieldEditorKey === 'seconds'
                                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                                : 'border-slate-300 dark:border-slate-700 text-slate-500 hover:border-indigo-400'
                                            }`}
                                    >
                                        + Seconds
                                    </button>
                                )}
                                {!report.fieldBreakdowns.some((f) => f.fieldKey === 'year') && (
                                    <button
                                        type="button"
                                        aria-pressed={activeFieldEditorKey === 'year'}
                                        onClick={() =>
                                            setActiveFieldEditorKey((prev) =>
                                                prev === 'year' ? null : 'year'
                                            )
                                        }
                                        className={`px-2.5 py-2 rounded-xl border border-dashed text-center text-[11px] font-semibold transition cursor-pointer ${activeFieldEditorKey === 'year'
                                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                                : 'border-slate-300 dark:border-slate-700 text-slate-500 hover:border-indigo-400'
                                            }`}
                                    >
                                        + Year
                                    </button>
                                )}
                            </div>

                            {/* Focused Field Editor Drawer (Opens only when user clicks a field pill!) */}
                            {activeFieldEditorKey && (
                                <div className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/30 p-3.5 space-y-2.5 text-xs">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="space-y-0.5 min-w-0">
                                            <div className="font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                                                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                                <span>
                                                    Editing:{' '}
                                                    {activeFieldBreakdown
                                                        ? `${activeFieldBreakdown.label} (${activeFieldBreakdown.humanSummary})`
                                                        : activeFieldEditorKey === 'seconds'
                                                            ? 'Seconds (Switches to 6-Field Spring/Quartz)'
                                                            : 'Year (Switches to 7-Field Quartz/AWS)'}
                                                </span>
                                            </div>
                                            {activeFieldBreakdown && (
                                                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 break-all">
                                                    Matched: [{activeFieldBreakdown.expandedSampleValues}] · Allowed:{' '}
                                                    {activeFieldBreakdown.allowedRangeLabel}
                                                    {activeFieldBreakdown.rawToken !==
                                                        activeFieldBreakdown.resolvedTokenAfterHash && (
                                                            <span className="text-purple-600 dark:text-purple-400 ml-1">
                                                                (CRC-32 → {activeFieldBreakdown.resolvedTokenAfterHash})
                                                            </span>
                                                        )}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setActiveFieldEditorKey(null)}
                                            className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer shrink-0"
                                        >
                                            Close
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                        {VISUAL_FIELD_QUICK_CHIPS[activeFieldEditorKey].map((chip) => (
                                            <button
                                                key={chip.token}
                                                type="button"
                                                onClick={() =>
                                                    handleUpdateSingleFieldToken(activeFieldEditorKey, chip.token)
                                                }
                                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                                            >
                                                {chip.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quick Macros + systemd OnCalendar= 1-Line Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-slate-400">Macros:</span>
                            {(['@hourly', '@daily', '@weekly', '@monthly'] as const).map((mac) => (
                                <button
                                    key={mac}
                                    type="button"
                                    onClick={() => {
                                        setActivePresetId(null);
                                        setInputs((prev) => ({ ...prev, rawExpressionInput: mac }));
                                    }}
                                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 font-mono text-[11px] cursor-pointer"
                                >
                                    {mac}
                                </button>
                            ))}
                        </div>

                        {isLoaded && report.isValidSyntax && (
                            <div className="flex flex-wrap items-center gap-2 min-w-0">
                                <code className="text-[11px] font-mono font-semibold text-indigo-700 dark:text-indigo-300 truncate max-w-[260px] sm:max-w-none">
                                    {report.crossDialectTranslations.systemdOnCalendar}
                                </code>
                                <button
                                    type="button"
                                    onClick={() =>
                                        copyText(report.crossDialectTranslations.systemdOnCalendar, 'quick_systemd')
                                    }
                                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-950 text-[11px] font-bold text-slate-700 dark:text-slate-200 cursor-pointer shrink-0"
                                >
                                    {copiedId === 'quick_systemd' ? 'Copied!' : 'Copy OnCalendar'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleJumpToTab('cross_dialect_transpiler')}
                                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer shrink-0"
                                >
                                    All 7 Dialects →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {statusNotice && (
                <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/80 bg-indigo-50/70 dark:bg-indigo-950/40 px-3.5 py-2.5 flex items-start sm:items-center justify-between gap-3 text-xs text-indigo-950 dark:text-indigo-200">
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

            {/* ============================================================================
          3. SLIM HELPERS BAR: PLAIN ENGLISH TO CRON + 6 QUICK PRESETS + ADVANCED TOGGLE
          ============================================================================ */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4 shadow-2xs">
                {/* Plain English Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <label
                        htmlFor="kivaro-english-cron"
                        className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shrink-0"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Plain English:</span>
                    </label>
                    <div className="flex gap-2 flex-1 min-w-0">
                        <input
                            id="kivaro-english-cron"
                            type="text"
                            value={inputs.naturalLanguageQuery}
                            onChange={(e) => {
                                setEnglishError(null);
                                setInputs((prev) => ({ ...prev, naturalLanguageQuery: e.target.value }));
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCompileNaturalLanguage();
                            }}
                            placeholder='Type e.g. "every 10 minutes on weekdays" or "last weekday of every month at 5:30 PM"'
                            className={`min-w-0 flex-1 rounded-xl border px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 ${englishError
                                    ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/20 focus:ring-rose-500'
                                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 focus:ring-indigo-500'
                                }`}
                        />
                        <button
                            type="button"
                            onClick={handleCompileNaturalLanguage}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shrink-0 transition cursor-pointer"
                        >
                            Convert
                        </button>
                    </div>
                </div>

                {englishError && (
                    <div
                        role="alert"
                        className="rounded-xl border border-rose-300 dark:border-rose-900/80 bg-rose-50/90 dark:bg-rose-950/40 px-3 py-2 flex items-start justify-between gap-2 text-xs text-rose-900 dark:text-rose-200"
                    >
                        <div className="flex items-start gap-1.5 min-w-0">
                            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                            <span className="break-words">{englishError}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setEnglishError(null)}
                            className="text-[11px] font-bold text-rose-700 dark:text-rose-300 hover:underline shrink-0 cursor-pointer"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Compact 1-Line Scenario Presets + Advanced Options Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                            Presets:
                        </span>
                        {QUICK_CRON_PRESETS.map((preset) => {
                            const isSelected = activePresetId === preset.id;
                            return (
                                <button
                                    key={preset.id}
                                    type="button"
                                    title={`${preset.expressionPreview} — ${preset.tooltip}`}
                                    aria-pressed={isSelected}
                                    onClick={() => handleSelectPreset(preset.id)}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${isSelected
                                            ? 'border-indigo-600 bg-indigo-600 text-white'
                                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                                        }`}
                                >
                                    {preset.shortLabel}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        aria-expanded={showAdvancedSettings}
                        onClick={() => setShowAdvancedSettings((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer shrink-0"
                    >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Advanced Options</span>
                        <ChevronDown
                            className={`w-3.5 h-3.5 shrink-0 transition-transform ${showAdvancedSettings ? 'rotate-180' : ''
                                }`}
                        />
                    </button>
                </div>

                {/* Collapsible Advanced Simulation Settings (Duration, Shell Cmd, 2-Job Collision, Jenkins Seed) */}
                {showAdvancedSettings && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <div className="space-y-1 min-w-0">
                            <label
                                htmlFor="kivaro-cron-duration"
                                className="block font-bold text-slate-600 dark:text-slate-300"
                            >
                                Estimated Job Duration (Seconds)
                            </label>
                            <input
                                id="kivaro-cron-duration"
                                type="number"
                                min={1}
                                max={86400}
                                value={inputs.estimatedJobDurationSeconds}
                                onChange={(e) =>
                                    setInputs((prev) => ({
                                        ...prev,
                                        estimatedJobDurationSeconds: Math.max(1, Number(e.target.value) || 1),
                                    }))
                                }
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 px-3 py-2 font-mono text-xs"
                            />
                        </div>

                        <div className="space-y-1 min-w-0">
                            <label
                                htmlFor="kivaro-cron-shell"
                                className="block font-bold text-slate-600 dark:text-slate-300"
                            >
                                Crontab Shell Command (Audits % &amp; PATH)
                            </label>
                            <input
                                id="kivaro-cron-shell"
                                type="text"
                                value={inputs.shellCommandToExecute}
                                onChange={(e) =>
                                    setInputs((prev) => ({ ...prev, shellCommandToExecute: e.target.value }))
                                }
                                placeholder="/usr/local/bin/backup-db.sh"
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 px-3 py-2 font-mono text-xs"
                            />
                        </div>

                        <div className="space-y-1 min-w-0 sm:col-span-2 lg:col-span-1">
                            <label
                                htmlFor="kivaro-cron-secondary"
                                className="block font-bold text-slate-600 dark:text-slate-300"
                            >
                                Secondary Cron (Collision) &amp; Jenkins Seed
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="kivaro-cron-secondary"
                                    type="text"
                                    value={inputs.secondaryCronExpression}
                                    onChange={(e) =>
                                        setInputs((prev) => ({
                                            ...prev,
                                            secondaryCronExpression: e.target.value,
                                        }))
                                    }
                                    placeholder="Secondary e.g. 0 2 * * *"
                                    className="min-w-0 flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 px-2.5 py-2 font-mono text-xs"
                                />
                                <input
                                    id="kivaro-jenkins-seed"
                                    aria-label="Jenkins H CRC-32 Job Name Seed"
                                    type="text"
                                    value={inputs.jenkinsJobNameSeed}
                                    onChange={(e) =>
                                        setInputs((prev) => ({
                                            ...prev,
                                            jenkinsJobNameSeed: e.target.value,
                                        }))
                                    }
                                    placeholder="Jenkins Seed"
                                    title="Jenkins H CRC-32 Job Name Seed"
                                    className="w-28 sm:w-32 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 px-2.5 py-2 font-mono text-xs shrink-0"
                                />
                            </div>
                            {report.secondaryCronError && (
                                <div
                                    role="alert"
                                    className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 pt-0.5"
                                >
                                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                    <span className="break-words">{report.secondaryCronError}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ============================================================================
          4. DEEP-DIVE STUDIO TABS (All 5 Enterprise Tools Cleanly Organized)
          ============================================================================ */}
            <div
                ref={deepDiveRef}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden"
            >
                <div
                    role="tablist"
                    aria-label="Cron Schedule Analysis Views"
                    className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 p-2 flex flex-wrap gap-1.5"
                >
                    {(
                        [
                            {
                                id: 'timeline_heatmap_collision' as CronStudioTab,
                                icon: CalendarIcon,
                                label: 'Next 15 Runs & Heatmap',
                            },
                            {
                                id: 'reliability_linter_14' as CronStudioTab,
                                icon: ShieldAlert,
                                label: `14-Rule Linter (${report.lintFindings.length})`,
                            },
                            {
                                id: 'cross_dialect_transpiler' as CronStudioTab,
                                icon: ArrowRightLeft,
                                label: '7-Dialect & systemd',
                            },
                            {
                                id: 'devops_config_compiler' as CronStudioTab,
                                icon: Terminal,
                                label: 'DevOps Configs (10)',
                            },
                            {
                                id: 'calendar_audit_exports' as CronStudioTab,
                                icon: FileSpreadsheet,
                                label: 'Export .ICS / .XLSX',
                            },
                        ] as const
                    ).map((tab) => {
                        const Icon = tab.icon;
                        const isSelected = activeStudioTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                id={`tab-${tab.id}`}
                                aria-selected={isSelected}
                                aria-controls={`panel-${tab.id}`}
                                onClick={() => setActiveStudioTab(tab.id)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${isSelected
                                        ? 'bg-indigo-600 text-white shadow-2xs'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5 shrink-0" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                    {/* TAB 1: NEXT 15 RUNS TIMELINE, 6-REGION WORLD CLOCK & CALENDAR HEATMAP */}
                    {activeStudioTab === 'timeline_heatmap_collision' && (
                        <div
                            role="tabpanel"
                            id="panel-timeline_heatmap_collision"
                            aria-labelledby="tab-timeline_heatmap_collision"
                            className="space-y-6"
                        >
                            {!isLoaded ? (
                                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-500">
                                    Enter a cron expression or click a preset above to preview the next 15 runs,
                                    6-region world clock, and monthly calendar heatmap.
                                </div>
                            ) : (
                                <>
                                    {/* Compact Cadence & Compute Strip */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-3">
                                            <div className="text-[11px] font-semibold text-slate-500">
                                                Min Interval &amp; Duration
                                            </div>
                                            <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                                                {report.frequencyBudget.minIntervalHumanLabel} ·{' '}
                                                {report.frequencyBudget.estimatedJobDurationSeconds}s job
                                            </div>
                                        </div>
                                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-3">
                                            <div className="text-[11px] font-semibold text-slate-500">
                                                Monthly CI/CD Compute Budget
                                            </div>
                                            <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                                                {report.frequencyBudget.monthlyComputeMinutes}m/mo (
                                                {formatGhaBudgetPercent(
                                                    report.frequencyBudget.githubActionsFreeTierPercent
                                                )}{' '}
                                                GHA)
                                            </div>
                                        </div>
                                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-3">
                                            <div className="text-[11px] font-semibold text-slate-500">
                                                DST Transition Audit
                                            </div>
                                            <div
                                                className={`font-semibold mt-0.5 truncate ${report.dstHazard.springForwardSkipRisk
                                                        ? 'text-amber-600 dark:text-amber-400'
                                                        : 'text-emerald-600 dark:text-emerald-400'
                                                    }`}
                                                title={report.dstHazard.hazardExplanation}
                                            >
                                                {report.dstHazard.springForwardSkipRisk
                                                    ? '02:00 DST Skip Hazard'
                                                    : 'No DST 02:00 Hazard'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Next 15 Scheduled Runs Table (Primary Output First) */}
                                    <div className="space-y-2">
                                        <div className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                            Upcoming 15 Scheduled Executions ({inputs.targetTimezone} &amp; UTC)
                                        </div>
                                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                                            <table className="w-full text-left border-collapse text-xs">
                                                <thead>
                                                    <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-500">
                                                        <th className="py-2.5 px-3">#</th>
                                                        <th className="py-2.5 px-3">
                                                            Target ({inputs.targetTimezone})
                                                        </th>
                                                        <th className="py-2.5 px-3">UTC ISO-8601</th>
                                                        <th className="py-2.5 px-3">Relative</th>
                                                        <th className="py-2.5 px-3">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                                    {report.upcomingRuns.map((run) => (
                                                        <tr
                                                            key={run.runIndex}
                                                            className={
                                                                run.collidesWithSecondaryJob
                                                                    ? 'bg-rose-50/70 dark:bg-rose-950/30'
                                                                    : ''
                                                            }
                                                        >
                                                            <td className="py-2 px-3 font-mono font-bold">
                                                                {run.runIndex}
                                                            </td>
                                                            <td className="py-2 px-3 font-mono font-bold text-slate-900 dark:text-white">
                                                                {run.targetTimezoneFormatted}
                                                            </td>
                                                            <td className="py-2 px-3 font-mono text-slate-600 dark:text-slate-300">
                                                                {run.utcIsoString}
                                                            </td>
                                                            <td className="py-2 px-3 font-mono text-indigo-600 dark:text-indigo-400">
                                                                {run.relativeDeltaLabel}
                                                            </td>
                                                            <td className="py-2 px-3">
                                                                {run.collidesWithSecondaryJob ? (
                                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                                                                        Collision
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                                                        Clean
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* 6-Region Global World Clock Matrix */}
                                    <div className="space-y-2.5">
                                        <div className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                            <Globe className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                            <span>6-Region World Clock for Next Execution (Run #1)</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                                            {report.globalTimezoneMatrix.map((hub) => (
                                                <div
                                                    key={hub.ianaTimezone}
                                                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3 min-w-0"
                                                >
                                                    <div className="flex items-center justify-between gap-1 text-[11px] text-slate-500">
                                                        <span className="font-bold text-slate-700 dark:text-slate-300 truncate">
                                                            {hub.regionLabel}
                                                        </span>
                                                        <span className="font-mono shrink-0">{hub.utcOffsetLabel}</span>
                                                    </div>
                                                    <div className="font-mono font-bold text-slate-900 dark:text-white mt-1 break-all">
                                                        {hub.nextRunFormatted}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Monthly Execution Density Calendar Heatmap */}
                                    <div className="space-y-2.5">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                                Monthly Calendar Heatmap ({report.calendarHeatmapMonthLabel})
                                            </div>
                                            <span className="text-[11px] text-slate-500">
                                                Month Total:{' '}
                                                <strong>{report.frequencyBudget.runsPerMonth30d.toLocaleString()}</strong>{' '}
                                                runs
                                            </span>
                                        </div>

                                        <div className="hidden md:grid md:grid-cols-7 gap-2 text-[11px] font-bold uppercase tracking-wider text-center text-slate-500 dark:text-slate-400">
                                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dName) => (
                                                <div
                                                    key={dName}
                                                    className="py-1 rounded-lg bg-slate-100/80 dark:bg-slate-800/60"
                                                >
                                                    {dName}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-xs">
                                            {report.calendarHeatmapDays.length > 0 &&
                                                Array.from({
                                                    length: report.calendarHeatmapDays[0].weekdayIndex0Sun,
                                                }).map((_, emptyIdx) => (
                                                    <div
                                                        key={`pad_${emptyIdx}`}
                                                        className="hidden md:block rounded-xl border border-dashed border-slate-200/60 dark:border-slate-800/50 p-2.5 opacity-30"
                                                    />
                                                ))}
                                            {report.calendarHeatmapDays.map((dayCell) => (
                                                <div
                                                    key={dayCell.dateIso}
                                                    className={`rounded-xl border p-2.5 min-w-0 transition ${dayCell.hasCollision
                                                            ? 'border-rose-400 bg-rose-50/80 dark:bg-rose-950/40'
                                                            : dayCell.primaryRunsCount > 0
                                                                ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30'
                                                                : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 opacity-65'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between gap-1">
                                                        <span className="font-bold text-slate-900 dark:text-white">
                                                            {dayCell.weekdayShort} {dayCell.dayOfMonth}
                                                        </span>
                                                        <span
                                                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${dayCell.primaryRunsCount > 0
                                                                    ? 'bg-emerald-600 text-white'
                                                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                                }`}
                                                        >
                                                            {dayCell.primaryRunsCount}x
                                                        </span>
                                                    </div>
                                                    {dayCell.sampleRunTimesLocal.length > 0 && (
                                                        <div className="text-[10px] font-mono text-slate-600 dark:text-slate-300 mt-1 truncate">
                                                            {dayCell.sampleRunTimesLocal.join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* TAB 2: 14-RULE PRODUCTION RELIABILITY & DST PITFALL LINTER */}
                    {activeStudioTab === 'reliability_linter_14' && (
                        <div
                            role="tabpanel"
                            id="panel-reliability_linter_14"
                            aria-labelledby="tab-reliability_linter_14"
                            className="space-y-4"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                        14-Rule Production Cron Reliability &amp; DST Audit
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Detects minute floods (<code>* 2 * * *</code>), POSIX <code>DOM+DOW</code> OR
                                        traps, Quartz/AWS <code>?</code> &amp; weekday shifts, DST 02:00 skips,
                                        unescaped <code>%</code>, and job overlaps.
                                    </p>
                                </div>
                                {report.lintFindings.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleAutoFix}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs transition cursor-pointer"
                                    >
                                        <Wrench className="w-4 h-4" />
                                        <span>1-Click Auto-Fix All ({report.lintFindings.length})</span>
                                    </button>
                                )}
                            </div>

                            {report.lintFindings.length === 0 ? (
                                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/30 p-5 flex items-center gap-3 text-emerald-900 dark:text-emerald-200">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                                    <div className="text-xs sm:text-sm">
                                        <div className="font-bold">
                                            {!isLoaded
                                                ? 'Ready to Audit — Click "Pitfalls Demo (Auto-Fix)" Above to Test the 14-Rule Linter'
                                                : 'All 14 Production Reliability & DST Rules Passed (100/100 Grade A+)'}
                                        </div>
                                        <p className="text-xs opacity-85 mt-0.5">
                                            Zero minute floods, DOM/DOW OR traps, DST skip windows, overlap hazards, or
                                            unescaped crontab % characters detected.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {report.lintFindings.map((f) => (
                                        <div
                                            key={f.ruleId}
                                            className={`rounded-xl border p-4 space-y-2 ${f.severity === 'CRITICAL'
                                                    ? 'border-rose-300 dark:border-rose-900/80 bg-rose-50/60 dark:bg-rose-950/25'
                                                    : f.severity === 'WARNING'
                                                        ? 'border-amber-300 dark:border-amber-900/80 bg-amber-50/60 dark:bg-amber-950/25'
                                                        : 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20'
                                                }`}
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${f.severity === 'CRITICAL'
                                                                ? 'bg-rose-600 text-white'
                                                                : f.severity === 'WARNING'
                                                                    ? 'bg-amber-500 text-slate-950'
                                                                    : 'bg-indigo-600 text-white'
                                                            }`}
                                                    >
                                                        {f.severity}
                                                    </span>
                                                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                                                        {f.ruleId}
                                                    </span>
                                                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                                        {f.title}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] font-mono font-semibold text-slate-500">
                                                    {f.category}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-700 dark:text-slate-300 font-mono break-words">
                                                <strong>Evidence:</strong> {f.evidence}
                                            </p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                                <strong>Remediation:</strong> {f.remediation}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: CROSS-DIALECT AST TRANSPILER (7 DIALECTS + SYSTEMD ONCALENDAR) */}
                    {activeStudioTab === 'cross_dialect_transpiler' && (
                        <div
                            role="tabpanel"
                            id="panel-cross_dialect_transpiler"
                            aria-labelledby="tab-cross_dialect_transpiler"
                            className="space-y-4"
                        >
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                    Cross-Dialect Cron Transpiler &amp; <code>systemd OnCalendar=</code> Converter
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Shifts weekday indices (<code>0–6</code> ↔ <code>1–7</code>), injects required{' '}
                                    <code>?</code> tokens for Quartz/EventBridge, and compiles Linux{' '}
                                    <code>systemd OnCalendar=</code> syntax.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                {[
                                    {
                                        title: '1. Standard POSIX / Linux Crontab (5-Field)',
                                        val: report.crossDialectTranslations.unix5Crontab,
                                        dialect: 'UNIX_5' as CronDialectId,
                                        extraCopyLabel: null as string | null,
                                        extraCopyVal: null as string | null,
                                    },
                                    {
                                        title: '2. AWS EventBridge Rule (6-Field with ? & Year)',
                                        val: report.crossDialectTranslations.awsEventBridgeCron,
                                        dialect: 'AWS_EVENTBRIDGE_6' as CronDialectId,
                                        extraCopyLabel: null,
                                        extraCopyVal: null,
                                    },
                                    {
                                        title: '3. Java Quartz Scheduler (7-Field with Seconds & ?)',
                                        val: report.crossDialectTranslations.quartz7Expression,
                                        dialect: 'QUARTZ_6_7' as CronDialectId,
                                        extraCopyLabel: null,
                                        extraCopyVal: null,
                                    },
                                    {
                                        title: '4. Spring Boot @Scheduled (6-Field with Seconds)',
                                        val: report.crossDialectTranslations.spring6Scheduled,
                                        dialect: 'SPRING_6' as CronDialectId,
                                        extraCopyLabel: 'Copy @Scheduled',
                                        extraCopyVal: springAnnotationText,
                                    },
                                    {
                                        title: '5. Jenkins Hash-Jitter Pipeline (H Syntax)',
                                        val: report.crossDialectTranslations.jenkinsHashCron,
                                        dialect: 'JENKINS_HASH' as CronDialectId,
                                        extraCopyLabel: null,
                                        extraCopyVal: null,
                                    },
                                    {
                                        title: '6. Linux systemd Timer (OnCalendar=)',
                                        val: report.crossDialectTranslations.systemdOnCalendar,
                                        dialect: null,
                                        extraCopyLabel: null,
                                        extraCopyVal: null,
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.title}
                                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3.5 space-y-2 min-w-0"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className="font-bold text-slate-800 dark:text-slate-200">
                                                {item.title}
                                            </span>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {item.extraCopyLabel && item.extraCopyVal && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            copyText(item.extraCopyVal!, `${item.title}_anno`)
                                                        }
                                                        className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold cursor-pointer"
                                                    >
                                                        {copiedId === `${item.title}_anno`
                                                            ? 'Copied!'
                                                            : item.extraCopyLabel}
                                                    </button>
                                                )}
                                                {item.dialect && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setInputs((prev) => ({
                                                                ...prev,
                                                                rawExpressionInput: item.val,
                                                                selectedDialect: item.dialect!,
                                                            }))
                                                        }
                                                        className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold cursor-pointer"
                                                    >
                                                        Load
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => copyText(item.val, item.title)}
                                                    className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold cursor-pointer"
                                                >
                                                    {copiedId === item.title ? 'Copied!' : 'Copy'}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="rounded-lg bg-slate-950 text-emerald-300 px-3 py-2 font-mono text-xs break-all">
                                            {item.val}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {report.crossDialectTranslations.conversionNotes.length > 0 && (
                                <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/25 p-3.5 space-y-1 text-xs">
                                    <div className="font-bold text-indigo-900 dark:text-indigo-200">
                                        AST Dialect Normalization Notes:
                                    </div>
                                    <ul className="list-disc pl-4 space-y-0.5 text-slate-700 dark:text-slate-300">
                                        {report.crossDialectTranslations.conversionNotes.map((note, idx) => (
                                            <li key={idx}>{note}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 4: 10-PLATFORM DEVOPS & IAC CONFIG COMPILER */}
                    {activeStudioTab === 'devops_config_compiler' && (
                        <div
                            role="tabpanel"
                            id="panel-devops_config_compiler"
                            aria-labelledby="tab-devops_config_compiler"
                            className="space-y-4"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap gap-1.5">
                                    {DEVOPS_PLATFORMS.map((plat) => (
                                        <button
                                            key={plat.id}
                                            type="button"
                                            aria-pressed={selectedDevOpsPlatform === plat.id}
                                            onClick={() => setSelectedDevOpsPlatform(plat.id)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${selectedDevOpsPlatform === plat.id
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                                }`}
                                        >
                                            {plat.label}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => copyText(activeConfigSnippet, 'devops_snippet')}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-700 transition cursor-pointer"
                                >
                                    {copiedId === 'devops_snippet' ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                    )}
                                    <span>{copiedId === 'devops_snippet' ? 'Copied Config!' : 'Copy Config'}</span>
                                </button>
                            </div>

                            <pre className="rounded-xl bg-slate-950 text-emerald-300 p-4 text-xs font-mono overflow-x-auto leading-relaxed">
                                {activeConfigSnippet}
                            </pre>
                        </div>
                    )}

                    {/* TAB 5: RFC 5545 .ICS CALENDAR & CWE-1236 SAFE .XLSX / .CSV EXPORTS */}
                    {activeStudioTab === 'calendar_audit_exports' && (
                        <div
                            role="tabpanel"
                            id="panel-calendar_audit_exports"
                            aria-labelledby="tab-calendar_audit_exports"
                            className="space-y-4"
                        >
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                    Export Schedule to Calendar (<code>.ics</code>) or Audit Report (
                                    <code>.xlsx</code> / <code>.csv</code> / <code>.json</code>)
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Import upcoming runs into Google Calendar, Apple Calendar, or Outlook via RFC 5545{' '}
                                    <code>.ics</code>, or download a multi-timezone execution and 14-rule reliability
                                    audit report.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <button
                                    type="button"
                                    onClick={handleDownloadIcs}
                                    className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/70 dark:bg-indigo-950/40 p-4 text-left hover:border-indigo-500 transition cursor-pointer space-y-1"
                                >
                                    <div className="flex items-center gap-2 font-bold text-xs text-indigo-900 dark:text-indigo-200">
                                        <CalendarIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                                        <span>Download RFC 5545 .ICS</span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                        Import next 15 runs into Google, Apple, or Outlook Calendar.
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDownloadXlsx}
                                    className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/40 p-4 text-left hover:border-emerald-500 transition cursor-pointer space-y-1"
                                >
                                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-900 dark:text-emerald-200">
                                        <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Download Excel .XLSX</span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                        Native OpenXML workbook with schedule summary, 14-rule audit &amp; run timeline.
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDownloadCsv}
                                    className="rounded-xl border border-sky-200 dark:border-sky-900 bg-sky-50/70 dark:bg-sky-950/40 p-4 text-left hover:border-sky-500 transition cursor-pointer space-y-1"
                                >
                                    <div className="flex items-center gap-2 font-bold text-xs text-sky-900 dark:text-sky-200">
                                        <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                                        <span>Download Audit .CSV</span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                        UTF-8 BOM spreadsheet with CWE-1236 formula-injection sanitization.
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDownloadJson}
                                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 text-left hover:border-slate-500 transition cursor-pointer space-y-1"
                                >
                                    <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-slate-200">
                                        <FileCode className="w-4 h-4 text-slate-600 shrink-0" />
                                        <span>Download Simulation .JSON</span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                        Complete AST breakdown, 7-dialect translations, and execution epochs.
                                    </p>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ============================================================================
          5. COLLAPSIBLE TECHNICAL SPECIFICATION & LOCAL EXECUTION NOTE
          ============================================================================ */}
            <details className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-xs text-slate-600 dark:text-slate-400">
                <summary className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer flex items-center justify-between">
                    <span className="inline-flex items-center gap-2">
                        <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>
                            7-Dialect Cron Specification, POSIX OR vs. Spring AND Evaluation &amp; Local Processing
                            Note
                        </span>
                    </span>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold shrink-0">
                        Click to expand
                    </span>
                </summary>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 leading-relaxed">
                    <p>
                        <strong>Local Browser Execution:</strong> Cron parsing, timezone simulation, linter checks,
                        and file exports are computed in JavaScript inside your browser without sending your cron
                        expressions or shell commands to a KivaroTools backend.
                    </p>
                    <p>
                        <strong>Dialect-Accurate Calendar Math:</strong> Standard 5-field POSIX/Vixie cron, Kubernetes{' '}
                        <code>batch/v1</code>, and GitHub Actions evaluate restricted Day-of-Month and Day-of-Week
                        fields using a Boolean <code>OR</code> union and index weekdays as <code>0–6</code> (
                        <code>0</code> or <code>7</code> = Sunday). Spring <code>@Scheduled</code> uses 6 fields and
                        evaluates Day-of-Month and Day-of-Week with Boolean <code>AND</code>. Java Quartz and AWS
                        EventBridge index weekdays as <code>1–7</code> (<code>1</code> = Sunday, <code>7</code> =
                        Saturday) and require the <code>?</code> mutual-exclusion wildcard in either Day-of-Month or
                        Day-of-Week. Note: AWS <code>rate(...)</code> expressions are not supported.
                    </p>
                </div>
            </details>
        </div>
    );
}