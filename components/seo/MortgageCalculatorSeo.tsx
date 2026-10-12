import Link from 'next/link';

export default function MortgageCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What components are included in a PITI mortgage payment?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'PITI stands for Principal, Interest, Taxes, and Insurance. Principal reduces the loan balance, Interest pays the lender for financing, Taxes cover municipal property tax assessments, and Insurance covers hazard homeowners coverage plus Private Mortgage Insurance (PMI) if applicable.',
        },
      },
      {
        '@type': 'Question',
        name: 'When can Private Mortgage Insurance (PMI) be removed from a mortgage?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'In the United States on conventional conforming loans, under the federal Homeowners Protection Act of 1998, borrowers can formally request PMI cancellation once their principal balance amortizes to 80% of original value. Servicers must automatically terminate PMI once the mortgage balance hits 78% LTV, provided payments are current. In other countries (e.g., UK, Canada, Australia), lenders use LMI or higher rate tiers that typically do not drop off automatically.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the main financial trade-offs between a 15-year and 30-year fixed mortgage?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A 30-year mortgage offers lower monthly payments, maximizing immediate budget flexibility and loan eligibility. A 15-year mortgage requires roughly 30% to 35% higher monthly payments but comes with a lower interest rate and saves hundreds of thousands of dollars in cumulative interest expenses over the life of the loan.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is a mortgage escrow account and how does it work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'An escrow account is a holding account managed by your mortgage servicer. Each month, a portion of your monthly payment is placed into escrow to accumulate funds for annual property taxes and homeowners insurance premiums, ensuring these bills are paid on time without sudden large out-of-pocket expenses.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are mortgage discount points and are they worth buying?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'One mortgage point costs 1% of your total loan balance upfront in exchange for reducing your interest rate (typically by 0.25%). Points are worth buying if you plan to stay in the home longer than the breakeven period (the upfront point cost divided by the monthly interest savings, typically 5 to 7 years).',
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
        Mortgage &amp; Home Financing Guide: PITI Breakdown, Amortization &amp; Loan Comparison
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Purchasing real estate requires understanding all financial components that make up a housing payment. Beyond the baseline principal and interest, an accurate home budget must account for property taxes, hazard insurance, HOA dues, and potential private mortgage insurance.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        The Four Pillars of Housing Cost: PITI Explained
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Most mortgage lenders bundle your monthly obligation into an all-in-one payment referred to as <strong>PITI</strong>:
      </p>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Component</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Recipient</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Financial Impact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Principal (P)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Loan Balance</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Builds home equity directly by paying down the outstanding borrowed capital.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Interest (I)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Lender / Bank</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">The financing fee charged by the lender based on your agreed annual interest rate.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Taxes (T)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Local Municipality</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Local county/city real estate taxes, collected monthly into escrow to pay annual tax assessments.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Insurance (I)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Insurance Carrier</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Covers hazard/homeowners insurance plus Private Mortgage Insurance (PMI) if down payment is under 20%.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        15-Year vs. 30-Year Fixed Mortgages: Side-by-Side Comparison
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        To understand the long-term interest impact of loan tenure, examine a standardized scenario for a <strong>$400,000 home purchase</strong> with a 20% down payment ($80,000 cash), leaving a <strong>$320,000 financed loan balance</strong>:
      </p>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Metric</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">30-Year Fixed Term</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">15-Year Fixed Term</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Difference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Assumed Market Rate</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">6.50%</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">5.75%</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">0.75% lower rate on 15-year</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Monthly Principal &amp; Interest</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">$2,022.62</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">$2,657.31</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-semibold text-amber-700 dark:text-amber-400">+$634.69 / month</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Total Interest Paid</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-red-600 dark:text-red-400">$408,140.64</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-emerald-600 dark:text-emerald-400">$158,316.59</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-bold text-emerald-600 dark:text-emerald-400">Save $249,824.05</td>
            </tr>
            <tr className="bg-slate-50/50 dark:bg-slate-800/20">
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Total Lifetime Loan Cost</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">$728,140.64</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">$478,316.59</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-semibold">34.3% lower total payout</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
        <em>Assumptions &amp; Qualifications:</em> This comparison models fixed-rate schedules held to full maturity without early sale, refinancing, or prepayments, reflecting typical rate spreads between 15-year and 30-year fixed loans (5.75% vs. 6.50%). Realized savings depend on actual lender quotes and holding period; opportunity costs or alternative investment returns on the monthly cash flow difference (+$634.69/mo) are not included.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Private Mortgage Insurance (PMI) and the 80% LTV Rule (U.S. Conventional Loans)
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        When home buyers contribute less than a 20% down payment, conventional lenders in the United States require <strong>Private Mortgage Insurance (PMI)</strong> to protect against borrower default. PMI typically costs between 0.3% and 1.2% of the total loan balance annually.
      </p>
      <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-600 dark:text-slate-400">
        <li>
          <strong>Borrower-Initiated Cancellation (80% LTV):</strong> Under the U.S. federal Homeowners Protection Act of 1998, you can request PMI cancellation in writing once normal payments or extra principal payments reduce the mortgage balance to 80% of original value.
        </li>
        <li>
          <strong>Automatic Termination (78% LTV):</strong> U.S. mortgage servicers are legally mandated to eliminate PMI automatically once the loan amortizes down to 78% of original purchase price, provided the account is current.
        </li>
      </ul>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
        <em>Jurisdictional Note:</em> The 80% borrower-request and 78% automatic termination rules apply exclusively to conventional private residential mortgages in the United States. In other countries (such as the United Kingdom, Canada, or Australia), high-LTV lending typically requires Lenders Mortgage Insurance (LMI) or statutory insurance (such as CMHC in Canada), which is charged as a non-refundable upfront or capitalized premium, or higher interest rate bands that do not automatically cancel at 80% LTV.
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
        Related Financial Calculators
      </h3>
      <p className="leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate standard vehicle or personal loan repayments on the{' '}
        <Link href="/finance/emi-calculator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          EMI Calculator
        </Link>
        , project down payment savings with the{' '}
        <Link href="/finance/compound-interest" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Compound Interest Calculator
        </Link>
        , or verify net household income against housing debt on the{' '}
        <Link href="/finance/salary-calculator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Salary Calculator
        </Link>
        .
      </p>
    </article>
  );
}