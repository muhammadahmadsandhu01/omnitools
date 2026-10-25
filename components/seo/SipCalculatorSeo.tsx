import Link from 'next/link';
import { SITE_URL } from '@/config/site';

export interface FaqItem {
  question: string;
  answer: string;
}

export const SIP_CALCULATOR_FAQS: FaqItem[] = [
  {
    question: 'How does a Systematic Investment Plan (SIP) calculate investment returns?',
    answer:
      'A Systematic Investment Plan (SIP) calculates investment returns by modeling periodic recurring cash flows compounded at an assumed annual rate. For investments made at the start of each month (annuity due), each installment compounds for its specific remaining duration. The formula aggregates total deposits, computes periodic interest using nominal APR or effective APY conventions, and projects future maturity value along with estimated net wealth gain.',
  },
  {
    question: 'What is the mathematical difference between Annuity Due and Ordinary Annuity?',
    answer:
      'Annuity Due assumes contributions occur at the beginning of each period, meaning every payment immediately starts generating compounding returns during that cycle. An Ordinary Annuity assumes payments occur at the end of each period, so the first deposit earns no interest during month one. Because of that extra compounding interval, Annuity Due produces a terminal portfolio that is strictly higher by a factor of (1 + i), where i is the periodic interest rate.',
  },
  {
    question: 'What is the difference between Nominal (APR) and Effective (APY) rate compounding?',
    answer:
      'In Nominal (APR) mode, the periodic rate is simply the annual percentage rate divided by compounding periods per year (i = r / m, e.g. 12% / 12 = 1.0% per month). In Effective (APY) mode, the periodic rate is derived from geometric annual equivalence: i = (1 + r)^(1/m) - 1 (e.g. (1.12)^(1/12) - 1 ≈ 0.9489% per month). The effective method models the exact annual yield when interest compounds intra-year.',
  },
  {
    question: 'How does dollar-cost averaging (DCA) work during market downturns?',
    answer:
      'Dollar-cost averaging allocates a fixed monetary amount at regular intervals regardless of asset price fluctuations. When mutual fund or ETF prices decline, your fixed installment automatically purchases more fund units. When prices recover, those lower-cost units amplify your gains. Over multi-year economic cycles, DCA eliminates the stress of market timing and lowers your volume-weighted average cost per share.',
  },
  {
    question: 'What is an Annual Step-Up SIP and why is it recommended?',
    answer:
      'A Step-Up (or Top-Up) SIP automatically increases your recurring contribution by a fixed percentage (typically 5% to 15%) each year, mirroring annual salary increments. Because compound interest accelerates dramatically on larger balances, stepping up contributions by 10% annually over a 15- to 20-year horizon can more than double your final accumulated corpus compared to keeping contributions flat.',
  },
  {
    question: 'How do entry fees, expense ratios, and capital gains taxes erode wealth?',
    answer:
      'Real-world investment friction operates at three distinct levels: (1) Contribution/Entry Fees are deducted from each cash deposit before market entry, reducing starting cost basis; (2) Annual Management Fees (TER) are deducted continuously from accumulated portfolio assets, dragging down geometric growth; and (3) Capital Gains Tax is assessed upon maturity against net taxable gains (ending value minus invested cost basis). KivaroTools models all three frictions simultaneously in the schedule.',
  },
  {
    question: 'How does inflation affect my projected future wealth (Real Value)?',
    answer:
      'Inflation erodes the purchasing power of money over time. While your nominal portfolio might reach $100,000 in 15 years, persistent 3% annual inflation means $100,000 in future cash will only buy what approximately $64,186 buys today. KivaroTools calculates an inflation-discounted purchasing power metric (Real Value) using the Fisher discount formula: Real Value = Nominal Value / (1 + inflation)^years.',
  },
  {
    question: 'Should I choose an SIP or a Lump Sum investment?',
    answer:
      'Neither strategy is universally superior—they serve different financial circumstances. A day-1 lump sum historically outperforms dollar-cost averaging in steadily rising markets because 100% of your capital compounds for the full investment horizon. However, an SIP is ideal for salaried earners building wealth from ongoing cash flow, and it protects against the psychological risk of investing a large lump sum immediately prior to a major market correction.',
  },
  {
    question: 'How does the KivaroTools Goal Planner solve for required contributions?',
    answer:
      'The Goal Planner feature uses numerical bisection root-finding (80 iterations) to solve for the exact periodic installment or one-time lump sum required to achieve a target future wealth milestone. It accounts for your time horizon, assumed return rate, step-up escalation, compounding frequency, entry fees, and management expense drag, identifying the precise required budget within fractions of a currency cent.',
  },
  {
    question: 'What is Sequence of Returns Risk and how does Monte Carlo modeling help?',
    answer:
      'Standard compound interest formulas assume a perfectly constant return year after year (e.g., exactly 12.0% annually). In reality, market returns are volatile: a major bear market early or late in your horizon dramatically alters your ending balance. KivaroTools features an integrated 3,000-path Monte Carlo stochastic simulation that models lognormal market volatility using geometric Brownian motion, revealing 10th percentile conservative, 50th percentile median, and 90th percentile optimistic outcomes along with target reach probabilities.',
  },
  {
    question: 'How are 154 world currencies formatted in the calculator?',
    answer:
      'KivaroTools natively supports 154 active ISO-4217 world currencies with exact localized currency symbols and correct statutory decimal precision—including 0 decimal places for currencies like JPY, KRW, and VND; 3 decimal places for Middle Eastern currencies like BHD, KWD, OMR, and TND; and 2 decimal places for USD, EUR, GBP, INR, PKR, and standard global currencies.',
  },
  {
    question: 'How does the CSV export protect against spreadsheet formula injection (CWE-1236)?',
    answer:
      'To prevent CSV Macro / Formula Injection attacks when opening exported financial data in Microsoft Excel, Google Sheets, or LibreOffice Calc, all text cells beginning with formula trigger characters (=, +, -, @, tab, carriage return) are automatically sanitized by prepending an apostrophe, while standard negative numbers (e.g. -50.25) remain cleanly formatted as numbers.',
  },
];

