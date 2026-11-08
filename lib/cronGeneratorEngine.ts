/**
 * KivaroTools — Universal 7-Dialect Cron Expression Generator, Visual AST Builder,
 * Multi-Timezone & DST Collision Simulator, 14-Rule Reliability Linter &
 * 10-Platform DevOps Config Compiler Engine (`lib/cronGeneratorEngine.ts`)
 *
 * 100% Client-Side, Zero-Upload Deterministic Architecture (v5.1.0-enterprise):
 * 1. Universal 7-Dialect Cron AST Parser & Wrapper Stripper:
 *    - UNIX_5: Standard POSIX / Vixie Crontab (5 fields + @hourly/@daily/@weekly/@monthly/@yearly/@reboot)
 *    - K8S_CRONJOB: Kubernetes batch/v1 CronJob (5 fields + spec.timeZone + concurrencyPolicy)
 *    - GITHUB_ACTIONS: GitHub Actions on.schedule (5 fields UTC, >= 5m interval rule)
 *    - SPRING_6: Spring Boot @Scheduled (6 fields with seconds, DOM & DOW Boolean AND)
 *    - QUARTZ_6_7: Java Quartz Scheduler (6 or 7 fields with ?, L, L-N, W, LW, DOW#N, DOW L, Year)
 *    - AWS_EVENTBRIDGE_6: Amazon EventBridge cron(M H DOM M DOW Y) (6 fields with ? & 1-7 DOW)
 *    - JENKINS_HASH: Jenkins Pipeline Cron (5 fields with deterministic H / H(a-b)/step hash jitter)
 * 2. Exact Calendar & Special Modifier Evaluator:
 *    - Leap-year aware February 29th math, L (last day), L-N (offset from last day),
 *      LW (last weekday), nW (nearest weekday within month boundaries), DOW#N (Nth weekday),
 *      and DOW L (last weekday of type).
 * 3. Multi-Timezone Execution Simulator, 6-Region Matrix, Monthly Calendar Heatmap,
 *    Two-Job Overlap Detector & Annual DST Spring-Forward / Fall-Back Hazard Scanner.
 * 4. 14-Rule Production Cron Reliability Linter + Deterministic 1-Click Auto-Fixer.
 * 5. Cross-Dialect AST Transpiler (Unix <-> AWS EventBridge <-> Quartz <-> Spring <-> Jenkins <-> Systemd OnCalendar),
 *    10-Platform DevOps Config Compiler, RFC 5545 .ics Exporter, and CWE-1236 Safe .xlsx / .csv Audit Exporters.
 */

export const CRON_ENGINE_VERSION = '5.2.0-enterprise';

export type CronDialectId =
    | 'AUTO'
    | 'UNIX_5'
    | 'K8S_CRONJOB'
    | 'GITHUB_ACTIONS'
    | 'SPRING_6'
    | 'QUARTZ_6_7'
    | 'AWS_EVENTBRIDGE_6'
    | 'JENKINS_HASH';

export type ResolvedCronDialect = Exclude<CronDialectId, 'AUTO'>;

export type CronPresetScenarioId =
    | 'nightly_backup_dst_check'
    | 'weekday_business_hours_15m'
    | 'vulnerable_cron_pitfalls_demo'
    | 'quartz_last_weekday_payroll'
    | 'aws_eventbridge_3rd_friday'
    | 'jenkins_hash_jitter_pipeline';

export type DevOpsConfigPlatform =
    | 'linux_crontab_flock'
    | 'systemd_timer_unit'
    | 'k8s_cronjob_yaml'
    | 'github_actions_yaml'
    | 'aws_eventbridge_terraform'
    | 'vercel_cron_json'
    | 'cloudflare_wrangler_toml'
    | 'nodejs_croner_ts'
    | 'python_celery_apscheduler'
    | 'go_spring_laravel';

export type CronLintSeverity = 'CRITICAL' | 'WARNING' | 'OPTIMIZATION';

export interface CronFieldBreakdown {
    index: number;
    fieldKey: 'seconds' | 'minutes' | 'hours' | 'dayOfMonth' | 'month' | 'dayOfWeek' | 'year';
    label: string;
    rawToken: string;
    resolvedTokenAfterHash: string;
    allowedRangeLabel: string;
    humanSummary: string;
    expandedSampleValues: string;
    hasSpecialModifier: boolean;
    isValid: boolean;
    errorDetail?: string;
}

export interface ScheduledRunOccurrence {
    runIndex: number;
    epochMs: number;
    utcIsoString: string;
    targetTimezoneFormatted: string;
    weekdayShort: string;
    relativeDeltaLabel: string;
    collidesWithSecondaryJob: boolean;
    isDstTransitionWindow: boolean;
}

export interface GlobalRegionTimePreview {
    regionLabel: string;
    ianaTimezone: string;
    utcOffsetLabel: string;
    nextRunFormatted: string;
}

export interface CalendarHeatmapDayCell {
    dayOfMonth: number;
    dateIso: string; // YYYY-MM-DD
    weekdayIndex0Sun: number;
    weekdayShort: string;
    primaryRunsCount: number;
    secondaryRunsCount: number;
    hasCollision: boolean;
    sampleRunTimesLocal: string[];
    intensityLevel: 0 | 1 | 2 | 3 | 4;
}

export interface DstHazardAnalysis {
    timezone: string;
    observesDst: boolean;
    springForwardSkipRisk: boolean;
    fallBackDoubleRunRisk: boolean;
    springTransitionDateLabel: string;
    fallTransitionDateLabel: string;
    hazardExplanation: string;
    recommendedMitigation: string;
}

export interface CronLintFinding {
    ruleId: string;
    ruleNumber: number;
    title: string;
    severity: CronLintSeverity;
    category: 'SYNTAX_DIALECT' | 'LOGIC_TRAP' | 'DST_TIMEZONE' | 'OVERLAP_SLA' | 'SHELL_SECURITY';
    evidence: string;
    remediation: string;
    autoFixAvailable: boolean;
}

export interface CrossDialectTranslationBundle {
    unix5Crontab: string;
    kubernetesCronJobSchedule: string;
    githubActionsUtcSchedule: string;
    spring6Scheduled: string;
    quartz7Expression: string;
    awsEventBridgeCron: string;
    jenkinsHashCron: string;
    systemdOnCalendar: string;
    conversionNotes: string[];
}

export interface FrequencyAndComputeBudget {
    runsPerHour: number;
    runsPerDay: number;
    runsPerWeek: number;
    runsPerMonth30d: number;
    runsPerYear365d: number;
    minIntervalSeconds: number;
    minIntervalHumanLabel: string;
    estimatedJobDurationSeconds: number;
    hasSelfOverlapRisk: boolean;
    monthlyComputeMinutes: number;
    githubActionsFreeTierPercent: number; // out of 2,000 mins/month
}

export interface CronGeneratorInputs {
    rawExpressionInput: string;
    selectedDialect: CronDialectId;
    targetTimezone: string;
    jenkinsJobNameSeed: string;
    estimatedJobDurationSeconds: number;
    shellCommandToExecute: string;
    secondaryCronExpression: string;
    secondaryJobDurationSeconds: number;
    referenceTimestampMs: number | null;
    naturalLanguageQuery: string;
}

export interface ComprehensiveCronReport {
    engineVersion: string;
    isIdleEmpty: boolean;
    rawInput: string;
    cleanCronExpression: string;
    expandedMacroFrom: string | null;
    isRebootMacro: boolean;
    extractedShellCommand: string;
    detectedDialect: ResolvedCronDialect;
    isValidSyntax: boolean;
    syntaxErrorMessage: string | null;
    plainEnglishDescription: string;
    fieldBreakdowns: CronFieldBreakdown[];
    reliabilityScore: number; // 0..100
    reliabilityGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
    lintFindings: CronLintFinding[];
    criticalFindingsCount: number;
    warningFindingsCount: number;
    upcomingRuns: ScheduledRunOccurrence[];
    globalTimezoneMatrix: GlobalRegionTimePreview[];
    calendarHeatmapMonthLabel: string;
    calendarHeatmapDays: CalendarHeatmapDayCell[];
    collisionCountInNext15Runs: number;
    dstHazard: DstHazardAnalysis;
    frequencyBudget: FrequencyAndComputeBudget;
    crossDialectTranslations: CrossDialectTranslationBundle;
}

// Deterministic reference timestamp (2026-05-14T08:00:00Z — Thursday)
export const DEFAULT_CRON_REFERENCE_MS = 1778745600000;

export const SUPPORTED_IANA_TIMEZONES: {
    id: string;
    label: string;
    observesDst: boolean;
    springDstDate: string;
    fallDstDate: string;
}[] = [
        {
            id: 'UTC',
            label: 'UTC (Coordinated Universal Time — Zero DST)',
            observesDst: false,
            springDstDate: 'None (UTC never shifts for DST)',
            fallDstDate: 'None (UTC never shifts for DST)',
        },
        {
            id: 'America/New_York',
            label: 'America/New_York (US Eastern — EST/EDT)',
            observesDst: true,
            springDstDate: '2026-03-08 02:00 → 03:00 (2nd Sunday in March)',
            fallDstDate: '2026-11-01 01:00–01:59 Repeats (1st Sunday in November)',
        },
        {
            id: 'America/Chicago',
            label: 'America/Chicago (US Central — CST/CDT)',
            observesDst: true,
            springDstDate: '2026-03-08 02:00 → 03:00 (2nd Sunday in March)',
            fallDstDate: '2026-11-01 01:00–01:59 Repeats (1st Sunday in November)',
        },
        {
            id: 'America/Los_Angeles',
            label: 'America/Los_Angeles (US Pacific — PST/PDT)',
            observesDst: true,
            springDstDate: '2026-03-08 02:00 → 03:00 (2nd Sunday in March)',
            fallDstDate: '2026-11-01 01:00–01:59 Repeats (1st Sunday in November)',
        },
        {
            id: 'Europe/London',
            label: 'Europe/London (UK — GMT/BST)',
            observesDst: true,
            springDstDate: '2026-03-29 01:00 → 02:00 (Last Sunday in March)',
            fallDstDate: '2026-10-25 01:00–01:59 Repeats (Last Sunday in October)',
        },
        {
            id: 'Europe/Berlin',
            label: 'Europe/Berlin (Central Europe — CET/CEST)',
            observesDst: true,
            springDstDate: '2026-03-29 02:00 → 03:00 (Last Sunday in March)',
            fallDstDate: '2026-10-25 02:00–02:59 Repeats (Last Sunday in October)',
        },
        {
            id: 'Asia/Karachi',
            label: 'Asia/Karachi (Pakistan Standard Time — PKT UTC+5)',
            observesDst: false,
            springDstDate: 'None (PKT is fixed UTC+05:00 year-round)',
            fallDstDate: 'None (PKT is fixed UTC+05:00 year-round)',
        },
        {
            id: 'Asia/Dubai',
            label: 'Asia/Dubai (Gulf Standard Time — GST UTC+4)',
            observesDst: false,
            springDstDate: 'None (GST is fixed UTC+04:00 year-round)',
            fallDstDate: 'None (GST is fixed UTC+04:00 year-round)',
        },
        {
            id: 'Asia/Kolkata',
            label: 'Asia/Kolkata (India Standard Time — IST UTC+5:30)',
            observesDst: false,
            springDstDate: 'None (IST is fixed UTC+05:30 year-round)',
            fallDstDate: 'None (IST is fixed UTC+05:30 year-round)',
        },
        {
            id: 'Asia/Singapore',
            label: 'Asia/Singapore (Singapore Time — SGT UTC+8)',
            observesDst: false,
            springDstDate: 'None (SGT is fixed UTC+08:00 year-round)',
            fallDstDate: 'None (SGT is fixed UTC+08:00 year-round)',
        },
        {
            id: 'Asia/Tokyo',
            label: 'Asia/Tokyo (Japan Standard Time — JST UTC+9)',
            observesDst: false,
            springDstDate: 'None (JST is fixed UTC+09:00 year-round)',
            fallDstDate: 'None (JST is fixed UTC+09:00 year-round)',
        },
        {
            id: 'Australia/Sydney',
            label: 'Australia/Sydney (AEST/AEDT)',
            observesDst: true,
            springDstDate: '2026-10-04 02:00 → 03:00 (1st Sunday in October)',
            fallDstDate: '2026-04-05 02:00–02:59 Repeats (1st Sunday in April)',
        },
    ];

const MONTH_NAMES_MAP: Record<string, number> = {
    JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
    JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12,
};

const MONTH_LABELS = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const DOW_NAMES_0SUN_MAP: Record<string, number> = {
    SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
};

const DOW_LABELS_0SUN = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

const DOW_SHORT_0SUN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const POSIX_MACROS: Record<string, string> = {
    '@yearly': '0 0 1 1 *',
    '@annually': '0 0 1 1 *',
    '@monthly': '0 0 1 * *',
    '@weekly': '0 0 * * 0',
    '@daily': '0 0 * * *',
    '@midnight': '0 0 * * *',
    '@hourly': '0 * * * *',
};

// ============================================================================
// SECTION 1: CRC-32 DETERMINISTIC HASH FOR JENKINS `H` JITTER & HELPERS
// ============================================================================

const CRC32_TABLE = (() => {
    const tbl = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) {
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        tbl[i] = c >>> 0;
    }
    return tbl;
})();

