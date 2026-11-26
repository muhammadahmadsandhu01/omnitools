import type { Tool } from '@/config/toolsData';

export interface FinanceSubtopicGroup {
    id: string;
    label: string;
    heading: string;
    description: string;
    slugs: readonly string[];
}

export interface FinanceFaqItem {
    question: string;
    answer: string;
}

/**
 * Evidence-backed SEO metadata for /finance (KivaroTools Category Page).
 * Note: app/layout.tsx applies `template: '%s | KivaroTools'`, so `seoTitle`
 * renders as "Free Online Financial Calculators | KivaroTools" (47 characters).
 */
export const FINANCE_CATEGORY_SEO = {
    seoTitle: 'Free Online Financial Calculators',
    seoDescription:
        'Use 10 free online financial calculators & 22 country salary engines: mortgage, loan EMI, compound interest, W2/1099/IR35, gold melt, FX & PDF invoices.',
    h1Primary: 'Free Online Financial Calculators',
    h1Accent: '& Global Tax Tools.',
    heroLead:
        'Model mortgages (PITI & PMI), loan EMI schedules, 22-country statutory net take-home pay, W-2/1099/S-Corp/IR35 contractor rates, compound interest & Monte Carlo retirement drawdown, step-up SIPs, SaaS burn rate & SAFE dilution, live precious metals melt values, multi-currency FX, and watermark-free PDF invoices—with zero signup.',
    keywords: [
        'free online financial calculators',
        'online financial calculators',
        'free financial calculators',
        'financial planning calculators',
        'salary and tax calculators',
        'free financial calculators online',
        'finance calculators',
        'finance calculators online',
        'free online finance calculators',
        'freelance financial calculators',
        'multi-currency financial calculators',
    ],
} as const;

/**
 * Tools in /finance that fetch live external market rates (spot metals or FX/crypto).
 * All other finance calculators execute 100% locally in browser memory.
 */
export const FINANCE_LIVE_API_SLUGS = new Set<string>([
    'precious-metals',
    'crypto-converter',
]);

/**
 * 5 logical subtopic workbenches covering all 10 published finance tools
 * in config/toolsData.ts without inventing routes or omitting flagship tools.
 */
export const FINANCE_SUBTOPIC_GROUPS: readonly FinanceSubtopicGroup[] = [
    {
        id: 'loans-mortgages',
        label: 'Loans & Mortgages',
        heading: 'Loans & Mortgage Calculators',
        description:
            'Model monthly or biweekly mortgage PITI escrow, automatic 80%/78% LTV PMI drop-off, reducing-balance loan EMI schedules, and prepayment savings across 154 currencies.',
        slugs: ['mortgage-calculator', 'emi-calculator'],
    },
    {
        id: 'salary-payroll-tax',
        label: 'Salary & Tax',
        heading: 'Salary, Payroll & Contractor Tax Calculators',
        description:
            'Calculate gross-to-net take-home pay across 22 statutory country tax engines or compare full-time employment against 1099, S-Corp, IR35, CCPC, Sec 44ADA, and PSEB 0.25% contractor entities.',
        slugs: ['salary-calculator', 'contractor-vs-employee-calculator'],
    },
    {
        id: 'investing-wealth',
        label: 'Investing & Planning',
        heading: 'Financial Planning, Compound Interest & SIP Calculators',
        description:
            'Project long-term wealth accumulation, inflation-adjusted real purchasing power, retirement drawdown, step-up mutual fund SIPs, and multi-thousand-path Monte Carlo simulations.',
        slugs: ['compound-interest', 'sip-calculator'],
    },
    {
        id: 'startup-business-invoicing',
        label: 'Business & Invoicing',
        heading: 'Startup, Business & Invoicing Tools',
        description:
            'Forecast 60-month SaaS cash runway, Default Alive breakeven, and SAFE equity dilution, or generate clean watermark-free A4 PDF invoices across 150+ ISO currencies.',
        slugs: ['saas-burn-rate-calculator', 'invoice-generator'],
    },
    {
        id: 'metals-currency-fx',
        label: 'Metals & FX',
        heading: 'Precious Metals & Currency FX Converters',
        description:
            'Check live Gold, Silver, Platinum, and Palladium spot melt values across 32 currencies and 9 weight units (including Tola), or convert 160+ fiat currencies and top cryptocurrencies with bank spread simulation.',
        slugs: ['precious-metals', 'crypto-converter'],
    },
] as const;

/**
 * Verified per-tool technical spec badges derived directly from config/toolsData.ts.
 */
export const FINANCE_TOOL_SPECS: Record<string, string> = {
    'mortgage-calculator': '154 FX • PITI & PMI',
    'emi-calculator': '154 FX • 3 Prepay Modes',
    'salary-calculator': '22 Countries • 212 Dir.',
    'contractor-vs-employee-calculator': '153+ FX • 8 Tax Regimes',
    'compound-interest': '180 FX • 2k Monte Carlo',
    'sip-calculator': '154 FX • 3k Monte Carlo',
    'saas-burn-rate-calculator': '60-Mo Runway • SAFE',
    'invoice-generator': '150+ FX • A4 PDF',
    'precious-metals': '32 FX • 9 Weight Units',
    'crypto-converter': '160+ Fiat • 8 Crypto',
};

/**
 * Transparent execution architecture highlights for /finance.
 */
