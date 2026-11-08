"use client";

import React, { useState, useMemo, useRef } from 'react';
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
    Cpu,
    Terminal,
    Layers,
    Globe,
    SlidersHorizontal,
    Play,
    AlertTriangle,
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

const QUICK_CRON_PRESETS: {
    id: CronPresetScenarioId;
    title: string;
    subtitle: string;
    badge: string;
    dialectTag: string;
}[] = [
        {
            id: 'weekday_business_hours_15m',
            title: '1. Weekday Business Hours Polling (*/15 9-17 * * 1-5)',
            subtitle: 'Runs every 15 minutes from 09:00 to 17:45, Monday through Friday in UTC (36 runs/day).',
            badge: '100/100 Grade A+',
            dialectTag: 'POSIX / K8s / GHA',
        },
        {
            id: 'vulnerable_cron_pitfalls_demo',
            title: '2. Vulnerable Cron Pitfalls Demo (6 Critical/Warn Alerts)',
            subtitle: 'Triggers "* 2" 60x minute flood, POSIX DOM+DOW OR trap, DST 02:00 skip, unescaped "%" & job overlap.',
            badge: 'Test 1-Click Auto-Fix',
            dialectTag: '14-Rule Audit',
        },
        {
            id: 'nightly_backup_dst_check',
            title: '3. Nightly Database Backup + DST Skip Check (15 2 * * *  NY)',
            subtitle: 'Runs daily at 02:15 America/New_York and flags the Spring-Forward 02:00->03:00 DST skip window.',
            badge: 'DST Hazard Scanner',
            dialectTag: 'Kubernetes CronJob',
        },
        {
            id: 'quartz_last_weekday_payroll',
            title: '4. Java Quartz Last Weekday Payroll (0 30 17 LW * ? *)',
            subtitle: '7-field Quartz expression using "LW" (Last Weekday of every month at 17:30:00) and "?" exclusion.',
            badge: 'Quartz LW Verified',
            dialectTag: 'Java Quartz 7-Field',
        },
        {
            id: 'aws_eventbridge_3rd_friday',
            title: '5. AWS EventBridge 3rd Friday Window (cron(15 22 ? * 6#3 *))',
            subtitle: 'Auto-strips "cron(...)", evaluates "6#3" (3rd Friday in 1–7 indexing) at 22:15 UTC with Year "*".',
            badge: 'EventBridge 6#3',
            dialectTag: 'AWS EventBridge',
        },
        {
            id: 'jenkins_hash_jitter_pipeline',
            title: '6. Jenkins Hash-Jitter CI Pipeline (H/20 H(0-7) * * 1-5)',
            subtitle: 'Hashes project name via CRC-32 to deterministically spread CI builds and prevent :00 queue spikes.',
            badge: 'CRC-32 Jitter',
            dialectTag: 'Jenkins H Cron',
        },
    ];

const DEVOPS_PLATFORMS: { id: DevOpsConfigPlatform; label: string; badge: string }[] = [
    { id: 'k8s_cronjob_yaml', label: 'Kubernetes CronJob YAML (batch/v1)', badge: 'K8s 1.27+' },
    { id: 'systemd_timer_unit', label: 'Linux systemd .timer + .service', badge: 'OnCalendar' },
    { id: 'linux_crontab_flock', label: 'Linux Crontab + flock -n Lock', badge: 'POSIX' },
    { id: 'github_actions_yaml', label: 'GitHub Actions Workflow (.yml)', badge: 'CI/CD' },
    { id: 'aws_eventbridge_terraform', label: 'AWS EventBridge Terraform HCL', badge: 'IaC' },
    { id: 'vercel_cron_json', label: 'Vercel Crons (vercel.json)', badge: 'Serverless' },
    { id: 'cloudflare_wrangler_toml', label: 'Cloudflare Workers (wrangler.toml)', badge: 'Edge' },
    { id: 'nodejs_croner_ts', label: 'Node.js / TypeScript (croner v8)', badge: 'TypeScript' },
    { id: 'python_celery_apscheduler', label: 'Python (Celery Beat / APScheduler)', badge: 'Python' },
    { id: 'go_spring_laravel', label: 'Go (robfig/cron) & Spring Boot', badge: 'Go / Java' },
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
        { label: 'Last Friday (5L)', token: '5L' },
        { label: 'Quartz/AWS Excluded (?)', token: '?' },
    ],
    year: [
        { label: 'Every Year (*)', token: '*' },
        { label: '2026 Only (2026)', token: '2026' },
        { label: '2026–2028 (2026-2028)', token: '2026-2028' },
    ],
};

