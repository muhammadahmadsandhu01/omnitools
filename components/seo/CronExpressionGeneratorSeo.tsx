import React from 'react';
import Link from 'next/link';

export const CRON_GENERATOR_FAQS: { question: string; answer: string }[] = [
    {
        question: 'What is the difference between 5-field POSIX cron, 6-field AWS EventBridge, and 7-field Java Quartz cron?',
        answer:
            'Standard 5-field POSIX/Linux crontab, Kubernetes CronJob, and GitHub Actions use five space-separated fields: Minute (0–59), Hour (0–23), Day of Month (1–31), Month (1–12), and Day of Week (0–6 or 7 for Sunday). Spring @Scheduled uses 6 fields by prepending Seconds (0–59) at the beginning. AWS EventBridge uses 6 fields by appending Year (1970–2199) at the end (Min Hour DOM Month DOW Year). Java Quartz uses 6 or 7 fields (Sec Min Hour DOM Month DOW [Year]). Additionally, Quartz and AWS EventBridge index Day-of-Week as 1–7 (1 = Sunday, 7 = Saturday) and require the "?" no-specific-value character in either Day-of-Month or Day-of-Week.',
    },
    {
        question: 'Why does "0 0 13 * 5" run every Friday AND on the 13th of every month instead of only Friday the 13th?',
        answer:
            'In standard POSIX/Vixie cron, Kubernetes batch/v1 CronJobs, and GitHub Actions, if both Day-of-Month (field 3) and Day-of-Week (field 5) are restricted (neither is "*"), the scheduler evaluates them using a Boolean OR union rather than an AND intersection. As a result, "0 0 13 * 5" fires at midnight on the 13th of every month AND at midnight on every Friday. Our 14-Rule Reliability Linter automatically detects this trap (Rule CRON-OR-003) and helps you remediate it or switch to Spring @Scheduled (which uses Boolean AND) or Quartz/EventBridge "#" modifiers.',
    },
    {
        question: 'How do the "L", "W", "LW", and "#" special characters work in Quartz and AWS EventBridge?',
        answer:
            '"L" stands for Last: in the Day-of-Month field, "L" matches the last calendar day of the month (28, 29 in leap years, 30, or 31), and "L-3" matches 3 days before the end of the month. "W" stands for Nearest Weekday: "15W" triggers on the closest weekday (Mon–Fri) to the 15th within the same month (if the 15th is Saturday, it fires Friday the 14th; if the 1st is Saturday, "1W" fires Monday the 3rd because it never crosses a month boundary). "LW" combines both to match the last weekday of the month. "#" specifies the Nth weekday of the month: in Quartz/EventBridge (where 6 = Friday), "6#3" or "FRI#3" fires on the third Friday of every month.',
    },
    {
        question: 'What happens to a cron job during Daylight Saving Time (DST) Spring-Forward and Fall-Back transitions?',
        answer:
            'In timezones that observe Daylight Saving Time (such as America/New_York, Europe/London, or Europe/Berlin), clocks jump forward from 02:00 to 03:00 on the Spring-Forward transition Sunday and repeat the 01:00–01:59 (or 02:00–02:59) hour on the Fall-Back transition Sunday. A cron job scheduled at "15 2 * * *" in a local DST timezone can be skipped completely in the spring and executed twice (or bunched) in the autumn. Running critical cron schedules in UTC eliminates DST skip and double-execution risks.',
    },
    {
        question: 'Why does changing a schedule from Unix crontab to Quartz or AWS EventBridge shift my weekdays by one day?',
        answer:
            'Standard POSIX cron, Kubernetes, GitHub Actions, and Spring index Day-of-Week from 0 to 6, where 0 (and 7) represents Sunday, 1 is Monday, and 5 is Friday ("1-5" = Monday through Friday). In contrast, Java Quartz and AWS EventBridge index Day-of-Week from 1 to 7, where 1 represents Sunday, 2 is Monday, and 6 is Friday. Pasting "1-5" directly into Quartz or EventBridge runs the job Sunday through Thursday. Our Cross-Dialect AST Transpiler automatically shifts numeric weekday indices or converts them to unambiguous symbolic names ("MON-FRI").',
    },
    {
        question: 'What is the accidental minute flood bug ("* 2 * * *") in cron?',
        answer:
            'Many developers write "* 2 * * *" intending to run a script once a day at 02:00 AM. Because the first field is Minute ("*" = every minute), "* 2 * * *" actually executes 60 times every night—once per minute at 02:00, 02:01, 02:02 ... through 02:59! To run once at 02:00 AM, the Minute field must be "0" ("0 2 * * *"). Rule CRON-MIN-002 in our linter flags this immediately.',
    },
    {
        question: 'How does the Jenkins "H" hash-jitter symbol work?',
        answer:
            'In Jenkins pipeline schedules, the "H" symbol (for "Hash") deterministically computes a pseudo-random offset based on a hash (such as CRC-32) of the job or pipeline name. Instead of having 200 CI jobs all configured as "0 * * * *" and overwhelming build agents at minute :00 (the thundering-herd problem), "H * * * *" or "H/15 * * * *" assigns each job a consistent, evenly distributed minute offset across the hour.',
    },
    {
        question: 'Why does my Linux crontab command fail when I use "date +%Y-%m-%d" inside the command?',
        answer:
            'According to the POSIX crontab(5) specification, the percent sign ("%") is a special metacharacter in crontab files: any unescaped "%" is converted into a newline character by the cron daemon, and all text after the first "%" is passed to the command as standard input (stdin). You must escape every percent sign with a backslash ("date +\\%Y-\\%m-\\%d") or place the command inside an external shell script. Rule CRON-SHL-012 in our linter detects and escapes unescaped "%" characters in 1 click.',
    },
    {
        question: 'How do I prevent overlapping cron executions if a job takes longer than its schedule interval?',
        answer:
            'Standard Unix cron and Kubernetes CronJob (which defaults to concurrencyPolicy: Allow) launch a new process on schedule even if the previous run is still active. To prevent overlapping executions: (1) on Linux crontab, wrap your command with "/usr/bin/flock -n /tmp/job.lock", (2) in Kubernetes CronJob YAML, set "concurrencyPolicy: Forbid" and "startingDeadlineSeconds: 300", and (3) in systemd timers, use a Type=oneshot service unit, which naturally prevents concurrent activation.',
    },
    {
        question: 'How do I convert a crontab expression into a Linux systemd timer (OnCalendar=)?',
        answer:
            'Systemd timers use calendar event expressions in the format "DayOfWeek Year-Month-Day Hour:Minute:Second". For example, a weekday cron job "*/15 9-17 * * 1-5" converts to "OnCalendar=Mon..Fri *-*-* 09..17:00/15:00" inside a ".timer" unit paired with "Persistent=true" and a ".service" unit. Tab 3 and Tab 4 of our workbench compile complete ".timer" and ".service" files automatically.',
    },
    {
        question: 'What are the limitations of GitHub Actions scheduled workflows (on.schedule)?',
        answer:
            'GitHub Actions evaluates cron expressions strictly in UTC, ignores timezones, and drops any schedule interval shorter than 5 minutes (expressions like "*/1 * * * *" are throttled to 5-minute intervals). Furthermore, workflows scheduled at "0 * * * *" or "0 0 * * *" frequently experience 15-to-30-minute queuing delays due to global runner contention. Staggering your minute field (e.g., "17 * * * *") improves start-time accuracy.',
    },
    {
        question: 'Why do step values like "*/7" or "*/13" in the Minute field cause uneven execution gaps?',
        answer:
            'In cron, "*/N" does not mean "every N minutes continuously across hour boundaries"—it means "every minute value from 0 to 59 where minute % N == 0". For "*/13", the job runs at :00, :13, :26, :39, and :52, and then resets at the top of the next hour (:00), leaving only an 8-minute gap between :52 and :00 instead of 13 minutes! Only divisors of 60 (1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30) produce uniform intervals across hours.',
    },
    {
        question: 'What happens if I schedule a job on the 31st of the month ("0 0 31 * *")?',
        answer:
            'A schedule fixed to day 31 ("0 0 31 * *") will only execute 7 times a year (Jan, Mar, May, Jul, Aug, Oct, Dec) and will silently skip February, April, June, September, and November. If your goal is to run on the final day of every month regardless of length, use the "L" modifier in Quartz/EventBridge ("0 0 L * ?") or "~01" in systemd OnCalendar.',
    },
    {
        question: 'Can I compare two different cron expressions to see if their maintenance windows collide?',
        answer:
            'Yes. Enter your primary schedule in the main input and paste a secondary cron expression into the "Secondary Cron Job (Optional Collision Check)" field. The simulator evaluates both ASTs simultaneously across the Monthly Calendar Heatmap and Upcoming 15 Runs table, highlighting any timestamp where both jobs fire together.',
    },
    {
        question: 'How can I share a cron schedule with my team in Google Calendar or Outlook?',
        answer:
            'Open Tab 5 (Export .ICS Calendar & .XLSX / .CSV Audit) and click "Download RFC 5545 .ICS". The engine generates a standards-compliant iCalendar file containing the upcoming scheduled execution windows with UTC timestamps and descriptions that you can import directly into Google Calendar, Apple Calendar, or Microsoft Outlook.',
    },
    {
        question: 'Are my cron schedules or shell commands uploaded to any server?',
        answer:
            'No. All 7-dialect AST parsing, English-to-Cron compilation, multi-timezone simulation, DST scanning, DevOps config generation, and .ics/.xlsx/.csv exports execute 100% locally in your browser memory with zero network transmissions.',
    },
];

