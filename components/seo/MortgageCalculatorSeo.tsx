import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const MORTGAGE_CALCULATOR_FAQS: FaqItem[] = [
  {
    question: 'What financial components are included in a standard PITI mortgage payment?',
    answer:
      'PITI stands for Principal, Interest, Taxes, and Insurance. Principal reduces your remaining loan balance, Interest pays the lender for the financing, Taxes cover municipal property tax assessments held in escrow, and Insurance covers hazard homeowners coverage plus Private Mortgage Insurance (PMI) if your down payment was less than 20%. HOA dues are also modeled as part of the recurring housing budget.',
  },
  {
    question: 'When can Private Mortgage Insurance (PMI) be terminated?',
    answer:
      'In conventional residential lending (under the federal Homeowners Protection Act of 1998 in the US), borrowers can formally request PMI cancellation once their principal balance amortizes to 80% of original property value. Servicers are required to terminate PMI automatically once the loan-to-value (LTV) ratio hits 78%, provided the account is current.',
  },
  {
    question: 'What are the main financial trade-offs between 15-year and 30-year fixed mortgages?',
    answer:
      'A 30-year fixed mortgage offers lower monthly payments, maximizing cash-flow flexibility and initial borrowing power. A 15-year mortgage requires roughly 30% to 35% higher monthly payments but typically commands a lower interest rate and saves hundreds of thousands of dollars in cumulative lifetime interest charges.',
  },
  {
    question: 'What are mortgage discount points and how do you calculate the breakeven period?',
    answer:
      'One mortgage point costs 1% of the total loan amount upfront to buy down the interest rate (typically by 0.25%). The breakeven timeline is calculated by dividing the total upfront point cost by the monthly interest savings. If points cost $3,000 and save $50/month, the breakeven period is 60 months (5 years). If you plan to stay past 5 years, buying points saves money.',
  },
  {
    question: 'How does an annual escrow analysis affect your monthly mortgage bill?',
    answer:
      'Lenders collect property taxes and homeowners insurance premiums in an escrow account, disbursing payments directly to taxing authorities and insurers. Because municipal tax assessments and hazard insurance premiums fluctuate annually, lenders adjust your monthly escrow payment upward or downward during annual escrow reconciliation.',
  },
];

export default function MortgageCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: MORTGAGE_CALCULATOR_FAQS.map((faq) => ({
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
        Mortgage &amp; Home Financing Guide: PITI Breakdown, Amortization &amp; Loan Comparison
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Securing a residential mortgage is the largest financial transaction most individuals make in a lifetime. Understanding how principal repayment, periodic interest, property taxes, homeowners insurance, and Private Mortgage Insurance (PMI) interact allows buyers to budget accurately and minimize lifetime borrowing costs.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        The Complete Anatomy of a PITI Mortgage Payment
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        A borrower&apos;s monthly housing expenditure is composed of four distinct financial pillars, plus recurring community assessments:
      </p>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Component</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Destination</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Financial Impact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Principal (P)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Loan Balance</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Builds home equity directly by reducing the unpaid mortgage principal.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Interest (I)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Lender / Servicer</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">The financing fee billed each period based on the outstanding principal balance.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Taxes (T)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Escrow &rarr; Municipality</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Assessed by local county or city taxing districts to fund public services and schools.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Insurance (I)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Escrow &rarr; Insurer</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Hazard homeowners insurance plus Private Mortgage Insurance (PMI) if down payment is under 20%.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">HOA Dues</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Homeowners Association</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Monthly or annual condominium and subdivision maintenance fees.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        PMI Drop-Off Dynamics &amp; Equity Amortization
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        When buyers put down less than 20% equity, lenders require Private Mortgage Insurance (PMI) to offset default risk. OmniTools dynamically evaluates your balance at every single period: once the balance reaches your specified threshold (default 80% Loan-to-Value), the tool removes PMI from future installments in the amortization table, accurately illustrating the drop in monthly payment.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Mortgage Points</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Model upfront discount points against long-term interest reductions to pinpoint your exact breakeven month.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Closing Cost Estimation</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Simulate lender fees, title insurance, appraisal costs, and prepaid escrow to know total cash needed at closing.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Accelerated Payoff</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Test biweekly payment schedules and recurring or lump-sum principal prepayments to eliminate years of interest.
          </p>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions
      </h3>
      <div className="space-y-4 mb-6">
        {MORTGAGE_CALCULATOR_FAQS.map((faq, index) => (
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
        Explore related personal finance and lending utilities: compare auto and personal loans on the{' '}
        <Link href="/finance/emi-calculator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Personal &amp; Auto Loan EMI Calculator
        </Link>
        , project long-term compound wealth with the{' '}
        <Link href="/finance/compound-interest" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Compound Interest Calculator
        </Link>
        , calculate systematic mutual fund returns with the{' '}
        <Link href="/finance/sip-calculator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          SIP Calculator
        </Link>
        , or draft commercial invoices using the{' '}
        <Link href="/finance/invoice-generator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Pro Invoice Generator
        </Link>
        .
      </p>
    </article>
  );
}