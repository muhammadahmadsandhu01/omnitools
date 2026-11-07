import React from 'react';
import Link from 'next/link';
import {
    TrendingUp,
    ShieldCheck,
    Layers,
    AlertTriangle,
    Terminal,
    HelpCircle,
    Sparkles,
    FileSpreadsheet,
    Cpu,
    Search,
    PieChart,
    DollarSign,
} from 'lucide-react';

export interface FaqItem {
    question: string;
    answer: string;
}

export const SAAS_BURN_RATE_CALCULATOR_FAQS: FaqItem[] = [
    {
        question: 'What is the difference between Gross Burn Rate and Net Burn Rate?',
        answer:
            'Gross Burn Rate is the total amount of cash your business spends every month across all operating expenses (payroll, marketing, software, rent, planned hires, and cost of goods sold) before accounting for revenue. Net Burn Rate is the actual cash your bank account loses each month after subtracting Monthly Recurring Revenue (Net Burn = Total Monthly Expenses − Monthly Revenue). Runway is always calculated using Net Burn.',
    },
    {
        question: 'How is startup cash runway calculated (Static vs. Dynamic Runway)?',
        answer:
            'Static Runway divides your current cash balance by today’s monthly Net Burn (Runway = Cash Balance ÷ Net Burn), assuming your revenue and expenses never change. Dynamic Runway forecasts your cash balance month by month over 60 months by compounding your monthly revenue growth rate, monthly expense growth rate, planned hires, and upcoming funding rounds to find the exact month and calendar date when cash reaches zero.',
    },
    {
        question: 'What does Paul Graham’s "Default Alive vs. Default Dead" mean?',
        answer:
            'Coined by Y Combinator co-founder Paul Graham, Default Alive means that at your current monthly revenue growth rate and expense growth rate, your company will reach cash-flow profitability (revenue ≥ expenses) before your bank balance runs out of money. Default Dead means your cash will hit zero before revenue catches up to expenses—requiring either an immediate expense reduction, faster revenue growth, or an external funding round.',
    },
    {
        question: 'When should a startup start fundraising based on its cash runway?',
        answer:
            'Because a typical Seed, Series A, or Series B fundraising round takes 4 to 6 months from initial investor pitches to cash in the bank, founders should start raising at least 6 months before their projected Zero-Cash Date (ideally with 12 to 18 months of runway remaining). Our calculator automatically computes your Recommended Raise-By Date by subtracting a 6-month buffer from your dynamic runway.',
    },
    {
        question: 'What is the Burn Multiple and what is a good benchmark for SaaS startups?',
        answer:
            'Popularized by David Sacks (Craft Ventures), the Burn Multiple measures how much cash a SaaS company burns to generate each new dollar of Annual Recurring Revenue (Burn Multiple = Annualized Net Burn ÷ Annualized Net New ARR). A Burn Multiple under 1.0x is considered Elite, 1.0x to 1.5x is Great, 1.5x to 2.0x is Good, and above 2.0x indicates high capital burn relative to growth.',
    },
    {
        question: 'Are my financial numbers or cap table data uploaded to any server?',
        answer:
            'No. Your cash balances, monthly revenue, operating expenses, hiring plans, and cap table inputs are processed locally in your browser and are not uploaded to KivaroTools servers. The website may still load general analytics or other third-party website resources.',
    },
    {
        question: 'What is the difference between a Post-Money SAFE and a Pre-Money SAFE?',
        answer:
            'Under a Y Combinator Post-Money SAFE, the investor locks in a fixed ownership percentage of the company prior to the next priced funding round equal to Investment Amount ÷ Post-Money Valuation Cap. Multiple Post-Money SAFEs stack on top of each other and dilute the founders rather than diluting one another. Under a Pre-Money SAFE, the valuation cap excludes converting SAFEs, meaning multiple SAFE investors dilute each other alongside the founders.',
    },
    {
        question: 'What is the Series A "Option Pool Shuffle" (Pre-Money vs. Post-Money Pool)?',
        answer:
            'When Series A investors require a startup to create or expand its unissued employee option pool (for example, to 10% or 15% of post-round shares), standard venture term sheets carve that option pool top-up out of the Pre-Money Valuation ("Pre-Money Shuffle"). This lowers the effective share price of the round so that existing founders and converting SAFE holders absorb 100% of the option pool dilution. Switching to "Post-Money Shared" shares the option pool dilution across both existing shareholders and new Series A investors.',
    },
    {
        question: 'How do Convertible Notes with interest convert into shares at a priced round?',
        answer:
            'Unlike a SAFE (which bears 0% interest), a Convertible Note is a debt instrument that accrues interest over time. At the priced funding round, the converting principal equals Investment Amount × (1 + Annual Interest Rate × Months ÷ 12). The note then converts into shares using whichever price is lowest for the investor: the Valuation Cap price, the Discounted Round price, or the standard Round Share Price.',
    },
    {
        question: 'How does the 1-Click Breakeven & Target Runway Solver work?',
        answer:
            'When your startup trajectory is Default Dead or below your target runway (e.g., 24 months), the engine runs a 28-iteration binary search across the 60-month cash flow model to find (1) the exact dollar amount of monthly operating expenses to cut today, or (2) the exact monthly revenue growth rate required to reach cash-flow profitability before running out of cash.',
    },
    {
        question: 'What is the difference between 1x Non-Participating and Participating Preferred in an M&A exit?',
        answer:
            'In a company sale (M&A exit), 1x Non-Participating Preferred investors choose either to take their 1x invested capital back OR convert their preferred shares into common stock to receive their pro-rata ownership percentage—whichever pays more. Under Participating Preferred ("Double Dip"), investors take their 1x–2x liquidation preference first and then also take their pro-rata percentage of the remaining exit proceeds alongside founders.',
    },
    {
        question: 'Can I export my 60-month runway schedule and pro-forma cap table to Excel (.xlsx)?',
        answer:
            'Yes. Clicking "Export 3-Sheet Excel (.xlsx)" generates a native multi-tab OpenXML workbook containing Sheet 1 (Runway_Schedule_60m), Sheet 2 (Cap_Table_Dilution), and Sheet 3 (Exit_Payout_Comparison) directly in your browser with CWE-1236 spreadsheet formula protection.',
    },
];

