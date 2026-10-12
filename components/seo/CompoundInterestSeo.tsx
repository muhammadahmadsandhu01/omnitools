import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const COMPOUND_INTEREST_FAQS: FaqItem[] = [
  {
    question: 'What is the core mathematical difference between simple interest and compound interest?',
    answer:
      'Simple interest is computed strictly on the initial principal balance (I = P * r * t). In contrast, compound interest generates earnings on both the initial principal and the accumulated interest from preceding periods (A = P * (1 + r/n)^(n*t)), creating an exponential curve where returns accelerate over time.',
  },
  {
    question: 'How does compounding frequency impact terminal portfolio value?',
    answer:
      'The more frequently interest compounds (such as daily or monthly versus annually), the sooner interest starts earning interest on itself. For example, $10,000 invested at 8% for 10 years yields $21,589.25 with annual compounding, $22,196.40 with monthly compounding, and $22,253.46 with continuous compounding (A = P * e^(rt)).',
  },
  {
    question: 'What is the Rule of 72 and when is it most accurate?',
    answer:
      'The Rule of 72 is an algebraic approximation to estimate how many years an investment takes to double at a fixed annual return: Years to Double ~ 72 / Interest Rate. For an 8% return, 72 / 8 = 9 years. It is highly accurate for annual interest rates between 5% and 12%.',
  },
  {
    question: 'What is the difference between nominal interest rate and Annual Percentage Yield (APY)?',
    answer:
      'The nominal rate is the stated annual interest before compounding. Annual Percentage Yield (APY) reflects the true effective annual return factoring in compounding periods: APY = (1 + r/n)^n - 1. A 6% nominal rate compounded monthly produces an effective APY of 6.168%.',
  },
  {
    question: 'How does the Fisher equation adjust compound growth for inflation?',
    answer:
      'Inflation erodes future purchasing power. To determine real purchasing power growth, OmniTools applies the Fisher equation: Real Rate = (1 + Nominal Rate) / (1 + Inflation Rate) - 1. If an asset earns 8% while inflation averages 3%, the real purchasing power increases by approximately 4.85% per year.',
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

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-xs">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        Compound Interest Guide: Mathematical Formulas, Compounding Frequencies &amp; Growth Mechanics
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Compound interest is often called the foundation of modern wealth accumulation. Unlike linear growth models, compound interest reinvests each period&apos;s interest back into the principal, allowing subsequent yields to generate their own returns. Over multi-decade horizons, compounding transforms disciplined regular contributions into substantial capital.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        The Compounding Formula &amp; Variable Definitions
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Periodic compound growth with recurring additions is governed by the standard future value formula:
      </p>

      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 font-mono text-sm sm:text-base mb-6 text-center text-slate-900 dark:text-slate-100">
        A = P &times; (1 + r / n)^(n &times; t) + PMT &times; [ (1 + r / n)^(n &times; t) - 1 ] / (r / n)
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Variable</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Description</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Financial Significance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">A</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Future Value</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Final accumulated portfolio amount including principal, deposits, and compounded interest.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">P</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Initial Principal</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">The starting balance deposited at time zero.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">PMT</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Periodic Addition</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Regular recurring deposit added at the beginning or end of each period.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">r</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Nominal Rate</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Annual stated interest or expected investment return (expressed as a decimal).</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">n</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Frequency</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Times compounded per year: Annually (1), Semi-Annually (2), Quarterly (4), Monthly (12), Daily (365).</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">t</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Tenure (Years)</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Total duration the capital remains invested and accumulating.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Advanced Portfolio Modeling: Inflation, Taxes &amp; Volatility
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        OmniTools provides institutional-grade wealth projection features beyond flat calculator tools:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Fisher Inflation Adjustment</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Computes real purchasing power by discounting future nominal sums using exact historical or projected inflation indices.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Tax Drag Analysis</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Simulate tax-deferred accounts (401k/IRA/pension) versus taxable brokerage accounts subjected to annual capital gains drag.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Milestone Injections</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Model one-time financial events, such as annual bonuses, inheritance windfalls, or planned college tuition withdrawals.
          </p>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions
      </h3>
      <div className="space-y-4 mb-6">
        {COMPOUND_INTEREST_FAQS.map((faq, index) => (
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
        Related Financial Tools
      </h3>
      <p className="leading-relaxed text-slate-600 dark:text-slate-400 text-sm">
        Explore related personal finance utilities: model systematic mutual fund investments on the{' '}
        <Link href="/finance/sip-calculator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          SIP Calculator
        </Link>
        , calculate consumer loan amortization on the{' '}
        <Link href="/finance/emi-calculator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Personal &amp; Auto Loan EMI Calculator
        </Link>
        , simulate home mortgages on the{' '}
        <Link href="/finance/mortgage-calculator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Mortgage &amp; Home Loan Calculator
        </Link>
        , or track gold and silver store-of-value prices on{' '}
        <Link href="/finance/precious-metals" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Precious Metals Market Rates
        </Link>
        .
      </p>
    </article>
  );
}