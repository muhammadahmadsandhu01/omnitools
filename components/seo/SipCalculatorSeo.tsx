import Link from 'next/link';

export default function SipCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does a Systematic Investment Plan (SIP) work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A Systematic Investment Plan (SIP) is a method where an investor commits a fixed dollar or rupee amount into mutual funds or index funds at regular monthly intervals. This automated schedule enforces disciplined saving and uses dollar-cost averaging to buy assets regardless of market volatility.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is dollar-cost averaging and how does SIP benefit from market corrections?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Dollar-cost averaging occurs when you invest a fixed cash sum regularly. When market prices fall, your fixed payment automatically purchases a larger number of mutual fund units. When prices rise, you buy fewer units. Over extended periods, this lowers your average cost per unit without requiring you to time market bottoms.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is a Step-Up SIP and why is it recommended?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A Step-Up (or Top-Up) SIP automatically increases your monthly investment contribution by a fixed percentage (typically 5% to 10%) each year, mirroring annual career salary increments. Stepping up contributions significantly magnifies the terminal portfolio value over a 15- to 20-year horizon.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is a SIP always better than a lump-sum investment?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'In pure bull markets, a lump-sum investment often outperforms because 100% of the capital is exposed to growth from day one. However, SIP is superior for managing sequence-of-returns risk and psychological volatility stress, especially when investing during uncertain or volatile market cycles.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can an investor pause or withdraw from a SIP at any time?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Unless you are investing in specialized tax-saving funds with statutory lock-in periods (such as Indian ELSS funds with a 3-year lock-in or retirement accounts with age restrictions), open-ended mutual fund SIPs can be paused, modified, or liquidated at prevailing Net Asset Value (NAV) without penalty.',
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
        Systematic Investment Plan (SIP) Guide: Dollar-Cost Averaging, Compounding &amp; Wealth Creation
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        A <strong>Systematic Investment Plan (SIP)</strong> allows individuals to invest manageable, regular sums into mutual funds, index exchange-traded funds (ETFs), or equities. By replacing speculative market timing with disciplined periodic allocation, SIPs harness dollar-cost averaging and geometric compound interest to accumulate long-term wealth.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        The SIP Future Value Formula (Annuity Due)
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Because SIP installments are typically deposited at the start of each monthly interval, future returns are modeled as an annuity due:
      </p>

      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 font-mono text-sm sm:text-base mb-6 text-center text-slate-900 dark:text-slate-100">
        FV = P &times; [ ((1 + i)^n - 1) / i ] &times; (1 + i)
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Symbol</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Parameter</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Financial Meaning</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">FV</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Future Value</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Total estimated corpus accumulated at the end of the investment horizon.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">P</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Monthly Installment</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Fixed amount invested every month into the target fund.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">i</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Periodic Rate</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Expected annual return divided by 12 months and 100 (e.g., 12% annual = 0.01 per month).</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">n</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Total Months</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Total number of monthly contributions (years &times; 12).</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Dollar-Cost Averaging: The Strategic Edge
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Retail investors frequently stumble when attempting to time market highs and lows. <strong>Dollar-Cost Averaging (DCA)</strong> neutralizes market timing anxiety:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2 text-slate-600 dark:text-slate-400">
        <li>
          <strong>During Market Declines:</strong> Your fixed monthly contribution buys mutual fund units at lower Net Asset Values (NAVs), accumulating more total units per dollar spent.
        </li>
        <li>
          <strong>During Market Rallies:</strong> Your contribution buys fewer units at premium prices, preventing overexposure at market peaks.
        </li>
        <li>
          <strong>Average Cost Reduction:</strong> Over multiple market cycles, the average cost per unit acquired via SIP is systematically lower than the simple average of market prices.
        </li>
      </ul>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Worked Projection: $500/Month Across 5, 10, and 15 Years
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Assuming a diversified equity index portfolio with a conservative <strong>10% annualized return</strong>, observe how wealth acceleration intensifies as time horizons expand:
      </p>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Duration</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Total Invested</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Estimated Corpus</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Capital Gains</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Gains as % of Investment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">5 Years</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">$30,000</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">$39,041</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-emerald-600 dark:text-emerald-400">$9,041</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">30.1% gain</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">10 Years</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">$60,000</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">$103,276</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-emerald-600 dark:text-emerald-400">$43,276</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">72.1% gain</td>
            </tr>
            <tr className="bg-emerald-50/50 dark:bg-emerald-950/20 font-semibold text-emerald-800 dark:text-emerald-300">
              <th scope="row" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">15 Years</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">$90,000</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">$208,962</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-emerald-600 dark:text-emerald-400">$118,962</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">132.2% gain (earnings exceed principal)</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
        <em>Assumptions:</em> Modeled with beginning-of-month deposits (annuity due) compounding monthly at a constant 10% nominal annual return, without management expense ratios or tax withholdings. If contributions are deposited at end-of-month, 15-year future value is $207,235.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        The Step-Up SIP Advantage
      </h3>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        In a standard SIP, your contribution remains fixed at $500 throughout the entire 15 years. However, professional salaries typically rise by 5% to 10% each year. By enabling a <strong>10% annual Step-Up</strong> on the same initial $500 monthly deposit, your total 15-year accumulated corpus exceeds <strong>$350,000</strong> &mdash; delivering a 68% larger final nest egg with minimal lifestyle disruption.
      </p>

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
        Simulate lump sum investments and custom compounding schedules on the{' '}
        <Link href="/finance/compound-interest" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Compound Interest Calculator
        </Link>
        , compute monthly take-home earnings on the{' '}
        <Link href="/finance/salary-calculator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Salary Calculator
        </Link>
        , or evaluate physical wealth preservation using our{' '}
        <Link href="/finance/precious-metals" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Precious Metals Calculator
        </Link>
        .
      </p>
    </article>
  );
}