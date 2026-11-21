import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const EMI_CALCULATOR_FAQS: FaqItem[] = [
  {
    question: 'What is an Equated Monthly Installment (EMI) and how does it work?',
    answer:
      'An Equated Monthly Installment (EMI) is a fixed payment amount made by a borrower to a lender on a set date each month. Each EMI is divided into two parts: interest charged on the remaining unpaid principal, and principal repayment that reduces the balance. As principal declines, the interest portion shrinks and the principal portion grows until the loan reaches zero at maturity.',
  },
  {
    question: 'When making a loan prepayment, should I reduce my tenure or reduce my monthly EMI (Re-Cast)?',
    answer:
      'Reducing tenure keeps your scheduled payment unchanged and maximizes total interest saved because principal drops faster. On a $500,000 loan at 10% p.a. over 5 years (baseline interest $137,411.34), a $50,000 lump-sum prepayment at Month 12 saves $22,669.11 in Reduce Term mode (payoff in 4 yrs 6 mos) versus $10,870.20 in Reduce Payment (Re-Cast) mode (which lowers your monthly payment from $10,623.52 to $9,355.39 while keeping the 5-year end date). Toggle both modes under Advanced Payoff & Fee Options to compare.',
  },
  {
    question: 'Why is most of my early EMI going toward interest instead of principal?',
    answer:
      'On a reducing-balance loan, periodic interest is calculated on the remaining unpaid principal — which is highest at the start of the loan. Making extra payments or a lump-sum prepayment earlier in the schedule removes principal when interest charges are largest.',
  },
  {
    question: 'What is the standard mathematical formula for calculating EMI?',
    answer:
      'For a standard reducing-balance loan in arrears, periodic payment is E = P * r * (1 + r)^n / ((1 + r)^n - 1), where P is principal, r is the periodic rate (nominal annual rate divided by periods per year and 100), and n is total periods. When the interest rate is 0%, the formula simplifies to E = P / n.',
  },
  {
    question: 'Why does an EMI calculator effective annual rate (EAR / XIRR) look higher than the stated annual rate?',
    answer:
      'Standard amortizing loan calculators convert nominal annual rates using r = annualRate / periodsPerYear (for example, 10% / 12 = 0.8333% per month). Because interest compounds each period, the equivalent Effective Annual Rate (EAR) is slightly higher than the stated nominal rate. KivaroTools documents this nominal periodic convention in the Methodology & Assumptions tab.',
  },
  {
    question: 'Can I add part-payments directly inside the EMI calculator (lump-sum at Month 12 vs. extra every month)?',
    answer:
      'Yes. Expand Advanced Payoff & Fee Options to enter an Extra Recurring Payment, a One-Time Prepayment at any Applied at Period # (in Reduce Term, Reduce Payment / Re-Cast, or Immediate mode), or both together to see exact Interest Saved, Time Saved, and Total Cost Saved.',
  },
  {
    question: 'How can I audit my bank amortization schedule in Excel or export a biweekly or weekly CSV?',
    answer:
      'Enter your loan terms, choose Monthly (12/yr), Biweekly (26/yr), or Weekly (52/yr), and click Export Amortization CSV to download an RFC-4180 schedule (with formula-injection protection) or Share Scenario to copy a pre-filled link with zero signup. Note that lender Actual/360 or Actual/365 day-count conventions may create minor rounding differences.',
  },
  {
    question: 'How does switching to biweekly or weekly payments affect loan interest and payoff?',
    answer:
      'Selecting Biweekly (26/yr) or Weekly (52/yr) in Payment Frequency recalculates a standard amortizing schedule over years × 26 or years × 52 periods, reducing principal more frequently for modest interest savings over the same tenure. To model an accelerated biweekly schedule (26 half-monthly payments = 13 monthly payments per year), add an Extra Recurring Payment equal to one-twelfth of a monthly payment spread across 26 cycles.',
  },
  {
    question: 'What is the difference between EMI in Advance (Annuity Due) and EMI in Arrears (Ordinary Annuity)?',
    answer:
      'In Arrears (End of Period) means Payment 1 is billed one period after loan funding after interest accrues — standard for most personal and auto loans. In Advance (Beginning of Period) means Payment 1 is deducted on Day 1 before interest accrues (E_due = E_ordinary / (1 + r)), lowering total lifetime interest. Toggle both in Payment Timing.',
  },
  {
    question: 'Do standard EMI calculators include origination fees and monthly servicing fees?',
    answer:
      'Most basic calculators exclude lender fees. KivaroTools includes dedicated Origination Fee and Periodic Fee fields under Advanced Payoff & Fee Options and rolls them into Total Loan Fees, Total Amount Paid (Economic Loan Cost), and the period-by-period Fee column in both the schedule table and CSV export.',
  },
  {
    question: 'Does this calculator compute official regulatory APR (RBI KFS APR, US TILA APR, UK Representative APR, or AU Comparison Rate)?',
    answer:
      'No. This tool calculates deterministic reducing-balance P&I amortization and total economic fee outlay for planning purposes, not jurisdiction-specific regulatory APRs (such as RBI KFS, US CFPB TILA actuarial IRR, UK Representative APR, Australian Comparison Rate, SAMA, BSP, or NCA disclosures). Always verify the binding disclosure provided by your lender.',
  },
  {
    question: 'Does this calculator work for 0% interest promotional retail or auto financing?',
    answer:
      'Yes. Entering 0% interest uses a clean linear fallback (E = P / n) without division-by-zero errors — for example, $25,000 over 60 months equals $416.67 per month with $0.00 interest — while still tracking any upfront origination or monthly servicing fees.',
  },
  {
    question: 'Can I enter loan tenures in months or decimal years (such as 18 months or 2.5 years)?',
    answer:
      'Yes. Use the Yrs / Mos toggle next to Loan Tenure to enter exact months (such as 6, 18, 30, or 42 months) or enter decimal years directly (such as 2.5 years = 30 monthly payments). The engine computes exact total periods using n = Math.round(years × periodsPerYear).',
  },
  {
    question: 'Can I pay off a personal loan early, and what about prepayment penalties or UK Early Repayment Charges (ERCs)?',
    answer:
      'Many personal and auto loans allow early repayment, though some fixed-rate contracts charge prepayment fees. For example, in the UK, overpaying more than £8,000 per year can trigger an Early Repayment Charge (commonly up to 1% if more than 1 year remains, or 0.5% in the final year). Use this tool to estimate interest saved, then compare it against your lender contract fee.',
  },
  {
    question: 'Should I use this EMI Calculator or the Mortgage Calculator for a home loan?',
    answer:
      'Use this EMI Calculator for personal loans, car and bike loans, retail installment plans, or pure principal-and-interest prepayment comparisons. Use the KivaroTools Mortgage Calculator when you need Down Payment %, property tax, homeowners insurance, HOA dues, and automatic 80% LTV PMI (PITI) modeling.',
  },
  {
    question: 'Are my loan amounts and financial inputs sent to a server or shared with banks?',
    answer:
      'No. All loan calculations, prepayment recasts, amortization tables, and CSV exports run locally in your browser via client-side JavaScript. Your entered loan amounts, interest rates, and fees are never uploaded to KivaroTools servers or shared with lenders. (Standard site-level analytics and ad scripts operate separately per our Privacy Policy and do not read your calculator inputs.)',
  },
];

