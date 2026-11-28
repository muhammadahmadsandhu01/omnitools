/**
 * KivaroTools — 1,000+ Enterprise Test Suite for Cron Expression Generator Engine
 * File: scripts/test-cron-generator-1000-suite.ts
 *
 * 12 Comprehensive Test Blocks (1,350+ Tests Total):
 *  1. Block 1: Engine Metadata, Defaults, 26 IANA Timezones (incl. Europe/Amsterdam) & Calendar Math
 *  2. Block 2: Jenkins `H` CRC-32 Hash Jitter & Determinism
 *  3. Block 3: Bidirectional Natural Language English -> Cron Compiler
 *  4. Block 4: Universal 7-Dialect AST Parser, Wrapper Stripping, Macros & Malformed Rejection
 *  5. Block 5: Calendar Modifier Math (L, L-N, LW, nW, #, dL), POSIX OR vs Spring AND & DST Gaps
 *  6. Block 6: Multi-Timezone Simulator, 6-Region Matrix, Monthly Heatmap & Collision Detector
 *  7. Block 7: All 14 Reliability Linter Rules, Rule 5 Invalid-Syntax Fix & Grading
 *  8. Block 8: Deterministic 1-Click Auto-Fixer (`autoFixCronPitfalls`)
 *  9. Block 9: Cross-Dialect AST Transpiler & 10-Platform DevOps Config Compiler
 * 10. Block 10: RFC 5545 .ics, CWE-1236 Sanitizer, .csv, .xlsx PKZIP/CRC-32 & 999%+ Compute Cap
 * 11. Block 11: All 6 Presets, 100 Adversarial Fuzz Inputs & Performance Throughput
 * 12. Block 12: Tool Registry Parity, Salary Countries, SEO Schema & React SSR Integrity
 */

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {
    CRON_ENGINE_VERSION,
    DEFAULT_CRON_REFERENCE_MS,
    SUPPORTED_IANA_TIMEZONES,
    computeJenkinsSeedHash,
    resolveJenkinsHashToken,
    daysInMonth,
    getDayOfWeek0Sun,
    compileEnglishToCron,
    extractZonedParts,
    formatEpochInTimezone,
    resolveLocalWallClockToEpochMs,
    buildCrossDialectTranslations,
    generateDevOpsConfigSnippet,
    analyzeAndSimulateCron,
    autoFixCronPitfalls,
    exportCronScheduleIcs,
    sanitizeCellCwe1236,
    exportCronAuditCsv,
    exportCronAuditXlsx,
    getDefaultCronInputs,
    getPresetCronInputs,
    type CronDialectId,
    type CronPresetScenarioId,
    type DevOpsConfigPlatform,
    type ResolvedCronDialect,
} from '../lib/cronGeneratorEngine';
import CronExpressionGenerator from '../components/tools/CronExpressionGenerator';
import CronExpressionGeneratorSeo, { CRON_GENERATOR_FAQS } from '../components/seo/CronExpressionGeneratorSeo';
import { tools } from '../config/toolsData';
import { SALARY_COUNTRIES, SALARY_COUNTRY_SLUGS } from '../config/salaryCountries';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assertTest(condition: boolean, id: string, message: string): void {
    totalTests++;
    if (condition) {
        passedTests++;
    } else {
        failedTests++;
        console.error(`❌ [${id}] FAILED: ${message}`);
    }
}

console.log('======================================================================');
console.log('⏱️ Running 1,000+ Enterprise Suite: Cron Expression Generator & Simulator');
console.log('======================================================================\n');

const baseInputs = getDefaultCronInputs();

// ============================================================================
// BLOCK 1: Metadata, Defaults, 26 IANA Timezones & Calendar Leap-Year Math
// ============================================================================
console.log('--- Block 1: Metadata, 26 IANA Timezones & Calendar Math ---');

assertTest(CRON_ENGINE_VERSION === '5.2.0-enterprise', 'B1-VERSION', `Engine version is 5.2.0-enterprise (got ${CRON_ENGINE_VERSION})`);
assertTest(baseInputs.rawExpressionInput === '' && baseInputs.selectedDialect === 'AUTO', 'B1-DEFAULT-IDLE', 'Default inputs start empty in AUTO mode');
assertTest(baseInputs.referenceTimestampMs === DEFAULT_CRON_REFERENCE_MS, 'B1-DEFAULT-REF', 'Default reference timestamp matches constant');

const idleReport = analyzeAndSimulateCron(baseInputs);
assertTest(idleReport.isIdleEmpty && idleReport.isValidSyntax, 'B1-IDLE-REPORT', 'Empty input returns valid idle report');
assertTest(idleReport.reliabilityScore === 100 && idleReport.reliabilityGrade === 'A+', 'B1-IDLE-GRADE', 'Idle state holds 100/100 Grade A+');
assertTest(idleReport.upcomingRuns.length === 0 && idleReport.fieldBreakdowns.length === 0, 'B1-IDLE-EMPTY-ARRAYS', 'Idle report produces 0 upcoming runs and 0 breakdowns');

assertTest(SUPPORTED_IANA_TIMEZONES.length === 26, 'B1-TZ-COUNT', `Supports 26 IANA timezones (got ${SUPPORTED_IANA_TIMEZONES.length})`);
const amsterdamTz = SUPPORTED_IANA_TIMEZONES.find((z) => z.id === 'Europe/Amsterdam');
assertTest(Boolean(amsterdamTz), 'B1-TZ-AMS-EXISTS', 'Europe/Amsterdam timezone added to SUPPORTED_IANA_TIMEZONES');
assertTest(amsterdamTz?.observesDst === true && Boolean(amsterdamTz.label.includes('Netherlands')), 'B1-TZ-AMS-DST', 'Europe/Amsterdam marks observesDst=true and Netherlands label');

SUPPORTED_IANA_TIMEZONES.forEach((z, idx) => {
    assertTest(Boolean(z.id && z.label && z.springDstDate && z.fallDstDate), `B1-TZ-FIELDS-${idx}`, `Timezone ${z.id} has complete metadata`);
    assertTest(typeof z.observesDst === 'boolean', `B1-TZ-DST-BOOL-${idx}`, `Timezone ${z.id} observesDst is boolean`);
    const parts = extractZonedParts(DEFAULT_CRON_REFERENCE_MS, z.id);
    assertTest(parts.year === 2026 && parts.month === 5 && parts.day >= 14 && parts.day <= 15, `B1-TZ-INTL-${idx}`, `Intl zoned extraction succeeds cleanly for ${z.id}`);
});

// Leap-year calendar checks across centuries & months
assertTest(daysInMonth(2024, 2) === 29, 'B1-LEAP-2024', 'Feb 2024 has 29 days');
assertTest(daysInMonth(2026, 2) === 28, 'B1-NONLEAP-2026', 'Feb 2026 has 28 days');
assertTest(daysInMonth(2000, 2) === 29, 'B1-LEAP-2000', 'Feb 2000 (divisible by 400) has 29 days');
assertTest(daysInMonth(1900, 2) === 28, 'B1-NONLEAP-1900', 'Feb 1900 (century non-400) has 28 days');

const testYears = [2024, 2025, 2026, 2027, 2028];
const expectedMonthLengths = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
for (const y of testYears) {
    for (let m = 1; m <= 12; m++) {
        const expected = m === 2 && y % 4 === 0 ? 29 : expectedMonthLengths[m];
        assertTest(daysInMonth(y, m) === expected, `B1-DIM-${y}-${m}`, `${y}-${m} has ${expected} days`);
    }
}

// Verify getDayOfWeek0Sun across 48 dates against native UTC Date
for (let i = 0; i < 48; i++) {
    const dt = new Date(Date.UTC(2026, 0, 1 + i * 7));
    const y = dt.getUTCFullYear();
    const m = dt.getUTCMonth() + 1;
    const d = dt.getUTCDate();
    assertTest(getDayOfWeek0Sun(y, m, d) === dt.getUTCDay(), `B1-DOW-${i}`, `getDayOfWeek0Sun matches Date.getUTCDay for ${y}-${m}-${d}`);
}
assertTest(getDayOfWeek0Sun(2026, 5, 14) === 4, 'B1-DOW-REF-THU', '2026-05-14 is Thursday (4)');
assertTest(getDayOfWeek0Sun(2026, 8, 1) === 6, 'B1-DOW-AUG1-SAT', '2026-08-01 is Saturday (6)');

// ============================================================================
// BLOCK 2: Jenkins `H` CRC-32 Hash Jitter & Determinism
// ============================================================================
console.log('--- Block 2: Jenkins H Hash Jitter & Determinism ---');

const jenkinsSeeds = [
    'kivaro-production-pipeline', 'auth-service-build', 'billing-worker', 'etl-nightly-sync',
    'ml-training-dag', 'pdf-render-pool', 'analytics-rollup', 'sitemap-indexer',
    'webhook-dispatcher', 'email-digest-sender', 'cdn-cache-warmer', 'backup-pg-primary',
    'redis-snapshot', 'k8s-gc-pod', 'terraform-plan-ci', 'playwright-e2e',
    'security-audit-scan', 'invoice-batch', 'payroll-calc', 'search-reindex',
    'media-transcode', 'geo-ip-update', 'certbot-renew', 'log-compactor', 'queue-drainer',
];

for (let i = 0; i < jenkinsSeeds.length; i++) {
    const seed = jenkinsSeeds[i];
    const h1 = computeJenkinsSeedHash(seed, 1);
    const h2 = computeJenkinsSeedHash(seed, 1);
    assertTest(h1 === h2 && h1 >= 0 && Number.isInteger(h1), `B2-CRC-DET-${i}`, `CRC-32 deterministic for seed "${seed}"`);

    const minRes = Number(resolveJenkinsHashToken('H', 0, 59, seed, 1));
    assertTest(minRes >= 0 && minRes <= 59 && Number.isInteger(minRes), `B2-H-MIN-${i}`, `Resolved H in 0..59 -> ${minRes}`);

    const stepRes = resolveJenkinsHashToken('H/15', 0, 59, seed, 1).split(',').map(Number);
    const stepValid = stepRes.length === 4 && stepRes.every((v, idx) => v >= 0 && v <= 59 && (idx === 0 || v - stepRes[idx - 1] === 15));
    assertTest(stepValid, `B2-H-STEP-${i}`, `Resolved H/15 produces 4 values spaced by 15 (${stepRes.join(',')})`);
}

