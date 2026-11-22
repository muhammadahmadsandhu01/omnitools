import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const COMPOUND_INTEREST_FAQS: FaqItem[] = [
  {
    question: 'How do I model compound growth for 15–20 years and then switch to monthly retirement withdrawals?',
    answer:
      'Toggle Retirement & Drawdown Phase ON, set your Accumulation Phase Duration (for example, 15 or 20 years), enter an Investment Period longer than your accumulation duration (such as 30 years), enter your Retirement Monthly Withdrawal, and optionally adjust withdrawals for inflation to detect any portfolio depletion year automatically.',
  },
  {
    question: 'How do I calculate compound interest with increasing or inflation-adjusted monthly contributions (3%–5% step-up)?',
    answer:
      'Open Advanced Cash Flows, Fees & Taxes and set Annual Contribution Escalation (%/yr) to match expected annual raises or inflation (such as 3% to 5% per year), then toggle Inflation Adjustment (Real Value) ON to view today’s purchasing power side by side with nominal balances.',
  },
  {
    question: 'How do inflation, tax drag, and a 1% AUM management fee reduce real purchasing power over 20 to 30 years?',
    answer:
      'Enter Annual Management Fee / Expense Drag (%), Estimated Tax Rate (%), and Expected Annual Inflation (%) together. In our engine verification ($10,000 initial + $500/month at 7% nominal over 20 years with 3% annual step-up), 15% taxable drag plus 3% inflation reduces a $325,097.31 nominal balance to $179,998.50 in real purchasing power (-44.6%). Over 30 years at 8% ($10,000 + $500/month), a 1% annual AUM fee reduces ending wealth from $854,537.02 to $691,150.47 (-19.1%).',
  },
  {
    question: 'What is the difference between Taxable, Tax-Deferred (401k/IRA), and Tax-Exempt (Roth/ISA/TFSA) compounding?',
    answer:
      'Taxable brokerage mode applies annual tax drag on realized gains each period; Tax-Deferred mode (traditional 401(k)/IRA) compounds gross and applies exit tax on gains at withdrawal; Tax-Exempt mode (Roth IRA, UK ISA, Canada TFSA, South Africa TFSA) models 0% tax on growth, subject to statutory annual contribution caps such as US IRS 401(k)/IRA limits (2026: $24,500 / $7,500; 2027: $25,500), UK GOV.UK ISA (£20,000/yr), and Canada CRA TFSA ($7,000 CAD/yr).',
  },
  {
    question: 'What is the difference between nominal annual rate, daily (365/yr) vs. monthly (12/yr) compounding, and Effective APY?',
    answer:
      'The nominal annual rate is the stated rate before intra-year compounding, while Effective APY reflects the true annualized yield: APY = (1 + r/m)^m - 1. On KivaroTools, an 8.00% nominal annual rate yields 8.300% Effective APY when compounded monthly (12/yr) and 8.328% Effective APY when compounded daily (365/yr).',
  },
  {
    question: 'How do I calculate daily compound interest with 20% withholding tax in the Philippines?',
    answer:
      'Select PHP (₱) from the currency menu, set Compounding Frequency to Daily (365/yr), open Advanced Cash Flows, Fees & Taxes to keep Tax Treatment on Taxable Brokerage (Annual Drag), and enter 20% in Estimated Tax Rate. You can then inspect after-tax interest, cumulative tax drag, and your year-by-year schedule.',
  },
  {
    question: 'Can I export my year-by-year compound interest schedule to CSV, save my plan as JSON, or share a link?',
    answer:
      'Yes. Click Download CSV inside the Schedule tab for Excel or Google Sheets, use Export Plan (JSON) and Import Plan (JSON) under Plan Presets & JSON to save and reload all assumptions later, click Share to copy a pre-filled URL, or click Print / PDF to print or save a browser PDF summary.',
  },
  {
    question: 'Does this calculator support continuous compounding (A = Pe^rt)?',
    answer:
      'Currently, the live calculator supports five discrete compounding frequencies: Daily (365/yr), Monthly (12/yr), Quarterly (4/yr), Semi-annually (2/yr), and Annually (1/yr). Continuous compounding is not a selectable option in the dropdown; the Audit & Formulas tab displays the theoretical P * e^(rt) upper bound for reference only.',
  },
];