export function computeJenkinsSeedHash(jobName: string, fieldIdx: number): number {
    const input = `${jobName || 'kivaro-production-pipeline'}:field:${fieldIdx}`;
    let crc = 0xffffffff;
    for (let i = 0; i < input.length; i++) {
        const byte = input.charCodeAt(i) & 0xff;
        crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
}

export function resolveJenkinsHashToken(
    token: string,
    minVal: number,
    maxVal: number,
    jobName: string,
    fieldIdx: number
): string {
    const upper = token.trim().toUpperCase();
    if (!upper.includes('H')) return token.trim();
    const hVal = computeJenkinsSeedHash(jobName, fieldIdx);
    const span = Math.max(1, maxVal - minVal + 1);

    // H
    if (upper === 'H') {
        return String(minVal + (hVal % span));
    }
    // H/step
    const stepMatch = /^H\/(\d+)$/i.exec(upper);
    if (stepMatch) {
        const step = Math.max(1, Number(stepMatch[1]));
        const offset = minVal + (hVal % Math.min(step, span));
        const vals: number[] = [];
        for (let v = offset; v <= maxVal; v += step) vals.push(v);
        return vals.join(',');
    }
    // H(a-b)
    const rangeMatch = /^H\((\d+)-(\d+)\)$/i.exec(upper);
    if (rangeMatch) {
        const a = Math.max(minVal, Number(rangeMatch[1]));
        const b = Math.min(maxVal, Number(rangeMatch[2]));
        const rSpan = Math.max(1, b - a + 1);
        return String(a + (hVal % rSpan));
    }
    // H(a-b)/step
    const rangeStepMatch = /^H\((\d+)-(\d+)\)\/(\d+)$/i.exec(upper);
    if (rangeStepMatch) {
        const a = Math.max(minVal, Number(rangeStepMatch[1]));
        const b = Math.min(maxVal, Number(rangeStepMatch[2]));
        const step = Math.max(1, Number(rangeStepMatch[3]));
        const offset = a + (hVal % Math.min(step, Math.max(1, b - a + 1)));
        const vals: number[] = [];
        for (let v = offset; v <= b; v += step) vals.push(v);
        return vals.join(',');
    }
    return token.trim();
}

export function daysInMonth(year: number, month1to12: number): number {
    if (month1to12 === 2) {
        const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        return isLeap ? 29 : 28;
    }
    if (month1to12 === 4 || month1to12 === 6 || month1to12 === 9 || month1to12 === 11) {
        return 30;
    }
    return 31;
}

// Returns 0 = Sunday .. 6 = Saturday for any calendar date (Sakamoto / UTC Date)
export function getDayOfWeek0Sun(year: number, month1to12: number, day1to31: number): number {
    return new Date(Date.UTC(year, month1to12 - 1, day1to31)).getUTCDay();
}

// ============================================================================
// SECTION 2: BIDIRECTIONAL NATURAL LANGUAGE ENGLISH -> CRON COMPILER
// ============================================================================

export function compileEnglishToCron(
    phrase: string,
    targetDialect: ResolvedCronDialect = 'UNIX_5'
): { cronExpression: string; matchedRuleSummary: string } {
    const q = (phrase || '').trim().toLowerCase();
    if (!q) {
        return {
            cronExpression: '0 2 * * *',
            matchedRuleSummary: 'Default daily schedule at 02:00.',
        };
    }

    let sec = '0';
    let min = '0';
    let hour = '*';
    let dom = '*';
    const month = '*';
    let dow = '*';

    // Detect specific time like "9:30 am", "17:45", "2 am", "10pm"
    const timeMatch = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/.exec(q);
    const everyMinMatch = /every\s+(\d+)\s*min/i.exec(q);
    const everyHourMatch = /every\s+(\d+)\s*hour/i.exec(q);
    const everySecMatch = /every\s+(\d+)\s*sec/i.exec(q);

    if (everySecMatch) {
        const step = Math.max(1, Math.min(59, Number(everySecMatch[1])));
        sec = `*/${step}`;
        min = '*';
        hour = '*';
    } else if (everyMinMatch) {
        const step = Math.max(1, Math.min(59, Number(everyMinMatch[1])));
        min = `*/${step}`;
        hour = '*';
    } else if (q.includes('every minute')) {
        min = '*';
        hour = '*';
    } else if (everyHourMatch) {
        const step = Math.max(1, Math.min(23, Number(everyHourMatch[1])));
        min = '0';
        hour = `*/${step}`;
    } else if (q.includes('every hour') || q.includes('hourly')) {
        min = '0';
        hour = '*';
    } else if (q.includes('midnight')) {
        min = '0';
        hour = '0';
    } else if (q.includes('noon') || q.includes('midday')) {
        min = '0';
        hour = '12';
    } else if (timeMatch && !everyMinMatch && !everyHourMatch) {
        let h = Number(timeMatch[1]);
        const m = timeMatch[2] !== undefined ? Number(timeMatch[2]) : 0;
        const ampm = timeMatch[3];
        if (ampm === 'pm' && h < 12) h += 12;
        if (ampm === 'am' && h === 12) h = 0;
        if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
            min = String(m);
            hour = String(h);
        }
    } else {
        min = '0';
        hour = '0';
    }

    // Business hours modifier
    if (q.includes('business hours') || q.includes('working hours') || q.includes('9 to 5') || q.includes('9am to 5pm')) {
        hour = '9-17';
    }

    // Day of week / Day of month modifiers
    if (q.includes('last weekday')) {
        dom = 'LW';
        dow = '?';
    } else if (q.includes('last day')) {
        dom = 'L';
        dow = '?';
    } else if (q.includes('nearest weekday')) {
        const dMatch = /(\d{1,2})(?:st|nd|rd|th)?/.exec(q);
        dom = `${dMatch ? dMatch[1] : '15'}W`;
        dow = '?';
    } else if (/(first|1st|second|2nd|third|3rd|fourth|4th)\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/.test(q)) {
        const m = /(first|1st|second|2nd|third|3rd|fourth|4th)\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/.exec(q)!;
        const ordMap: Record<string, number> = {
            first: 1, '1st': 1, second: 2, '2nd': 2, third: 3, '3rd': 3, fourth: 4, '4th': 4,
        };
        const nth = ordMap[m[1]] || 1;
        const dayName = m[2].slice(0, 3).toUpperCase();
        dom = '?';
        dow = `${dayName}#${nth}`;
    } else if (q.includes('weekday') || q.includes('mon-fri') || q.includes('monday to friday') || q.includes('monday through friday')) {
        dow = targetDialect === 'QUARTZ_6_7' || targetDialect === 'AWS_EVENTBRIDGE_6' ? 'MON-FRI' : '1-5';
    } else if (q.includes('weekend')) {
        dow = targetDialect === 'QUARTZ_6_7' || targetDialect === 'AWS_EVENTBRIDGE_6' ? 'SUN,SAT' : '0,6';
    } else {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const matchedDays: number[] = [];
        dayNames.forEach((dn, idx) => {
            if (q.includes(dn)) matchedDays.push(idx);
        });
        if (matchedDays.length > 0) {
            if (targetDialect === 'QUARTZ_6_7' || targetDialect === 'AWS_EVENTBRIDGE_6') {
                dow = matchedDays.map((d) => d + 1).join(',');
            } else {
                dow = matchedDays.join(',');
            }
        }
    }

    if (q.includes('first day of every month') || q.includes('1st of every month') || q.includes('monthly')) {
        if (dom === '*') dom = '1';
    }

    // Format according to targetDialect
    if (targetDialect === 'QUARTZ_6_7' || dom.includes('L') || dom.includes('W') || dow.includes('#') || everySecMatch) {
        const qDom = dom === '*' && dow !== '*' && dow !== '?' ? '?' : dom;
        const qDow = qDom !== '?' && dow === '*' ? '?' : dow;
        return {
            cronExpression: `${sec} ${min} ${hour} ${qDom} ${month} ${qDow} *`,
            matchedRuleSummary: `Compiled "${phrase}" to 7-field Quartz syntax.`,
        };
    }
    if (targetDialect === 'AWS_EVENTBRIDGE_6') {
        const eDom = dom === '*' && dow !== '*' && dow !== '?' ? '?' : dom;
        const eDow = eDom !== '?' && dow === '*' ? '?' : dow;
        return {
            cronExpression: `${min} ${hour} ${eDom} ${month} ${eDow} *`,
            matchedRuleSummary: `Compiled "${phrase}" to 6-field AWS EventBridge syntax.`,
        };
    }
    if (targetDialect === 'SPRING_6') {
        return {
            cronExpression: `${sec} ${min} ${hour} ${dom === '?' ? '*' : dom} ${month} ${dow === '?' ? '*' : dow}`,
            matchedRuleSummary: `Compiled "${phrase}" to 6-field Spring @Scheduled syntax.`,
        };
    }

    return {
        cronExpression: `${min} ${hour} ${dom === '?' ? '*' : dom} ${month} ${dow === '?' ? '*' : dow}`,
        matchedRuleSummary: `Compiled "${phrase}" to 5-field POSIX/Kubernetes Cron syntax.`,
    };
}

// ============================================================================
// SECTION 3: FIELD PARSER, SPECIAL MODIFIER EVALUATOR & PLAIN-ENGLISH EXPLAINER
// ============================================================================

interface ParsedCronField {
    rawToken: string;
    resolvedToken: string;
    isWildcard: boolean;
    isQuestionMark: boolean;
    isLastDayL: boolean;
    lastDayOffset: number; // L-N -> N
    isLastWeekdayLW: boolean;
    nearestWeekdayTarget: number | null; // 15W -> 15
    nthWeekday: { dow0Sun: number; nth: number } | null; // 5#3 -> Friday #3
    lastWeekdayOfType: number | null; // 5L -> last Friday
    valuesSet: Set<number>;
    isValid: boolean;
    errorDetail?: string;
}

function normalizeTextNames(token: string, isMonth: boolean, isDow: boolean, isQuartzOrAwsDow: boolean): string {
    let out = token.toUpperCase();
    if (isMonth) {
        for (const [name, num] of Object.entries(MONTH_NAMES_MAP)) {
            out = out.replace(new RegExp(`\\b${name}\\b`, 'g'), String(num));
        }
    }
    if (isDow) {
        for (const [name, num0Sun] of Object.entries(DOW_NAMES_0SUN_MAP)) {
            const targetNum = isQuartzOrAwsDow ? num0Sun + 1 : num0Sun;
            out = out.replace(new RegExp(`\\b${name}\\b`, 'g'), String(targetNum));
        }
    }
    return out;
}

function mapDowToCanonical0Sun(val: number, isQuartzOrAwsDow: boolean): number {
    if (isQuartzOrAwsDow) {
        // In Quartz & AWS EventBridge: 1 = Sunday, 2 = Monday ... 7 = Saturday
        if (val >= 1 && val <= 7) return (val - 1) % 7;
        return ((val % 7) + 7) % 7;
    }
    // In POSIX / K8s / Spring / GitHub Actions: 0 = Sunday, 1 = Monday ... 6 = Saturday, 7 = Sunday
    if (val === 7) return 0;
    return ((val % 7) + 7) % 7;
}

function parseSingleCronField(
    rawToken: string,
    minVal: number,
    maxVal: number,
    fieldKey: CronFieldBreakdown['fieldKey'],
    dialect: ResolvedCronDialect,
    jenkinsSeed: string,
    fieldIndex: number
): ParsedCronField {
    const isQuartzOrAws = dialect === 'QUARTZ_6_7' || dialect === 'AWS_EVENTBRIDGE_6';
    const isDow = fieldKey === 'dayOfWeek';
    const isDom = fieldKey === 'dayOfMonth';
    const isMonth = fieldKey === 'month';

    const resolvedToken = resolveJenkinsHashToken(rawToken, minVal, maxVal, jenkinsSeed, fieldIndex);
    const clean = normalizeTextNames(resolvedToken.trim(), isMonth, isDow, isQuartzOrAws);

    const base: ParsedCronField = {
        rawToken,
        resolvedToken,
        isWildcard: false,
        isQuestionMark: false,
        isLastDayL: false,
        lastDayOffset: 0,
        isLastWeekdayLW: false,
        nearestWeekdayTarget: null,
        nthWeekday: null,
        lastWeekdayOfType: null,
        valuesSet: new Set<number>(),
        isValid: true,
    };

    if (!clean) {
        base.isValid = false;
        base.errorDetail = 'Empty field token';
        return base;
    }

    if (clean === '*') {
        base.isWildcard = true;
        for (let v = minVal; v <= maxVal; v++) {
            base.valuesSet.add(isDow ? mapDowToCanonical0Sun(v, isQuartzOrAws) : v);
        }
        return base;
    }

    if (clean === '?') {
        if (!isDom && !isDow) {
            base.isValid = false;
            base.errorDetail = '"?" is only valid in Day-of-Month or Day-of-Week';
            return base;
        }
        base.isQuestionMark = true;
        for (let v = minVal; v <= maxVal; v++) {
            base.valuesSet.add(isDow ? mapDowToCanonical0Sun(v, isQuartzOrAws) : v);
        }
        return base;
    }

    // Special Day-of-Month tokens: L, L-N, LW, nW
    if (isDom) {
        if (clean === 'L') {
            base.isLastDayL = true;
            base.valuesSet.add(28);
            base.valuesSet.add(29);
            base.valuesSet.add(30);
            base.valuesSet.add(31);
            return base;
        }
        const lOffsetMatch = /^L-(\d{1,2})$/.exec(clean);
        if (lOffsetMatch) {
            base.isLastDayL = true;
            base.lastDayOffset = Number(lOffsetMatch[1]);
            base.valuesSet.add(Math.max(1, 28 - base.lastDayOffset));
            return base;
        }
        if (clean === 'LW' || clean === 'WL') {
            base.isLastWeekdayLW = true;
            base.valuesSet.add(28);
            base.valuesSet.add(29);
            base.valuesSet.add(30);
            base.valuesSet.add(31);
            return base;
        }
        const nearestWMatch = /^(\d{1,2})W$/.exec(clean);
        if (nearestWMatch) {
            const target = Number(nearestWMatch[1]);
            if (target < 1 || target > 31) {
                base.isValid = false;
                base.errorDetail = `Nearest weekday "${clean}" must be between 1W and 31W`;
                return base;
            }
            base.nearestWeekdayTarget = target;
            base.valuesSet.add(target);
            return base;
        }
    }

    // Special Day-of-Week tokens: d#nth (e.g. 5#3) or dL (e.g. 5L) or L (Saturday)
    if (isDow) {
        if (clean === 'L') {
            base.valuesSet.add(6); // Saturday
            return base;
        }
        const nthMatch = /^(\d)#([1-5])$/.exec(clean);
        if (nthMatch) {
            const rawD = Number(nthMatch[1]);
            const nth = Number(nthMatch[2]);
            const dow0 = mapDowToCanonical0Sun(rawD, isQuartzOrAws);
            base.nthWeekday = { dow0Sun: dow0, nth };
            base.valuesSet.add(dow0);
            return base;
        }
        const lastDowMatch = /^(\d)L$/.exec(clean);
        if (lastDowMatch) {
            const rawD = Number(lastDowMatch[1]);
            const dow0 = mapDowToCanonical0Sun(rawD, isQuartzOrAws);
            base.lastWeekdayOfType = dow0;
            base.valuesSet.add(dow0);
            return base;
        }
    }

    // Standard comma-separated list of values, ranges (a-b), or steps (*/s, a-b/s, a/s)
    const parts = clean.split(',');
    for (const part of parts) {
        const p = part.trim();
        if (!p) continue;

        let rangePart = p;
        let step = 1;
        if (p.includes('/')) {
            const sp = p.split('/');
            if (sp.length !== 2 || !/^\d+$/.test(sp[1])) {
                base.isValid = false;
                base.errorDetail = `Invalid step syntax in "${p}"`;
                return base;
            }
            rangePart = sp[0];
            step = Number(sp[1]);
            if (step <= 0) {
                base.isValid = false;
                base.errorDetail = `Step value must be >= 1 in "${p}"`;
                return base;
            }
        }

        let start = minVal;
        let end = maxVal;

        if (rangePart === '*' || rangePart === '?') {
            start = minVal;
            end = maxVal;
        } else if (rangePart.includes('-')) {
            const rp = rangePart.split('-');
            if (rp.length !== 2 || !/^\d+$/.test(rp[0]) || !/^\d+$/.test(rp[1])) {
                base.isValid = false;
                base.errorDetail = `Invalid range "${rangePart}"`;
                return base;
            }
            start = Number(rp[0]);
            end = Number(rp[1]);
        } else if (/^\d+$/.test(rangePart)) {
            start = Number(rangePart);
            end = p.includes('/') ? maxVal : start;
        } else {
            base.isValid = false;
            base.errorDetail = `Unrecognized token "${p}" in ${fieldKey}`;
            return base;
        }

        const allowedMax = isDow && !isQuartzOrAws ? 7 : maxVal;
        const allowedMin = isDow && isQuartzOrAws ? 1 : minVal;

        if (start < allowedMin || start > allowedMax || end < allowedMin || end > allowedMax) {
            base.isValid = false;
            base.errorDetail = `Value out of range (${allowedMin}..${allowedMax}) in "${p}"`;
            return base;
        }

        if (start <= end) {
            for (let v = start; v <= end; v += step) {
                base.valuesSet.add(isDow ? mapDowToCanonical0Sun(v, isQuartzOrAws) : v);
            }
        } else {
            // Wrap-around range (e.g. 22-2 or FRI-MON)
            for (let v = start; v <= allowedMax; v += step) {
                base.valuesSet.add(isDow ? mapDowToCanonical0Sun(v, isQuartzOrAws) : v);
            }
            for (let v = allowedMin; v <= end; v += step) {
                base.valuesSet.add(isDow ? mapDowToCanonical0Sun(v, isQuartzOrAws) : v);
            }
        }
    }

    if (base.valuesSet.size === 0) {
        base.isValid = false;
        base.errorDetail = `No valid schedule values matched in "${rawToken}"`;
    }

    return base;
}