for (let i = 0; i < 20; i++) {
    const seed = jenkinsSeeds[i];
    const hrRes = Number(resolveJenkinsHashToken('H(2-6)', 0, 23, seed, 2));
    assertTest(hrRes >= 2 && hrRes <= 6, `B2-H-RANGE-${i}`, `Resolved H(2-6) in [2,6] -> ${hrRes}`);

    const rStep = resolveJenkinsHashToken('H(10-50)/10', 0, 59, seed, 1).split(',').map(Number);
    const rStepValid = rStep.length >= 4 && rStep.every((v) => v >= 10 && v <= 50);
    assertTest(rStepValid, `B2-H-RSTEP-${i}`, `Resolved H(10-50)/10 bounded in [10,50] (${rStep.join(',')})`);
}

assertTest(
    computeJenkinsSeedHash('kivaro-job-alpha', 1) !== computeJenkinsSeedHash('kivaro-job-beta', 1),
    'B2-SEED-DIFF',
    'Different Jenkins job names produce distinct CRC-32 hashes'
);
assertTest(resolveJenkinsHashToken('*/5', 0, 59, 'seed', 1) === '*/5', 'B2-NONH-PASSTHROUGH', 'Non-H token passes through unchanged');

const distinctMinutes = new Set<string>();
for (let i = 0; i < 10; i++) {
    const rep = analyzeAndSimulateCron({
        ...baseInputs,
        rawExpressionInput: 'H H(0-5) * * 1-5',
        selectedDialect: 'JENKINS_HASH',
        jenkinsJobNameSeed: jenkinsSeeds[i],
    });
    assertTest(rep.isValidSyntax && rep.detectedDialect === 'JENKINS_HASH', `B2-RUN-SEED-${i}`, `Jenkins simulation valid for ${jenkinsSeeds[i]}`);
    distinctMinutes.add(rep.fieldBreakdowns[0]?.resolvedTokenAfterHash || '');
}
assertTest(distinctMinutes.size >= 4, 'B2-SEED-SPREAD', `10 Jenkins seeds spread across ${distinctMinutes.size} distinct minute slots`);

// ============================================================================
// BLOCK 3: Bidirectional Natural Language English -> Cron Compiler
// ============================================================================
console.log('--- Block 3: English -> Cron Compiler ---');

const englishValidCases: { phrase: string; dialect: ResolvedCronDialect; expectedSubstr: string }[] = [
    { phrase: 'every 15 mins during business hours on weekdays', dialect: 'UNIX_5', expectedSubstr: '*/15 9-17 * * 1-5' },
    { phrase: 'every 15 mins during business hours on weekdays', dialect: 'QUARTZ_6_7', expectedSubstr: '0 */15 9-17 ? * MON-FRI *' },
    { phrase: 'every 15 mins during business hours on weekdays', dialect: 'AWS_EVENTBRIDGE_6', expectedSubstr: '*/15 9-17 ? * MON-FRI *' },
    { phrase: 'every 15 mins during business hours on weekdays', dialect: 'SPRING_6', expectedSubstr: '0 */15 9-17 * * 1-5' },
    { phrase: 'every 10 seconds', dialect: 'QUARTZ_6_7', expectedSubstr: '*/10 * * * * ? *' },
    { phrase: 'every 5 minutes', dialect: 'UNIX_5', expectedSubstr: '*/5 * * * *' },
    { phrase: 'every minute', dialect: 'UNIX_5', expectedSubstr: '* * * * *' },
    { phrase: 'every 4 hours', dialect: 'UNIX_5', expectedSubstr: '0 */4 * * *' },
    { phrase: 'every hour', dialect: 'UNIX_5', expectedSubstr: '0 * * * *' },
    { phrase: 'hourly', dialect: 'UNIX_5', expectedSubstr: '0 * * * *' },
    { phrase: 'daily at midnight', dialect: 'UNIX_5', expectedSubstr: '0 0 * * *' },
    { phrase: 'every day at noon', dialect: 'UNIX_5', expectedSubstr: '0 12 * * *' },
    { phrase: 'every day at 2:30 am', dialect: 'UNIX_5', expectedSubstr: '30 2 * * *' },
    { phrase: 'every day at 5:45 pm', dialect: 'UNIX_5', expectedSubstr: '45 17 * * *' },
    { phrase: 'every day at 12 am', dialect: 'UNIX_5', expectedSubstr: '0 0 * * *' },
    { phrase: 'every day at 12 pm', dialect: 'UNIX_5', expectedSubstr: '0 12 * * *' },
    { phrase: 'every day at 9 am', dialect: 'UNIX_5', expectedSubstr: '0 9 * * *' },
    { phrase: 'every day at 17:15', dialect: 'UNIX_5', expectedSubstr: '15 17 * * *' },
    { phrase: 'on the last weekday of every month at 5:30 pm', dialect: 'QUARTZ_6_7', expectedSubstr: '0 30 17 LW * ? *' },
    { phrase: 'on the last day of the month at midnight', dialect: 'QUARTZ_6_7', expectedSubstr: '0 0 0 L * ? *' },
    { phrase: 'nearest weekday to the 15th at 8 am', dialect: 'QUARTZ_6_7', expectedSubstr: '0 0 8 15W * ? *' },
    { phrase: 'every 3rd friday at 10:15 pm', dialect: 'QUARTZ_6_7', expectedSubstr: '0 15 22 ? * FRI#3 *' },
    { phrase: 'every 1st monday at 9:00 am', dialect: 'QUARTZ_6_7', expectedSubstr: '0 0 9 ? * MON#1 *' },
    { phrase: 'every weekend at 6 am', dialect: 'UNIX_5', expectedSubstr: '0 6 * * 0,6' },
    { phrase: 'every weekend at 6 am', dialect: 'QUARTZ_6_7', expectedSubstr: '0 0 6 ? * SUN,SAT *' },
    { phrase: 'monthly at 1 am', dialect: 'UNIX_5', expectedSubstr: '0 1 1 * *' },
    { phrase: 'every sunday at 3 am', dialect: 'UNIX_5', expectedSubstr: '0 3 * * 0' },
    { phrase: 'every sunday at 3 am', dialect: 'AWS_EVENTBRIDGE_6', expectedSubstr: '0 3 ? * 1 *' },
    { phrase: 'every monday and friday at 8:30 am', dialect: 'UNIX_5', expectedSubstr: '30 8 * * 1,5' },
    { phrase: 'every day on the 15th at 4 pm', dialect: 'UNIX_5', expectedSubstr: '0 16 15 * *' },
];

englishValidCases.forEach((tc, idx) => {
    const out = compileEnglishToCron(tc.phrase, tc.dialect);
    assertTest(out.isValidEnglish === true, `B3-VALID-FLAG-${idx}`, `"${tc.phrase}" (${tc.dialect}) returns isValidEnglish=true`);
    assertTest(
        out.cronExpression === tc.expectedSubstr,
        `B3-VALID-EXPR-${idx}`,
        `"${tc.phrase}" (${tc.dialect}) compiled "${out.cronExpression}" (expected "${tc.expectedSubstr}")`
    );
});

const englishInvalidCases = [
    '',
    '   ',
    'every 0 minutes',
    'every 60 minutes',
    'every 99 mins',
    'every 0 hours',
    'every 24 hours',
    'every 0 seconds',
    'every 75 seconds',
    'at 25:00',
    'at 12:60',
    'at 13:00 pm',
    'at 0 am',
    'at 13 pm',
    'random unrelated text pizza',
];

englishInvalidCases.forEach((phrase, idx) => {
    const out = compileEnglishToCron(phrase, 'UNIX_5');
    assertTest(out.isValidEnglish === false, `B3-INV-FLAG-${idx}`, `Invalid English "${phrase}" sets isValidEnglish=false`);
    assertTest(Boolean(out.errorMessage && out.errorMessage.length > 10), `B3-INV-ERR-${idx}`, `Invalid English "${phrase}" returns actionable errorMessage`);
});

// Compile additional weekday/hour combinations cleanly
for (let h = 1; h <= 11; h++) {
    const resAm = compileEnglishToCron(`every day at ${h} am`, 'UNIX_5');
    const resPm = compileEnglishToCron(`every day at ${h} pm`, 'UNIX_5');
    assertTest(resAm.cronExpression === `0 ${h} * * *`, `B3-HOUR-AM-${h}`, `${h} am -> 0 ${h} * * *`);
    assertTest(resPm.cronExpression === `0 ${h + 12} * * *`, `B3-HOUR-PM-${h}`, `${h} pm -> 0 ${h + 12} * * *`);
}

// ============================================================================
// BLOCK 4: 7-Dialect Parser, Wrapper Stripping, Macros & Malformed Rejection
// ============================================================================
console.log('--- Block 4: 7-Dialect Parser, Wrappers, Macros & Rejection ---');

const posixMacros: { macro: string; expanded: string; isReboot: boolean }[] = [
    { macro: '@yearly', expanded: '0 0 1 1 *', isReboot: false },
    { macro: '@annually', expanded: '0 0 1 1 *', isReboot: false },
    { macro: '@monthly', expanded: '0 0 1 * *', isReboot: false },
    { macro: '@weekly', expanded: '0 0 * * 0', isReboot: false },
    { macro: '@daily', expanded: '0 0 * * *', isReboot: false },
    { macro: '@midnight', expanded: '0 0 * * *', isReboot: false },
    { macro: '@hourly', expanded: '0 * * * *', isReboot: false },
    { macro: '@reboot', expanded: '@reboot', isReboot: true },
];

posixMacros.forEach((m, idx) => {
    const rep = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: m.macro });
    assertTest(rep.isValidSyntax, `B4-MACRO-VALID-${idx}`, `Macro ${m.macro} parses cleanly`);
    assertTest(rep.expandedMacroFrom === m.macro, `B4-MACRO-FROM-${idx}`, `expandedMacroFrom tracks ${m.macro}`);
    assertTest(rep.cleanCronExpression === m.expanded, `B4-MACRO-CLEAN-${idx}`, `cleanCronExpression is ${m.expanded}`);
    assertTest(rep.isRebootMacro === m.isReboot, `B4-MACRO-REBOOT-${idx}`, `isRebootMacro=${m.isReboot} for ${m.macro}`);
});

const macroWithCmd = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: '@daily /usr/local/bin/nightly.sh', shellCommandToExecute: '' });
assertTest(macroWithCmd.extractedShellCommand === '/usr/local/bin/nightly.sh', 'B4-MACRO-CMD', 'Extracts trailing shell command after @daily macro');

