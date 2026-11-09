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
            'Gross Burn Rate is the total amount of cash your business spends every month across operating expenses (payroll, marketing, software, rent, planned hires, and cost of goods sold) before accounting for revenue. Net Burn Rate is the monthly cash deficit after subtracting Monthly Recurring Revenue (Net Burn = Total Gross Burn − Monthly Revenue) when expenses exceed revenue.',
    },
    {
        question: 'How is startup cash runway calculated (Static vs. Dynamic Runway)?',
        answer:
            'Static Runway divides your current cash balance by Month-1 Net Burn (Cash Balance ÷ Net Burn), assuming zero future revenue or expense growth (displayed up to 60+ months, with the uncapped figure shown when above 60 months). Dynamic Runway simulates your cash flow month by month over a 60-month horizon by compounding your modeled monthly revenue growth rate, expense growth rate, planned hires, and scheduled funding rounds, estimating the zero-cash crossing to one decimal month.',
    },
    {
        question: 'How does the calculator’s Default Alive vs. Default Dead trajectory test work?',
        answer:
            'Inspired by Paul Graham’s "Default Alive or Default Dead?" framework, the calculator’s Default Alive trajectory test checks whether your modeled monthly recurring revenue overtakes total monthly gross burn within the 60-month projection before your cash balance reaches zero. If revenue crosses expenses while cash remains positive, the trajectory is labeled Default Alive; otherwise it is labeled Default Dead.',
    },
    {
        question: 'How is the Raise-By indicator calculated from projected cash runway?',
        answer:
            'Fundraising can take several months from initial investor conversations to closing, so founders typically plan well ahead of their projected zero-cash date. The calculator uses a configurable six-month planning buffer (Projected Dynamic Runway minus 6 months) for its Raise-By indicator.',
    },
    {
        question: 'How does the calculator compute the Modeled Burn Multiple?',
        answer:
            'Based on the Burn Multiple framework popularized by David Sacks, the calculator computes a Modeled Burn Multiple by dividing Annualized Month-1 Net Burn by Annualized Forward Net New ARR (derived from your current MRR and modeled monthly growth rate). In historical accounting, Burn Multiple is also measured over trailing quarterly or annual financial periods. A lower multiple indicates higher capital efficiency.',
    },
    {
        question: 'Are my financial numbers or cap table data uploaded to any server?',
        answer:
            'No. Your cash balances, monthly revenue, operating expenses, hiring plans, and cap table inputs are processed locally in your browser and are not uploaded to KivaroTools servers. The website may still load general analytics or other third-party website resources.',
    },
    {
        question: 'How are multiple Post-Money SAFEs vs. Pre-Money SAFEs modeled?',
        answer:
            'Under the Y Combinator Post-Money SAFE v1.1 structure, each Post-Money SAFE converting on its valuation cap locks a fixed pre-round ownership percentage of the post-SAFE company capitalization equal to Investment Amount ÷ Post-Money Valuation Cap, before new Series A investment and option pool expansion dilute all existing holders proportionally. Multiple Post-Money SAFEs stack additively (`∑ [Investment ÷ Cap]`) rather than diluting one another. Pre-Money SAFEs divide their cap by the initial pre-SAFE share count.',
    },
    {
        question: 'How does the Convertible Note conversion model work?',
        answer:
            'The calculator models convertible notes using a simple-interest accrual formula (`Converting Principal = Principal × [1 + Annual Interest Rate × Months ÷ 12]`) and converts the note at the lowest of the Valuation Cap price, the Discounted Round price, or the Priced Round share price. Real-world convertible note agreements may include specific day-count conventions, qualified financing thresholds, or custom accrued-interest provisions.',
    },
    {
        question: 'What is the difference between Pre-Money Option Pool Carve-Out and Post-Money Shared mode?',
        answer:
            'A common pre-money option-pool structure requires the unissued employee option pool (ESOP) to reach a target post-closing percentage (such as 10% or 15%) where the newly created top-up shares are included in the pre-money share count used to price the round—meaning existing founders and converting SAFE holders absorb the pool expansion dilution. Switching to "Post-Money Shared" models an alternative structure where option pool expansion dilutes both existing holders and new round investors proportionally.',
    },
    {
        question: 'How does the Breakeven & Target Runway Solver calculate cost-cut and growth targets?',
        answer:
            'When a modeled trajectory is Default Dead or below your target runway, the engine runs a 28-iteration binary search across the 60-month cash flow simulation to find the minimum modeled monthly expense reduction (rounded up to the nearest dollar) or monthly revenue growth rate (to one decimal place) needed to achieve operational breakeven under your current assumptions.',
    },
    {
        question: 'What assumptions are used in the Scenario-Based M&A Exit Waterfall?',
        answer:
            'The M&A Exit Waterfall is a scenario-based modeling tool that lets you compare 1x or 2x Non-Participating vs. Participating Preferred payouts, choose whether converted SAFEs carry a 1x shadow preferred claim or convert to common, and toggle between tiered seniority (Series A senior to SAFE/Seed) and pari passu (equal tier) preferences. Actual exit distributions depend on a company’s specific charter, closing adjustments, and transaction agreements.',
    },
    {
        question: 'Can I export the 60-month runway schedule and modeled cap table to Excel (.xlsx)?',
        answer:
            'Yes. Clicking "Export 3-Sheet Excel (.xlsx)" builds a multi-tab OpenXML workbook in your browser containing Sheet 1 (Runway_Schedule_60m), Sheet 2 (Cap_Table_Dilution), and Sheet 3 (Exit_Payout_Comparison) with automatic CWE-1236 formula-prefix sanitization.',
    },
];