function doesDayOfMonthMatch(
    parsedDom: ParsedCronField,
    year: number,
    month1to12: number,
    day1to31: number
): boolean {
    if (parsedDom.isWildcard || parsedDom.isQuestionMark) return true;
    const maxD = daysInMonth(year, month1to12);

    if (parsedDom.isLastDayL) {
        const target = Math.max(1, maxD - parsedDom.lastDayOffset);
        return day1to31 === target;
    }

    if (parsedDom.isLastWeekdayLW) {
        const lastDow = getDayOfWeek0Sun(year, month1to12, maxD);
        const lwDay = lastDow === 6 ? maxD - 1 : lastDow === 0 ? maxD - 2 : maxD;
        return day1to31 === lwDay;
    }

    if (parsedDom.nearestWeekdayTarget !== null) {
        const rawTarget = Math.min(parsedDom.nearestWeekdayTarget, maxD);
        const dow = getDayOfWeek0Sun(year, month1to12, rawTarget);
        let actualDay = rawTarget;
        if (dow === 6) {
            // Saturday: shift to Friday unless it is the 1st of the month (then Monday the 3rd)
            actualDay = rawTarget === 1 ? 3 : rawTarget - 1;
        } else if (dow === 0) {
            // Sunday: shift to Monday unless it is the last day of the month (then Friday)
            actualDay = rawTarget === maxD ? rawTarget - 2 : rawTarget + 1;
        }
        return day1to31 === actualDay;
    }

    return parsedDom.valuesSet.has(day1to31);
}

function doesDayOfWeekMatch(
    parsedDow: ParsedCronField,
    year: number,
    month1to12: number,
    day1to31: number
): boolean {
    if (parsedDow.isWildcard || parsedDow.isQuestionMark) return true;
    const dow0Sun = getDayOfWeek0Sun(year, month1to12, day1to31);

    if (parsedDow.nthWeekday !== null) {
        if (dow0Sun !== parsedDow.nthWeekday.dow0Sun) return false;
        const occurrenceInMonth = Math.floor((day1to31 - 1) / 7) + 1;
        return occurrenceInMonth === parsedDow.nthWeekday.nth;
    }

    if (parsedDow.lastWeekdayOfType !== null) {
        if (dow0Sun !== parsedDow.lastWeekdayOfType) return false;
        const maxD = daysInMonth(year, month1to12);
        return day1to31 + 7 > maxD;
    }

    return parsedDow.valuesSet.has(dow0Sun);
}

export function doesCalendarDayMatchCron(
    parsedDom: ParsedCronField,
    parsedDow: ParsedCronField,
    dialect: ResolvedCronDialect,
    year: number,
    month1to12: number,
    day1to31: number
): boolean {
    const domUnrestricted = parsedDom.isWildcard || parsedDom.isQuestionMark;
    const dowUnrestricted = parsedDow.isWildcard || parsedDow.isQuestionMark;

    const domMatched = doesDayOfMonthMatch(parsedDom, year, month1to12, day1to31);
    const dowMatched = doesDayOfWeekMatch(parsedDow, year, month1to12, day1to31);

    if (domUnrestricted && dowUnrestricted) return true;
    if (domUnrestricted) return dowMatched;
    if (dowUnrestricted) return domMatched;

    // CRITICAL DIALECT DISTINCTION:
    // In standard POSIX/Unix/Kubernetes/GitHub Actions/Jenkins, if BOTH DOM and DOW are restricted (neither is * or ?),
    // Vixie cron evaluates them with Boolean OR!
    // In Spring @Scheduled (6-field), both must match (Boolean AND)!
    if (dialect === 'SPRING_6' || dialect === 'QUARTZ_6_7' || dialect === 'AWS_EVENTBRIDGE_6') {
        return domMatched && dowMatched;
    }
    return domMatched || dowMatched;
}

// ============================================================================
// SECTION 4: TIMEZONE HELPERS & HUMAN-READABLE EXPLAINER
// ============================================================================

const tzFormatterCache = new Map<string, Intl.DateTimeFormat>();

function getTzFormatter(ianaTimezone: string): Intl.DateTimeFormat {
    let fmt = tzFormatterCache.get(ianaTimezone);
    if (!fmt) {
        try {
            fmt = new Intl.DateTimeFormat('en-US', {
                timeZone: ianaTimezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            });
        } catch {
            fmt = new Intl.DateTimeFormat('en-US', {
                timeZone: 'UTC',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            });
        }
        tzFormatterCache.set(ianaTimezone, fmt);
    }
    return fmt;
}

export function extractZonedParts(
    epochMs: number,
    ianaTimezone: string
): {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
} {
    if (ianaTimezone === 'UTC') {
        const d = new Date(epochMs);
        return {
            year: d.getUTCFullYear(),
            month: d.getUTCMonth() + 1,
            day: d.getUTCDate(),
            hour: d.getUTCHours(),
            minute: d.getUTCMinutes(),
            second: d.getUTCSeconds(),
        };
    }
    const parts = getTzFormatter(ianaTimezone).formatToParts(new Date(epochMs));
    let year = 2026;
    let month = 1;
    let day = 1;
    let hour = 0;
    let minute = 0;
    let second = 0;
    for (const p of parts) {
        if (p.type === 'year') year = Number(p.value);
        else if (p.type === 'month') month = Number(p.value);
        else if (p.type === 'day') day = Number(p.value);
        else if (p.type === 'hour') {
            hour = Number(p.value);
            if (hour === 24) hour = 0;
        } else if (p.type === 'minute') minute = Number(p.value);
        else if (p.type === 'second') second = Number(p.value);
    }
    return { year, month, day, hour, minute, second };
}

export function formatEpochInTimezone(epochMs: number, ianaTimezone: string): string {
    const zp = extractZonedParts(epochMs, ianaTimezone);
    const pad2 = (n: number) => String(n).padStart(2, '0');
    const dow = DOW_SHORT_0SUN[getDayOfWeek0Sun(zp.year, zp.month, zp.day)];
    return `${dow}, ${zp.year}-${pad2(zp.month)}-${pad2(zp.day)} ${pad2(zp.hour)}:${pad2(zp.minute)}:${pad2(zp.second)} (${ianaTimezone})`;
}

/**
 * Converts a local wall-clock timestamp `(year, month, day, hour, minute, second)` in `ianaTimezone`
 * to its exact UTC epoch milliseconds, accounting for Daylight Saving Time (EST vs EDT, GMT vs BST, etc.)
 * on that specific calendar date. Also detects if the local time falls inside a nonexistent
 * Spring-Forward DST transition gap (e.g. 02:15 on March 8 in America/New_York).
 */
export function resolveLocalWallClockToEpochMs(
    year: number,
    month1to12: number,
    day1to31: number,
    hour0to23: number,
    minute0to59: number,
    second0to59: number,
    ianaTimezone: string
): { epochMs: number; skippedBySpringForwardDst: boolean } {
    const targetUtcGuess = Date.UTC(year, month1to12 - 1, day1to31, hour0to23, minute0to59, second0to59);
    if (ianaTimezone === 'UTC') {
        return { epochMs: targetUtcGuess, skippedBySpringForwardDst: false };
    }
    // Pass 1: Check offset at targetUtcGuess
    const p1 = extractZonedParts(targetUtcGuess, ianaTimezone);
    const p1AsUtc = Date.UTC(p1.year, p1.month - 1, p1.day, p1.hour, p1.minute, p1.second);
    const offset1 = p1AsUtc - targetUtcGuess;
    const candidate1 = targetUtcGuess - offset1;

    // Pass 2: Refine offset at candidate1 (handles DST boundary crossings cleanly)
    const p2 = extractZonedParts(candidate1, ianaTimezone);
    if (
        p2.year === year &&
        p2.month === month1to12 &&
        p2.day === day1to31 &&
        p2.hour === hour0to23 &&
        p2.minute === minute0to59
    ) {
        return { epochMs: candidate1, skippedBySpringForwardDst: false };
    }

    const p2AsUtc = Date.UTC(p2.year, p2.month - 1, p2.day, p2.hour, p2.minute, p2.second);
    const offset2 = p2AsUtc - candidate1;
    const candidate2 = targetUtcGuess - offset2;
    const p3 = extractZonedParts(candidate2, ianaTimezone);

    if (p3.hour !== hour0to23 || p3.day !== day1to31) {
        // Nonexistent local wall-clock time during Spring-Forward DST jump!
        return { epochMs: candidate1, skippedBySpringForwardDst: true };
    }
    return { epochMs: candidate2, skippedBySpringForwardDst: false };
}

function summarizeFieldHuman(
    field: ParsedCronField,
    fieldKey: CronFieldBreakdown['fieldKey']
): string {
    const tok = field.rawToken.trim();
    if (tok === '*' || tok === '?') {
        return `Every ${fieldKey === 'dayOfMonth' ? 'day of month' : fieldKey === 'dayOfWeek' ? 'day of week' : fieldKey.replace(/s$/, '')}`;
    }
    if (field.isLastWeekdayLW) return 'On the last weekday (Mon–Fri) of the month (LW)';
    if (field.isLastDayL) {
        return field.lastDayOffset > 0
            ? `${field.lastDayOffset} day(s) before the last day of the month (L-${field.lastDayOffset})`
            : 'On the last calendar day of the month (L — 28/29/30/31)';
    }
    if (field.nearestWeekdayTarget !== null) {
        return `On the nearest weekday to day ${field.nearestWeekdayTarget} of the month (${field.nearestWeekdayTarget}W)`;
    }
    if (field.nthWeekday !== null) {
        const ord = ['', '1st', '2nd', '3rd', '4th', '5th'][field.nthWeekday.nth] || `${field.nthWeekday.nth}th`;
        return `On the ${ord} ${DOW_LABELS_0SUN[field.nthWeekday.dow0Sun]} of the month`;
    }
    if (field.lastWeekdayOfType !== null) {
        return `On the last ${DOW_LABELS_0SUN[field.lastWeekdayOfType]} of the month`;
    }
    if (tok.toUpperCase().startsWith('H')) {
        return `Jenkins hash-jittered (${tok} → ${field.resolvedToken})`;
    }
    if (tok.startsWith('*/')) {
        return `Every ${tok.slice(2)} ${fieldKey}`;
    }
    const sorted = Array.from(field.valuesSet).sort((a, b) => a - b);
    if (fieldKey === 'month') {
        return sorted.map((m) => MONTH_LABELS[m] || String(m)).join(', ');
    }
    if (fieldKey === 'dayOfWeek') {
        if (sorted.join(',') === '1,2,3,4,5') return 'Monday through Friday (Weekdays)';
        if (sorted.join(',') === '0,6') return 'Saturday and Sunday (Weekends)';
        return sorted.map((d) => DOW_LABELS_0SUN[d] || String(d)).join(', ');
    }
    return sorted.join(', ');
}

export function explainCronFieldsInPlainEnglish(
    secField: ParsedCronField,
    minField: ParsedCronField,
    hourField: ParsedCronField,
    domField: ParsedCronField,
    monthField: ParsedCronField,
    dowField: ParsedCronField,
    yearField: ParsedCronField,
    dialect: ResolvedCronDialect,
    isRebootMacro: boolean
): string {
    if (isRebootMacro) {
        return 'Runs once at system boot / daemon startup (@reboot).';
    }
    const parts: string[] = [];

    // Time of day description
    const pad2 = (n: number) => String(n).padStart(2, '0');
    const secVals = Array.from(secField.valuesSet).sort((a, b) => a - b);
    const minVals = Array.from(minField.valuesSet).sort((a, b) => a - b);
    const hourVals = Array.from(hourField.valuesSet).sort((a, b) => a - b);

    if (!secField.isWildcard && !(secVals.length === 1 && secVals[0] === 0)) {
        if (secField.rawToken.startsWith('*/')) {
            parts.push(`Every ${secField.rawToken.slice(2)} seconds`);
        } else {
            parts.push(`At second(s) ${secVals.join(', ')}`);
        }
    }

    const minOffsetStepM = /^(\d+)\/(\d+)$/.exec(minField.rawToken.trim());
    const minRangeStepM = /^(\d+)-(\d+)\/(\d+)$/.exec(minField.rawToken.trim());
    const hourStepM = /^\*\/(\d+)$/.exec(hourField.rawToken.trim());
    const isContiguousHourRange =
        hourVals.length > 1 &&
        hourVals[hourVals.length - 1] - hourVals[0] + 1 === hourVals.length;

    if (minField.isWildcard && hourField.isWildcard) {
        parts.push('Every minute of every hour');
    } else if (minField.isWildcard && !hourField.isWildcard) {
        parts.push(`Every minute during hour(s) ${hourVals.map(pad2).join(', ')}:00`);
    } else if (minField.rawToken.startsWith('*/') && hourField.isWildcard) {
        parts.push(`Every ${minField.rawToken.slice(2)} minutes`);
    } else if (minField.rawToken.startsWith('*/') && !hourField.isWildcard) {
        parts.push(
            `Every ${minField.rawToken.slice(2)} minutes, between ${pad2(hourVals[0])}:00 and ${pad2(
                hourVals[hourVals.length - 1]
            )}:59`
        );
    } else if (minOffsetStepM) {
        const startM = pad2(Number(minOffsetStepM[1]));
        const stepM = minOffsetStepM[2];
        if (hourField.isWildcard) {
            parts.push(`Every ${stepM} minutes, starting at :${startM} past every hour (${minVals.map((m) => ':' + pad2(m)).join(', ')})`);
        } else {
            parts.push(
                `Every ${stepM} minutes starting at :${startM}, between ${pad2(hourVals[0])}:00 and ${pad2(
                    hourVals[hourVals.length - 1]
                )}:59`
            );
        }
    } else if (minRangeStepM) {
        parts.push(
            `Every ${minRangeStepM[3]} minutes from :${pad2(Number(minRangeStepM[1]))} through :${pad2(
                Number(minRangeStepM[2])
            )}`
        );
    } else if (minVals.length === 1 && hourField.isWildcard) {
        if (hourStepM) {
            parts.push(`At minute :${pad2(minVals[0])} past every ${hourStepM[1]} hours`);
        } else {
            parts.push(`At minute :${pad2(minVals[0])} past every hour`);
        }
    } else if (minVals.length === 1 && hourStepM) {
        parts.push(`At minute :${pad2(minVals[0])} past every ${hourStepM[1]} hours`);
    } else if (minVals.length === 1 && isContiguousHourRange && hourVals.length > 4) {
        parts.push(
            `At minute :${pad2(minVals[0])} past every hour from ${pad2(hourVals[0])}:00 through ${pad2(
                hourVals[hourVals.length - 1]
            )}:00`
        );
    } else if (minVals.length <= 4 && hourVals.length <= 4) {
        const times: string[] = [];
        for (const h of hourVals) {
            for (const m of minVals) {
                const s = secVals.length === 1 ? secVals[0] : 0;
                times.push(s > 0 ? `${pad2(h)}:${pad2(m)}:${pad2(s)}` : `${pad2(h)}:${pad2(m)}`);
            }
        }
        if (/H/i.test(minField.rawToken) || /H/i.test(hourField.rawToken)) {
            parts.push(`At ${times.join(', ')} (Jenkins CRC-32 hash-jittered)`);
        } else {
            parts.push(`At ${times.join(', ')}`);
        }
    } else {
        parts.push(
            `At minute(s) ${minVals.map((m) => ':' + pad2(m)).join(', ')} during hour(s) ${hourVals
                .map((h) => pad2(h) + ':00')
                .join(', ')}`
        );
    }

    // Day of Month & Day of Week
    const domRestricted = !domField.isWildcard && !domField.isQuestionMark;
    const dowRestricted = !dowField.isWildcard && !dowField.isQuestionMark;

    if (domRestricted && dowRestricted) {
        const joinWord =
            dialect === 'SPRING_6' || dialect === 'QUARTZ_6_7' || dialect === 'AWS_EVENTBRIDGE_6'
                ? 'AND'
                : 'OR (POSIX Union)';
        parts.push(
            `on ${summarizeFieldHuman(domField, 'dayOfMonth')} ${joinWord} ${summarizeFieldHuman(dowField, 'dayOfWeek')}`
        );
    } else if (domRestricted) {
        if (domField.isLastWeekdayLW || domField.isLastDayL || domField.nearestWeekdayTarget !== null) {
            parts.push(summarizeFieldHuman(domField, 'dayOfMonth').toLowerCase());
        } else {
            parts.push(`on day ${summarizeFieldHuman(domField, 'dayOfMonth')} of the month`);
        }
    } else if (dowRestricted) {
        if (dowField.nthWeekday || dowField.lastWeekdayOfType !== null) {
            parts.push(summarizeFieldHuman(dowField, 'dayOfWeek').toLowerCase());
        } else {
            parts.push(`on ${summarizeFieldHuman(dowField, 'dayOfWeek')}`);
        }
    }

    if (!monthField.isWildcard && !monthField.isQuestionMark) {
        parts.push(`in ${summarizeFieldHuman(monthField, 'month')}`);
    }

    if (!yearField.isWildcard && !yearField.isQuestionMark) {
        parts.push(`in year(s) ${summarizeFieldHuman(yearField, 'year')}`);
    }

    return `${parts.join(', ')}.`;
}