export default function CompoundInterestSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: COMPOUND_INTEREST_FAQS.map((faq) => ({
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
    name: 'How to Calculate Compound Interest with Step-Up Deposits, Tax Drag, Inflation & Retirement Drawdown',
    description:
      'Step-by-step workflow for projecting daily or monthly compound growth, annual contribution escalation, AUM fee drag, taxable vs. tax-exempt accounts, retirement withdrawals, and CSV/JSON export.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Select Currency, Starting Capital & Recurring Contributions',
        text: 'Pick from 180 ISO-4217 currencies (including USD, GBP, CAD, ZAR, PHP, NGN, PKR, INR, SGD, and AED), enter your initial investment, recurring contribution, deposit cadence (weekly to annually), and beginning vs. end-of-period timing.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Set Nominal Return, Horizon & Compounding Frequency',
        text: 'Enter your expected annual nominal return, investment horizon (up to 100 years), and choose Daily (365/yr), Monthly (12/yr), Quarterly (4/yr), Semi-annually (2/yr), or Annually (1/yr) compounding.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Configure Inflation, Tax Account Type, Escalation & Drawdown',
        text: 'Toggle Inflation Adjustment for Fisher real purchasing power, open Advanced Cash Flows, Fees & Taxes to set %/yr contribution escalation, AUM fee drag, tax account mode, or one-time milestone events, and optionally enable Retirement & Drawdown Phase.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Audit Scenarios, Monte Carlo Percentiles & Export',
        text: 'Review Future Value, Effective APY, MWRR (IRR), Goal Solvers, 200–2,000-path Monte Carlo percentiles, and 5 Stress Tests, then export your year-by-year CSV, save JSON, copy a Share link, or Print / Save PDF.',
      },
    ],
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-6 sm:p-10 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-xs">
      {/* Structured Data (1:1 parity with visible page content) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* Section 1: Daily vs. Monthly Compounding, Workflow & Effective APY */}
      <section aria-labelledby="ci-daily-monthly-apy" className="mb-10">
        <h2
          id="ci-daily-monthly-apy"
          className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-slate-100"
        >
          Daily vs. Monthly Compounding &amp; Effective APY (How Compound Interest Works)
        </h2>

        <blockquote className="p-4 my-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg dark:bg-slate-800 not-italic">
          <p className="text-sm text-slate-700 dark:text-slate-300 m-0">
            <strong>100% Client-Side Privacy:</strong> All calculations, Monte Carlo simulations, and CSV/JSON exports run locally inside your browser. No portfolio balances, tax rates, or retirement plans are uploaded to a server.
          </p>
        </blockquote>

        <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
          Compound interest reinvests each period&apos;s earnings back into your capital base so subsequent interest accrues on both your original principal and prior accumulated gains. Across 10- to 30-year horizons, compounding frequency, deposit timing, inflation, management fees, and tax account structure determine how much real purchasing power you keep.
        </p>

        <h3 className="text-xl sm:text-2xl font-bold mt-6 mb-3 text-slate-800 dark:text-slate-200">
          How to Use This Compound Interest Calculator
        </h3>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
          Model a savings account, long-term index portfolio, or two-phase retirement plan in four steps:
        </p>

        {/* 4-Step Workflow Grid (div cards, no outer <ol> numbers) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 not-prose">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1.5">
              STEP 1 &middot; CURRENCY, PRINCIPAL &amp; CONTRIBUTIONS
            </p>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Choose from <strong>180 ISO-4217 currencies</strong> (USD, GBP, CAD, ZAR, PHP, NGN, PKR, INR, SGD, AED, and more). Enter your <strong>Initial Investment</strong>, recurring <strong>Contribution Amount</strong>, frequency (Weekly, Bi-weekly, Monthly, Quarterly, or Annually), and <strong>End vs. Beginning</strong> deposit timing.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1.5">
              STEP 2 &middot; RATE, HORIZON &amp; COMPOUNDING FREQUENCY
            </p>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Set your expected <strong>Annual Return (Nominal %)</strong>, <strong>Investment Period</strong> (up to 100 years), and select one of five discrete compounding schedules: <strong>Daily (365/yr)</strong>, <strong>Monthly (12/yr)</strong>, <strong>Quarterly (4/yr)</strong>, <strong>Semi-annually (2/yr)</strong>, or <strong>Annually (1/yr)</strong>.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1.5">
              STEP 3 &middot; INFLATION, ESCALATION, FEES, TAX &amp; DRAWDOWN
            </p>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Toggle <strong>Inflation Adjustment</strong> for Fisher real value, expand <strong>Advanced Cash Flows, Fees &amp; Taxes</strong> for %/yr contribution escalation, AUM fee drag, Taxable / Tax-Deferred / Tax-Exempt modes, and one-time milestone events, or enable <strong>Retirement &amp; Drawdown Phase</strong>.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1.5">
              STEP 4 &middot; AUDIT METRICS, MONTE CARLO &amp; EXPORT
            </p>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Inspect <strong>Future Value</strong>, <strong>Effective APY</strong>, <strong>MWRR (IRR)</strong>, <strong>Goal Solvers</strong>, <strong>200–2,000-path Monte Carlo</strong> percentiles, and <strong>5 Stress Tests</strong>. Export your year-by-year <strong>CSV</strong>, save/reload <strong>JSON</strong>, copy a <strong>Share</strong> URL, or click <strong>Print / PDF</strong>.
            </p>
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold mt-6 mb-3 text-slate-800 dark:text-slate-200">
          Governing Formulas Implemented in the Engine
        </h3>
        <div className="space-y-3 mb-6 not-prose">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
              Discrete Lump-Sum Compounding &amp; Effective APY
            </h4>
            <div className="rounded-xl bg-white dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800 font-mono text-xs sm:text-sm text-center text-slate-900 dark:text-slate-100 my-2">
              A = P &times; (1 + r / m)^(m &times; t) &nbsp;&nbsp;|&nbsp;&nbsp; APY = (1 + r / m)^m &minus; 1
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Where <strong>P</strong> is starting principal, <strong>r</strong> is nominal annual rate as a decimal, <strong>m</strong> is compounding periods per year (1, 2, 4, 12, or 365), and <strong>t</strong> is horizon in years. At <strong>8.00% nominal</strong>, Effective APY is <strong>8.300%</strong> monthly and <strong>8.328%</strong> daily.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
              Recurring Contributions (Ordinary Annuity vs. Annuity Due) &amp; Daily Sub-Period Stepping
            </h4>
            <div className="rounded-xl bg-white dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800 font-mono text-xs sm:text-sm text-center text-slate-900 dark:text-slate-100 my-2">
              Daily Growth Factor = (1 + r / m)^(m / 365) &nbsp;&nbsp;|&nbsp;&nbsp; Real Return = (1 + r) / (1 + i) &minus; 1
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              To synchronize weekly, bi-weekly, monthly, quarterly, or annual deposits with any of the five compounding frequencies, KivaroTools advances balances on a 365-day annual timeline. Beginning-of-period deposits accrue returns on day 1 of each cycle; end-of-period deposits begin compounding on the next cycle.
            </p>
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold mt-6 mb-3 text-slate-800 dark:text-slate-200">
          Five Supported Compounding Frequencies Compared ($10,000 at 8% for 10 Years)
        </h3>
        <div className="overflow-x-auto overscroll-x-contain mb-4 not-prose">
          <table className="min-w-[640px] w-full text-xs sm:text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Frequency</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Periods/Yr (m)</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Effective APY</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Ending Balance</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Total Interest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400 font-mono">
              <tr>
                <th scope="row" className="p-3 font-sans font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Annually</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">1</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">8.000%</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-bold text-slate-900 dark:text-slate-100">$21,589.25</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">$11,589.25</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-sans font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Semi-Annually</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">2</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">8.160%</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-bold text-slate-900 dark:text-slate-100">$21,911.23</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">$11,911.23</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-sans font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Quarterly</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">4</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">8.243%</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-bold text-slate-900 dark:text-slate-100">$22,080.40</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">$12,080.40</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-sans font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Monthly</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">12</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">8.300%</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-bold text-slate-900 dark:text-slate-100">$22,196.40</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">$12,196.40</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-sans font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Daily</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700">365</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">8.328%</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-bold text-slate-900 dark:text-slate-100">$22,253.46</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">$12,253.46</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Note: Semi-annual (2/yr) compounding also matches standard Canadian GIC and bond conventions. Continuous compounding (<code>A = Pe^rt</code>) is not a selectable mode in the live dropdown; Daily (365/yr) is the highest supported discrete frequency.
        </p>
      </section>

      {/* Section 2: Annual Contribution Escalation, AUM Fee Drag & Inflation */}
      <section aria-labelledby="ci-escalation-fees-inflation" className="mb-10 pt-6 border-t border-gray-100 dark:border-slate-800">
        <h2
          id="ci-escalation-fees-inflation"
          className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-slate-100"
        >
          How Annual Contribution Escalation, AUM Fee Drag &amp; Inflation Shape Real Wealth
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
          Nominal headline calculators often overstate future wealth by ignoring three real-world forces: rising annual savings capacity, ongoing fund or advisory expense ratios, and inflation erosion. Using the exact Fisher equation (<code>Real FV = Nominal FV / (1 + i)^t</code>) instead of linear subtraction prevents long-horizon purchasing-power distortion.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 not-prose">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              Annual Contribution Escalation (%/yr)
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Increase recurring deposits by a percentage each year (e.g., 3%–5% to track salary growth or inflation). On <strong>$10,000 + $500/mo at 7% for 20 years</strong>, monthly baseline growth reaches <strong>$300,850.72</strong> (daily: <strong>$301,636.37</strong>), while adding a <strong>3%/yr step-up</strong> even with <strong>15% taxable drag</strong> reaches <strong>$325,097.31</strong> nominal.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              Inflation Purchasing Power Erosion
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              In that same 20-year scenario ($10k + $500/mo @ 7%, +3% step-up, 15% taxable drag), applying <strong>3% annual inflation</strong> discounts the <strong>$325,097.31</strong> nominal ending balance to <strong>$179,998.50</strong> in today&apos;s real purchasing power (a <strong>44.6%</strong> real-value reduction).
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              AUM Expense Ratio &amp; Fee Drag
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Percentage management fees deduct continuously before returns compound. On <strong>$10,000 + $500/mo at 8% over 30 years</strong>, a <strong>1.0% annual AUM fee</strong> reduces ending wealth from <strong>$854,537.02</strong> to <strong>$691,150.47</strong>—a <strong>$163,386.55 (-19.1%)</strong> drag (and ~24.5% on a 30-year lump sum).
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Taxable vs. Tax-Deferred vs. Tax-Exempt & Statutory Caps */}
      <section aria-labelledby="ci-tax-accounts" className="mb-10 pt-6 border-t border-gray-100 dark:border-slate-800">
        <h2
          id="ci-tax-accounts"
          className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-slate-100"
        >
          Taxable vs. Tax-Deferred (401k/IRA) vs. Tax-Exempt (Roth/ISA/TFSA) Growth
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
          Where your investments sit changes how taxes compound over time. Under <strong>Advanced Cash Flows, Fees &amp; Taxes</strong>, switch between three built-in tax treatments to compare identical contributions side by side:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5 not-prose">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">1. Taxable Brokerage (Annual Drag)</h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Applies your entered tax rate to realized annual net gains each period—useful for taxable brokerage accounts, high-yield savings accounts, or Philippine digital banks subject to 20% interest withholding tax.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">2. Tax-Deferred (401k / Traditional IRA)</h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Allows gross earnings to compound uninterrupted during accumulation, then applies your estimated exit tax rate upon withdrawal or terminal liquidation.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">3. Tax-Exempt (Roth IRA / ISA / TFSA)</h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Models 0% ongoing and exit tax on post-tax contributions—matching US Roth IRAs, UK Stocks &amp; Shares ISAs, Canadian TFSAs, and South African TFSAs.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200 not-prose">
          <p className="font-bold mb-1">Statutory Contribution Cap Disclaimer (Verified Nov 2026)</p>
          <p>
            This calculator models unconstrained mathematical compounding and does not enforce government contribution ceilings. Always verify your annual statutory allowance before planning contributions: <strong>US IRS</strong> 401(k) / IRA limits (2026: <strong>$24,500</strong> / <strong>$7,500</strong>; 2027 401(k): <strong>$25,500</strong>), <strong>UK GOV.UK</strong> ISA allowance (<strong>&pound;20,000/yr</strong>), and <strong>Canada CRA</strong> 2026 TFSA limit (<strong>$7,000 CAD/yr</strong>). Savers in South Africa (SARS TFSA annual and lifetime caps) and the Philippines (BIR withholding rules and tax-exempt savings instruments) should verify current local statutory thresholds.
          </p>
        </div>
      </section>

      {/* Section 4: Two-Phase Retirement Drawdown & 2,000-Path Monte Carlo */}
      <section aria-labelledby="ci-drawdown-monte-carlo" className="mb-10 pt-6 border-t border-gray-100 dark:border-slate-800">
        <h2
          id="ci-drawdown-monte-carlo"
          className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-slate-100"
        >
          Two-Phase Accumulation Into Retirement Drawdown &amp; 2,000-Path Monte Carlo
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
          Most online compound interest tools only simulate saving—forcing users to run separate workarounds to see how long a portfolio lasts in retirement. KivaroTools combines accumulation, decumulation, stochastic risk, and milestone cash flows in a single timeline:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 not-prose">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              Accumulation-to-Drawdown Longevity Engine
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Enable <strong>Retirement &amp; Drawdown Phase</strong> to save for a chosen number of years (for example, 15 years) and then automatically transition to <strong>monthly retirement withdrawals</strong>—optionally indexed to inflation. If withdrawals outpace growth, the engine flags the exact depletion year (<code>t_depleted</code>) or confirms sustainability through your full horizon.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              200–2,000-Path Monte Carlo &amp; 5 Stress Tests
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Constant annual returns hide sequence-of-returns risk. Switch to <strong>Risk / Monte Carlo</strong> to run <strong>200, 500, 1,000, or 2,000</strong> Box-Muller Gaussian paths at custom annual volatility (&sigma;), inspect <strong>p10 to p90</strong> wealth percentiles, overlay the fan onto your chart, and evaluate five named Stress Tests (including Early Market Crash, High Inflation Era, and Contribution Hiatus).
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              One-Time Milestone Cash Flows
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Use <strong>+ Add Event</strong> inside Advanced Cash Flows to inject dated lump-sum deposits (bonuses, inheritance, property sale) or one-time withdrawals (tuition, down payment) at any year in your timeline.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5">
              Interactive Goal Solvers &amp; MWRR (IRR)
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Enter any <strong>Target Savings Goal</strong> to automatically solve for the required periodic contribution, required annual return rate, or required investment horizon—and apply any solved input back to your plan in one click.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Engine-Verified Regional & Global Worked Examples */}
      <section aria-labelledby="ci-worked-examples" className="mb-10 pt-6 border-t border-gray-100 dark:border-slate-800">
        <h2
          id="ci-worked-examples"
          className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-slate-100"
        >
          Engine-Verified Regional &amp; Global Worked Examples (PH, ZA, NG &amp; US)
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 mb-5">
          Every figure below was computed directly by the KivaroTools calculation engine so you can reproduce and verify the exact results in the calculator above:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 not-prose">
          {/* Regional Example 1: Philippines */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Philippines (PHP): Daily Digital Bank + 20% Tax
              </h3>
              <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                PHP &middot; Daily
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
              <strong>Inputs:</strong> &#8369;50,000 initial + &#8369;5,000/month (end), 6% nominal, Daily (365/yr, 6.183% APY), Taxable Brokerage at 20% withholding tax.
            </p>
            <div className="text-xs space-y-1 font-mono bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              <p>5 Years (&#8369;350k invested): <strong>&#8369;402,262.55</strong> (vs &#8369;416,471.72 gross)</p>
              <p>10 Years (&#8369;650k invested): <strong>&#8369;850,704.65</strong> (vs &#8369;911,144.60 gross)</p>
              <p className="text-amber-700 dark:text-amber-400 font-bold font-sans">10-Year Cumulative 20% Tax Drag: &minus;&#8369;50,176.16</p>
            </div>
          </div>

          {/* Regional Example 2: South Africa */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                South Africa (ZAR): TFSA vs. Taxable (15 Yrs)
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                ZAR &middot; TFSA
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
              <strong>Inputs:</strong> R20,000 initial + R3,000/month (end), 9% nominal, Monthly (12/yr), 15 years (R560,000 total invested).
            </p>
            <div className="text-xs space-y-1 font-mono bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              <p>Tax-Exempt (TFSA 0%): <strong>R1,211,978.17</strong></p>
              <p>Taxable (18% illustrative drag): <strong>R1,048,257.76</strong></p>
              <p className="text-emerald-600 dark:text-emerald-400 font-bold font-sans">Tax-Exempt TFSA Advantage: +R163,720.41</p>
            </div>
          </div>

          {/* Regional Example 3: Nigeria */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Nigeria (NGN): High-Inflation Real Value Check
              </h3>
              <span className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                NGN &middot; Real Value
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
              <strong>Inputs:</strong> &#8358;500,000 initial + &#8358;50,000/month (end), 14% nominal, Monthly (12/yr), 10 years, 18% annual inflation.
            </p>
            <div className="text-xs space-y-1 font-mono bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              <p>Total Invested: &#8358;6,500,000.00 &rarr; Nominal: <strong>&#8358;14,964,680.93</strong></p>
              <p>Inflation-Adjusted Real Value: <strong>&#8358;2,859,218.78</strong></p>
              <p className="text-rose-600 dark:text-rose-400 font-bold font-sans">Fisher Real Return: &minus;3.39%/yr (inflation exceeds yield)</p>
            </div>
          </div>

          {/* Global/US Example 4: Beginning vs End Timing */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                US / Global (USD): Beginning vs. End Deposit Timing
              </h3>
              <span className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                USD &middot; Timing
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
              <strong>Inputs:</strong> $10,000 initial + $500/month, 8% nominal, Monthly (12/yr), 20 years ($130,000 total invested).
            </p>
            <div className="text-xs space-y-1 font-mono bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              <p>End of Period (Ordinary Annuity): <strong>$343,778.24</strong></p>
              <p>Beginning of Period (Annuity Due): <strong>$345,741.64</strong></p>
              <p className="text-purple-600 dark:text-purple-400 font-bold font-sans">Beginning-of-Period Advantage: +$1,963.40</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Export Options, Objective Comparison, FAQ & Related Tools */}
      <section aria-labelledby="ci-export-compare-faq" className="mb-10 pt-6 border-t border-gray-100 dark:border-slate-800">
        <h2
          id="ci-export-compare-faq"
          className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-slate-100"
        >
          Exporting CSV/JSON Plans, Shareable Links, Comparison &amp; FAQ
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
          Every projection can be exported cleanly without creating an account: download your year-by-year schedule as a <strong>CSV file</strong> for Excel or Google Sheets, save or reload multi-assumption scenarios via <strong>JSON Export/Import</strong>, copy a pre-filled <strong>Share URL</strong>, or use <strong>Print / PDF</strong> for a browser-printed summary.
        </p>

        <h3 className="text-xl sm:text-2xl font-bold mt-6 mb-3 text-slate-800 dark:text-slate-200">
          Objective Capability Comparison (Audited Nov 2026)
        </h3>
        <div className="w-full max-w-full overflow-x-auto overscroll-x-contain my-4 not-prose">
          <table className="min-w-[680px] w-full text-xs sm:text-sm text-left border-collapse border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">Capability</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-bold">KivaroTools</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">Investor.gov</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">Calculator.net</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">TheCalculatorSite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Compounding Frequencies</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">5 discrete (Daily to Annual)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Monthly, Quarterly, Semi, Annual</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Discrete + Continuous (e^rt)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">11 frequencies + Custom</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Currencies Supported</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">180 ISO-4217 codes (incl. ZAR, PHP, NGN)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">USD only</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">USD default</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">5 currencies ($, &euro;, &pound;, &#8377;, &yen;)</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Tax Modes, AUM Fees &amp; Inflation</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">3 Tax Modes + AUM Fee % + Fisher Real</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Nominal only</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Flat tax + Inflation (no AUM fee)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Optional inflation (no tax/AUM)</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Two-Phase Retirement Drawdown</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">Yes (Save &rarr; Monthly Drawdown + Depletion Yr)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Year-1 negative deposit only</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">No drawdown switch</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Deposits or withdrawals (no switch)</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Monte Carlo &amp; Stress Tests</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">Up to 2,000 paths + 5 Stress Tests</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Rate variance band only</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Not included</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Not included</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Schedule Export &amp; Save Plan</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">Yearly CSV + JSON Save/Load + Share URL</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">HTML table only</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Yearly &amp; Monthly HTML table</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Yearly &amp; Monthly HTML table</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Frequently Asked Questions */}
        <h3
          id="compound-interest-frequently-asked-questions"
          className="text-xl sm:text-2xl font-bold mt-8 mb-4 text-slate-800 dark:text-slate-200"
        >
          Frequently Asked Questions
        </h3>
        <div className="space-y-3 not-prose">
          {COMPOUND_INTEREST_FAQS.map((faq, index) => (
            <details
              key={index}
              className="group rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 transition-colors"
            >
              <summary className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base cursor-pointer select-none list-none flex items-center justify-between gap-3">
                <span>{faq.question}</span>
                <span className="ml-2 text-slate-400 group-open:rotate-180 transition-transform shrink-0">&#9662;</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Related Financial Planning Tools (with C6-safe anchor for SIP Calculator) */}
      <section aria-labelledby="compound-interest-related-tools" className="mb-10 pt-6 border-t border-gray-100 dark:border-slate-800 not-prose">
        <h3 id="compound-interest-related-tools" className="text-xl sm:text-2xl font-bold mb-3 text-slate-800 dark:text-slate-200">
          Related Financial Planning Tools
        </h3>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400 text-sm mb-4">
          Explore complementary calculators across the KivaroTools finance suite:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <Link
            href="/finance/sip-calculator"
            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition group"
          >
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Indian Mutual Fund &amp; INR SIP Calculator
              </span>
              <p className="text-[11px] text-slate-500">INR lakh/crore formatting, SIP vs. lump sum &amp; mutual fund step-up</p>
            </div>
            <span className="text-blue-600 dark:text-blue-400 font-bold">&rarr;</span>
          </Link>

          <Link
            href="/finance/emi-calculator"
            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition group"
          >
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Loan EMI Calculator
              </span>
              <p className="text-[11px] text-slate-500">Personal &amp; auto loan amortization with prepayment schedules</p>
            </div>
            <span className="text-blue-600 dark:text-blue-400 font-bold">&rarr;</span>
          </Link>

          <Link
            href="/finance/mortgage-calculator"
            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition group"
          >
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Mortgage Calculator
              </span>
              <p className="text-[11px] text-slate-500">Home loan PITI payments, PMI, extra principal &amp; payoff comparison</p>
            </div>
            <span className="text-blue-600 dark:text-blue-400 font-bold">&rarr;</span>
          </Link>

          <Link
            href="/finance/precious-metals"
            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition group"
          >
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Precious Metals Rates
              </span>
              <p className="text-[11px] text-slate-500">Gold, silver, and platinum store-of-value purity calculations</p>
            </div>
            <span className="text-blue-600 dark:text-blue-400 font-bold">&rarr;</span>
          </Link>

          <Link
            href="/finance/crypto-converter"
            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition group"
          >
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Currency &amp; Crypto Converter
              </span>
              <p className="text-[11px] text-slate-500">Mid-market conversion rates and bank spread comparisons</p>
            </div>
            <span className="text-blue-600 dark:text-blue-400 font-bold">&rarr;</span>
          </Link>

          <Link
            href="/finance/invoice-generator"
            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition group"
          >
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Pro Invoice Generator
              </span>
              <p className="text-[11px] text-slate-500">Print-ready A4 PDF invoicing with zero signup</p>
            </div>
            <span className="text-blue-600 dark:text-blue-400 font-bold">&rarr;</span>
          </Link>

          <Link
            href="/finance/saas-burn-rate-calculator"
            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition group sm:col-span-2"
          >
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                SaaS Burn Rate, Runway &amp; SAFE Dilution Simulator
              </span>
              <p className="text-[11px] text-slate-500">Model 60-month cash runway, Default Alive breakeven, and Post-Money SAFE dilution locally</p>
            </div>
            <span className="text-blue-600 dark:text-blue-400 font-bold">&rarr;</span>
          </Link>
        </div>
      </section>

      {/* Model Assumptions, Data Dates & YMYL Disclaimer */}
      <section aria-labelledby="ci-disclosures" className="pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-2 not-prose">
        <h4 id="ci-disclosures" className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
          Model Assumptions, Data Verification &amp; Educational Disclaimer
        </h4>
        <p>
          <strong>Model Scope &amp; Limitations:</strong> Projections use constant user-supplied nominal returns (or Gaussian log-return volatility in Monte Carlo mode), a 365-day annual sub-period convention, yearly schedule aggregation, percentage-only contribution escalation and AUM fees, and monthly retirement withdrawals. Statutory account caps cited above reflect published IRS, GOV.UK, and CRA guidance as of November 2026.
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-1">
          <strong>Not Financial or Tax Advice:</strong> KivaroTools is an educational modeling calculator and does not provide personalized investment, legal, or tax advice. Real-world returns fluctuate and carry risk of principal loss. Consult a qualified financial advisor or tax professional before making investment decisions.
        </p>
      </section>
    </article>
  );
}