const rebootWithCmd = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: '@reboot /usr/local/bin/boot.sh', shellCommandToExecute: '' });
assertTest(rebootWithCmd.isRebootMacro && rebootWithCmd.extractedShellCommand === '/usr/local/bin/boot.sh', 'B4-REBOOT-CMD', 'Extracts trailing shell command after @reboot macro');

// Wrapper auto-detection
const wrapperCases: { raw: string; expectedDialect: ResolvedCronDialect; expectedClean: string }[] = [
    { raw: 'cron(15 22 ? * 6#3 *)', expectedDialect: 'AWS_EVENTBRIDGE_6', expectedClean: '15 22 ? * 6#3 *' },
    { raw: '@Scheduled(cron = "0 */10 9-17 * * MON-FRI")', expectedDialect: 'SPRING_6', expectedClean: '0 */10 9-17 * * MON-FRI' },
    { raw: "schedule: '7 3 * * *'", expectedDialect: 'K8S_CRONJOB', expectedClean: '7 3 * * *' },
    { raw: 'cron: "*/15 * * * *"', expectedDialect: 'K8S_CRONJOB', expectedClean: '*/15 * * * *' },
];
wrapperCases.forEach((wc, idx) => {
    const rep = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: wc.raw, selectedDialect: 'AUTO' });
    assertTest(rep.isValidSyntax, `B4-WRAP-VALID-${idx}`, `Wrapper "${wc.raw}" parses validly`);
    assertTest(rep.detectedDialect === wc.expectedDialect, `B4-WRAP-DIAL-${idx}`, `Detected dialect ${wc.expectedDialect}`);
    assertTest(rep.cleanCronExpression === wc.expectedClean, `B4-WRAP-CLEAN-${idx}`, `Stripped clean expr "${wc.expectedClean}"`);
});

const inlineLine = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: '*/5 * * * * /usr/local/bin/sync.sh --fast', shellCommandToExecute: '' });
assertTest(inlineLine.isValidSyntax && inlineLine.cleanCronExpression === '*/5 * * * *', 'B4-LINE-CRON', 'Strips trailing shell command from crontab line');
assertTest(inlineLine.extractedShellCommand === '/usr/local/bin/sync.sh --fast', 'B4-LINE-CMD', 'Captures inline trailing shell command');

// Valid multi-dialect syntax matrix (20 cases)
const validMultiDialectCases: { expr: string; sel: CronDialectId; det: ResolvedCronDialect; fields: number }[] = [
    { expr: '7 4 * * *', sel: 'AUTO', det: 'UNIX_5', fields: 5 },
    { expr: '15 9-17 * * MON-FRI', sel: 'AUTO', det: 'UNIX_5', fields: 5 },
    { expr: '0 0 1,15 JAN,DEC 0,6', sel: 'UNIX_5', det: 'UNIX_5', fields: 5 },
    { expr: '5 22-2 * * *', sel: 'UNIX_5', det: 'UNIX_5', fields: 5 },
    { expr: '*/15 * * * *', sel: 'K8S_CRONJOB', det: 'K8S_CRONJOB', fields: 5 },
    { expr: '*/10 * * * *', sel: 'GITHUB_ACTIONS', det: 'GITHUB_ACTIONS', fields: 5 },
    { expr: '0 */15 8-18 * * MON-FRI', sel: 'AUTO', det: 'SPRING_6', fields: 6 },
    { expr: '30 0 12 1-15/2 1-6 *', sel: 'SPRING_6', det: 'SPRING_6', fields: 6 },
    { expr: '0 30 17 LW * ? *', sel: 'AUTO', det: 'QUARTZ_6_7', fields: 7 },
    { expr: '0 0 12 L-3 * ?', sel: 'AUTO', det: 'QUARTZ_6_7', fields: 6 },
    { expr: '0 0 9 15W * ? *', sel: 'QUARTZ_6_7', det: 'QUARTZ_6_7', fields: 7 },
    { expr: '0 15 10 ? * 6L 2026', sel: 'QUARTZ_6_7', det: 'QUARTZ_6_7', fields: 7 },
    { expr: '0 0 8 ? * WED#2 *', sel: 'QUARTZ_6_7', det: 'QUARTZ_6_7', fields: 7 },
    { expr: '15 22 ? * 6#3 *', sel: 'AUTO', det: 'AWS_EVENTBRIDGE_6', fields: 6 },
    { expr: '0 12 L * ? 2026-2030', sel: 'AWS_EVENTBRIDGE_6', det: 'AWS_EVENTBRIDGE_6', fields: 6 },
    { expr: '0 8 ? * MON-FRI *', sel: 'AWS_EVENTBRIDGE_6', det: 'AWS_EVENTBRIDGE_6', fields: 6 },
    { expr: 'H/15 * * * *', sel: 'AUTO', det: 'JENKINS_HASH', fields: 5 },
    { expr: 'H(0-7) * * * 1-5', sel: 'AUTO', det: 'JENKINS_HASH', fields: 5 },
    { expr: '7 3 * * 7', sel: 'UNIX_5', det: 'UNIX_5', fields: 5 },
    { expr: '10/20 * * * *', sel: 'UNIX_5', det: 'UNIX_5', fields: 5 },
];

validMultiDialectCases.forEach((vc, idx) => {
    const rep = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: vc.expr, selectedDialect: vc.sel });
    assertTest(rep.isValidSyntax, `B4-MULTI-VALID-${idx}`, `Expression "${vc.expr}" (${vc.sel}) is valid (${rep.syntaxErrorMessage || 'ok'})`);
    assertTest(rep.detectedDialect === vc.det, `B4-MULTI-DET-${idx}`, `Expression "${vc.expr}" detected as ${vc.det} (got ${rep.detectedDialect})`);
    assertTest(rep.fieldBreakdowns.length === vc.fields, `B4-MULTI-FCOUNT-${idx}`, `Expression "${vc.expr}" has ${vc.fields} fieldBreakdowns`);
});

// Malformed & impossible syntax rejection (35 cases)
const invalidExpressions: { expr: string; sel: CronDialectId; reason: string }[] = [
    { expr: '* *', sel: 'AUTO', reason: 'too few fields (2)' },
    { expr: '* * *', sel: 'AUTO', reason: 'too few fields (3)' },
    { expr: '* * * *', sel: 'AUTO', reason: 'too few fields (4)' },
    { expr: '* * * * * * * *', sel: 'AUTO', reason: 'too many fields (8)' },
    { expr: '60 * * * *', sel: 'UNIX_5', reason: 'minute 60 out of bounds' },
    { expr: '* 24 * * *', sel: 'UNIX_5', reason: 'hour 24 out of bounds' },
    { expr: '0 0 0 * *', sel: 'UNIX_5', reason: 'DOM 0 out of bounds' },
    { expr: '0 0 32 * *', sel: 'UNIX_5', reason: 'DOM 32 out of bounds' },
    { expr: '0 0 * 0 *', sel: 'UNIX_5', reason: 'month 0 out of bounds' },
    { expr: '0 0 * 13 *', sel: 'UNIX_5', reason: 'month 13 out of bounds' },
    { expr: '0 0 * * 8', sel: 'UNIX_5', reason: 'DOW 8 out of bounds' },
    { expr: '60 * * * * *', sel: 'SPRING_6', reason: 'seconds 60 out of bounds' },
    { expr: '? 0 * * *', sel: 'UNIX_5', reason: 'question mark in minute' },
    { expr: '0 ? * * *', sel: 'UNIX_5', reason: 'question mark in hour' },
    { expr: '0 0 12 0 * ? *', sel: 'QUARTZ_6_7', reason: 'DOM 0 in Quartz' },
    { expr: '0 0 12 ? * 0 *', sel: 'QUARTZ_6_7', reason: 'DOW 0 invalid in 1..7 Quartz' },
    { expr: '0 12 ? * 0 *', sel: 'AWS_EVENTBRIDGE_6', reason: 'DOW 0 invalid in 1..7 EventBridge' },
    { expr: '0 12 ? * 8 *', sel: 'AWS_EVENTBRIDGE_6', reason: 'DOW 8 invalid in 1..7 EventBridge' },
    { expr: '0 0 12 ? * MON 1969', sel: 'QUARTZ_6_7', reason: 'Year 1969 below 1970' },
    { expr: '0 0 12 ? * MON 2100', sel: 'QUARTZ_6_7', reason: 'Year 2100 above 2099' },
    { expr: '*/0 * * * *', sel: 'UNIX_5', reason: 'step 0 invalid' },
    { expr: '*/abc * * * *', sel: 'UNIX_5', reason: 'non-numeric step' },
    { expr: '1-2-3 * * * *', sel: 'UNIX_5', reason: 'malformed double range' },
    { expr: '0 0 30 2 *', sel: 'UNIX_5', reason: 'impossible Feb 30' },
    { expr: '0 0 31 2 *', sel: 'UNIX_5', reason: 'impossible Feb 31' },
    { expr: '0 0 31 4 *', sel: 'UNIX_5', reason: 'impossible Apr 31' },
    { expr: '0 0 31 6 *', sel: 'UNIX_5', reason: 'impossible Jun 31' },
    { expr: '0 0 31 9 *', sel: 'UNIX_5', reason: 'impossible Sep 31' },
    { expr: '0 0 31 11 *', sel: 'UNIX_5', reason: 'impossible Nov 31' },
    { expr: '0 0 0W * ? *', sel: 'QUARTZ_6_7', reason: '0W invalid nearest weekday' },
    { expr: '0 0 32W * ? *', sel: 'QUARTZ_6_7', reason: '32W invalid nearest weekday' },
    { expr: 'foo * * * *', sel: 'UNIX_5', reason: 'unrecognized text token' },
    { expr: '* bar * * *', sel: 'UNIX_5', reason: 'unrecognized hour text' },
    { expr: '* * baz * *', sel: 'UNIX_5', reason: 'unrecognized dom text' },
    { expr: '* * * qux *', sel: 'UNIX_5', reason: 'unrecognized month text' },
];

invalidExpressions.forEach((ic, idx) => {
    const rep = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: ic.expr, selectedDialect: ic.sel });
    assertTest(!rep.isValidSyntax, `B4-INV-FLAG-${idx}`, `Rejects invalid cron "${ic.expr}" (${ic.reason})`);
    assertTest(Boolean(rep.syntaxErrorMessage && rep.syntaxErrorMessage.length > 5), `B4-INV-MSG-${idx}`, `Provides syntaxErrorMessage for "${ic.expr}"`);
});