export const FINANCE_ARCHITECTURE_PILLARS = [
    {
        step: '01',
        title: 'Local Calculation Engine (8 Tools)',
        detail:
            'Mortgage, EMI, Salary, Contractor, Compound Interest, SIP, SaaS Burn Rate, and PDF Invoice calculations run entirely in your browser memory—no financial figures are uploaded or stored.',
    },
    {
        step: '02',
        title: 'Live Market Feeds Only Where Needed (2 Tools)',
        detail:
            'Only the Precious Metals Melt Calculator and Currency & Crypto Converter fetch public live spot and mid-market exchange rates; your custom quantities and calculations stay local.',
    },
    {
        step: '03',
        title: 'Global Multi-Currency & Statutory Scope',
        detail:
            'Built for international households, expats, freelancers, and founders with up to 180 ISO-4217 currencies and 22 dedicated statutory country payroll engines.',
    },
    {
        step: '04',
        title: 'Zero Signup & Watermark-Free Exports',
        detail:
            'Export RFC-4180 CSV schedules, Excel (.xlsx) workbooks, JSON drafts, and print-ready A4 PDF invoices immediately without accounts, paywalls, or email popups.',
    },
] as const;

/**
 * Category-level FAQs rendered in visible <details> accordions and mirrored
 * verbatim in FAQPage JSON-LD schema on /finance.
 */
export const FINANCE_CATEGORY_FAQS: readonly FinanceFaqItem[] = [
    {
        question: 'Are these online financial calculators completely free with no signup?',
        answer:
            'Yes. All 10 financial calculators and all 22 statutory country salary engines on KivaroTools are free to use with no account registration, no login wall, no email popups, and no watermarked or paywalled exports.',
    },
    {
        question: 'Are my financial numbers saved or sent to a server?',
        answer:
            'No. Eight of the ten finance tools—including Mortgage, Loan EMI, Salary, Contractor vs. Employee, Compound Interest, SIP, SaaS Burn Rate, and PDF Invoice—execute 100% locally in your browser with zero server uploads. Only the Precious Metals and Currency & Crypto converters request public live market rates, while your own entered amounts remain local.',
    },
    {
        question: 'What currencies and countries do the financial calculators support?',
        answer:
            'Core calculators support between 150 and 180 ISO-4217 world currencies (including USD, CAD, GBP, EUR, AUD, AED, SAR, INR, PKR, and PHP), while the Salary & Net Take-Home Pay suite includes 22 dedicated statutory country engines covering the US, UK, Canada, Australia, Germany, UAE, Saudi Arabia, India, Pakistan, Singapore, and 12 additional jurisdictions.',
    },
    {
        question: 'Are online financial calculator results official financial, tax, or legal advice?',
        answer:
            'No. All outputs are educational estimates provided for modeling and comparison only, not licensed financial, tax, accounting, or legal advice. Actual loan terms, tax liabilities, social security withholdings, and market payouts depend on your lender, employer, and jurisdiction—verify material decisions with a qualified professional.',
    },
    {
        question: 'How accurate are these financial calculators?',
        answer:
            'Each calculator uses standard financial formulas—such as reducing-balance amortization, CFPB 80%/78% LTV PMI thresholds, discrete compounding with Fisher real purchasing power, Monte Carlo simulations, and published statutory tax brackets—and documents its methodology directly on each tool page so you can audit every assumption.',
    },
    {
        question: 'Will using online financial calculators affect my credit score?',
        answer:
            'No. Modeling mortgage payments, loan EMIs, prepayments, or salary scenarios in your browser never triggers a credit inquiry, never collects personal identification numbers, and has zero impact on your credit score.',
    },
    {
        question: 'What types of financial calculators are included in this directory?',
        answer:
            'This hub organizes 10 core calculators into 5 workflows—Loans & Mortgages, Salary & Contractor Tax (plus 22 statutory country salary pages), Investing & Financial Planning (Compound Interest and SIP), Startup & Invoicing (SaaS Burn Rate and PDF Invoices), and Precious Metals & Live Currency/Crypto FX.',
    },
] as const;

/**
 * Helper that resolves all published finance tools into the 5 defined groups
 * plus a safe fallback bucket so newly published tools in toolsData.ts always appear.
 */
export function resolveFinanceToolGroups(financeTools: Tool[]) {
    const bySlug = new Map(financeTools.map((tool) => [tool.slug, tool]));
    const assignedSlugs = new Set<string>();

    const groups = FINANCE_SUBTOPIC_GROUPS.map((group) => {
        const resolvedTools = group.slugs
            .map((slug) => bySlug.get(slug))
            .filter((tool): tool is Tool => Boolean(tool));

        resolvedTools.forEach((tool) => assignedSlugs.add(tool.slug));

        return {
            ...group,
            tools: resolvedTools,
        };
    }).filter((group) => group.tools.length > 0);

    const unassignedTools = financeTools.filter(
        (tool) => !assignedSlugs.has(tool.slug)
    );

    if (unassignedTools.length > 0) {
        groups.push({
            id: 'additional-finance-calculators',
            label: 'More Calculators',
            heading: 'Additional Financial Calculators',
            description:
                'Recently published browser-based financial calculators in the KivaroTools directory.',
            slugs: unassignedTools.map((t) => t.slug),
            tools: unassignedTools,
        });
    }

    return groups;
}