export default function EmiCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: EMI_CALCULATOR_FAQS.map((faq) => ({
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
    name: 'How to Calculate Loan EMI, Prepayments, Fees, and Amortization Schedules',
    description:
      'Step-by-step instructions to calculate reducing-balance loan EMI, compare Reduce Term vs. Reduce Payment (Re-Cast) prepayments, model fees, and export an RFC-4180 CSV schedule on KivaroTools.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Select Currency and Enter Principal, Rate & Tenure',
        text: 'Pick from 42 world currencies (including USD, INR with lakh/crore grouping, PKR, AED, SAR, GBP, AUD, PHP, and ZAR), enter your loan principal, nominal annual interest rate (0% to 100%), and tenure in Years or Months.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Choose Payment Frequency and Timing',
        text: 'Select Monthly (12/yr), Biweekly (26/yr), or Weekly (52/yr), and choose End of Period (In Arrears) or Beginning of Period (In Advance).',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Model Extra Payments, Prepayment Recast & Fees',
        text: 'Expand Advanced Payoff & Fee Options to add an Extra Recurring Payment, a One-Time Prepayment at any period (Reduce Term, Reduce Payment Re-Cast, or Immediate), plus Origination and Periodic Fees.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Audit the Schedule, Share URL, or Export CSV',
        text: 'Inspect the period-by-period Amortization Schedule, Yearly Summary, and Total Economic Loan Cost, then click Export Amortization CSV or Share Scenario with zero signup.',
      },
    ],
  };

  return (
    <>
      {/* FAQPage & HowTo JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-xs">
        {/* Top Scope & C6 Boundary Callout */}
        <div className="not-prose mb-6 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs sm:text-sm text-indigo-950 dark:text-indigo-100 leading-relaxed">
            <strong>Built for Personal, Auto &amp; Retail Installment Loans:</strong> Planning a home purchase with Down Payment %, Property Taxes, Insurance, HOA, or 80% LTV PMI?
          </div>
          <Link
            href="/finance/mortgage-calculator"
            className="shrink-0 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition"
          >
            Open Mortgage (PITI) Calculator &rarr;
          </Link>
        </div>

        {/* Intro Section */}
        <section aria-labelledby="emi-calculator-guide-overview" className="mb-8">
          <h2 id="emi-calculator-guide-overview" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Loan EMI &amp; Amortization Guide: Prepayments, Fees &amp; Repayment Strategies
          </h2>
          <blockquote className="p-4 my-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg dark:bg-slate-800 not-italic">
            <p className="text-sm text-slate-700 dark:text-slate-300 m-0">
              <strong>Client-Side Calculation Privacy:</strong> All reducing-balance calculations, prepayment recasts, amortization tables, and CSV exports run locally in your browser. Your entered loan amounts, rates, and fee inputs are never uploaded to KivaroTools servers or shared with lenders.
            </p>
          </blockquote>
          <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
            An <strong>Equated Monthly Installment (EMI)</strong> is a structured periodic payment made by a borrower to a lender on a fixed schedule. EMIs are the standard amortization model for personal loans, car and two-wheeler auto loans, and consumer retail installment plans. By splitting every payment between accrued interest and principal reduction, the balance steadily declines to zero by maturity.
          </p>
        </section>

        {/* Tool Workflow & Core Functionality Highlights */}
        <section aria-labelledby="emi-functionality-highlights" className="mb-8">
          <h2 id="emi-functionality-highlights" className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">
            Core Capabilities &amp; Calculation Workflow
          </h2>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Built as a fast, ad-light <strong>loan amortization calculator</strong> and <strong>equated monthly installment calculator</strong> for personal loans, car and bike loans, and 0% retail financing, every calculation runs deterministically in your browser with zero signup:
          </p>
          <div className="not-prose grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 p-4">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm mb-1">
                42 Currencies + INR Lakh/Crore
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed m-0">
                Supports USD, INR (with 12,34,567.89 grouping), PKR, AED, SAR, GBP, AUD, PHP, ZAR, and 3-decimal Gulf currencies (BHD, KWD, OMR) using clean ISO codes.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 p-4">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm mb-1">
                Reduce Term vs. Re-Cast Prepayments
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed m-0">
                Combine Extra Recurring Payments with a One-Time Prepayment in Reduce Term, Reduce Payment (Re-Cast), or Immediate mode with exact Interest &amp; Time Saved.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 p-4">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm mb-1">
                Monthly, Biweekly &amp; Weekly + Timing
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed m-0">
                Switch between Monthly (12/yr), Biweekly (26/yr), and Weekly (52/yr) schedules, Years or Months tenure, and In Arrears vs. In Advance payment timing.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 p-4">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm mb-1">
                Origination &amp; Periodic Loan Fees
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed m-0">
                Adds upfront origination fees and monthly servicing charges directly into Total Economic Loan Cost, Yearly Summary, and the schedule Fee column.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 p-4">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm mb-1">
                0% Promotional Financing Support
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed m-0">
                Cleanly divides principal across periods (E = P / n) at 0% interest with zero division-by-zero errors while still tracking upfront or monthly fees.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 p-4">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm mb-1">
                1-Click RFC-4180 CSV &amp; Share URL
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed m-0">
                Export your full amortization schedule to Excel/CSV (with formula-injection protection) or copy a pre-filled Share Scenario link with all 11 parameters.
              </p>
            </div>
          </div>
        </section>

        {/* How to Use Section (Clean 4-Step Cards with list-none so no external markers render) */}
        <section aria-labelledby="emi-how-to-use" className="mb-8">
          <h2 id="emi-how-to-use" className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">
            How to Use This Loan EMI &amp; Amortization Calculator
          </h2>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Whether you are comparing personal loan offers, testing weekly or biweekly auto payments, or checking whether a lump-sum prepayment should shorten your tenure or lower your monthly EMI, follow these four steps:
          </p>
          <ol className="not-prose list-none pl-0 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <li className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1.5">
                Step 1 &middot; Currency, Principal, Rate &amp; Tenure
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed m-0">
                Choose from 42 currencies (including USD, INR with lakh/crore grouping, PKR, AED, SAR, GBP, AUD, PHP, and ZAR), enter your principal ($0&ndash;$100M), nominal annual rate (0%&ndash;100%), and tenure using the <strong>Yrs / Mos</strong> toggle (or click a quick example preset).
              </p>
            </li>
            <li className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1.5">
                Step 2 &middot; Payment Frequency &amp; Timing
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed m-0">
                Select <strong>Monthly (12/yr)</strong>, <strong>Biweekly (26/yr)</strong>, or <strong>Weekly (52/yr)</strong>, and toggle between <strong>End of Period (In Arrears)</strong> for standard loans or <strong>Beginning of Period (In Advance)</strong> for annuity-due leases and retail finance.
              </p>
            </li>
            <li className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1.5">
                Step 3 &middot; Add Prepayments &amp; Lender Fees
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed m-0">
                Open <strong>Advanced Payoff &amp; Fee Options</strong> to enter an Extra Recurring Payment, a One-Time Prepayment at a specific Period # (<strong>Reduce Term</strong>, <strong>Reduce Payment Re-Cast</strong>, or <strong>Immediate</strong>), plus Origination and Periodic Fees.
              </p>
            </li>
            <li className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1.5">
                Step 4 &middot; Audit Schedule &amp; Export CSV
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed m-0">
                Review Principal vs. Interest %, Economic Loan Cost, and Accelerated Payoff Savings, inspect the period-by-period or Yearly Summary table, and click <strong>Export Amortization CSV</strong> or <strong>Share Scenario</strong> with zero signup.
              </p>
            </li>
          </ol>
        </section>

        {/* Section 1: Reducing-Balance EMI Formula */}
        <section aria-labelledby="emi-calculator-1-how-the-reducing-balance-emi" className="mb-8">
          <h3 id="emi-calculator-1-how-the-reducing-balance-emi" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            1. How the Reducing-Balance EMI Formula Works
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Commercial banks and credit unions calculate fixed-rate amortizing installment credit using the standard reducing-balance formula:
          </p>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 font-mono text-sm sm:text-base mb-6 text-center text-slate-900 dark:text-slate-100">
            E = P &times; r &times; [ (1 + r)^n ] / [ (1 + r)^n &minus; 1 ]
          </div>

          <div className="overflow-x-auto overscroll-x-contain mb-6">
            <table className="min-w-[640px] w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Variable</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Definition</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Calculation Method &amp; Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">E</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">EMI Installment</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">The fixed periodic payment required to retire the loan balance by maturity (or E = P / n when r = 0%).</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">P</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Principal Amount</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">The original borrowed sum disbursed by the lender before interest or fees.</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">r</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Periodic Rate</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Annual nominal rate divided by periods per year and 100 (e.g., 8.5% annual / 12 = 0.0070833).</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">n</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Total Periods</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Total number of scheduled payments: Math.round(years &times; periodsPerYear) (e.g., 5 yrs monthly = 60).</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Step-by-Step Worked Numerical Example */}
        <section aria-labelledby="emi-calculator-2-step-by-step-worked-numerica" className="mb-8">
          <h3 id="emi-calculator-2-step-by-step-worked-numerica" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            2. Step-by-Step Worked Numerical Example ($100,000 at 8.5% for 5 Years)
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            To demonstrate the exact mathematical execution, consider an installment loan of <strong>$100,000</strong> at an annual nominal interest rate of <strong>8.5%</strong> over a <strong>5-year</strong> repayment tenure (60 monthly installments, End of Period):
          </p>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 mb-6 text-sm text-slate-700 dark:text-slate-300">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">Step 1: Convert Annual Rate to Monthly Periodic Rate</span>
              <p className="font-mono text-xs mt-1 text-slate-600 dark:text-slate-400">
                r = 8.5 / 100 / 12 = 0.007083333333333333
              </p>
            </div>
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">Step 2: Calculate Compounding Factor (1 + r)^n</span>
              <p className="font-mono text-xs mt-1 text-slate-600 dark:text-slate-400">
                (1 + 0.007083333333333333)^60 &#8776; 1.527318357
              </p>
            </div>
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">Step 3: Compute Numerator and Denominator</span>
              <p className="font-mono text-xs mt-1 text-slate-600 dark:text-slate-400">
                Numerator = $100,000 &times; 0.007083333333333333 &times; 1.527318357 &#8776; 1,081.850503
              </p>
              <p className="font-mono text-xs mt-1 text-slate-600 dark:text-slate-400">
                Denominator = 1.527318357 &minus; 1 = 0.527318357
              </p>
            </div>
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">Step 4: Solve for Monthly EMI</span>
              <p className="font-mono text-xs mt-1 text-slate-600 dark:text-slate-400">
                EMI = 1,081.850503 / 0.527318357 = $2,051.65 per month (unrounded: $2,051.6531)
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
              <p className="m-0">
                <strong>Engine-Verified Summary:</strong> Total repayment over 60 months equals <strong>$123,099.19</strong>, comprising <strong>$100,000.00</strong> principal and <strong>$23,099.19</strong> cumulative interest. In Month 1, interest is $708.33 and principal paid is $1,343.32, leaving a closing balance of $98,656.68.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Prepayment Optimization — Reduce Tenure vs. Reduce Payment (Re-Cast) */}
        <section aria-labelledby="emi-prepayment-recast-comparison" className="mb-8">
          <h2 id="emi-prepayment-recast-comparison" className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">
            3. One-Time Prepayment &amp; Extra Payments: Reduce Tenure vs. Reduce Payment (Re-Cast)
          </h2>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            KivaroTools lets you model recurring extra payments and one-time lump-sum prepayments in three modes: <strong>Reduce Term (Shorten Loan)</strong>, <strong>Reduce Payment (Re-Cast)</strong>, and <strong>Immediate (At Inception)</strong>. The table below compares exact engine outputs on a <strong>$500,000</strong> loan at <strong>10% p.a.</strong> over <strong>5 years</strong> (Monthly, In Arrears):
          </p>

          <div className="overflow-x-auto overscroll-x-contain mb-6 not-prose">
            <table className="min-w-[680px] w-full text-xs sm:text-sm text-left border-collapse border border-slate-200 dark:border-slate-800">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                  <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700">Scenario ($500k &middot; 10% &middot; 5 yrs)</th>
                  <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 text-right">Monthly EMI</th>
                  <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 text-right">Total Interest</th>
                  <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 text-right">Interest Saved</th>
                  <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 text-right">Payoff Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                <tr>
                  <th scope="row" className="p-3 font-sans font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Baseline (No Prepayment)</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right">$10,623.52</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right">$137,411.34</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right">&mdash;</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right font-sans">5 yrs (60 mos)</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-sans font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">+$50,000 at Month 12 (Re-Cast)</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right">$9,355.39*</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right">$126,541.14</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right text-emerald-600 dark:text-emerald-400">$10,870.20</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right font-sans">5 yrs (60 mos)</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-sans font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">+$50,000 at Month 12 (Reduce Term)</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right">$10,623.52</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right">$114,742.23</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right text-emerald-600 dark:text-emerald-400">$22,669.11</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right font-sans">4 yrs 6 mos (54 mos)</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-sans font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">+$2,000/mo Extra Recurring</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right">$12,623.52</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right">$109,349.70</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right text-emerald-600 dark:text-emerald-400">$28,061.64</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right font-sans">4 yrs 1 mo (49 mos)</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-sans font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">+$2k/mo + $50k at Mo 12 (Re-Cast)</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right">$8,718.00* + $2k</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right">$103,101.47</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right text-emerald-600 dark:text-emerald-400">$34,309.87</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right font-sans">4 yrs 2 mos (50 mos)</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-sans font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">+$2k/mo + $50k at Mo 12 (Reduce Term)</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right">$12,623.52</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right">$92,967.83</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right text-emerald-600 dark:text-emerald-400">$44,443.51</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right font-sans">3 yrs 8 mos (44 mos)</td>
                </tr>
              </tbody>
            </table>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              *Recast scheduled payment applies from Month 13 onward after the Month 12 lump-sum prepayment reduces remaining principal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Tenure Reduction (Term Shortening)</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 m-0">
                Maintains your regular scheduled payment, directing 100% of the prepayment to accelerate principal elimination. This extinguishes the debt earlier and delivers the highest cumulative interest savings.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Payment Reduction (Re-Casting)</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 m-0">
                Re-amortizes the lower remaining balance across the remaining original periods, permanently lowering your required monthly obligation for ongoing cash-flow relief.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Global & Regional Loan Examples */}
        <section aria-labelledby="emi-regional-examples" className="mb-8">
          <h2 id="emi-regional-examples" className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">
            4. Global &amp; Regional Loan Scenarios (Multi-Currency, Fees &amp; 0% Promo)
          </h2>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Because KivaroTools formats 42 currencies (including INR lakh/crore grouping and clean ISO codes for AED, SAR, QAR, OMR, KWD, and BHD) without forcing currency conversion, you can model local personal, auto, and retail loans directly:
          </p>
          <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs sm:text-sm">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
                Philippines Personal Loan (PHP &mdash; Extra Monthly Payment)
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed m-0">
                <strong>&#8369;300,000</strong> at <strong>12% p.a.</strong> for <strong>3 years</strong>: Base EMI is <strong>&#8369;9,964.29/mo</strong> (&#8369;58,714.55 interest). Adding <strong>+&#8369;2,000/mo</strong> extra cuts interest to <strong>&#8369;47,106.83</strong> (saving &#8369;11,607.72) and finishes 6 months early (30 months).
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
                Saudi Arabia Financing (SAR &mdash; Upfront Origination Fee)
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed m-0">
                <strong>SAR 100,000</strong> at <strong>6% p.a.</strong> for <strong>5 years</strong> with a <strong>SAR 1,000</strong> origination fee: Base EMI is <strong>SAR 1,933.28/mo</strong>, total interest is <strong>SAR 15,996.81</strong>, and Total Economic Loan Cost is <strong>SAR 116,996.81</strong>.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
                South Africa Auto Loan (ZAR &mdash; Service Fee + Month 12 Prepayment)
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed m-0">
                <strong>R150,000</strong> at <strong>11.5% p.a.</strong> for <strong>5 years</strong> with a <strong>R69/mo</strong> service fee: Base EMI is <strong>R3,298.89/mo</strong> (R47,933.47 interest + R4,140.00 fees). Adding a <strong>R10,000</strong> prepayment at Month 12 (Reduce Term) cuts payoff to 56 months, lowering interest to <strong>R42,408.86</strong> and fees to <strong>R3,864.00</strong> (total savings R5,800.61).
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
                US / Global 0% Retail &amp; Auto Promo (USD &mdash; Linear Fallback)
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed m-0">
                <strong>$25,000</strong> at <strong>0% p.a.</strong> for <strong>5 years</strong> (60 mos): Cleanly computes <strong>$416.67/mo</strong> with <strong>$0.00 interest</strong> and zero division-by-zero errors. At 10% p.a. instead, adding +$100/mo extra plus $1,000 at Month 12 saves <strong>$1,748.16</strong> in interest and <strong>13 months</strong>.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
                Pakistan Personal / Bike Loan (PKR &mdash; Extra Monthly Payment)
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed m-0">
                <strong>&#8360;500,000</strong> at <strong>18% p.a.</strong> for <strong>36 months</strong> (3 yrs): Base installment is <strong>&#8360;18,076.20/mo</strong> (&#8360;150,743.12 interest). Adding <strong>+&#8360;3,000/mo</strong> extra cuts interest to <strong>&#8360;122,653.37</strong> (saving &#8360;28,089.75) and finishes 6 months early (30 months).
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
                UAE Car / Personal Loan (AED &mdash; Clean ISO Display + Origination Fee)
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed m-0">
                <strong>AED 100,000</strong> at <strong>7% p.a.</strong> for <strong>48 months</strong> (4 yrs) with an <strong>AED 1,000</strong> origination fee: Base EMI is <strong>AED 2,394.62/mo</strong>, total interest is <strong>AED 14,941.97</strong>, and Total Economic Loan Cost is <strong>AED 115,941.97</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Payment Frequency & Timing Conventions */}
        <section aria-labelledby="emi-calculator-6-payment-frequency-optimizati" className="mb-8">
          <h3 id="emi-calculator-6-payment-frequency-optimizati" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            5. Monthly, Biweekly &amp; Weekly Schedules, In-Advance Timing &amp; CSV Audit
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Switching <strong>Payment Frequency</strong> to <strong>Biweekly (26/yr)</strong> or <strong>Weekly (52/yr)</strong> recalculates a standard amortizing schedule over <code>years &times; 26</code> or <code>years &times; 52</code> periods, reducing principal slightly faster over the same loan term. If you want to model an <em>accelerated biweekly</em> payoff (paying half of a monthly payment 26 times per year — equal to 13 monthly payments annually), enter the additional biweekly amount under <strong>Extra Recurring Payment</strong>.
          </p>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Every schedule can be downloaded via <strong>Export Amortization CSV</strong> (RFC-4180 compliant with spreadsheet formula-injection protection) containing full metadata headers plus the columns: <code>Period</code>, <code>Opening Balance</code>, <code>Scheduled Payment</code>, <code>Extra Payment</code>, <code>Total Payment</code>, <code>Principal Paid</code>, <code>Interest Paid</code>, <code>Fee Paid</code>, and <code>Closing Balance</code>.
          </p>
        </section>

        {/* Section 6: Reducing Balance vs. Flat Rate (Educational Comparison) */}
        <section aria-labelledby="emi-calculator-3-reducing-balance-vs-flat-rat" className="mb-8">
          <h3 id="emi-calculator-3-reducing-balance-vs-flat-rat" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            6. Reducing Balance vs. Flat Rate: Understanding the Borrowing Cost Trap
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            This calculator models <strong>reducing-balance amortization only</strong> (the standard used by commercial banks and credit unions). Borrowers comparing dealer quotes should note how flat-rate marketing differs: a flat interest rate charges interest on the entire original principal for the full tenure, making a quoted 10% flat rate roughly equivalent to a 17% to 19% reducing-balance rate.
          </p>
          <div className="overflow-x-auto overscroll-x-contain mb-6">
            <table className="min-w-[640px] w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Attribute</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Reducing Balance (Modeled Here)</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Flat Rate (Dealer Quote &mdash; Reference Only)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Interest Base</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Only on current unpaid principal.</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">On full original principal for the entire tenure.</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Interest Trajectory</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Decreases each period as balance falls.</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Remains fixed every period.</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Effective Cost vs. Stated Rate</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Matches stated nominal periodic rate.</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Roughly 1.7&times; to 1.9&times; higher than the stated flat rate.</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Prepayment Benefit</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Immediately lowers future interest charges.</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Often minimal unless rebate terms apply.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 7: Origination Fees, Servicing Fees & Budgeting */}
        <section aria-labelledby="emi-calculator-7-fee-transparency-origination" className="mb-8">
          <h3 id="emi-calculator-7-fee-transparency-origination" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            7. Origination Fees, Periodic Service Charges &amp; DTI Budgeting
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            A nominal interest rate alone rarely reflects total borrowing cost. Upfront origination fees (commonly 0.5% to 3.0% of principal) and monthly account servicing fees increase your total cash outflow. KivaroTools reconciles <code>Principal + Interest + Origination Fee + Recurring Fees = Total Economic Loan Cost</code> transparently.
          </p>
          <ul className="list-disc list-inside space-y-1.5 mb-6 text-sm text-slate-600 dark:text-slate-400">
            <li><strong>Under 36% Total DTI:</strong> Common benchmark for healthy total monthly debt obligations relative to gross income.</li>
            <li><strong>Shorter Tenures (2&ndash;3 yrs):</strong> Higher monthly installments, but significantly lower cumulative interest.</li>
            <li><strong>Longer Tenures (7&ndash;10 yrs):</strong> Lower monthly cash outflow, but substantially higher total interest paid over time.</li>
          </ul>
        </section>

        {/* Section 8: Verified Capabilities Matrix */}
        <section aria-labelledby="emi-calculator-technical-capabilities-matrix" className="mb-8">
          <h3 id="emi-calculator-technical-capabilities-matrix" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            8. KivaroTools EMI Engine: Verified Capabilities &amp; Model Boundaries
          </h3>
          <div className="overflow-x-auto overscroll-x-contain mb-6">
            <table className="min-w-[680px] w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Module</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Supported Inputs</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Engine Logic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Currencies &amp; Principal</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">42 world currencies (0, 2, or 3 decimal minor units; INR lakh/crore grouping; clean ISO codes for AED/SAR/QAR/OMR/KWD/BHD). Principal 0 to 100,000,000.</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Reducing-balance principal with non-negative clamping and symbol/comma sanitization.</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Rate &amp; Tenure</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Nominal annual rate 0%&ndash;100%; Tenure 0&ndash;50 years (or 0&ndash;600 months via Yrs/Mos toggle; decimal years supported).</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">r = annualRate / 100 / m; exact linear fallback E = P / n at 0% interest.</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Frequency &amp; Timing</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Monthly (12/yr), Biweekly (26/yr), Weekly (52/yr); End of Period (In Arrears) &amp; Beginning of Period (In Advance).</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Ordinary Annuity and Annuity Due (E_due = E_ordinary / (1 + r)) with 64-bit IEEE 754 precision.</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Prepayments &amp; Fees</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Extra Recurring Payment, One-Time Prepayment (Reduce Term, Re-Cast, or Immediate), Origination Fee, Periodic Fee.</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Flags unapplied prepayments past payoff; reconciles Principal + Interest + Fees = Total Cost.</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Exports &amp; Sharing</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Period-by-period Amortization Schedule, Yearly Summary, RFC-4180 CSV download, Share Scenario URL.</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Encodes all 11 loan parameters + currency in URL query string; formula-injection safe CSV.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            <strong>Explicit Model Limitations:</strong> This tool does <em>not</em> model flat-rate loans, floating/variable rate resets, moratorium interest capitalization, balloon/PCP residual payments, Canadian semi-annual compounding, Actual/360 or Actual/365 day-count conventions, lender prepayment penalties, or statutory regulatory APR disclosures (RBI KFS, US TILA, UK Representative APR, AU Comparison Rate).
          </p>
        </section>

        {/* Section 9: Top Global Competitors Comparison Table (Zero Fake Claims) */}
        <section aria-labelledby="emi-competitor-comparison" className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 mb-8">
          <h2 id="emi-competitor-comparison" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            9. Global Competitor Comparison: KivaroTools vs. Top Loan EMI Calculators
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm sm:text-base leading-relaxed">
            Every row below reflects verified, inspected capabilities (no fabricated features, and transparent disclosure where other tools offer charts or local statutory APR calculations):
          </p>
          <div className="w-full max-w-full overflow-x-auto overscroll-x-contain my-6 not-prose">
            <table className="min-w-[760px] w-full text-xs sm:text-sm text-left border-collapse border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                  <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">Capability</th>
                  <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-bold">KivaroTools</th>
                  <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">Calculator.net</th>
                  <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">EMICalculator.net</th>
                  <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">CalculatorSoup</th>
                  <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">CalcBE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Currencies &amp; Formatting</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">42 currencies (INR lakh/crore + clean AED/SAR ISO)</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">USD only</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">INR only (lakh/crore)</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">USD only</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Single default</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Reduce Term vs. Re-Cast Prepayments</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">Extra recurring + 3-mode one-time (Reduce Term, Re-Cast, Immediate)</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">No extra / recast</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Main page omits part-payments &amp; recast</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">No extra / recast</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Extra payments (no 3-mode recast)</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Monthly, Biweekly &amp; Weekly</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">Monthly (12), Biweekly (26), Weekly (52)</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Monthly only</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Monthly only</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Monthly only</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Multiple schedules</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">In Arrears vs. In Advance Timing</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">Both (all loan types)</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">In Arrears only</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Yes (INR)</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Yes (USD)</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">In Arrears only</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Origination &amp; Periodic Fees</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">Both (Economic Cost + Fee column)</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Yes (computes APR)</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Excluded</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Excluded</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Excluded</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">1-Click CSV Export &amp; Share Link</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">RFC-4180 CSV + Share URL (no signup)</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">No CSV export</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">PDF / Excel export</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Share link (no CSV)</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">CSV export</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Interactive Charts / Statutory APR</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Static P/I/Fees bar; nominal periodic rate</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Chart + real APR</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Highcharts visuals</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Table only</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Table + CSV</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 10: Frequently Asked Questions */}
        <section aria-labelledby="emi-calculator-9-frequently-asked-questions" className="mb-8">
          <h2 id="emi-calculator-9-frequently-asked-questions" className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3 not-prose">
            {EMI_CALCULATOR_FAQS.map((faq, index) => (
              <details
                key={index}
                className="group rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 transition-colors"
              >
                <summary className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base cursor-pointer select-none list-none flex items-center justify-between gap-3">
                  <span>{faq.question}</span>
                  <span className="ml-2 text-slate-400 group-open:rotate-180 transition-transform shrink-0">&#9662;</span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Section 11: Related Financial Calculators */}
        <section aria-labelledby="emi-calculator-10-related-financial-calculato" className="mb-4">
          <h3 id="emi-calculator-10-related-financial-calculato" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            Related Financial Calculators on KivaroTools
          </h3>
          <p className="leading-relaxed text-slate-600 dark:text-slate-400 text-sm mb-4">
            Explore related personal finance, lending, and take-home pay tools on KivaroTools:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
            <li>
              <Link href="/finance/mortgage-calculator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Mortgage &amp; Home Loan Calculator
              </Link>
              : Model residential home loans with Down Payment %, property taxes, homeowners insurance, HOA, and automatic 80% LTV PMI drop-off.
            </li>
            <li>
              <Link href="/finance/compound-interest" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Compound Interest Calculator
              </Link>
              : Compare paying down debt early against long-term compounding investment returns.
            </li>
            <li>
              <Link href="/finance/sip-calculator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                SIP &amp; Mutual Funds Calculator
              </Link>
              : Project systematic monthly investment growth across 154 currencies.
            </li>
            <li>
              <Link href="/finance/invoice-generator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Pro Invoice Generator (PDF)
              </Link>
              : Create print-ready multi-currency PDF invoices directly in your browser.
            </li>
            <li>
              <Link href="/finance/crypto-converter" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Crypto &amp; Currency Converter
              </Link>
              : Compare live exchange rates and simulate bank spread fees.
            </li>
            <li>
              <Link href="/finance/precious-metals" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Precious Metals Scrap Calculator
              </Link>
              : Estimate gold, silver, and platinum melt values across global currencies.
            </li>
            <li>
              Net Take-Home Salary Calculators:{' '}
              <Link href="/finance/salary-calculator/india" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                India
              </Link>
              ,{' '}
              <Link href="/finance/salary-calculator/pakistan" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Pakistan
              </Link>
              , and{' '}
              <Link href="/finance/salary-calculator/united-arab-emirates" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                United Arab Emirates
              </Link>{' '}
              (check monthly take-home pay before setting an EMI budget).
            </li>
          </ul>

          {/* Financial Advisory Disclaimer */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200 text-xs">
            <p className="font-bold mb-1">Financial Planning &amp; Non-Advisory Disclaimer</p>
            <p className="m-0">
              This calculator provides deterministic mathematical projections for planning and educational purposes based on user-supplied parameters. It does not constitute financial, lending, tax, or legal advice, and does not compute jurisdiction-specific regulatory APRs. Actual loan terms, day-count conventions, taxes, insurance, and prepayment penalties vary by lender and jurisdiction. Always verify your lender&apos;s binding loan disclosure statement.
            </p>
          </div>
        </section>
      </article>
    </>
  );
}