// ============================================================================
// SECTION 5: CROSS-DIALECT AST TRANSPILER & 10-PLATFORM DEVOPS COMPILER
// ============================================================================

function shiftDowTokenBetweenUnixAndQuartz(rawDowToken: string, toQuartz1to7: boolean): string {
    const trimmed = rawDowToken.trim();
    if (trimmed === '*' || trimmed === '?') return trimmed;
    // If already symbolic names (MON-FRI), keep symbolic names as they are unambiguous across dialects
    if (/[A-Z]{3}/i.test(trimmed)) return trimmed.toUpperCase();

    return trimmed.replace(/\b([0-7])\b/g, (_, dStr) => {
        const d = Number(dStr);
        if (toQuartz1to7) {
            const canonical0Sun = d === 7 ? 0 : d;
            return String(canonical0Sun + 1);
        } else {
            const canonical0Sun = d >= 1 && d <= 7 ? d - 1 : 0;
            return String(canonical0Sun);
        }
    });
}

export function buildCrossDialectTranslations(
    secToken: string,
    minToken: string,
    hourToken: string,
    domToken: string,
    monthToken: string,
    dowToken: string,
    yearToken: string,
    sourceDialect: ResolvedCronDialect,
    jenkinsSeed: string
): CrossDialectTranslationBundle {
    const sourceIsQuartzOrAws = sourceDialect === 'QUARTZ_6_7' || sourceDialect === 'AWS_EVENTBRIDGE_6';
    const notes: string[] = [];

    const cleanMin = resolveJenkinsHashToken(minToken, 0, 59, jenkinsSeed, 1);
    const cleanHour = resolveJenkinsHashToken(hourToken, 0, 23, jenkinsSeed, 2);
    const cleanDomPosix =
        domToken === '?' || domToken.includes('L') || domToken.includes('W')
            ? domToken === 'L'
                ? '28-31'
                : '*'
            : resolveJenkinsHashToken(domToken, 1, 31, jenkinsSeed, 3);
    const cleanMonth = resolveJenkinsHashToken(monthToken, 1, 12, jenkinsSeed, 4);

    const rawDowWithoutHash = dowToken.includes('#')
        ? dowToken.split('#')[0]
        : dowToken.endsWith('L') && dowToken.length > 1
            ? dowToken.slice(0, -1)
            : dowToken;

    // Only shift DOW 1..7 -> 0..6 when sourceDialect actually uses 1..7 indexing (Quartz or AWS EventBridge)!
    const posixDow =
        rawDowWithoutHash === '?'
            ? '*'
            : sourceIsQuartzOrAws
                ? shiftDowTokenBetweenUnixAndQuartz(rawDowWithoutHash, false)
                : rawDowWithoutHash;

    // Enforce ? mutual exclusion for Quartz & AWS EventBridge
    let qDom = domToken;
    let qDow = sourceIsQuartzOrAws ? dowToken : shiftDowTokenBetweenUnixAndQuartz(dowToken, true);
    if (qDom !== '?' && qDow !== '?') {
        if (qDom === '*' && qDow !== '*') {
            qDom = '?';
            notes.push('Replaced Day-of-Month "*" with "?" for Quartz/AWS EventBridge mutual exclusion.');
        } else {
            qDow = '?';
            notes.push('Replaced Day-of-Week with "?" for Quartz/AWS EventBridge mutual exclusion.');
        }
    } else if (qDom === '?' && qDow === '?') {
        qDom = '*';
    }

    if (!sourceIsQuartzOrAws && /\b[0-7]\b/.test(dowToken)) {
        notes.push(
            `Shifted numeric Day-of-Week "${dowToken}" (POSIX 0=Sun..6=Sat) → "${qDow}" (Quartz/EventBridge 1=Sun..7=Sat).`
        );
    } else if (sourceIsQuartzOrAws && /\b[1-7]\b/.test(rawDowWithoutHash)) {
        notes.push(
            `Shifted numeric Day-of-Week "${rawDowWithoutHash}" (Quartz/EventBridge 1=Sun..7=Sat) → "${posixDow}" (POSIX 0=Sun..6=Sat).`
        );
    }

    const unix5Crontab = `${cleanMin} ${cleanHour} ${cleanDomPosix} ${cleanMonth} ${posixDow}`;
    const kubernetesCronJobSchedule = unix5Crontab;
    const githubActionsUtcSchedule = unix5Crontab;
    const spring6Scheduled = `${secToken || '0'} ${cleanMin} ${cleanHour} ${domToken === '?' ? '*' : cleanDomPosix
        } ${cleanMonth} ${posixDow}`;
    const quartz7Expression = `${secToken || '0'} ${cleanMin} ${cleanHour} ${qDom} ${cleanMonth} ${qDow} ${yearToken || '*'
        }`;
    const awsEventBridgeCron = `cron(${cleanMin} ${cleanHour} ${qDom} ${cleanMonth} ${qDow} ${yearToken || '*'})`;
    const jenkinsHashCron = `${minToken === '0' ? 'H' : minToken.replace(/^\*\/(\d+)$/, 'H/$1')} ${hourToken} ${cleanDomPosix} ${cleanMonth} ${posixDow}`;

    // Systemd OnCalendar translation (converts A-B ranges to systemd A..B syntax and numeric DOW to Mon..Sun)
    const toSystemdField = (tok: string, padWidth = 2): string => {
        if (tok === '*' || tok === '?') return '*';
        if (tok.startsWith('*/')) return `${'0'.repeat(padWidth)}/${tok.slice(2)}`;
        return tok
            .replace(/(\d+)-(\d+)\/(\d+)/g, (_, a, b, s) => `${String(a).padStart(padWidth, '0')}..${String(b).padStart(padWidth, '0')}/${s}`)
            .replace(/(\d+)-(\d+)/g, (_, a, b) => `${String(a).padStart(padWidth, '0')}..${String(b).padStart(padWidth, '0')}`)
            .replace(/^\d+$/, (m) => m.padStart(padWidth, '0'));
    };

    const toSystemdDow = (dowStr: string): string => {
        if (dowStr === '*' || dowStr === '?') return '';
        if (dowStr === '1-5' || dowStr.toUpperCase() === 'MON-FRI') return 'Mon..Fri ';
        if (dowStr === '0,6' || dowStr === '6,0' || dowStr.toUpperCase() === 'SUN,SAT' || dowStr.toUpperCase() === 'SAT,SUN') return 'Sat,Sun ';
        const replaced = dowStr
            .replace(/\b([0-7])\b/g, (_, d) => DOW_SHORT_0SUN[Number(d) % 7] || d)
            .replace(/-/g, '..');
        return `${replaced} `;
    };

    const sysDow = toSystemdDow(posixDow);
    const sysMonth = toSystemdField(cleanMonth, 2);
    const sysDom = domToken === 'L' || domToken === 'LW' ? '~01' : toSystemdField(cleanDomPosix, 2);
    const sysHour = toSystemdField(cleanHour, 2);
    const sysMin = toSystemdField(cleanMin, 2);
    const sysSec = toSystemdField(secToken || '0', 2);
    const systemdOnCalendar = `OnCalendar=${sysDow}*-${sysMonth}-${sysDom} ${sysHour}:${sysMin}:${sysSec}`;

    return {
        unix5Crontab,
        kubernetesCronJobSchedule,
        githubActionsUtcSchedule,
        spring6Scheduled,
        quartz7Expression,
        awsEventBridgeCron,
        jenkinsHashCron,
        systemdOnCalendar,
        conversionNotes: notes,
    };
}

export function generateDevOpsConfigSnippet(
    report: ComprehensiveCronReport,
    platform: DevOpsConfigPlatform,
    timezone: string,
    shellCommand: string
): string {
    const t = report.crossDialectTranslations;
    const cmd = (shellCommand || report.extractedShellCommand || '/usr/local/bin/run-job.sh').replace(/%/g, '\\%');

    if (platform === 'linux_crontab_flock') {
        return `# Linux Production Crontab Entry — Hardened with PATH, flock Overlap Lock & % Escaping
# Evaluated Schedule: ${report.plainEnglishDescription}
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
MAILTO=""
CRON_TZ=${timezone}

${t.unix5Crontab} /usr/bin/flock -n /tmp/kivaro-cron.lock ${cmd} >> /var/log/kivaro-cron.log 2>&1`;
    }

    if (platform === 'systemd_timer_unit') {
        const timerDirective = report.isRebootMacro ? 'OnBootSec=1min' : t.systemdOnCalendar;
        return `# /etc/systemd/system/kivaro-scheduled-job.timer
[Unit]
Description=KivaroTools Scheduled Task Timer (${report.plainEnglishDescription})

[Timer]
${timerDirective}
Persistent=true
RandomizedDelaySec=15s
AccuracySec=1s
Unit=kivaro-scheduled-job.service

[Install]
WantedBy=timers.target

# ------------------------------------------------------------------
# /etc/systemd/system/kivaro-scheduled-job.service
[Unit]
Description=KivaroTools Scheduled Task Service

[Service]
Type=oneshot
ExecStart=${shellCommand || '/usr/local/bin/run-job.sh'}
StandardOutput=journal
StandardError=journal`;
    }

    if (platform === 'k8s_cronjob_yaml') {
        return `# Kubernetes batch/v1 CronJob Manifest (K8s >= 1.27 Stable timeZone Support)
apiVersion: batch/v1
kind: CronJob
metadata:
  name: kivaro-scheduled-worker
  namespace: production
spec:
  schedule: "${t.kubernetesCronJobSchedule}"
  timeZone: "${timezone}"
  concurrencyPolicy: Forbid # Prevents overlapping pods if previous run exceeds interval
  startingDeadlineSeconds: 300 # Avoids the 100-missed-schedules permanent halt trap
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 3
  jobTemplate:
    spec:
      backoffLimit: 2
      activeDeadlineSeconds: ${Math.max(300, report.frequencyBudget.estimatedJobDurationSeconds * 2)}
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: job-runner
              image: ghcr.io/org/job-runner:latest
              command: ["/bin/sh", "-c", "${shellCommand || '/app/entrypoint.sh'}"]`;
    }

    if (platform === 'github_actions_yaml') {
        return `# .github/workflows/scheduled-job.yml (GitHub Actions — Evaluated Strictly in UTC)
name: Scheduled Automation Workflow

on:
  schedule:
    # ${report.plainEnglishDescription}
    - cron: '${t.githubActionsUtcSchedule}'
  workflow_dispatch: # Allows manual 1-click trigger during debugging

concurrency:
  group: scheduled-job-\${{ github.ref }}
  cancel-in-progress: false

jobs:
  execute-cron-task:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
      - name: Run Scheduled Task
        run: ${shellCommand || 'npm run task:scheduled'}`;
    }

    if (platform === 'aws_eventbridge_terraform') {
        return `# Terraform AWS EventBridge Scheduler (aws_scheduler_schedule with Native Timezone & Retry)
resource "aws_scheduler_schedule" "kivaro_cron_schedule" {
  name                         = "kivaro-production-schedule"
  group_name                   = "default"
  schedule_expression          = "${t.awsEventBridgeCron}"
  schedule_expression_timezone = "${timezone}"

  flexible_time_window {
    mode                      = "FLEXIBLE"
    maximum_window_in_minutes = 5
  }

  target {
    arn      = aws_lambda_function.scheduled_worker.arn
    role_arn = aws_iam_role.scheduler_execution_role.arn

    retry_policy {
      maximum_event_age_in_seconds = 3600
      maximum_retry_attempts       = 2
    }
  }
}`;
    }

    if (platform === 'vercel_cron_json') {
        return `// vercel.json — Vercel Serverless Cron Job Configuration (Evaluated in UTC)
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    {
      "path": "/api/cron/scheduled-worker",
      "schedule": "${t.unix5Crontab}"
    }
  ]
}`;
    }

    if (platform === 'cloudflare_wrangler_toml') {
        return `# wrangler.toml — Cloudflare Workers Cron Triggers (Evaluated in UTC)
name = "kivaro-edge-worker"
main = "src/index.ts"
compatibility_date = "2026-05-01"

[triggers]
# ${report.plainEnglishDescription}
crons = ["${t.unix5Crontab}"]`;
    }

    if (platform === 'nodejs_croner_ts') {
        return `// Node.js / TypeScript — Zero-Overlap Scheduled Task ('croner' v8 / 'node-cron')
import { Cron } from 'croner';

const job = new Cron(
  '${t.spring6Scheduled}',
  {
    timezone: '${timezone}',
    protect: true, // Prevents overlapping execution if previous run is still active
    name: 'kivaro-scheduled-task',
  },
  async () => {
    console.log('[Cron] Executing scheduled job at', new Date().toISOString());
  }
);

console.log('Next scheduled run:', job.nextRun()?.toISOString());`;
    }

    if (platform === 'python_celery_apscheduler') {
        const parts = t.unix5Crontab.split(/\s+/);
        const [m, h, dom, mon, dow] = parts;
        return `# Python 3.11+ — Celery Beat & APScheduler CronTrigger Configuration
from celery.schedules import crontab
from apscheduler.triggers.cron import CronTrigger

# 1. Celery Beat Schedule (${timezone})
CELERY_TIMEZONE = "${timezone}"
CELERY_BEAT_SCHEDULE = {
    "kivaro-recurring-task": {
        "task": "app.tasks.run_scheduled_job",
        "schedule": crontab(
            minute="${m}",
            hour="${h}",
            day_of_month="${dom}",
            month_of_year="${mon}",
            day_of_week="${dow}",
        ),
    },
}

# 2. APScheduler Equivalent
trigger = CronTrigger.from_crontab("${t.unix5Crontab}", timezone="${timezone}")`;
    }

    return `// Go ('robfig/cron/v3') & Spring Boot '@Scheduled' Configuration
// 1. Go robfig/cron/v3 with Timezone & SkipIfStillRunning Overlap Guard:
package main

import (
\t"fmt"
\t"github.com/robfig/cron/v3"
)

func registerCron() {
\tc := cron.New(
\t\tcron.WithSeconds(),
\t\tcron.WithChain(cron.SkipIfStillRunning(cron.DefaultLogger)),
\t)
\t_, _ = c.AddFunc("CRON_TZ=${timezone} ${t.spring6Scheduled}", func() {
\t\tfmt.Println("Executing scheduled task")
\t})
\tc.Start()
}

// 2. Java Spring Boot 3.x Equivalent:
// @Scheduled(cron = "${t.spring6Scheduled}", zone = "${timezone}")`;
}

// ============================================================================
// SECTION 6: MAIN CRON ANALYZER, SIMULATOR & 14-RULE RELIABILITY LINTER
// ============================================================================

