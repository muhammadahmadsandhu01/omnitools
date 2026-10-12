import Link from 'next/link';

export default function EmiCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How is an Equated Monthly Installment (EMI) calculated on a reducing balance basis?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'An EMI is computed using the reducing balance formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1), where P is the loan principal, r is the monthly periodic interest rate (annual rate divided by 12 months and 100), and n is the total tenure in months. With each installment, interest is billed only on the remaining unpaid principal balance.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between reducing balance interest and flat rate interest?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'In a flat rate loan, interest is calculated on the entire initial principal across the whole tenure, meaning interest charges never decrease even as you repay the debt. In a reducing balance loan, interest is calculated each month only on the remaining outstanding balance. A 10% flat interest rate is equivalent to an effective reducing rate of roughly 17% to 19%.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does making a loan prepayment reduce tenure or monthly EMI?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Borrowers usually choose between reducing the loan tenure or lowering the monthly installment. Choosing to reduce loan tenure keeps your monthly payment identical but pays off the debt faster, saving significantly more in cumulative interest. Lowering the monthly installment improves immediate cash flow but yields smaller total interest savings.',
        },
      },
      {
        '@type': 'Question',
        name: 'What debt-to-income ratio do lenders prefer for EMI approvals?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Lenders typically recommend that total monthly debt obligations (including the proposed EMI, credit card balances, and personal loans) remain below 40% to 50% of your gross monthly income. Maintaining a debt-to-income ratio under 35% generally qualifies borrowers for the most competitive interest rates.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do processing fees and pre-closure penalties affect loan cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Upfront processing fees (typically 0.5% to 2.5% of the loan amount) and documentation charges increase the effective Annual Percentage Rate (APR). Additionally, some fixed-rate loans carry pre-closure charges if repaid early, whereas floating-rate retail consumer loans in many jurisdictions are exempt from prepayment penalties.',
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
        Equated Monthly Installment (EMI) Guide: Formulas, Amortization &amp; Repayment Strategies
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        An <strong>Equated Monthly Installment (EMI)</strong> is a fixed payment amount made by a borrower to a lender at a specified calendar date each month. EMIs are designed to amortize both the accumulated periodic interest and the loan principal over a specified duration, ensuring the debt is settled in full by the end of the loan tenure.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        The Mathematical EMI Formula (Reducing Balance Method)
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Retail banking and institutional lending calculate consumer debt repayments using the standard reducing balance compounding formula:
      </p>

      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 font-mono text-sm sm:text-base mb-6 text-center text-slate-900 dark:text-slate-100">
        E = P &times; r &times; [ (1 + r)^n ] / [ (1 + r)^n - 1 ]
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Variable</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Definition</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Calculation Method</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">E</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">EMI Amount</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">The fixed monthly installment paid until maturity.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">P</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Principal</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Initial loan amount borrowed from the lending institution.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">r</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Periodic Rate</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Annual interest rate divided by 12 months and 100 (e.g., 9% per year = 0.09 / 12 = 0.0075 per month).</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">n</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Tenure in Months</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Loan duration multiplied by 12 (e.g., a 5-year loan = 60 installments).</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Reducing Balance vs. Flat Rate Interest: Understanding the Trap
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        When evaluating loan offers, always confirm whether the quoted interest rate is <em>reducing</em> or <em>flat</em>. In a flat-rate contract, interest is assessed on the full initial loan amount throughout the entire loan term, regardless of how much principal has already been repaid.
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2 text-slate-600 dark:text-slate-400">
        <li>
          <strong>Reducing Balance (Fair Market Standard):</strong> Each month, interest is charged only on the remaining balance. As the principal drops, monthly interest charges fall and principal repayment accelerates.
        </li>
        <li>
          <strong>Flat Rate (Misleading Cost):</strong> A flat rate of 8% on a $20,000, 5-year loan charges $1,600 per year ($8,000 total). On a reducing balance basis, that same $8,000 total interest corresponds to an actual effective interest rate of approximately <strong>14.5%</strong>.
        </li>
      </ul>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Worked Repayment Examples
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-800/40">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-2">Example 1: Auto Loan ($25,000)</h4>
          <ul className="text-sm space-y-1.5 text-slate-600 dark:text-slate-400">
            <li><strong>Principal:</strong> $25,000</li>
            <li><strong>Annual Interest Rate:</strong> 6.50%</li>
            <li><strong>Loan Tenure:</strong> 5 Years (60 Months)</li>
            <li className="pt-2 border-t border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100">Monthly EMI: $489.15</li>
            <li><strong>Total Interest Payable:</strong> $4,349.22</li>
            <li><strong>Total Loan Repayment:</strong> $29,349.22</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-800/40">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-2">Example 2: Personal Loan ($15,000)</h4>
          <ul className="text-sm space-y-1.5 text-slate-600 dark:text-slate-400">
            <li><strong>Principal:</strong> $15,000</li>
            <li><strong>Annual Interest Rate:</strong> 11.00%</li>
            <li><strong>Loan Tenure:</strong> 3 Years (36 Months)</li>
            <li className="pt-2 border-t border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100">Monthly EMI: $491.08</li>
            <li><strong>Total Interest Payable:</strong> $2,678.91</li>
            <li><strong>Total Loan Repayment:</strong> $17,678.91</li>
          </ul>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Loan Prepayment Strategies: Tenure Reduction vs. Lower EMI
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Making partial prepayments directly reduces the loan principal. Lenders provide two ways to adjust your remaining schedule:
      </p>
      <ol className="list-decimal pl-6 mb-6 space-y-2 text-slate-600 dark:text-slate-400">
        <li>
          <strong>Option A &mdash; Reduce Tenure (Recommended for Interest Savings):</strong> Keep the monthly EMI identical and shorten the number of remaining months. Because the principal is eliminated ahead of schedule, cumulative interest savings are maximized.
        </li>
        <li>
          <strong>Option B &mdash; Reduce Monthly EMI (Recommended for Cash-Flow Relief):</strong> Keep the remaining tenure unchanged and recalculate a lower monthly payment. This relieves immediate monthly cash flow constraints but yields smaller total interest savings.
        </li>
      </ol>

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
        Explore Related Financial Utilities
      </h3>
      <p className="leading-relaxed text-slate-600 dark:text-slate-400">
        Compare this calculation with long-term home mortgages on the{' '}
        <Link href="/finance/mortgage-calculator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Mortgage Calculator
        </Link>
        , project investment accumulation with the{' '}
        <Link href="/finance/compound-interest" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Compound Interest Calculator
        </Link>
        , or evaluate monthly savings through the{' '}
        <Link href="/finance/sip-calculator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          SIP Calculator
        </Link>
        .
      </p>
    </article>
  );
}