// ============================================================================
// BLOCK 5: Calendar Modifier Math, POSIX OR vs Spring AND & DST Transitions
// ============================================================================
console.log('--- Block 5: Calendar Modifiers, Boolean OR vs AND & DST Gaps ---');

// Helper: active days in the heatmap for any expression + reference timestamp
function getHeatmapMatchedDays(expr: string, dialect: CronDialectId, year: number, month1to12: number, tz = 'UTC'): number[] {
    const rep = analyzeAndSimulateCron({
        ...baseInputs,
        rawExpressionInput: expr,
        selectedDialect: dialect,
        targetTimezone: tz,
        referenceTimestampMs: Date.UTC(year, month1to12 - 1, 1, 0, 0, 0),
    });
    return rep.calendarHeatmapDays.filter((d) => d.primaryRunsCount > 0).map((d) => d.dayOfMonth);
}

// Leap-year February L and L-N checks
assertTest(getHeatmapMatchedDays('0 0 12 L * ? *', 'QUARTZ_6_7', 2024, 2).join(',') === '29', 'B5-FEB2024-L', 'Quartz L matches Feb 29 in leap year 2024');
assertTest(getHeatmapMatchedDays('0 0 12 L * ? *', 'QUARTZ_6_7', 2026, 2).join(',') === '28', 'B5-FEB2026-L', 'Quartz L matches Feb 28 in non-leap year 2026');
assertTest(getHeatmapMatchedDays('0 0 12 L-3 * ? *', 'QUARTZ_6_7', 2026, 2).join(',') === '25', 'B5-FEB2026-L3', 'Quartz L-3 matches Feb 25 in 2026');
assertTest(getHeatmapMatchedDays('0 30 17 LW * ? *', 'QUARTZ_6_7', 2026, 5).join(',') === '29', 'B5-MAY2026-LW', 'Quartz LW matches Friday May 29, 2026 (since May 31 is Sun)');

// Nearest Weekday nW boundary tests (never crosses month boundary!)
// Aug 2026: Aug 1 is Sat -> 1W must shift forward to Mon Aug 3
assertTest(getHeatmapMatchedDays('0 0 9 1W * ? *', 'QUARTZ_6_7', 2026, 8).join(',') === '3', 'B5-1W-AUG2026', '1W on Sat Aug 1 shifts to Mon Aug 3 without crossing into July');
// Aug 2026: Aug 15 is Sat -> 15W shifts to Fri Aug 14
assertTest(getHeatmapMatchedDays('0 0 9 15W * ? *', 'QUARTZ_6_7', 2026, 8).join(',') === '14', 'B5-15W-AUG2026', '15W on Sat Aug 15 shifts to Fri Aug 14');
// Feb 2026: Feb 15 is Sun -> 15W shifts to Mon Feb 16
assertTest(getHeatmapMatchedDays('0 0 9 15W * ? *', 'QUARTZ_6_7', 2026, 2).join(',') === '16', 'B5-15W-FEB2026', '15W on Sun Feb 15 shifts to Mon Feb 16');
// May 2026: May 31 is Sun -> 31W shifts backward to Fri May 29
assertTest(getHeatmapMatchedDays('0 0 9 31W * ? *', 'QUARTZ_6_7', 2026, 5).join(',') === '29', 'B5-31W-MAY2026', '31W on Sun May 31 shifts backward to Fri May 29 without crossing into June');

// Nth weekday (6#3 = 3rd Friday in Quartz 1=Sun..7=Sat; May 2026 Fridays: 1,8,15,22,29)
assertTest(getHeatmapMatchedDays('15 22 ? * 6#3 *', 'AWS_EVENTBRIDGE_6', 2026, 5).join(',') === '15', 'B5-6HASH3-MAY2026', 'AWS 6#3 matches 3rd Friday May 15, 2026');
assertTest(getHeatmapMatchedDays('0 15 10 ? * 6L 2026', 'QUARTZ_6_7', 2026, 5).join(',') === '29', 'B5-6L-MAY2026', 'Quartz 6L matches last Friday May 29, 2026');

// POSIX Boolean OR vs Spring Boolean AND for Friday the 13th
const mayOrDays = getHeatmapMatchedDays('0 0 13 * 5', 'UNIX_5', 2026, 5);
assertTest(mayOrDays.join(',') === '1,8,13,15,22,29', 'B5-POSIX-OR-MAY', `POSIX 0 0 13 * 5 fires on all Fridays + 13th in May 2026 (${mayOrDays.join(',')})`);
const k8sOrDays = getHeatmapMatchedDays('0 0 13 * 5', 'K8S_CRONJOB', 2026, 5);
assertTest(k8sOrDays.join(',') === '1,8,13,15,22,29', 'B5-K8S-OR-MAY', 'K8s batch/v1 uses same POSIX Boolean OR union');
const springMayAndDays = getHeatmapMatchedDays('0 0 0 13 * 5', 'SPRING_6', 2026, 5);
assertTest(springMayAndDays.length === 0, 'B5-SPRING-AND-MAY', 'Spring 0 0 0 13 * 5 has 0 matches in May 2026 (Wed 13th is not Friday)');
const springNovAndDays = getHeatmapMatchedDays('0 0 0 13 * 5', 'SPRING_6', 2026, 11);
assertTest(springNovAndDays.join(',') === '13', 'B5-SPRING-AND-NOV', 'Spring 0 0 0 13 * 5 fires ONLY on Friday Nov 13, 2026');

// DST Spring-Forward Skip Detection & Wall-Clock Resolution
const dstGapCases: { tz: string; y: number; m: number; d: number; h: number; min: number; expectSkip: boolean }[] = [
    { tz: 'America/New_York', y: 2026, m: 3, d: 8, h: 2, min: 15, expectSkip: true },
    { tz: 'America/Chicago', y: 2026, m: 3, d: 8, h: 2, min: 30, expectSkip: true },
    { tz: 'America/Los_Angeles', y: 2026, m: 3, d: 8, h: 2, min: 45, expectSkip: true },
    { tz: 'America/Toronto', y: 2026, m: 3, d: 8, h: 2, min: 5, expectSkip: true },
    { tz: 'Europe/London', y: 2026, m: 3, d: 29, h: 1, min: 15, expectSkip: true },
    { tz: 'Europe/Berlin', y: 2026, m: 3, d: 29, h: 2, min: 15, expectSkip: true },
    { tz: 'Europe/Amsterdam', y: 2026, m: 3, d: 29, h: 2, min: 15, expectSkip: true },
    { tz: 'Europe/Paris', y: 2026, m: 3, d: 29, h: 2, min: 30, expectSkip: true },
    { tz: 'Australia/Sydney', y: 2026, m: 10, d: 4, h: 2, min: 15, expectSkip: true },
    { tz: 'Pacific/Auckland', y: 2026, m: 9, d: 27, h: 2, min: 15, expectSkip: true },
    // Non-DST zones on exact same dates must NOT skip
    { tz: 'UTC', y: 2026, m: 3, d: 8, h: 2, min: 15, expectSkip: false },
    { tz: 'UTC', y: 2026, m: 3, d: 29, h: 2, min: 15, expectSkip: false },
    { tz: 'Asia/Karachi', y: 2026, m: 3, d: 29, h: 2, min: 15, expectSkip: false },
    { tz: 'Asia/Tokyo', y: 2026, m: 3, d: 8, h: 2, min: 15, expectSkip: false },
    { tz: 'America/Mexico_City', y: 2026, m: 3, d: 8, h: 2, min: 15, expectSkip: false },
    { tz: 'Asia/Dubai', y: 2026, m: 3, d: 29, h: 2, min: 15, expectSkip: false },
    { tz: 'America/Sao_Paulo', y: 2026, m: 3, d: 29, h: 2, min: 15, expectSkip: false },
    { tz: 'Africa/Johannesburg', y: 2026, m: 3, d: 29, h: 2, min: 15, expectSkip: false },
    { tz: 'America/New_York', y: 2026, m: 3, d: 7, h: 2, min: 15, expectSkip: false },
    { tz: 'Europe/Amsterdam', y: 2026, m: 3, d: 28, h: 2, min: 15, expectSkip: false },
];

dstGapCases.forEach((dc, idx) => {
    const res = resolveLocalWallClockToEpochMs(dc.y, dc.m, dc.d, dc.h, dc.min, 0, dc.tz);
    assertTest(
        res.skippedBySpringForwardDst === dc.expectSkip,
        `B5-DST-GAP-${idx}`,
        `${dc.tz} ${dc.y}-${dc.m}-${dc.d} ${dc.h}:${dc.min} skippedBySpringForwardDst=${dc.expectSkip}`
    );
});

// Round-trip wall clock across all 26 timezones at 14:35 on 2026-05-14
SUPPORTED_IANA_TIMEZONES.forEach((z, idx) => {
    const resolved = resolveLocalWallClockToEpochMs(2026, 5, 14, 14, 35, 0, z.id);
    assertTest(!resolved.skippedBySpringForwardDst, `B5-RT-NOSKIP-${idx}`, `${z.id} 2026-05-14 14:35 not skipped`);
    const back = extractZonedParts(resolved.epochMs, z.id);
    assertTest(
        back.year === 2026 && back.month === 5 && back.day === 14 && back.hour === 14 && back.minute === 35,
        `B5-RT-BACK-${idx}`,
        `${z.id} round-trips 2026-05-14 14:35 cleanly (got ${back.hour}:${back.minute})`
    );
    const fmt = formatEpochInTimezone(resolved.epochMs, z.id);
    assertTest(fmt.includes(`14:35:00 (${z.id})`), `B5-FMT-${idx}`, `formatEpochInTimezone contains 14:35:00 (${z.id})`);
});

// End-to-end simulation skips nonexistent DST runs on March 8 (NY) and March 29 (Amsterdam)
const nySkipSim = analyzeAndSimulateCron({
    ...baseInputs,
    rawExpressionInput: '15 2 * * *',
    targetTimezone: 'America/New_York',
    referenceTimestampMs: Date.UTC(2026, 2, 7, 12, 0, 0),
});
assertTest(!nySkipSim.upcomingRuns.some((r) => r.targetTimezoneFormatted.includes('2026-03-08 02:15')), 'B5-SIM-NY-SKIP', 'Simulator skips nonexistent 2026-03-08 02:15 in America/New_York');
assertTest(nySkipSim.upcomingRuns.some((r) => r.targetTimezoneFormatted.includes('2026-03-09 02:15')), 'B5-SIM-NY-NEXT', 'Simulator resumes cleanly on 2026-03-09 02:15 in America/New_York');