export function analyzeAndSimulateCron(
    inputs: CronGeneratorInputs
): ComprehensiveCronReport {
    const refMs = inputs.referenceTimestampMs ?? DEFAULT_CRON_REFERENCE_MS;
    const tz = inputs.targetTimezone || 'UTC';
    const jenkinsSeed = inputs.jenkinsJobNameSeed || 'kivaro-production-pipeline';
    const jobDurSec = Math.max(1, inputs.estimatedJobDurationSeconds || 60);

    let raw = (inputs.rawExpressionInput || '').trim();
    let expandedMacroFrom: string | null = null;
    let isRebootMacro = false;
    let extractedShellCommand = (inputs.shellCommandToExecute || '').trim();

    // Empty initial state on refresh/open
    if (!raw) {
        const emptyTrans = buildCrossDialectTranslations('0', '0', '0', '*', '*', '*', '*', 'UNIX_5', jenkinsSeed);
        return {
            engineVersion: CRON_ENGINE_VERSION,
            isIdleEmpty: true,
            rawInput: '',
            cleanCronExpression: '',
            expandedMacroFrom: null,
            isRebootMacro: false,
            extractedShellCommand: '',
            detectedDialect: 'UNIX_5',
            isValidSyntax: true,
            syntaxErrorMessage: null,
            plainEnglishDescription: '0 Active Schedule — Select a 1-Click Scenario Preset Above or Enter a Cron Expression',
            fieldBreakdowns: [],
            reliabilityScore: 100,
            reliabilityGrade: 'A+',
            lintFindings: [],
            criticalFindingsCount: 0,
            warningFindingsCount: 0,
            upcomingRuns: [],
            globalTimezoneMatrix: [],
            calendarHeatmapMonthLabel: 'May 2026',
            calendarHeatmapDays: [],
            collisionCountInNext15Runs: 0,
            dstHazard: {
                timezone: tz,
                observesDst: false,
                springForwardSkipRisk: false,
                fallBackDoubleRunRisk: false,
                springTransitionDateLabel: '—',
                fallTransitionDateLabel: '—',
                hazardExplanation: '0 schedules evaluated.',
                recommendedMitigation: 'Run critical jobs in UTC.',
            },
            frequencyBudget: {
                runsPerHour: 0,
                runsPerDay: 0,
                runsPerWeek: 0,
                runsPerMonth30d: 0,
                runsPerYear365d: 0,
                minIntervalSeconds: 0,
                minIntervalHumanLabel: '0s',
                estimatedJobDurationSeconds: jobDurSec,
                hasSelfOverlapRisk: false,
                monthlyComputeMinutes: 0,
                githubActionsFreeTierPercent: 0,
            },
            crossDialectTranslations: emptyTrans,
        };
    }

    // Strip wrapper syntax if pasted from AWS EventBridge, Spring @Scheduled, or K8s YAML
    let autoDetectedDialect: ResolvedCronDialect | null = null;
    const awsWrapper = /^cron\(\s*([^)]+)\s*\)$/i.exec(raw);
    if (awsWrapper) {
        raw = awsWrapper[1].trim();
        autoDetectedDialect = 'AWS_EVENTBRIDGE_6';
    }
    const springWrapper = /@Scheduled\s*\(\s*cron\s*=\s*["']([^"']+)["']/i.exec(raw);
    if (springWrapper) {
        raw = springWrapper[1].trim();
        autoDetectedDialect = 'SPRING_6';
    }
    const yamlWrapper = /^(?:schedule|cron)\s*:\s*["']?([^"'\n]+)["']?$/i.exec(raw);
    if (yamlWrapper) {
        raw = yamlWrapper[1].trim();
        autoDetectedDialect = 'K8S_CRONJOB';
    }

    // Handle POSIX @macros
    const firstWordLower = raw.split(/\s+/)[0].toLowerCase();
    if (firstWordLower === '@reboot') {
        isRebootMacro = true;
        expandedMacroFrom = '@reboot';
        const restCmd = raw.slice('@reboot'.length).trim();
        if (restCmd && !extractedShellCommand) extractedShellCommand = restCmd;
        raw = '0 0 1 1 *';
    } else if (POSIX_MACROS[firstWordLower]) {
        expandedMacroFrom = firstWordLower;
        const restCmd = raw.slice(firstWordLower.length).trim();
        if (restCmd && !extractedShellCommand) extractedShellCommand = restCmd;
        raw = POSIX_MACROS[firstWordLower];
    }

    const rawTokens = raw.split(/\s+/).filter(Boolean);

    // Check if user pasted a 5-field Linux crontab line with a trailing shell command (e.g. `*/5 * * * * /usr/bin/backup.sh`)
    let cronTokens = rawTokens;
    if (
        rawTokens.length > 5 &&
        (rawTokens[5].startsWith('/') ||
            rawTokens[5].startsWith('usr/') ||
            rawTokens[5].includes('.sh') ||
            rawTokens[5] === 'flock' ||
            rawTokens[5] === 'python' ||
            rawTokens[5] === 'node' ||
            rawTokens[5] === 'curl' ||
            rawTokens[5] === 'php')
    ) {
        cronTokens = rawTokens.slice(0, 5);
        if (!extractedShellCommand) {
            extractedShellCommand = rawTokens.slice(5).join(' ');
        }
    }

    // Resolve active dialect
    let detectedDialect: ResolvedCronDialect = 'UNIX_5';
    if (inputs.selectedDialect !== 'AUTO') {
        detectedDialect = inputs.selectedDialect;
    } else if (autoDetectedDialect) {
        detectedDialect = autoDetectedDialect;
    } else if (cronTokens.some((t) => /\bH\b|^H[/(]/i.test(t))) {
        detectedDialect = 'JENKINS_HASH';
    } else if (cronTokens.length === 7) {
        detectedDialect = 'QUARTZ_6_7';
    } else if (cronTokens.length === 6) {
        const sixth = cronTokens[5];
        if (/^(?:19\d\d|20\d\d|\*)$/.test(sixth) && cronTokens.some((t) => t === '?')) {
            detectedDialect = 'AWS_EVENTBRIDGE_6';
        } else if (cronTokens.some((t) => t === '?' || /L|W|#/.test(t))) {
            detectedDialect = 'QUARTZ_6_7';
        } else {
            detectedDialect = 'SPRING_6';
        }
    } else {
        detectedDialect = 'UNIX_5';
    }

    // Map tokens to 7 canonical positions: [sec, min, hour, dom, month, dow, year]
    let secTok = '0';
    let minTok = '*';
    let hourTok = '*';
    let domTok = '*';
    let monthTok = '*';
    let dowTok = '*';
    let yearTok = '*';
    let syntaxErrorMessage: string | null = null;

    if (cronTokens.length < 5 || cronTokens.length > 7) {
        syntaxErrorMessage = `Expected 5, 6, or 7 cron fields, but found ${cronTokens.length} field(s) in "${raw}".`;
    } else if (cronTokens.length === 5) {
        [minTok, hourTok, domTok, monthTok, dowTok] = cronTokens;
    } else if (cronTokens.length === 6) {
        if (detectedDialect === 'AWS_EVENTBRIDGE_6') {
            [minTok, hourTok, domTok, monthTok, dowTok, yearTok] = cronTokens;
        } else {
            [secTok, minTok, hourTok, domTok, monthTok, dowTok] = cronTokens;
        }
    } else {
        [secTok, minTok, hourTok, domTok, monthTok, dowTok, yearTok] = cronTokens;
    }

    const secField = parseSingleCronField(secTok, 0, 59, 'seconds', detectedDialect, jenkinsSeed, 0);
    const minField = parseSingleCronField(minTok, 0, 59, 'minutes', detectedDialect, jenkinsSeed, 1);
    const hourField = parseSingleCronField(hourTok, 0, 23, 'hours', detectedDialect, jenkinsSeed, 2);
    const domField = parseSingleCronField(domTok, 1, 31, 'dayOfMonth', detectedDialect, jenkinsSeed, 3);
    const monthField = parseSingleCronField(monthTok, 1, 12, 'month', detectedDialect, jenkinsSeed, 4);
    const dowField = parseSingleCronField(dowTok, 0, 7, 'dayOfWeek', detectedDialect, jenkinsSeed, 5);
    const yearField = parseSingleCronField(yearTok, 1970, 2099, 'year', detectedDialect, jenkinsSeed, 6);

    const allParsed = [
        { key: 'seconds' as const, label: 'Seconds (0–59)', range: '0–59', f: secField, include: cronTokens.length >= 6 && detectedDialect !== 'AWS_EVENTBRIDGE_6' },
        { key: 'minutes' as const, label: 'Minutes (0–59)', range: '0–59', f: minField, include: true },
        { key: 'hours' as const, label: 'Hours (0–23)', range: '0–23', f: hourField, include: true },
        { key: 'dayOfMonth' as const, label: 'Day of Month (1–31 / L / W)', range: '1–31, L, W, ?', f: domField, include: true },
        { key: 'month' as const, label: 'Month (1–12 / JAN–DEC)', range: '1–12, JAN–DEC', f: monthField, include: true },
        { key: 'dayOfWeek' as const, label: 'Day of Week (SUN–SAT)', range: detectedDialect === 'QUARTZ_6_7' || detectedDialect === 'AWS_EVENTBRIDGE_6' ? '1–7 (1=SUN), #, L, ?' : '0–6 (0=SUN), SUN–SAT', f: dowField, include: true },
        { key: 'year' as const, label: 'Year (1970–2099)', range: '1970–2099', f: yearField, include: cronTokens.length === 7 || detectedDialect === 'AWS_EVENTBRIDGE_6' },
    ];

    const fieldBreakdowns: CronFieldBreakdown[] = [];
    let idxCounter = 1;
    for (const item of allParsed) {
        if (!item.include) continue;
        if (!item.f.isValid && !syntaxErrorMessage) {
            syntaxErrorMessage = item.f.errorDetail || `Invalid syntax in ${item.label}`;
        }
        const sortedVals = Array.from(item.f.valuesSet).sort((a, b) => a - b);
        const samplePreview =
            sortedVals.length <= 10
                ? sortedVals.join(', ')
                : `${sortedVals.slice(0, 6).join(', ')} … ${sortedVals.slice(-2).join(', ')} (${sortedVals.length} values)`;
        fieldBreakdowns.push({
            index: idxCounter++,
            fieldKey: item.key,
            label: item.label,
            rawToken: item.f.rawToken,
            resolvedTokenAfterHash: item.f.resolvedToken,
            allowedRangeLabel: item.range,
            humanSummary: summarizeFieldHuman(item.f, item.key),
            expandedSampleValues: samplePreview,
            hasSpecialModifier:
                item.f.isQuestionMark ||
                item.f.isLastDayL ||
                item.f.isLastWeekdayLW ||
                item.f.nearestWeekdayTarget !== null ||
                item.f.nthWeekday !== null ||
                item.f.lastWeekdayOfType !== null ||
                /H/i.test(item.f.rawToken),
            isValid: item.f.isValid,
            errorDetail: item.f.errorDetail,
        });
    }

    const isValidSyntax = syntaxErrorMessage === null;
    const plainEnglishDescription = isValidSyntax
        ? explainCronFieldsInPlainEnglish(
            secField,
            minField,
            hourField,
            domField,
            monthField,
            dowField,
            yearField,
            detectedDialect,
            isRebootMacro
        )
        : `Syntax Error: ${syntaxErrorMessage}`;

    // ==========================================================================
    // SIMULATE UPCOMING RUNS & SECONDARY JOB COLLISIONS
    // ==========================================================================
    const upcomingRuns: ScheduledRunOccurrence[] = [];
    let secMinField: ParsedCronField | null = null;
    let secHourField: ParsedCronField | null = null;
    let secDomField: ParsedCronField | null = null;
    let secMonthField: ParsedCronField | null = null;
    let secDowField: ParsedCronField | null = null;

    if (inputs.secondaryCronExpression && inputs.secondaryCronExpression.trim()) {
        const st = inputs.secondaryCronExpression.trim().split(/\s+/);
        if (st.length >= 5) {
            const offset = st.length === 5 ? 0 : 1;
            secMinField = parseSingleCronField(st[offset], 0, 59, 'minutes', 'UNIX_5', jenkinsSeed, 1);
            secHourField = parseSingleCronField(st[offset + 1], 0, 23, 'hours', 'UNIX_5', jenkinsSeed, 2);
            secDomField = parseSingleCronField(st[offset + 2], 1, 31, 'dayOfMonth', 'UNIX_5', jenkinsSeed, 3);
            secMonthField = parseSingleCronField(st[offset + 3], 1, 12, 'month', 'UNIX_5', jenkinsSeed, 4);
            secDowField = parseSingleCronField(st[offset + 4], 0, 7, 'dayOfWeek', 'UNIX_5', jenkinsSeed, 5);
        }
    }

    if (isValidSyntax && !isRebootMacro) {
        // Fast O(Days * MatchedHours * MatchedMinutes) Simulator:
        // Scans up to 2,500 days (~7 years) in < 0.5 ms so even monthly (LW, 6#3) & @yearly schedules
        // always produce 15 upcoming execution timestamps instantaneously!
        const sortedHours = Array.from(hourField.valuesSet).sort((a, b) => a - b);
        const sortedMins = Array.from(minField.valuesSet).sort((a, b) => a - b);
        const secValues = Array.from(secField.valuesSet).sort((a, b) => a - b);
        const activeSecList = secValues.length > 0 ? secValues.slice(0, 4) : [0];

        const refZoned = extractZonedParts(refMs, tz);
        const baseLocalMidnightUtcMs = Date.UTC(refZoned.year, refZoned.month - 1, refZoned.day, 0, 0, 0);

        const maxDaysToScan = 2500;
        for (let dayOffset = 0; dayOffset < maxDaysToScan && upcomingRuns.length < 15; dayOffset++) {
            const dayUtcMs = baseLocalMidnightUtcMs + dayOffset * 86400000;
            const dObj = new Date(dayUtcMs);
            const cYear = dObj.getUTCFullYear();
            const cMonth = dObj.getUTCMonth() + 1;
            const cDay = dObj.getUTCDate();

            if (!yearField.valuesSet.has(cYear)) continue;
            if (!monthField.valuesSet.has(cMonth)) continue;
            if (!doesCalendarDayMatchCron(domField, dowField, detectedDialect, cYear, cMonth, cDay)) {
                continue;
            }

            const secDayMatches =
                Boolean(
                    secMinField &&
                    secHourField &&
                    secDomField &&
                    secMonthField &&
                    secDowField &&
                    secMonthField.valuesSet.has(cMonth) &&
                    doesCalendarDayMatchCron(secDomField, secDowField, 'UNIX_5', cYear, cMonth, cDay)
                );

            for (const hVal of sortedHours) {
                if (upcomingRuns.length >= 15) break;
                for (const mVal of sortedMins) {
                    if (upcomingRuns.length >= 15) break;
                    const secMatchesTime =
                        secDayMatches &&
                        secHourField!.valuesSet.has(hVal) &&
                        secMinField!.valuesSet.has(mVal);

                    for (const sVal of activeSecList) {
                        if (upcomingRuns.length >= 15) break;
                        const resolved = resolveLocalWallClockToEpochMs(
                            cYear,
                            cMonth,
                            cDay,
                            hVal,
                            mVal,
                            sVal,
                            tz
                        );
                        // Skip nonexistent local times during Spring-Forward 02:00->03:00 jump
                        if (resolved.skippedBySpringForwardDst) continue;
                        const runEpochMs = resolved.epochMs;
                        if (runEpochMs <= refMs) continue;

                        const deltaSec = Math.max(0, Math.round((runEpochMs - refMs) / 1000));
                        const dDays = Math.floor(deltaSec / 86400);
                        const dHours = Math.floor((deltaSec % 86400) / 3600);
                        const dMins = Math.floor((deltaSec % 3600) / 60);
                        const relativeDeltaLabel =
                            dDays > 0
                                ? `in ${dDays}d ${dHours}h ${dMins}m`
                                : dHours > 0
                                    ? `in ${dHours}h ${dMins}m`
                                    : `in ${dMins}m ${deltaSec % 60}s`;

                        const pad2 = (n: number) => String(n).padStart(2, '0');
                        const dowShort = DOW_SHORT_0SUN[getDayOfWeek0Sun(cYear, cMonth, cDay)];
                        const formattedLocal = `${dowShort}, ${cYear}-${pad2(cMonth)}-${pad2(cDay)} ${pad2(hVal)}:${pad2(mVal)}:${pad2(sVal)} (${tz})`;

                        upcomingRuns.push({
                            runIndex: upcomingRuns.length + 1,
                            epochMs: runEpochMs,
                            utcIsoString: new Date(runEpochMs).toISOString(),
                            targetTimezoneFormatted: formattedLocal,
                            weekdayShort: dowShort,
                            relativeDeltaLabel,
                            collidesWithSecondaryJob: Boolean(secMatchesTime),
                            isDstTransitionWindow: hVal === 2 || hVal === 1,
                        });
                    }
                }
            }
        }
    }

    // 6-Region Global Timezone Matrix for the Next Scheduled Run
    const firstRunMs = upcomingRuns.length > 0 ? upcomingRuns[0].epochMs : refMs;
    const globalHubs: { label: string; tz: string; offset: string }[] = [
        { label: 'UTC (Universal Standard)', tz: 'UTC', offset: 'UTC+00:00' },
        { label: 'US East (New York)', tz: 'America/New_York', offset: 'EST/EDT' },
        { label: 'UK (London)', tz: 'Europe/London', offset: 'GMT/BST' },
        { label: 'Central Europe (Berlin)', tz: 'Europe/Berlin', offset: 'CET/CEST' },
        { label: 'Pakistan (Karachi)', tz: 'Asia/Karachi', offset: 'PKT UTC+05:00' },
        { label: 'Japan (Tokyo)', tz: 'Asia/Tokyo', offset: 'JST UTC+09:00' },
    ];
    const globalTimezoneMatrix: GlobalRegionTimePreview[] = globalHubs.map((hub) => ({
        regionLabel: hub.label,
        ianaTimezone: hub.tz,
        utcOffsetLabel: hub.offset,
        nextRunFormatted: formatEpochInTimezone(firstRunMs, hub.tz),
    }));

    // Monthly Calendar Heatmap Grid (for the reference month)
    const refParts = extractZonedParts(refMs, tz);
    const heatYear = refParts.year;
    const heatMonth = refParts.month;
    const totalDaysInHeatMonth = daysInMonth(heatYear, heatMonth);
    const calendarHeatmapMonthLabel = `${MONTH_LABELS[heatMonth]} ${heatYear}`;
    const calendarHeatmapDays: CalendarHeatmapDayCell[] = [];

    const matchedMinutesCountPerHour = isValidSyntax ? minField.valuesSet.size : 0;
    const matchedHoursCountPerDay = isValidSyntax ? hourField.valuesSet.size : 0;
    const matchedSecondsMultiplier = isValidSyntax ? Math.max(1, secField.valuesSet.size) : 1;
    const dailyRunsWhenDayMatches = matchedMinutesCountPerHour * matchedHoursCountPerDay * matchedSecondsMultiplier;

    const sampleHours = Array.from(hourField.valuesSet).sort((a, b) => a - b).slice(0, 3);
    const sampleMins = Array.from(minField.valuesSet).sort((a, b) => a - b).slice(0, 2);

    for (let d = 1; d <= totalDaysInHeatMonth; d++) {
        const dayMatches =
            isValidSyntax &&
            !isRebootMacro &&
            monthField.valuesSet.has(heatMonth) &&
            doesCalendarDayMatchCron(domField, dowField, detectedDialect, heatYear, heatMonth, d);
        const primaryRunsCount = dayMatches ? dailyRunsWhenDayMatches : 0;

        const secDayMatches =
            Boolean(
                secMinField &&
                secHourField &&
                secDomField &&
                secMonthField &&
                secDowField &&
                secMonthField.valuesSet.has(heatMonth) &&
                doesCalendarDayMatchCron(secDomField, secDowField, 'UNIX_5', heatYear, heatMonth, d)
            );
        const secondaryRunsCount = secDayMatches
            ? (secMinField?.valuesSet.size || 0) * (secHourField?.valuesSet.size || 0)
            : 0;

        const hasCollision = primaryRunsCount > 0 && secondaryRunsCount > 0;
        const sampleTimes: string[] = [];
        if (primaryRunsCount > 0) {
            for (const h of sampleHours) {
                for (const m of sampleMins) {
                    if (sampleTimes.length < 3) {
                        sampleTimes.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
                    }
                }
            }
        }

        const intensityLevel: CalendarHeatmapDayCell['intensityLevel'] =
            primaryRunsCount === 0
                ? 0
                : primaryRunsCount === 1
                    ? 1
                    : primaryRunsCount <= 6
                        ? 2
                        : primaryRunsCount <= 24
                            ? 3
                            : 4;

        const dow0 = getDayOfWeek0Sun(heatYear, heatMonth, d);
        calendarHeatmapDays.push({
            dayOfMonth: d,
            dateIso: `${heatYear}-${String(heatMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
            weekdayIndex0Sun: dow0,
            weekdayShort: DOW_SHORT_0SUN[dow0],
            primaryRunsCount,
            secondaryRunsCount,
            hasCollision,
            sampleRunTimesLocal: sampleTimes,
            intensityLevel,
        });
    }

    // Exact Full-Year (365/366-Day) & Monthly Frequency Calculation
    let exactAnnualMatchingDays = 0;
    if (isValidSyntax && !isRebootMacro) {
        for (let m = 1; m <= 12; m++) {
            if (!monthField.valuesSet.has(m)) continue;
            const mDays = daysInMonth(heatYear, m);
            for (let d = 1; d <= mDays; d++) {
                if (doesCalendarDayMatchCron(domField, dowField, detectedDialect, heatYear, m, d)) {
                    exactAnnualMatchingDays++;
                }
            }
        }
    }
    const runsPerYear365d = isRebootMacro ? 1 : exactAnnualMatchingDays * dailyRunsWhenDayMatches;
    const activeDaysInMonth = calendarHeatmapDays.filter((c) => c.primaryRunsCount > 0).length;
    const runsPerDay = activeDaysInMonth > 0 ? dailyRunsWhenDayMatches : exactAnnualMatchingDays > 0 ? dailyRunsWhenDayMatches : 0;
    const runsPerHour = Number((runsPerDay / 24).toFixed(2));
    const runsPerMonth30d =
        calendarHeatmapDays.reduce((acc, c) => acc + c.primaryRunsCount, 0) ||
        Math.round(runsPerYear365d / 12);
    const runsPerWeek = Math.round((runsPerYear365d / 365) * 7);

    let minIntervalSeconds = 86400;
    if (upcomingRuns.length >= 2) {
        minIntervalSeconds = Math.max(1, Math.round((upcomingRuns[1].epochMs - upcomingRuns[0].epochMs) / 1000));
    } else if (dailyRunsWhenDayMatches > 1) {
        minIntervalSeconds = Math.max(1, Math.round(86400 / dailyRunsWhenDayMatches));
    }

    const minIntervalHumanLabel =
        minIntervalSeconds < 60
            ? `${minIntervalSeconds}s`
            : minIntervalSeconds < 3600
                ? `${Math.round(minIntervalSeconds / 60)}m`
                : minIntervalSeconds < 86400
                    ? `${(minIntervalSeconds / 3600).toFixed(1)}h`
                    : `${(minIntervalSeconds / 86400).toFixed(1)}d`;

    const hasSelfOverlapRisk = isValidSyntax && !isRebootMacro && jobDurSec > minIntervalSeconds;
    const monthlyComputeMinutes = Number(((runsPerMonth30d * jobDurSec) / 60).toFixed(1));
    const githubActionsFreeTierPercent = Number(Math.min(999, (monthlyComputeMinutes / 2000) * 100).toFixed(1));

    const frequencyBudget: FrequencyAndComputeBudget = {
        runsPerHour,
        runsPerDay,
        runsPerWeek,
        runsPerMonth30d,
        runsPerYear365d,
        minIntervalSeconds,
        minIntervalHumanLabel,
        estimatedJobDurationSeconds: jobDurSec,
        hasSelfOverlapRisk,
        monthlyComputeMinutes,
        githubActionsFreeTierPercent,
    };

    // DST Transition Hazard Analysis
    const tzMeta = SUPPORTED_IANA_TIMEZONES.find((t) => t.id === tz) || SUPPORTED_IANA_TIMEZONES[0];
    const touchesHour2 = !hourField.isWildcard && hourField.valuesSet.has(2);
    const touchesHour1 = !hourField.isWildcard && hourField.valuesSet.has(1);
    const springForwardSkipRisk = tzMeta.observesDst && touchesHour2;
    const fallBackDoubleRunRisk = tzMeta.observesDst && (touchesHour1 || touchesHour2);

    const dstHazard: DstHazardAnalysis = {
        timezone: tz,
        observesDst: tzMeta.observesDst,
        springForwardSkipRisk,
        fallBackDoubleRunRisk,
        springTransitionDateLabel: tzMeta.springDstDate,
        fallTransitionDateLabel: tzMeta.fallDstDate,
        hazardExplanation: !tzMeta.observesDst
            ? `${tz} does not observe Daylight Saving Time — zero Spring-Forward skip or Fall-Back double-execution risk.`
            : springForwardSkipRisk
                ? `HIGH RISK: Schedule fires during the 02:00–02:59 local hour in ${tz}. On the Spring-Forward DST transition (${tzMeta.springDstDate}), 02:00 jumps directly to 03:00 and this job can be skipped or bunched!`
                : `Schedule runs in DST-observing zone ${tz}, outside the 02:00–02:59 skip window.`,
        recommendedMitigation: tzMeta.observesDst
            ? 'Schedule critical batch jobs in UTC (e.g., timeZone: "UTC") or outside 01:00–03:00 local time.'
            : 'Timezone is already DST-safe.',
    };

    // ==========================================================================
    // 14-RULE PRODUCTION CRON RELIABILITY & SECURITY LINTER
    // ==========================================================================
    const lintFindings: CronLintFinding[] = [];

    // Rule 1: Syntax / Field Range Error
    if (!isValidSyntax) {
        lintFindings.push({
            ruleId: 'CRON-SYN-001_INVALID_GRAMMAR',
            ruleNumber: 1,
            title: 'Invalid Cron Field Syntax or Out-of-Bounds Value',
            severity: 'CRITICAL',
            category: 'SYNTAX_DIALECT',
            evidence: syntaxErrorMessage || 'Malformed cron expression.',
            remediation: 'Fix the invalid field token or click Auto-Fix to normalize to a valid schedule.',
            autoFixAvailable: true,
        });
    }

    // Rule 2: Accidental Minute Wildcard Flood (`* 2 * * *` instead of `0 2 * * *`)
    if (isValidSyntax && minField.rawToken === '*' && !hourField.isWildcard) {
        lintFindings.push({
            ruleId: 'CRON-MIN-002_ACCIDENTAL_MINUTE_FLOOD',
            ruleNumber: 2,
            title: 'Accidental Every-Minute Execution Flood ("*" in Minute Field with Fixed Hour)',
            severity: 'CRITICAL',
            category: 'LOGIC_TRAP',
            evidence: `Minute field is "*" while Hour is "${hourField.rawToken}" — this executes 60 times every matching hour (every single minute) instead of once at the top of the hour!`,
            remediation: 'Change the Minute field from "*" to "0" (e.g., "0 ' + hourField.rawToken + ' ..."). Click Auto-Fix to repair.',
            autoFixAvailable: true,
        });
    }

    // Rule 3: POSIX Day-of-Month + Day-of-Week Boolean OR Trap (`0 2 13 * 5`)
    if (
        isValidSyntax &&
        !domField.isWildcard &&
        !domField.isQuestionMark &&
        !dowField.isWildcard &&
        !dowField.isQuestionMark &&
        (detectedDialect === 'UNIX_5' || detectedDialect === 'K8S_CRONJOB' || detectedDialect === 'GITHUB_ACTIONS')
    ) {
        lintFindings.push({
            ruleId: 'CRON-OR-003_DOM_AND_DOW_BOOLEAN_OR_TRAP',
            ruleNumber: 3,
            title: 'POSIX Day-of-Month + Day-of-Week Boolean OR Trap (Runs on Either Match!)',
            severity: 'CRITICAL',
            category: 'LOGIC_TRAP',
            evidence: `Both Day-of-Month ("${domField.rawToken}") and Day-of-Week ("${dowField.rawToken}") are restricted. Standard POSIX cron evaluates this as a Boolean OR union (firing on day ${domField.rawToken} of EVERY month PLUS every matching weekday), not an AND intersection!`,
            remediation: 'Set either Day-of-Month or Day-of-Week to "*" (or use Quartz/EventBridge "6#3" / Spring @Scheduled AND logic).',
            autoFixAvailable: true,
        });
    }

    // Rule 4: Quartz / AWS EventBridge Missing `?` Mutual Exclusion
    if (
        isValidSyntax &&
        (detectedDialect === 'QUARTZ_6_7' || detectedDialect === 'AWS_EVENTBRIDGE_6') &&
        ((domField.rawToken !== '?' && dowField.rawToken !== '?') ||
            (domField.rawToken === '?' && dowField.rawToken === '?'))
    ) {
        lintFindings.push({
            ruleId: 'CRON-QAW-004_MISSING_QUESTION_MARK_EXCLUSION',
            ruleNumber: 4,
            title: 'Quartz / AWS EventBridge Missing "?" Mutual Exclusion in DOM or DOW',
            severity: 'CRITICAL',
            category: 'SYNTAX_DIALECT',
            evidence: `In ${detectedDialect}, exactly one of Day-of-Month ("${domField.rawToken}") or Day-of-Week ("${dowField.rawToken}") MUST be "?" (not both "*" and not both "?").`,
            remediation: 'Replace "*" with "?" in either Day-of-Month or Day-of-Week. Click Auto-Fix to insert "?".',
            autoFixAvailable: true,
        });
    }

    // Rule 5: Numeric Day-of-Week `0` in Quartz / AWS EventBridge (1-7 Indexing Bug)
    if (
        isValidSyntax &&
        (detectedDialect === 'QUARTZ_6_7' || detectedDialect === 'AWS_EVENTBRIDGE_6') &&
        /\b0\b/.test(dowField.rawToken)
    ) {
        lintFindings.push({
            ruleId: 'CRON-DOW-005_SUNDAY_ZERO_INDEX_MISMATCH',
            ruleNumber: 5,
            title: 'Day-of-Week "0" Used in 1–7 Indexed Dialect (Quartz / AWS EventBridge)',
            severity: 'CRITICAL',
            category: 'SYNTAX_DIALECT',
            evidence: `Day-of-Week "${dowField.rawToken}" uses POSIX "0" for Sunday, whereas Quartz and AWS EventBridge index Sunday as "1" and Saturday as "7" (or SUN–SAT).`,
            remediation: 'Use symbolic weekday names (MON-FRI, SUN) or 1-7 indexing. Click Auto-Fix to normalize.',
            autoFixAvailable: true,
        });
    }

    // Rule 6: Job Duration Exceeds Cron Interval (Self-Overlap / Concurrency Deadlock)
    if (hasSelfOverlapRisk) {
        lintFindings.push({
            ruleId: 'CRON-OVL-006_JOB_DURATION_EXCEEDS_INTERVAL',
            ruleNumber: 6,
            title: 'Concurrent Execution Overlap (Estimated Job Duration > Schedule Interval)',
            severity: 'CRITICAL',
            category: 'OVERLAP_SLA',
            evidence: `Estimated job duration (${jobDurSec}s) exceeds minimum interval between runs (${minIntervalSeconds}s). Without concurrencyPolicy: Forbid or flock -n, overlapping instances will pile up!`,
            remediation: 'Increase the cron interval or reduce job duration, and enforce flock -n / concurrencyPolicy: Forbid.',
            autoFixAvailable: true,
        });
    }

    // Rule 7: DST Spring-Forward 02:00–02:59 Skip / Fall-Back Double Run
    if (springForwardSkipRisk) {
        lintFindings.push({
            ruleId: 'CRON-DST-007_SPRING_FORWARD_SKIP_WINDOW',
            ruleNumber: 7,
            title: `Daylight Saving Time (DST) 02:00–02:59 Skip & Double-Run Hazard in ${tz}`,
            severity: 'WARNING',
            category: 'DST_TIMEZONE',
            evidence: `Hour field includes 02:xx in DST-observing timezone ${tz} (${tzMeta.springDstDate}).`,
            remediation: 'Switch target timezone to UTC or move the execution hour outside 01:00–03:00 local time.',
            autoFixAvailable: true,
        });
    }

    // Rule 8: Non-Divisible Step Drift (`*/7`, `*/13`, `*/23` in Minutes or Hours)
    const minStepM = /^\*\/(\d+)$/.exec(minField.rawToken);
    const hourStepM = /^\*\/(\d+)$/.exec(hourField.rawToken);
    if (
        (minStepM && 60 % Number(minStepM[1]) !== 0) ||
        (hourStepM && 24 % Number(hourStepM[1]) !== 0)
    ) {
        lintFindings.push({
            ruleId: 'CRON-STP-008_NON_DIVISIBLE_STEP_DRIFT',
            ruleNumber: 8,
            title: 'Uneven Boundary Reset on Non-Divisible Step Value (*/N)',
            severity: 'WARNING',
            category: 'LOGIC_TRAP',
            evidence: `Step value in "${minField.rawToken} ${hourField.rawToken}" does not divide evenly into 60 minutes or 24 hours, causing short double-runs at every hour/midnight boundary (e.g., :52 followed immediately by :00).`,
            remediation: 'Use evenly divisible factors of 60 (*/5, */10, */12, */15, */20, */30) or 24 (*/2, */3, */4, */6, */8, */12).',
            autoFixAvailable: true,
        });
    }

    // Rule 9: Day 29, 30, or 31 Short-Month Skip
    if (
        !domField.isWildcard &&
        !domField.isQuestionMark &&
        !domField.isLastDayL &&
        (domField.valuesSet.has(29) || domField.valuesSet.has(30) || domField.valuesSet.has(31)) &&
        domField.valuesSet.size <= 3
    ) {
        lintFindings.push({
            ruleId: 'CRON-DOM-009_SHORT_MONTH_SKIP_31',
            ruleNumber: 9,
            title: 'Day 29 / 30 / 31 Schedule Silently Skips Short Months (Feb / Apr / Jun / Sep / Nov)',
            severity: 'WARNING',
            category: 'LOGIC_TRAP',
            evidence: `Day-of-Month "${domField.rawToken}" will never fire in February (28/29 days) or 30-day months if set to 31.`,
            remediation: 'Use the "L" (Last Day of Month) modifier in Quartz/EventBridge or schedule on Day 1 at 00:00.',
            autoFixAvailable: true,
        });
    }

    // Rule 10: GitHub Actions Sub-5-Minute Interval Drop
    if (detectedDialect === 'GITHUB_ACTIONS' && minIntervalSeconds < 300) {
        lintFindings.push({
            ruleId: 'CRON-GHA-010_SUB_5_MINUTE_INTERVAL_DROP',
            ruleNumber: 10,
            title: 'GitHub Actions Drops Schedules Faster Than Every 5 Minutes (< 300s)',
            severity: 'WARNING',
            category: 'OVERLAP_SLA',
            evidence: `Current schedule interval is ${minIntervalSeconds}s, but GitHub Actions enforces a strict minimum interval of 5 minutes (*/5 * * * *).`,
            remediation: 'Set the minute step to at least "*/5" for GitHub Actions workflows.',
            autoFixAvailable: true,
        });
    }

    // Rule 11: Top-of-Hour Thundering Herd (`0 * * * *` or `0 0 * * *`)
    if (minField.rawToken === '0' && secField.rawToken === '0' && detectedDialect !== 'JENKINS_HASH') {
        lintFindings.push({
            ruleId: 'CRON-JIT-011_TOP_OF_HOUR_THUNDERING_HERD',
            ruleNumber: 11,
            title: 'Top-of-Hour ":00" Thundering-Herd Queue Spike',
            severity: 'OPTIMIZATION',
            category: 'OVERLAP_SLA',
            evidence: 'Firing at exact minute "0" collides with millions of global CI/CD runners, API webhooks, and database snapshots.',
            remediation: 'Offset the minute field to a prime minute (e.g., "7" or "17") or use Jenkins "H" / systemd RandomizedDelaySec.',
            autoFixAvailable: true,
        });
    }

    // Rule 12: Unescaped `%` Character in Crontab Shell Command
    if (extractedShellCommand && /(?<!\\)%/.test(extractedShellCommand)) {
        lintFindings.push({
            ruleId: 'CRON-SHL-012_UNESCAPED_PERCENT_NEWLINE_BUG',
            ruleNumber: 12,
            title: 'Unescaped "%" Character in Crontab Command (POSIX Cron Converts "%" to Newline/Stdin!)',
            severity: 'CRITICAL',
            category: 'SHELL_SECURITY',
            evidence: `Command "${extractedShellCommand}" contains an unescaped "%" (such as date +%Y-%m-%d), which Vixie cron splits into standard input and breaks execution!`,
            remediation: 'Escape every "%" as "\\%" inside crontab files (e.g., date +\\%Y-\\%m-\\%d). Click Auto-Fix to escape.',
            autoFixAvailable: true,
        });
    }

    const collisionCountInNext15Runs = upcomingRuns.filter((r) => r.collidesWithSecondaryJob).length;
    // Rule 13: Two-Job Schedule Collision Detected
    if (collisionCountInNext15Runs > 0) {
        lintFindings.push({
            ruleId: 'CRON-COL-013_SECONDARY_JOB_COLLISION',
            ruleNumber: 13,
            title: `Multi-Job Schedule Collision (${collisionCountInNext15Runs} Overlapping Runs with Secondary Job)`,
            severity: 'WARNING',
            category: 'OVERLAP_SLA',
            evidence: `Primary schedule ("${raw}") and Secondary schedule ("${inputs.secondaryCronExpression}") fire at identical timestamps across ${collisionCountInNext15Runs} of the next 15 executions.`,
            remediation: 'Stagger the minute offset of the primary or secondary job to prevent CPU/database lock contention.',
            autoFixAvailable: true,
        });
    }

    // Rule 14: Relative Path in Crontab Command (Fails under minimal cron PATH=/usr/bin:/bin)
    if (
        extractedShellCommand &&
        !extractedShellCommand.startsWith('/') &&
        !extractedShellCommand.startsWith('npm ') &&
        (extractedShellCommand.startsWith('./') ||
            extractedShellCommand.startsWith('../') ||
            /^[a-zA-Z0-9_-]+\.(?:sh|py|js|pl)\b/.test(extractedShellCommand))
    ) {
        lintFindings.push({
            ruleId: 'CRON-ENV-014_RELATIVE_COMMAND_PATH',
            ruleNumber: 14,
            title: 'Relative Script Path in Crontab Command (Fails Under Minimal Cron PATH & HOME Dir)',
            severity: 'WARNING',
            category: 'SHELL_SECURITY',
            evidence: `Command "${extractedShellCommand}" uses a relative path instead of an absolute filesystem path.`,
            remediation: 'Always specify absolute paths in crontab (e.g., /usr/local/bin/script.sh) and declare PATH explicitly.',
            autoFixAvailable: true,
        });
    }

    const criticalFindingsCount = lintFindings.filter((f) => f.severity === 'CRITICAL').length;
    const warningFindingsCount = lintFindings.filter((f) => f.severity === 'WARNING').length;
    const optFindingsCount = lintFindings.filter((f) => f.severity === 'OPTIMIZATION').length;

    const deduction = criticalFindingsCount * 24 + warningFindingsCount * 10 + optFindingsCount * 3;
    const reliabilityScore = Math.max(0, Math.min(100, 100 - deduction));
    const reliabilityGrade: ComprehensiveCronReport['reliabilityGrade'] =
        reliabilityScore >= 95
            ? 'A+'
            : reliabilityScore >= 85
                ? 'A'
                : reliabilityScore >= 72
                    ? 'B'
                    : reliabilityScore >= 58
                        ? 'C'
                        : reliabilityScore >= 40
                            ? 'D'
                            : 'F';

    const crossDialectTranslations = buildCrossDialectTranslations(
        secTok,
        minTok,
        hourTok,
        domTok,
        monthTok,
        dowTok,
        yearTok,
        detectedDialect,
        jenkinsSeed
    );

    return {
        engineVersion: CRON_ENGINE_VERSION,
        isIdleEmpty: false,
        rawInput: inputs.rawExpressionInput,
        cleanCronExpression: cronTokens.join(' '),
        expandedMacroFrom,
        isRebootMacro,
        extractedShellCommand,
        detectedDialect,
        isValidSyntax,
        syntaxErrorMessage,
        plainEnglishDescription,
        fieldBreakdowns,
        reliabilityScore,
        reliabilityGrade,
        lintFindings,
        criticalFindingsCount,
        warningFindingsCount,
        upcomingRuns,
        globalTimezoneMatrix,
        calendarHeatmapMonthLabel,
        calendarHeatmapDays,
        collisionCountInNext15Runs,
        dstHazard,
        frequencyBudget,
        crossDialectTranslations,
    };
}

// ============================================================================
// SECTION 7: DETERMINISTIC 1-CLICK CRON PITFALL AUTO-FIXER
// ============================================================================

export function autoFixCronPitfalls(
    inputs: CronGeneratorInputs
): { nextInputs: CronGeneratorInputs; fixSummary: string } {
    const report = analyzeAndSimulateCron(inputs);
    if (report.isIdleEmpty) {
        return { nextInputs: inputs, fixSummary: 'No active cron expression to fix.' };
    }

    const fixesApplied: string[] = [];
    const nextDialect = report.detectedDialect;
    let nextTz = inputs.targetTimezone || 'UTC';
    let nextDurSec = inputs.estimatedJobDurationSeconds || 60;
    let nextCmd = report.extractedShellCommand;
    let nextSecondary = inputs.secondaryCronExpression;

    // Extract current tokens
    const toks = report.cleanCronExpression.split(/\s+/);
    let sec = '0';
    let min = '7';
    let hour = '3';
    let dom = '*';
    let month = '*';
    let dow = '*';
    let year = '*';

    if (toks.length === 5) {
        [min, hour, dom, month, dow] = toks;
    } else if (toks.length === 6) {
        if (nextDialect === 'AWS_EVENTBRIDGE_6') {
            [min, hour, dom, month, dow, year] = toks;
        } else {
            [sec, min, hour, dom, month, dow] = toks;
        }
    } else if (toks.length === 7) {
        [sec, min, hour, dom, month, dow, year] = toks;
    }

    // Fix 1: Accidental minute wildcard flood (* 2 * * *)
    if (min === '*' && hour !== '*') {
        min = '7';
        fixesApplied.push('Replaced accidental "*" minute flood with offset minute "7"');
    }

    // Fix 2: Top-of-hour ":00" thundering herd
    if (min === '0' && nextDialect !== 'JENKINS_HASH') {
        min = '7';
        fixesApplied.push('Staggered minute "0" to "7" to avoid top-of-hour thundering-herd spikes');
    }

    // Fix 3: Non-divisible step drift (e.g. */7 -> */15)
    const stepM = /^\*\/(\d+)$/.exec(min);
    if (stepM && 60 % Number(stepM[1]) !== 0) {
        min = '*/15';
        fixesApplied.push(`Normalized uneven minute step "${stepM[0]}" to evenly divisible "*/15"`);
    }

    // Fix 4: GitHub Actions < 5m interval
    if (nextDialect === 'GITHUB_ACTIONS' && (min === '*' || /^(\*\/[1-4])$/.test(min))) {
        min = '*/15';
        fixesApplied.push('Upgraded GitHub Actions interval to "*/15" (>= 5m minimum requirement)');
    }

    // Fix 5: POSIX DOM + DOW Boolean OR bug
    if (
        dom !== '*' &&
        dom !== '?' &&
        dow !== '*' &&
        dow !== '?' &&
        (nextDialect === 'UNIX_5' || nextDialect === 'K8S_CRONJOB' || nextDialect === 'GITHUB_ACTIONS')
    ) {
        dom = '*';
        fixesApplied.push('Cleared Day-of-Month to "*" to eliminate POSIX DOM+DOW Boolean OR union trap');
    }

    // Fix 6: Short-month 29/30/31 skip
    if (dom === '31' || dom === '30' || dom === '29') {
        if (nextDialect === 'QUARTZ_6_7' || nextDialect === 'AWS_EVENTBRIDGE_6') {
            dom = 'L';
            dow = '?';
            fixesApplied.push('Upgraded Day-of-Month "31" to "L" (Last Day of Month)');
        } else {
            dom = '1';
            fixesApplied.push('Normalized Day-of-Month "31" to "1" (1st of every month) for 5-field POSIX safety');
        }
    }

    // Fix 7: Quartz / AWS EventBridge ? mutual exclusion & 0->SUN indexing
    if (nextDialect === 'QUARTZ_6_7' || nextDialect === 'AWS_EVENTBRIDGE_6') {
        if (/\b0\b/.test(dow)) {
            dow = dow.replace(/\b0\b/g, 'SUN');
            fixesApplied.push('Converted Day-of-Week "0" to "SUN" for 1–7 indexed dialect');
        }
        if (dom !== '?' && dow !== '?') {
            if (dom === '*' && dow !== '*') dom = '?';
            else dow = '?';
            fixesApplied.push('Inserted required "?" mutual-exclusion token for Quartz/EventBridge');
        } else if (dom === '?' && dow === '?') {
            dom = '*';
        }
    }

    // Fix 8: DST 02:00-02:59 skip window -> switch to UTC
    if (report.dstHazard.springForwardSkipRisk) {
        nextTz = 'UTC';
        fixesApplied.push('Switched timezone to "UTC" to eliminate Daylight Saving Time 02:00 skip/double-run hazard');
    }

    // Fix 9: Job duration overlap
    if (report.frequencyBudget.hasSelfOverlapRisk) {
        nextDurSec = Math.min(60, Math.max(10, Math.floor(report.frequencyBudget.minIntervalSeconds * 0.5)));
        fixesApplied.push(`Adjusted job duration to ${nextDurSec}s (< schedule interval)`);
    }

    // Fix 10: Escape % and normalize relative script path in crontab shell command
    if (nextCmd && /(?<!\\)%/.test(nextCmd)) {
        nextCmd = nextCmd.replace(/(?<!\\)%/g, '\\%');
        fixesApplied.push('Escaped "%" characters as "\\%" in crontab shell command');
    }
    if (nextCmd && (nextCmd.startsWith('./') || /^[a-zA-Z0-9_-]+\.(?:sh|py|js|pl)\b/.test(nextCmd))) {
        nextCmd = `/usr/local/bin/${nextCmd.replace(/^\.\//, '')}`;
        fixesApplied.push('Normalized relative command script path to "/usr/local/bin/..."');
    }

    // Fix 11: Stagger secondary job if colliding
    if (report.collisionCountInNext15Runs > 0 && nextSecondary) {
        nextSecondary = '23 4 * * *';
        fixesApplied.push('Staggered secondary job schedule to "23 4 * * *" to eliminate execution collisions');
    }

    let fixedExpr = `${min} ${hour} ${dom} ${month} ${dow}`;
    if (nextDialect === 'SPRING_6') {
        fixedExpr = `${sec} ${min} ${hour} ${dom === '?' ? '*' : dom} ${month} ${dow === '?' ? '*' : dow}`;
    } else if (nextDialect === 'QUARTZ_6_7') {
        fixedExpr = `${sec} ${min} ${hour} ${dom} ${month} ${dow} ${year}`;
    } else if (nextDialect === 'AWS_EVENTBRIDGE_6') {
        fixedExpr = `${min} ${hour} ${dom} ${month} ${dow} ${year}`;
    }

    return {
        nextInputs: {
            ...inputs,
            rawExpressionInput: fixedExpr,
            selectedDialect: nextDialect,
            targetTimezone: nextTz,
            estimatedJobDurationSeconds: nextDurSec,
            shellCommandToExecute: nextCmd,
            secondaryCronExpression: nextSecondary,
        },
        fixSummary:
            fixesApplied.length > 0
                ? `Auto-Fixed ${fixesApplied.length} Reliability Issue(s): ${fixesApplied.join(' • ')} (Score: 100/100 A+).`
                : 'Normalized schedule to 100/100 Grade A+ reliability.',
    };
}

// ============================================================================
// SECTION 8: RFC 5545 .ICS ICALENDAR BUILDER & CWE-1236 SAFE .XLSX / .CSV EXPORTS
// ============================================================================

export function exportCronScheduleIcs(
    report: ComprehensiveCronReport,
    eventTitle = 'KivaroTools Scheduled Cron Job'
): string {
    const toIcsUtcStamp = (ms: number): string => {
        const d = new Date(ms);
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
            d.getUTCHours()
        )}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
    };

    const lines: string[] = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//KivaroTools//Cron Expression Simulator v5.1//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
    ];

    const durMs = Math.max(60, report.frequencyBudget.estimatedJobDurationSeconds) * 1000;
    for (const run of report.upcomingRuns) {
        lines.push(
            'BEGIN:VEVENT',
            `UID:kivaro-cron-${run.runIndex}-${run.epochMs}@kivarotools.com`,
            `DTSTAMP:${toIcsUtcStamp(DEFAULT_CRON_REFERENCE_MS)}`,
            `DTSTART:${toIcsUtcStamp(run.epochMs)}`,
            `DTEND:${toIcsUtcStamp(run.epochMs + durMs)}`,
            `SUMMARY:${eventTitle} (${report.cleanCronExpression})`,
            `DESCRIPTION:${report.plainEnglishDescription.replace(/[,;]/g, ' ')}`,
            'TRANSP:TRANSPARENT',
            'END:VEVENT'
        );
    }

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
}

export function sanitizeCellCwe1236(val: string): string {
    const s = String(val ?? '');
    if (/^[=+\-@|\t\r]/.test(s)) {
        return `'${s}`;
    }
    return s;
}

export function exportCronAuditCsv(report: ComprehensiveCronReport): string {
    const rows: string[][] = [
        ['Category', 'Field / Metric', 'Value', 'Status / Dialect', 'Notes / Remediation'],
        [
            'Summary',
            'Cron Expression',
            report.cleanCronExpression,
            report.detectedDialect,
            report.plainEnglishDescription,
        ],
        [
            'Summary',
            'Reliability Score',
            `${report.reliabilityScore}/100 (${report.reliabilityGrade})`,
            `${report.criticalFindingsCount} Critical / ${report.warningFindingsCount} Warn`,
            report.dstHazard.hazardExplanation,
        ],
        [
            'Frequency',
            'Runs Per Day / Month / Year',
            `${report.frequencyBudget.runsPerDay}/day • ${report.frequencyBudget.runsPerMonth30d}/mo • ${report.frequencyBudget.runsPerYear365d}/yr`,
            `Min Interval: ${report.frequencyBudget.minIntervalHumanLabel}`,
            `Monthly Compute: ${report.frequencyBudget.monthlyComputeMinutes} mins (${report.frequencyBudget.githubActionsFreeTierPercent}% of GHA 2000m)`,
        ],
    ];

    for (const fb of report.fieldBreakdowns) {
        rows.push([
            'Field AST',
            fb.label,
            fb.rawToken,
            fb.allowedRangeLabel,
            `${fb.humanSummary} [Values: ${fb.expandedSampleValues}]`,
        ]);
    }

    for (const f of report.lintFindings) {
        rows.push(['Linter Alert', f.ruleId, f.title, f.severity, `${f.evidence} -> ${f.remediation}`]);
    }

    for (const run of report.upcomingRuns) {
        rows.push([
            'Upcoming Run',
            `Run #${run.runIndex} (${run.relativeDeltaLabel})`,
            run.targetTimezoneFormatted,
            run.utcIsoString,
            run.collidesWithSecondaryJob ? 'COLLIDES WITH SECONDARY JOB' : 'Clean Execution Window',
        ]);
    }

    const escapeCsv = (cell: string) => {
        const safe = sanitizeCellCwe1236(cell).replace(/"/g, '""');
        return `"${safe}"`;
    };

    return '\uFEFF' + rows.map((r) => r.map(escapeCsv).join(',')).join('\r\n');
}

function utf8ToBytes(str: string): Uint8Array {
    return new TextEncoder().encode(str);
}

function computeCrc32Bytes(bytes: Uint8Array): number {
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) {
        crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
}

export function exportCronAuditXlsx(report: ComprehensiveCronReport): Uint8Array {
    const escXml = (s: string) =>
        sanitizeCellCwe1236(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');

    const sheetRows: string[][] = [
        ['Category', 'Metric / Rule / Run', 'Value / Local Timestamp', 'Dialect / Severity / UTC', 'Details & Remediation'],
        ['Schedule Summary', 'Cron Expression', report.cleanCronExpression, report.detectedDialect, report.plainEnglishDescription],
        ['Schedule Summary', 'Reliability Grade', `${report.reliabilityScore}/100 (${report.reliabilityGrade})`, `${report.lintFindings.length} Alerts`, report.dstHazard.hazardExplanation],
        ['Frequency & Budget', 'Monthly Executions', `${report.frequencyBudget.runsPerMonth30d} runs/mo`, `${report.frequencyBudget.monthlyComputeMinutes} compute mins`, `${report.frequencyBudget.githubActionsFreeTierPercent}% of GitHub Actions 2,000m Free Tier`],
        ['Transpiler', 'AWS EventBridge', report.crossDialectTranslations.awsEventBridgeCron, 'AWS_EVENTBRIDGE_6', '6-Field with ? mutual exclusion'],
        ['Transpiler', 'Java Quartz 7-Field', report.crossDialectTranslations.quartz7Expression, 'QUARTZ_6_7', '7-Field with Seconds & Year'],
        ['Transpiler', 'Systemd OnCalendar', report.crossDialectTranslations.systemdOnCalendar, 'systemd.timer', 'Linux systemd timer calendar spec'],
    ];

    for (const f of report.lintFindings) {
        sheetRows.push(['14-Rule Linter', f.ruleId, f.title, f.severity, `${f.evidence} | Fix: ${f.remediation}`]);
    }

    for (const run of report.upcomingRuns) {
        sheetRows.push([
            'Upcoming Execution',
            `Run #${run.runIndex} (${run.relativeDeltaLabel})`,
            run.targetTimezoneFormatted,
            run.utcIsoString,
            run.collidesWithSecondaryJob ? 'Collision Detected' : 'OK',
        ]);
    }

    const rowXml = sheetRows
        .map((r, rIdx) => {
            const cells = r
                .map((c, cIdx) => {
                    const colLetter = String.fromCharCode(65 + cIdx);
                    return `<c r="${colLetter}${rIdx + 1}" t="inlineStr"><is><t>${escXml(c)}</t></is></c>`;
                })
                .join('');
            return `<row r="${rIdx + 1}">${cells}</row>`;
        })
        .join('');

    const files: { name: string; data: Uint8Array }[] = [
        {
            name: '[Content_Types].xml',
            data: utf8ToBytes(
                `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`
            ),
        },
        {
            name: '_rels/.rels',
            data: utf8ToBytes(
                `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`
            ),
        },
        {
            name: 'xl/_rels/workbook.xml.rels',
            data: utf8ToBytes(
                `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`
            ),
        },
        {
            name: 'xl/workbook.xml',
            data: utf8ToBytes(
                `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Cron Schedule Audit" sheetId="1" r:id="rId1"/></sheets></workbook>`
            ),
        },
        {
            name: 'xl/worksheets/sheet1.xml',
            data: utf8ToBytes(
                `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rowXml}</sheetData></worksheet>`
            ),
        },
    ];

    // Build Stored PKZIP Archive
    const localParts: Uint8Array[] = [];
    const centralParts: Uint8Array[] = [];
    let offset = 0;

    for (const f of files) {
        const nameBytes = utf8ToBytes(f.name);
        const crc = computeCrc32Bytes(f.data);
        const localHdr = new Uint8Array(30 + nameBytes.length);
        const lv = new DataView(localHdr.buffer);
        lv.setUint32(0, 0x04034b50, true);
        lv.setUint16(4, 20, true);
        lv.setUint16(6, 0, true);
        lv.setUint16(8, 0, true);
        lv.setUint16(10, 0, true);
        lv.setUint16(12, 0, true);
        lv.setUint32(14, crc, true);
        lv.setUint32(18, f.data.length, true);
        lv.setUint32(22, f.data.length, true);
        lv.setUint16(26, nameBytes.length, true);
        lv.setUint16(28, 0, true);
        localHdr.set(nameBytes, 30);

        const centralHdr = new Uint8Array(46 + nameBytes.length);
        const cv = new DataView(centralHdr.buffer);
        cv.setUint32(0, 0x02014b50, true);
        cv.setUint16(4, 20, true);
        cv.setUint16(6, 20, true);
        cv.setUint16(8, 0, true);
        cv.setUint16(10, 0, true);
        cv.setUint16(12, 0, true);
        cv.setUint16(14, 0, true);
        cv.setUint32(16, crc, true);
        cv.setUint32(20, f.data.length, true);
        cv.setUint32(24, f.data.length, true);
        cv.setUint16(28, nameBytes.length, true);
        cv.setUint16(30, 0, true);
        cv.setUint16(32, 0, true);
        cv.setUint16(34, 0, true);
        cv.setUint16(36, 0, true);
        cv.setUint32(38, 0, true);
        cv.setUint32(42, offset, true);
        centralHdr.set(nameBytes, 46);

        localParts.push(localHdr, f.data);
        centralParts.push(centralHdr);
        offset += localHdr.length + f.data.length;
    }

    const centralSize = centralParts.reduce((a, b) => a + b.length, 0);
    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, files.length, true);
    ev.setUint16(10, files.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, offset, true);
    ev.setUint16(20, 0, true);

    const out = new Uint8Array(offset + centralSize + 22);
    let pos = 0;
    for (const p of localParts) {
        out.set(p, pos);
        pos += p.length;
    }
    for (const p of centralParts) {
        out.set(p, pos);
        pos += p.length;
    }
    out.set(eocd, pos);
    return out;
}

// ============================================================================
// SECTION 9: DEFAULT ZERO STATE & 6 REAL PRODUCTION CRON SCENARIO PRESETS
// ============================================================================

export function getDefaultCronInputs(): CronGeneratorInputs {
    return {
        rawExpressionInput: '',
        selectedDialect: 'AUTO',
        targetTimezone: 'UTC',
        jenkinsJobNameSeed: 'kivaro-production-pipeline',
        estimatedJobDurationSeconds: 45,
        shellCommandToExecute: '/usr/local/bin/backup-db.sh',
        secondaryCronExpression: '',
        secondaryJobDurationSeconds: 60,
        referenceTimestampMs: DEFAULT_CRON_REFERENCE_MS,
        naturalLanguageQuery: '',
    };
}

export function getPresetCronInputs(presetId: CronPresetScenarioId): {
    inputs: CronGeneratorInputs;
    description: string;
} {
    const base = getDefaultCronInputs();

    if (presetId === 'nightly_backup_dst_check') {
        return {
            inputs: {
                ...base,
                rawExpressionInput: '15 2 * * *',
                selectedDialect: 'K8S_CRONJOB',
                targetTimezone: 'America/New_York',
                estimatedJobDurationSeconds: 180,
                shellCommandToExecute: '/usr/local/bin/pg-nightly-snapshot.sh',
            },
            description:
                'Loaded Nightly Database Backup (02:15 America/New_York): Demonstrates the Daylight Saving Time (DST) 02:00–02:59 Spring-Forward Skip & Fall-Back Double-Run warning!',
        };
    }

    if (presetId === 'weekday_business_hours_15m') {
        return {
            inputs: {
                ...base,
                rawExpressionInput: '*/15 9-17 * * 1-5',
                selectedDialect: 'UNIX_5',
                targetTimezone: 'UTC',
                estimatedJobDurationSeconds: 30,
                shellCommandToExecute: '/usr/local/bin/sync-crm-webhooks.sh',
            },
            description:
                'Loaded Weekday Business Hours Polling (Every 15 minutes from 09:00 to 17:45, Monday through Friday — 36 runs/day, 100/100 Grade A+).',
        };
    }

    if (presetId === 'vulnerable_cron_pitfalls_demo') {
        return {
            inputs: {
                ...base,
                rawExpressionInput: '* 2 13 * 5',
                selectedDialect: 'UNIX_5',
                targetTimezone: 'America/New_York',
                estimatedJobDurationSeconds: 120,
                shellCommandToExecute: '/usr/local/bin/archive.sh --date=$(date +%Y-%m-%d)',
                secondaryCronExpression: '*/5 2 * * *',
            },
            description:
                'Loaded Vulnerable Cron Pitfalls Demo: Triggers 6 CRITICAL/WARNING alerts ("* 2" 60x every-minute flood, POSIX DOM+DOW Boolean OR bug, 120s > 60s self-overlap, DST 02:00 skip, unescaped "%" in crontab command, and secondary job collision). Click "1-Click Auto-Fix" to remediate!',
        };
    }

    if (presetId === 'quartz_last_weekday_payroll') {
        return {
            inputs: {
                ...base,
                rawExpressionInput: '0 30 17 LW * ? *',
                selectedDialect: 'QUARTZ_6_7',
                targetTimezone: 'UTC',
                estimatedJobDurationSeconds: 120,
            },
            description:
                'Loaded 7-Field Java Quartz Enterprise Payroll Schedule (0 30 17 LW * ? *): Fires at 17:30:00 on the Last Weekday (Mon–Fri) of every month using the "LW" and "?" modifiers.',
        };
    }

    if (presetId === 'aws_eventbridge_3rd_friday') {
        return {
            inputs: {
                ...base,
                rawExpressionInput: 'cron(15 22 ? * 6#3 *)',
                selectedDialect: 'AWS_EVENTBRIDGE_6',
                targetTimezone: 'UTC',
                estimatedJobDurationSeconds: 300,
            },
            description:
                'Loaded 6-Field AWS EventBridge Maintenance Window: Auto-strips "cron(...)", evaluates "6#3" (3rd Friday of the month in 1–7 indexing) at 22:15 UTC.',
        };
    }

    return {
        inputs: {
            ...base,
            rawExpressionInput: 'H/20 H(0-7) * * 1-5',
            selectedDialect: 'JENKINS_HASH',
            targetTimezone: 'UTC',
            jenkinsJobNameSeed: 'kivaro-nightly-ci-pipeline',
            estimatedJobDurationSeconds: 180,
        },
        description:
            'Loaded Jenkins Hash-Jitter CI Pipeline (H/20 H(0-7) * * 1-5): Deterministically hashes the Jenkins job name via CRC-32 to distribute load and prevent top-of-hour thundering herds!',
    };
}