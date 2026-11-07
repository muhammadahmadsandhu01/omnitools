import React from 'react';
import Link from 'next/link';
import {
    Calculator,
    Scale,
    ShieldCheck,
    Building2,
    AlertTriangle,
    Terminal,
    HelpCircle,
    Sparkles,
    FileSpreadsheet,
    Cpu,
    Search,
    Code2,
    Globe,
    DollarSign,
} from 'lucide-react';

export interface FaqItem {
    question: string;
    answer: string;
}

export const CONTRACTOR_VS_EMPLOYEE_FAQS: FaqItem[] = [
    {
        question: 'How do I accurately convert a W-2 full-time salary to an equivalent 1099 contractor hourly rate?',
        answer:
            'Multiplying a W-2 salary by 1.30 is only a rough rule of thumb. To calculate the exact break-even hourly rate, you must account for the employer half of FICA (15.3% SECA tax applied to 92.35% of Schedule C net profit up to the $184,500 Social Security wage base, plus uncapped 2.9% Medicare and 0.9% Additional Medicare above $200k/$250k), unpaid vacation and public holidays (e.g., 46–48 billable weeks instead of 52), self-funded health insurance, lost employer 401(k) match, and deductible business overhead—offset by the 50% above-the-line SE tax deduction (Form 1040 Schedule 1 Line 15) and the 20% Section 199A QBI deduction. KivaroTools runs a 48-iteration binary-search solver to compute the exact break-even hourly and daily rate down to the cent.',
    },
    {
        question: 'Are my salary, contract rates, or tax scenarios uploaded to any external server?',
        answer:
            'No. Every statutory tax calculation, 3-way entity comparison, 48-iteration reverse break-even solver, 12-point IR35/IRS classification audit, and Excel/CSV export executes 100% locally inside your browser memory. Your compensation data is never uploaded to KivaroTools servers.',
    },
    {
        question: 'Why does a UK Inside IR35 contract pay significantly less than a Permanent PAYE salary at the same gross rate?',
        answer:
            'Under UK Off-Payroll Working rules (Chapter 10, Part 2 ITEPA 2003), when an assignment is Inside IR35 and paid via an umbrella company (as itemized on a Key Information Document / KID), the umbrella company must deduct its weekly margin, Employer Class 1 National Insurance (15% above the £5,000 Secondary Threshold), and the Apprenticeship Levy (0.5%) directly from your assignment rate BEFORE calculating your gross taxable PAYE salary, Employee Income Tax (20%/40%/45%), and Employee NI (8%/2%).',
    },
    {
        question: 'How much tax does an S-Corp election (Form 1120-S) save compared to a 1099 Sole Proprietorship?',
        answer:
            'A 1099 sole proprietor or single-member LLC pays 15.3% self-employment (SECA) tax on 92.35% of all net business profit (up to the $184,500 Social Security cap, plus uncapped 2.9% Medicare). When you elect S-Corp status (Form 2553 / Form 1120-S), you pay yourself a "reasonable W-2 salary" subject to FICA payroll taxes, while remaining net corporate profits are distributed to you on Schedule K-1 completely exempt from the 15.3% FICA/SECA tax—often saving $8,000 to $19,000+ per year once net profits exceed $80,000.',
    },
    {
        question: 'What is the UK Outside IR35 Limited Company optimal salary and dividend extraction strategy?',
        answer:
            'Directors of UK Limited Companies operating genuinely Outside IR35 typically draw a tax-efficient director salary of £12,570 (absorbing the full UK Personal Allowance) and extract remaining post-tax company profits as dividends. Company profits are subject to Corporation Tax (19% Small Profits Rate up to £50,000, 25% Main Rate above £250,000, with marginal relief at an effective 26.5% rate between £50,000 and £250,000), and dividends above the £500 allowance are taxed at dividend rates (10.75% basic, 33.75% higher, 39.35% additional) with zero Employee or Employer National Insurance on the dividend portion.',
    },
    {
        question: 'How does the calculator support all 153+ active ISO 4217 currencies worldwide?',
        answer:
            'In the left input panel, the Select Currency dropdown includes all 153+ active ISO 4217 global currencies (USD, EUR, GBP, CAD, AUD, CHF, JPY, SGD, AED, INR, PKR, SAR, CNY, HKD, NZD, BRL, MXN, PLN, SEK, NOK, DKK, TRY, ZAR, NGN, KES, QAR, KWD, BHD, OMR, MYR, THB, IDR, PHP, VND, KRW, and more) with official currency symbols and 0, 2, or 3 decimal precision metadata. You can pair any ISO 4217 currency with our 8 built-in statutory country engines or select the Global Custom Country Regime to enter your country’s exact income, social security, corporate, and dividend tax rates.',
    },
    {
        question: 'How does Section 44ADA presumptive taxation work for Indian software engineers and consultants?',
        answer:
            'Under Section 44ADA of the Indian Income Tax Act, resident professionals (including software developers, architects, engineers, designers, and management consultants) whose gross annual receipts do not exceed ₹75 Lakh (where >=95% of receipts are digital/bank transfers) can declare a flat 50% of their gross receipts as presumptive taxable profit without maintaining detailed expense books or undergoing a Section 44AB tax audit. The remaining 50% is automatically treated as tax-free deemed business expenses.',
    },
    {
        question: 'How does Pakistan FBR Section 154A (0.25% PSEB vs. 1.0% Non-PSEB) compare to Salaried Section 149 tax?',
        answer:
            'In Pakistan, salaried employees taxed under Section 149 face progressive slabs up to 35% (plus a 10% surcharge when annual salary exceeds Rs. 10 Million). By contrast, independent freelancers and exporters of IT and IT-enabled services (software, web/mobile development, design, AI/data consulting) receiving foreign remittances via banking channels with PRC Purpose Code 9186 qualify for a Final Tax Regime under Section 154A: just 0.25% final withholding tax on gross export proceeds if registered with the Pakistan Software Export Board (PSEB), or 1.0% for non-PSEB Active Taxpayer List (ATL) filers.',
    },
    {
        question: 'What is the Personal Services Business (PSB) tax trap for incorporated contractors in Canada?',
        answer:
            'In Canada, a Canadian-Controlled Private Corporation (CCPC) normally qualifies for the Small Business Deduction, paying roughly 12.2% combined federal/provincial corporate tax on active business income up to $500,000. However, if the Canada Revenue Agency (CRA) determines that the incorporated contractor would reasonably be regarded as an officer or employee of the client ("incorporated employee"), the corporation is classified as a Personal Services Business (PSB)—losing the Small Business Deduction, losing almost all business expense deductions, and facing a punitive ~44.5%+ corporate tax rate before dividend taxation.',
    },
    {
        question: 'How do Australia’s 12% Superannuation Guarantee and ATO PSI rules affect contractors?',
        answer:
            'For Australian PAYG permanent employees, employers pay the 12% Superannuation Guarantee on top of base salary. When comparing an ABN contractor rate, contractors must fund their own retirement super and pass the ATO Personal Services Income (PSI) Results Test (earning at least 75%/80% for producing a specific result, supplying their own equipment, and bearing liability for rectifying defects) to claim company tax splitting or expanded business deductions.',
    },
    {
        question: 'How does the 12-Point Worker Classification & IR35 CEST Audit Scorecard work?',
        answer:
            'Tab 3 evaluates 12 statutory classification factors derived from UK HMRC CEST (Right of Substitution, Supervision/Direction/Control, Mutuality of Obligation), IRS Form SS-8 Common Law (Behavioral Control, Financial Control, Relationship of Parties), US DOL 6-Factor Economic Reality, Canadian CRA Wiebe Door, and German DRV § 7 SGB IV Scheinselbstständigkeit. It computes a 0–100 compliance score and provides 1-click safe-harbor contractual clauses to remediate red flags.',
    },
    {
        question: 'How does the CFO / Employer Total Cost of Employment (TCE) vs. Global EOR comparator work?',
        answer:
            'Tab 4 models the hiring company’s true all-in spend across three hiring channels: (1) Direct Local Entity Employment (Base + Bonus + Employer Payroll Taxes/NI/Super + Health/Retirement Benefits + Workers Comp), (2) Global Employer of Record (EOR) platforms such as Deel, Remote, or Oyster ($599–$699/employee/month platform fee on top of statutory employer costs), and (3) Independent B2B Contractor invoices plus Contractor Agent-of-Record (AOR) management fees ($29–$49/month).',
    },
    {
        question: 'What is the recommended "+15% Contractor Bench & Risk Buffer" shown in the output card?',
        answer:
            'The Exact Break-Even Rate matches 100% of a full-time employee’s net cash and benefits assuming you bill every planned week of the year without interruption. Because independent contractors face contract termination notice periods of 1–2 weeks, unpaid client acquisition time ("bench time"), late invoice payments, and zero statutory severance or unemployment insurance, commercial contracting benchmarks add a 15% buffer above the raw break-even rate.',
    },
    {
        question: 'Can I generate a ready-to-send rate negotiation email for my recruiter or client?',
        answer:
            'Yes. Open Tab 2 (Break-Even Matrix & Recruiter Counter-Offer) to copy a personalized, itemized financial counter-offer script that explains your exact break-even hourly and daily rate using the full-time salary, unpaid PTO weeks, self-funded benefits, and the employer payroll taxes your client saves by engaging you on a B2B contract.',
    },
    {
        question: 'How are exported Excel (.xlsx) and CSV (.csv) files protected against formula injection?',
        answer:
            'All spreadsheet exports in Tab 5 and the main output panel pass through our OWASP CWE-1236 Spreadsheet Formula Injection Guard, which automatically prefixes any non-numeric text cell starting with =, +, -, @, Tab, or CR with a neutralizing single quote (\') while preserving signed numeric values.',
    },
    {
        question: 'Can I switch between Hourly, Daily, Monthly, and Annual contract rates without losing my scenario?',
        answer:
            'Yes. Clicking /Hr, /Day, /Mo, or /Yr in the left input panel automatically converts your active annualized contract revenue into the selected billing unit using your configured Billable Weeks/Year, Working Days/Week, and Billable Hours/Day.',
    },
];