export default function SaasBurnRateCalculatorSeo() {
    const jsonLdSoftwareApp = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'SaaS Burn Rate, Runway & Equity Dilution Calculator',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'All (100% Client-Side Browser Execution)',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description:
            'Calculate startup gross and net burn rate, static vs. dynamic 60-month cash runway, Paul Graham Default Alive/Dead breakeven, David Sacks Burn Multiple, Pre/Post-Money SAFE conversion, Option Pool Shuffle dilution, and M&A exit payouts in your browser.',
        featureList: [
            'Gross Burn Rate, Net Burn Rate & Static vs. 60-Month Dynamic Compounding Cash Runway',
            'Paul Graham Default Alive vs. Default Dead Trajectory Check & Recommended Raise-By Date',
            'David Sacks Burn Multiple (Annualized Net Burn ÷ Net New ARR) & Capital Efficiency Rating',
            '1-Click Target Runway & Default Alive Breakeven Solver (Required Cost Cut or Revenue Growth %)',
            'Headcount Hiring Plan Builder & Scheduled Equity Round Cash Injection',
            'Pre-Money & Post-Money SAFE + Convertible Note Cap Table Dilution Calculator',
            'Series A Option Pool Shuffle (Pre-Money Carve-Out vs. Post-Money Shared) Comparison',
            'M&A Exit Payout Waterfall (1x–2x Non-Participating vs. Participating Preferred)',
            '3-Scenario Comparison Matrix (Conservative, Base Case, Optimistic) & 3-Sheet Excel (.xlsx) Export',
        ],
    };

    const jsonLdFaqPage = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: SAAS_BURN_RATE_CALCULATOR_FAQS.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: f.answer,
            },
        })),
    };

    const jsonLdHowTo = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'How to Calculate Startup Burn Rate, Cash Runway, and SAFE Equity Dilution',
        description:
            'Step-by-step guide to forecasting your startup cash runway, determining whether you are Default Alive or Default Dead, and modeling SAFE and Series A founder dilution.',
        step: [
            {
                '@type': 'HowToStep',
                position: 1,
                name: 'Enter Current Cash Balance, Monthly Revenue (MRR) & Operating Expenses',
                text: 'Choose a startup scenario preset or use the sliders on the left to enter your current bank balance, monthly recurring revenue, monthly operating expenses, and monthly growth rates.',
            },
            {
                '@type': 'HowToStep',
                position: 2,
                name: 'Review Cash Runway, Default Alive Status & Burn Multiple',
                text: 'Check the right-hand summary card for your Dynamic Cash Runway, Zero-Cash or Breakeven Date, Recommended Raise-By Date, and David Sacks Burn Multiple.',
            },
            {
                '@type': 'HowToStep',
                position: 3,
                name: 'Model SAFE Notes, Next Funding Round & Option Pool Dilution',
                text: 'Open the Cap Table & SAFE Dilution tab below to add Pre-Money or Post-Money SAFEs, Convertible Notes, and Series A valuation terms to see exact post-round founder ownership.',
            },
            {
                '@type': 'HowToStep',
                position: 4,
                name: 'Compare 3 Scenarios & Export Your 3-Sheet Excel (.xlsx) Model',
                text: 'Compare Conservative, Base, and Optimistic trajectories, inspect M&A exit payouts across valuations from $10M to $500M, and download the 3-sheet Excel (.xlsx) or CSV schedule.',
            },
        ],
    };

    return (
        <article className="mt-16 space-y-12 w-full min-w-0 max-w-full overflow-x-hidden text-slate-700 dark:text-slate-300">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftwareApp) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaqPage) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHowTo) }}
            />

            {/* ============================================================================
          SECTION 1: EXECUTIVE OVERVIEW & UNIFIED RUNWAY + DILUTION ARCHITECTURE
          ============================================================================ */}
            <section
                aria-labelledby="saas-burn-rate-architecture-overview"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <h2
                        id="saas-burn-rate-architecture-overview"
                        className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white"
                    >
                        SaaS Burn Rate, Cash Runway &amp; Equity Dilution Calculator
                    </h2>
                    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shrink-0">
                        <Sparkles className="h-3.5 w-3.5" />
                        Runway + Default Alive + SAFE Cap Table
                    </span>
                </div>

                <p className="mt-4 w-full text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 break-words">
                    Most online startup calculators only solve half of a founder’s problem: basic burn rate calculators
                    divide current cash by static monthly spend while ignoring compounding revenue growth, planned
                    hires, and upcoming funding rounds; standalone SAFE calculators show equity dilution without
                    connecting that fundraise to your actual cash runway. Our{' '}
                    <strong>SaaS Burn Rate, Runway &amp; Dilution Simulator</strong> combines a{' '}
                    <strong>60-month dynamic cash flow forecaster</strong> with a{' '}
                    <strong>pro-forma SAFE, Convertible Note, Option Pool Shuffle, and M&amp;A Exit Payout calculator</strong>{' '}
                    in one streamlined workspace.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                            <span>Static &amp; Dynamic Runway</span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            Compares zero-growth Static Runway against 60-month compounding Dynamic Runway with exact
                            Zero-Cash Date, Breakeven Date, and 6-month Raise-By alerts.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                            <Cpu className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Default Alive &amp; Burn Multiple</span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            Evaluates Paul Graham’s Default Alive test and David Sacks’ Burn Multiple (Net Burn ÷ Net
                            New ARR), with a 1-click solver for required cost cuts or growth.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                            <PieChart className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>SAFE &amp; Option Pool Dilution</span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            Models stacked Post-Money and Pre-Money SAFEs, Convertible Notes with accrued interest, and
                            Pre-Money vs. Post-Money Option Pool Shuffles.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                            <DollarSign className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <span>M&amp;A Exit Payout Waterfall</span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            Calculates exact founder, investor, and employee option pool payouts across $10M to $500M
                            exits under 1x–2x Non-Participating or Participating Preferred terms.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 2: COMPLETE INTERNAL WORKING STRUCTURE (HOW THE ENGINE WORKS)
          ============================================================================ */}
            <section
                aria-labelledby="saas-burn-rate-working-structure"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2.5 mb-2">
                    <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2
                        id="saas-burn-rate-working-structure"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Complete Working Structure: How the Burn Rate, Runway &amp; Dilution Engine Works
                    </h2>
                </div>
                <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Every calculation in <code>lib/saasBurnRateEngine.ts</code> follows standard SaaS accounting and
                    venture capital cap table formulas:
                </p>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            1. Gross Burn, Net Burn &amp; Static vs. Dynamic Runway
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            <code>Gross Burn = Base Operating Expenses + Planned Hires + COGS</code>.{' '}
                            <code>Net Burn = max(0, Gross Burn − Monthly Revenue)</code>. Static Runway divides{' '}
                            <code>Current Cash ÷ Net Burn</code>. Dynamic Runway simulates each month <code>t = 1..60</code>{' '}
                            with compounding revenue growth <code>MRR_t = MRR_(t-1) × (1 + g_rev)</code> and expense
                            growth <code>Exp_t = Exp_(t-1) × (1 + g_exp)</code>, interpolating the exact fractional
                            month when cash reaches zero.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            2. David Sacks Burn Multiple &amp; Default Alive Breakeven Solver
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            <code>Burn Multiple = Annualized Net Burn ÷ Annualized Net New ARR</code>. If your monthly
                            recurring revenue crosses total monthly gross burn before your cash balance hits zero, your
                            startup is classified as <strong>Default Alive</strong>. If Default Dead, a 28-iteration
                            binary search solves for the exact monthly cost cut or monthly growth rate needed to reach
                            profitability before running out of cash.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            3. Pre-Money vs. Post-Money SAFE &amp; Option Pool Shuffle Math
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            A YC Post-Money SAFE locks ownership prior to the priced round at{' '}
                            <code>Investment ÷ Valuation Cap</code>. When a priced round (e.g., Series A) includes a
                            Pre-Money Option Pool Carve-Out, the round share price is{' '}
                            <code>Pre-Money Valuation ÷ (Existing Shares + Converted SAFE Shares + Option Pool Top-Up)</code>,
                            so new investors receive exactly <code>New Investment ÷ Post-Money Valuation</code>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            4. Per-Class Liquidation Preference &amp; M&amp;A Exit Waterfall
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Under <strong>1x Non-Participating Preferred</strong>, each preferred investor class
                            independently compares its <code>Invested Capital × Multiple</code> against its as-converted
                            common share of the exit and voluntarily converts to common stock once the exit valuation
                            exceeds its conversion breakpoint. Under <strong>Participating Preferred</strong>, investors
                            receive their preference first and also share pro-rata in the remaining proceeds.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 2B: COMPLETE STEP-BY-STEP USER GUIDE
          ============================================================================ */}
            <section
                aria-labelledby="saas-burn-rate-complete-user-guide"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6"
            >
                <div>
                    <h2
                        id="saas-burn-rate-complete-user-guide"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Complete Step-by-Step Guide: How to Use the Burn Rate, Runway &amp; Dilution Calculator
                    </h2>
                    <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                        Follow these four steps to forecast your cash runway, plan headcount hires, and model equity
                        dilution across funding rounds:
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                            Step 1 • Cash &amp; Burn Inputs
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Enter Cash Balance, MRR &amp; Monthly Expenses
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Select a Quick Scenario Preset or use the left-hand sliders to enter your current bank cash
                            balance, monthly recurring revenue (MRR), monthly operating expenses, and monthly growth
                            rates.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                            Step 2 • Hiring &amp; Breakeven
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Add Planned Hires &amp; Check Default Alive
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Expand the Hiring Plan drawer to schedule future roles by start month. If your startup is
                            Default Dead, click &ldquo;Apply Cost Cut&rdquo; or &ldquo;Apply Growth&rdquo; on the
                            right-hand solver bar to see what flips your trajectory to Default Alive.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                            Step 3 • SAFEs &amp; Option Pool
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Model SAFEs, Convertible Notes &amp; Series A
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Open the Cap Table &amp; SAFE Dilution tab to add Pre-Money or Post-Money SAFEs and
                            Convertible Notes, and toggle between Pre-Money Option Pool Shuffle and Post-Money Shared
                            dilution.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                            Step 4 • Scenarios &amp; Excel Export
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Compare 3 Scenarios &amp; Export 3-Sheet .xlsx
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Inspect Conservative, Base, and Optimistic trajectories, review M&amp;A exit payouts from
                            $10M to $500M, and download the 3-sheet Excel (<code>.xlsx</code>) or CSV schedule.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 3: REAL PRACTICAL EXAMPLES (WORKED STARTUP SCENARIOS)
          ============================================================================ */}
            <section
                aria-labelledby="saas-burn-rate-real-examples"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Terminal className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2
                        id="saas-burn-rate-real-examples"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Practical Examples: Static vs. Dynamic Runway &amp; Series A Dilution
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Example 1: Why Static Runway Understates Growth (Default Alive Check)
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            A Seed SaaS startup has <strong>$1,500,000 in cash</strong>, <strong>$45,000 MRR</strong>{' '}
                            growing at <strong>8.5%/month</strong>, and <strong>$95,000 in monthly expenses</strong>.
                            Including 18% COGS ($8,100), Month 1 Gross Burn is $103,100 and Net Burn is $58,100/mo. A
                            simple static division suggests <code>$1.5M ÷ $58.1K = 25.8 months</code> of runway.
                            However, because MRR compounds at 8.5%/mo, revenue overtakes total expenses in{' '}
                            <strong>Month 16</strong> while the company still has over <strong>$1,050,000</strong> in
                            the bank—making the startup <strong>Default Alive</strong> with 60+ months of runway.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Example 2: Stacked Post-Money SAFEs Converting into a Series A Round
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Founders start with <strong>90% ownership</strong> (9,000,000 shares) and a{' '}
                            <strong>10% option pool</strong> (1,000,000 shares). They raise two Post-Money SAFEs:{' '}
                            <strong>$500K at a $10M Cap (5.0%)</strong> and <strong>$1M at a $15M Cap (6.67%)</strong>,
                            locking <code>11.67%</code> of pre-Series A shares. When raising a{' '}
                            <strong>$7M Series A at a $28M Pre-Money Valuation ($35M Post-Money)</strong> with a 10%
                            post-round option pool carved out pre-money, Series A investors receive{' '}
                            <code>$7M ÷ $35M = 20.0%</code>, the option pool holds <code>10.0%</code>, SAFE holders
                            convert to <code>~8.9%</code>, and Founders retain <strong>~61.1% ownership</strong>.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 4: SAAS RUNWAY, BURN MULTIPLE & DILUTION BENCHMARKS TABLE
          ============================================================================ */}
            <section
                aria-labelledby="saas-burn-rate-benchmark-matrix"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <h2
                    id="saas-burn-rate-benchmark-matrix"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    Startup Financial &amp; Equity Dilution Benchmarks by Stage
                </h2>
                <div className="w-full mt-4 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[720px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">Metric</th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">Formula</th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">Strong / Healthy Target</th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">Acceptable Range</th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">High Risk Zone</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <td className="p-3 font-bold">Post-Raise Cash Runway</td>
                                <td className="p-3 font-mono">Cash Balance ÷ Monthly Net Burn</td>
                                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">18 – 24+ Months</td>
                                <td className="p-3">12 – 18 Months</td>
                                <td className="p-3 text-rose-600 dark:text-rose-400">&lt; 6 – 9 Months</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">David Sacks Burn Multiple</td>
                                <td className="p-3 font-mono">Annualized Net Burn ÷ Net New ARR</td>
                                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">&lt; 1.0x – 1.5x</td>
                                <td className="p-3">1.5x – 2.0x</td>
                                <td className="p-3 text-rose-600 dark:text-rose-400">&gt; 2.5x</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">SaaS Gross Margin</td>
                                <td className="p-3 font-mono">(MRR − COGS) ÷ MRR</td>
                                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">75% – 85%+</td>
                                <td className="p-3">65% – 75%</td>
                                <td className="p-3 text-rose-600 dark:text-rose-400">&lt; 55%</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">Seed SAFE Dilution</td>
                                <td className="p-3 font-mono">∑ (SAFE Investment ÷ Cap)</td>
                                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">10% – 15%</td>
                                <td className="p-3">15% – 22%</td>
                                <td className="p-3 text-rose-600 dark:text-rose-400">&gt; 30%</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">Series A Round Dilution</td>
                                <td className="p-3 font-mono">New Investment ÷ Post-Money Val</td>
                                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">15% – 20%</td>
                                <td className="p-3">20% – 25%</td>
                                <td className="p-3 text-rose-600 dark:text-rose-400">&gt; 30%</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">Employee Option Pool (ESOP)</td>
                                <td className="p-3 font-mono">Unissued Pool ÷ Post-Round Shares</td>
                                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">10% Post-Round</td>
                                <td className="p-3">10% – 15%</td>
                                <td className="p-3 text-rose-600 dark:text-rose-400">&gt; 15% Pre-Money Shuffle</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 5: COMPETITOR COMPARISON MATRIX
          ============================================================================ */}
            <section
                aria-labelledby="saas-burn-rate-competitor-matrix"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <h2
                    id="saas-burn-rate-competitor-matrix"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    Feature Comparison: KivaroTools vs. Basic Runway &amp; Standalone SAFE Calculators
                </h2>
                <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[740px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">Feature / Capability</th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800 bg-blue-50/60 dark:bg-blue-950/40 font-bold">
                                    KivaroTools Unified Calculator
                                </th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">
                                    Basic Bank Runway Calculators
                                </th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">
                                    Standalone SAFE Calculators
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <td className="p-3 font-bold">Static vs. 60-Month Compounding Runway</td>
                                <td className="p-3 bg-blue-50/40 dark:bg-blue-950/20 font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ Both Static &amp; 60m Dynamic Forecast
                                </td>
                                <td className="p-3">Static Division Only (Cash ÷ Burn)</td>
                                <td className="p-3 text-rose-500">✕ No Cash Runway Modeling</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">Default Alive Test &amp; 1-Click Breakeven Solver</td>
                                <td className="p-3 bg-blue-50/40 dark:bg-blue-950/20 font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ Solves Required Cost Cut &amp; Growth %
                                </td>
                                <td className="p-3">Manual Trial &amp; Error</td>
                                <td className="p-3 text-rose-500">✕ Not Supported</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">Headcount Hiring Plan &amp; Funding Round Sync</td>
                                <td className="p-3 bg-blue-50/40 dark:bg-blue-950/20 font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ Injects Funding Cash in Exact Closing Month
                                </td>
                                <td className="p-3 text-rose-500">✕ Disconnected from Fundraising</td>
                                <td className="p-3 text-rose-500">✕ Disconnected from Cash Burn</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">Pre/Post-Money SAFEs, Notes &amp; Pool Shuffle</td>
                                <td className="p-3 bg-blue-50/40 dark:bg-blue-950/20 font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ Full Cap Table + Option Pool Toggle
                                </td>
                                <td className="p-3 text-rose-500">✕ No Equity or Dilution</td>
                                <td className="p-3">Yes (Static Cap Table Only)</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">M&amp;A Exit Payouts (1x–2x Non-Part vs. Part)</td>
                                <td className="p-3 bg-blue-50/40 dark:bg-blue-950/20 font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ $10M to $500M Exit Waterfall Table
                                </td>
                                <td className="p-3 text-rose-500">✕ Not Supported</td>
                                <td className="p-3 text-rose-500">✕ Usually Requires Separate Tool</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">3-Sheet Native Excel (.xlsx) &amp; CSV Export</td>
                                <td className="p-3 bg-blue-50/40 dark:bg-blue-950/20 font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ Instant Local Download (No Signup)
                                </td>
                                <td className="p-3 text-rose-500">✕ Email Gate or None</td>
                                <td className="p-3">Basic CSV or Print Only</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 6: SUPPORTED EXPORT DELIVERABLES TABLE
          ============================================================================ */}
            <section
                aria-labelledby="saas-burn-rate-export-deliverables"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <h2
                        id="saas-burn-rate-export-deliverables"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Supported Spreadsheet &amp; Scenario Export Formats
                    </h2>
                </div>
                <div className="w-full mt-4 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[680px] w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">Export Option</th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">File / Output Format</th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">Contents &amp; Use Case</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <td className="p-3 font-bold">Export 3-Sheet Excel (.xlsx)</td>
                                <td className="p-3 font-mono">saas_burn_runway_captable_model.xlsx</td>
                                <td className="p-3">
                                    Native OpenXML workbook with 3 tabs: <code>Runway_Schedule_60m</code>,{' '}
                                    <code>Cap_Table_Dilution</code>, and <code>Exit_Payout_Comparison</code>.
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">Export Runway CSV</td>
                                <td className="p-3 font-mono">saas_runway_schedule_60m.csv</td>
                                <td className="p-3">
                                    60-month cash balance, MRR, ARR, operating expenses, hiring costs, COGS, and net
                                    cash flow table for Excel or Google Sheets.
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">Share Scenario Link</td>
                                <td className="p-3 font-mono">?preset=...&amp;cash=...&amp;mrr=...</td>
                                <td className="p-3">
                                    Copies a direct URL with your active cash, revenue, expense, growth, and valuation
                                    parameters to share with co-founders or investors.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 7: COMMON STARTUP RUNWAY & CAP TABLE MISTAKES (6 SCENARIOS)
          ============================================================================ */}
            <section
                aria-labelledby="saas-burn-rate-troubleshooting"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <h2
                    id="saas-burn-rate-troubleshooting"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    Common Startup Burn Rate &amp; Equity Dilution Mistakes to Avoid
                </h2>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>1. Using Flat Expenses While Planning New Hires</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Founders often divide current cash by today’s net burn without accounting for 2–3% monthly
                            expense creep or upcoming engineering and sales hires—overstating actual cash runway by 3 to
                            5 months.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>2. Stacking Too Many Post-Money SAFEs Before Series A</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Because each YC Post-Money SAFE locks a fixed percentage of pre-Series A equity (Investment ÷
                            Cap), raising multiple bridge SAFEs can easily give away 25%–35% of the company before
                            Series A investors even arrive.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>3. Overlooking the Pre-Money Option Pool Shuffle</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            When a term sheet specifies a 15% post-round option pool carved out pre-money, the entire
                            option pool expansion dilutes existing founders and SAFE holders rather than the new
                            investors.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>4. Waiting Until Under 6 Months of Runway to Raise</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Institutional fundraising rounds typically take 4 to 6 months to close. Starting a raise
                            with fewer than 6 months of cash left puts founders in a weak negotiating position.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>5. Ignoring Gross Margin (COGS) in Burn Calculations</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Every new dollar of SaaS MRR carries hosting, payment processing, and customer support COGS
                            (typically 15%–25% of revenue). Always factor Gross Margin % into your breakeven projection.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>6. Accepting Participating Preferred (&ldquo;Double Dip&rdquo;) Terms</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Unlike standard 1x Non-Participating preferred stock, Participating Preferred investors take
                            their liquidation preference first and then still take their ownership percentage of the
                            remaining exit proceeds.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 8: SEARCH INTENT & WORKFLOW COVERAGE
          ============================================================================ */}
            <section
                aria-labelledby="saas-burn-rate-keyword-coverage"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2
                        id="saas-burn-rate-keyword-coverage"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Supported Startup Finance, Cash Runway &amp; Cap Table Workflows
                    </h2>
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            Burn Rate &amp; Cash Runway Forecasting
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>saas burn rate and runway calculator</li>
                            <li>startup cash runway calculator online</li>
                            <li>gross burn vs net burn rate calculator</li>
                            <li>paul graham default alive or default dead calculator</li>
                            <li>david sacks burn multiple calculator</li>
                            <li>startup zero cash date and breakeven calculator</li>
                            <li>startup hiring plan and runway extension calculator</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            SAFE Conversion &amp; Cap Table Dilution
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>yc post-money safe dilution calculator</li>
                            <li>pre-money vs post-money safe calculator</li>
                            <li>series a option pool shuffle calculator</li>
                            <li>convertible note interest conversion calculator</li>
                            <li>founder equity dilution across funding rounds</li>
                            <li>pre-money and post-money valuation calculator</li>
                            <li>pro forma cap table excel (.xlsx) generator</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            M&amp;A Exit Payouts &amp; Scenario Planning
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>startup exit waterfall calculator</li>
                            <li>1x non-participating vs participating preferred</li>
                            <li>founder payout at exit calculator</li>
                            <li>investor moic return multiple calculator</li>
                            <li>3-scenario startup cash flow comparison</li>
                            <li>target runway monthly expense reduction calculator</li>
                            <li>60-month saas cash flow csv and xlsx export</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 9: FREQUENTLY ASKED QUESTIONS (12 INTERACTIVE ACCORDIONS)
          ============================================================================ */}
            <section
                aria-labelledby="saas-burn-rate-frequently-asked-questions"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2
                        id="saas-burn-rate-frequently-asked-questions"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Frequently Asked Questions
                    </h2>
                </div>

                <div className="space-y-3">
                    {SAAS_BURN_RATE_CALCULATOR_FAQS.map((faq, index) => (
                        <details
                            key={index}
                            className="group rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 transition-colors"
                        >
                            <summary className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base cursor-pointer select-none list-none flex items-center justify-between gap-3">
                                <span>{faq.question}</span>
                                <span className="ml-2 text-slate-400 group-open:rotate-180 transition-transform shrink-0">
                                    &#9662;
                                </span>
                            </summary>
                            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400 break-words">
                                {faq.answer}
                            </p>
                        </details>
                    ))}
                </div>
            </section>

            {/* ============================================================================
          SECTION 10: INTERNAL CROSS-LINKING TO RELATED FINANCE & DOCUMENT TOOLS
          ============================================================================ */}
            <section
                aria-labelledby="saas-burn-rate-related-utilities"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2
                        id="saas-burn-rate-related-utilities"
                        className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Related Finance, Spreadsheet &amp; Document Utilities
                    </h2>
                </div>
                <p className="w-full text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed break-words">
                    Continue your financial planning and document workflow with our integrated browser tools:
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Link
                        href="/document/pdf-scrubber"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            PDF Bank Statement &amp; Invoice Data Scrubber →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Permanently redact account numbers, card PANs, Tax IDs, and hidden PDF metadata before
                            sharing financial statements.
                        </p>
                    </Link>

                    <Link
                        href="/developer/parquet-viewer"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            Parquet, Avro &amp; Feather Viewer + Excel (.xlsx) →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Inspect billing exports and data warehouse files locally in your browser with instant CSV
                            and Excel conversion.
                        </p>
                    </Link>

                    <Link
                        href="/document/excel-to-pdf"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            Excel (.xlsx) &amp; CSV to PDF Financial Report Converter →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Convert exported cap tables and 60-month runway spreadsheets into clean, printable PDF
                            documents.
                        </p>
                    </Link>

                    <Link
                        href="/developer/json-converter"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            JSON to CSV, Excel (.xlsx), YAML &amp; XML Converter →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Transform Stripe billing JSON payloads and accounting exports into spreadsheets locally.
                        </p>
                    </Link>

                    <Link
                        href="/developer/llms-txt-generator"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            llms.txt, llms-full.txt &amp; AI Crawler (robots.txt) Studio →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Generate llmstxt.org v2 indexes and manage AI search and training crawlers for your SaaS
                            website.
                        </p>
                    </Link>

                    <Link
                        href="/developer/har-analyzer"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            HAR File Analyzer, Waterfall Viewer &amp; Sanitizer →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Inspect HTTP network waterfalls, scrub API secrets, and export k6 or Playwright scripts.
                        </p>
                    </Link>
                </div>
            </section>
        </article>
    );
}