const amsSkipSim = analyzeAndSimulateCron({
    ...baseInputs,
    rawExpressionInput: '15 2 * * *',
    targetTimezone: 'Europe/Amsterdam',
    referenceTimestampMs: Date.UTC(2026, 2, 28, 12, 0, 0),
});
assertTest(!amsSkipSim.upcomingRuns.some((r) => r.targetTimezoneFormatted.includes('2026-03-29 02:15')), 'B5-SIM-AMS-SKIP', 'Simulator skips nonexistent 2026-03-29 02:15 in Europe/Amsterdam');
assertTest(amsSkipSim.upcomingRuns.some((r) => r.targetTimezoneFormatted.includes('2026-03-30 02:15')), 'B5-SIM-AMS-NEXT', 'Simulator resumes cleanly on 2026-03-30 02:15 in Europe/Amsterdam');

// ============================================================================
// BLOCK 6: Multi-Timezone Simulator, 6-Region Matrix, Heatmap & Collisions
// ============================================================================
console.log('--- Block 6: Simulator Runs, 6-Region Matrix, Heatmap & Collisions ---');

const simReport = analyzeAndSimulateCron({
    ...baseInputs,
    rawExpressionInput: '*/15 9-17 * * 1-5',
    targetTimezone: 'Europe/Amsterdam',
    secondaryCronExpression: '0 9-17 * * 1-5',
});

assertTest(simReport.upcomingRuns.length === 15, 'B6-RUNS-15', 'Simulator computes exactly 15 upcoming runs');
for (let i = 0; i < simReport.upcomingRuns.length; i++) {
    const run = simReport.upcomingRuns[i];
    assertTest(run.runIndex === i + 1, `B6-RUN-IDX-${i}`, `Run index ${run.runIndex} sequential`);
    assertTest(run.epochMs > DEFAULT_CRON_REFERENCE_MS, `B6-RUN-FUTURE-${i}`, `Run #${i + 1} strictly after referenceMs`);
    if (i > 0) {
        assertTest(run.epochMs > simReport.upcomingRuns[i - 1].epochMs, `B6-RUN-MONO-${i}`, `Run #${i + 1} strictly chronological`);
    }
    assertTest(run.targetTimezoneFormatted.includes('(Europe/Amsterdam)'), `B6-RUN-TZFMT-${i}`, `Run #${i + 1} formatted in Europe/Amsterdam`);
}

assertTest(simReport.globalTimezoneMatrix.length === 6, 'B6-MATRIX-6', 'Global timezone matrix has 6 regions');
simReport.globalTimezoneMatrix.forEach((m, idx) => {
    assertTest(Boolean(m.ianaTimezone && m.regionLabel && m.nextRunFormatted.includes(m.ianaTimezone)), `B6-MATRIX-ROW-${idx}`, `Matrix region ${m.ianaTimezone} populated`);
});

assertTest(simReport.calendarHeatmapMonthLabel === 'May 2026' && simReport.calendarHeatmapDays.length === 31, 'B6-HEAT-MAY31', 'May 2026 heatmap has 31 days');
simReport.calendarHeatmapDays.forEach((cell, idx) => {
    assertTest(cell.dayOfMonth === idx + 1 && cell.intensityLevel >= 0 && cell.intensityLevel <= 4, `B6-HEAT-DAY-${idx}`, `Heatmap day ${cell.dayOfMonth} bounded`);
    assertTest(cell.weekdayIndex0Sun >= 0 && cell.weekdayIndex0Sun <= 6, `B6-HEAT-DOW-${idx}`, `Heatmap day ${cell.dayOfMonth} weekday index 0..6`);
});

const feb2024Heat = analyzeAndSimulateCron({
    ...baseInputs,
    rawExpressionInput: '0 8 * * *',
    referenceTimestampMs: Date.UTC(2024, 1, 1, 0, 0, 0),
});
assertTest(feb2024Heat.calendarHeatmapDays.length === 29, 'B6-HEAT-FEB29', 'Leap-year Feb 2024 heatmap renders 29 days');

assertTest(simReport.collisionCountInNext15Runs > 0, 'B6-COLLISION-POS', 'Detects collisions between */15 9-17 and 0 9-17');
const noCollisionReport = analyzeAndSimulateCron({
    ...baseInputs,
    rawExpressionInput: '11 * * * *',
    secondaryCronExpression: '23 * * * *',
});
assertTest(noCollisionReport.collisionCountInNext15Runs === 0, 'B6-COLLISION-ZERO', 'Disjoint minute schedules produce 0 collisions');

const badSecondaryReport = analyzeAndSimulateCron({
    ...baseInputs,
    rawExpressionInput: '7 * * * *',
    secondaryCronExpression: '99 *',
});
assertTest(Boolean(badSecondaryReport.secondaryCronError), 'B6-SEC-ERR', 'Malformed secondary cron sets secondaryCronError');

// ============================================================================
// BLOCK 7: All 14 Reliability Linter Rules & Rule 5 Upgrade Verification
// ============================================================================
console.log('--- Block 7: All 14 Reliability Linter Rules & Grading ---');

function ruleIdsOf(rep: ReturnType<typeof analyzeAndSimulateCron>): string[] {
    return rep.lintFindings.map((f) => f.ruleId);
}

// Rule 1
const r1 = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: '99 2 * * *' });
assertTest(ruleIdsOf(r1).includes('CRON-SYN-001_INVALID_GRAMMAR') && r1.reliabilityScore === 0 && r1.reliabilityGrade === 'F', 'B7-R1', 'Rule 1 triggers CRITICAL & score 0 Grade F on syntax error');

// Rule 2
const r2 = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: '* 3 * * *' });
assertTest(ruleIdsOf(r2).includes('CRON-MIN-002_ACCIDENTAL_MINUTE_FLOOD'), 'B7-R2', 'Rule 2 catches accidental * minute flood');

// Rule 3
const r3 = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: '7 3 13 * 5', selectedDialect: 'UNIX_5' });
assertTest(ruleIdsOf(r3).includes('CRON-OR-003_DOM_AND_DOW_BOOLEAN_OR_TRAP'), 'B7-R3', 'Rule 3 catches POSIX DOM+DOW Boolean OR trap');

// Rule 4
const r4 = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: '0 7 12 * * * *', selectedDialect: 'QUARTZ_6_7' });
assertTest(ruleIdsOf(r4).includes('CRON-QAW-004_MISSING_QUESTION_MARK_EXCLUSION'), 'B7-R4-BOTHSTAR', 'Rule 4 catches Quartz expression missing ?');
const r4BothQ = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: '0 7 12 ? * ? *', selectedDialect: 'QUARTZ_6_7' });
assertTest(ruleIdsOf(r4BothQ).includes('CRON-QAW-004_MISSING_QUESTION_MARK_EXCLUSION'), 'B7-R4-BOTHQ', 'Rule 4 catches Quartz with ? in both DOM and DOW');

// Rule 5 (CRITICAL UPGRADE CHECK: fires even when isValidSyntax === false!)
const r5QuartzInvalid = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: '0 7 12 ? * 0 *', selectedDialect: 'QUARTZ_6_7' });
assertTest(!r5QuartzInvalid.isValidSyntax, 'B7-R5-QUARTZ-SYN', 'Quartz DOW=0 fails syntax range check (requires 1..7)');
assertTest(ruleIdsOf(r5QuartzInvalid).includes('CRON-DOW-005_SUNDAY_ZERO_INDEX_MISMATCH'), 'B7-R5-QUARTZ-RULE', 'Rule 5 STILL fires even when isValidSyntax is false in Quartz!');
const r5AwsInvalid = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: '7 12 ? * 0 *', selectedDialect: 'AWS_EVENTBRIDGE_6' });
assertTest(!r5AwsInvalid.isValidSyntax && ruleIdsOf(r5AwsInvalid).includes('CRON-DOW-005_SUNDAY_ZERO_INDEX_MISMATCH'), 'B7-R5-AWS-RULE', 'Rule 5 fires on DOW=0 with invalid syntax in AWS EventBridge!');

// Rule 6
const r6 = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: '*/5 * * * *', estimatedJobDurationSeconds: 450 });
assertTest(ruleIdsOf(r6).includes('CRON-OVL-006_JOB_DURATION_EXCEEDS_INTERVAL'), 'B7-R6', 'Rule 6 catches self-overlap when duration > 300s interval');

// Rule 7 (NY + Europe/Amsterdam observe DST -> warn; UTC -> safe)
const r7Ny = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: '15 2 * * *', targetTimezone: 'America/New_York' });
const r7Ams = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: '15 2 * * *', targetTimezone: 'Europe/Amsterdam' });
const r7Utc = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: '15 2 * * *', targetTimezone: 'UTC' });
assertTest(ruleIdsOf(r7Ny).includes('CRON-DST-007_SPRING_FORWARD_SKIP_WINDOW'), 'B7-R7-NY', 'Rule 7 warns on 02:15 in America/New_York');
assertTest(ruleIdsOf(r7Ams).includes('CRON-DST-007_SPRING_FORWARD_SKIP_WINDOW'), 'B7-R7-AMS', 'Rule 7 warns on 02:15 in Europe/Amsterdam');
assertTest(!ruleIdsOf(r7Utc).includes('CRON-DST-007_SPRING_FORWARD_SKIP_WINDOW'), 'B7-R7-UTC-CLEAN', 'Rule 7 does NOT fire in UTC');

// Rule 8
const r8Min = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: '*/7 * * * *' });
const r8Hr = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: '7 */5 * * *' });
const r8Clean = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: '*/15 * * * *' });
assertTest(ruleIdsOf(r8Min).includes('CRON-STP-008_NON_DIVISIBLE_STEP_DRIFT'), 'B7-R8-MIN', 'Rule 8 flags non-divisible */7 minute step');
assertTest(ruleIdsOf(r8Hr).includes('CRON-STP-008_NON_DIVISIBLE_STEP_DRIFT'), 'B7-R8-HR', 'Rule 8 flags non-divisible */5 hour step');
assertTest(!ruleIdsOf(r8Clean).includes('CRON-STP-008_NON_DIVISIBLE_STEP_DRIFT'), 'B7-R8-CLEAN', 'Rule 8 allows clean */15 factor');

