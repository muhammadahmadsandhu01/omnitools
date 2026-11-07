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
    Activity,
} from 'lucide-react';

export interface FaqItem {
    question: string;
    answer: string;
}

export const SAAS_BURN_RATE_CALCULATOR_FAQS: FaqItem[] = [
    {
        question: 'How is startup cash runway calculated and why do simple calculators get it wrong?',
        answer:
            'Basic bank calculators divide current cash by static monthly net burn (Runway = Cash Balance ÷ [Expenses - Revenue]). In reality, SaaS revenue compounds monthly across New MRR, Expansion MRR, and Gross Churn, while expenses step up with engineering hires, cloud/LLM inference COGS, and venture debt amortization. Our 60-month cohort engine simulates each month sequentially and uses exact fractional interpolation when cash crosses zero.',
    },
    {
        question: 'What is Paul Graham’s "Default Alive vs. Default Dead" test and the Fatal Pinch?',
        answer:
            'Popularized by Y Combinator co-founder Paul Graham in his 2015 essay "Default Alive or Default Dead?", the test asks: assuming your current revenue growth rate and expense trajectory continue, will your startup reach cash-flow profitability before running out of money in the bank? If yes, you are Default Alive. If no, you are Default Dead. The "Fatal Pinch" occurs when a company is Default Dead with fewer than 6 to 9 months of runway left—leaving insufficient time to close a typical 6-month institutional venture round.',
    },
    {
        question: 'How does the 1-Click "Flip to Default Alive" Breakeven Solver work?',
        answer:
            'When a startup is Default Dead, our engine runs a 28-iteration deterministic binary search across the 60-month cash flow model to compute two exact survival levers: (1) the minimum immediate percentage and dollar reduction in monthly Operating Expenses (OpEx), or (2) the minimum compound monthly New MRR growth rate required to reach cash breakeven while preserving your configured minimum safety cash buffer.',
    },
    {
        question: 'What is the David Sacks Burn Multiple and how does it differ from Bessemer’s Efficiency Score?',
        answer:
            'Introduced by Craft Ventures co-founder David Sacks, the Burn Multiple measures capital efficiency by dividing Annualized Net Burn by Annualized Net New ARR (Burn Multiple = Net Burn ÷ Net New ARR). It answers how many dollars a startup burns to generate $1 of new recurring revenue. A Burn Multiple under 1.0x is considered Elite, 1.0x–1.5x is Great, 1.5x–2.0x is Good, 2.0x–3.0x is Suspect, and above 3.0x indicates overburning. Bessemer’s Efficiency Score is the mathematical reciprocal (Net New ARR ÷ Net Burn).',
    },
    {
        question: 'Are my financial actuals, payroll figures, or cap table numbers uploaded to any server?',
        answer:
            'No. Your financial inputs, historical CSV/JSON actuals, hiring plans, SAFE notes, and cap table share counts are processed locally in your browser and are not uploaded to KivaroTools servers. The website may still load general analytics or other third-party website resources.',
    },
    {
        question: 'What is the difference between a YC Post-Money SAFE (v1.1) and a Pre-Money SAFE?',
        answer:
            'In the Y Combinator Post-Money SAFE (standard since 2018), each SAFE investor locks in an exact ownership percentage of the company prior to the next priced round equal to Investment ÷ Post-Money Valuation Cap. Multiple Post-Money SAFEs do not dilute each other—their dilution falls entirely on the founders and existing common/option holders. In an older Pre-Money SAFE, the Valuation Cap excludes converting SAFEs, meaning multiple Pre-Money SAFEs dilute one another alongside the founders.',
    },
    {
        question: 'What is the Series A "Option Pool Shuffle" and how does it dilute founders?',
        answer:
            'When Series A investors offer a term sheet (for example, $7.5M investment on a $32M pre-money valuation) with a requirement for a 10% or 15% post-closing unissued employee option pool (ESOP), standard VC practice carves the new option pool top-up shares out of the pre-money valuation ("Pre-Money Shuffle"). This lowers the effective Price Per Share (PPS) of the round and forces existing founders and converting SAFE holders—rather than the new Series A investors—to absorb 100% of the option pool expansion.',
    },
    {
        question: 'How does an MFN (Most Favored Nation) clause work across stacked SAFEs?',
        answer:
            'An MFN provision entitles an earlier SAFE investor to inherit any more favorable conversion terms (such as a lower Valuation Cap or higher Discount Rate) granted to subsequent convertible investors prior to a priced equity round. Our algebraic cap table solver includes an automatic MFN resolution pass that scans all chronological SAFE tranches and upgrades MFN-enabled instruments automatically.',
    },
    {
        question: 'Why do AI SaaS startups have different Gross Margin dynamics than traditional B2B SaaS?',
        answer:
            'Classical B2B SaaS products typically achieve 75%–85% gross margins because hosting incremental database rows is nearly free. AI SaaS applications incur variable per-query LLM API token inference costs and dedicated GPU cluster overhead ("AI Supernova Margin Compression", often 25%–55% gross margin per Bessemer and a16z benchmarks). Our AI Token COGS module models active AI customers, queries per user, cost per 1M tokens, prompt caching hit rates, and monthly LLM inference cost deflation ("LLMflation").',
    },
    {
        question: 'What is the difference between 1x Non-Participating and Participating Preferred in an M&A exit?',
        answer:
            'Under a standard 1x Non-Participating liquidation preference (used in 96.4% of institutional deals per Cooley/Equidam 2026 benchmarks), preferred investors choose either to take their 1x invested capital back OR convert their preferred shares into common stock to take their pro-rata ownership percentage—whichever pays more. Under Participating Preferred ("Double Dip"), investors first take their liquidation preference and then also share pro-rata in the remaining proceeds alongside common shareholders, unless limited by a participation cap (e.g., 2x or 3x).',
    },
    {
        question: 'How is the Voluntary Conversion Breakpoint calculated in an M&A Exit Waterfall?',
        answer:
            'For a 1x Non-Participating preferred class, the Voluntary Conversion Breakpoint is the exact net exit valuation at which converting to common stock yields more money than taking the fixed liquidation preference: Breakpoint Valuation = Liquidation Preference Claim ÷ As-Converted Ownership Percentage. Above this valuation, the class voluntarily converts to common stock.',
    },
    {
        question: 'How does the 1,000-Trial Seeded Monte Carlo Runway Simulator work?',
        answer:
            'Instead of relying on a single deterministic growth guess, Tab 4 runs 1,000 stochastic 60-month simulations using a deterministic Mulberry32 pseudo-random number generator (PRNG) and Box-Muller Gaussian shocks across monthly New MRR Growth, Gross Churn, and OpEx slippage. It outputs exact P10 (Bear), P25, P50 (Median), and P90 (Bull) runway percentiles plus your overall Probability of Reaching Default Alive (%).',
    },
    {
        question: 'How are Founder Secondary Sales at Series A/B modeled on the cap table?',
        answer:
            'In oversubscribed Series A or Series B rounds, founders sometimes sell a portion of their vested common shares directly to incoming institutional investors for immediate personal liquidity. Our engine deducts the secondary shares sold at the round Price Per Share from the founder’s common stake and transfers them to the incoming investor class without issuing new dilutive primary shares.',
    },
    {
        question: 'How are SaaS Magic Number, CAC Payback Period, and LTV:CAC calculated?',
        answer:
            'SaaS Magic Number equals Annualized Quarterly Net New ARR divided by Prior Quarter Sales & Marketing (S&M) spend (target ≥ 0.75x). Gross-Margin Adjusted CAC Payback Period measures how many months of new gross profit are required to recover S&M Customer Acquisition Cost (CAC). LTV:CAC divides Customer Lifetime Value (ARPU × Blended Gross Margin % ÷ Monthly Gross Churn Rate) by CAC (target ≥ 3.0x).',
    },
    {
        question: 'What is CWE-1236 Spreadsheet Formula Injection protection in the CSV and Excel (.xlsx) exports?',
        answer:
            'When stakeholder names or notes are exported to CSV or Excel (.xlsx), strings beginning with =, +, -, @, or | can be interpreted by Microsoft Excel or Google Sheets as executable formulas (CWE-1236). Our export engine sanitizes formula prefixes while preserving legitimate negative financial numbers, and builds a native 3-sheet OpenXML .xlsx workbook directly in browser memory.',
    },
    {
        question: 'Can I import my existing monthly MRR and Expense numbers from Stripe, QuickBooks, or Mercury?',
        answer:
            'Yes. In Tab 1, you can upload or paste any CSV or JSON table of historical monthly MRR, Operating Expenses, and Ending Cash. The engine automatically computes your historical compound monthly growth rate and departmental OpEx split to calibrate your 60-month forecast in one click.',
    },
];