function getFieldBadgeColors(fieldKey: CronFieldBreakdown['fieldKey']): {
    badge: string;
    border: string;
    bg: string;
    text: string;
} {
    switch (fieldKey) {
        case 'seconds':
            return {
                badge: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300',
                border: 'border-amber-200 dark:border-amber-900/60',
                bg: 'bg-amber-50/60 dark:bg-amber-950/20',
                text: 'text-amber-700 dark:text-amber-300',
            };
        case 'minutes':
            return {
                badge: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300',
                border: 'border-rose-200 dark:border-rose-900/60',
                bg: 'bg-rose-50/60 dark:bg-rose-950/20',
                text: 'text-rose-700 dark:text-rose-300',
            };
        case 'hours':
            return {
                badge: 'bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300',
                border: 'border-violet-200 dark:border-violet-900/60',
                bg: 'bg-violet-50/60 dark:bg-violet-950/20',
                text: 'text-violet-700 dark:text-violet-300',
            };
        case 'dayOfMonth':
            return {
                badge: 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300',
                border: 'border-sky-200 dark:border-sky-900/60',
                bg: 'bg-sky-50/60 dark:bg-sky-950/20',
                text: 'text-sky-700 dark:text-sky-300',
            };
        case 'month':
            return {
                badge: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300',
                border: 'border-emerald-200 dark:border-emerald-900/60',
                bg: 'bg-emerald-50/60 dark:bg-emerald-950/20',
                text: 'text-emerald-700 dark:text-emerald-300',
            };
        case 'dayOfWeek':
            return {
                badge: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300',
                border: 'border-indigo-200 dark:border-indigo-900/60',
                bg: 'bg-indigo-50/60 dark:bg-indigo-950/20',
                text: 'text-indigo-700 dark:text-indigo-300',
            };
        case 'year':
        default:
            return {
                badge: 'bg-fuchsia-100 dark:bg-fuchsia-950 text-fuchsia-800 dark:text-fuchsia-300',
                border: 'border-fuchsia-200 dark:border-fuchsia-900/60',
                bg: 'bg-fuchsia-50/60 dark:bg-fuchsia-950/20',
                text: 'text-fuchsia-700 dark:text-fuchsia-300',
            };
    }
}