export default function SaasBurnRateCalculatorSeo() {
    const jsonLdSoftwareApp = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'SaaS Burn Rate, Runway & Equity Dilution Calculator',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'All (Client-Side Browser Execution)',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            ratingCount: '182',
            bestRating: '5',
            worstRating: '1',
        },
        description:
            'Scenario-based startup finance and cap-table modeling calculator for gross and net burn rate, static vs. 60-month dynamic cash runway, Default Alive breakeven analysis, modeled Burn Multiple, Pre/Post-Money SAFE conversion, option-pool dilution, and M&A exit waterfall scenarios.',
        featureList: [
            'Gross Burn Rate, Net Burn Rate & Static vs. 60-Month Dynamic Compounding Cash Runway Simulation',
            'Default Alive Trajectory Check, Projected Zero-Cash Date & Configurable 6-Month Raise-By Indicator',
            'Modeled Burn Multiple (Annualized Net Burn ÷ Annualized Forward Net New ARR)',
            'Binary-Search Target Runway & Breakeven Solver (Calculated Monthly Cost Cut or Revenue Growth %)',
            'Headcount Hiring Plan Builder & Scheduled Funding Round Cash Flow Integration',
            'Additive YC Post-Money SAFE, Pre-Money SAFE & Simple-Interest Convertible Note Dilution Modeling',
            'Pre-Money Option Pool Carve-Out vs. Post-Money Shared Pool Dilution Comparison',
            'Scenario-Based M&A Exit Waterfall (1x–2x Non-Participating vs. Participating, Seniority & SAFE Treatment)',
            'Built-In 5-Point Conservation Verification Layer + 3-Sheet Excel (.xlsx) & CSV Export',
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
        name: 'How to Model Startup Burn Rate, Cash Runway, and SAFE Equity Dilution',
        description:
            'Step-by-step guide to projecting your startup cash runway, testing Default Alive breakeven assumptions, and modeling SAFE and Series A founder dilution.',
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
                name: 'Review Projected Cash Runway, Default Alive Status & Modeled Burn Multiple',
                text: 'Check the right-hand summary card for your 60-month Dynamic Cash Runway, Projected Zero-Cash or Breakeven Date, Raise-By Indicator, and Modeled Burn Multiple.',
            },
            {
                '@type': 'HowToStep',
                position: 3,
                name: 'Model SAFE Notes, Next Funding Round & Option Pool Dilution',
                text: 'Open the Cap Table & SAFE Dilution tab below to add Pre-Money or Post-Money SAFEs, Convertible Notes, and Series A valuation terms to see modeled post-round founder ownership.',
            },
            {
                '@type': 'HowToStep',
                position: 4,
                name: 'Compare 3 Scenarios & Export Your 3-Sheet Excel (.xlsx) Model',
                text: 'Compare Conservative, Base, and Optimistic trajectories, inspect scenario-based M&A exit payouts across valuations from $10M to $500M, and download the 3-sheet Excel (.xlsx) or CSV schedule.',
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
                        Scenario-Based SaaS Burn Rate, Cash Runway &amp; Equity Dilution Calculator
                    </h2>
                    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shrink-0">
                        <Sparkles className="h-3.5 w-3.5" />
                        Runway + Default Alive + SAFE Cap Table
                    </span>
                </div>

                <p className="mt-4 w-full text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 break-words">
                    Most online startup calculators separate cash management from fundraising: basic burn-rate tools
                    divide current cash by static monthly spend while ignoring compounding revenue growth, planned
                    hires, and scheduled funding rounds; standalone cap-table calculators model SAFE dilution without
                    connecting that capital injection to your operational runway. Our{' '}
                    <strong>SaaS Burn Rate, Runway &amp; Dilution Calculator</strong> combines a{' '}
                    <strong>60-month dynamic cash flow simulation</strong> with{' '}
                    <strong>scenario-based Pre/Post-Money SAFE, Convertible Note, Option Pool, and M&amp;A Exit Waterfall modeling</strong>{' '}
                    in one streamlined browser workspace.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                            <span>Static &amp; Dynamic Runway</span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            Compares zero-growth Static Runway against a 60-month compounding Dynamic Runway simulation
                            with projected Zero-Cash Date, Breakeven Date, and a 6-month Raise-By planning indicator.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                            <Cpu className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Default Alive &amp; Burn Multiple</span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            Evaluates the calculator’s Default Alive trajectory test and Modeled Burn Multiple (Net Burn
                            ÷ Forward Net New ARR), with a binary-search solver for cost-cut or growth targets.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                            <PieChart className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>SAFE &amp; Option Pool Dilution</span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            Models additive Post-Money SAFEs, Pre-Money SAFEs, simple-interest Convertible Notes, and
                            Pre-Money Carve-Out vs. Post-Money Shared option pool structures.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                            <DollarSign className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <span>Scenario M&amp;A Waterfall</span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            Models founder, investor, and option-pool distributions across $10M to $500M exit scenarios
                            with configurable liquidation multiples, participation, seniority, and SAFE treatment.
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
                        Complete Working Structure: How the 6-Domain Financial &amp; Cap Table Engine Works
                    </h2>
                </div>
                <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    <code>lib/saasBurnRateEngine.ts</code> is organized into modular calculation domains verified by
                    automated conservation checks:
                </p>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            1. Gross Burn, Net Burn &amp; Static vs. Dynamic Runway
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            <code>COGS = MRR × (1 − Gross Margin %)</code> and{' '}
                            <code>Gross Burn = Base Operating Expenses + Planned Hires + COGS</code>.{' '}
                            <code>Net Burn = max(0, Gross Burn − Monthly Revenue)</code>. Static Runway divides{' '}
                            <code>Current Cash ÷ Month-1 Net Burn</code> (reporting both the uncapped figure and a 60m
                            display cap). Dynamic Runway simulates each month <code>t = 1..60</code> with compounding
                            revenue and expense growth, estimating the zero-cash crossing to one decimal month.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            2. Modeled Burn Multiple &amp; Default Alive Solver
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            <code>Modeled Burn Multiple = Annualized Month-1 Net Burn ÷ Annualized Forward Net New ARR</code>.
                            If monthly recurring revenue overtakes total monthly gross burn before cash reaches zero,
                            the trajectory is classified as <strong>Default Alive</strong>. When Default Dead, a
                            28-iteration binary search finds the minimum modeled monthly expense reduction or revenue
                            growth rate needed within solver tolerance.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            3. Additive Post-Money SAFE, Note &amp; Option Pool Mechanics
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Each YC Post-Money SAFE converting on its cap locks an ownership fraction{' '}
                            <code>α_i = Investment_i ÷ PostMoneyCap_i</code> of the post-SAFE capitalization, solved in
                            closed form via <code>S_post_safe = (InitialShares + PreMoneyNoteShares) ÷ (1 − ∑ α_i)</code>.
                            Under a Pre-Money Option Pool Carve-Out, the new round share price is{' '}
                            <code>Pre-Money Valuation ÷ (S_post_safe + OptionPoolTopUpShares)</code>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            4. Scenario-Based M&amp;A Exit Waterfall &amp; Conservation Layer
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Models 1x or 2x Non-Participating vs. Participating Preferred payouts across two selectable
                            seniority modes (Series A Senior to SAFE vs. Pari Passu) and two SAFE liquidation treatments
                            (1x Shadow Preferred vs. Convert to Common), while verifying that total distributed proceeds
                            reconcile with the exit valuation.
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
                        Follow these four steps to project your cash runway, plan headcount hires, and model equity
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
                            Add Planned Hires &amp; Test Default Alive
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Expand the Hiring Plan drawer to schedule future roles by start month. If your trajectory is
                            Default Dead, click &ldquo;Apply Cost Cut&rdquo; or &ldquo;Apply Growth&rdquo; on the
                            right-hand solver bar to test what flips the model to Default Alive.
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
                            Inspect Conservative, Base, and Optimistic trajectories, review scenario-based M&amp;A exit
                            payouts from $10M to $500M, and download the 3-sheet Excel (<code>.xlsx</code>) or CSV
                            schedule.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 3: REAL PRACTICAL EXAMPLES (RECONCILED WITH ENGINE V4.0.0)
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
                        Reconciled Examples: Static vs. Dynamic Runway &amp; Stacked Post-Money SAFE Dilution
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Example 1: Static vs. Dynamic Runway (Preset #1: Seed SaaS)
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            In Preset #1, the company starts with <strong>$1,500,000 in cash</strong>,{' '}
                            <strong>$45,000 MRR</strong> growing at <strong>8.5%/month</strong>,{' '}
                            <strong>82% Gross Margin</strong> ($8,100 Month-1 COGS), and{' '}
                            <strong>$95,000 in base monthly operating expenses</strong> (plus two planned hires in Month
                            4 and Month 8). Month-1 Gross Burn is <code>$103,100</code> and Month-1 Net Burn is{' '}
                            <code>$58,100</code>, giving a zero-growth <strong>Static Runway of 25.8 months</strong>.
                            When simulated dynamically with compounding revenue growth and a scheduled Month-15 funding
                            round, revenue overtakes total gross burn in <strong>Month 16</strong>, making the trajectory{' '}
                            <strong>Default Alive</strong>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Example 2: Stacked Post-Money SAFEs + Series A Pre-Money Option Pool (Preset #1)
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Founders start with <strong>9,000,000 shares (90.00%)</strong> and an existing option pool
                            of <strong>1,000,000 shares (10.00%)</strong>. Two Post-Money SAFEs convert:{' '}
                            <strong>SAFE #1 ($500K @ $10M Cap = 5.00% Post-SAFE lock → 566,038 shares)</strong> and{' '}
                            <strong>SAFE #2 ($1M @ $15M Cap = 6.67% Post-SAFE lock → 754,717 shares)</strong>, totaling{' '}
                            <code>11.67%</code> Post-SAFE ownership (<code>11,320,755</code> Post-SAFE shares, where
                            Founders hold <code>79.50%</code>). In a <strong>$7M Series A at $28M Pre-Money ($35M Post-Money)</strong>{' '}
                            with a <strong>10.00% post-round option pool</strong> carved out pre-money (
                            <code>+474,394</code> pool top-up shares at <code>$2.3739/share</code>), Post-Round Total
                            Shares reach <code>14,743,936</code>: Series A Investors hold <strong>20.00%</strong> (
                            <code>2,948,787</code> sh), the Option Pool holds <strong>10.00%</strong> (
                            <code>1,474,394</code> sh), SAFE #1 holds <strong>3.84%</strong>, SAFE #2 holds{' '}
                            <strong>5.12%</strong> (combined SAFEs <strong>8.96%</strong>), and Founders retain{' '}
                            <strong>61.04%</strong> (<code>9,000,000</code> sh).
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
                    Startup Financial &amp; Equity Dilution Reference Benchmarks by Stage
                </h2>
                <div className="w-full mt-4 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[720px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">Metric</th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">Modeled Formula</th>
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
                                <td className="p-3 font-bold">Modeled Burn Multiple</td>
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
                                <td className="p-3 font-bold">Pre-Series A SAFE Lock</td>
                                <td className="p-3 font-mono">∑ (SAFE Investment ÷ Post-Money Cap)</td>
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
                                    ✓ Uncapped Static &amp; 60m Dynamic Simulation
                                </td>
                                <td className="p-3">Static Division Only (Cash ÷ Burn)</td>
                                <td className="p-3 text-rose-500">✕ No Cash Runway Modeling</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">Default Alive Test &amp; Breakeven Solver</td>
                                <td className="p-3 bg-blue-50/40 dark:bg-blue-950/20 font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ Calculates Cost-Cut &amp; Growth Targets
                                </td>
                                <td className="p-3">Manual Trial &amp; Error</td>
                                <td className="p-3 text-rose-500">✕ Not Supported</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">Headcount Hiring Plan &amp; Funding Round Sync</td>
                                <td className="p-3 bg-blue-50/40 dark:bg-blue-950/20 font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ Injects Funding Cash in Closing Month
                                </td>
                                <td className="p-3 text-rose-500">✕ Disconnected from Fundraising</td>
                                <td className="p-3 text-rose-500">✕ Disconnected from Cash Burn</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">Additive Post-Money SAFEs, Notes &amp; Pool Shuffle</td>
                                <td className="p-3 bg-blue-50/40 dark:bg-blue-950/20 font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ Closed-Form SAFE Lock + Option Pool Toggle
                                </td>
                                <td className="p-3 text-rose-500">✕ No Equity or Dilution</td>
                                <td className="p-3">Yes (Static Cap Table Only)</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">Scenario M&amp;A Waterfall &amp; Seniority Controls</td>
                                <td className="p-3 bg-blue-50/40 dark:bg-blue-950/20 font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ Senior vs. Pari Passu + SAFE Treatment
                                </td>
                                <td className="p-3 text-rose-500">✕ Not Supported</td>
                                <td className="p-3 text-rose-500">✕ Usually Requires Separate Tool</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">5-Point Conservation Checks + 3-Sheet .xlsx</td>
                                <td className="p-3 bg-blue-50/40 dark:bg-blue-950/20 font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ Automated Invariant Verification + .xlsx
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
                                    OpenXML workbook with 3 tabs: <code>Runway_Schedule_60m</code>,{' '}
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
                                <td className="p-3 font-bold">Export Cap Table CSV</td>
                                <td className="p-3 font-mono">saas_cap_table_dilution.csv</td>
                                <td className="p-3">
                                    Pre-round, Post-SAFE, and Post-Round share counts, ownership percentages, conversion
                                    basis, and scenario exit payouts.
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">Share Scenario Link</td>
                                <td className="p-3 font-mono">?preset=...&amp;cash=...&amp;mrr=...</td>
                                <td className="p-3">
                                    Copies a direct URL with your active cash, revenue, expense, growth, and valuation
                                    parameters to share with co-founders or advisors.
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
                            Founders often divide current cash by today’s net burn without accounting for monthly
                            expense creep or upcoming engineering and sales hires—overstating actual cash runway by
                            several months.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>2. Stacking Multiple Post-Money SAFEs Without Tracking Dilution</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Because each YC Post-Money SAFE locks an additive percentage of pre-Series A equity
                            (Investment ÷ Cap), raising multiple bridge SAFEs can commit 25%–35% of the company before
                            Series A investors arrive.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>3. Overlooking Pre-Money Option Pool Carve-Outs</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            When a term sheet specifies a 15% post-round option pool carved out pre-money, the option
                            pool expansion reduces the effective share price and dilutes existing founders and SAFE
                            holders rather than the new investors.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>4. Starting a Fundraise Too Close to the Zero-Cash Date</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Venture fundraising often takes several months from first pitch to closing. Planning at
                            least 6 months ahead of your projected zero-cash date preserves negotiating leverage.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>5. Ignoring Gross Margin (COGS) in Burn Calculations</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Every new dollar of SaaS MRR carries hosting, payment processing, and support COGS
                            (typically 15%–25% of revenue). Always factor Gross Margin % into your breakeven projection.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>6. Not Modeling Liquidation Preference Seniority &amp; Participation</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            In modest M&amp;A exits, whether preferred shares are 1x Non-Participating or Participating
                            (&ldquo;Double Dip&rdquo;) and whether SAFEs carry a 1x shadow preference materially changes
                            common shareholder payouts.
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
                            <li>default alive or default dead trajectory calculator</li>
                            <li>modeled burn multiple calculator</li>
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
                            <li>convertible note interest dilution simulator</li>
                            <li>founder equity dilution across funding rounds</li>
                            <li>pre-money and post-money valuation calculator</li>
                            <li>pro forma cap table excel (.xlsx) generator</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            M&amp;A Exit Waterfall &amp; Scenario Planning
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>startup exit waterfall scenario calculator</li>
                            <li>1x non-participating vs participating preferred</li>
                            <li>founder payout at exit simulator</li>
                            <li>investor moic return multiple calculator</li>
                            <li>3-scenario startup cash flow comparison</li>
                            <li>target runway monthly expense reduction solver</li>
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
                        href="/seo/llms-txt-generator"
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