export default function SaasBurnRateCalculatorSeo() {
    const jsonLdSoftwareApp = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'SaaS Burn Rate, Runway & Cap Table Dilution Simulator',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'All (100% Client-Side Browser Execution)',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description:
            'Simulate 60-month SaaS & AI cash runway, Paul Graham Default Alive/Dead breakeven, David Sacks Burn Multiple, YC Post-Money SAFE v1.1 dilution, Series A Option Pool Shuffles, M&A Exit Waterfalls, and 1,000-run Monte Carlo survival 100% locally in your browser.',
        featureList: [
            '60-Month Cohort MRR Waterfall (New, Expansion, Churn, NRR/GRR) & AI SaaS LLM Token Inference COGS',
            'Paul Graham Default Alive vs. Default Dead Test & 1-Click Deterministic Binary-Search Breakeven Solver',
            'David Sacks Burn Multiple, Bessemer Efficiency Score, SaaS Magic Number, CAC Payback & Rule of 40',
            'Algebraic YC Post-Money SAFE v1.1, Pre-Money SAFE, Convertible Note, MFN & Option Pool Shuffle Solver',
            'Individual Co-Founder 4-Year Vesting (1-Year Cliff) & Series A/B Founder Secondary Cash-Out Simulator',
            'M&A Exit Waterfall & Liquidation Preference Breakpoint Solver (1x–3x Non-Participating, Participating & Capped)',
            '1,000-Trial Seeded Monte Carlo Runway Simulator & 5x5 2D Sensitivity Heatmaps',
            '12-Point Venture Readiness & Term Sheet Risk Linter with 1-Click Auto-Fix',
            '10-Format Export Suite including 3-Tab Native Excel (.xlsx), CWE-1236 Guarded CSVs, Board Deck Markdown & HTML',
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
        name: 'How to Calculate SaaS Cash Runway, Default Alive Breakeven, and SAFE Cap Table Dilution Online',
        description:
            'Step-by-step guide to modeling 60-month SaaS cohort cash runway, AI LLM token inference COGS, YC Post-Money SAFE v1.1 dilution, Series A option pool shuffles, and M&A exit waterfalls in your browser.',
        step: [
            {
                '@type': 'HowToStep',
                position: 1,
                name: 'Select a Benchmark Startup Preset or Import Historical CSV/JSON Actuals',
                text: 'Choose one of the 6 startup presets (such as YC Seed AI SaaS) or paste your historical monthly MRR, OpEx, and Cash rows in Tab 1 to calibrate baseline growth and burn.',
            },
            {
                '@type': 'HowToStep',
                position: 2,
                name: 'Configure Stacked SAFEs, Convertible Notes & Series A/B Option Pool Shuffle',
                text: 'Open Tab 2 to add Pre-Money or YC Post-Money SAFEs, Convertible Notes, Co-Founder 4-year vesting, and Series A/B terms to compute exact share prices and dilution.',
            },
            {
                '@type': 'HowToStep',
                position: 3,
                name: 'Simulate M&A Exit Waterfalls, 1,000 Monte Carlo Runs & 12-Point Linter',
                text: 'Inspect liquidation preference breakpoints in Tab 3, P10/P50/P90 Monte Carlo runway percentiles and 5x5 sensitivity heatmaps in Tab 4, and 1-Click Auto-Fix in Tab 5.',
            },
            {
                '@type': 'HowToStep',
                position: 4,
                name: 'Export the 3-Tab Excel (.xlsx) Workbook & Investor Board Deck',
                text: 'Open Tab 6 to download the native 3-sheet OpenXML Excel (.xlsx) model, CWE-1236 guarded CSV ledgers, Markdown/HTML board reports, or Python verification script.',
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
          SECTION 1: EXECUTIVE OVERVIEW & UNIFIED CFO + CAP TABLE ARCHITECTURE
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
                        Client-Side SaaS Burn Rate, Runway, SAFE Dilution &amp; Exit Waterfall Studio
                    </h2>
                    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shrink-0">
                        <Sparkles className="h-3.5 w-3.5" />
                        Default Alive + YC SAFE v1.1 + Monte Carlo
                    </span>
                </div>

                <p className="mt-4 w-full text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 break-words">
                    Traditional startup calculators force founders and CFOs into two disconnected silos: basic bank
                    runway calculators divide cash by static net burn while ignoring SaaS cohort retention, AI token
                    inference costs, and future equity rounds; standalone cap table calculators compute static SAFE
                    conversions without linking fundraising timing or proceeds to your operational cash runway. Our{' '}
                    <strong>SaaS Burn Rate, Runway &amp; Dilution Simulator</strong> unites a{' '}
                    <strong>60-month cohort-driven FP&amp;A cash flow engine</strong> with an{' '}
                    <strong>exact algebraic Pre/Post-Money SAFE, Option Pool Shuffle, and M&amp;A Exit Waterfall solver</strong>{' '}
                    100% locally in your browser.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                            <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <span>Closed-Loop Cash + Equity</span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            Scheduling a future SAFE, Series A, or Series B round injects net cash into your 60-month
                            runway curve at the exact closing month while simultaneously solving founder dilution.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                            <Cpu className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>AI SaaS LLM Token COGS</span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            Models per-customer LLM query volume, blended cost per 1M tokens, prompt caching hit rates,
                            fixed GPU clusters, and monthly LLMflation cost deflation.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                            <PieChart className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>YC SAFE v1.1 &amp; Pool Shuffle</span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            Solves stacked Pre-Money &amp; Post-Money SAFEs, Convertible Notes with accrued interest,
                            MFN auto-upgrades, and Series A pre-money option pool shuffles without circular errors.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                            <Activity className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                            <span>1,000-Run Monte Carlo</span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            Executes 1,000 seeded stochastic 60-month simulations across growth, churn, and OpEx
                            volatility to output P10/P50/P90 runway percentiles and Default Alive survival odds.
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
                    <Cpu className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2
                        id="saas-burn-rate-working-structure"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Complete Working Structure: How the Deterministic Financial &amp; Cap Table Engine Works
                    </h2>
                </div>
                <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Every calculation in <code>lib/saasBurnRateEngine.ts</code> executes synchronously in browser memory
                    across five deterministic mathematical pipelines:
                </p>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            1. 60-Month Cohort MRR, Upfront Billing &amp; AI COGS Pipeline
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            For each month <code>t = 1..60</code>, the engine decomposes ending MRR into{' '}
                            <code>Beginning MRR + New MRR + Expansion MRR - Churned MRR</code>, adds upfront cash
                            collections from annual billing contracts, subtracts base SaaS hosting COGS plus dynamic AI
                            LLM token inference costs, and layers departmental R&amp;D, S&amp;M, G&amp;A, hiring plan
                            payroll step-functions, and venture debt amortization.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            2. Paul Graham Default Alive &amp; Binary-Search Breakeven Solver
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            When cash crosses zero before operational revenue covers gross burn, exact fractional runway
                            is interpolated via <code>(t - 1) + (BeginningCash_t / MonthlyDeficit_t)</code>. A
                            28-iteration binary search then solves for the exact immediate OpEx percentage cut or
                            minimum monthly New MRR growth rate required to reach cash-flow profitability with a safety
                            buffer.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            3. Fixed-Point Algebraic SAFE, Note &amp; Option Pool Shuffle Solver
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            First resolves Most Favored Nation (MFN) clauses across chronological SAFE tranches, then
                            runs a 40-iteration fixed-point algebraic solver to simultaneously determine Series A Round
                            Price Per Share (PPS), each SAFE/Note’s optimal Cap vs. Discount conversion price, exact
                            pre-money option pool top-up shares, and Founder Secondary share transfers.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            4. Multi-Tier M&amp;A Exit Waterfall &amp; Conversion Breakpoint Solver
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Deducts M&amp;A transaction fees and management carve-outs, sorts preferred classes by
                            seniority tier, and compares each class’s liquidation preference (or participation cap)
                            against its as-converted common value to determine whether it converts to common stock or
                            takes its preference across 7 exit valuations ($10M to $1B).
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 2B: COMPLETE STEP-BY-STEP USER GUIDE
          ============================================================================ */}
            <section
                aria-labelledby="saas-burn-rate-user-guide"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6"
            >
                <div>
                    <h2
                        id="saas-burn-rate-user-guide"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Complete Step-by-Step Guide: How to Model Your Runway, SAFE Dilution &amp; Exit Waterfall
                    </h2>
                    <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                        Follow these four steps to build an investor-ready SaaS financial and cap table model:
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                            Step 1 • Calibrate Runway
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Enter Cash, MRR &amp; AI COGS (or Paste CSV)
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Select one of the 6 benchmark startup presets or paste your historical monthly MRR and OpEx
                            CSV from Stripe/QuickBooks in Tab 1. Configure AI LLM token inference costs and planned
                            engineering/sales hires.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                            Step 2 • Stack SAFEs &amp; Series A
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Model SAFE Caps, Discounts &amp; Pool Shuffle
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Open Tab 2 to add your Pre-Money or YC Post-Money SAFEs, Convertible Notes, and Series A/B
                            terms. Toggle between Pre-Money Option Pool Shuffle and Post-Money Shared pool creation to
                            see the exact share price and founder ownership impact.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                            Step 3 • Stress-Test &amp; Lint
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Run 1,000 Monte Carlo Trials &amp; 12-Point Linter
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Inspect Tab 3 for M&amp;A Exit Waterfalls, Tab 4 for P10/P50/P90 Monte Carlo survival odds
                            and 5×5 sensitivity heatmaps, and Tab 5 to fix any flagged operational or term-sheet risks
                            with 1 click.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                            Step 4 • Export Data Room
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Download 3-Tab Excel (.xlsx) &amp; Board Deck
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Download the native 3-sheet OpenXML Excel workbook (<code>.xlsx</code>), CWE-1236 guarded
                            CSVs, Markdown/HTML Board Decks, or a reproducible Python verification script in Tab 6.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 3: REAL PRACTICAL EXAMPLES (WORKED MATHEMATICAL WALKTHROUGHS)
          ============================================================================ */}
            <section
                aria-labelledby="saas-burn-rate-real-examples"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Terminal className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2
                        id="saas-burn-rate-real-examples"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Real-World Mathematical Examples: YC Post-Money SAFE Dilution vs. Option Pool Shuffle
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Example A: Stacked YC Post-Money SAFEs + Series A Pre-Money Option Pool Shuffle
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Suppose Founders start with <code>9,000,000</code> shares and an existing option pool of{' '}
                            <code>1,000,000</code> shares (<code>10,000,000</code> initial shares). They raise two YC
                            Post-Money SAFEs: <strong>SAFE #1 ($500K @ $10M Cap = 5.0% lock)</strong> and{' '}
                            <strong>SAFE #2 ($1.5M @ $18M Cap = 8.33% lock)</strong>. Together, the SAFEs lock{' '}
                            <code>13.33%</code> of pre-Series A capitalization (<code>1,538,462</code> converted SAFE
                            shares). When raising a <strong>$7.5M Series A at $32M Pre-Money ($39.5M Post-Money)</strong>{' '}
                            with a <code>10%</code> post-round unissued option pool carved out pre-money, new Series A
                            investors receive exactly <code>$7.5M / $39.5M = 18.99%</code>, the unissued pool is topped
                            up to <code>10.00%</code>, and combined founder + existing early shares dilute to{' '}
                            <code>~61.4%</code>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Example B: 1x Non-Participating vs. 2x Participating Preferred at a $60M Exit
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Suppose Series A investors invested <strong>$10M for 25% ownership</strong>. Under a market
                            standard <strong>1x Non-Participating preference</strong>, their voluntary conversion
                            breakpoint is <code>$10M ÷ 25% = $40M</code>. At a <strong>$60M net exit</strong>, they
                            voluntarily convert to common stock and receive <code>25% × $60M = $15.0M</code>, leaving{' '}
                            <strong>$45.0M (75%)</strong> for founders and common holders. Under a predatory{' '}
                            <strong>2x Full Participating (&ldquo;Double Dip&rdquo;)</strong> term sheet, investors first take{' '}
                            <code>2 × $10M = $20M</code> preference and then take <code>25% × ($60M - $20M) = $10M</code>{' '}
                            participation for a total of <strong>$30.0M (50% of the exit)</strong>—cutting founder and
                            common payouts by $15M.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 4: INSTITUTIONAL SAAS & AI BENCHMARK MATRIX (2026 VC STANDARDS)
          ============================================================================ */}
            <section
                aria-labelledby="saas-burn-rate-benchmark-matrix"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <h2
                    id="saas-burn-rate-benchmark-matrix"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    Technical Reference: 2026 Venture Capital SaaS &amp; AI Efficiency Benchmarks
                </h2>
                <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Institutional investors evaluate startup efficiency across eight core operational and cap table
                    benchmarks:
                </p>

                <div className="w-full mt-4 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[740px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">Metric</th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">Formula</th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">Elite / Top Decile</th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">Median / Acceptable</th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">Red Flag / Risk Zone</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <td className="p-3 font-bold">David Sacks Burn Multiple</td>
                                <td className="p-3 font-mono">Annualized Net Burn ÷ Net New ARR</td>
                                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">&lt; 1.0x (Amazing)</td>
                                <td className="p-3">1.0x – 1.8x (Great/Good)</td>
                                <td className="p-3 text-rose-600 dark:text-rose-400">&gt; 2.5x (Overburning)</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">Annualized Net Dollar Retention (NRR)</td>
                                <td className="p-3 font-mono">(1 + Expansion% - GrossChurn%)^12</td>
                                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">&gt; 120% (Enterprise)</td>
                                <td className="p-3">105% – 115% (B2B SaaS)</td>
                                <td className="p-3 text-rose-600 dark:text-rose-400">&lt; 95% (Leaky Bucket)</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">SaaS GTM Magic Number</td>
                                <td className="p-3 font-mono">Quarterly Net New ARR ÷ Prior Q S&amp;M</td>
                                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">&gt; 1.0x</td>
                                <td className="p-3">0.75x – 1.0x</td>
                                <td className="p-3 text-rose-600 dark:text-rose-400">&lt; 0.5x</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">GM-Adjusted CAC Payback</td>
                                <td className="p-3 font-mono">S&amp;M Spend ÷ (New MRR × GM%)</td>
                                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">&lt; 12 Months</td>
                                <td className="p-3">12 – 18 Months</td>
                                <td className="p-3 text-rose-600 dark:text-rose-400">&gt; 24 Months</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">Blended Gross Margin (AI vs. SaaS)</td>
                                <td className="p-3 font-mono">(MRR - Hosting - LLM COGS) ÷ MRR</td>
                                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">75% – 85%+</td>
                                <td className="p-3">60% – 74% (Cached AI)</td>
                                <td className="p-3 text-rose-600 dark:text-rose-400">&lt; 50% (AI Supernova Trap)</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">Pre-Series A Stacked SAFE Lock</td>
                                <td className="p-3 font-mono">∑ (Post-Money SAFE ÷ Cap)</td>
                                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">10% – 18%</td>
                                <td className="p-3">18% – 25%</td>
                                <td className="p-3 text-rose-600 dark:text-rose-400">&gt; 32% (Excessive Dilution)</td>
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
                    Feature &amp; Architecture Comparison: KivaroTools vs. Bank Runway &amp; Cap Table Tools
                </h2>
                <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[760px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">Capability</th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800 bg-indigo-50/60 dark:bg-indigo-950/40 font-bold">
                                    KivaroTools Unified Studio
                                </th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">
                                    Bank Runway Calculators (Pilot / Mercury)
                                </th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">
                                    Standalone SAFE Tools (YC / Carta Free)
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <td className="p-3 font-bold">Closed-Loop Cash Runway + SAFE/Series A Sync</td>
                                <td className="p-3 bg-indigo-50/40 dark:bg-indigo-950/20 font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ Yes (60-Month Closed-Loop)
                                </td>
                                <td className="p-3 text-rose-500">✕ No Equity or Dilution</td>
                                <td className="p-3 text-rose-500">✕ No Cash Burn or Runway</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">AI SaaS LLM Token Inference COGS &amp; Caching</td>
                                <td className="p-3 bg-indigo-50/40 dark:bg-indigo-950/20 font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ Yes (Queries, Tokens, Cache %, Deflation)
                                </td>
                                <td className="p-3 text-rose-500">✕ Flat Expense Only</td>
                                <td className="p-3 text-rose-500">✕ Not Supported</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">1-Click Binary-Search Default Alive Solver</td>
                                <td className="p-3 bg-indigo-50/40 dark:bg-indigo-950/20 font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ Exact OpEx Cut % &amp; Min Growth %
                                </td>
                                <td className="p-3">Manual Trial &amp; Error</td>
                                <td className="p-3 text-rose-500">✕ Not Supported</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">Stacked Pre/Post-Money SAFEs + MFN + Pool Shuffle</td>
                                <td className="p-3 bg-indigo-50/40 dark:bg-indigo-950/20 font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ Exact Fixed-Point Algebraic Solver
                                </td>
                                <td className="p-3 text-rose-500">✕ Not Supported</td>
                                <td className="p-3">Partial (Often lacks MFN &amp; Secondary)</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">M&amp;A Exit Waterfall &amp; Conversion Breakpoints</td>
                                <td className="p-3 bg-indigo-50/40 dark:bg-indigo-950/20 font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ 1x–3x Non-Part, Participating &amp; Capped
                                </td>
                                <td className="p-3 text-rose-500">✕ Not Supported</td>
                                <td className="p-3 text-rose-500">✕ Requires Separate Paid Tool</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">1,000-Run Seeded Monte Carlo + 5×5 Heatmaps</td>
                                <td className="p-3 bg-indigo-50/40 dark:bg-indigo-950/20 font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ Included Free (P10/P50/P90)
                                </td>
                                <td className="p-3 text-rose-500">✕ Single-Line Only</td>
                                <td className="p-3 text-rose-500">✕ Not Supported</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold">3-Tab Native Excel (.xlsx) &amp; Board Deck Export</td>
                                <td className="p-3 bg-indigo-50/40 dark:bg-indigo-950/20 font-bold text-emerald-600 dark:text-emerald-400">
                                    ✓ 10 Formats (CWE-1236 Guarded)
                                </td>
                                <td className="p-3 text-rose-500">✕ Email Gate or None</td>
                                <td className="p-3">Basic CSV Only</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 6: 10 SUPPORTED EXPORT DELIVERABLES TABLE
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
                        10 Supported CFO, Investor Data Room &amp; Board Export Formats
                    </h2>
                </div>
                <div className="w-full mt-4 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[700px] w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">#</th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">Deliverable File</th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">Format / Spec</th>
                                <th className="p-3 border-b border-slate-200 dark:border-slate-800">Primary Use Case</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <td className="p-3 font-mono">01</td>
                                <td className="p-3 font-bold">saas_runway_captable_waterfall_model.xlsx</td>
                                <td className="p-3">OpenXML 3-Tab Workbook</td>
                                <td className="p-3">Complete 60m Cash Flow, Cap Table &amp; Exit Waterfall for Excel/Sheets</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono">02</td>
                                <td className="p-3 font-bold">cfo-board-runway-captable-report.md</td>
                                <td className="p-3">GitHub / Notion Markdown</td>
                                <td className="p-3">Quarterly Board Deck &amp; Investor Update narrative with Markdown tables</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono">03</td>
                                <td className="p-3 font-bold">60m-cash-flow-waterfall.csv</td>
                                <td className="p-3">UTF-8 BOM CSV (CWE-1236 Safe)</td>
                                <td className="p-3">Month-by-month MRR, COGS, AI Token costs, OpEx &amp; Cash Balance</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono">04</td>
                                <td className="p-3 font-bold">pro-forma-captable-safe-ledger.csv</td>
                                <td className="p-3">UTF-8 BOM CSV (CWE-1236 Safe)</td>
                                <td className="p-3">Stakeholder share counts, SAFE conversions &amp; dilution audit</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono">05</td>
                                <td className="p-3 font-bold">ma-exit-waterfall-payouts.csv</td>
                                <td className="p-3">UTF-8 BOM CSV (CWE-1236 Safe)</td>
                                <td className="p-3">Liquidation preference payouts, conversion breakpoints &amp; MOIC</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono">06</td>
                                <td className="p-3 font-bold">interactive-investor-board-deck.html</td>
                                <td className="p-3">Self-Contained HTML5</td>
                                <td className="p-3">Standalone dark-mode report for investor data rooms</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono">07</td>
                                <td className="p-3 font-bold">saas-financial-model-sha256.json</td>
                                <td className="p-3">JSON + SHA-256 Digest</td>
                                <td className="p-3">Full workspace state backup that can be re-imported in Tab 1</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono">08</td>
                                <td className="p-3 font-bold">verify_saas_runway_and_safe_math.py</td>
                                <td className="p-3">Python 3 Script</td>
                                <td className="p-3">Reproducible audit script for institutional due diligence</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono">09</td>
                                <td className="p-3 font-bold">shareable-url-query.txt</td>
                                <td className="p-3">URL Query Permalink</td>
                                <td className="p-3">Share model parameters with co-founders and advisors</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono">10</td>
                                <td className="p-3 font-bold">executive-term-sheet-runway-audit.txt</td>
                                <td className="p-3">Plain Text Audit Summary</td>
                                <td className="p-3">Quick copy-paste summary for Slack, email, or board memos</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 6B: 12-POINT VENTURE READINESS & TERM SHEET RISK LINTER RULES
          ============================================================================ */}
            <section
                aria-labelledby="saas-burn-rate-12-point-linter"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2
                        id="saas-burn-rate-12-point-linter"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        12-Point Venture Readiness, AI Margin &amp; Term Sheet Risk Linter (<code>runVentureReadinessLinter</code>)
                    </h2>
                </div>
                <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Tab 5 continuously inspects your operational runway and cap table terms against 12 institutional
                    venture rules:
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    {[
                        ['RUNWAY_001_FATAL_PINCH', 'Flags when runway drops below 9 months while Default Dead (<6m to raise).'],
                        ['BURN_002_CAPITAL_INEFFICIENCY', 'Flags when David Sacks Burn Multiple exceeds 2.5x Net Burn / Net New ARR.'],
                        ['SAFE_003_EXCESSIVE_POST_MONEY_STACK', 'Flags when stacked Post-Money SAFEs lock >32% ownership prior to Series A.'],
                        ['POOL_004_AGGRESSIVE_PREMONEY_SHUFFLE', 'Flags pre-money option pool shuffles >12.5% that shift dilution onto founders.'],
                        ['MFN_005_TRIGGERED_REPRICING', 'Detects when an earlier MFN SAFE inherits a lower valuation cap from a later bridge.'],
                        ['LIQ_006_PREDATORY_PREFERENCE_OVERHANG', 'Flags >1x liquidation multiples or Participating Preferred ("Double Dip") terms.'],
                        ['FOUNDER_007_OWNERSHIP_COMPRESSION', 'Flags when combined co-founder equity drops below 40% post-Series A.'],
                        ['CHURN_008_LEAKY_BUCKET', 'Flags monthly gross revenue churn >3.2%/mo (>32% annual logo/MRR erosion).'],
                        ['CAC_009_SUBOPTIMAL_GTM_MAGIC', 'Flags when SaaS Magic Number <0.6x or GM-adjusted CAC payback >22 months.'],
                        ['DEBT_010_VENTURE_DEBT_CLIFF', 'Flags when venture debt principal amortization accelerates zero-cash date.'],
                        ['AIMARGIN_011_TOKEN_COGS_TRAP', 'Flags when uncached LLM token inference pushes Blended Gross Margin <55%.'],
                        ['MONTECARLO_012_FRAGILE_SURVIVAL', 'Flags when 1,000-run Monte Carlo Default Alive probability falls below 65%.'],
                    ].map(([code, desc]) => (
                        <div
                            key={code}
                            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                        >
                            <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{code}</div>
                            <p className="mt-1 text-slate-600 dark:text-slate-400">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ============================================================================
          SECTION 7: TROUBLESHOOTING COMMON STARTUP RUNWAY & DILUTION TRAPS (6 SCENARIOS)
          ============================================================================ */}
            <section
                aria-labelledby="saas-burn-rate-troubleshooting"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <h2
                    id="saas-burn-rate-troubleshooting"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    Common SaaS Runway &amp; Term Sheet Mistakes and How to Fix Them
                </h2>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>1. Confusing Pre-Money vs. Post-Money SAFEs</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Founders often raise three separate Post-Money SAFEs ($500K at $5M, $1M at $10M, $1.5M at
                            $15M) without realizing they have already locked away <code>10% + 10% + 10% = 30%</code> of
                            the company before the Series A investor or option pool is even added.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>2. Accepting an Unjustified 15–20% Option Pool Shuffle</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Every extra percentage point added to the pre-money option pool at Series A comes 100% out
                            of existing shareholders. Build a bottom-up 18-month hiring plan in Tab 1 to prove you only
                            need a 10% post-round pool.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>3. Ignoring Uncached AI LLM Token Inference Costs</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Scaling MRR at 15%/mo while your blended gross margin sits at 35% due to uncached LLM API
                            calls accelerates net burn as you grow. Enable prompt caching (50%+) in Tab 1 to restore
                            SaaS-grade gross margins.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>4. Waiting Until 4 Months of Runway to Start Fundraising</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Institutional Series A/B rounds take 4 to 6 months from initial partner pitch to wire
                            transfer. Always track the <strong>Mandatory Raise-By Month</strong> (Zero-Cash Date minus 6
                            months) displayed in the KPI ribbon.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>5. Overlooking MFN Clauses When Raising a Down-Cap Bridge</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Issuing even a small $100K bridge SAFE at a lower valuation cap will automatically reprice
                            every earlier SAFE that contains an active Most Favored Nation (MFN) clause.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>6. Signing Participating Preferred (&ldquo;Double Dip&rdquo;) Term Sheets</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Participating preferred shares take their 1x–2x preference first and then still take their
                            ownership percentage of the remainder. Use Tab 3 to compare 1x Non-Participating vs.
                            Participating payouts before signing.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 8: SEARCH INTENT & WORKFLOW COVERAGE (30 TARGET KEYWORDS)
          ============================================================================ */}
            <section
                aria-labelledby="saas-burn-rate-keyword-coverage"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Search className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2
                        id="saas-burn-rate-keyword-coverage"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Supported Startup FP&amp;A, SaaS Runway &amp; Cap Table Dilution Workflows
                    </h2>
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            Runway, Default Alive &amp; Burn Multiple (10 Workflows)
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>saas burn rate and runway calculator</li>
                            <li>startup cash runway calculator online</li>
                            <li>paul graham default alive or default dead calculator</li>
                            <li>david sacks burn multiple calculator</li>
                            <li>bessemer efficiency score calculator</li>
                            <li>saas magic number and cac payback calculator</li>
                            <li>ai saas llm token cogs gross margin calculator</li>
                            <li>rule of 40 and net dollar retention calculator</li>
                            <li>monte carlo startup runway simulator</li>
                            <li>startup hiring plan and burn rate forecaster</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            SAFE Conversion &amp; Option Pool Shuffle (10 Workflows)
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>yc post-money safe dilution calculator</li>
                            <li>pre-money vs post-money safe calculator</li>
                            <li>series a option pool shuffle calculator</li>
                            <li>stacked safe note conversion calculator</li>
                            <li>convertible note accrued interest cap table calculator</li>
                            <li>safe mfn most favored nation dilution calculator</li>
                            <li>founder equity split and 4-year vesting calculator</li>
                            <li>founder secondary sale liquidity series a calculator</li>
                            <li>pro forma cap table generator excel export</li>
                            <li>seed to series b founder dilution simulator</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            M&amp;A Exit Waterfall &amp; Liquidation Prefs (10 Workflows)
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>startup exit waterfall calculator</li>
                            <li>liquidation preference calculator 1x vs 2x</li>
                            <li>participating vs non-participating preferred calculator</li>
                            <li>capped participation exit payout simulator</li>
                            <li>voluntary conversion breakpoint calculator</li>
                            <li>management carve out m&amp;a exit calculator</li>
                            <li>venture debt amortization vs equity dilution calculator</li>
                            <li>term sheet risk linter and validator</li>
                            <li>client-side cap table and waterfall excel generator</li>
                            <li>startup valuation and moic return calculator</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 9: FREQUENTLY ASKED QUESTIONS (16 INTERACTIVE ACCORDIONS)
          ============================================================================ */}
            <section
                aria-labelledby="saas-burn-rate-frequently-asked-questions"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
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
          SECTION 10: INTERNAL CROSS-LINKING TO RELATED FINANCE, SEO & DEVELOPER TOOLS
          ============================================================================ */}
            <section
                aria-labelledby="saas-burn-rate-related-utilities"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h2
                        id="saas-burn-rate-related-utilities"
                        className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Related Client-Side Finance, Data Engineering &amp; Document Security Utilities
                    </h2>
                </div>
                <p className="w-full text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed break-words">
                    Continue your financial modeling, data inspection, and document security workflow with our
                    integrated browser tools:
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Link
                        href="/document/pdf-scrubber"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            PDF Bank Statement &amp; Term Sheet Data Scrubber →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Permanently redact IBANs, Luhn Card PANs, Tax IDs, and hidden PDF metadata from bank
                            statements before sharing in investor data rooms.
                        </p>
                    </Link>

                    <Link
                        href="/developer/parquet-viewer"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            Parquet, Avro &amp; Feather Billing Telemetry Viewer →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Inspect Stripe/Snowflake billing lakehouse files locally with 64-bit BigInt safety and
                            instant Excel (.xlsx) export.
                        </p>
                    </Link>

                    <Link
                        href="/developer/llms-txt-generator"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            llms.txt, llms-full.txt &amp; AI Crawler (robots.txt) Studio →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Optimize your SaaS documentation for ChatGPT Search, Claude, and Perplexity while blocking
                            unauthorized AI training scrapers.
                        </p>
                    </Link>

                    <Link
                        href="/developer/har-analyzer"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            HAR File Analyzer, Waterfall Viewer &amp; Secret Sanitizer →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Inspect 7-phase HTTP waterfalls, scrub 14 secret surfaces, and generate k6/Playwright tests.
                        </p>
                    </Link>

                    <Link
                        href="/developer/json-converter"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            JSON to CSV, Excel (.xlsx), YAML &amp; XML Converter →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Transform Stripe API subscription JSON payloads and financial ledger exports into
                            spreadsheets locally.
                        </p>
                    </Link>

                    <Link
                        href="/document/excel-to-pdf"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            Excel (.xlsx) &amp; CSV to PDF Financial Report Converter →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Convert exported cap tables and 60-month cash flow workbooks into board-ready PDF reports.
                        </p>
                    </Link>
                </div>
            </section>
        </article>
    );
}