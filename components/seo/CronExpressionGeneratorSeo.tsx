import React from 'react';
import Link from 'next/link';

export const CRON_GENERATOR_FAQS: { question: string; answer: string }[] = [
    {
        question:
            'What is the difference between 5-field POSIX cron, 6-field Spring / AWS EventBridge, and 7-field Java Quartz cron?',
        answer:
            'Standard 5-field POSIX/Linux crontab, Kubernetes CronJob, and GitHub Actions use five fields: Minute (0–59), Hour (0–23), Day of Month (1–31), Month (1–12), and Day of Week (0–6 or 7 for Sunday). Spring @Scheduled uses 6 fields by prepending Seconds (0–59) at the beginning. AWS EventBridge uses 6 fields by appending Year (1970–2199) at the end (Minute Hour DOM Month DOW Year). Java Quartz uses 6 or 7 fields (Second Minute Hour DOM Month DOW [Year]). Quartz and AWS EventBridge also index Day-of-Week as 1–7 (1 = Sunday, 7 = Saturday) and require "?" in either Day-of-Month or Day-of-Week.',
    },
    {
        question:
            'Why does "0 0 13 * 5" run every Friday AND on the 13th of every month instead of only Friday the 13th?',
        answer:
            'In standard POSIX/Vixie cron, Kubernetes batch/v1 CronJobs, and GitHub Actions, when both Day-of-Month (field 3) and Day-of-Week (field 5) are restricted (neither is "*"), the scheduler evaluates them using a Boolean OR union rather than an AND intersection. As a result, "0 0 13 * 5" fires at midnight on the 13th of every month AND at midnight on every Friday. The 14-Rule Reliability Linter flags this trap (CRON-OR-003) and lets you remediate it or switch to Spring @Scheduled (Boolean AND) or Quartz/EventBridge "#" modifiers.',
    },
    {
        question:
            'Why does my AWS EventBridge cron expression fail without a question mark (?) — and why do Linux generators fail for AWS?',
        answer:
            'AWS EventBridge requires 6 fields ending in Year (Minute, Hour, Day-of-Month, Month, Day-of-Week, Year), numbers Sunday as 1 (1–7) instead of 0 (0–6), and forbids setting both Day-of-Month and Day-of-Week to active values or "*" simultaneously. You must place "?" in either Day-of-Month or Day-of-Week. Note that this generator supports AWS cron(...) expressions and does not support AWS rate(...) expressions.',
    },
    {
        question:
            'How do I write a cron expression for the last working day (weekday) or Nth weekday of the month in Quartz or AWS EventBridge?',
        answer:
            'Standard 5-field Linux crontab cannot express "last weekday" or "3rd Friday" natively without a shell guard. In Java Quartz or AWS EventBridge, use "LW" in Day-of-Month with "?" in Day-of-Week — for example, "0 30 17 LW * ? *" (7-field Quartz) or "cron(30 17 LW * ? *)" (AWS EventBridge) for 17:30 on the last weekday. For the 3rd Friday, use "#" in Day-of-Week with "?" in Day-of-Month: "cron(15 22 ? * 6#3 *)" or "FRI#3" (since 6 = Friday in 1–7 indexing).',
    },
    {
        question:
            'How do Daylight Saving Time (DST) transitions affect a 2:00 AM cron job (including Europe/Berlin and America/New_York)?',
        answer:
            'In DST-observing timezones such as America/New_York, Europe/London, Europe/Berlin, and Europe/Amsterdam, clocks jump forward from 02:00 to 03:00 on the Spring-Forward Sunday and repeat the 01:00–01:59 (or 02:00–02:59) hour on the Fall-Back Sunday. A schedule like "15 2 * * *" in a local DST zone can be skipped in spring and executed twice in autumn. Pinning critical schedules (and Kubernetes spec.timeZone) to UTC or avoiding 01:00–03:00 with concurrencyPolicy: Forbid prevents transition bugs.',
    },
    {
        question:
            'Why did my Quartz or AWS EventBridge expression shift weekdays by one day when copied from Linux — and is Sunday 0, 1, or 7?',
        answer:
            'POSIX/Linux, Kubernetes, GitHub Actions, and Spring number Sunday as 0 or 7 (Monday–Friday = 1-5), whereas Java Quartz and AWS EventBridge number Sunday as 1 (Monday–Friday = 2-6). Pasting "1-5" directly into Quartz or EventBridge runs the job Sunday through Thursday. Use symbolic names (MON-FRI) or the Cross-Dialect AST Transpiler in Tab 3 to shift numeric indices automatically.',
    },
    {
        question: 'What is the accidental minute flood bug ("* 2 * * *") in cron?',
        answer:
            'Writing "* 2 * * *" intending to run a script once a day at 02:00 AM leaves the first field (Minute) as "*" (every minute). That executes 60 times every night — at 02:00, 02:01, 02:02 through 02:59. To run once at 02:00 AM, set the Minute field to "0" ("0 2 * * *") or a staggered minute like "7" ("7 2 * * *"). Rule CRON-MIN-002 flags this immediately.',
    },
    {
        question: 'How does the Jenkins "H" hash-jitter symbol work — and why does "?" fail in Jenkins?',
        answer:
            'Jenkins uses 5-field POSIX syntax extended with "H" (Hash) to compute a deterministic offset from the job name (modeled here with CRC-32). Using "H * * * *" or "H/20 H(0-7) * * 1-5" spreads CI builds evenly across the hour instead of piling up at :00. Jenkins does not support Quartz modifiers like "?" or "#".',
    },
    {
        question: 'How do I convert a cron expression from one timezone to another?',
        answer:
            'Cron strings themselves carry no timezone metadata; the scheduler interprets them in its configured timezone. Select your scheduler\'s IANA timezone from the 26 supported zones (including UTC, America/New_York, Europe/London, Europe/Berlin, Europe/Amsterdam, Asia/Kolkata, and Asia/Tokyo) to preview the next 15 executions in both local time and UTC alongside the 6-region world clock matrix.',
    },
    {
        question: 'How do I convert an existing Linux crontab job into a systemd timer (OnCalendar=)?',
        answer:
            'Map the 5 cron fields into systemd\'s "OnCalendar=DayOfWeek Year-Month-Day Hour:Minute:Second" syntax inside a ".timer" unit paired with a ".service" unit — for example, "*/15 9-17 * * 1-5" becomes "OnCalendar=Mon..Fri *-*-* 09..17:00/15:00" and "cron(15 22 ? * 6#3 *)" becomes "OnCalendar=Fri *-*-15..21 22:15:00". Add "Persistent=true" to catch up missed runs after a reboot. Both the quick transpiler strip and Tab 3/Tab 4 generate complete ".timer" and ".service" units.',
    },
    {
        question: 'Why does a GitHub Actions scheduled cron workflow run late or skip sub-5-minute intervals?',
        answer:
            'GitHub Actions evaluates "on.schedule" cron expressions strictly in UTC on a best-effort queue, enforces a 5-minute minimum interval ("*/5 * * * *"), and experiences queuing delays during top-of-hour (:00) peaks. Staggering the minute field (e.g., "17 * * * *") reduces queue contention, and rule CRON-GHA-010 flags sub-5-minute schedules automatically.',
    },
    {
        question: 'Why does my Linux crontab command fail when I use "date +%Y-%m-%d" inside the command?',
        answer:
            'Under the POSIX crontab(5) specification, an unescaped percent sign ("%") in a crontab command is converted into a newline by the cron daemon, and all text after the first "%" is passed to the command as standard input (stdin). Escape every "%" as "\\%" ("date +\\%Y-\\%m-\\%d") or move the command into an external shell script. Rule CRON-SHL-012 detects and escapes unescaped "%" characters in 1 click.',
    },
    {
        question: 'How do I prevent overlapping cron executions if a job takes longer than its schedule interval?',
        answer:
            'Standard Unix cron and Kubernetes CronJob (default concurrencyPolicy: Allow) launch a new process on schedule even if the previous run is still running. Prevent overlaps by: (1) wrapping Linux crontab commands with "/usr/bin/flock -n /tmp/job.lock", (2) setting "concurrencyPolicy: Forbid" and "startingDeadlineSeconds: 300" in Kubernetes batch/v1 CronJob YAML, or (3) using a "Type=oneshot" systemd service unit.',
    },
    {
        question: 'Why do step values like "*/7" or "*/13" in the Minute field cause uneven execution gaps?',
        answer:
            'In cron, "*/N" matches every minute from 0 to 59 where minute % N == 0 — it does not roll continuously across hour boundaries. For "*/13", the job runs at :00, :13, :26, :39, and :52, then resets at :00 of the next hour (only an 8-minute gap). Only divisors of 60 (1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30) produce uniform intervals across hours.',
    },
    {
        question: 'Can I compare two cron expressions to see if their maintenance windows collide?',
        answer:
            'Yes. Open "Advanced Options" below the expression editor and paste a second expression into the "Secondary Cron (Collision)" field. The simulator evaluates both schedules simultaneously across the Monthly Calendar Heatmap and Upcoming 15 Runs table, highlighting any timestamp where both jobs overlap (Rule CRON-COL-013).',
    },
    {
        question: 'Are my cron expressions or shell commands sent to a KivaroTools server?',
        answer:
            'No. Cron AST parsing, plain-English conversion, timezone and DST simulation, 14-rule linting, DevOps config generation, and .ics/.xlsx/.csv/.json exports are executed locally in JavaScript inside your browser without sending your schedule inputs or shell commands to a KivaroTools backend.',
    },
];

