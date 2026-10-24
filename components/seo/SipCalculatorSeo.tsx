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
    question: 'How do expense ratios and management fees erode compounding wealth?',
    answer:
      'Mutual funds and exchange-traded funds charge an ongoing management fee known as an expense ratio, usually ranging from 0.05% for passive index funds to 1.5% or more for actively managed funds. Even a 1% annual fee deduction compounds over 20 years to consume 15% to 25% of your potential total wealth gains. KivaroTools models annual management fee drag directly into the yearly amortization schedule so you can assess true net returns.',
  },
  {
    question: 'How does inflation affect my projected future wealth?',
    answer:
      'Inflation erodes the purchasing power of money over time. While your nominal portfolio might reach $100,000 in 15 years, persistent 3% annual inflation means $100,000 in future cash will only buy what approximately $64,186 buys today. KivaroTools includes an inflation-discounted purchasing power metric (Real Value) calculated using the Fisher discount formula: Real Value = Nominal Value / (1 + inflation)^years.',
  },
  {
    question: 'Should I choose an SIP or a Lump Sum investment?',
    answer:
      'Neither strategy is universally superior—they serve different financial circumstances. A day-1 lump sum historically outperforms dollar-cost averaging in steadily rising markets because 100% of your capital compounds for the full investment horizon. However, an SIP is ideal for salaried earners building wealth from ongoing cash flow, and it protects against the psychological risk of investing a large lump sum immediately prior to a major market correction.',
  },
  {
    question: 'Can I pause, increase, or withdraw my SIP at any time?',
    answer:
      'With standard open-ended mutual funds and ETFs, you retain complete liquidity. You can pause, adjust installment amounts, or stop your SIP without penalty. You can also redeem accumulated units at the prevailing Net Asset Value (NAV). Exceptions apply only to tax-advantaged accounts or specialized funds with statutory lock-in periods (such as Indian ELSS funds with a 3-year lock-in or retirement 401(k)/IRA rules with age restrictions).',
  },
  {
    question: 'What realistic return rate should I assume for long-term equity SIPs?',
    answer:
      'Historically, broad diversified equity index funds (such as the S&P 500, MSCI World, or Nifty 50) have delivered long-term nominal annualized returns between 9% and 13% before inflation. Conservative bond-heavy portfolios typically generate 4% to 7%. For responsible financial planning, it is prudent to test multiple scenarios (e.g. 8%, 10%, and 12%) rather than assuming peak historical bull market returns.',
  },
  {
    question: 'How does the KivaroTools Goal Planner solve for required contributions?',
    answer:
      'The Goal Planner feature uses numerical bisection root-finding to solve for the exact periodic installment required to achieve a target future wealth milestone. It accounts for your time horizon, assumed return rate, compounding frequency, entry fees, and management expense drag, identifying the precise required budget within fractions of a currency cent.',
  },
  {
    question: 'What is Sequence of Returns Risk and how does Monte Carlo modeling help?',
    answer:
      'Standard compound interest formulas assume a perfectly constant return year after year (e.g., exactly 12.0% annually). In reality, market returns are volatile: a major bear market early or late in your horizon dramatically alters your ending balance. KivaroTools features an integrated 3,000-path Monte Carlo stochastic simulation that models lognormal market volatility, revealing 10th percentile conservative, 50th percentile median, and 90th percentile optimistic outcomes.',
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
      <section aria-labelledby="sip-calculator-systematic-investment-plan-sip" className="mb-8">
        <h2 id="sip-calculator-systematic-investment-plan-sip" className="text-2xl sm:text-3xl font-extrabold mb-4 text-slate-900 dark:text-slate-100 tracking-tight">
        Systematic Investment Plan (SIP) Guide: Mathematics, Compounding &amp; Wealth Architecture
      </h2>
      <blockquote className="p-4 my-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg dark:bg-slate-800 not-italic">
        <p className="text-sm text-slate-700 dark:text-slate-300 m-0">
          <strong>Privacy First &amp; Secure:</strong> All processing is done locally in your browser via client-side JavaScript. No files, text, or data are ever uploaded to our servers.
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
            Exact Annuity Due and Ordinary Annuity formulas with zero floating-point drift.
          </p>
        </div>
        <div className="rounded-2xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-400">Step-Up Option</div>
          <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">5%–15% Annual Boost</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Escalates recurring contributions annually to match career pay raises and promotions.
          </p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">Real Inflation</div>
          <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">Purchasing Power</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Discounts future nominal values into today&apos;s real purchasing power terms.
          </p>
        </div>
        <div className="rounded-2xl border border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20 p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-400">Stochastic Risk</div>
          <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">3,000 Monte Carlo Paths</div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Stress-tests returns under real-world annual volatility percentiles (p10 to p90).
          </p>
        </div>
      </div>

      {/* Section: The Mathematics of SIP Returns */}
      </section>

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
            When expected return is zero, future value equals the exact cumulative principal invested with zero gains or losses.
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
              <td className="p-3.5">The fixed cash sum deposited each period (e.g., $500 monthly, &euro;250 quarterly, or Rs. 10,000 monthly).</td>
            </tr>
            <tr>
              <th scope="row" className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">i</th>
              <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">Periodic Interest Rate</td>
              <td className="p-3.5">
                In Nominal (APR) mode: <code>i = r / m</code> (e.g. 12% annual / 12 = 0.01 per month). In Effective (APY) mode: <code>i = (1 + r)^(1/m) &minus; 1</code>.
              </td>
            </tr>
            <tr>
              <th scope="row" className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">n</th>
              <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">Total Compounding Periods</td>
              <td className="p-3.5">Total count of deposits over the duration: <code>n = years &times; frequency</code> (e.g., 10 years &times; 12 months = 120 installments).</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section: Worked Numerical Example */}
      </section>

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

      {/* Section: Step-Up SIP Dynamics */}
      </section>

      <section aria-labelledby="sip-calculator-step-up-top-up-sip-the-multipl" className="mb-8">
        <h3 id="sip-calculator-step-up-top-up-sip-the-multipl" className="text-xl sm:text-2xl font-bold mt-8 mb-3 text-slate-800 dark:text-slate-200">
        Step-Up (Top-Up) SIP: The Multiplier for Salaried Investors
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        In standard financial modeling, recurring contributions are assumed to remain static for decades. In reality, young professionals receive annual wage increases and promotions. A <strong>Step-Up SIP</strong> systematically escalates your monthly allocation by a chosen percentage (e.g., 5% or 10%) at the start of each new investment year:
      </p>

      <div className="rounded-2xl bg-slate-100 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 font-mono text-sm mb-6 text-center text-slate-900 dark:text-slate-100">
        P_year(y) = P_base &times; (1 + g)^(y &minus; 1)
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

      {/* Section: Dollar-Cost Averaging During Downturns */}
      </section>

      <section aria-labelledby="sip-calculator-dollar-cost-averaging-the-beha" className="mb-8">
        <h3 id="sip-calculator-dollar-cost-averaging-the-beha" className="text-xl sm:text-2xl font-bold mt-8 mb-3 text-slate-800 dark:text-slate-200">
        Dollar-Cost Averaging: The Behavioral Shield in Bear Markets
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        The psychological challenge of equity investing is watching portfolio values decline during economic recessions. Lump-sum investors who invest at a market peak frequently panic and sell at a loss. In contrast, an automated SIP turns market corrections into high-value accumulation windows:
      </p>

      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/80 my-6 not-prose space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
        <div className="font-bold text-slate-900 dark:text-white text-sm mb-1">
          Numerical Demonstration of Unit Accumulation During a 50% Market Drawdown:
        </div>
        <div>
          &bull; <strong>Month 1 (Peak):</strong> Fund Net Asset Value (NAV) = $100. Your $500 monthly installment purchases <strong>5.00 units</strong>.
        </div>
        <div>
          &bull; <strong>Month 2 (Market Crash):</strong> Fund NAV plummets 50% to $50. Your $500 installment automatically acquires <strong>10.00 units</strong>.
        </div>
        <div>
          &bull; <strong>Month 3 (Partial Recovery):</strong> Fund NAV rebounds to $80. Your $500 installment acquires <strong>6.25 units</strong>.
        </div>
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
          <strong>Outcome:</strong> Total cash invested = $1,500. Total units accumulated = 21.25 units. At the current NAV of $80, your portfolio is worth <strong>$1,700.00 (+13.3% net profit)</strong>, even though the broader index is still down 20% from its initial high of $100!
        </div>
      </div>

      {/* Section: Fee and Tax Drag */}
      </section>

      <section aria-labelledby="sip-calculator-the-compounding-drag-expense-r" className="mb-8">
        <h3 id="sip-calculator-the-compounding-drag-expense-r" className="text-xl sm:text-2xl font-bold mt-8 mb-3 text-slate-800 dark:text-slate-200">
        The Compounding Drag: Expense Ratios, Entry Fees &amp; Capital Gains Tax
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Online calculators frequently present gross theoretical returns without deducting operational frictions. In real-world asset management, three distinct leakages reduce your net take-home wealth:
      </p>

      <ul className="list-disc pl-6 space-y-2 mb-6 text-slate-600 dark:text-slate-400">
        <li>
          <strong>Annual Expense Ratio (TER):</strong> Mutual fund asset management companies (AMCs) deduct fees directly from fund assets daily. A 1.5% annual TER on a $500/month 20-year SIP reduces your ending balance by over $100,000 compared to a 0.10% passive index tracker.
        </li>
        <li>
          <strong>Contribution &amp; Front-End Entry Fees:</strong> Brokerage commissions or transaction charges deducted before funds reach the market reduce day-1 capital compounding.
        </li>
        <li>
          <strong>Capital Gains Tax Drag:</strong> Upon final redemption, net profits above cost basis are taxed according to local tax code jurisdiction (e.g. 15% Long-Term Capital Gains in India, 15%–20% Federal LTCG in the US, or standard capital gains tax schedules).
        </li>
      </ul>

      {/* Section: Inflation Discounting */}
      </section>

      <section aria-labelledby="sip-calculator-inflation-discounting-measurin" className="mb-8">
        <h3 id="sip-calculator-inflation-discounting-measurin" className="text-xl sm:text-2xl font-bold mt-8 mb-3 text-slate-800 dark:text-slate-200">
        Inflation Discounting: Measuring Real Future Purchasing Power
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Achieving a nominal portfolio of $500,000 sounds impressive, but if consumer prices double over the same 20-year span, your actual standard of living is dramatically different. KivaroTools provides a continuous real purchasing power calculation:
      </p>

      <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 font-mono text-sm mb-6 text-center text-slate-900 dark:text-slate-100">
        Real Purchasing Power = Nominal Future Value / (1 + inflation_rate)^years
      </div>

      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        For example, a projected nominal corpus of <strong>$116,170</strong> after 10 years with an assumed 3.5% annual inflation rate equates to approximately <strong>$82,354</strong> in today&apos;s purchasing power. We recommend factoring in inflation when calculating college education funds or retirement milestone targets.
      </p>

      {/* Section: Frequently Asked Questions */}
      </section>

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
          ))}        </div>

      {/* Section: Contextual Internal Links */}
      </section>

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