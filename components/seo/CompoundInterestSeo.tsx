import Link from 'next/link';

export default function CompoundInterestSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the core difference between simple interest and compound interest?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Simple interest is computed strictly on the initial principal balance (I = P * r * t). In contrast, compound interest generates earnings on both the initial principal and the accumulated interest from preceding periods, creating an exponential growth curve over time.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does compounding frequency impact total investment returns?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The more frequently interest compounds (such as daily or monthly versus annually), the earlier interest begins earning interest on itself. For example, $10,000 invested at 8% for 10 years yields $21,589.25 with annual compounding, $22,196.40 with monthly compounding, and $22,253.46 with continuous compounding.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the Rule of 72 and how accurate is it?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Rule of 72 is a mental shortcut to estimate how many years an investment takes to double at a fixed annual rate of return: Years to Double ~ 72 / Interest Rate. For an 8% return, 72 / 8 = 9 years. It is highly accurate for annual interest rates between 5% and 12%.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between nominal interest rate and APY (Annual Percentage Yield)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The nominal interest rate is the stated annual rate before taking compounding into account. Annual Percentage Yield (APY) reflects the true effective annual return factoring in periodic compounding: APY = (1 + r/n)^n - 1. For example, a 6% nominal rate compounded monthly has an APY of 6.168%.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does inflation affect real compound interest returns?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Inflation reduces the purchasing power of future cash. To determine the real growth rate of your money, adjust the nominal return using the Fisher equation: Real Rate = (1 + Nominal Rate) / (1 + Inflation Rate) - 1. If your investment earns 8% while inflation averages 3%, your real purchasing power increases by approximately 4.85% per year.',
        },
      },
    ],
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        Compound Interest Guide: Mathematical Formulas, Compounding Frequencies &amp; Growth Mechanics
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        <strong>Compound interest</strong> is the process where interest earned on an investment is reinvested to generate additional earnings in subsequent periods. Referred to by mathematicians and economists as geometric or exponential growth, compounding forms the cornerstone of modern wealth accumulation and retirement planning.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        The Compound Interest Formula (With Regular Contributions)
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        When an investor starts with an initial lump sum and deposits a regular periodic addition (annuity contribution), the future value is calculated by combining compound principal growth with future value annuity formulas:
      </p>

      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 font-mono text-sm sm:text-base mb-6 text-center text-slate-900 dark:text-slate-100">
        A = P &times; (1 + r/n)^(n&times;t) + PMT &times; [ ((1 + r/n)^(n&times;t) - 1) / (r/n) ]
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Variable</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Description</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Financial Meaning</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">A</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Future Value</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Total accumulated corpus including principal, contributions, and interest.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">P</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Initial Principal</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Initial balance deposited at time zero.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">PMT</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Periodic Addition</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Recurring contribution added each compounding period (e.g. monthly).</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">r</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Nominal Annual Rate</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Stated annual interest or investment return expressed as a decimal.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">n</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Compounding Frequency</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Number of compounding intervals per year (e.g. 12 for monthly, 365 for daily).</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">t</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Time Horizon</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Total duration of the investment in years.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Compounding Frequency Comparison: $10,000 at 8% Over 10 Years
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        How much does compounding frequency truly matter? The table below illustrates identical $10,000 capital invested at an 8% nominal annual return across six compounding frequencies:
      </p>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Frequency</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Periods / Year (n)</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Effective APY</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Future Value (10 Yrs)</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Total Interest Earned</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Annual</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">1</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">8.000%</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">$21,589.25</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">$11,589.25</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Semi-Annual</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">2</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">8.160%</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">$21,911.23</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">$11,911.23</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Quarterly</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">4</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">8.243%</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">$22,080.40</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">$12,080.40</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Monthly</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">12</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">8.300%</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">$22,196.40</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">$12,196.40</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Daily</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">365</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">8.328%</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">$22,253.46</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">$12,253.46</td>
            </tr>
            <tr className="bg-blue-50/50 dark:bg-blue-950/20 font-semibold text-blue-900 dark:text-blue-300">
              <th scope="row" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Continuous (Pe^rt)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">&infin;</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">8.329%</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">$22,255.41</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">$12,255.41</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        The Rule of 72: Quick Doubling Time Estimation
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        The <strong>Rule of 72</strong> is a well-established financial heuristic to calculate the approximate number of years required for an asset to double at a constant annual compounded rate:
      </p>
      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 font-mono text-sm sm:text-base mb-6 text-center text-slate-900 dark:text-slate-100">
        Years to Double &asymp; 72 / Annual Interest Rate (%)
      </div>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        At a 6% return, capital doubles in approximately 12 years. At an 8% return, it doubles in 9 years. At a 12% return, it doubles in roughly 6 years. Over a 30-year career, an investment doubling every 6 years undergoes five doubling cycles &mdash; turning $10,000 into $320,000 without additional contributions.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Realistic Long-Term Portfolio Growth Example
      </h3>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-800/40 mb-6">
        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-2">
          Scenario: $10,000 Starting Principal + $500 Monthly Contribution @ 7% Annual Return (20 Years)
        </h4>
        <ul className="text-sm space-y-2 text-slate-600 dark:text-slate-400">
          <li><strong>Initial Investment:</strong> $10,000</li>
          <li><strong>Total Monthly Deposits (240 months &times; $500):</strong> $120,000</li>
          <li><strong>Total Out-of-Pocket Capital Invested:</strong> $130,000</li>
          <li className="pt-2 border-t border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100">
            Total Future Portfolio Value: ~$300,828 (end-of-month timing) to ~$302,347 (beginning-of-month timing)
          </li>
          <li className="text-emerald-700 dark:text-emerald-400 font-semibold">
            Cumulative Compound Interest Earned: ~$170,828 to ~$172,347 (interest earned exceeds 131% of the total deposited capital)
          </li>
        </ul>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions
      </h3>
      <div className="space-y-4 mb-6">
        {faqSchema.mainEntity.map((faq, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30"
          >
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-2">
              {faq.name}
            </h4>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {faq.acceptedAnswer.text}
            </p>
          </div>
        ))}
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Related Financial Tools
      </h3>
      <p className="leading-relaxed text-slate-600 dark:text-slate-400">
        Explore regular monthly equity allocations using our{' '}
        <Link href="/finance/sip-calculator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          SIP Calculator
        </Link>
        , plan loan amortization with the{' '}
        <Link href="/finance/emi-calculator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          EMI Calculator
        </Link>
        , or determine net disposable income after payroll deductions on the{' '}
        <Link href="/finance/salary-calculator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Salary Calculator
        </Link>
        .
      </p>
    </article>
  );
}