export default function CronExpressionGeneratorSeo() {
    const howToSchema = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'How to Build, Validate, and Simulate a Production Cron Schedule Across Timezones',
        description:
            'Build or validate a 5-, 6-, or 7-field cron expression across POSIX, Quartz, AWS EventBridge, Spring, Kubernetes, GitHub Actions, and Jenkins, check DST skips, and export DevOps configs.',
        step: [
            {
                '@type': 'HowToStep',
                position: 1,
                name: 'Enter a Cron Expression, Type Plain English, or Pick a Preset',
                text: 'Type or paste any 5-, 6-, or 7-field cron expression (including AWS cron(...) wrappers or POSIX @macros), type a plain-English phrase such as "every 15 mins during business hours on weekdays", or load one of the 6 scenario presets.',
            },
            {
                '@type': 'HowToStep',
                position: 2,
                name: 'Click Any Field Pill to Edit & Choose Your Target IANA Timezone',
                text: 'Click any interactive field pill below the expression box to apply steps, ranges, or Quartz/AWS/Jenkins modifiers (L, LW, 15W, 6#3, ?, H/15), and select from 26 IANA timezones.',
            },
            {
                '@type': 'HowToStep',
                position: 3,
                name: 'Audit 14 Reliability Rules, DST Transitions & Job Collisions',
                text: 'Review the 14-Rule Reliability Score for minute floods, POSIX DOM+DOW Boolean OR traps, DST 02:00 skips, or secondary job collisions, and click "Auto-Fix" to remediate.',
            },
            {
                '@type': 'HowToStep',
                position: 4,
                name: 'Transpile Across Dialects or Export DevOps Configs & .ICS Calendar',
                text: 'Copy Kubernetes batch/v1 CronJob YAML, Linux systemd OnCalendar timers, AWS EventBridge Terraform HCL, or Spring @Scheduled annotations, or download RFC 5545 .ics and .xlsx/.csv audit files.',
            },
        ],
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: CRON_GENERATOR_FAQS.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: f.answer,
            },
        })),
    };

    return (
        <section
            aria-label="Cron Expression Generator and Multi-Dialect Technical Documentation"
            className="mt-12 space-y-10 text-slate-700 dark:text-slate-300 w-full min-w-0 max-w-full overflow-x-hidden"
        >
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            {/* ========================================================================
          SECTION 1: 5-FIELD VS 6-FIELD & 7-FIELD CRON SYNTAX OVERVIEW
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    <span>Multi-Dialect Scheduling &amp; Validation Guide</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    5-Field vs. 6-Field &amp; 7-Field Cron Syntax: Build, Validate &amp; Test
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    This <strong>cron expression generator</strong>, validator, and plain-English{' '}
                    <strong>cron expression explainer</strong> unifies all seven production scheduling dialects in one
                    browser workspace: <strong>5-field POSIX/Linux crontab</strong>,{' '}
                    <strong>Kubernetes <code>batch/v1</code> CronJob</strong>,{' '}
                    <strong>GitHub Actions (UTC)</strong>, <strong>6-field Spring Boot <code>@Scheduled</code></strong>{' '}
                    (seconds-first), <strong>6-field AWS EventBridge</strong> (year-last),{' '}
                    <strong>6/7-field Java Quartz</strong> (<code>L</code>, <code>W</code>, <code>LW</code>,{' '}
                    <code>#</code>, <code>?</code>), and <strong>Jenkins <code>H</code> hash-jitter</strong>.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    The most common cause of broken cloud schedules is assuming every{' '}
                    <strong>6-field cron expression</strong> has the same column layout. Spring Boot and 6-field Quartz
                    prepend <strong>Seconds</strong> as field #1 (<code>0 */5 * * * *</code>), whereas AWS EventBridge
                    omits seconds and appends <strong>Year</strong> as field #6 (<code>cron(*/5 * * * ? *)</code>). The
                    workbench auto-detects both layouts, decodes every token into plain English, previews the next 15
                    runs across 26 Global IANA timezones, and exports ready-to-deploy infrastructure configs.
                </p>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200">
                                <th className="py-3 px-4">Dialect</th>
                                <th className="py-3 px-4">Fields &amp; Column Order</th>
                                <th className="py-3 px-4">Day-of-Week Index</th>
                                <th className="py-3 px-4">DOM + DOW Rule &amp; Example</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <td className="py-2.5 px-4 font-semibold">
                                    POSIX / Linux, Kubernetes, GitHub Actions
                                </td>
                                <td className="py-2.5 px-4 font-mono">5: Min Hr DOM Mon DOW</td>
                                <td className="py-2.5 px-4">0–6 (0 or 7 = Sun)</td>
                                <td className="py-2.5 px-4">
                                    Boolean OR union • <code>*/15 9-17 * * 1-5</code>
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-semibold">Spring Boot @Scheduled</td>
                                <td className="py-2.5 px-4 font-mono">6: Sec Min Hr DOM Mon DOW</td>
                                <td className="py-2.5 px-4">0–6 (0 or 7 = Sun)</td>
                                <td className="py-2.5 px-4">
                                    Boolean AND • <code>0 0 9 * * MON-FRI</code>
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-semibold">AWS EventBridge</td>
                                <td className="py-2.5 px-4 font-mono">6: Min Hr DOM Mon DOW Year</td>
                                <td className="py-2.5 px-4">1–7 (1 = Sun, 6 = Fri)</td>
                                <td className="py-2.5 px-4">
                                    Requires <code>?</code> • <code>cron(15 22 ? * 6#3 *)</code>
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-semibold">Java Quartz</td>
                                <td className="py-2.5 px-4 font-mono">6/7: Sec Min Hr DOM Mon DOW [Year]</td>
                                <td className="py-2.5 px-4">1–7 (1 = Sun, 7 = Sat)</td>
                                <td className="py-2.5 px-4">
                                    Requires <code>?</code> + <code>L/W/LW/#</code> • <code>0 30 17 LW * ? *</code>
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-semibold">Jenkins Pipeline</td>
                                <td className="py-2.5 px-4 font-mono">5: Min Hr DOM Mon DOW (with H)</td>
                                <td className="py-2.5 px-4">0–6 (0 or 7 = Sun)</td>
                                <td className="py-2.5 px-4">
                                    Hash-jitter <code>H</code> • <code>H/20 H(0-7) * * 1-5</code>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========================================================================
          SECTION 2: OBJECTIVE COMPETITOR COMPARISON TABLE (VERIFIED CAPABILITIES)
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    How KivaroTools Compares to Top Online Cron Generators (Crontab.guru, Cronhub, UptimeRobot &amp;
                    CronWizard)
                </h2>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Popular cron editors each solve a different part of the scheduling workflow. Classic 5-field
                    editors excel at quick Linux crontab lookups, while modern engineering teams frequently need
                    multi-dialect validation, DST auditing, and infrastructure exports in one place. Below is an
                    objective capability comparison based on publicly visible features:
                </p>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200">
                                <th className="py-3 px-3.5">Capability</th>
                                <th className="py-3 px-3.5 text-indigo-700 dark:text-indigo-300 bg-indigo-50/60 dark:bg-indigo-950/40">
                                    KivaroTools
                                </th>
                                <th className="py-3 px-3.5">Crontab.guru</th>
                                <th className="py-3 px-3.5">Cronhub</th>
                                <th className="py-3 px-3.5">UptimeRobot</th>
                                <th className="py-3 px-3.5">CronWizard</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <td className="py-2.5 px-3.5 font-semibold">Supported Cron Dialects</td>
                                <td className="py-2.5 px-3.5 font-bold text-emerald-700 dark:text-emerald-400 bg-indigo-50/30 dark:bg-indigo-950/20">
                                    7 (POSIX, K8s, GHA, Spring 6F, Quartz 6/7F, AWS 6F, Jenkins H)
                                </td>
                                <td className="py-2.5 px-3.5">5-field POSIX only</td>
                                <td className="py-2.5 px-3.5">5-field POSIX only</td>
                                <td className="py-2.5 px-3.5">5-field POSIX &amp; 6-part Quartz</td>
                                <td className="py-2.5 px-3.5">5-field Unix &amp; 6/7-field Quartz</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-3.5 font-semibold">Plain-English Input &amp; Explainer</td>
                                <td className="py-2.5 px-3.5 font-bold text-emerald-700 dark:text-emerald-400 bg-indigo-50/30 dark:bg-indigo-950/20">
                                    Both (explainer + English-to-Cron)
                                </td>
                                <td className="py-2.5 px-3.5">Explainer only</td>
                                <td className="py-2.5 px-3.5">Explainer only</td>
                                <td className="py-2.5 px-3.5">Explainer + visual builder</td>
                                <td className="py-2.5 px-3.5">Explainer + visual wizard</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-3.5 font-semibold">Next-Run Preview &amp; Timezones</td>
                                <td className="py-2.5 px-3.5 font-bold text-emerald-700 dark:text-emerald-400 bg-indigo-50/30 dark:bg-indigo-950/20">
                                    15 runs, 26 IANA zones, 6-region clock &amp; monthly heatmap
                                </td>
                                <td className="py-2.5 px-3.5">Next run only; no TZ picker</td>
                                <td className="py-2.5 px-3.5">Basic preview; no TZ picker</td>
                                <td className="py-2.5 px-3.5">5 runs (UTC only)</td>
                                <td className="py-2.5 px-3.5">IANA timezone-aware preview</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-3.5 font-semibold">DST 02:00 Skip &amp; Double-Run Check</td>
                                <td className="py-2.5 px-3.5 font-bold text-emerald-700 dark:text-emerald-400 bg-indigo-50/30 dark:bg-indigo-950/20">
                                    Yes (scanner + 1-click UTC fix)
                                </td>
                                <td className="py-2.5 px-3.5">No</td>
                                <td className="py-2.5 px-3.5">No</td>
                                <td className="py-2.5 px-3.5">No</td>
                                <td className="py-2.5 px-3.5">Yes (DST checker)</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-3.5 font-semibold">14-Rule Production Linter &amp; Auto-Fix</td>
                                <td className="py-2.5 px-3.5 font-bold text-emerald-700 dark:text-emerald-400 bg-indigo-50/30 dark:bg-indigo-950/20">
                                    Yes (DOM+DOW OR, * 2 flood, % escape, overlap, GHA &lt;5m)
                                </td>
                                <td className="py-2.5 px-3.5">Syntax only</td>
                                <td className="py-2.5 px-3.5">Syntax only</td>
                                <td className="py-2.5 px-3.5">Syntax only</td>
                                <td className="py-2.5 px-3.5">Syntax validation</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-3.5 font-semibold">2-Job Maintenance Collision Check</td>
                                <td className="py-2.5 px-3.5 font-bold text-emerald-700 dark:text-emerald-400 bg-indigo-50/30 dark:bg-indigo-950/20">
                                    Yes (heatmap + run overlap flags)
                                </td>
                                <td className="py-2.5 px-3.5">No</td>
                                <td className="py-2.5 px-3.5">No</td>
                                <td className="py-2.5 px-3.5">No</td>
                                <td className="py-2.5 px-3.5">No</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-3.5 font-semibold">DevOps Configs, systemd &amp; Calendar Export</td>
                                <td className="py-2.5 px-3.5 font-bold text-emerald-700 dark:text-emerald-400 bg-indigo-50/30 dark:bg-indigo-950/20">
                                    10 platforms (K8s, systemd OnCalendar=, Terraform, flock) + .ics/.xlsx/.csv
                                </td>
                                <td className="py-2.5 px-3.5">Cron string only</td>
                                <td className="py-2.5 px-3.5">Cron string only</td>
                                <td className="py-2.5 px-3.5">Cron string only</td>
                                <td className="py-2.5 px-3.5">Multi-platform configs; no .ics/.xlsx</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-3.5 font-semibold">Notable Strength / Scope Note</td>
                                <td className="py-2.5 px-3.5 bg-indigo-50/30 dark:bg-indigo-950/20">
                                    All-in-one debugger &amp; transpiler; AWS <code>rate(...)</code> not supported
                                </td>
                                <td className="py-2.5 px-3.5">Minimalist 5-field UX &amp; random examples</td>
                                <td className="py-2.5 px-3.5">Fast single-screen 5-field editor</td>
                                <td className="py-2.5 px-3.5">Random generator &amp; syntax reference</td>
                                <td className="py-2.5 px-3.5">Clean wizard; no Jenkins H or 14-rule auto-fix</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========================================================================
          SECTION 3: COMPLETE CRON OPERATORS & SPECIAL MODIFIERS REFERENCE
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Complete Cron Operators &amp; Extended Modifiers (<code>*</code>, <code>,</code>, <code>-</code>,{' '}
                    <code>/</code>, <code>?</code>, <code>L</code>, <code>W</code>, <code>LW</code>, <code>#</code>,{' '}
                    <code>H</code>)
                </h2>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Click any field pill in the editor above to insert these operators with automatic dialect detection
                    and validation:
                </p>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200">
                                <th className="py-3 px-4">Operator</th>
                                <th className="py-3 px-4">Supported Dialects</th>
                                <th className="py-3 px-4">Meaning &amp; Example</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <td className="py-2.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">*</td>
                                <td className="py-2.5 px-4">All 7 Dialects</td>
                                <td className="py-2.5 px-4">Matches every allowed value in the field (e.g., every minute 0–59).</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">, &amp; -</td>
                                <td className="py-2.5 px-4">All 7 Dialects</td>
                                <td className="py-2.5 px-4">Lists (<code>1,15</code>) and inclusive ranges (<code>9-17</code>, <code>MON-FRI</code>).</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">*/N</td>
                                <td className="py-2.5 px-4">All 7 Dialects</td>
                                <td className="py-2.5 px-4">Step increment: <code>*/15</code> runs at <code>0, 15, 30, 45</code>. Prefer divisors of 60/24 to avoid boundary drift.</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">?</td>
                                <td className="py-2.5 px-4">Quartz, AWS EventBridge</td>
                                <td className="py-2.5 px-4">No specific value — required in either Day-of-Month or Day-of-Week to prevent ambiguity.</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">L &amp; L-N</td>
                                <td className="py-2.5 px-4">Quartz, AWS EventBridge</td>
                                <td className="py-2.5 px-4">Last calendar day of the month (28/29/30/31) or <code>N</code> days prior (<code>L-2</code>); in DOW, <code>6L</code> = last Friday.</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">nW &amp; LW</td>
                                <td className="py-2.5 px-4">Quartz, AWS EventBridge</td>
                                <td className="py-2.5 px-4"><code>15W</code> = nearest weekday to the 15th within the same month; <code>LW</code> = last weekday (Mon–Fri) of the month.</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">DOW#N</td>
                                <td className="py-2.5 px-4">Quartz, AWS EventBridge</td>
                                <td className="py-2.5 px-4">Nth weekday of the month: <code>6#3</code> or <code>FRI#3</code> fires on the 3rd Friday (1 = Sun .. 6 = Fri).</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">H &amp; H(a-b)/N</td>
                                <td className="py-2.5 px-4">Jenkins Pipeline</td>
                                <td className="py-2.5 px-4">Deterministic CRC-32 hash jitter seeded by the Jenkins job name (<code>H/20 H(0-7) * * 1-5</code>) to spread build load.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========================================================================
          SECTION 4: COPY-READY PRODUCTION CRON RECIPES (QUARTZ, SPRING, AWS, K8S)
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Java Quartz, Spring Boot <code>@Scheduled</code> &amp; AWS EventBridge Production Recipes
                </h2>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Whether you need a <strong>Quartz cron expression generator</strong>, a{' '}
                    <strong>Spring cron expression generator</strong> (with 1-click <code>@Scheduled</code> copy), or an{' '}
                    <strong>AWS EventBridge cron generator</strong> with Terraform HCL export, paste any verified
                    pattern below into the editor to preview its next 15 executions:
                </p>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200">
                                <th className="py-3 px-4">Schedule Goal</th>
                                <th className="py-3 px-4">Dialect</th>
                                <th className="py-3 px-4">Verified Expression</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <td className="py-2.5 px-4 font-medium">Every 15 mins during weekday business hours</td>
                                <td className="py-2.5 px-4">POSIX / Kubernetes / GHA</td>
                                <td className="py-2.5 px-4 font-mono">*/15 9-17 * * 1-5</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-medium">Weekdays at 09:00 AM (Spring Boot)</td>
                                <td className="py-2.5 px-4">Spring 6-Field</td>
                                <td className="py-2.5 px-4 font-mono">0 0 9 * * MON-FRI</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-medium">Weekdays at 09:00 UTC (AWS EventBridge)</td>
                                <td className="py-2.5 px-4">AWS EventBridge 6-Field</td>
                                <td className="py-2.5 px-4 font-mono">cron(0 9 ? * 2-6 *)</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-medium">Last weekday (Mon–Fri) of month at 17:30</td>
                                <td className="py-2.5 px-4">Java Quartz 7-Field</td>
                                <td className="py-2.5 px-4 font-mono">0 30 17 LW * ? *</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-medium">3rd Friday of every month at 22:15 UTC</td>
                                <td className="py-2.5 px-4">AWS EventBridge 6-Field</td>
                                <td className="py-2.5 px-4 font-mono">cron(15 22 ? * 6#3 *)</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-medium">Nearest weekday to the 15th at 09:00</td>
                                <td className="py-2.5 px-4">Java Quartz 7-Field</td>
                                <td className="py-2.5 px-4 font-mono">0 0 9 15W * ? *</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-medium">Staggered CI build every 20 mins (00:00–07:59)</td>
                                <td className="py-2.5 px-4">Jenkins H Hash-Jitter</td>
                                <td className="py-2.5 px-4 font-mono">H/20 H(0-7) * * 1-5</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-medium">3rd Friday at 22:15 (Linux systemd timer)</td>
                                <td className="py-2.5 px-4">systemd OnCalendar</td>
                                <td className="py-2.5 px-4 font-mono">OnCalendar=Fri *-*-15..21 22:15:00</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                    <strong>AWS EventBridge Scope Note:</strong> The parser auto-strips <code>cron(...)</code> wrappers,
                    validates <code>?</code> mutual exclusion and <code>1–7</code> weekday numbering, and exports
                    Terraform <code>aws_scheduler_schedule</code> HCL in Tab 4. AWS <code>rate(...)</code> expressions
                    are not supported.
                </p>
            </div>

            {/* ========================================================================
          SECTION 5: CRON TIME & TIMEZONE CONVERTER (DST 02:00 SKIPS & DOUBLE RUNS)
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Cron Time &amp; Timezone Converter: Catching DST 02:00 Skips &amp; Double Runs
                </h2>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Because cron strings contain no timezone metadata, a schedule running at <code>15 2 * * *</code>{' '}
                    behaves very differently in <code>UTC</code> versus <code>America/New_York</code>,{' '}
                    <code>Europe/London</code>, <code>Europe/Berlin</code>, or <code>Europe/Amsterdam</code>. On
                    Spring-Forward Sunday, local clock times from <code>02:00–02:59</code> do not exist (jobs are
                    skipped); on Fall-Back Sunday, the repeated hour can trigger duplicate runs. Use the{' '}
                    <strong>cron time converter</strong> dropdown (26 Global IANA timezones) and the 6-region World
                    Clock Matrix in Tab 1 to verify exact local and UTC ISO-8601 timestamps before deploying.
                </p>
            </div>

            {/* ========================================================================
          SECTION 6: PLAIN-ENGLISH CRON EXPLAINER & 14 PRODUCTION PITFALLS (AUTO-FIX)
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Plain-English Cron Explainer &amp; 14 Production Pitfalls (Auto-Fix Validator)
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Every schedule entered into this <strong>cron expression validator</strong> is parsed into
                    interactive field tokens and audited against 14 production failure rules:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {[
                        ['CRON-SYN-001', 'CRITICAL', 'Invalid Field Grammar or Out-of-Range Numeric Value'],
                        ['CRON-MIN-002', 'CRITICAL', 'Accidental Every-Minute Flood ("* 2 * * *" runs 60x/hour)'],
                        ['CRON-OR-003', 'CRITICAL', 'POSIX Day-of-Month + Day-of-Week Boolean OR Union Trap'],
                        ['CRON-QAW-004', 'CRITICAL', 'Missing "?" Mutual Exclusion in Quartz or AWS EventBridge'],
                        ['CRON-DOW-005', 'CRITICAL', 'Weekday "0" Used in 1–7 Indexed Dialect (Quartz / EventBridge)'],
                        ['CRON-OVL-006', 'CRITICAL', 'Self-Overlapping Execution (Job Duration Exceeds Schedule Interval)'],
                        ['CRON-DST-007', 'WARNING', 'Daylight Saving Time 02:00–02:59 Spring-Forward Skip / Fall-Back Double Run'],
                        ['CRON-STP-008', 'WARNING', 'Non-Divisible Step Drift (*/7, */13, */23 Uneven Hour Reset)'],
                        ['CRON-DOM-009', 'WARNING', 'Day 29 / 30 / 31 Short-Month Skip (Silent Skip in Feb/Apr/Jun/Sep/Nov)'],
                        ['CRON-GHA-010', 'WARNING', 'GitHub Actions Sub-5-Minute Interval Drop (< 300s Minimum)'],
                        ['CRON-JIT-011', 'OPTIMIZATION', 'Top-of-Hour ":00" Thundering-Herd Queue Spike'],
                        ['CRON-SHL-012', 'CRITICAL', 'Unescaped "%" Character in Crontab Command (Converted to Newline/Stdin)'],
                        ['CRON-COL-013', 'WARNING', 'Multi-Job Schedule Collision with Secondary Maintenance Cron'],
                        ['CRON-ENV-014', 'WARNING', 'Relative Script Path in Crontab Command (Minimal Cron PATH Hazard)'],
                    ].map(([id, sev, desc]) => (
                        <div
                            key={id}
                            className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex items-start justify-between gap-2"
                        >
                            <div className="space-y-0.5 min-w-0">
                                <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{id}</div>
                                <div className="text-slate-700 dark:text-slate-300 font-medium break-words">{desc}</div>
                            </div>
                            <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${sev === 'CRITICAL'
                                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                        : sev === 'WARNING'
                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                    }`}
                            >
                                {sev}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ========================================================================
          SECTION 7: WORKED MULTI-DIALECT EXAMPLES (ENGINE-VERIFIED TRACES)
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-5">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    4 Worked Multi-Dialect Examples: Calendar Math, Transpilation &amp; Auto-Fix Traces
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Each trace below matches one of the built-in 1-Click Presets in the workbench above (evaluated
                    against a May 2026 calendar reference):
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 p-4 space-y-2 min-w-0">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            Example 1: Java Quartz Last-Weekday Payroll (Preset #4)
                        </h3>
                        <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed overflow-x-auto max-w-full">{`Input Expression : 0 30 17 LW * ? *
Detected Dialect : QUARTZ_6_7 (7-Field Java Quartz)
Plain English    : At 17:30, on the last weekday (Mon–Fri) of the month (LW).

May 2026 Calendar Evaluation:
- May 31, 2026 (Sun) & May 30 (Sat) shifted back to Friday
- Resolved LW Run : Fri, 2026-05-29 17:30:00 (UTC)
- systemd Timer   : OnCalendar=*-*-~01 17:30:00`}</pre>
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 p-4 space-y-2 min-w-0">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Example 2: POSIX to AWS EventBridge Weekday Shift (Preset #1)
                        </h3>
                        <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed overflow-x-auto max-w-full">{`Source POSIX (5-Field)     : */15 9-17 * * 1-5
1. Mutual Exclusion (?)    : DOM "*" -> "?" (DOW is restricted)
2. Weekday Shift (0-6->1-7): POSIX "1-5" (Mon-Fri) -> "2-6"
3. Append Year Field       : "*"
Target AWS EventBridge     : cron(*/15 9-17 ? * 2-6 *)
Spring @Scheduled (6-Field): 0 */15 9-17 * * 1-5`}</pre>
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 p-4 space-y-2 min-w-0">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                            Example 3: AWS EventBridge 3rd Friday to systemd Timer (Preset #5)
                        </h3>
                        <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed overflow-x-auto max-w-full">{`Input Expression : cron(15 22 ? * 6#3 *)
Stripped Clean   : 15 22 ? * 6#3 * (AWS_EVENTBRIDGE_6)
Plain English    : At 22:15, on the 3rd Friday of the month.

Calendar & Transpilation:
- DOW "6#3"      : 6 = Friday (1=Sun..7=Sat), #3 = 3rd occurrence
- May 2026 Match : Fri, 2026-05-15 22:15:00 (UTC)
- systemd Timer  : OnCalendar=Fri *-*-15..21 22:15:00`}</pre>
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 p-4 space-y-2 min-w-0">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                            Example 4: 1-Click Auto-Fix on Vulnerable Cron (Preset #2)
                        </h3>
                        <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed overflow-x-auto max-w-full">{`Vulnerable Input : * 2 13 * 5 (TZ: America/New_York, Duration: 120s)
Command Input    : /usr/local/bin/archive.sh --date=$(date +%Y-%m-%d)
Initial Score    : 0 / 100 (Grade F — 4 Critical, 2 Warnings)

1-Click Auto-Fix Result (Score: 100/100 Grade A+):
- Remediated Expr: 7 2 * * 5 (stops 60x flood & DOM+DOW OR trap)
- Timezone       : UTC (eliminates 02:00 DST skip/double-run)
- Escaped Command: /usr/local/bin/archive.sh --date=$(date +\\%Y-\\%m-\\%d)`}</pre>
                    </div>
                </div>
            </div>

            {/* ========================================================================
          SECTION 8: CONVERT CRONTAB TO SYSTEMD TIMERS, K8S YAML, GHA & JENKINS
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Convert Linux Crontab to <code>systemd</code> Timers, Kubernetes YAML, GitHub Actions &amp; Jenkins
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Use the built-in <strong>cron to systemd timer converter</strong> (quick strip above and Tab 3) and{' '}
                    <strong>Kubernetes CronJob generator</strong> (Tab 4) to modernize legacy Vixie crontab jobs and
                    harden CI/CD pipelines:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <li>
                        <strong>Linux <code>systemd OnCalendar=</code> &amp; <code>Persistent=true</code>:</strong>{' '}
                        Converts 5-, 6-, and 7-field schedules into <code>.timer</code> + <code>.service</code> unit
                        files with <code>Persistent=true</code> so missed runs execute upon boot, plus{' '}
                        <code>RandomizedDelaySec</code> to smooth CPU/disk spikes. Validate on your host with{' '}
                        <code>systemd-analyze calendar</code>.
                    </li>
                    <li>
                        <strong>Kubernetes <code>batch/v1</code> CronJob Manifests:</strong> Exports full YAML with{' '}
                        <code>spec.timeZone</code> (stable in Kubernetes 1.27+),{' '}
                        <code>concurrencyPolicy: Forbid</code>, and <code>startingDeadlineSeconds: 300</code>.
                    </li>
                    <li>
                        <strong>GitHub Actions (UTC) &amp; Jenkins <code>H</code> Hash-Jitter:</strong> Flags
                        sub-5-minute GitHub Actions throttling (<code>CRON-GHA-010</code>), estimates monthly compute
                        minutes against the 2,000-minute free tier, and models Jenkins CRC-32 <code>H</code> jitter (
                        <code>H/20 H(0-7) * * 1-5</code>, Preset #6) to prevent top-of-hour runner queues.
                    </li>
                    <li>
                        <strong>Two-Job Collision Heatmap &amp; Exports:</strong> Compare a secondary maintenance cron
                        expression across the monthly calendar grid, or export RFC 5545 <code>.ics</code> calendars and
                        CWE-1236 sanitized <code>.xlsx</code>/<code>.csv</code> audit reports from Tab 5.
                    </li>
                </ul>
            </div>

            {/* ========================================================================
          SECTION 9: FREQUENTLY ASKED QUESTIONS (16 VERIFIED DEVELOPER FAQS)
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Frequently Asked Questions: Multi-Dialect Cron, DST &amp; Troubleshooting
                </h2>
                <div className="space-y-2.5">
                    {CRON_GENERATOR_FAQS.map((faq, idx) => (
                        <details
                            key={idx}
                            className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 text-xs sm:text-sm"
                        >
                            <summary className="font-bold text-slate-900 dark:text-white cursor-pointer flex items-center justify-between gap-3">
                                <span>
                                    {idx + 1}. {faq.question}
                                </span>
                                <span className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold shrink-0 group-open:rotate-180 transition">
                                    ▼
                                </span>
                            </summary>
                            <p className="mt-2.5 pt-2.5 border-t border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 leading-relaxed">
                                {faq.answer}
                            </p>
                        </details>
                    ))}
                </div>
            </div>

            {/* ========================================================================
          RELATED DEVELOPER UTILITIES CROSS-LINK GRID (VERIFIED /developer LINKS ONLY)
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Explore Related Developer Utilities on KivaroTools
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    <Link
                        href="/developer/regex-tester"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            Regex Tester &amp; Debugger →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Test regular expressions with live match highlighting, capture group inspection, and syntax
                            explanations.
                        </p>
                    </Link>

                    <Link
                        href="/developer/jwt-debugger"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            JWT, PASETO &amp; SAML 2.0 Debugger →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Decode and verify JWT (JWS/JWE/SD-JWT), PASETO v1–v4, and SAML 2.0 tokens and audit 16 SSO
                            security rules.
                        </p>
                    </Link>

                    <Link
                        href="/developer/sqlite-viewer"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            SQLite &amp; DuckDB In-Browser Explorer →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Inspect binary B-tree pages, run SQL queries, and generate Drizzle/Prisma schemas directly
                            in your browser.
                        </p>
                    </Link>

                    <Link
                        href="/developer/har-analyzer"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            HAR File Waterfall Analyzer &amp; Sanitizer →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Visualize HTTP waterfalls, scrub sensitive headers/tokens, and export k6, Playwright, or
                            OpenAPI specs.
                        </p>
                    </Link>

                    <Link
                        href="/developer/parquet-viewer"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            Parquet, Avro &amp; Feather Viewer →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Inspect Apache Parquet, Avro, and Arrow IPC schemas, row groups, and column statistics in
                            browser memory.
                        </p>
                    </Link>

                    <Link
                        href="/seo/llms-txt-generator"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            llms.txt &amp; AI Crawler Studio →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Build spec-compliant llms.txt and llms-full.txt files, configure AI crawler rules, and audit
                            token budgets.
                        </p>
                    </Link>
                </div>
            </div>
        </section>
    );
}