export default function ContractorVsEmployeeSeo() {
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: CONTRACTOR_VS_EMPLOYEE_FAQS.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };

    const howToSchema = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'How to Compare Full-Time Employment (W-2/PAYE/T4) vs. Independent Contracting (1099/S-Corp/IR35)',
        description:
            'Step-by-step guide to calculating 3-way after-tax take-home pay, exact break-even hourly and daily contractor rates, and IR35/IRS worker classification compliance locally in your browser.',
        step: [
            {
                '@type': 'HowToStep',
                position: 1,
                name: 'Select Your ISO 4217 Currency & Statutory Tax Jurisdiction',
                text: 'Choose from all 153+ active ISO 4217 currencies and select a statutory tax jurisdiction (United States, United Kingdom, Canada, Australia, Germany, India, Pakistan, UAE, or Global Custom Country Regime) or load a 1-click Quick Scenario Preset.',
            },
            {
                '@type': 'HowToStep',
                position: 2,
                name: 'Enter Full-Time Salary, Benefits & Contractor Billing Parameters',
                text: 'Input your Full-Time Base Salary, Employer Health Subsidy, and Retirement Match %, then set your Contractor Rate (/Hr, /Day, /Mo, or /Yr), Billable Weeks/Year, Deductible Business Expenses, and S-Corp/Ltd Co Salary Split %.',
            },
            {
                '@type': 'HowToStep',
                position: 3,
                name: 'Compare the 3-Way Tax Waterfall & Exact Break-Even Rate',
                text: 'Review the Royal Blue Output Card and Tab 1 Waterfall Table to compare Full-Time Employee vs. Standard Contractor (1099 / Inside IR35 Umbrella) vs. Tax-Optimized Entity (S-Corp / Outside IR35 Ltd / Sec 44ADA / PSEB 0.25%) and apply the 1-click Exact Break-Even Rate.',
            },
            {
                '@type': 'HowToStep',
                position: 4,
                name: 'Audit Worker Classification (IR35/IRS) & Export Deliverables',
                text: 'Run the 12-Point Classification Linter in Tab 3, apply 1-click safe-harbor contract clauses, copy the Recruiter Negotiation Script in Tab 2, and export CWE-1236 safe Excel (.xlsx), CSV, or SHA-256 Audit Certificates in Tab 5.',
            },
        ],
    };

    const softwareAppSchema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'KivaroTools Universal Contractor vs. Full-Time (W-2 / 1099 / S-Corp / IR35 / Global EOR) Calculator',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web Browser (100% Client-Side Local Execution)',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
    };

    return (
        <article className="mt-16 w-full min-w-0 max-w-full overflow-x-hidden space-y-12 text-slate-700 dark:text-slate-300">
            {/* Structured Data Scripts (FAQPage, HowTo & SoftwareApplication) */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
            />

            {/* ============================================================================
          SECTION 1: EXECUTIVE OVERVIEW & 3-WAY GLOBAL PAYROLL ARCHITECTURE
          ============================================================================ */}
            <section
                aria-labelledby="contractor-vs-employee-overview"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <h2
                        id="contractor-vs-employee-overview"
                        className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white"
                    >
                        Universal Contractor vs. Full-Time Employee (W-2 / 1099 / S-Corp / UK IR35 / Global EOR) Calculator &amp; Break-Even Studio
                    </h2>
                    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shrink-0">
                        <Sparkles className="h-3.5 w-3.5" />
                        153+ ISO Currencies • 3-Way Entity Engine
                    </span>
                </div>

                <p className="mt-3 w-full text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Compare <strong>Full-Time Employment (W-2 / PAYE / T4 / PAYG / Salaried)</strong>,{' '}
                    <strong>Standard Independent Contracting (1099 Schedule C / Inside IR35 Umbrella / T2125 Sole Prop / ABN)</strong>, and{' '}
                    <strong>Tax-Optimized Corporate &amp; Presumptive Regimes (US Form 1120-S S-Corp, UK Outside IR35 Limited Company, Canadian CCPC, Australian Pty Ltd, Indian Section 44ADA, and Pakistani FBR Section 154A 0.25% PSEB IT Export)</strong>{' '}
                    side-by-side across all <strong>153+ active ISO 4217 global currencies</strong>. Solve for your exact after-tax{' '}
                    <strong>Break-Even Hourly &amp; Daily Rate</strong>, audit your contract against{' '}
                    <strong>12-point IRS, DOL, and HMRC CEST (IR35) misclassification rules</strong>, and benchmark{' '}
                    <strong>Direct Hiring vs. Global EOR (Deel / Remote / Oyster)</strong> costs 100% locally in your browser.
                </p>

                <blockquote className="p-4 my-6 bg-blue-50/80 border-l-4 border-blue-600 rounded-r-xl dark:bg-slate-800/80 not-italic">
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 m-0 leading-relaxed">
                        <strong>100% Local Browser Execution &amp; Privacy Guarantee:</strong> All salary parameters, hourly/daily
                        contract rates, S-Corp/IR35 tax splits, and classification audits run strictly inside your browser memory.
                        Zero compensation figures or financial exports are ever transmitted to external servers.
                    </p>
                </blockquote>

                <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    <p>
                        A $100/hour ($200,000/year) independent contractor offer and a $160,000/year W-2 or PAYE full-time salary
                        look deceptively different on paper. When you work as an independent contractor, you lose employer-subsidized
                        health insurance, employer retirement matching (401(k), UK Employer Pension, 12% Australian Superannuation,
                        Indian EPF), and 25 to 33 days of paid vacation, public holidays, and sick leave—while absorbing both the
                        employee and employer shares of payroll taxes (such as the <strong>15.3% US SECA tax</strong> or{' '}
                        <strong>15% UK Employer National Insurance + 0.5% Apprenticeship Levy inside IR35</strong>).
                    </p>
                    <p>
                        Conversely, basic 2-column online calculators completely ignore the third column that sophisticated
                        contractors actually use: <strong>tax-optimized legal entities and statutory export regimes</strong>. Whether
                        splitting income into a <strong>Reasonable W-2 Salary + FICA-Exempt K-1 Distribution in a US S-Corp</strong>,
                        drawing a <strong>£12,570 Director Salary + Dividends in a UK Outside IR35 Limited Company</strong>, claiming
                        the <strong>50% deemed expense deduction under Indian Section 44ADA</strong>, or paying a{' '}
                        <strong>0.25% final withholding tax under Pakistani FBR Section 154A with PSEB registration</strong>, our
                        3-way engine models every statutory rule simultaneously.
                    </p>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                            <Scale className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            Simultaneous 3-Way Regime Waterfall
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Compares Full-Time Employee vs. Unincorporated/Umbrella Contractor vs. Tax-Optimized Entity (S-Corp /
                            Outside IR35 Ltd / CCPC / Sec 44ADA / PSEB 0.25%) on a single screen.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                            <DollarSign className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            48-Iteration Reverse Break-Even Solver
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Solves for the exact Hourly, Daily, Monthly, and Annual contractor rate required to match 100% of your
                            Full-Time Net Cash + Monetized Employer Benefits across 44–52 billable weeks.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                            12-Point IR35 CEST &amp; IRS Audit Linter
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Audits Right of Substitution, Supervision/Direction/Control (SDC), Mutuality of Obligation (MOO), and
                            Financial Risk, and applies 1-click safe-harbor contract clauses.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 2: COMPLETE INTERNAL WORKING STRUCTURE (5-STAGE PIPELINE)
          ============================================================================ */}
            <section
                aria-labelledby="contractor-vs-employee-working-structure"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2.5 mb-2">
                    <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2
                        id="contractor-vs-employee-working-structure"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Complete Working Structure: How the 5-Stage Statutory Tax &amp; Break-Even Engine Works
                    </h2>
                </div>
                <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    <code>lib/contractorVsEmployeeEngine.ts</code> executes a 5-stage deterministic financial and legal compliance
                    pipeline in browser memory:
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                            1
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Utilization &amp; Benefits Monetizer
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Converts Hourly/Daily/Monthly rates across billable weeks and monetizes employer health insurance,
                            retirement match, and unpaid PTO days.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                            2
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            3-Way Statutory Tax Waterfall
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Computes progressive tax brackets, US Schedule SE (92.35% base, $184,500 SS cap, 20% QBI), UK IR35 KID
                            Employer NI (15%), and corporate/dividend taxes.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-bold text-white">
                            3
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Binary-Search Break-Even Solver
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Runs 48 binary-search iterations through the non-linear progressive tax engine to find the exact gross
                            revenue matching Full-Time Cash + Benefits.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-xs font-bold text-white">
                            4
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            12-Point IR35 / IRS Audit Linter
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Scores 12 legal independence factors (Substitution, Control, MOO, Financial Risk, Exclusivity) and
                            generates safe-harbor contract clauses.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
                            5
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            EOR Comparator &amp; 6 Exports
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Benchmarks Direct Hire vs. EOR (Deel/Remote/Oyster) vs. Contractor spend and compiles CWE-1236 safe{' '}
                            <code>.xlsx</code>, <code>.csv</code>, <code>.txt</code>, <code>.md</code>, <code>.json</code>, and{' '}
                            <code>.svg</code> files.
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 3: REAL PRACTICAL EXAMPLES (US W-2/1099/S-CORP & UK IR35 KID)
          ============================================================================ */}
            <section
                aria-labelledby="contractor-vs-employee-examples"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-8"
            >
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Terminal className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <h2
                            id="contractor-vs-employee-examples"
                            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                        >
                            Real-World Statutory Walkthroughs: US W-2 vs. 1099 vs. S-Corp &amp; UK Inside vs. Outside IR35
                        </h2>
                    </div>
                    <p className="w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                        See the exact step-by-step statutory formulas executed by our engine for the two most common contracting
                        decisions:
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
                        <div className="text-blue-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                            Example 1: US $105/hr 1099 Contractor (47 Wks = $197,400 Gross) vs. S-Corp
                        </div>
                        <pre className="leading-relaxed overflow-x-auto max-w-full">{`1. Schedule C Net Profit:
   $197,400 Gross - $6,800 Expenses = $190,600
2. Schedule SE Base (92.35% Factor):
   $190,600 × 0.9235 = $176,019
3. 1099 Self-Employment (SECA) Tax:
   • Social Security (12.4% up to $184,500): $21,826
   • Medicare (2.9% uncapped):               $5,105
   • Total 1099 SE Tax:                      $26,931
   • 50% Above-the-Line SE Deduction:       -$13,465
   • 20% Section 199A QBI Deduction:        -$30,507
4. S-Corp Election (42% Salary / 58% K-1 Split):
   • Reasonable W-2 Salary ($73,920) FICA:   $11,352
   • K-1 Distribution ($102,080) SECA Tax:   $0 (Exempt!)
   • Payroll/CPA Fee ($2,400) -> Net Tax Saved: +$11,800+/yr`}</pre>
                    </div>

                    <div className="min-w-0 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                        <div className="text-emerald-400 font-bold mb-2 pb-1.5 border-b border-slate-800">
                            Example 2: UK £650/Day Contract (46 Wks = £149,500 Gross) Inside vs. Outside IR35
                        </div>
                        <pre className="leading-relaxed overflow-x-auto max-w-full">{`A. Inside IR35 (Umbrella Key Information Document / KID):
   • Assignment Gross (230 days × £650):     £149,500
   • Minus Umbrella Margin (£1,440/yr):      -£1,440
   • Minus Employer SIPP Pension (£6,000):   -£6,000
   • Minus Employer Class 1 NI (15% > £5k):  -£17,561
   • Minus Apprenticeship Levy (0.5%):       -£585
   = Gross Taxable PAYE Salary:              £123,914
   • Minus PAYE Income Tax & Employee NI:    -£46,608
   = Inside IR35 Net Cash (+ £6k Pension):   £77,306 (£83,306 pkg)

B. Outside IR35 Limited Company (£12,570 Salary + Dividends):
   • Director Salary (£12,570 — 0% Income Tax)
   • Company Profit After Expenses & Pension: £124,755
   • Minus UK Corporation Tax (19%–25% MR):  -£29,310
   • Net Distributable Dividends:            £95,445
   • Minus Dividend Tax (10.75% / 33.75%):   -£23,371
   = Outside IR35 Net Cash (+ £6k Pension):  £84,644 (£90,644 pkg)`}</pre>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 4: 8-COUNTRY + WORLDWIDE CUSTOM STATUTORY TAX MATRIX
          ============================================================================ */}
            <section
                aria-labelledby="contractor-vs-employee-country-matrix"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2
                        id="contractor-vs-employee-country-matrix"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Technical Reference: 8 Built-In Statutory Jurisdictions + 153+ ISO 4217 Global Custom Engine
                    </h2>
                </div>
                <p className="mt-2 w-full text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                    Every jurisdiction models three distinct tax regimes alongside its statutory worker classification framework:
                </p>

                <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[740px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Jurisdiction</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Regime 1: Full-Time Employee</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Regime 2: Standard Contractor</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Regime 3: Optimized Entity</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Statutory Classification Test</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <td className="p-3 font-bold border border-slate-200 dark:border-slate-700">United States (USD)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">W-2 Employee (7.65% FICA, $184,500 SS Cap)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">1099 Sole Prop (15.3% SECA on 92.35% profit + 50% SE Ded + 20% QBI)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">S-Corp 1120-S (Reasonable W-2 Salary + FICA-Exempt K-1 Distribution)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">IRS 3-Factor Common Law &amp; DOL 6-Factor Economic Reality</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold border border-slate-200 dark:border-slate-700">United Kingdom (GBP)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Permanent PAYE (20%/40%/45% Tax + 8%/2% Employee NI)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Inside IR35 Umbrella (Deducts 15% Employer NI + 0.5% Levy + Margin first)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Outside IR35 Ltd Co (£12,570 Salary + 19%–25% Corp Tax + Dividends)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">HMRC CEST (Substitution, SDC &amp; Mutuality of Obligation)</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold border border-slate-200 dark:border-slate-700">Canada (CAD)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">T4 Employee (Federal/Provincial Tax + 1x CPP/CPP2 + EI)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">T2125 Sole Proprietor (2x CPP Employer+Employee + Personal Slabs)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">CCPC Corp (~12.2% Combined Small Business Deduction + Dividends)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">CRA Wiebe Door 4-Factor Test &amp; PSB Audit Rules</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold border border-slate-200 dark:border-slate-700">Australia (AUD)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">PAYG Permanent (Stage 3 Brackets + 2% Medicare + 12% Employer Super)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">ABN Sole Trader (Personal Services Income / PSI Individual Slabs)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Pty Ltd Base Rate Entity (25% Corporate Tax + Franked Dividends)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">ATO TR 2023/4 &amp; 80/20 PSI Results Test</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold border border-slate-200 dark:border-slate-700">Germany (EUR)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Festangestellter (Einkommensteuer + ~20.5% Employee Social Split)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Freiberufler (Self-Employed Income Tax + Private PKV Health)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Freiberufler + Betriebsausgaben &amp; Rürup-Rente Deduction Shield</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">DRV § 7 SGB IV Scheinselbstständigkeit Audit</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold border border-slate-200 dark:border-slate-700">India (INR)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Salaried CTC (Sec 115BAC New Regime + ₹75,000 Std Deduction + 4% Cess)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Regular Professional Consultant (Actual Net Profit Books)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Section 44ADA Presumptive Tax (Only 50% of Gross Receipts Taxed!)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Sec 192 Employment vs. Sec 194J / 44ADA Consultancy</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold border border-slate-200 dark:border-slate-700">Pakistan (PKR)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">FBR Salaried u/s 149 (0%–35% Slabs + 10% Surcharge &gt; Rs. 10M)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Non-PSEB ATL Filer IT Exporter (1.0% Final Tax u/s 154A)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">PSEB-Registered IT Exporter (0.25% Final Tax u/s 154A!)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">FBR Sec 149 vs. Sec 154A Foreign Remittance (PRC 9186)</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold border border-slate-200 dark:border-slate-700">UAE / Dubai (AED)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Mainland/Free Zone Employee (0% Personal Tax + EOSB Gratuity)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">UAE Freelance Permit (0% Personal Tax up to AED 1M Turnover)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Free Zone FZ-LLC (0% up to AED 375k; 9% Corporate Tax above)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">UAE MOHRE Labor Contract vs. Independent Trade License</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold border border-slate-200 dark:border-slate-700">Global Custom (153+ ISO)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Custom Employee Income Tax % + Employee Social Security %</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Custom Freelancer Tax % + Self-Employed Social Security %</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Custom Corporate Tax % + Dividend Withholding Tax %</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">ILO Recommendation 198 Multi-Factor Independence Test</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 5: 12-POINT WORKER CLASSIFICATION & IR35 CEST AUDIT RULES TABLE
          ============================================================================ */}
            <section
                aria-labelledby="contractor-12-point-classification-rules"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2
                        id="contractor-12-point-classification-rules"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        12-Point Worker Classification, HMRC CEST (IR35) &amp; IRS Common Law Audit Rules
                    </h2>
                </div>
                <div className="w-full mt-4 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[740px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">#</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Audit Rule Code</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Severity</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">What It Detects &amp; 1-Click Safe-Harbor Contractual Remediation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {[
                                ['1', 'IR35-CEST-001_NO_RIGHT_OF_SUBSTITUTION', 'CRITICAL', 'Flags mandatory personal service; inserts an unfettered right to provide a qualified substitute at Contractor’s expense.'],
                                ['2', 'IRS-DOL-002_BEHAVIORAL_SUPERVISION_CONTROL', 'CRITICAL', 'Detects client control over how/when work is performed; establishes autonomous methodology and scheduling.'],
                                ['3', 'IR35-MOO-003_MUTUALITY_OF_OBLIGATION', 'CRITICAL', 'Flags ongoing obligation to offer/accept work beyond current deliverables; limits scope to discrete SOW milestones.'],
                                ['4', 'IRS-FIN-004_CLIENT_PROVIDED_PRIMARY_EQUIPMENT', 'WARNING', 'Flags primary work on client laptops; specifies contractor-supplied hardware with VDI limited to security compliance.'],
                                ['5', 'DOL-ECON-005_NO_FINANCIAL_RISK_OR_DEFECT_WARRANTY', 'WARNING', 'Detects pure time-billing without defect liability; adds warranty requiring unbilled defect remediation.'],
                                ['6', 'DE-DRV-006_SINGLE_CLIENT_ECONOMIC_DEPENDENCY', 'WARNING', 'Flags >80% revenue from a single client (German DRV 5/6 & Australian ATO 80/20 PSI risk).'],
                                ['7', 'IRS-REL-007_PART_AND_PARCEL_ORG_INTEGRATION', 'CRITICAL', 'Flags contractors appearing on internal org charts, managing employees, or receiving employee PTO/perks.'],
                                ['8', 'CRA-PSB-008_INDETERMINATE_ROLLING_TENURE', 'OPTIMIZATION', 'Flags multi-year rolling contracts; restructures renewals around fixed-deliverable SOW phases.'],
                                ['9', 'B2B-IND-009_MISSING_LIABILITY_INSURANCE', 'OPTIMIZATION', 'Flags missing Professional Indemnity (E&O) and Commercial General Liability insurance coverage.'],
                                ['10', 'SOW-DEL-010_GENERIC_JOB_DESCRIPTION_CONTRACT', 'WARNING', 'Flags contracts using a job description instead of milestone acceptance deliverables.'],
                                ['11', 'B2B-PRES-011_NO_REGISTERED_ENTITY_OR_TRADE_PRESENCE', 'OPTIMIZATION', 'Flags lack of a registered B2B entity, business bank account, or formal commercial invoicing.'],
                                ['12', 'EXCL-012_RESTRICTIVE_EXCLUSIVITY_CLAUSE', 'WARNING', 'Flags blanket exclusivity clauses that prohibit serving non-competing third-party clients concurrently.'],
                            ].map(([num, codeStr, sev, desc]) => (
                                <tr key={num}>
                                    <td className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">{num}</td>
                                    <td className="p-3 font-mono text-blue-600 dark:text-blue-400 font-semibold border border-slate-200 dark:border-slate-700">{codeStr}</td>
                                    <td className="p-3 font-mono font-bold border border-slate-200 dark:border-slate-700">{sev}</td>
                                    <td className="p-3 border border-slate-200 dark:border-slate-700">{desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 6: COMPETITOR COMPARISON MATRIX
          ============================================================================ */}
            <section
                aria-labelledby="contractor-vs-employee-competitor-matrix"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <h2
                    id="contractor-vs-employee-competitor-matrix"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    Feature Comparison: KivaroTools vs. Online W-2/1099, IR35 &amp; EOR Calculators
                </h2>
                <div className="w-full mt-6 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[740px] w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white">
                            <tr>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold">Capability / Feature</th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-bold text-blue-600 dark:text-blue-400">
                                    KivaroTools Universal Studio
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    Basic US W-2 vs. 1099 Calculators
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    UK-Only IR35 Calculators
                                </th>
                                <th className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">
                                    B2B EOR Vendor Calculators
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Global Currencies &amp; Jurisdictions
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    153+ ISO 4217 Currencies + 8 Built-In Countries + Custom Engine
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600">US USD only</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-rose-600">UK GBP only</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Employer cost only (Gated)</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Simultaneous 3-Way Entity Comparison
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Employee vs. Standard Contractor vs. S-Corp / Outside IR35 / Sec 44ADA / PSEB
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">2 columns only (W-2 vs 1099)</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Inside vs Outside IR35 only</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Exact Reverse Break-Even Rate Solver
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    48-Iteration Binary Search + 5-Tier Utilization Matrix + 1-Click Apply
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Rough 1.3x multiplier only</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">Manual trial &amp; error</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    12-Point IR35 / IRS Audit Linter
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Yes — 0–100 Compliance Score + 1-Click Safe-Harbor Clauses
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Static text checklist only</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700">Requires sales call</td>
                            </tr>
                            <tr>
                                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700">
                                    Recruiter Script &amp; 6 Enterprise Exports
                                </th>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                                    Counter-Offer Script + .xlsx, .csv, .md, .txt, .json &amp; .svg
                                </td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                                <td className="p-3 border border-slate-200 dark:border-slate-700 text-slate-400">None</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ============================================================================
          SECTION 7: COMMON CONTRACTOR PRICING & TAX PITFALLS (6 SCENARIOS)
          ============================================================================ */}
            <section
                aria-labelledby="contractor-vs-employee-pitfalls"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <h2
                    id="contractor-vs-employee-pitfalls"
                    className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                    6 Common Contractor Pricing, Tax &amp; Misclassification Pitfalls (And How to Avoid Them)
                </h2>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            1. Dividing Annual Salary by 2,080 Hours
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Pitfall:</strong> Converting a $150,000 salary by dividing by 2,080 hours ($72.11/hr) assumes 52
                            paid weeks and zero self-employment tax or health costs.
                            <br />
                            <strong>Fix:</strong> Model 46–48 realistic billable weeks and click <strong>Apply Break-Even Rate</strong>{' '}
                            on the blue output card.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            2. Accepting an Inside IR35 Rate Without Employer NI Uplift
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Pitfall:</strong> Switching from £600/day Outside IR35 to £600/day Inside IR35 transfers the 15%
                            Employer NI and 0.5% Apprenticeship Levy onto your umbrella assignment rate.
                            <br />
                            <strong>Fix:</strong> Inspect the UK KID Waterfall in Tab 1 to calculate the exact day-rate uplift needed.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            3. Paying 15.3% SECA on $200k+ Without an S-Corp Election
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Pitfall:</strong> Staying an unincorporated 1099 sole proprietor at high profit levels exposes
                            100% of net earnings to the 12.4% Social Security and uncapped 2.9%/3.8% Medicare tax.
                            <br />
                            <strong>Fix:</strong> Compare Column 2 (1099) against Column 3 (S-Corp) in Tab 1.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            4. Missing PSEB Registration on Pakistani IT Exports
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Pitfall:</strong> Receiving foreign freelance remittances without PSEB registration or correct PRC
                            purpose codes results in 1.0% or normal slab taxation instead of 0.25% final tax under Section 154A.
                            <br />
                            <strong>Fix:</strong> Load Preset #4 to compare Section 149 vs. 1.0% vs. 0.25% PSEB final tax.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            5. Signing B2B Contracts Without a Substitution Clause
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Pitfall:</strong> Contracts requiring personal service and fixed 9-to-5 attendance fail HMRC CEST
                            and IRS Common Law audits even if both parties label the relationship &ldquo;independent contractor&rdquo;.
                            <br />
                            <strong>Fix:</strong> Run the 12-Point Audit in Tab 3 and click <strong>1-Click Apply Safe-Harbor Clauses</strong>.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/30 space-y-2 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            6. Setting S-Corp Owner Salary Unreasonably Low
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            <strong>Pitfall:</strong> Paying yourself a $15,000 W-2 salary on $250,000 of S-Corp income triggers IRS
                            Reasonable Compensation reclassification and payroll tax penalties.
                            <br />
                            <strong>Fix:</strong> Use the S-Corp Reasonable Salary Split slider (typically 35%–50% of net profit).
                        </p>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 8: SEARCH INTENT & WORKFLOW COVERAGE (33 TARGET WORKFLOWS)
          ============================================================================ */}
            <section
                aria-labelledby="contractor-vs-employee-keyword-coverage"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2
                        id="contractor-vs-employee-keyword-coverage"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Supported Global Payroll, W-2/1099, S-Corp, UK IR35 &amp; EOR Workflows
                    </h2>
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            US W-2, 1099 &amp; S-Corp Calculators (11 Workflows)
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>1099 vs w2 calculator 2026</li>
                            <li>w2 salary to 1099 hourly rate converter</li>
                            <li>s-corp vs 1099 sole proprietor tax calculator</li>
                            <li>irs schedule se 92.35% self-employment tax calculator</li>
                            <li>section 199a qbi 20% deduction calculator</li>
                            <li>s-corp reasonable salary vs k-1 distribution slider</li>
                            <li>independent contractor break-even rate solver</li>
                            <li>freelancer unpaid pto and health insurance calculator</li>
                            <li>1099 to w2 equivalent salary calculator</li>
                            <li>solo 401k tax shield calculator for contractors</li>
                            <li>recruiter rate negotiation counter-offer generator</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            UK IR35, Canada CCPC, Australia &amp; EU (11 Workflows)
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>inside vs outside ir35 calculator uk 2026/27</li>
                            <li>umbrella company key information document (kid) calculator</li>
                            <li>uk limited company director salary and dividend calculator</li>
                            <li>hmrc cest ir35 status risk checker online</li>
                            <li>canada t4 vs incorporated contractor ccpc calculator</li>
                            <li>canada personal services business (psb) tax calculator</li>
                            <li>australia payg vs abn sole trader and pty ltd calculator</li>
                            <li>australia 12% superannuation contractor rate calculator</li>
                            <li>germany festangestellt vs freiberufler brutto netto</li>
                            <li>scheinselbststaendigkeit drv risk checklist</li>
                            <li>153 iso 4217 multi-currency contractor calculator</li>
                        </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            India 44ADA, Pakistan PSEB &amp; Global EOR (11 Workflows)
                        </h3>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc pl-4">
                            <li>india section 44ada freelancer vs salaried ctc calculator</li>
                            <li>presumptive taxation 50% deemed profit calculator india</li>
                            <li>pakistan fbr section 154a 0.25% pseb freelancer calculator</li>
                            <li>pakistan salaried section 149 vs remote it export tax</li>
                            <li>uae dubai freelance permit vs free zone fz-llc calculator</li>
                            <li>deel vs remote vs oyster eor cost calculator</li>
                            <li>employer total cost of employment (tce) vs contractor</li>
                            <li>worker misclassification penalty risk estimator</li>
                            <li>safe-harbor independent contractor agreement clauses</li>
                            <li>export contractor vs employee comparison to excel xlsx</li>
                            <li>sha-256 worker classification compliance certificate</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ============================================================================
          SECTION 9: FREQUENTLY ASKED QUESTIONS (16 INTERACTIVE ACCORDIONS)
          ============================================================================ */}
            <section
                aria-labelledby="contractor-vs-employee-faq"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2
                        id="contractor-vs-employee-faq"
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Frequently Asked Questions
                    </h2>
                </div>

                <div className="space-y-3">
                    {CONTRACTOR_VS_EMPLOYEE_FAQS.map((faq, index) => (
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
          SECTION 10: INTERNAL CROSS-LINKING TO RELATED FINANCE, TAX & PRIVACY TOOLS
          ============================================================================ */}
            <section
                aria-labelledby="contractor-vs-employee-related-tools"
                className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Code2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2
                        id="contractor-vs-employee-related-tools"
                        className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white"
                    >
                        Related Client-Side Finance, Global Payroll, Document &amp; Data Utilities
                    </h2>
                </div>
                <p className="w-full text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed break-words">
                    Continue your financial modeling, loan analysis, and contract privacy workflow with our integrated browser
                    utilities:
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Link
                        href="/finance/mortgage-calculator"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            Mortgage Payment, Escrow &amp; Amortization Calculator →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Calculate monthly principal &amp; interest, PMI, property taxes, cash to close, and accelerated payoff schedules.
                        </p>
                    </Link>

                    <Link
                        href="/finance/emi-calculator"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            Loan EMI, Effective APR &amp; Prepayment Calculator →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Model monthly/biweekly loan repayments, origination fees, and extra principal prepayments across global currencies.
                        </p>
                    </Link>

                    <Link
                        href="/document/pdf-scrubber"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            PDF Bank Statement, Payslip &amp; Tax Return Scrubber →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Forensically redact SSNs, EINs, UTRs, IBANs, and hidden XMP metadata from contracts and tax PDFs locally.
                        </p>
                    </Link>

                    <Link
                        href="/developer/sqlite-viewer"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            SQLite &amp; DuckDB In-Browser Database Studio →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Query, edit, and export .sqlite, .db, and .csv payroll/accounting datasets locally in your browser.
                        </p>
                    </Link>

                    <Link
                        href="/developer/parquet-viewer"
                        className="group rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-blue-400 dark:border-slate-800 dark:hover:border-blue-700 min-w-0"
                    >
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            Parquet, Avro &amp; Feather Viewer + Excel Exporter →
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Inspect columnar financial and analytics datasets locally with 10-dialect SQL DDL and .xlsx export.
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
                            Convert accounting API payloads and invoice feeds into formula-safe Excel workbooks locally.
                        </p>
                    </Link>
                </div>
            </section>
        </article>
    );
}