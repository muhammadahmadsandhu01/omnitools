import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const EMI_CALCULATOR_FAQS: FaqItem[] = [
  {
    question: 'What is an Equated Monthly Installment (EMI) and how does it work?',
    answer:
      'An Equated Monthly Installment (EMI) is a fixed payment amount made by a borrower to a lender on a set calendar date each month. Each EMI is divided into two parts: an interest charge assessed on the remaining unpaid loan principal, and a principal repayment component that reduces the outstanding debt. Over time, as the principal balance decreases, the monthly interest portion drops and the principal repayment portion expands until the entire balance is repaid at maturity.',
  },
  {
    question: 'What is the standard mathematical formula for calculating EMI?',
    answer:
      'For a standard reducing-balance loan, monthly EMI is computed using the formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1), where P is the principal loan amount, r is the periodic monthly interest rate (annual nominal rate divided by 12 and 100), and n is the total number of monthly installments. If the interest rate is 0%, the formula simplifies to E = P / n.',
  },
  {
    question: 'What is the difference between reducing-balance interest and flat-rate interest?',
    answer:
      'In a reducing-balance loan, interest is calculated solely on the outstanding principal balance remaining at the start of each period, causing interest charges to diminish as the loan is paid down. In a flat-rate loan, interest is calculated on the entire original principal for the entire loan duration, regardless of how much you have already repaid. A stated 10% flat rate is equivalent to an effective reducing rate of approximately 17% to 19% APR.',
  },
  {
    question: 'What happens to the EMI calculation when the interest rate is 0%?',
    answer:
      'When the annual interest rate is 0% (such as in no-interest promotional financing), no interest accrues over the loan term. The EMI calculation mathematically reduces to dividing the total principal by the number of installments: E = P / n. Every dollar paid directly reduces the outstanding principal balance.',
  },
  {
    question: 'How do biweekly or weekly payment schedules accelerate loan payoff?',
    answer:
      'Selecting an accelerated biweekly schedule means making 26 payments per year (each equal to half the monthly payment). Because there are 52 weeks in a calendar year, 26 biweekly payments equal 13 full monthly payments rather than 12. This extra installment goes directly toward principal reduction, shortening a 30-year loan by 4 to 6 years and saving thousands in compound interest.',
  },
  {
    question: 'Should I choose tenure reduction or payment reduction when prepaying?',
    answer:
      'Choosing tenure reduction (term shortening) keeps your regular scheduled payment unchanged but completes the loan payoff earlier, which delivers the highest cumulative interest savings. Choosing payment reduction (recasting) lowers your subsequent monthly payment while maintaining the original maturity date, which provides immediate cash-flow flexibility but results in less total interest saved.',
  },
  {
    question: 'How is the schedule recast after making a one-time lump-sum prepayment?',
    answer:
      'When you make a lump-sum prepayment in payment reduction mode, the one-time amount is deducted immediately from the principal balance. The calculator then recalculates the scheduled payment for the remaining number of periods based on the lower balance and unchanged interest rate, permanently reducing your required monthly obligation.',
  },
  {
    question: 'How do upfront origination fees and recurring service fees affect loan cost?',
    answer:
      'Upfront origination fees (typically 0.5% to 3.0% of the principal) and periodic loan maintenance charges increase the total cash outflow beyond nominal interest charges. Factoring both fee categories into the amortization schedule provides the true effective total cost of credit, reflecting the financial reality of retail borrowing.',
  },
  {
    question: 'Does prepaying a loan trigger penalties or damage your credit score?',
    answer:
      'Many retail mortgages and personal loans permit fee-free prepayments, but certain fixed-rate contracts include prepayment penalty clauses (often a percentage of the outstanding principal or several months of interest). Prepaying a loan may cause a minor, temporary dip in your credit score due to the closure of an active credit account, but eliminating interest-bearing debt improves your debt-to-income (DTI) ratio.',
  },
  {
    question: 'What additional costs are excluded from this standard EMI calculation?',
    answer:
      'This calculator provides pure mathematical amortization schedules based on nominal interest and stated fees. It excludes property taxes, homeowners insurance, private mortgage insurance (PMI), late payment fees, variable rate index fluctuations, and loan settlement closing costs unless specifically modeled.',
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
        An <strong>Equated Monthly Installment (EMI)</strong> is a structured periodic payment made by a borrower to a financial institution on a fixed date each month. EMIs represent the standard mechanism for amortizing personal loans, auto loans, consumer retail credit, and residential mortgages. By balancing principal repayment and accrued interest across each installment, the borrower systematically extinguishes the entire debt obligation by the final maturity date.
      </p>

      {/* Section 1: How the Reducing-Balance EMI Calculation Works */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        1. How the Reducing-Balance EMI Formula Works
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Retail commercial banks and credit unions calculate amortized installment credit using the standard reducing-balance compounding formula:
      </p>

      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 font-mono text-sm sm:text-base mb-6 text-center text-slate-900 dark:text-slate-100">
        E = P &times; r &times; [ (1 + r)^n ] / [ (1 + r)^n &minus; 1 ]
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Variable</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Definition</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Calculation Method &amp; Unit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">E</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">EMI Installment</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">The fixed periodic payment required to retire the loan balance by maturity.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">P</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Principal Amount</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">The original borrowed sum disbursed by the lender before interest or fees.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">r</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Periodic Rate</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Annual nominal rate divided by periods per year and 100 (e.g. 8.5% annual / 12 = 0.0070833).</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">n</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Total Periods</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Total number of scheduled payments (e.g. 5-year loan with monthly payments has n = 60).</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 2: Step-by-Step Worked Numerical Example */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        2. Step-by-Step Worked Numerical Example
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        To demonstrate the exact mathematical execution, consider an installment loan of <strong>$100,000</strong> at an annual nominal interest rate of <strong>8.5%</strong> over a <strong>5-year</strong> repayment tenure (60 monthly installments):
      </p>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 mb-6 text-sm text-slate-700 dark:text-slate-300">
        <div>
          <span className="font-semibold text-slate-900 dark:text-white">Step 1: Convert Annual Rate to Monthly Periodic Rate</span>
          <p className="font-mono text-xs mt-1 text-slate-600 dark:text-slate-400">
            r = 8.5 / 100 / 12 = 0.007083333333333333
          </p>
        </div>
        <div>
          <span className="font-semibold text-slate-900 dark:text-white">Step 2: Calculate Compounding Factor (1 + r)^n</span>
          <p className="font-mono text-xs mt-1 text-slate-600 dark:text-slate-400">
            (1 + 0.007083333333333333)^60 &approx; 1.527318357
          </p>
        </div>
        <div>
          <span className="font-semibold text-slate-900 dark:text-white">Step 3: Compute Numerator and Denominator</span>
          <p className="font-mono text-xs mt-1 text-slate-600 dark:text-slate-400">
            Numerator = $100,000 &times; 0.007083333333333333 &times; 1.527318357 &approx; 1,081.850503
          </p>
          <p className="font-mono text-xs mt-1 text-slate-600 dark:text-slate-400">
            Denominator = 1.527318357 &minus; 1 = 0.527318357
          </p>
        </div>
        <div>
          <span className="font-semibold text-slate-900 dark:text-white">Step 4: Solve for Monthly EMI</span>
          <p className="font-mono text-xs mt-1 text-slate-600 dark:text-slate-400">
            EMI = 1,081.850503 / 0.527318357 = $2,051.65 per month
          </p>
        </div>
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
          <p>
            <strong>Summary:</strong> Total repayment over 60 months equals <strong>$123,099.23</strong>, comprising the <strong>$100,000.00</strong> principal and <strong>$23,099.23</strong> in cumulative interest. In Month 1, interest is $708.33 and principal paid is $1,343.32, leaving a closing balance of $98,656.68.
          </p>
        </div>
      </div>

      {/* Section 3: Reducing Balance vs. Flat Rate Loans */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        3. Reducing Balance vs. Flat Rate: The Borrowing Cost Trap
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Borrowers frequently confuse flat interest rates with reducing-balance interest rates. A flat interest rate calculates finance charges on the entire initial loan principal throughout the full tenure, ignoring that you are steadily repaying the balance.
      </p>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Feature</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Reducing Balance (Standard Retail)</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Flat Rate (Dealer / FinTech Marketing)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Interest Assessment</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Only on current unpaid principal.</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">On full original principal forever.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Interest Trajectory</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Decreases every single month.</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Remains static every single month.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Effective Annual APR</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Matches the stated nominal rate.</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Roughly 1.7&times; to 1.9&times; higher than stated rate.</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700">Prepayment Benefit</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Immediate reduction in subsequent interest.</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Minimal or zero interest relief.</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 4: Tenure vs. Interest Rate Trade-Offs */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        4. Impact of Loan Tenure and Interest Rates on Total Repayment
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Your choice of loan tenure establishes an inverse relationship between monthly budget affordability and total borrowing cost:
      </p>
      <ul className="list-disc list-inside space-y-2 mb-6 text-sm text-slate-600 dark:text-slate-400">
        <li>
          <strong>Shorter Tenures (e.g. 2 to 3 years):</strong> Require higher monthly installments, but substantially curtail the compound interest cycle, keeping total financing costs to a minimum.
        </li>
        <li>
          <strong>Longer Tenures (e.g. 7 to 10 years):</strong> Lower the required monthly obligation, improving short-term cash flow, but result in cumulative interest payments that can exceed 50% of the original principal.
        </li>
      </ul>

      {/* Section 5: Prepayment Optimization Strategies */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        5. Prepayment Optimization: Tenure Reduction vs. Payment Reduction
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        OmniTools enables borrowers to model both recurring extra payments and one-time lump-sum prepayments under two distinct strategies:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Tenure Reduction (Term Shortening)</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Maintains your regular scheduled monthly payment, directing 100% of the prepayment to accelerate principal elimination. This strategy extinguishes the debt months or years ahead of schedule and maximizes total interest savings.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Payment Reduction (Recasting)</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Re-amortizes the remaining balance across the original scheduled tenure. This permanently lowers your ongoing monthly payment, providing immediate recurring cash-flow relief while preserving the original payoff calendar.
          </p>
        </div>
      </div>

      {/* Section 6: Payment Frequency Optimization */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        6. Payment Frequency Optimization: Monthly vs. Accelerated Biweekly
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        While monthly repayment is the consumer standard, switching to biweekly or weekly payments creates structural compounding advantages. Making 26 biweekly payments per year effectively yields 13 full monthly payments annually. That single extra monthly payment goes directly toward principal balance reduction, compounding into significant interest savings over long-term amortization schedules.
      </p>

      {/* Section 7: Origination & Recurring Fee Transparency */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        7. Fee Transparency: Origination Fees and Monthly Service Charges
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        A stated nominal interest rate rarely tells the full economic story of a loan. Upfront bank processing charges (origination fees) and monthly loan administration fees increase the true effective borrowing cost:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Upfront Origination Fees</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Charged by lenders at loan disbursement (often 0.5% to 2.5% of the principal) to cover documentation, underwriting, and administrative processing.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Periodic Recurring Fees</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Monthly account maintenance or servicing charges added to each billing cycle, raising cumulative cash outflow over the loan lifetime.
          </p>
        </div>
      </div>

      {/* Section 8: Budgeting & Debt-to-Income Guidelines */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        8. Practical Budgeting &amp; Debt-to-Income (DTI) Guidelines
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Before committing to an installment loan, evaluate your monthly debt obligation against your gross income. Institutional lenders apply the <strong>Debt-to-Income (DTI) ratio</strong>:
      </p>
      <ul className="list-disc list-inside space-y-1 mb-6 text-sm text-slate-600 dark:text-slate-400">
        <li><strong>Under 36% Total DTI:</strong> Favorable borrowing territory with healthy financial resilience.</li>
        <li><strong>36% to 43% Total DTI:</strong> Manageable, but limits additional borrowing capacity.</li>
        <li><strong>Over 43% Total DTI:</strong> High-risk threshold where institutional loan approvals frequently require co-signers or collateral.</li>
      </ul>

      {/* Section 9: Frequently Asked Questions */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        9. Frequently Asked Questions
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

      {/* Section 10: Related Financial Calculators */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        10. Related Financial Calculators on OmniTools
      </h3>
      <p className="leading-relaxed text-slate-600 dark:text-slate-400 text-sm mb-4">
        Explore related personal finance and lending utilities on OmniTools:
      </p>
      <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <Link href="/finance/mortgage-calculator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
            Mortgage &amp; Home Loan Calculator
          </Link>
          : Model property taxes, private mortgage insurance (PMI), and escrow contributions for residential real estate.
        </li>
        <li>
          <Link href="/finance/compound-interest" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
            Compound Interest Calculator
          </Link>
          : Project long-term investment wealth, APY compounding, and retirement drawdown portfolios.
        </li>
        <li>
          <Link href="/finance/sip-calculator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
            SIP &amp; Mutual Funds Calculator
          </Link>
          : Calculate systematic investment plan wealth growth with disciplined monthly allocations.
        </li>
        <li>
          <Link href="/finance/salary-calculator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
            Salary &amp; Take-Home Pay Calculator
          </Link>
          : Estimate net monthly disposable income across 22 countries to establish your safe debt capacity.
        </li>
        <li>
          <Link href="/finance/invoice-generator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
            Pro Invoice Generator (PDF)
          </Link>
          : Generate clean, print-ready invoices with itemized tax and multi-currency billing directly in your browser.
        </li>
      </ul>

      {/* Financial Disclaimer */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200 text-xs">
        <p className="font-bold mb-1">Financial Advisory Disclaimer</p>
        <p>
          This calculator provides deterministic mathematical projections for planning and educational purposes based on user-supplied parameters. It does not constitute formal financial, lending, or legal advice. Real loan contracts vary by financial institution, regional regulatory requirements, credit rating, day-count conventions, and loan origination policies. Always review the binding disclosure statement provided by your lender.
        </p>
      </div>
    </article>
  );
}