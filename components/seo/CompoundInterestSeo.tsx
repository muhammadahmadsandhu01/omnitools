import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const COMPOUND_INTEREST_FAQS: FaqItem[] = [
  {
    question: 'What is compound interest and how does it work?',
    answer:
      'Compound interest is the mathematical process where earnings generated on an initial deposit are added back into the principal balance, so that in subsequent periods, interest earns interest on itself. Unlike linear simple interest, compound growth accelerates over time, producing an exponential curve where wealth accumulation expands significantly in later years.',
  },
  {
    question: 'What is the standard compound interest formula for a lump sum deposit?',
    answer:
      'The classical discrete compound interest formula is A = P * (1 + r / n)^(n * t), where A is the terminal future value, P is the starting principal, r is the annual nominal interest rate expressed as a decimal, n is the number of compounding periods per year (e.g., 12 for monthly, 365 for daily), and t is the investment horizon in years.',
  },
  {
    question: 'What is the formula for compound interest with recurring regular contributions?',
    answer:
      'When making regular recurring deposits (PMT) that compound at the same frequency as additions, future value is calculated using the future value of an annuity formula combined with the lump sum growth: For end-of-period deposits (Ordinary Annuity): A = P * (1 + r/n)^(n*t) + PMT * [((1 + r/n)^(n*t) - 1) / (r/n)]. For beginning-of-period deposits (Annuity Due), the annuity portion is multiplied by an additional factor of (1 + r/n).',
  },
  {
    question: 'What is the difference between nominal interest rate and Annual Percentage Yield (APY)?',
    answer:
      'The nominal rate (stated APR) is the baseline annual interest before accounting for intra-year compounding. Annual Percentage Yield (APY), or Effective Annual Rate (EAR), reflects the true annual return factoring in compounding frequency: APY = (1 + r/n)^n - 1. For instance, a 6% nominal rate compounded monthly generates an effective APY of 6.168%, while daily compounding generates an APY of 6.183%.',
  },
  {
    question: 'How does compounding frequency impact the final portfolio balance?',
    answer:
      'Higher compounding frequencies add interest to the principal sooner, allowing interest-on-interest to accumulate faster. For example, a $10,000 investment at 8% annual return over 10 years produces $21,589.25 with annual compounding, $22,080.40 with quarterly compounding, $22,196.40 with monthly compounding, $22,253.46 with daily compounding, and $22,255.41 with theoretical continuous compounding.',
  },
  {
    question: 'Does investing at the beginning or end of a period make a difference?',
    answer:
      'Yes. Contributions deposited at the beginning of each period (Annuity Due) immediately accrue returns throughout that entire cycle, whereas end-of-period deposits (Ordinary Annuity) do not begin earning returns until the subsequent cycle. Over a 20-year horizon with $500 monthly contributions at 8% annual return, beginning-of-period timing generates approximately $1,963.40 in additional compound earnings on the exact same invested capital.',
  },
  {
    question: 'What is the Rule of 72 and how accurate is it?',
    answer:
      'The Rule of 72 is an algebraic shortcut used to estimate how many years an investment takes to double at a constant annual return: Years to Double ~ 72 / Interest Rate. For an 8% annual return, 72 / 8 = 9 years. The approximation is remarkably accurate for interest rates between 5% and 12%, though exact doubling time is calculated as ln(2) / ln(1 + r/n).',
  },
  {
    question: 'How does the Fisher equation calculate real inflation-adjusted returns?',
    answer:
      'Inflation erodes future purchasing power. Rather than using crude subtraction (Nominal - Inflation), KivaroTools applies the exact economic Fisher equation: Real Return = (1 + Nominal Rate) / (1 + Inflation Rate) - 1. For example, an 8% nominal investment return in an economy with 3% annual inflation yields an exact real purchasing power growth rate of 4.854% per year.',
  },
  {
    question: 'How do investment fees and management expense drag affect compound growth?',
    answer:
      'Even small percentage fees compound destructively over decades. An annual 1% asset management fee on a 7% gross portfolio does not simply reduce final gains by 1%; over 30 years, it can reduce total accumulated terminal wealth by more than 25% because fees are deducted before gains have the opportunity to compound.',
  },
  {
    question: 'What is the difference between simple interest and compound interest?',
    answer:
      'Simple interest is calculated strictly on the original principal balance (Interest = P * r * t) and produces linear growth. Compound interest computes returns on the principal plus all previous accumulated interest, creating an exponential growth curve that widens the wealth gap every subsequent year.',
  },
  {
    question: 'Why do two financial calculators sometimes display slightly different totals?',
    answer:
      'Differences typically stem from three methodological variations: (1) Contribution timing (beginning vs end of month), (2) Compounding convention (discrete monthly calendar periods vs daily sub-period 365-day time-stepping), and (3) Rounding rules. KivaroTools provides transparent disclosure of its sub-period daily synchronization and allows toggling between beginning and end-of-period contribution timing.',
  },
  {
    question: 'Are calculator projections guaranteed future returns?',
    answer:
      'No. All compound interest calculations are mathematical models based on constant user-supplied assumptions. Real-world financial assets (such as stocks, bonds, and real estate) experience fluctuating market volatility, variable inflation, economic cycles, sequence-of-returns risk, and tax obligations. Projections should be used as educational baselines rather than guaranteed forecasts.',
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
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-6 sm:p-10 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-xs">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Section 1: Introduction */}
      <section aria-labelledby="compound-interest-the-foundations-of-compound-in" className="mb-10">
        <h2 id="compound-interest-the-foundations-of-compound-in" className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-slate-100">
          The Foundations of Compound Interest: Mechanics, Mathematics &amp; Long-Term Growth
        </h2>
      <blockquote className="p-4 my-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg dark:bg-slate-800 not-italic">
        <p className="text-sm text-slate-700 dark:text-slate-300 m-0">
          <strong>Privacy First &amp; Secure:</strong> All processing is done locally in your browser via client-side JavaScript. No files, text, or data are ever uploaded to our servers.
        </p>
      </blockquote>
        <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
          Compound interest is widely regarded as the cornerstone of personal financial planning and modern wealth creation. Unlike linear systems where interest is calculated strictly on the initial deposit, compound growth reinvests every cycle&apos;s earnings back into the capital base. As a result, subsequent interest is earned on both the original principal and all prior accumulated returns.
        </p>
        <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
          Over short periods of one to three years, the difference between simple and compound interest appears modest. However, across multi-decade horizons of 10, 20, or 30 years, compounding transforms disciplined, modest contributions into substantial capital. The KivaroTools Compound Interest Calculator enables savers, investors, and students to model exact wealth projections, evaluate different compounding frequencies, assess beginning versus end-of-period contribution timing, and adjust for inflation purchasing power drag.
        </p>
      </section>

      {/* Section 2: Calculator Instructions */}
      <section aria-labelledby="compound-interest-how-to-use-the-kivarotools-com" className="mb-10">
        <h3 id="compound-interest-how-to-use-the-kivarotools-com" className="text-xl sm:text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">
          How to Use the KivaroTools Compound Interest Calculator
        </h3>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
          The calculator is designed to provide institutional-grade precision with an intuitive, responsive interface. Follow these steps to simulate your plan:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1.5">1. Starting Capital &amp; Additions</h4>
            <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400 list-disc pl-4">
              <li><strong>Currency:</strong> Choose from major global currencies (USD, EUR, GBP, CAD, AUD, JPY, INR).</li>
              <li><strong>Initial Investment:</strong> Enter your lump-sum starting balance ($0 or higher).</li>
              <li><strong>Contribution Amount:</strong> Set regular recurring deposits (e.g., $500/month).</li>
              <li><strong>Contribution Frequency:</strong> Select Weekly, Bi-weekly, Monthly, Quarterly, or Annually.</li>
              <li><strong>Contribution Timing:</strong> Choose whether additions occur at the <em>Beginning</em> or <em>End</em> of each interval.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1.5">2. Growth Rates &amp; Economic Factors</h4>
            <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400 list-disc pl-4">
              <li><strong>Annual Nominal Return:</strong> The expected annual percentage return (e.g., 7% or 8%).</li>
              <li><strong>Compounding Frequency:</strong> Annually, Semi-Annually, Quarterly, Monthly, or Daily.</li>
              <li><strong>Investment Period:</strong> Duration in years (0.1 to 100 years).</li>
              <li><strong>Inflation Adjustment:</strong> Toggle real purchasing power discounting via the Fisher equation.</li>
              <li><strong>Tax Treatment:</strong> Model Taxable, Tax-Deferred (401k/IRA), or Tax-Exempt (Roth) accounts.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 3: Results Explained */}
      <section aria-labelledby="compound-interest-understanding-your-calculation" className="mb-10">
        <h3 id="compound-interest-understanding-your-calculation" className="text-xl sm:text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">
          Understanding Your Calculation Outputs
        </h3>
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Output Metric</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Mathematical Meaning</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Financial Significance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Future Value (Ending Balance)</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">P + Total Deposits + Net Interest</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">The total nominal value of your investment portfolio at the end of the selected horizon.</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Total Invested Capital</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">P + &sum; Contributions</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Your cumulative out-of-pocket cash deposits over the lifetime of the investment.</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Net Compound Interest Earned</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Future Value - Total Invested</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">The pure wealth generated by market returns and compounding interest on interest.</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Effective Annual Yield (APY)</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">(1 + r/m)^m - 1</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">The standardized annualized return that accounts for intra-year compounding frequencies.</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Fisher Real Purchasing Power</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">FV / (1 + i)^t</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">What your future portfolio will actually be worth in terms of today&apos;s purchasing power after inflation.</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Rule of 72 Doubling Time</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">~ 72 / r</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">The estimated number of years required for your invested capital to double at the stated rate.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4: Mathematical Formulas & Variables */}
      <section aria-labelledby="compound-interest-mathematical-formulas-amp-vari" className="mb-10">
        <h3 id="compound-interest-mathematical-formulas-amp-vari" className="text-xl sm:text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">
          Mathematical Formulas &amp; Variable Glossary
        </h3>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
          Financial growth modeling relies on rigorous mathematical foundations. Below are the governing equations implemented in the KivaroTools calculation engine:
        </p>

        {/* Formula Cards */}
        <div className="space-y-4 mb-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
              1. Discrete Lump-Sum Compounding Formula
            </h4>
            <div className="rounded-xl bg-white dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800 font-mono text-sm text-center text-slate-900 dark:text-slate-100 my-2">
              A = P &times; (1 + r / n)^(n &times; t)
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Where <strong>P</strong> is starting principal, <strong>r</strong> is nominal annual rate as a decimal, <strong>n</strong> is compounding frequency per year, and <strong>t</strong> is time in years. Compound interest earned is <code>A - P</code>.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
              2. Recurring Contributions — Ordinary Annuity (End of Period)
            </h4>
            <div className="rounded-xl bg-white dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800 font-mono text-sm text-center text-slate-900 dark:text-slate-100 my-2">
              FV_annuity = PMT &times; [ (1 + r / n)^(n &times; t) - 1 ] / (r / n)
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Applied when regular additions (<strong>PMT</strong>) occur at the close of each cycle. Total balance equals <code>A_lump + FV_annuity</code>.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
              3. Recurring Contributions — Annuity Due (Beginning of Period)
            </h4>
            <div className="rounded-xl bg-white dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800 font-mono text-sm text-center text-slate-900 dark:text-slate-100 my-2">
              FV_due = FV_annuity &times; (1 + r / n)
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Applied when additions enter at the beginning of each cycle, earning an additional sub-period of compounding on each deposit.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
              4. Continuous Compounding Limit
            </h4>
            <div className="rounded-xl bg-white dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800 font-mono text-sm text-center text-slate-900 dark:text-slate-100 my-2">
              A = P &times; e^(r &times; t)
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              The theoretical mathematical limit as compounding frequency <strong>n</strong> approaches infinity, where <strong>e</strong> is Euler&apos;s number (~2.71828).
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Compounding Frequencies Compared */}
      <section aria-labelledby="compound-interest-compounding-frequency-comparis" className="mb-10">
        <h3 id="compound-interest-compounding-frequency-comparis" className="text-xl sm:text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">
          Compounding Frequency Comparison: $10,000 at 8% for 10 Years
        </h3>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
          To illustrate how compounding intervals affect returns, consider an initial principal of <strong>$10,000</strong> invested at a <strong>8.00% nominal rate</strong> over a <strong>10-year horizon</strong> with zero additional deposits:
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Frequency</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Periods/Year (n)</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Effective APY</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Ending Balance</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Total Interest Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Annually</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">1</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">8.000%</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-slate-100">$21,589.25</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-emerald-600 dark:text-emerald-400">$11,589.25</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Semi-Annually</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">2</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">8.160%</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-slate-100">$21,911.23</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-emerald-600 dark:text-emerald-400">$11,911.23</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Quarterly</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">4</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">8.243%</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-slate-100">$22,080.40</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-emerald-600 dark:text-emerald-400">$12,080.40</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Monthly</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">12</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">8.300%</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-slate-100">$22,196.40</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-emerald-600 dark:text-emerald-400">$12,196.40</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Daily</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">365</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">8.328%</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-slate-100">$22,253.46</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-emerald-600 dark:text-emerald-400">$12,253.46</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Continuous</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">&infin;</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">8.329%</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-slate-100">$22,255.41</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-emerald-600 dark:text-emerald-400">$12,255.41</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 6: Worked Examples */}
      <section aria-labelledby="compound-interest-four-reproducible-worked-examp" className="mb-10">
        <h3 id="compound-interest-four-reproducible-worked-examp" className="text-xl sm:text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">
          Four Reproducible Worked Examples
        </h3>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 mb-6">
          To verify calculation accuracy and build intuition, review these four independently audited investment scenarios:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Example 1 */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-2 flex items-center justify-between">
              <span>Example 1: Pure Lump-Sum Deposit</span>
              <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">Lump Sum</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
              <strong>Assumptions:</strong> $10,000 principal, 7% annual return, 10-year tenure, no ongoing contributions.
            </p>
            <div className="text-xs space-y-1 font-mono bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <p>Annual Compounding: $10,000 &times; (1.07)^10 = <strong>$19,671.51</strong></p>
              <p>Monthly Compounding: $10,000 &times; (1 + 0.07/12)^120 = <strong>$20,096.61</strong></p>
              <p className="text-emerald-600 dark:text-emerald-400 font-bold font-sans">Compounding Frequency Delta: +$425.10</p>
            </div>
          </div>

          {/* Example 2 */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-2 flex items-center justify-between">
              <span>Example 2: Systematic Wealth Accumulation</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">Lump + Monthly</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
              <strong>Assumptions:</strong> $10,000 initial, $500/month recurring deposit (end timing), 8% return, 20-year horizon, monthly compounding.
            </p>
            <div className="text-xs space-y-1 font-mono bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <p>Total Cash Invested: $10,000 + (240 &times; $500) = $130,000.00</p>
              <p>Simulated Ending Balance: <strong>$343,748.66</strong></p>
              <p className="text-emerald-600 dark:text-emerald-400 font-bold font-sans">Compound Interest Earned: $213,748.66 (62.2% of wealth!)</p>
            </div>
          </div>

          {/* Example 3 */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-2 flex items-center justify-between">
              <span>Example 3: Beginning vs End Timing Delta</span>
              <span className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold">Timing Advantage</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
              <strong>Comparison:</strong> Same $10,000 + $500/month, 8% return, 20 years, comparing Beginning vs End of period.
            </p>
            <div className="text-xs space-y-1 font-mono bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <p>End Timing (Ordinary Annuity): $343,748.66</p>
              <p>Beginning Timing (Annuity Due): $345,712.06</p>
              <p className="text-purple-600 dark:text-purple-400 font-bold font-sans">Beginning Timing Advantage: +$1,963.40</p>
            </div>
          </div>

          {/* Example 4 */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-900/40">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-2 flex items-center justify-between">
              <span>Example 4: Zero-Interest Baseline</span>
              <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">Discipline vs Return</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
              <strong>Baseline:</strong> Same $10,000 + $500/month over 20 years, but with 0% interest (cash mattress).
            </p>
            <div className="text-xs space-y-1 font-mono bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <p>Total Cash Accumulated: $130,000.00</p>
              <p>Compound Interest Earned: $0.00</p>
              <p className="text-amber-700 dark:text-amber-400 font-bold font-sans">Compounding Multiplier at 8%: 2.64&times; Total Wealth</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Practical Financial Planning Applications */}
      <section aria-labelledby="compound-interest-practical-real-world-applicati" className="mb-10">
        <h3 id="compound-interest-practical-real-world-applicati" className="text-xl sm:text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">
          Practical Real-World Applications
        </h3>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
          Compound interest calculations power diverse real-world wealth strategies:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Retirement Accounts (401k &amp; IRA)</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Automated payroll contributions into tax-deferred accounts harness decades of compounding without annual capital gains drag.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Index Fund Wealth Accumulation</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Reinvesting dividends in broad-market index funds (e.g., S&amp;P 500) compounds both share prices and dividend yield share count.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">College Savings (529 Plans)</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Starting a college fund at birth allows 18 years of uninterrupted tax-free compounding before tuition withdrawals begin.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">High-Yield Savings &amp; CD Ladders</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Emergency fund reserves benefit from daily compounding in FDIC-insured high-yield accounts, preserving capital liquidity.
            </p>
          </div>
        </div>
      </section>

      {/* Section 8: Disclosures & Assumptions */}
      <section aria-labelledby="compound-interest-model-assumptions-amp-importan" className="mb-10">
        <h3 id="compound-interest-model-assumptions-amp-importan" className="text-xl sm:text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">
          Model Assumptions &amp; Important Financial Disclosures
        </h3>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
          Before relying on calculator outputs, consider these real-world economic constraints:
        </p>
        <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-400 list-disc pl-5 mb-6">
          <li><strong>Constant Return Limitation:</strong> Real equity markets fluctuate with bull runs and bear drawdowns. A 7% average return does not deliver 7% every year; sequence of returns risk can impact wealth, especially near retirement.</li>
          <li><strong>Purchasing Power Erosion:</strong> Nominal future balances do not reflect inflation. Always inspect the Fisher inflation-adjusted real purchasing power output when planning multi-decade goals.</li>
          <li><strong>Tax Obligations:</strong> In taxable accounts, annual dividend taxes and capital gains reduce net compound growth unless shielded in tax-advantaged vehicles.</li>
          <li><strong>Expense Drag:</strong> Management fees (AUM), fund expense ratios, and advisory costs deduct continuously from compound growth.</li>
        </ul>
      </section>

      {/* Section 9: Frequently Asked Questions */}
      <section aria-labelledby="compound-interest-frequently-asked-questions" className="mb-10">
        <h3 id="compound-interest-frequently-asked-questions" className="text-xl sm:text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">
          Frequently Asked Questions
        </h3>
        <div className="space-y-3">
          {COMPOUND_INTEREST_FAQS.map((faq, index) => (
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
      </section>

      {/* Section 10: Related Tools */}
      <section aria-labelledby="compound-interest-related-financial-planning-too" className="mb-10">
        <h3 id="compound-interest-related-financial-planning-too" className="text-xl sm:text-2xl font-bold mb-3 text-slate-800 dark:text-slate-200">
          Related Financial Planning Tools
        </h3>
        <p className="leading-relaxed text-slate-600 dark:text-slate-400 text-sm mb-4">
          Explore complementary financial modeling utilities across the KivaroTools suite:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <Link
            href="/finance/sip-calculator"
            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition group"
          >
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">SIP Calculator</span>
              <p className="text-[11px] text-slate-500">Systematic investment plan wealth step-up modeling</p>
            </div>
            <span className="text-blue-600 dark:text-blue-400 font-bold">&rarr;</span>
          </Link>

          <Link
            href="/finance/emi-calculator"
            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition group"
          >
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">Loan EMI Calculator</span>
              <p className="text-[11px] text-slate-500">Personal &amp; auto loan monthly amortization schedules</p>
            </div>
            <span className="text-blue-600 dark:text-blue-400 font-bold">&rarr;</span>
          </Link>

          <Link
            href="/finance/mortgage-calculator"
            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition group"
          >
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">Mortgage Calculator</span>
              <p className="text-[11px] text-slate-500">Home loan payments, property tax, and PMI</p>
            </div>
            <span className="text-blue-600 dark:text-blue-400 font-bold">&rarr;</span>
          </Link>

          <Link
            href="/finance/precious-metals"
            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition group"
          >
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">Precious Metals Rates</span>
              <p className="text-[11px] text-slate-500">Live gold, silver, and platinum store-of-value prices</p>
            </div>
            <span className="text-blue-600 dark:text-blue-400 font-bold">&rarr;</span>
          </Link>
        </div>
      </section>

      {/* Section 11: Sources & Editorial Governance */}
      <section aria-labelledby="compound-interest-authoritative-references-amp-a" className="pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-2">
        <h4 id="compound-interest-authoritative-references-amp-a" className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
          Authoritative References &amp; Academic Sources
        </h4>
        <p>
          Formulas and financial conventions implemented in KivaroTools reference standards published by the{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300">U.S. Securities and Exchange Commission (Investor.gov)</span>,{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300">Financial Industry Regulatory Authority (FINRA)</span>,{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300">CFA Institute</span> Standards of Practice, and the{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300">Federal Reserve Board</span> Economic Data (FRED).
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-1">
          <strong>Educational Disclaimer:</strong> KivaroTools does not provide personalized investment advice, tax counseling, or financial brokerage services. All calculations are provided for educational and illustrative modeling purposes.
        </p>
      </section>
    </article>
  );
}