export default function SipCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SIP_CALCULATOR_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE_URL}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Finance Tools',
        item: `${SITE_URL}/finance`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'SIP Calculator',
        item: `${SITE_URL}/finance/sip-calculator`,
      },
    ],
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-6 sm:p-10 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-xs">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <section aria-labelledby="sip-calculator-systematic-investment-plan-sip" className="mb-8">
        <h2 id="sip-calculator-systematic-investment-plan-sip" className="text-2xl sm:text-3xl font-extrabold mb-4 text-slate-900 dark:text-slate-100 tracking-tight">
          Systematic Investment Plan (SIP) Guide: Mathematics, Compounding &amp; Wealth Architecture
        </h2>
        <blockquote className="p-4 my-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg dark:bg-slate-800 not-italic">
          <p className="text-sm text-slate-700 dark:text-slate-300 m-0">
            <strong>Privacy First &amp; Secure:</strong> All financial simulations, reverse root-finding, and Monte Carlo iterations run 100% locally in your browser. No personal data, amounts, or portfolio balances are ever transmitted to external servers.
          </p>
        </blockquote>
        <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400 text-base">
          A <strong>Systematic Investment Plan (SIP)</strong> is a disciplined wealth accumulation strategy where an investor commits a recurring, automated allocation into mutual funds, exchange-traded funds (ETFs), or equity index instruments at regular intervals (monthly, quarterly, or yearly). Rather than attempting to time cyclical market tops and bottoms, SIP investors leverage <em>dollar-cost averaging</em> and <em>geometric compound interest</em> to build substantial financial security over multi-decade horizons.
        </p>

        {/* Feature Architecture Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8 not-prose">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">Auditable Engine</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">Closed-Form Math</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Exact Annuity Due and Ordinary Annuity formulas with Nominal APR and Effective APY options.
            </p>
          </div>
          <div className="rounded-2xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-400">Step-Up Option</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">Annual Step-Up (%)</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Escalates recurring contributions annually to match career pay raises and salary promotions.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">Institutional Drag</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">Fees, Taxes &amp; Inflation</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Models net front-end fees, annual management expense ratios (TER), capital gains tax, and real purchasing power.
            </p>
          </div>
          <div className="rounded-2xl border border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-400">Stochastic Risk</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">3,000 Monte Carlo Paths</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Stress-tests returns under real-world annual volatility percentiles (p10 to p90) and target probability.
            </p>
          </div>
        </div>
      </section>

      {/* Section: The Mathematics of SIP Returns */}
      <section aria-labelledby="sip-calculator-the-mathematical-sip-future-va" className="mb-8">
        <h3 id="sip-calculator-the-mathematical-sip-future-va" className="text-xl sm:text-2xl font-bold mt-8 mb-3 text-slate-800 dark:text-slate-200">
          The Mathematical SIP Future Value Formulas
        </h3>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          The terminal future value of an SIP depends on the timing of contributions within each cycle. In banking and mutual fund operations, monthly automated debits typically execute on the first business day of the cycle. This timing represents an <strong>Annuity Due</strong>. If contributions are deposited at the end of the month, the schedule follows an <strong>Ordinary Annuity</strong>.
        </p>

        {/* Formula Code Cards */}
        <div className="space-y-4 my-6 not-prose">
          <div className="rounded-2xl bg-slate-900 text-slate-100 p-5 font-mono text-sm border border-slate-800 shadow-inner">
            <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold mb-2">
              1. Annuity Due Formula (Beginning of Period — Default)
            </div>
            <div className="text-base sm:text-lg font-bold text-white">
              FV = P &times; [ ((1 + i)^n &minus; 1) / i ] &times; (1 + i)
            </div>
            <div className="text-xs text-slate-400 mt-2">
              Each installment earns an additional period of compound interest because capital enters before market returns are applied.
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 text-slate-100 p-5 font-mono text-sm border border-slate-800 shadow-inner">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
              2. Ordinary Annuity Formula (End of Period)
            </div>
            <div className="text-base sm:text-lg font-bold text-white">
              FV = P &times; [ ((1 + i)^n &minus; 1) / i ]
            </div>
            <div className="text-xs text-slate-400 mt-2">
              Standard textbook formula where deposits are credited after the period&apos;s market return has closed.
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 text-slate-100 p-5 font-mono text-sm border border-slate-800 shadow-inner">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
              3. Zero Return Boundary Case (i = 0%)
            </div>
            <div className="text-base sm:text-lg font-bold text-white">
              FV = P &times; n
            </div>
            <div className="text-xs text-slate-400 mt-2">
              When expected return is zero, future value equals the exact cumulative principal invested with zero division-by-zero errors.
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 text-slate-100 p-5 font-mono text-sm border border-slate-800 shadow-inner">
            <div className="text-xs uppercase tracking-wider text-cyan-400 font-bold mb-2">
              4. Compounding Rate Basis (Nominal vs Effective)
            </div>
            <div className="text-sm font-bold text-white space-y-1">
              <div>Nominal (APR): i = r / m</div>
              <div>Effective (APY): i = (1 + r)^(1 / m) &minus; 1</div>
            </div>
            <div className="text-xs text-slate-400 mt-2">
              where <code>r</code> is annual rate in decimal and <code>m</code> is periods per year (12 monthly, 4 quarterly, 1 yearly).
            </div>
          </div>
        </div>

        {/* Variable Definitions Table */}
        <div className="overflow-x-auto my-6 not-prose">
          <table className="min-w-full text-xs sm:text-sm text-left border-collapse border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gray-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
                <th scope="col" className="p-3.5 border-b border-gray-200 dark:border-slate-700 font-bold">Variable</th>
                <th scope="col" className="p-3.5 border-b border-gray-200 dark:border-slate-700 font-bold">Mathematical Term</th>
                <th scope="col" className="p-3.5 border-b border-gray-200 dark:border-slate-700 font-bold">Financial Meaning &amp; Calculation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th scope="row" className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">FV</th>
                <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">Future Value</td>
                <td className="p-3.5">The total projected value of your accumulated investment portfolio at the conclusion of the chosen time horizon.</td>
              </tr>
              <tr>
                <th scope="row" className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">P</th>
                <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">Periodic Contribution</td>
                <td className="p-3.5">The cash sum deposited each period (e.g., $500 monthly, &euro;250 quarterly, or Rs. 10,000 monthly).</td>
              </tr>
              <tr>
                <th scope="row" className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">P_0</th>
                <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">Initial Capital</td>
                <td className="p-3.5">Optional day-1 lump sum deposit that compounds alongside recurring periodic contributions.</td>
              </tr>
              <tr>
                <th scope="row" className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">i</th>
                <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">Periodic Interest Rate</td>
                <td className="p-3.5">
                  In Nominal mode: <code>i = r / m</code> (e.g. 12% / 12 = 0.01 per month). In Effective mode: <code>i = (1 + r)^(1/m) &minus; 1</code>.
                </td>
              </tr>
              <tr>
                <th scope="row" className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">n</th>
                <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">Compounding Periods</td>
                <td className="p-3.5">Total count of deposits over the duration: <code>n = years &times; frequency</code> (e.g., 10 years &times; 12 months = 120 installments).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section: Worked Numerical Example */}
      <section aria-labelledby="sip-calculator-independently-verified-worked-" className="mb-8">
        <h3 id="sip-calculator-independently-verified-worked-" className="text-xl sm:text-2xl font-bold mt-8 mb-3 text-slate-800 dark:text-slate-200">
          Independently Verified Worked Numerical Example
        </h3>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          To demonstrate the exact mechanics of the KivaroTools engine, consider a typical retail wealth-building plan:
        </p>

        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 my-6 not-prose space-y-3 text-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pb-3 border-b border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Monthly SIP (P):</span>
              <strong className="text-slate-900 dark:text-white text-sm font-extrabold">$500.00</strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Expected Return (r):</span>
              <strong className="text-slate-900 dark:text-white text-sm font-extrabold">12.0% p.a. (Nominal)</strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Time Period:</span>
              <strong className="text-slate-900 dark:text-white text-sm font-extrabold">10 Years (120 Months)</strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Contribution Timing:</span>
              <strong className="text-emerald-600 dark:text-emerald-400 text-sm font-extrabold">Beginning of Period</strong>
            </div>
          </div>

          <div className="space-y-2 pt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <div>
              <strong>Step 1: Calculate Periodic Interest Rate (i):</strong>{' '}
              <code>i = 12% / 12 = 1.0% = 0.01 per month</code>.
            </div>
            <div>
              <strong>Step 2: Calculate Total Principal Invested:</strong>{' '}
              <code>Total Invested = $500 &times; 120 = $60,000.00</code>.
            </div>
            <div>
              <strong>Step 3: Compute Compound Growth Factor:</strong>{' '}
              <code>(1 + 0.01)^120 = (1.01)^120 &approx; 3.30038689</code>.
            </div>
            <div>
              <strong>Step 4: Ordinary Annuity Sum:</strong>{' '}
              <code>(3.30038689 &minus; 1) / 0.01 = 230.038689</code>.
            </div>
            <div>
              <strong>Step 5: Apply Annuity Due Beginning Factor:</strong>{' '}
              <code>230.038689 &times; 1.01 = 232.339076</code>.
            </div>
            <div>
              <strong>Step 6: Calculate Final Projected Corpus (FV):</strong>{' '}
              <code>$500 &times; 232.339076 = $116,169.54</code>.
            </div>
            <div>
              <strong>Step 7: Reconcile Estimated Net Wealth Gain:</strong>{' '}
              <code>$116,169.54 &minus; $60,000.00 = +$56,169.54 (+93.62% net return, 1.94&times; wealth multiplier)</code>.
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
            <em>Timing Comparison:</em> If deposits were made at the end of each period (Ordinary Annuity), the final portfolio would be <strong>$115,019.34</strong>. Depositing at the beginning of each month yields an extra <strong>+$1,150.20</strong> (+1.00% of final portfolio) purely from timing optimization.
          </div>
        </div>
      </section>

      {/* Section: Step-Up SIP Dynamics */}
      <section aria-labelledby="sip-calculator-step-up-top-up-sip-the-multipl" className="mb-8">
        <h3 id="sip-calculator-step-up-top-up-sip-the-multipl" className="text-xl sm:text-2xl font-bold mt-8 mb-3 text-slate-800 dark:text-slate-200">
          Step-Up (Top-Up) SIP: The Multiplier for Salaried Investors
        </h3>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          In standard financial modeling, recurring contributions are assumed to remain static for decades. In reality, working professionals receive regular wage increases and promotions. A <strong>Step-Up SIP</strong> systematically escalates your monthly allocation by a chosen percentage (e.g., 5% or 10%) at the start of each new investment year:
        </p>

        <div className="rounded-2xl bg-slate-100 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 font-mono text-sm mb-6 text-center text-slate-900 dark:text-slate-100">
          P_year(y) = P_base &times; (1 + stepUp)^(y &minus; 1)
        </div>

        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          Here is how a <strong>10% annual Step-Up</strong> transforms a baseline $500/month SIP at 12% expected annual return over multiple time horizons:
        </p>

        {/* Step-Up Comparison Table */}
        <div className="overflow-x-auto my-6 not-prose">
          <table className="min-w-full text-xs sm:text-sm text-left border-collapse border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gray-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
                <th scope="col" className="p-3 border-b border-gray-200 dark:border-slate-700 font-bold">Horizon</th>
                <th scope="col" className="p-3 border-b border-gray-200 dark:border-slate-700 font-bold">Flat $500/mo Invested</th>
                <th scope="col" className="p-3 border-b border-gray-200 dark:border-slate-700 font-bold">Flat $500/mo Future Value</th>
                <th scope="col" className="p-3 border-b border-gray-200 dark:border-slate-700 font-bold">10% Step-Up Invested</th>
                <th scope="col" className="p-3 border-b border-gray-200 dark:border-slate-700 font-bold text-emerald-600 dark:text-emerald-400">10% Step-Up Future Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <td className="p-3 font-bold text-slate-900 dark:text-white">10 Years</td>
                <td className="p-3">$60,000</td>
                <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">$116,170</td>
                <td className="p-3">$95,625</td>
                <td className="p-3 font-black text-emerald-600 dark:text-emerald-400">$175,765 (+51.3%)</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-900 dark:text-white">15 Years</td>
                <td className="p-3">$90,000</td>
                <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">$252,288</td>
                <td className="p-3">$190,634</td>
                <td className="p-3 font-black text-emerald-600 dark:text-emerald-400">$458,541 (+81.8%)</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-900 dark:text-white">20 Years</td>
                <td className="p-3">$120,000</td>
                <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">$499,574</td>
                <td className="p-3">$343,650</td>
                <td className="p-3 font-black text-emerald-600 dark:text-emerald-400">$1,142,398 (+128.7%)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section: Institutional Friction: Fees, Taxes & Net Cost Basis */}
      <section aria-labelledby="sip-calculator-the-compounding-drag-expense-r" className="mb-8">
        <h3 id="sip-calculator-the-compounding-drag-expense-r" className="text-xl sm:text-2xl font-bold mt-8 mb-3 text-slate-800 dark:text-slate-200">
          Institutional Drag: Entry Fees, Expense Ratios (TER) &amp; Capital Gains Tax
        </h3>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          Online calculators frequently present gross theoretical returns without deducting operational frictions. In real-world asset management, three distinct leakages reduce your net take-home wealth:
        </p>

        <div className="space-y-4 my-6 not-prose">
          <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
              1. Front-End Entry &amp; Contribution Fees (Cost Basis Reduction)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Deducted directly from gross deposits before capital enters the market. For instance, a 10% entry fee on a $100 deposit invests $90 into your portfolio. Your taxable cost basis is established at the net invested amount ($90), ensuring accurate subsequent capital gains calculation.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
              2. Annual Management Expense Ratio (TER Drag)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Deducted continuously from accumulated portfolio assets after applying investment returns. The periodic fee rate is computed via geometric compounding: <code>fee_rate = 1 &minus; (1 &minus; TER)^(1/m)</code>. Even a 1% annual fee deduction compounds over 20 years to consume 15% to 25% of your potential total wealth gains.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
              3. Terminal Capital Gains Tax Liquidation
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Assessed on net realized capital gains upon maturity: <code>Tax = max(0, Ending Balance &minus; Net Cost Basis) &times; Tax Rate</code>. Post-tax future value accurately reveals your real take-home liquidation corpus.
            </p>
          </div>
        </div>
      </section>

      {/* Section: Goal Planner Numerical Bisection Solver */}
      <section aria-labelledby="sip-calculator-goal-planner-reverse-solver" className="mb-8">
        <h3 id="sip-calculator-goal-planner-reverse-solver" className="text-xl sm:text-2xl font-bold mt-8 mb-3 text-slate-800 dark:text-slate-200">
          Goal Planner: High-Precision Reverse Bisection Root-Finder
        </h3>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          Instead of guessing arbitrary monthly contribution amounts until your target portfolio is reached, the KivaroTools Goal Planner implements a numerical <strong>Bisection Root-Finding Algorithm</strong> (80 iterations) that determines the exact periodic installment or lump sum required to reach your target milestone.
        </p>

        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/80 my-6 not-prose space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          <div className="font-bold text-slate-900 dark:text-white text-sm mb-1">
            Engine Verification &amp; Stability Highlights:
          </div>
          <div>
            &bull; <strong>Boundary Bracketing:</strong> Safely searches upper bounds up to configured institutional contribution thresholds.
          </div>
          <div>
            &bull; <strong>Reachability Check:</strong> If a milestone cannot be achieved within maximum allowable contributions, the solver transparently marks the goal as unreachable (<code>reachable: false</code>) rather than providing misleading estimations.
          </div>
          <div>
            &bull; <strong>Full Friction Accounting:</strong> Incorporates your assumed return rate, annual step-up percentage, entry fees, management expense ratio, and capital gains tax during every bisection evaluation to guarantee precision within $0.05.
          </div>
        </div>
      </section>

      {/* Section: 3,000-Path Monte Carlo Stochastic Simulation */}
      <section aria-labelledby="sip-calculator-monte-carlo-stochastic-simulat" className="mb-8">
        <h3 id="sip-calculator-monte-carlo-stochastic-simulat" className="text-xl sm:text-2xl font-bold mt-8 mb-3 text-slate-800 dark:text-slate-200">
          3,000-Path Monte Carlo Stochastic Simulation (Lognormal Brownian Motion)
        </h3>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          Real equity markets do not deliver smooth, uniform returns each year. To protect investors against Sequence of Returns Risk, KivaroTools includes an institutional-grade 3,000-path Monte Carlo simulator utilizing the <strong>Box-Muller Transform</strong> for normally distributed stochastic variations:
        </p>

        <div className="rounded-xl bg-slate-900 text-slate-100 p-4 font-mono text-xs sm:text-sm border border-slate-800 shadow-inner not-prose mb-6">
          <div className="text-emerald-400 font-bold mb-1">Geometric Brownian Motion (Lognormal Growth):</div>
          <div>r_period = exp( (mu &minus; 0.5 &times; sigma^2) &times; dt + sigma &times; sqrt(dt) &times; Z ) &minus; 1</div>
          <div className="text-slate-400 text-xs mt-2">
            where mu is annual expected drift, sigma is annual volatility, dt = 1/periods, and Z is a standard normal random variable.
          </div>
        </div>

        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          The simulation sorts all 3,000 independent multi-year trajectory outcomes to extract the <strong>10th Percentile (Conservative)</strong>, <strong>25th Percentile</strong>, <strong>50th Percentile (Median)</strong>, <strong>75th Percentile</strong>, and <strong>90th Percentile (Optimistic)</strong> wealth outcomes, along with the exact empirical probability of reaching your target goal milestone. When volatility is set to 0%, the distribution perfectly collapses to the closed-form deterministic projection.
        </p>
      </section>

      {/* Section: Inflation Discounting */}
      <section aria-labelledby="sip-calculator-inflation-discounting-measurin" className="mb-8">
        <h3 id="sip-calculator-inflation-discounting-measurin" className="text-xl sm:text-2xl font-bold mt-8 mb-3 text-slate-800 dark:text-slate-200">
          Inflation Discounting: Measuring Real Future Purchasing Power
        </h3>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          Achieving a nominal portfolio of $500,000 sounds impressive, but if consumer prices double over the same 20-year span, your actual standard of living is dramatically different. KivaroTools provides continuous real purchasing power calculation:
        </p>

        <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 font-mono text-sm mb-6 text-center text-slate-900 dark:text-slate-100">
          Real Purchasing Power = Nominal Future Value / (1 + inflation_rate)^years
        </div>

        <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
          For example, a projected nominal corpus of <strong>$116,170</strong> after 10 years with an assumed 3.5% annual inflation rate equates to approximately <strong>$82,354</strong> in today&apos;s purchasing power. We recommend factoring in inflation when calculating college education funds or retirement milestone targets.
        </p>
      </section>

      {/* Section: 154 ISO World Currencies, RFC-4180 CSV & Privacy */}
      <section aria-labelledby="sip-calculator-global-currencies-csv-privacy" className="mb-8">
        <h3 id="sip-calculator-global-currencies-csv-privacy" className="text-xl sm:text-2xl font-bold mt-8 mb-3 text-slate-800 dark:text-slate-200">
          Global Multi-Currency, Security &amp; Institutional Export Standards
        </h3>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          Built for international investors, wealth managers, and financial planners, KivaroTools delivers enterprise-grade utility:
        </p>

        <ul className="list-disc pl-6 space-y-2 mb-6 text-slate-600 dark:text-slate-400">
          <li>
            <strong>154 Active ISO-4217 Currencies:</strong> Seamless formatting with localized symbols and statutory decimal precision (e.g., JPY, KRW, VND with 0 decimals; BHD, KWD, OMR, TND with 3 decimals; USD, EUR, GBP, INR, PKR with 2 decimals).
          </li>
          <li>
            <strong>RFC-4180 Compliant CSV Export:</strong> Exports complete year-by-year accounting reconciliation schedules with proper quotation, newline formatting, and OWASP CWE-1236 spreadsheet injection protection.
          </li>
          <li>
            <strong>Printable Executive HTML Report:</strong> Generate clean, publication-ready portfolio summaries with printable CSS media styling for client reviews or personal record-keeping.
          </li>
          <li>
            <strong>URL State Sharing:</strong> Encode your exact investment configuration (amount, rate, frequency, step-up, fees, taxes) into a private Base64 URL hash for instant cross-device bookmarking and sharing.
          </li>
        </ul>
      </section>

      {/* Section: Frequently Asked Questions */}
      <section aria-labelledby="sip-calculator-frequently-asked-questions-abo" className="mb-8">
        <h3 id="sip-calculator-frequently-asked-questions-abo" className="text-xl sm:text-2xl font-bold mt-10 mb-4 text-slate-800 dark:text-slate-200">
          Frequently Asked Questions About SIP Investing
        </h3>
        <div className="space-y-3">
          {SIP_CALCULATOR_FAQS.map((faq, index) => (
            <details
              key={index}
              className="group rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 transition-colors"
            >
              <summary className="font-semibold text-slate-900 dark:text-slate-100 text-base cursor-pointer select-none list-none flex items-center justify-between">
                <span>{faq.question}</span>
                <span className="ml-2 text-slate-400 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Section: Contextual Internal Links */}
      <section aria-labelledby="sip-calculator-explore-related-financial-amp-" className="mb-8">
        <h3 id="sip-calculator-explore-related-financial-amp-" className="text-xl sm:text-2xl font-bold mt-10 mb-4 text-slate-800 dark:text-slate-200">
          Explore Related Financial &amp; Investment Calculators
        </h3>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400 text-sm mb-4">
          Complement your long-term investment planning with our suite of auditable finance calculators:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 not-prose">
          <Link
            href="/finance/compound-interest"
            className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-emerald-500/40 bg-gray-50/50 dark:bg-slate-900/40 hover:bg-emerald-50/20 transition-all text-sm group"
          >
            <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              Compound Interest Calculator &rarr;
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Simulate savings growth with APY compounding, deposits, and withdrawal timelines.
            </div>
          </Link>
          <Link
            href="/finance/emi-calculator"
            className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-emerald-500/40 bg-gray-50/50 dark:bg-slate-900/40 hover:bg-emerald-50/20 transition-all text-sm group"
          >
            <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              Loan EMI &amp; Amortization Calculator &rarr;
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Calculate monthly debt obligations, interest schedules, and prepayment savings.
            </div>
          </Link>
          <Link
            href="/finance/mortgage-calculator"
            className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-emerald-500/40 bg-gray-50/50 dark:bg-slate-900/40 hover:bg-emerald-50/20 transition-all text-sm group"
          >
            <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              Mortgage &amp; Home Loan Calculator &rarr;
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Model real estate financing, property taxes, PMI, and home equity growth.
            </div>
          </Link>
          <Link
            href="/finance/crypto-converter"
            className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-emerald-500/40 bg-gray-50/50 dark:bg-slate-900/40 hover:bg-emerald-50/20 transition-all text-sm group"
          >
            <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              Currency &amp; Crypto Converter &rarr;
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Convert 160+ world fiat currencies and top crypto assets with transparent mid-market rates.
            </div>
          </Link>
        </div>

        {/* Statutory Regulatory Disclaimer */}
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          <strong>Statutory Notice &amp; Financial Disclaimer:</strong> The calculations, projections, and simulation scenarios generated by this tool are purely hypothetical estimates for educational and illustrative planning purposes. They do not constitute financial, investment, legal, or tax advice. Market investments are subject to market risks, including the potential loss of principal. Past performance of mutual funds, indices, or asset classes does not guarantee future results. Consult a licensed financial advisor or registered investment consultant before committing capital.
        </div>
      </section>
    </article>
  );
}