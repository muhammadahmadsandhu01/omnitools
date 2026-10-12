import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const EMI_CALCULATOR_FAQS: FaqItem[] = [
  {
    question: 'How is an Equated Monthly Installment (EMI) calculated on a reducing balance basis?',
    answer:
      'An EMI is computed using the standard reducing balance compounding formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1), where P is the loan principal, r is the periodic interest rate (annual rate divided by payments per year and 100), and n is the total number of payment periods. With each installment, interest is assessed only on the remaining unpaid principal balance.',
  },
  {
    question: 'What is the mathematical difference between reducing balance interest and flat rate interest?',
    answer:
      'In a flat rate loan, interest is calculated on the entire initial principal across the entire tenure, meaning interest charges never decrease as you repay the debt. In a reducing balance loan, interest decreases with each installment because it is calculated only on the remaining outstanding debt. A stated 10% flat interest rate is equivalent to an effective reducing rate of roughly 17% to 19%.',
  },
  {
    question: 'How do weekly or biweekly payments accelerate loan payoff?',
    answer:
      'Making biweekly payments (every two weeks) results in 26 half-payments per year, which equals 13 full monthly payments instead of 12. This extra payment goes directly toward reducing the principal balance each year, shortening a 30-year amortization schedule by 4 to 6 years and saving thousands in interest.',
  },
  {
    question: 'Should you choose to reduce loan tenure or reduce scheduled payment when prepaying?',
    answer:
      'Choosing tenure reduction keeps your monthly payment identical but finishes the debt earlier, maximizing cumulative interest savings. Choosing payment reduction lowers your ongoing monthly obligation while keeping the original maturity date, which provides immediate cash flow relief but saves less total interest.',
  },
  {
    question: 'How do upfront origination fees and recurring service fees affect loan cost?',
    answer:
      'Upfront origination fees (typically 0.5% to 2.5% of principal) and recurring monthly loan maintenance charges increase the true Annual Percentage Rate (APR) beyond the nominal interest rate. OmniTools models both fee types in the amortization schedule to provide an exact total cost of credit.',
  },
];

export default function EmiCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: EMI_CALCULATOR_FAQS.map((faq) => ({
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
        Equated Monthly Installment (EMI) Guide: Formulas, Amortization &amp; Repayment Strategies
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        An <strong>Equated Monthly Installment (EMI)</strong> is a fixed payment amount made by a borrower to a lender at a specified calendar date each month. EMIs are designed to amortize both periodic interest and the underlying principal over a set duration, ensuring the loan is completely paid off by maturity.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        The Mathematical EMI Formula (Reducing Balance Method)
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Retail banks and financial institutions calculate installment credit repayments using the standard reducing balance compounding formula:
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
              <td className="p-3 border border-gray-200 dark:border-slate-700">The fixed installment paid until the loan reaches zero balance.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">P</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Principal</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Initial loan amount disbursed by the financing institution.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">r</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Periodic Rate</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Annual interest rate divided by payments per year and 100 (e.g., 9% monthly = 0.09 / 12 = 0.0075).</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">n</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Tenure Periods</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Total number of payments (e.g., a 5-year loan paid monthly has n = 5 &times; 12 = 60 periods).</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Advanced Amortization Mechanics: Frequencies, Fees &amp; Prepayments
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        OmniTools provides institutional-grade loan simulation parameters beyond basic flat calculators:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Flexible Frequencies</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Compare monthly (12/yr), biweekly (26/yr), and weekly (52/yr) payment schedules with beginning-of-period (advance) or end-of-period (arrears) timing.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Dual Prepayment Modes</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Model recurring extra payments or one-time lump-sum prepayments, observing exact interest and tenure saved under tenure reduction versus payment reduction.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Origination &amp; Recurring Fees</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Factor in upfront bank processing fees and recurring monthly administration charges to compute the true effective total cost of borrowing.
          </p>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions
      </h3>
      <div className="space-y-4 mb-6">
        {EMI_CALCULATOR_FAQS.map((faq, index) => (
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
        Explore related personal finance and lending utilities: model property taxes and PMI with the{' '}
        <Link href="/finance/mortgage-calculator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Mortgage &amp; Home Loan Calculator
        </Link>
        , project long-term wealth growth on the{' '}
        <Link href="/finance/compound-interest" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Compound Interest Calculator
        </Link>
        , calculate systematic mutual fund returns with the{' '}
        <Link href="/finance/sip-calculator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          SIP Calculator
        </Link>
        , or generate professional client billing on the{' '}
        <Link href="/finance/invoice-generator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Pro Invoice Generator
        </Link>
        .
      </p>
    </article>
  );
}