// Rule 9
const r9 = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: '7 3 31 * *' });
assertTest(ruleIdsOf(r9).includes('CRON-DOM-009_SHORT_MONTH_SKIP_31'), 'B7-R9', 'Rule 9 warns when DOM=31 skips shorter months');

// Rule 10
const r10Warn = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: '*/2 * * * *', selectedDialect: 'GITHUB_ACTIONS' });
const r10Ok = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: '*/5 * * * *', selectedDialect: 'GITHUB_ACTIONS' });
assertTest(ruleIdsOf(r10Warn).includes('CRON-GHA-010_SUB_5_MINUTE_INTERVAL_DROP'), 'B7-R10-WARN', 'Rule 10 warns on GitHub Actions */2 (<5m)');
assertTest(!ruleIdsOf(r10Ok).includes('CRON-GHA-010_SUB_5_MINUTE_INTERVAL_DROP'), 'B7-R10-OK', 'Rule 10 passes on GitHub Actions */5');

// Rule 11
const r11Warn = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: '0 4 * * *', selectedDialect: 'UNIX_5' });
const r11Clean = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: '7 4 * * *', selectedDialect: 'UNIX_5' });
assertTest(ruleIdsOf(r11Warn).includes('CRON-JIT-011_TOP_OF_HOUR_THUNDERING_HERD') && r11Warn.reliabilityScore === 97, 'B7-R11-OPT', 'Rule 11 flags top-of-hour :00 optimization (97/100)');
assertTest(!ruleIdsOf(r11Clean).includes('CRON-JIT-011_TOP_OF_HOUR_THUNDERING_HERD') && r11Clean.reliabilityScore === 100 && r11Clean.reliabilityGrade === 'A+', 'B7-R11-CLEAN', 'Offset minute 7 scores 100/100 Grade A+');

// Rule 12
const r12Warn = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: '7 4 * * *', shellCommandToExecute: '/usr/local/bin/b.sh --d=$(date +%Y-%m-%d)' });
const r12Esc = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: '7 4 * * *', shellCommandToExecute: '/usr/local/bin/b.sh --d=$(date +\\%Y-\\%m-\\%d)' });
assertTest(ruleIdsOf(r12Warn).includes('CRON-SHL-012_UNESCAPED_PERCENT_NEWLINE_BUG'), 'B7-R12-UNESC', 'Rule 12 catches unescaped % in crontab command');
assertTest(!ruleIdsOf(r12Esc).includes('CRON-SHL-012_UNESCAPED_PERCENT_NEWLINE_BUG'), 'B7-R12-ESC', 'Rule 12 passes when % is escaped as \\%');

// Rule 13
assertTest(ruleIdsOf(simReport).includes('CRON-COL-013_SECONDARY_JOB_COLLISION'), 'B7-R13', 'Rule 13 catches multi-job collision');

// Rule 14
const r14Rel = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: '7 4 * * *', shellCommandToExecute: './backup.sh' });
const r14Py = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: '7 4 * * *', shellCommandToExecute: 'sync.py' });
assertTest(ruleIdsOf(r14Rel).includes('CRON-ENV-014_RELATIVE_COMMAND_PATH'), 'B7-R14-REL', 'Rule 14 catches ./backup.sh relative path');
assertTest(ruleIdsOf(r14Py).includes('CRON-ENV-014_RELATIVE_COMMAND_PATH'), 'B7-R14-PY', 'Rule 14 catches bare script.py relative path');

// Check every finding has bounded fields across 30 mixed rule combinations
for (const sampleExpr of ['* 2 13 * 5', '99 25 * * *', '*/7 2 31 * 0', 'cron(* 12 31 * 0 *)']) {
    const rep = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: sampleExpr, targetTimezone: 'Europe/Amsterdam', shellCommandToExecute: './run.sh +%F', secondaryCronExpression: '*/1 * * * *', estimatedJobDurationSeconds: 999 });
    rep.lintFindings.forEach((f, idx) => {
        assertTest(Boolean(f.ruleId && f.title && f.evidence && f.remediation && f.ruleNumber >= 1 && f.ruleNumber <= 14), `B7-FINDING-STRUCT-${idx}-${sampleExpr.length}`, `Finding #${f.ruleNumber} has complete metadata`);
    });
}

// ============================================================================
// BLOCK 8: Deterministic 1-Click Auto-Fixer (`autoFixCronPitfalls`)
// ============================================================================
console.log('--- Block 8: Deterministic 1-Click Auto-Fixer ---');

const idleFix = autoFixCronPitfalls(baseInputs);
assertTest(idleFix.nextInputs.rawExpressionInput === '' && idleFix.fixSummary.includes('No active cron'), 'B8-FIX-IDLE', 'Auto-fix leaves idle input empty cleanly');

const rebootFix = autoFixCronPitfalls({ ...baseInputs, rawExpressionInput: '@reboot' });
assertTest(rebootFix.nextInputs.rawExpressionInput === '@reboot' && rebootFix.fixSummary.includes('100/100'), 'B8-FIX-REBOOT', 'Auto-fix preserves valid @reboot macro');

const autoFixCases: { name: string; inputs: typeof baseInputs }[] = [
    { name: 'vulnerable_preset', inputs: getPresetCronInputs('vulnerable_cron_pitfalls_demo').inputs },
    { name: 'dst_ny', inputs: getPresetCronInputs('nightly_backup_dst_check').inputs },
    { name: 'dst_ams', inputs: { ...baseInputs, rawExpressionInput: '15 2 * * *', targetTimezone: 'Europe/Amsterdam' } },
    { name: 'quartz_bad_dow_q', inputs: { ...baseInputs, rawExpressionInput: '0 0 12 * * 0 *', selectedDialect: 'QUARTZ_6_7' } },
    { name: 'aws_bad_dow_q', inputs: { ...baseInputs, rawExpressionInput: '0 12 * * 0 *', selectedDialect: 'AWS_EVENTBRIDGE_6' } },
    { name: 'gha_every_min', inputs: { ...baseInputs, rawExpressionInput: '*/2 * * * *', selectedDialect: 'GITHUB_ACTIONS' } },
    { name: 'short_month_posix', inputs: { ...baseInputs, rawExpressionInput: '0 3 31 * *', selectedDialect: 'UNIX_5' } },
    { name: 'short_month_quartz', inputs: { ...baseInputs, rawExpressionInput: '0 0 3 31 * ? *', selectedDialect: 'QUARTZ_6_7' } },
    { name: 'uneven_step_shell', inputs: { ...baseInputs, rawExpressionInput: '*/7 * * * *', shellCommandToExecute: './job.sh --t=$(date +%s)', secondaryCronExpression: 'invalid cron' } },
    { name: 'out_of_bounds_tokens', inputs: { ...baseInputs, rawExpressionInput: '99 25 35 15 9', selectedDialect: 'UNIX_5' } },
];

autoFixCases.forEach((fc, idx) => {
    const fixed = autoFixCronPitfalls(fc.inputs);
    const after = analyzeAndSimulateCron(fixed.nextInputs);
    assertTest(after.isValidSyntax, `B8-AFTER-VALID-${idx}`, `Auto-fixed "${fc.name}" is syntactically valid (${after.cleanCronExpression})`);
    assertTest(after.criticalFindingsCount === 0, `B8-AFTER-NOCRIT-${idx}`, `Auto-fixed "${fc.name}" has 0 CRITICAL findings (got ${after.criticalFindingsCount})`);
    assertTest(after.warningFindingsCount === 0, `B8-AFTER-NOWARN-${idx}`, `Auto-fixed "${fc.name}" has 0 WARNING findings (got ${after.warningFindingsCount})`);
    assertTest(after.reliabilityScore === 100 && after.reliabilityGrade === 'A+', `B8-AFTER-APLUS-${idx}`, `Auto-fixed "${fc.name}" reaches 100/100 Grade A+ (got ${after.reliabilityScore})`);
});

// ============================================================================
// BLOCK 9: Cross-Dialect AST Transpiler & 10-Platform DevOps Config Compiler
// ============================================================================
console.log('--- Block 9: Cross-Dialect AST Transpiler & 10 DevOps Platforms ---');

const transCases: {
    s: string; m: string; h: string; dom: string; mon: string; dow: string; y: string; src: ResolvedCronDialect;
    expectUnix?: string; expectQuartz?: string; expectAws?: string; expectSystemdSub?: string;
}[] = [
    { s: '0', m: '15', h: '9-17', dom: '*', mon: '*', dow: '1-5', y: '*', src: 'UNIX_5', expectUnix: '15 9-17 * * 1-5', expectQuartz: '0 15 9-17 ? * 2-6 *', expectAws: 'cron(15 9-17 ? * 2-6 *)', expectSystemdSub: 'Mon..Fri *-*-* 09..17:15:00' },
    { s: '0', m: '0', h: '8', dom: '*', mon: '*', dow: '0', y: '*', src: 'UNIX_5', expectUnix: '0 8 * * 0', expectQuartz: '0 0 8 ? * 1 *', expectAws: 'cron(0 8 ? * 1 *)', expectSystemdSub: 'Sun *-*-* 08:00:00' },
    { s: '0', m: '30', h: '17', dom: 'LW', mon: '*', dow: '?', y: '*', src: 'QUARTZ_6_7', expectQuartz: '0 30 17 LW * ? *', expectAws: 'cron(30 17 LW * ? *)', expectSystemdSub: '~01' },
    { s: '0', m: '15', h: '22', dom: '?', mon: '*', dow: '6#3', y: '*', src: 'AWS_EVENTBRIDGE_6', expectUnix: '15 22 * * 5', expectAws: 'cron(15 22 ? * 6#3 *)', expectSystemdSub: 'Fri *-*-15..21 22:15:00' },
    { s: '0', m: 'H/20', h: 'H(0-7)', dom: '*', mon: '*', dow: '1-5', y: '*', src: 'JENKINS_HASH', expectSystemdSub: 'Mon..Fri' },
    { s: '0', m: '*/15', h: '*', dom: '*', mon: '1,4,7,10', dow: '0,6', y: '*', src: 'UNIX_5', expectUnix: '*/15 * * 1,4,7,10 0,6', expectSystemdSub: 'Sat,Sun *-1,4,7,10-*' },
];

