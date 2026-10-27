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
  {
    question: 'How does paying in advance (Annuity Due) differ from paying in arrears (Ordinary Annuity)?',
    answer:
      'Under standard lending (Ordinary Annuity / In Arrears), the first installment is billed at the end of Period 1 after interest has accrued on the initial balance. Under Annuity Due (In Advance, common in equipment leases and auto finance), Payment 1 is deducted immediately at origination before interest accrues. The payment formula becomes E_due = E_ordinary / (1 + r), lowering total interest charges across the loan life.',
  },
  {
    question: 'How does KivaroTools handle decimal loan tenures (such as 2.5 or 3.5 years)?',
    answer:
      'Our engine supports fractional loan durations with exact periodic rounding: n = Math.round(years * periodsPerYear). For instance, a 2.5-year loan with monthly payments models exactly 30 installments, while a 3.5-year loan with biweekly payments models exactly 91 periods. This flexibility enables precise comparisons for bridge loans and short-term retail financing.',
  },
  {
    question: 'Can I share my exact loan and prepayment scenario with a co-borrower or loan officer via URL?',
    answer:
      'Yes. KivaroTools features deep URL serialization (serializeLoanUrl / deserializeLoanUrl) encoding all 11 loan parameters (principal, interest rate, tenure, frequency, payment timing, origination fee, recurring fee, extra payments, prepayment mode, prepayment period, and currency) into a single URL. Clicking "Share Scenario" copies a direct link that reconstructs the identical calculation on any device.',
  },
  {
    question: 'How does the 28/36 debt-to-income rule determine maximum car or personal loan affordability?',
    answer:
      'Under institutional underwriting guidelines, total monthly housing payments should not exceed 28% of gross monthly income (front-end ratio), and total debt obligations including car loans, student debt, and personal loan EMIs should not exceed 36% (back-end ratio). When planning an auto purchase, the 20/4/10 rule recommends putting 20% down, financing for no more than 4 years, and keeping total transportation expenses under 10% of gross income.',
  },
  {
    question: 'Does KivaroTools transmit my loan amounts, interest rates, or financial data to banks or credit bureaus?',
    answer:
      'No. KivaroTools operates with 100% client-side privacy. All reducing-balance calculations, prepayment recasts, amortization tables, and CSV exports occur locally in your browser memory. No loan amounts, credit terms, personal identifiers, or IP addresses are uploaded or shared with commercial lenders.',
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

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Calculate Loan EMI, Total Interest, and Amortization Schedules',
    description:
      'Step-by-step instructions to calculate monthly loan EMI, interest charges, fee modeling, prepayments, and complete amortization schedules using KivaroTools.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Select Currency and Loan Principal',
        text: 'Choose your currency across 42 global options and enter the principal borrowed amount. Formatted numbers with commas or symbols are cleanly supported.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Input Annual Interest Rate and Loan Tenure',
        text: 'Specify the nominal annual interest rate (%) and loan tenure in years (supports decimal tenures like 2.5 years up to 50 years).',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Choose Payment Frequency and Timing',
        text: 'Select Monthly (12/yr), Biweekly (26/yr), or Weekly (52/yr), and choose between End of Period (In Arrears) or Beginning of Period (In Advance).',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Configure Optional Fees and Prepayments',
        text: 'Expand Advanced Options to model upfront origination fees, periodic servicing fees, recurring extra payments, or one-time lump-sum prepayments (tenure reduction vs payment recast).',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Inspect Breakdown and Export Schedule',
        text: 'Review the principal vs. interest breakdown, total economic loan cost, yearly summary, and export your full RFC-4180 amortization CSV.',
      },
    ],
  };

  return (
    <>
      {/* FAQPage & HowTo JSON-LD Structured Data for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-xs">
        <section aria-labelledby="emi-calculator-equated-monthly-installment-em" className="mb-8">
          <h2 id="emi-calculator-equated-monthly-installment-em" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Equated Monthly Installment (EMI) Guide: Formulas, Amortization &amp; Repayment Strategies
          </h2>
          <blockquote className="p-4 my-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg dark:bg-slate-800 not-italic">
            <p className="text-sm text-slate-700 dark:text-slate-300 m-0">
              <strong>Privacy First &amp; Secure:</strong> All processing is done locally in your browser via client-side JavaScript. No loan details, interest rates, or financial parameters are ever uploaded to remote servers.
            </p>
          </blockquote>
          <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
            An <strong>Equated Monthly Installment (EMI)</strong> is a structured periodic payment made by a borrower to a financial institution on a fixed date each month. EMIs represent the standard mechanism for amortizing personal loans, auto loans, consumer retail credit, and residential mortgages. By balancing principal repayment and accrued interest across each installment, the borrower systematically extinguishes the entire debt obligation by the final maturity date.
          </p>
        </section>

        {/* Section 1: How the Reducing-Balance EMI Calculation Works */}
        <section aria-labelledby="emi-calculator-1-how-the-reducing-balance-emi" className="mb-8">
          <h3 id="emi-calculator-1-how-the-reducing-balance-emi" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            1. How the Reducing-Balance EMI Formula Works
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Retail commercial banks and credit unions calculate amortized installment credit using the standard reducing-balance compounding formula:
          </p>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 font-mono text-sm sm:text-base mb-6 text-center text-slate-900 dark:text-slate-100">
            E = P &times; r &times; [ (1 + r)^n ] / [ (1 + r)^n &minus; 1 ]
          </div>

          <div className="w-full overflow-x-auto mb-6 overscroll-x-contain">
            <table className="min-w-[640px] w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
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
        </section>

        {/* Section 2: Step-by-Step Worked Numerical Example */}
        <section aria-labelledby="emi-calculator-2-step-by-step-worked-numerica" className="mb-8">
          <h3 id="emi-calculator-2-step-by-step-worked-numerica" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
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
        </section>

        {/* Section 3: Reducing Balance vs. Flat Rate Loans */}
        <section aria-labelledby="emi-calculator-3-reducing-balance-vs-flat-rat" className="mb-8">
          <h3 id="emi-calculator-3-reducing-balance-vs-flat-rat" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            3. Reducing Balance vs. Flat Rate: The Borrowing Cost Trap
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Borrowers frequently confuse flat interest rates with reducing-balance interest rates. A flat interest rate calculates finance charges on the entire initial loan principal throughout the full tenure, ignoring that you are steadily repaying the balance.
          </p>
          <div className="w-full overflow-x-auto mb-6 overscroll-x-contain">
            <table className="min-w-[640px] w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
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
        </section>

        {/* Section 4: Tenure vs. Interest Rate Trade-Offs */}
        <section aria-labelledby="emi-calculator-4-impact-of-loan-tenure-and-in" className="mb-8">
          <h3 id="emi-calculator-4-impact-of-loan-tenure-and-in" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
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
        </section>

        {/* Section 5: Prepayment Optimization Strategies */}
        <section aria-labelledby="emi-calculator-5-prepayment-optimization-tenu" className="mb-8">
          <h3 id="emi-calculator-5-prepayment-optimization-tenu" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            5. Prepayment Optimization: Tenure Reduction vs. Payment Reduction
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            KivaroTools enables borrowers to model both recurring extra payments and one-time lump-sum prepayments under two distinct strategies:
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
        </section>

        {/* Section 6: Payment Frequency Optimization */}
        <section aria-labelledby="emi-calculator-6-payment-frequency-optimizati" className="mb-8">
          <h3 id="emi-calculator-6-payment-frequency-optimizati" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            6. Payment Frequency Optimization: Monthly vs. Accelerated Biweekly
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            While monthly repayment is the consumer standard, switching to biweekly or weekly payments creates structural compounding advantages. Making 26 biweekly payments per year effectively yields 13 full monthly payments annually. That single extra monthly payment goes directly toward principal balance reduction, compounding into significant interest savings over long-term amortization schedules.
          </p>
        </section>

        {/* Section 7: Origination & Recurring Fee Transparency */}
        <section aria-labelledby="emi-calculator-7-fee-transparency-origination" className="mb-8">
          <h3 id="emi-calculator-7-fee-transparency-origination" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
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
        </section>

        {/* Section 8: Budgeting & Debt-to-Income Guidelines */}
        <section aria-labelledby="emi-calculator-8-practical-budgeting-amp-debt" className="mb-8">
          <h3 id="emi-calculator-8-practical-budgeting-amp-debt" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
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
        </section>

        {/* ZONE 5: DEDICATED PITFALLS, EDGE CASES & VERIFICATION GUIDE */}
        <section aria-labelledby="emi-calculator-financial-pitfalls-and-edge-cases" className="mb-8 pt-6 border-t border-gray-100 dark:border-slate-800">
          <h2 id="emi-calculator-financial-pitfalls-and-edge-cases" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Common Financial Pitfalls, Edge Cases &amp; Verification Guide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
                1. Flat Rate Auto Financing vs Effective Reducing APR (The 1.8x Trap)
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Car dealerships often quote attractive &ldquo;5% flat rate&rdquo; financing. However, because flat interest is calculated continuously against the full starting principal rather than the declining balance, the effective APR is actually over 9.3%. KivaroTools utilizes true reducing-balance mathematics to reveal your genuine cost of credit.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
                2. Tenure Reduction vs Payment Recasting Trade-Offs
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                When applying a lump-sum prepayment, choosing <em>Tenure Reduction</em> keeps your EMI constant while extinguishing the debt months or years ahead of schedule, maximizing total interest saved. Conversely, choosing <em>Payment Recast</em> permanently lowers your monthly payment over the remaining term, optimizing cash-flow safety at the cost of lesser cumulative interest savings.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
                3. Ordinary Annuity (In Arrears) vs Annuity Due (In Advance) Timing
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Most consumer loans are billed in arrears at the end of the period. However, auto leases and commercial equipment loans often mandate payment in advance (Annuity Due). Making the first payment on Day 1 before interest accrues reduces total interest paid across the term via the mathematical divisor <code>E_due = E_ordinary / (1 + r)</code>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
                4. Upfront Origination Drag &amp; Recurring Monthly Servicing Fees
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Lenders frequently advertise low nominal rates while charging a 2% to 5% upfront origination fee or a $15 monthly servicing charge. On small personal loans, a $15 monthly fee acts as a hidden interest rate hike of several percentage points. KivaroTools models both fee types directly in the total economic cost audit.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
                5. Origination Curtailment vs Mid-Loan Lump Sum Prepayments
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Applying a prepayment on Day 1 at loan origination reduces the interest-bearing principal before Period 1 interest accrues. Prepayments made mid-loan must first cover interest accrued during that billing cycle before reducing principal. Our 3-mode prepayment engine supports exact comparison between origination, term reduction, and payment recast modes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
                6. Zero-Interest Fallback (E = P / n) for BNPL &amp; Retail Offers
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Standard annuity formulas crash with division-by-zero errors when the interest rate is 0.00%. KivaroTools integrates a zero-interest linear boundary condition: <code>E = P / n</code>. This guarantees exact, seamless amortization for 0% promotional Buy-Now-Pay-Later (BNPL) schemes and interest-free appliance retail financing.
              </p>
            </div>
          </div>
        </section>

        {/* Feature & Technical Capabilities Matrix */}
        <section aria-labelledby="emi-calculator-technical-capabilities-matrix" className="mb-8">
          <h3 id="emi-calculator-technical-capabilities-matrix" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            KivaroTools EMI Engine: Features &amp; Technical Capabilities Matrix
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            The following technical specification matrix details the computational architecture, inputs, and modeling capabilities implemented in the KivaroTools loan EMI calculator:
          </p>
          <div className="w-full overflow-x-auto mb-6 overscroll-x-contain">
            <table className="min-w-[640px] w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Functional Module</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Supported Input Formats</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Calculation Engine Logic</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Output &amp; Visual Representation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Principal Amount</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Numeric input &amp; slider ($0 to $100M). Cleanly parses formatted text with commas/currency symbols.</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Standard reducing-balance principal. Non-negative validation with zero-principal safe guard.</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">Summary card, progress breakdown, &amp; balance timeline</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Interest Rate</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Nominal annual percentage rate (0% to 100%). Step 0.05%</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Periodic rate = Annual Rate &divide; 100 &divide; Periods/Yr. Safe linear fallback E = P / n for 0% loans.</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">Total Interest Paid card &amp; Interest % breakdown bar</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Tenure (Duration)</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Duration in years (0 to 50 years). Supports decimal durations (e.g. 2.5 yrs).</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Computes exact total periods: n = Math.round(years &times; periodsPerYear).</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">Payoff duration card &amp; Amortization schedule rows</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Payment Frequency</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Monthly (12/yr), Biweekly (26/yr), or Weekly (52/yr)</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Adjusts compounding cycles and payment divisor to reflect chosen payment schedule.</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">Dynamic Hero Payment Label &amp; Outflow summaries</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Payment Timing</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">End of Period (In Arrears) vs. Beginning of Period (In Advance)</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Annuity Due formula E = Ordinary Payment &divide; (1 + r). Payment 1 occurs before interest accrual.</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">&quot;In Advance&quot; badge &amp; reduced lifetime interest charges</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Loan Fees</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">One-time origination fee ($) and periodic recurring fee ($/period)</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Origination fee added to cash cost once. Recurring fees added per payment cycle. Fully reconciled.</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">Total Loan Fees card &amp; Total Cost reconciliation breakdown</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Extra Prepayments</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Recurring extra payment ($) and one-time prepayment with mode and period</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Direct principal reduction. Modes: Term reduction (shorten loan) or Payment re-cast.</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">Accelerated Payoff Savings Banner (Interest, Time &amp; Cost Saved)</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Amortization Export</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Period-by-period schedule or Annual summary view</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Full audit schedule with balance tracking. RFC-4180 CSV export with formula injection defense.</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">Paginated table &amp; instant CSV file download</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Scenario Sharing</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">One-click deep URL scenario sharing</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Encodes all 11 loan parameters into shareable URL query parameters for instant scenario reconstruction.</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">Share Scenario button with auto-copy feedback</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 9: Frequently Asked Questions */}
        <section aria-labelledby="emi-calculator-9-frequently-asked-questions" className="mb-8">
          <h3 id="emi-calculator-9-frequently-asked-questions" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            {EMI_CALCULATOR_FAQS.map((faq, index) => (
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
            ))}
          </div>
        </section>

        {/* Section 10: Related Financial Calculators */}
        <section aria-labelledby="emi-calculator-10-related-financial-calculato" className="mb-8">
          <h3 id="emi-calculator-10-related-financial-calculato" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            Related Financial Calculators on KivaroTools
          </h3>
          <p className="leading-relaxed text-slate-600 dark:text-slate-400 text-sm mb-4">
            Explore related personal finance and lending utilities on KivaroTools:
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
              <Link href="/finance/precious-metals" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Precious Metals Scrap Calculator
              </Link>
              : Calculate live scrap gold, silver, and platinum melt values across 32 world currencies.
            </li>
            <li>
              <Link href="/finance/crypto-converter" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Crypto &amp; Currency Converter
              </Link>
              : Compare live mid-market exchange rates and simulate commercial bank spread fees.
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
        </section>
      </article>
    </>
  );
}