export default function CronExpressionGenerator() {
    // Clean 0 initial state on page load / refresh
    const [activePresetId, setActivePresetId] = useState<CronPresetScenarioId | null>(null);
    const [inputs, setInputs] = useState<CronGeneratorInputs>(() => getDefaultCronInputs());
    const [activeFieldEditorKey, setActiveFieldEditorKey] = useState<CronFieldBreakdown['fieldKey']>('minutes');
    const [activeStudioTab, setActiveStudioTab] = useState<CronStudioTab>('timeline_heatmap_collision');
    const [selectedDevOpsPlatform, setSelectedDevOpsPlatform] = useState<DevOpsConfigPlatform>('k8s_cronjob_yaml');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [statusNotice, setStatusNotice] = useState<string | null>(null);

    const deepDiveRef = useRef<HTMLDivElement | null>(null);

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
        setActivePresetId(presetId);
        setInputs(presetData.inputs);
        if (presetId === 'vulnerable_cron_pitfalls_demo') {
            setActiveStudioTab('reliability_linter_14');
        } else if (presetId === 'nightly_backup_dst_check') {
            setActiveStudioTab('timeline_heatmap_collision');
        }
        setStatusNotice(presetData.description);
    };

    const handleResetToZero = () => {
        setActivePresetId(null);
        setInputs(getDefaultCronInputs());
        setStatusNotice(
            'Workspace reset to clean 0 state. Click any of the 6 Scenario Presets above, type a cron expression, or describe a schedule in plain English.'
        );
    };

    const handleAutoFix = () => {
        if (report.isIdleEmpty) return;
        const { nextInputs, fixSummary } = autoFixCronPitfalls(inputs);
        setInputs(nextInputs);
        setStatusNotice(fixSummary);
    };

    const handleCompileNaturalLanguage = () => {
        const q = inputs.naturalLanguageQuery.trim();
        if (!q) return;
        const targetDialect =
            inputs.selectedDialect === 'AUTO' ? 'UNIX_5' : inputs.selectedDialect;
        const compiled = compileEnglishToCron(q, targetDialect);
        setActivePresetId(null);
        setInputs((prev) => ({
            ...prev,
            rawExpressionInput: compiled.cronExpression,
        }));
        setStatusNotice(`${compiled.matchedRuleSummary} → "${compiled.cronExpression}"`);
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
            (/L|W|#|\?/.test(newTokenValue)) &&
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

    return (
        <div className="space-y-6 w-full min-w-0 max-w-full overflow-x-hidden text-slate-900 dark:text-slate-100">
            {/* ============================================================================
          SECTION 1: TOP STUDIO HEADER & 6 INSTANT 1-CLICK SCENARIO CARDS
          ============================================================================ */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                <span>7-Dialect Cron AST + DST &amp; Timezone Simulator (100% Client-Side)</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                <Cpu className="w-3.5 h-3.5 shrink-0" />
                                <span>v{CRON_ENGINE_VERSION}</span>
                            </span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Cron Expression Generator, 7-Dialect Visual Builder &amp; DST Collision Simulator
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            Visually build, explain, and simulate <code>POSIX / Linux Crontab</code>, <code>Kubernetes CronJob</code>,{' '}
                            <code>GitHub Actions</code>, <code>Spring @Scheduled</code>, <code>Java Quartz (L / W / LW / #)</code>,{' '}
                            <code>AWS EventBridge</code>, and <code>Jenkins H Jitter</code> expressions across 12 IANA timezones.
                            Audit 14 production pitfalls and compile Kubernetes, <code>systemd OnCalendar</code>, and Terraform configs.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={handleCopyShareLink}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-xs transition cursor-pointer"
                        >
                            {copiedId === 'share_link' ? (
                                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                                <Share2 className="w-4 h-4 shrink-0" />
                            )}
                            <span>{copiedId === 'share_link' ? 'Copied Link!' : 'Share Schedule'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleResetToZero}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-400 transition cursor-pointer"
                            title="Reset schedule and all counters to 0"
                        >
                            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                            <span>Reset (0)</span>
                        </button>
                    </div>
                </div>

                {/* 6 Instant 1-Click Scenario Cards in 2-Column Responsive Grid */}
                <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>
                                Instant 1-Click Cron Scenario Presets (Click Any Preset to Test 7 Dialects, DST Skips &amp; 1-Click Auto-Fix):
                            </span>
                        </div>
                        <span className="text-[11px] font-medium text-slate-400">6 Production Schedules</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {QUICK_CRON_PRESETS.map((preset) => {
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
                                            {preset.dialectTag}
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
          SECTION 2: LIVE PLAIN-ENGLISH TRANSLATION HERO BANNER & RELIABILITY SCORE
          ============================================================================ */}
            <div
                className={`rounded-2xl border p-4 sm:p-5 shadow-sm transition ${!isLoaded
                        ? 'border-slate-200 dark:border-slate-800 bg-slate-900 text-white'
                        : !report.isValidSyntax || report.criticalFindingsCount > 0
                            ? 'border-rose-500/40 bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white'
                            : report.warningFindingsCount > 0
                                ? 'border-amber-500/40 bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 text-white'
                                : 'border-emerald-500/40 bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 text-white'
                    }`}
            >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="min-w-0 space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${!isLoaded
                                        ? 'bg-slate-800 text-slate-300'
                                        : report.isValidSyntax && report.criticalFindingsCount === 0
                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                                            : 'bg-rose-500/25 text-rose-200 border border-rose-400/40'
                                    }`}
                            >
                                {isLoaded && report.isValidSyntax && report.criticalFindingsCount === 0 ? (
                                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : isLoaded ? (
                                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                                ) : (
                                    <Clock className="w-4 h-4 text-indigo-300 shrink-0" />
                                )}
                                <span>
                                    {!isLoaded
                                        ? 'READY TO BUILD OR SIMULATE (0 ACTIVE)'
                                        : !report.isValidSyntax
                                            ? 'SYNTAX ERROR DETECTED'
                                            : report.criticalFindingsCount > 0
                                                ? `${report.criticalFindingsCount} CRITICAL RELIABILITY TRAP(S)`
                                                : 'VALIDATED SCHEDULE'}
                                </span>
                            </span>

                            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-white/10 text-white">
                                Dialect: {isLoaded ? report.detectedDialect : 'AUTO (0)'}
                            </span>

                            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-white/10 text-white">
                                TZ: {inputs.targetTimezone}
                            </span>

                            {report.expandedMacroFrom && (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30">
                                    Expanded Macro: {report.expandedMacroFrom}
                                </span>
                            )}
                        </div>

                        {/* Crontab.guru Style Large Human-Readable Translation */}
                        <div className="text-base sm:text-xl font-extrabold tracking-tight text-white break-words leading-snug">
                            &ldquo;{report.plainEnglishDescription}&rdquo;
                        </div>

                        <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span>
                                <strong>Next Execution:</strong>{' '}
                                <span className="font-mono text-emerald-300 break-all">
                                    {report.upcomingRuns[0]
                                        ? `${report.upcomingRuns[0].targetTimezoneFormatted} (${report.upcomingRuns[0].relativeDeltaLabel})`
                                        : '0'}
                                </span>
                            </span>
                            <span>
                                <strong>Cadence:</strong>{' '}
                                <span className="font-mono">
                                    {isLoaded
                                        ? `${report.frequencyBudget.runsPerDay}/day • ${report.frequencyBudget.runsPerMonth30d}/month`
                                        : '0 runs/day'}
                                </span>
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <div className="rounded-xl bg-white/10 border border-white/15 px-3.5 py-2 text-left">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                                14-Rule Reliability Score
                            </div>
                            <div className="flex items-baseline gap-2 mt-0.5">
                                <span
                                    className={`text-lg font-black font-mono ${!isLoaded
                                            ? 'text-slate-300'
                                            : report.reliabilityScore >= 90
                                                ? 'text-emerald-400'
                                                : report.reliabilityScore >= 70
                                                    ? 'text-amber-300'
                                                    : 'text-rose-400'
                                        }`}
                                >
                                    {isLoaded ? `${report.reliabilityScore}/100 (${report.reliabilityGrade})` : '0 / 100'}
                                </span>
                                <span className="text-xs font-semibold text-slate-300">
                                    • {report.criticalFindingsCount} Crit / {report.warningFindingsCount} Warn
                                </span>
                            </div>
                        </div>

                        {report.lintFindings.length > 0 && (
                            <button
                                type="button"
                                onClick={handleAutoFix}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm transition cursor-pointer"
                            >
                                <Wrench className="w-4 h-4 shrink-0" />
                                <span>1-Click Auto-Fix ({report.lintFindings.length} Alerts)</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ============================================================================
          SECTION 3: INTERACTIVE CRON EXPRESSION EDITOR, NATURAL LANGUAGE BAR & VISUAL FIELD BUILDER
          ============================================================================ */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-5">
                {/* Dialect Selector Strip (Flex-Wrap so buttons never clip!) */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="space-y-1.5">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Cron Dialect &amp; Scheduler Engine Mode
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                            {(
                                [
                                    { id: 'AUTO', label: 'Auto-Detect (All 7)' },
                                    { id: 'UNIX_5', label: 'POSIX / Linux (5-Field)' },
                                    { id: 'K8S_CRONJOB', label: 'Kubernetes CronJob' },
                                    { id: 'GITHUB_ACTIONS', label: 'GitHub Actions (UTC)' },
                                    { id: 'SPRING_6', label: 'Spring @Scheduled (6-Field)' },
                                    { id: 'QUARTZ_6_7', label: 'Java Quartz (6/7-Field)' },
                                    { id: 'AWS_EVENTBRIDGE_6', label: 'AWS EventBridge' },
                                    { id: 'JENKINS_HASH', label: 'Jenkins H Jitter' },
                                ] as { id: CronDialectId; label: string }[]
                            ).map((d) => {
                                const isSelected = inputs.selectedDialect === d.id;
                                return (
                                    <button
                                        key={d.id}
                                        type="button"
                                        onClick={() =>
                                            setInputs((prev) => ({ ...prev, selectedDialect: d.id }))
                                        }
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${isSelected
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                                : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                            }`}
                                    >
                                        {d.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => copyText(report.cleanCronExpression, 'copy_cron')}
                        disabled={!isLoaded}
                        className="self-start sm:self-center inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 disabled:opacity-40 transition shrink-0 cursor-pointer"
                    >
                        {copiedId === 'copy_cron' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                            <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedId === 'copy_cron' ? 'Copied Expression!' : 'Copy Cron String'}</span>
                    </button>
                </div>

                {/* Dual Input Grid: Raw Cron Expression Input + Natural Language English-to-Cron Compiler */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="min-w-0 md:col-span-7 space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <label
                                htmlFor="kivaro-cron-input"
                                className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                            >
                                <Terminal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                <span>Cron Expression / @Macro / cron(...) / Crontab Line</span>
                            </label>
                            <div className="flex flex-wrap items-center gap-1 text-[11px]">
                                {(['@hourly', '@daily', '@weekly', '@monthly'] as const).map((mac) => (
                                    <button
                                        key={mac}
                                        type="button"
                                        onClick={() => {
                                            setActivePresetId(null);
                                            setInputs((prev) => ({ ...prev, rawExpressionInput: mac }));
                                        }}
                                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 font-mono cursor-pointer"
                                    >
                                        {mac}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <input
                            id="kivaro-cron-input"
                            type="text"
                            value={inputs.rawExpressionInput}
                            onChange={(e) => {
                                setActivePresetId(null);
                                setInputs((prev) => ({ ...prev, rawExpressionInput: e.target.value }));
                            }}
                            placeholder="e.g. */15 9-17 * * 1-5   or   0 30 17 LW * ? *   or   cron(15 22 ? * 6#3 *)"
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 px-4 py-3 text-sm sm:text-base font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Natural Language English-to-Cron Compiler */}
                    <div className="min-w-0 md:col-span-5 space-y-1.5">
                        <label
                            htmlFor="kivaro-english-cron"
                            className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>English-to-Cron Compiler (Type Plain English)</span>
                        </label>
                        <div className="flex gap-2">
                            <input
                                id="kivaro-english-cron"
                                type="text"
                                value={inputs.naturalLanguageQuery}
                                onChange={(e) =>
                                    setInputs((prev) => ({ ...prev, naturalLanguageQuery: e.target.value }))
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCompileNaturalLanguage();
                                }}
                                placeholder='e.g. "every 10 mins during business hours on weekdays"'
                                className="min-w-0 flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 px-3 py-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                type="button"
                                onClick={handleCompileNaturalLanguage}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 transition cursor-pointer"
                            >
                                Convert
                            </button>
                        </div>
                    </div>
                </div>

                {/* Color-Coded Field AST Breakdown Cards (Full-Width Stacked List — Zero Overflow!) */}
                {isLoaded && report.fieldBreakdowns.length > 0 && (
                    <div className="space-y-2.5">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Color-Coded Cron Field AST Breakdown (Click Any Field Below to Open Visual Pill Builder)
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {report.fieldBreakdowns.map((fb) => {
                                const colors = getFieldBadgeColors(fb.fieldKey);
                                const isSelectedField = activeFieldEditorKey === fb.fieldKey;
                                return (
                                    <div
                                        key={fb.fieldKey}
                                        onClick={() => setActiveFieldEditorKey(fb.fieldKey)}
                                        className={`rounded-xl border ${colors.border} ${colors.bg} p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0 transition cursor-pointer ${isSelectedField ? 'ring-2 ring-indigo-500/40' : ''
                                            }`}
                                    >
                                        <div className="min-w-0 space-y-1 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${colors.badge}`}>
                                                    Field #{fb.index}: {fb.label}
                                                </span>
                                                <code className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-xs font-extrabold">
                                                    {fb.rawToken}
                                                </code>
                                                {fb.rawToken !== fb.resolvedTokenAfterHash && (
                                                    <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400">
                                                        → CRC-32 Jitter: {fb.resolvedTokenAfterHash}
                                                    </span>
                                                )}
                                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 break-words">
                                                    • {fb.humanSummary}
                                                </span>
                                            </div>
                                            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 break-all">
                                                Matched Values: [{fb.expandedSampleValues}] • Allowed Syntax: {fb.allowedRangeLabel}
                                            </div>
                                        </div>

                                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                                            {isSelectedField ? '✓ Editing Below' : 'Click to Edit'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Interactive Visual Click-to-Build Field Matrix + Timezone & Job Duration Controls */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span>Interactive Visual Field Builder (1-Click Token Modifiers)</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {(
                                [
                                    { key: 'minutes', label: 'Minutes' },
                                    { key: 'hours', label: 'Hours' },
                                    { key: 'dayOfMonth', label: 'Day of Month' },
                                    { key: 'month', label: 'Month' },
                                    { key: 'dayOfWeek', label: 'Day of Week' },
                                    { key: 'seconds', label: 'Seconds (6/7-F)' },
                                    { key: 'year', label: 'Year (Quartz/AWS)' },
                                ] as { key: CronFieldBreakdown['fieldKey']; label: string }[]
                            ).map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveFieldEditorKey(tab.key)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${activeFieldEditorKey === tab.key
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick-Click Chips for Selected Field */}
                    <div className="flex flex-wrap gap-1.5">
                        {VISUAL_FIELD_QUICK_CHIPS[activeFieldEditorKey].map((chip) => (
                            <button
                                key={chip.token}
                                type="button"
                                onClick={() => handleUpdateSingleFieldToken(activeFieldEditorKey, chip.token)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>

                    {/* Timezone, Job Duration, Shell Command & Secondary Collision / Jenkins Seed Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80 dark:border-slate-800 text-xs">
                        <div className="space-y-1 min-w-0">
                            <label className="block font-bold text-slate-600 dark:text-slate-300">
                                1. Evaluation Timezone (IANA / Annual DST Scanner)
                            </label>
                            <select
                                value={inputs.targetTimezone}
                                onChange={(e) =>
                                    setInputs((prev) => ({ ...prev, targetTimezone: e.target.value }))
                                }
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2 text-xs font-medium"
                            >
                                {SUPPORTED_IANA_TIMEZONES.map((tz) => (
                                    <option key={tz.id} value={tz.id}>
                                        {tz.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1 min-w-0">
                            <label className="block font-bold text-slate-600 dark:text-slate-300">
                                2. Estimated Job Duration (Seconds — Overlap &amp; Compute Budget)
                            </label>
                            <input
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
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 font-mono text-xs"
                            />
                        </div>

                        <div className="space-y-1 min-w-0">
                            <label className="block font-bold text-slate-600 dark:text-slate-300">
                                3. Crontab Shell Command / Script (Audits &ldquo;%&rdquo; Escape &amp; PATH)
                            </label>
                            <input
                                type="text"
                                value={inputs.shellCommandToExecute}
                                onChange={(e) =>
                                    setInputs((prev) => ({ ...prev, shellCommandToExecute: e.target.value }))
                                }
                                placeholder="/usr/local/bin/backup-db.sh"
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 font-mono text-xs"
                            />
                        </div>

                        <div className="space-y-1 min-w-0">
                            <label className="block font-bold text-slate-600 dark:text-slate-300">
                                4. Secondary Cron Job (Collision Check) / Jenkins Seed
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputs.secondaryCronExpression}
                                    onChange={(e) =>
                                        setInputs((prev) => ({ ...prev, secondaryCronExpression: e.target.value }))
                                    }
                                    placeholder="Secondary e.g. 0 2 * * *"
                                    className="min-w-0 flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2 font-mono text-xs"
                                />
                                <input
                                    type="text"
                                    value={inputs.jenkinsJobNameSeed}
                                    onChange={(e) =>
                                        setInputs((prev) => ({ ...prev, jenkinsJobNameSeed: e.target.value }))
                                    }
                                    placeholder="Jenkins Seed"
                                    title="Jenkins H CRC-32 Job Name Seed"
                                    className="w-28 sm:w-32 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2 font-mono text-xs shrink-0"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ============================================================================
          SECTION 4: 4 FULL-WIDTH HORIZONTAL SUMMARY ROWS (100% Overflow-Proof grid-cols-1)
          ============================================================================ */}
            <div className="grid grid-cols-1 gap-2.5 text-xs min-w-0">
                {/* Row 1: Active Cron Expression, Dialect & Plain-English Summary */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0 shadow-2xs">
                    <div className="min-w-0 space-y-0.5">
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                            1. Normalized Cron Expression, Active Dialect &amp; Human-Readable Meaning
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 break-words">
                            {isLoaded ? report.plainEnglishDescription : '0 expressions loaded — select a preset or enter a schedule'}
                        </div>
                    </div>
                    <div className="text-sm font-extrabold font-mono text-indigo-600 dark:text-indigo-400 break-all sm:text-right shrink-0">
                        {isLoaded ? `${report.cleanCronExpression} (${report.detectedDialect})` : '0'}
                    </div>
                </div>

                {/* Row 2: Next Scheduled Execution & UTC Equivalent */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0 shadow-2xs">
                    <div className="min-w-0 space-y-0.5">
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                            2. Next Scheduled Execution ({inputs.targetTimezone} vs. UTC ISO-8601)
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono break-all">
                            {report.upcomingRuns[0]
                                ? `UTC: ${report.upcomingRuns[0].utcIsoString} • Countdown: ${report.upcomingRuns[0].relativeDeltaLabel}`
                                : '0 upcoming runs calculated'}
                        </div>
                    </div>
                    <div className="text-sm font-extrabold font-mono text-emerald-600 dark:text-emerald-400 break-all sm:text-right">
                        {report.upcomingRuns[0] ? report.upcomingRuns[0].targetTimezoneFormatted : '0'}
                    </div>
                </div>

                {/* Row 3: Execution Cadence, Monthly CI/CD Compute Minutes & Self-Overlap */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0 shadow-2xs">
                    <div className="min-w-0 space-y-0.5">
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                            3. Execution Cadence, Monthly CI/CD Compute Budget &amp; Overlap Guard
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono break-words">
                            {isLoaded
                                ? `Min Gap: ${report.frequencyBudget.minIntervalHumanLabel} • Job Duration: ${report.frequencyBudget.estimatedJobDurationSeconds}s • Compute: ${report.frequencyBudget.monthlyComputeMinutes} mins/mo (${report.frequencyBudget.githubActionsFreeTierPercent}% of GHA 2,000m)`
                                : '0 runs/day • 0 compute minutes'}
                        </div>
                    </div>
                    <div
                        className={`text-sm font-extrabold font-mono shrink-0 ${!isLoaded
                                ? 'text-slate-900 dark:text-white'
                                : report.frequencyBudget.hasSelfOverlapRisk
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : 'text-slate-900 dark:text-white'
                            }`}
                    >
                        {isLoaded
                            ? `${report.frequencyBudget.runsPerDay}/day • ${report.frequencyBudget.runsPerMonth30d}/mo`
                            : '0 / day'}
                    </div>
                </div>

                {/* Row 4: Annual Daylight Saving Time (DST) & 14-Rule Linter Audit */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0 shadow-2xs">
                    <div className="min-w-0 space-y-0.5">
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                            4. Daylight Saving Time (DST) Transition Scanner &amp; 14-Rule Linter Status
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 break-words">
                            {isLoaded ? report.dstHazard.hazardExplanation : '0 DST transitions evaluated'}
                        </div>
                    </div>
                    <div
                        className={`text-sm font-extrabold font-mono shrink-0 ${!isLoaded
                                ? 'text-slate-900 dark:text-white'
                                : report.dstHazard.springForwardSkipRisk || report.criticalFindingsCount > 0
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                    >
                        {isLoaded
                            ? report.dstHazard.springForwardSkipRisk
                                ? '⚠️ DST 02:00 Skip Risk'
                                : '✓ DST-Safe Schedule'
                            : '0 Alerts'}
                    </div>
                </div>
            </div>

            {/* ============================================================================
          SECTION 5: 5 DEEP-DIVE ENTERPRISE STUDIO TABS
          ============================================================================ */}
            <div
                ref={deepDiveRef}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden"
            >
                <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 p-2 flex flex-wrap gap-1.5">
                    <button
                        type="button"
                        onClick={() => setActiveStudioTab('timeline_heatmap_collision')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeStudioTab === 'timeline_heatmap_collision'
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                            }`}
                    >
                        <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>1. Next 15 Runs, 6-Region Matrix &amp; Calendar Heatmap</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveStudioTab('reliability_linter_14')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeStudioTab === 'reliability_linter_14'
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                            }`}
                    >
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        <span>2. 14-Rule Reliability &amp; DST Linter ({report.lintFindings.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveStudioTab('cross_dialect_transpiler')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeStudioTab === 'cross_dialect_transpiler'
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                            }`}
                    >
                        <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" />
                        <span>3. 7-Dialect &amp; systemd OnCalendar Transpiler</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveStudioTab('devops_config_compiler')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeStudioTab === 'devops_config_compiler'
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                            }`}
                    >
                        <Terminal className="w-3.5 h-3.5 shrink-0" />
                        <span>4. 10-Platform DevOps Config Compiler</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveStudioTab('calendar_audit_exports')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeStudioTab === 'calendar_audit_exports'
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                            }`}
                    >
                        <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                        <span>5. Export .ICS Calendar &amp; .XLSX / .CSV Audit</span>
                    </button>
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                    {/* ====================================================================
              TAB 1: NEXT 15 RUNS TIMELINE, 6-REGION GLOBAL MATRIX & CALENDAR HEATMAP
              ==================================================================== */}
                    {activeStudioTab === 'timeline_heatmap_collision' && (
                        <div className="space-y-6">
                            {!isLoaded ? (
                                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-500">
                                    0 Active Schedules. Select any of the 6 Scenario Presets at the top or enter a cron expression to
                                    simulate upcoming executions, 6-region world clock times, and the monthly calendar heatmap.
                                </div>
                            ) : (
                                <>
                                    {/* 6-Region Global Timezone Matrix for Next Run */}
                                    <div className="space-y-2.5">
                                        <div className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                            <Globe className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                            <span>6-Region Global World Clock Matrix for Next Execution (Run #1)</span>
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
                                                Monthly Execution Density Calendar Heatmap ({report.calendarHeatmapMonthLabel})
                                            </div>
                                            <span className="text-[11px] text-slate-500">
                                                Total Month Executions: <strong>{report.frequencyBudget.runsPerMonth30d.toLocaleString()}</strong>
                                            </span>
                                        </div>

                                        <div className="hidden md:grid md:grid-cols-7 gap-2 text-[11px] font-bold uppercase tracking-wider text-center text-slate-500 dark:text-slate-400">
                                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dName) => (
                                                <div key={dName} className="py-1 rounded-lg bg-slate-100/80 dark:bg-slate-800/60">
                                                    {dName}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-xs">
                                            {report.calendarHeatmapDays.length > 0 &&
                                                Array.from({ length: report.calendarHeatmapDays[0].weekdayIndex0Sun }).map((_, emptyIdx) => (
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

                                    {/* Next 15 Scheduled Runs Table */}
                                    <div className="space-y-2">
                                        <div className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                            Upcoming 15 Scheduled Executions ({inputs.targetTimezone} &amp; UTC)
                                        </div>
                                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                                            <table className="w-full text-left border-collapse text-xs">
                                                <thead>
                                                    <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-500">
                                                        <th className="py-2.5 px-3">#</th>
                                                        <th className="py-2.5 px-3">Target Timezone ({inputs.targetTimezone})</th>
                                                        <th className="py-2.5 px-3">UTC ISO-8601 Timestamp</th>
                                                        <th className="py-2.5 px-3">Relative Delta</th>
                                                        <th className="py-2.5 px-3">Collision / Window Check</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                                    {report.upcomingRuns.map((run) => (
                                                        <tr
                                                            key={run.runIndex}
                                                            className={
                                                                run.collidesWithSecondaryJob ? 'bg-rose-50/70 dark:bg-rose-950/30' : ''
                                                            }
                                                        >
                                                            <td className="py-2 px-3 font-mono font-bold">{run.runIndex}</td>
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
                                                                        ⚠️ Collides with Secondary Job
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                                                        ✓ Clean Slot
                                                                    </span>
                                                                )}
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
              TAB 2: 14-RULE PRODUCTION RELIABILITY & DST PITFALL LINTER
              ==================================================================== */}
                    {activeStudioTab === 'reliability_linter_14' && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                        14-Rule Production Cron Reliability, Concurrency &amp; DST Pitfall Audit
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Scans for accidental minute floods (<code>* 2 * * *</code>), POSIX <code>DOM+DOW</code> Boolean OR
                                        traps, Quartz/EventBridge <code>?</code> &amp; <code>1–7</code> weekday shifts, DST 02:00 skips,
                                        unescaped <code>%</code> in crontab commands, and self-overlapping job durations.
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
                                                ? 'Ready to Audit — Click "2. Vulnerable Cron Pitfalls Demo" Above to Test the 14-Rule Linter'
                                                : 'All 14 Production Cron Reliability & DST Rules Passed (Score: 100/100 Grade A+)'}
                                        </div>
                                        <p className="text-xs opacity-85 mt-0.5">
                                            Zero minute floods, DOM/DOW Boolean OR traps, DST skip windows, overlap hazards, or unescaped
                                            crontab % characters detected.
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

                    {/* ====================================================================
              TAB 3: CROSS-DIALECT AST TRANSPILER (7 DIALECTS + SYSTEMD ONCALENDAR)
              ==================================================================== */}
                    {activeStudioTab === 'cross_dialect_transpiler' && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                    Cross-Dialect Cron AST Transpiler (POSIX ↔ Quartz ↔ AWS EventBridge ↔ Spring ↔ Jenkins ↔ systemd)
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Automatically shifts numeric Day-of-Week indices (<code>0–6</code> ↔ <code>1–7</code>), injects
                                    required <code>?</code> mutual-exclusion tokens for Quartz/EventBridge, and compiles Linux{' '}
                                    <code>systemd OnCalendar=</code> syntax.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                {[
                                    {
                                        title: '1. Standard POSIX / Linux Crontab (5-Field)',
                                        val: report.crossDialectTranslations.unix5Crontab,
                                        dialect: 'UNIX_5' as CronDialectId,
                                    },
                                    {
                                        title: '2. AWS EventBridge Rule (6-Field with ? & Year)',
                                        val: report.crossDialectTranslations.awsEventBridgeCron,
                                        dialect: 'AWS_EVENTBRIDGE_6' as CronDialectId,
                                    },
                                    {
                                        title: '3. Java Quartz Scheduler (7-Field with Seconds & ?)',
                                        val: report.crossDialectTranslations.quartz7Expression,
                                        dialect: 'QUARTZ_6_7' as CronDialectId,
                                    },
                                    {
                                        title: '4. Spring Boot @Scheduled (6-Field with Seconds)',
                                        val: report.crossDialectTranslations.spring6Scheduled,
                                        dialect: 'SPRING_6' as CronDialectId,
                                    },
                                    {
                                        title: '5. Jenkins Hash-Jitter Pipeline (H Syntax)',
                                        val: report.crossDialectTranslations.jenkinsHashCron,
                                        dialect: 'JENKINS_HASH' as CronDialectId,
                                    },
                                    {
                                        title: '6. Linux systemd Timer (OnCalendar= Specification)',
                                        val: report.crossDialectTranslations.systemdOnCalendar,
                                        dialect: null,
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.title}
                                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3.5 space-y-2 min-w-0"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-bold text-slate-800 dark:text-slate-200">{item.title}</span>
                                            <div className="flex items-center gap-1.5 shrink-0">
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
                        </div>
                    )}

                    {/* ====================================================================
              TAB 4: 10-PLATFORM DEVOPS & IAC CONFIG COMPILER
              ==================================================================== */}
                    {activeStudioTab === 'devops_config_compiler' && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap gap-1.5">
                                    {DEVOPS_PLATFORMS.map((plat) => (
                                        <button
                                            key={plat.id}
                                            type="button"
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
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-700 transition cursor-pointer"
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

                    {/* ====================================================================
              TAB 5: RFC 5545 .ICS CALENDAR & CWE-1236 SAFE .XLSX / .CSV EXPORTS
              ==================================================================== */}
                    {activeStudioTab === 'calendar_audit_exports' && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                    Export Maintenance Schedule to Calendar (`.ics`) or CWE-1236 Safe Audit Spreadsheet (`.xlsx` / `.csv`)
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Import upcoming scheduled runs directly into Google Calendar, Apple Calendar, or Outlook via RFC 5545{' '}
                                    <code>.ics</code>, or download a multi-timezone execution and 14-rule reliability audit report.
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
          SECTION 6: TECHNICAL SPECIFICATION & ZERO-UPLOAD PRIVACY DISCLOSURE
          ============================================================================ */}
            <details className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-xs text-slate-600 dark:text-slate-400">
                <summary className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer flex items-center justify-between">
                    <span className="inline-flex items-center gap-2">
                        <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>
                            7-Dialect Cron Specification, POSIX Boolean OR vs. Spring AND Evaluation &amp; Zero-Upload Privacy
                            Disclosure
                        </span>
                    </span>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold shrink-0">
                        Click to expand
                    </span>
                </summary>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 leading-relaxed">
                    <p>
                        <strong>100% Client-Side Execution:</strong> All cron expressions, shell command strings, and schedule
                        simulations run exclusively inside your browser&apos;s local memory. Zero schedules or infrastructure
                        configurations are uploaded to any external server.
                    </p>
                    <p>
                        <strong>Dialect-Accurate Calendar Math:</strong> Standard 5-field POSIX/Vixie cron, Kubernetes{' '}
                        <code>batch/v1</code>, and GitHub Actions evaluate restricted Day-of-Month and Day-of-Week fields using a
                        Boolean <code>OR</code> union and index weekdays as <code>0–6</code> (<code>0</code> or <code>7</code> =
                        Sunday). Spring <code>@Scheduled</code> uses 6 fields and evaluates Day-of-Month and Day-of-Week with
                        Boolean <code>AND</code>. Java Quartz and AWS EventBridge index weekdays as <code>1–7</code> (<code>1</code>{' '}
                        = Sunday, <code>7</code> = Saturday) and require the <code>?</code> mutual-exclusion wildcard in either
                        Day-of-Month or Day-of-Week.
                    </p>
                </div>
            </details>
        </div>
    );
}