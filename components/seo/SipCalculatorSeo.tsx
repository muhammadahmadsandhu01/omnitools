import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const SIP_CALCULATOR_FAQS: FaqItem[] = [
  {
    question: 'How does a Systematic Investment Plan (SIP) work?',
    answer:
      'A Systematic Investment Plan (SIP) is an investment strategy where an individual deposits a fixed sum into mutual funds, index funds, or ETFs at scheduled intervals (monthly, quarterly, or annually). This disciplined automated schedule enforces consistent savings and utilizes dollar-cost averaging to accumulate assets regardless of short-term market swings.',
  },
  {
    question: 'What is dollar-cost averaging and how does it protect against volatility?',
    answer:
      'Dollar-cost averaging occurs when you invest a fixed amount regularly. When share prices fall, your fixed allocation purchases a higher number of mutual fund units. When market prices rise, you purchase fewer units. Over extended multi-year cycles, this mechanical discipline lowers your weighted average cost per unit without requiring you to time market tops and bottoms.',
  },
  {
    question: 'What is a Step-Up SIP and how much does it increase wealth?',
    answer:
      'A Step-Up (or Top-Up) SIP automatically escalates your recurring contribution by a fixed percentage (such as 5% or 10%) each year, reflecting career salary increments. Because compounding accelerates on higher capital bases, stepping up contributions by 10% annually can more than double your terminal portfolio over a 15- to 20-year horizon compared to a flat contribution.',
  },
  {
    question: 'How do fund expense ratios and capital gains taxes reduce net returns?',
    answer:
      'Annual mutual fund management fees (expense ratios typically ranging from 0.1% for index funds to 1.5%+ for active funds) and annual capital gains taxes continuously drag down returns. OmniTools models both contribution fees, ongoing management expense ratios, and tax liabilities directly into the yearly schedule to reveal your true net gain.',
  },
  {
    question: 'Can you pause or liquidate an open-ended SIP at any time?',
    answer:
      'Yes. Unless you are invested in tax-advantaged funds with statutory lock-in periods (such as Indian ELSS funds with a 3-year lock-in or retirement accounts with age hurdles), standard open-ended mutual fund SIPs can be modified, paused, or liquidated at prevailing Net Asset Value (NAV) without penalty.',
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

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-xs">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        Systematic Investment Plan (SIP) Guide: Dollar-Cost Averaging, Compounding &amp; Wealth Creation
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        A <strong>Systematic Investment Plan (SIP)</strong> is the premier vehicle for building long-term wealth through mutual funds, index funds, and equities. By automating periodic allocations, investors eliminate emotional market timing, harness dollar-cost averaging during market downturns, and compound capital over decades.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        The Mathematical SIP Future Value Formula
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        For recurring periodic investments where installments are made at the beginning of each period (annuity due), the future value is modeled by:
      </p>

      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 font-mono text-sm sm:text-base mb-6 text-center text-slate-900 dark:text-slate-100">
        M = P &times; [ (1 + i)^n - 1 ] / i &times; (1 + i)
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Variable</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Definition</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Financial Significance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">M</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Maturity Value</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Total accumulated corpus at the end of the investment horizon.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">P</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Periodic SIP Amount</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">The fixed sum allocated each month or quarter.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">i</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Periodic Return Rate</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Expected annual return divided by 12 months and 100 (e.g., 12% annually = 0.01 per month).</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">n</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Number of Installments</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Total count of deposits (e.g., 15 years &times; 12 months = 180 installments).</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Institutional Planning Features in OmniTools
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Unlike simplistic interest calculators, OmniTools models real-world investing conditions:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Annual Step-Up Option</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Escalate monthly contributions by 5% to 15% annually to align with career pay increases and amplify terminal wealth.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Expense Ratio &amp; Tax Drag</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Deduct annual mutual fund management fees and capital gains tax liabilities to measure true real net gains.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Monte Carlo Simulation</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Run 1,000 probabilistic simulations to understand median (p50), conservative (p10), and aggressive (p90) portfolio outcomes.
          </p>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions
      </h3>
      <div className="space-y-4 mb-6">
        {SIP_CALCULATOR_FAQS.map((faq, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30"
          >
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
              {faq.question}
            </h4>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Related Financial Calculators
      </h3>
      <p className="leading-relaxed text-slate-600 dark:text-slate-400 text-sm">
        Explore related personal finance tools: simulate lump-sum and interest compounding on the{' '}
        <Link href="/finance/compound-interest" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Compound Interest Calculator
        </Link>
        , calculate consumer loan debt on the{' '}
        <Link href="/finance/emi-calculator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Personal &amp; Auto Loan EMI Calculator
        </Link>
        , model residential mortgages on the{' '}
        <Link href="/finance/mortgage-calculator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Mortgage &amp; Home Loan Calculator
        </Link>
        , or calculate precious metals physical values on{' '}
        <Link href="/finance/precious-metals" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Precious Metals Market Rates
        </Link>
        .
      </p>
    </article>
  );
}