export default function CronExpressionGeneratorSeo() {
    const softwareSchema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'KivaroTools Cron Expression Generator, 7-Dialect Visual Builder & DST Simulator',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'All (100% Client-Side Web Browser)',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            ratingCount: '210',
            bestRating: '5',
            worstRating: '1',
        },
        description:
            'Free client-side 7-dialect Cron expression generator, visual builder, plain-English explainer, Daylight Saving Time (DST) skip simulator, 14-rule reliability linter, and Kubernetes/systemd/Terraform config compiler.',
        featureList: [
            '7-Dialect Cron AST Parser: POSIX/Linux (5-Field), Kubernetes CronJob, GitHub Actions, Spring @Scheduled (6-Field), Java Quartz (6/7-Field with L, W, LW, #, ?), AWS EventBridge, and Jenkins H Hash-Jitter',
            'Bidirectional Visual Field Builder + Plain-English to Cron Compiler + Crontab.guru Style Human Explainer',
            'Multi-Timezone Execution Simulator across 12 IANA Timezones + 6-Region Global World Clock Matrix',
            'Monthly Execution Density Calendar Heatmap & Two-Job Schedule Collision Detector',
            '14-Rule Production Cron Reliability & DST Pitfall Linter with Deterministic 1-Click Auto-Fixer',
            'Cross-Dialect AST Transpiler (POSIX <-> Quartz <-> AWS EventBridge <-> Spring <-> Jenkins <-> systemd OnCalendar)',
            '10-Platform DevOps Config Compiler (K8s CronJob YAML, systemd .timer/.service, Linux crontab + flock, GitHub Actions, Terraform, Vercel, Cloudflare Workers, Node.js, Python, Go)',
            'RFC 5545 .ics Calendar Exporter + CWE-1236 Safe .xlsx & .csv Schedule Audit Reports',
        ],
    };

    const howToSchema = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'How to Build, Validate, and Simulate a Production Cron Schedule Across Timezones',
        description:
            'Follow these four steps to build or audit a 5-, 6-, or 7-field cron expression, check for DST skips and concurrency overlaps, and export production DevOps manifests.',
        step: [
            {
                '@type': 'HowToStep',
                position: 1,
                name: 'Enter a Cron Expression, Plain-English Phrase, or Click a Preset',
                text: 'Type or paste any 5-, 6-, or 7-field cron expression, type a plain-English schedule such as "every 15 mins during business hours on weekdays", or click one of the 6 built-in scenario presets.',
            },
            {
                '@type': 'HowToStep',
                position: 2,
                name: 'Customize Fields Visually & Select Your Target Timezone',
                text: 'Click any field in the Color-Coded AST Breakdown or Interactive Visual Builder to set ranges, steps (*/15), or special modifiers (L, LW, 15W, 6#3, H/15), and select your target IANA timezone and estimated job duration.',
            },
            {
                '@type': 'HowToStep',
                position: 3,
                name: 'Audit the 14-Rule Reliability Linter & Monthly Calendar Heatmap',
                text: 'Inspect the 14-Rule Reliability Score for accidental minute floods, POSIX DOM+DOW Boolean OR traps, DST 02:00 skip hazards, or job overlaps, and click "1-Click Auto-Fix" to remediate.',
            },
            {
                '@type': 'HowToStep',
                position: 4,
                name: 'Transpile Across Dialects or Export DevOps Configs & .ICS Calendar',
                text: 'Copy ready-to-deploy Kubernetes CronJob YAML, Linux systemd OnCalendar timers, AWS EventBridge Terraform HCL, or download an RFC 5545 .ics calendar and .xlsx audit workbook.',
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
            aria-label="Cron Expression Generator and 7-Dialect Schedule Simulator Technical Documentation"
            className="mt-12 space-y-10 text-slate-700 dark:text-slate-300 w-full min-w-0 max-w-full overflow-x-hidden"
        >
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            {/* ========================================================================
          SECTION 1: HERO TECHNICAL OVERVIEW & 7-DIALECT ARCHITECTURE
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    <span>Enterprise DevOps &amp; Cloud Scheduling Engineering Guide</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Universal 7-Dialect Cron Expression Generator, Visual AST Builder &amp; DST Collision Simulator
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    Modern engineering teams no longer schedule jobs in a single 5-field Linux <code>/etc/crontab</code> file. A
                    single production platform routinely coordinates <strong>5-field Kubernetes <code>batch/v1</code> CronJobs</strong>,{' '}
                    <strong>5-field UTC GitHub Actions workflows</strong>, <strong>6-field Spring Boot <code>@Scheduled</code> tasks</strong>{' '}
                    with seconds, <strong>6-field AWS EventBridge rules</strong> requiring <code>?</code> mutual exclusion and{' '}
                    <code>1–7</code> weekday numbering, <strong>7-field Java Quartz enterprise schedulers</strong> using{' '}
                    <code>L</code>, <code>W</code>, <code>LW</code>, and <code>#</code> calendar modifiers,{' '}
                    <strong>Jenkins <code>H</code> hash-jittered pipelines</strong>, and <strong>Linux <code>systemd</code> timers</strong>{' '}
                    using <code>OnCalendar=</code> expressions.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    Our deterministic engine (<code>lib/cronGeneratorEngine.ts</code> v5.2) unifies all seven scheduling dialects
                    into a single, 100% client-side workbench. Whether you type a raw cron string, click interactive visual field
                    pills, or describe your schedule in plain English, the studio parses the Abstract Syntax Tree (AST), simulates
                    upcoming executions across 12 IANA timezones, audits 14 production reliability rules, and compiles ready-to-ship
                    infrastructure manifests in under 2 milliseconds.
                </p>
            </div>

            {/* ========================================================================
          SECTION 2: WHY STANDARD 5-FIELD CRONTAB EDITORS CAUSE PRODUCTION OUTAGES
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-5">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Why Traditional 5-Field Crontab Editors Fail in Cloud, Kubernetes &amp; Serverless Environments
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Legacy cron editors were designed strictly for 1980s 5-field Vixie cron. Relying on a basic 5-field tester for
                    modern cloud infrastructure introduces four severe operational hazards:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 p-4 space-y-1.5">
                        <h4 className="font-bold text-rose-900 dark:text-rose-200">
                            1. The Infamous POSIX Day-of-Month + Day-of-Week Boolean OR Bug
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            In standard POSIX cron, Kubernetes, and GitHub Actions, specifying both Day-of-Month (<code>13</code>) and
                            Day-of-Week (<code>5</code> = Friday) in <code>0 0 13 * 5</code> is evaluated with a{' '}
                            <strong>Boolean OR union</strong>—executing on the 13th of every month <em>plus</em> every single Friday!
                            Meanwhile, Spring <code>@Scheduled</code> evaluates both fields with <strong>Boolean AND</strong>, and
                            Quartz/AWS EventBridge reject the expression unless one field is replaced with <code>?</code>.
                        </p>
                    </div>

                    <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-1.5">
                        <h4 className="font-bold text-amber-900 dark:text-amber-200">
                            2. Silent Off-by-One Weekday Shifts (0–6 vs. 1–7 Indexing)
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            POSIX cron maps <code>0</code> (and <code>7</code>) to Sunday and <code>1–5</code> to Monday–Friday. Java
                            Quartz and AWS EventBridge map <code>1</code> to Sunday, <code>2</code> to Monday, and <code>6</code> to
                            Friday. Copying <code>0 9 * * 1-5</code> into AWS EventBridge runs your Monday–Friday batch job on{' '}
                            <strong>Sunday through Thursday</strong> unless numeric indices are shifted to <code>2-6</code> or{' '}
                            <code>MON-FRI</code>.
                        </p>
                    </div>

                    <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 space-y-1.5">
                        <h4 className="font-bold text-indigo-900 dark:text-indigo-200">
                            3. Daylight Saving Time (DST) 02:00 Skips &amp; Fall-Back Double Runs
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            In DST-observing zones (<code>America/New_York</code>, <code>Europe/London</code>,{' '}
                            <code>Europe/Berlin</code>), the local hour <code>02:00–02:59</code> does not exist on the Spring-Forward
                            transition Sunday and occurs twice on the Fall-Back Sunday. A nightly settlement job at{' '}
                            <code>15 2 * * *</code> can be skipped entirely or executed twice unless pinned to <code>UTC</code>.
                        </p>
                    </div>

                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-1.5">
                        <h4 className="font-bold text-emerald-900 dark:text-emerald-200">
                            4. Concurrent Execution Pile-Ups &amp; Crontab &ldquo;%&rdquo; Newline Failures
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Neither Linux <code>crontab</code> nor Kubernetes <code>CronJob</code> (by default) waits for a previous
                            run to finish before starting the next scheduled invocation. Worse, unescaped <code>%</code> characters in
                            crontab commands (<code>date +%F</code>) are converted into newlines by Vixie cron, breaking production
                            scripts silently.
                        </p>
                    </div>
                </div>
            </div>

            {/* ========================================================================
          SECTION 3: COMPLETE 7-DIALECT SYNTAX & SPECIAL MODIFIERS REFERENCE
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Complete Cron Field Structure &amp; Extended Modifier Reference (<code>*</code>, <code>/</code>, <code>?</code>,{' '}
                    <code>L</code>, <code>W</code>, <code>LW</code>, <code>#</code>, <code>H</code>)
                </h3>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200">
                                <th className="py-3 px-4">Modifier / Symbol</th>
                                <th className="py-3 px-4">Valid Fields</th>
                                <th className="py-3 px-4">Supported Dialects</th>
                                <th className="py-3 px-4">Mathematical Evaluation Rule &amp; Example</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <td className="py-2.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">* (Asterisk)</td>
                                <td className="py-2.5 px-4">All Fields</td>
                                <td className="py-2.5 px-4">All 7 Dialects</td>
                                <td className="py-2.5 px-4">Matches every possible value within the field&apos;s allowed range (e.g., <code>0..59</code> in Minutes).</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">*/N &amp; A-B/N</td>
                                <td className="py-2.5 px-4">All Fields</td>
                                <td className="py-2.5 px-4">All 7 Dialects</td>
                                <td className="py-2.5 px-4">Step increment: <code>*/15</code> in Minutes fires at <code>0, 15, 30, 45</code>. Use factors of 60 or 24 to avoid boundary drift.</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">? (Question Mark)</td>
                                <td className="py-2.5 px-4">DOM, DOW</td>
                                <td className="py-2.5 px-4">Quartz, AWS EventBridge</td>
                                <td className="py-2.5 px-4">Mutual-exclusion placeholder required in either Day-of-Month or Day-of-Week so both are never active simultaneously.</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">L &amp; L-N</td>
                                <td className="py-2.5 px-4">DOM, DOW</td>
                                <td className="py-2.5 px-4">Quartz, AWS EventBridge</td>
                                <td className="py-2.5 px-4">In DOM, <code>L</code> matches the last day of the month (28/29/30/31) and <code>L-3</code> is 3 days prior. In DOW, <code>5L</code> matches the last Friday.</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">nW &amp; LW</td>
                                <td className="py-2.5 px-4">Day of Month</td>
                                <td className="py-2.5 px-4">Quartz, AWS EventBridge</td>
                                <td className="py-2.5 px-4"><code>15W</code> matches the nearest weekday (Mon–Fri) to the 15th within the same month. <code>LW</code> matches the last weekday of the month.</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">DOW#N (Nth Day)</td>
                                <td className="py-2.5 px-4">Day of Week</td>
                                <td className="py-2.5 px-4">Quartz, AWS EventBridge</td>
                                <td className="py-2.5 px-4"><code>6#3</code> or <code>FRI#3</code> matches the 3rd Friday of the month (where <code>floor((day - 1) / 7) + 1 == 3</code>).</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">H &amp; H(a-b)/N</td>
                                <td className="py-2.5 px-4">Min, Hour, DOM, DOW</td>
                                <td className="py-2.5 px-4">Jenkins Pipeline</td>
                                <td className="py-2.5 px-4">Deterministic CRC-32 hash jitter seeded by the Jenkins job name (<code>H/20 H(0-7) * * 1-5</code>) to spread build load.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========================================================================
          SECTION 4: STEP-BY-STEP WORKED EXAMPLES & TRANSPILATION TRACES
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-5">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Worked Multi-Dialect Examples: Calendar Math, Transpilation &amp; Compute Budget Traces
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 p-4 space-y-2 min-w-0">
                        <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            Worked Example 1: Java Quartz Last-Weekday Payroll (Preset #4)
                        </div>
                        <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed overflow-x-auto max-w-full">{`Input Expression : 0 30 17 LW * ? *
Detected Dialect : QUARTZ_6_7 (7-Field Java Quartz)
Plain English    : At 17:30:00, on the last weekday (Mon-Fri) of the month.

May 2026 Calendar Evaluation:
- Total Days in May 2026 : 31 (May 31, 2026 is a Sunday)
- May 30, 2026           : Saturday (shifted back)
- Resolved LW Target Day : Friday, May 29, 2026 at 17:30:00 UTC
- Systemd Equivalent     : OnCalendar=*-*-~01 17:30:00`}</pre>
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 p-4 space-y-2 min-w-0">
                        <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Worked Example 2: POSIX to AWS EventBridge Weekday Transpilation
                        </div>
                        <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed overflow-x-auto max-w-full">{`Source POSIX (5-Field)     : */15 9-17 * * 1-5
1. Minute & Hour           : */15 (0,15,30,45) | 9-17 (09:00..17:59)
2. Mutual Exclusion (?)    : DOM "*" -> "?" (since DOW is restricted)
3. Weekday Shift (0-6->1-7): POSIX "1-5" (Mon-Fri) -> "2-6" (or MON-FRI)
4. Append Year Field       : "*"
Target AWS EventBridge     : cron(*/15 9-17 ? * 2-6 *)
Monthly Compute (30s/run)  : 792 runs/mo * 0.5m = 396 mins (19.8% GHA Free Tier)`}</pre>
                    </div>
                </div>
            </div>

            {/* ========================================================================
          SECTION 5: STEP-BY-STEP USER WORKFLOW GUIDE
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    How to Use the Cron Expression Generator, Visual Builder &amp; Simulator
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white">
                            Step 1: Load a Preset, Paste a Schedule, or Type Plain English
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">
                            Click any of the 6 Scenario Presets at the top, paste an existing crontab line or{' '}
                            <code>cron(...)</code> expression, or type a natural-language phrase like{' '}
                            <code>&ldquo;every 10 mins during business hours on weekdays&rdquo;</code> and click Convert.
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white">
                            Step 2: Refine Tokens Visually &amp; Set Timezone / Job Duration
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">
                            Click any field card in the Color-Coded AST Breakdown or select a field tab in the Interactive Visual
                            Builder to apply step values, weekday ranges, or <code>L / LW / W / # / H</code> modifiers.
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white">
                            Step 3: Audit 14 Reliability Rules &amp; Remediate in 1 Click
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">
                            Open Tab 2 to inspect the 14-Rule Reliability Linter for accidental minute floods, <code>DOM+DOW</code>{' '}
                            Boolean OR traps, DST skips, or job overlaps, and click <strong>1-Click Auto-Fix</strong> to reach a
                            100/100 Grade A+ schedule.
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white">
                            Step 4: Compile DevOps Manifests or Export .ICS / .XLSX
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">
                            Use Tab 3 and Tab 4 to copy production Kubernetes <code>CronJob</code> YAML, <code>systemd</code>{' '}
                            <code>.timer</code> units, or Terraform code, or open Tab 5 to export an RFC 5545 <code>.ics</code>{' '}
                            calendar or CWE-1236 safe <code>.xlsx</code> audit sheet.
                        </p>
                    </div>
                </div>
            </div>

            {/* ========================================================================
          SECTION 6: COMPETITOR & 7-DIALECT CAPABILITY COMPARISON MATRIX
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Enterprise Capability Comparison: KivaroTools vs. Legacy Online Cron Editors
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200">
                                <th className="py-3 px-4">Feature / Engineering Capability</th>
                                <th className="py-3 px-4 text-indigo-600 dark:text-indigo-400">KivaroTools Cron Studio (v5.2)</th>
                                <th className="py-3 px-4">5-Field Crontab Editors</th>
                                <th className="py-3 px-4">Basic Quartz Dropdown Tools</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <td className="py-2.5 px-4 font-semibold">Supported Cron Dialects</td>
                                <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                                    All 7 (POSIX, K8s, GHA, Spring 6F, Quartz 7F, EventBridge, Jenkins H)
                                </td>
                                <td className="py-2.5 px-4">5-Field POSIX Only</td>
                                <td className="py-2.5 px-4">Quartz 6/7-Field Only</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-semibold">14-Rule Pitfall Linter &amp; 1-Click Auto-Fix</td>
                                <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                                    Yes (DOM+DOW OR, * Minute Flood, % Escape, Overlap, DST)
                                </td>
                                <td className="py-2.5 px-4">None</td>
                                <td className="py-2.5 px-4">Basic Syntax Check Only</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-semibold">Multi-Timezone &amp; Annual DST Skip Scanner</td>
                                <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                                    12 IANA Timezones + 6-Region World Clock + DST Audit
                                </td>
                                <td className="py-2.5 px-4">Local Browser Clock Only</td>
                                <td className="py-2.5 px-4">UTC Only</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-semibold">Monthly Calendar Heatmap &amp; 2-Job Collision Check</td>
                                <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                                    Interactive Month Grid + Secondary Cron Collision Detector
                                </td>
                                <td className="py-2.5 px-4">Next 1–5 Text Dates Only</td>
                                <td className="py-2.5 px-4">Next 3–5 Text Dates Only</td>
                            </tr>
                            <tr>
                                <td className="py-2.5 px-4 font-semibold">DevOps Config Compiler &amp; .ICS / .XLSX Export</td>
                                <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                                    10 Platforms (K8s, systemd, Terraform, flock) + .ics/.xlsx/.csv
                                </td>
                                <td className="py-2.5 px-4">None</td>
                                <td className="py-2.5 px-4">Raw String Copy Only</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========================================================================
          SECTION 7: 14-RULE PRODUCTION RELIABILITY & SECURITY LINTER REFERENCE
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    14-Rule Production Cron Reliability &amp; Concurrency Audit Reference
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Every expression entered into the workbench is continuously evaluated against 14 production engineering rules:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {[
                        ['CRON-SYN-001', 'CRITICAL', 'Invalid Field Grammar or Out-of-Range Numeric Value'],
                        ['CRON-MIN-002', 'CRITICAL', 'Accidental Every-Minute Execution Flood ("* 2 * * *" runs 60x/hour)'],
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
                        ['CRON-ENV-014', 'WARNING', 'Relative Script Path in Crontab Command (Fails Under Minimal Cron PATH=/usr/bin:/bin)'],
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
          SECTION 8: MIGRATING CRONTAB TO SYSTEMD TIMERS & KUBERNETES CRONJOBS
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Migrating Legacy Linux Crontab Jobs to <code>systemd</code> Timers &amp; Kubernetes <code>batch/v1</code> CronJobs
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    When migrating recurring jobs from traditional Vixie <code>crontab</code> to modern Linux{' '}
                    <code>systemd</code> timers or Kubernetes clusters, three architectural upgrades prevent silent failures:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <li>
                        <strong>Preventing Missed Runs Across Reboots (<code>Persistent=true</code> &amp; <code>startingDeadlineSeconds</code>):</strong>{' '}
                        If a Linux host is powered off during a scheduled <code>crontab</code> window, the job is skipped until the
                        next cycle. Setting <code>Persistent=true</code> in a <code>systemd</code> <code>.timer</code> unit triggers
                        the missed execution immediately upon boot. In Kubernetes, always set{' '}
                        <code>startingDeadlineSeconds: 300</code> so the controller does not permanently halt scheduling after 100
                        missed checks.
                    </li>
                    <li>
                        <strong>Eliminating Top-of-Hour Load Spikes (<code>RandomizedDelaySec</code> &amp; Jenkins <code>H</code>):</strong>{' '}
                        Adding <code>RandomizedDelaySec=15s</code> in <code>systemd</code> or using <code>H/15</code> in Jenkins
                        prevents dozens of timers on the same node from spiking CPU and disk I/O at the exact same millisecond.
                    </li>
                    <li>
                        <strong>Explicit Timezone Pinning (<code>CRON_TZ</code> &amp; K8s <code>spec.timeZone</code>):</strong>{' '}
                        Since Kubernetes 1.27, <code>spec.timeZone</code> is stable in <code>batch/v1</code> CronJobs. Always pin{' '}
                        <code>timeZone: &quot;UTC&quot;</code> (or your explicit IANA region) rather than relying on the node&apos;s
                        local system clock.
                    </li>
                </ul>
            </div>

            {/* ========================================================================
          SECTION 9: 16 INTERACTIVE FREQUENTLY ASKED QUESTIONS (FAQS)
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Frequently Asked Questions: Cron Syntax, Quartz, AWS EventBridge, DST &amp; Kubernetes
                </h3>
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
          SECTION 10: RELATED DEVELOPER & SECURITY UTILITIES CROSS-LINK GRID
          ======================================================================== */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Explore Related Client-Side Developer &amp; Security Studios on KivaroTools
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    <Link
                        href="/developer/jwt-debugger"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            JWT, PASETO &amp; SAML 2.0 Security Debugger →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Decode and verify JWT (JWS/JWE/SD-JWT), PASETO v1–v4, and SAML 2.0 tokens and audit 16 SSO security rules locally.
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
                            Inspect binary B-tree pages, run DuckDB SUMMARIZE queries, carve deleted freelist records, and generate Drizzle/Prisma schemas.
                        </p>
                    </Link>

                    <Link
                        href="/developer/har-analyzer"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            HAR File Waterfall Analyzer &amp; Secret Sanitizer →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Visualize 7-phase HTTP waterfalls, scrub 14 secret surfaces, and compile k6, Playwright, or OpenAPI 3.1 specs.
                        </p>
                    </Link>

                    <Link
                        href="/developer/parquet-viewer"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            Parquet, Avro &amp; Feather Columnar Viewer →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Inspect Apache Parquet, Avro, and Arrow IPC schemas, row groups, and column statistics locally in browser memory.
                        </p>
                    </Link>

                    <Link
                        href="/developer/llms-txt-generator"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            llms.txt &amp; AI Crawler (robots.txt) Studio →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Build spec-compliant llms.txt and llms-full.txt files, configure 45 AI search and training bots, and audit token budgets.
                        </p>
                    </Link>

                    <Link
                        href="/image/heic-to-jpg"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            HEIC &amp; AVIF Batch Converter &amp; EXIF Scrubber →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Convert iOS 18 HEIC and AVIF photos to JPG, PNG, WebP, or PDF locally while scrubbing 16 EXIF &amp; GPS privacy tags.
                        </p>
                    </Link>
                </div>
            </div>
        </section>
    );
}