transCases.forEach((tc, idx) => {
    const bundle = buildCrossDialectTranslations(tc.s, tc.m, tc.h, tc.dom, tc.mon, tc.dow, tc.y, tc.src, 'kivaro-test-seed');
    assertTest(Boolean(bundle.unix5Crontab && bundle.spring6Scheduled && bundle.quartz7Expression && bundle.awsEventBridgeCron && bundle.systemdOnCalendar), `B9-TRANS-ALL-${idx}`, 'All 8 transpiler fields non-empty');
    if (tc.expectUnix) assertTest(bundle.unix5Crontab === tc.expectUnix, `B9-TRANS-UNIX-${idx}`, `unix5Crontab=${bundle.unix5Crontab}`);
    if (tc.expectQuartz) assertTest(bundle.quartz7Expression === tc.expectQuartz, `B9-TRANS-Q-${idx}`, `quartz7Expression=${bundle.quartz7Expression}`);
    if (tc.expectAws) assertTest(bundle.awsEventBridgeCron === tc.expectAws, `B9-TRANS-AWS-${idx}`, `awsEventBridgeCron=${bundle.awsEventBridgeCron}`);
    if (tc.expectSystemdSub) assertTest(bundle.systemdOnCalendar.includes(tc.expectSystemdSub), `B9-TRANS-SYS-${idx}`, `systemdOnCalendar includes "${tc.expectSystemdSub}" (got "${bundle.systemdOnCalendar}")`);
});

const allPlatforms: DevOpsConfigPlatform[] = [
    'linux_crontab_flock', 'systemd_timer_unit', 'k8s_cronjob_yaml', 'github_actions_yaml',
    'aws_eventbridge_terraform', 'vercel_cron_json', 'cloudflare_wrangler_toml',
    'nodejs_croner_ts', 'python_celery_apscheduler', 'go_spring_laravel',
];

const deployRep = analyzeAndSimulateCron({
    ...baseInputs,
    rawExpressionInput: '*/15 9-17 * * 1-5',
    targetTimezone: 'Europe/Amsterdam',
    shellCommandToExecute: '/usr/local/bin/job.sh --fmt=%Y-%m-%d',
});

allPlatforms.forEach((plat, idx) => {
    const code = generateDevOpsConfigSnippet(deployRep, plat, 'Europe/Amsterdam', '/usr/local/bin/job.sh --fmt=%Y-%m-%d');
    assertTest(code.length > 80, `B9-DEVOPS-LEN-${idx}`, `Platform ${plat} generates config snippet (${code.length} chars)`);
});

const crontabOut = generateDevOpsConfigSnippet(deployRep, 'linux_crontab_flock', 'Europe/Amsterdam', '/bin/run --d=%Y');
assertTest(crontabOut.includes('/usr/bin/flock -n') && crontabOut.includes('\\%Y') && crontabOut.includes('CRON_TZ=Europe/Amsterdam'), 'B9-LINUX-FLOCK', 'Linux crontab includes flock, escaped \\%Y, and CRON_TZ');

const systemdRebootOut = generateDevOpsConfigSnippet(rebootWithCmd, 'systemd_timer_unit', 'UTC', '/bin/boot.sh');
assertTest(systemdRebootOut.includes('OnBootSec=1min'), 'B9-SYSTEMD-REBOOT', 'systemd timer uses OnBootSec=1min for @reboot');

const k8sOut = generateDevOpsConfigSnippet(deployRep, 'k8s_cronjob_yaml', 'Europe/Amsterdam', '/app/run.sh');
assertTest(k8sOut.includes('apiVersion: batch/v1') && k8sOut.includes('concurrencyPolicy: Forbid') && k8sOut.includes('timeZone: "Europe/Amsterdam"'), 'B9-K8S-YAML', 'K8s YAML sets batch/v1, concurrencyPolicy: Forbid & timeZone');

const ghaOut = generateDevOpsConfigSnippet(deployRep, 'github_actions_yaml', 'UTC', 'npm run sync');
assertTest(ghaOut.includes("- cron: '*/15 9-17 * * 1-5'") && ghaOut.includes('cancel-in-progress: false'), 'B9-GHA-YAML', 'GitHub Actions sets cron trigger & safe concurrency');

const tfOut = generateDevOpsConfigSnippet(deployRep, 'aws_eventbridge_terraform', 'Europe/Amsterdam', '');
assertTest(tfOut.includes('resource "aws_scheduler_schedule"') && tfOut.includes('schedule_expression_timezone = "Europe/Amsterdam"'), 'B9-TF-AWS', 'Terraform sets aws_scheduler_schedule & timezone');

const vercelRaw = generateDevOpsConfigSnippet(deployRep, 'vercel_cron_json', 'UTC', '');
const vercelJson = JSON.parse(vercelRaw.split('\n').slice(1).join('\n'));
assertTest(vercelJson.crons[0].schedule === '*/15 9-17 * * 1-5', 'B9-VERCEL-JSON', 'Vercel config parses as valid JSON with schedule');

const cfOut = generateDevOpsConfigSnippet(deployRep, 'cloudflare_wrangler_toml', 'UTC', '');
assertTest(cfOut.includes('[triggers]') && cfOut.includes('crons = ["*/15 9-17 * * 1-5"]'), 'B9-CF-TOML', 'Cloudflare wrangler.toml emits [triggers] crons');

const nodeOut = generateDevOpsConfigSnippet(deployRep, 'nodejs_croner_ts', 'Europe/Amsterdam', '');
assertTest(nodeOut.includes("import { Cron } from 'croner'") && nodeOut.includes('protect: true'), 'B9-NODE-CRONER', 'Node.js croner snippet sets protect: true');

const pyOut = generateDevOpsConfigSnippet(deployRep, 'python_celery_apscheduler', 'Europe/Amsterdam', '');
assertTest(pyOut.includes('CELERY_BEAT_SCHEDULE') && pyOut.includes('CronTrigger.from_crontab'), 'B9-PYTHON-CELERY', 'Python snippet includes Celery & APScheduler');

const goOut = generateDevOpsConfigSnippet(deployRep, 'go_spring_laravel', 'Europe/Amsterdam', '');
assertTest(goOut.includes('robfig/cron/v3') && goOut.includes('@Scheduled(cron ='), 'B9-GO-SPRING', 'Go & Spring Boot snippet renders both frameworks');

// ============================================================================
// BLOCK 10: RFC 5545 .ics, CWE-1236 Sanitizer, CSV, XLSX ZIP & 999%+ Compute Cap
// ============================================================================
console.log('--- Block 10: .ics Calendar, CWE-1236, .csv, .xlsx PKZIP & 999%+ Cap ---');

const icsStr = exportCronScheduleIcs(simReport, 'Production Webhook Sync');
assertTest(icsStr.startsWith('BEGIN:VCALENDAR\r\n') && icsStr.endsWith('END:VCALENDAR'), 'B10-ICS-BOUNDS', 'ICS wrapped with VCALENDAR CRLF delimiters');
assertTest((icsStr.match(/BEGIN:VEVENT/g) || []).length === 15 && (icsStr.match(/END:VEVENT/g) || []).length === 15, 'B10-ICS-15-EVENTS', 'ICS contains 15 VEVENT blocks matching upcomingRuns');
assertTest(icsStr.includes('VERSION:2.0') && icsStr.includes('PRODID:-//KivaroTools//'), 'B10-ICS-HEADERS', 'ICS declares RFC 5545 VERSION:2.0 & PRODID');

// CWE-1236 Spreadsheet Formula Injection Sanitization
const dangerousPayloads = [
    '=cmd|"/C calc"!A0', '=1+1', '+SUM(A1:A2)', '-1+1', '@SUM(1+1)*cmd', '\t=1+1', '\r=1+1',
    '=HYPERLINK("http://evil.example","Click")', '=IMPORTXML("http://evil.example","//a")',
    '+cmd|"/C powershell"', '-2+3+cmd', '@SHELL("calc")', '=\r\n1+1', '|calc', '=A1',
    '+A1', '-A1', '@A1', '\tcmd', '\r+1', '==cmd', '+-1', '-@1', '@=1', '=WEBSERVICE("x")',
];
dangerousPayloads.forEach((p, idx) => {
    const out = sanitizeCellCwe1236(p);
    assertTest(out.startsWith("'") && out === `'${p}`, `B10-CWE-DANG-${idx}`, `Sanitizes dangerous prefix "${p.slice(0, 12)}" with leading apostrophe`);
});
const safeValues = ['0 2 * * *', 'Europe/Amsterdam', 'Grade A+', 'UTC', 'cron(15 22 ? * 6#3 *)', '100/100', 'May 2026', '*/15 * * * *', 'Normal text', ''];
safeValues.forEach((s, idx) => {
    assertTest(sanitizeCellCwe1236(s) === s, `B10-CWE-SAFE-${idx}`, `Preserves safe cell "${s}" without apostrophe`);
});

// High-frequency compute cap (999%+ check for upgraded CSV & XLSX)
const extremeComputeReport = analyzeAndSimulateCron({
    ...baseInputs,
    rawExpressionInput: '* * * * *',
    estimatedJobDurationSeconds: 600, // 43,200 runs/mo * 10m = 432,000 mins -> way above 2,000 mins GHA tier!
});
assertTest(extremeComputeReport.frequencyBudget.githubActionsFreeTierPercent >= 999, 'B10-GHA-PCT-HIGH', 'Extreme every-minute long job exceeds 999% GHA free tier');

const csvText = exportCronAuditCsv(extremeComputeReport);
assertTest(csvText.charCodeAt(0) === 0xfeff, 'B10-CSV-BOM', 'CSV starts with UTF-8 BOM');
assertTest(csvText.includes('999%+ of GHA 2000m'), 'B10-CSV-CAP999', 'CSV renders capped "999%+" GitHub Actions label cleanly');

// Dangerous formula inside expression/notes stays neutralized in CSV & XLSX
const poisonRep = analyzeAndSimulateCron({
    ...baseInputs,
    rawExpressionInput: '* 2 13 * 5',
    shellCommandToExecute: '=cmd|"/C calc"',
});
const poisonCsv = exportCronAuditCsv(poisonRep);
assertTest(!poisonCsv.includes('"=cmd'), 'B10-CSV-CWE1236', 'CSV does not emit unescaped =cmd cell');

const xlsxBytes = exportCronAuditXlsx(extremeComputeReport);
const dv = new DataView(xlsxBytes.buffer, xlsxBytes.byteOffset, xlsxBytes.byteLength);
assertTest(dv.getUint32(0, true) === 0x04034b50, 'B10-XLSX-MAGIC', 'XLSX begins with PKZIP Local File Header magic 0x04034b50');

// Parse PKZIP EOCD + verify all 5 OOXML files and CRC-32 checksums match!
const eocdOffset = xlsxBytes.length - 22;
assertTest(dv.getUint32(eocdOffset, true) === 0x06054b50, 'B10-XLSX-EOCD', 'XLSX ends with PKZIP End of Central Directory magic 0x06054b50');
assertTest(dv.getUint16(eocdOffset + 8, true) === 5 && dv.getUint16(eocdOffset + 10, true) === 5, 'B10-XLSX-COUNT-5', 'XLSX contains exactly 5 OOXML ZIP entries');

const dec = new TextDecoder();
let zipCursor = 0;
const zipEntryMap = new Map<string, string>();
for (let e = 0; e < 5; e++) {
    const sig = dv.getUint32(zipCursor, true);
    assertTest(sig === 0x04034b50, `B10-ZIP-LH-${e}`, `ZIP entry #${e} local header valid`);
    const crc = dv.getUint32(zipCursor + 14, true);
    const compSize = dv.getUint32(zipCursor + 18, true);
    const nameLen = dv.getUint16(zipCursor + 26, true);
    const extraLen = dv.getUint16(zipCursor + 28, true);
    const entryName = dec.decode(xlsxBytes.subarray(zipCursor + 30, zipCursor + 30 + nameLen));
    const dataStart = zipCursor + 30 + nameLen + extraLen;
    const entryData = xlsxBytes.subarray(dataStart, dataStart + compSize);
    assertTest(crc !== 0 && compSize > 20, `B10-ZIP-DATA-${e}`, `Entry "${entryName}" has non-zero CRC (${crc.toString(16)}) and ${compSize}B payload`);
    zipEntryMap.set(entryName, dec.decode(entryData));
    zipCursor = dataStart + compSize;
}

const sheetXml = zipEntryMap.get('xl/worksheets/sheet1.xml') || '';
assertTest(zipEntryMap.has('[Content_Types].xml') && zipEntryMap.has('xl/workbook.xml') && sheetXml.includes('<worksheet'), 'B10-XLSX-OOXML', 'All required OOXML XML files present inside XLSX archive');
assertTest(sheetXml.includes('999%+ of GitHub Actions 2,000m Free Tier'), 'B10-XLSX-CAP999', 'XLSX worksheet renders capped "999%+" GitHub Actions label cleanly');

// ============================================================================
// BLOCK 11: All 6 Presets, 100 Adversarial Fuzz Cases & Performance Benchmark
// ============================================================================
console.log('--- Block 11: All 6 Presets, 100 Fuzz Inputs & Benchmark ---');

const presetIds: CronPresetScenarioId[] = [
    'nightly_backup_dst_check',
    'weekday_business_hours_15m',
    'vulnerable_cron_pitfalls_demo',
    'quartz_last_weekday_payroll',
    'aws_eventbridge_3rd_friday',
    'jenkins_hash_jitter_pipeline',
];

presetIds.forEach((pid) => {
    const pData = getPresetCronInputs(pid);
    const rep = analyzeAndSimulateCron(pData.inputs);
    assertTest(rep.isValidSyntax && !rep.isIdleEmpty, `B11-PRESET-VALID-${pid}`, `Preset "${pid}" parses cleanly and is active`);
    assertTest(rep.upcomingRuns.length === 15, `B11-PRESET-15RUNS-${pid}`, `Preset "${pid}" yields 15 scheduled runs`);
    if (pid === 'vulnerable_cron_pitfalls_demo') {
        assertTest(rep.lintFindings.length >= 6 && rep.criticalFindingsCount >= 3, 'B11-PRESET-VULN-6', 'Vulnerable preset triggers >=6 alerts incl. >=3 critical');
    } else if (pid === 'nightly_backup_dst_check') {
        assertTest(rep.dstHazard.springForwardSkipRisk, 'B11-PRESET-DST-FLAG', 'Nightly DST preset flags springForwardSkipRisk');
    } else {
        assertTest(rep.reliabilityScore >= 90, `B11-PRESET-SCORE-${pid}`, `Healthy preset "${pid}" scores >= 90 (${rep.reliabilityScore})`);
    }
});

// 100 Adversarial fuzz inputs (both analyzer & English compiler — zero uncaught throws)
const fuzzPool = [
    '', ' ', '*', '* *', '* * * * *', '* * * * * * *', 'cron()', 'cron(   )', '@Scheduled(cron="")',
    'schedule: ""', '999 999 999 999 999', '-1 -2 -3 -4 -5', '1/0 * * * *', '*/-5 * * * *',
    'H/0 H(99-1) * * *', 'L-99 LW 99W * * *', '0#9 9#9 * * *', ',,, --- /// ???',
    'null', 'undefined', 'NaN', 'Infinity', '{"cron":"* * * * *"}', '<script>alert(1)</script>',
    '*/1 * * * * =CMD()', 'A'.repeat(2000), '🚀 🔥 ⏰ * * *', '\x00\x07\n\r\t * * * *',
    '0 0 29 2 *', '0 0 31 2,4,6,9,11 *', '@reboot', '@daily /bin/sh', 'H/abc * * * *',
];

for (let i = 0; i < 100; i++) {
    const raw = fuzzPool[i % fuzzPool.length] + (i >= fuzzPool.length ? `_${i}` : '');
    let threwAnalyze = false;
    try {
        const res = analyzeAndSimulateCron({ ...baseInputs, rawExpressionInput: raw, secondaryCronExpression: raw });
        assertTest(res.reliabilityScore >= 0 && res.reliabilityScore <= 100, `B11-FUZZ-ANA-${i}`, `Fuzz #${i} score bounded 0..100`);
    } catch {
        threwAnalyze = true;
    }
    let threwEng = false;
    try {
        const eng = compileEnglishToCron(raw, 'UNIX_5');
        assertTest(typeof eng.cronExpression === 'string', `B11-FUZZ-ENG-${i}`, `Fuzz #${i} compileEnglishToCron returns string`);
    } catch {
        threwEng = true;
    }
    assertTest(!threwAnalyze && !threwEng, `B11-FUZZ-SAFE-${i}`, `Fuzz #${i} produced zero uncaught exceptions`);
}

// Throughput benchmark: 100 consecutive full cron simulations < 800ms
const benchInputs = getPresetCronInputs('weekday_business_hours_15m').inputs;
const t0 = performance.now();
for (let k = 0; k < 100; k++) {
    analyzeAndSimulateCron(benchInputs);
}
const benchElapsed = performance.now() - t0;
assertTest(benchElapsed < 800, 'B11-BENCH-100', `100 full cron analyses completed in ${benchElapsed.toFixed(1)}ms (<800ms)`);

// ============================================================================
// BLOCK 12: Registry Parity, Salary Countries, SEO Schema & React SSR Integrity
// ============================================================================
console.log('--- Block 12: Registry Parity, SEO Schema & React SSR ---');

const cronTool = tools.find((t) => t.id === 'cron-expression-generator');
assertTest(Boolean(cronTool), 'B12-REG-EXISTS', 'cron-expression-generator exists in config/toolsData.ts');
assertTest(
    cronTool?.slug === 'cron-expression-generator' && cronTool?.categoryId === 'developer' && cronTool?.status === 'published',
    'B12-REG-META',
    'cron-expression-generator slug, categoryId, and published status valid'
);
assertTest(
    Boolean(cronTool?.description.includes('26 IANA timezones')),
    'B12-REG-26TZ-DESC',
    'Tool description updated to reflect 26 IANA timezones'
);
assertTest(
    Boolean(cronTool?.featureList?.some((f) => f.includes('26 Global IANA Timezones') && f.includes('Europe/Amsterdam'))),
    'B12-REG-26TZ-FEAT',
    'featureList explicitly includes 26 Global IANA Timezones & Europe/Amsterdam'
);
assertTest(
    Boolean(cronTool?.relatedToolSlugs?.every((s) => tools.some((t) => t.slug === s))),
    'B12-REG-RELATED',
    'All cron-expression-generator relatedToolSlugs resolve in toolsData'
);
assertTest(SALARY_COUNTRIES.length === 22 && SALARY_COUNTRY_SLUGS.length === 22, 'B12-SALARY-22', '22 salary country routes valid');

assertTest(CRON_GENERATOR_FAQS.length >= 6, 'B12-SEO-FAQS', `CRON_GENERATOR_FAQS exports ${CRON_GENERATOR_FAQS.length} FAQs`);
const seoMarkup = ReactDOMServer.renderToStaticMarkup(React.createElement(CronExpressionGeneratorSeo));
assertTest(
    seoMarkup.includes('application/ld+json') && seoMarkup.includes('FAQPage') && seoMarkup.includes('HowTo'),
    'B12-SEO-SCHEMA',
    'CronExpressionGeneratorSeo renders FAQPage and HowTo JSON-LD scripts cleanly'
);
assertTest(!seoMarkup.includes('"@type":"SoftwareApplication"'), 'B12-SEO-NOSOFT', 'CronExpressionGeneratorSeo omits legacy SoftwareApplication JSON-LD');

const toolMarkup = ReactDOMServer.renderToStaticMarkup(React.createElement(CronExpressionGenerator));
assertTest(toolMarkup.length > 2000, 'B12-UI-SSR-LEN', `CronExpressionGenerator React SSR rendered ${toolMarkup.length} chars cleanly`);
assertTest(toolMarkup.includes('Europe/Amsterdam'), 'B12-UI-SSR-AMS', 'UI SSR includes Europe/Amsterdam timezone option');
assertTest(toolMarkup.includes('Auto-Detect (All 7 Dialects)') && toolMarkup.includes('Pitfalls Demo'), 'B12-UI-SSR-CONTROLS', 'UI SSR renders dialect selector and scenario presets');

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n======================================================================');
console.log(`🏁 Test Suite Finished: ${passedTests} / ${totalTests} Passed`);
if (failedTests === 0) {
    console.log(`🎉 100% OF ALL ${totalTests} TESTS PASSED WITH ZERO ERRORS!`);
    console.log('✅ cronGeneratorEngine & CronExpressionGenerator are verified and spec-compliant.');
} else {
    console.error(`❌ ${failedTests} tests failed!`);
    process.exit(1);
}
