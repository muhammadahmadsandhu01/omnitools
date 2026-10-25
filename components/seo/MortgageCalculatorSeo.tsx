import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const MORTGAGE_CALCULATOR_FAQS: FaqItem[] = [
  {
    question: 'What financial components are included in a standard PITI mortgage payment?',
    answer:
      'PITI stands for Principal, Interest, Taxes, and Insurance. Principal directly reduces your outstanding loan balance, while Interest compensates the mortgage servicer for financing the capital. Taxes cover municipal and county property assessments collected in escrow, and Insurance covers hazard homeowners coverage plus Private Mortgage Insurance (PMI) if your down payment is below 20%. Where applicable, Homeowners Association (HOA) dues are added to calculate your true recurring housing budget.',
  },
  {
    question: 'When can Private Mortgage Insurance (PMI) be terminated under federal law?',
    answer:
      'Under the federal Homeowners Protection Act of 1998 (HPA) in the United States, borrowers with conventional loans have the right to request written PMI cancellation once their principal balance amortizes to 80% of the original property value, provided payments are current and no secondary liens exist. Furthermore, mortgage servicers are legally mandated to automatically cancel PMI once the loan-to-value (LTV) ratio drops to 78% of the original purchase price based on the initial amortization schedule. KivaroTools models this drop-off dynamically at each payment cycle.',
  },
  {
    question: 'What are the main financial trade-offs between 15-year and 30-year fixed mortgages?',
    answer:
      'A 30-year fixed mortgage offers lower monthly payments, maximizing cash-flow flexibility and initial homebuyer purchasing power. In contrast, a 15-year fixed mortgage requires approximately 30% to 38% higher monthly payments, but lenders typically offer lower interest rates (0.50% to 0.75% lower), and the accelerated amortization schedule saves borrowers hundreds of thousands of dollars in cumulative lifetime interest charges.',
  },
  {
    question: 'What are mortgage discount points and how do you calculate the breakeven period?',
    answer:
      'One mortgage discount point costs 1% of your financed loan amount upfront in exchange for a permanent reduction in the nominal interest rate (typically 0.25% per point). The breakeven timeline is calculated by dividing total upfront point costs by monthly payment savings: Breakeven (Months) = Upfront Point Cost / Monthly Interest Savings. If buying one point costs $3,000 and saves $50 each month, the breakeven horizon is 60 months (5 years). If you expect to stay in the home longer than 5 years without refinancing, paying points is financially advantageous.',
  },
  {
    question: 'How does an annual escrow analysis affect your monthly mortgage bill?',
    answer:
      'Lenders collect estimated municipal property taxes and hazard insurance premiums each month, holding these funds in a dedicated escrow impound account. Because county tax assessments and property insurance premiums fluctuate annually, servicers conduct an annual escrow analysis. If disbursements exceeded projections, an escrow shortage occurs, raising your monthly mortgage payment for the subsequent 12 months to cover the deficit and rebuild the regulatory minimum cushion.',
  },
  {
    question: 'How does biweekly mortgage compounding accelerate loan payoff compared to monthly payments?',
    answer:
      'Under a true accelerated biweekly mortgage schedule, you make a half-payment every two weeks across 52 weeks in a calendar year, totaling 26 biweekly installments. Because there are 26 half-payments, you effectively complete 13 full monthly payments each year—one extra full monthly payment applied directly toward principal reduction. On a typical 30-year loan, this biweekly schedule eliminates roughly 4 to 6 years of repayment duration and saves tens of thousands in lifetime interest without requiring formal refinancing.',
  },
  {
    question: 'What is the difference between the Nominal Interest Rate and the Annual Percentage Rate (APR)?',
    answer:
      'The nominal interest rate is the baseline contractual rate used to calculate your scheduled monthly principal and interest payment. The Annual Percentage Rate (APR) represents the comprehensive cost of credit expressed as an annual percentage, incorporating the nominal rate plus mandatory financing charges such as discount points, loan origination fees, processing fees, and prepaid mortgage interest. As a result, the APR is virtually always higher than the nominal note rate.',
  },
  {
    question: 'How do extra principal payments shorten the loan without refinancing?',
    answer:
      'Conventional mortgages calculate interest based on the remaining unpaid principal balance at each billing cycle. Applying extra funds strictly toward principal reduces the outstanding balance faster, which directly decreases the interest accrued during every subsequent payment period. As interest charges decline, a larger portion of your regular monthly payment goes toward principal, creating a compounding acceleration effect that reduces total payoff time and cumulative interest without altering your contractual payment obligations.',
  },
  {
    question: 'Can you obtain a conventional or government mortgage with zero down payment?',
    answer:
      'Yes, specific government-backed loan programs permit 100% financing with zero down payment. Qualified military service members, veterans, and surviving spouses can obtain VA loans with zero down payment and zero monthly PMI. Additionally, USDA loans offer zero-down financing for eligible low-to-moderate-income buyers purchasing homes in designated rural and suburban communities. Conventional loans typically require a minimum down payment of 3% for first-time buyers or 5% for standard programs.',
  },
  {
    question: 'What closing costs should home buyers expect at loan settlement?',
    answer:
      'Homebuyers typically incur upfront closing costs ranging between 2% and 5% of the total purchase price. These settlement charges encompass lender origination fees, credit reports, property appraisal fees, title searches, lender title insurance, settlement agent fees, transfer taxes, government recording fees, and initial escrow impound deposits for prepaid hazard insurance and municipal taxes. KivaroTools allows you to model closing costs either as an exact dollar figure or as a percentage of purchase price (both fields stay bidirectionally synchronized), alongside discount points and itemized lender fees, to compute your precise settlement cash required to close.',
  },
  {
    question: 'How do property tax re-assessments and homeowners insurance rate hikes impact future payments?',
    answer:
      'While your principal and interest payment remains strictly fixed on a fixed-rate loan, your total monthly housing cost is not fixed if property taxes and insurance are escrowed. Municipalities reassess property values periodically, and hazard insurance carriers frequently update replacement cost premiums. An increase in annual taxes or insurance will trigger an escrow recalculation that increases your monthly payment even though your underlying loan terms have not changed.',
  },
  {
    question: 'Are mortgage interest and property taxes tax-deductible?',
    answer:
      'In the United States, eligible homeowners who itemize deductions on Schedule A can deduct mortgage interest on acquisition debt up to $750,000 ($375,000 if married filing separately). State and local taxes (SALT), including municipal property taxes, can also be deducted up to the statutory $10,000 cap ($5,000 if married filing separately). However, if your standard deduction exceeds total itemized deductions, itemizing provides no incremental tax benefit.',
  },
  {
    question: 'How does KivaroTools guarantee principal conservation across 360 monthly or 780 biweekly payment periods?',
    answer:
      'Our financial engine executes an exact Principal Conservation check at the end of every simulation run: Initial Financed Principal minus Total Principal Repaid must reconcile to precisely $0.00. On the final scheduled period, the engine caps the principal component to the remaining unpaid beginning balance, eliminating penny overpayments or trailing cent residuals caused by IEEE-754 floating-point rounding.',
  },
  {
    question: 'How does FHA Mortgage Insurance (MIP) differ from conventional Private Mortgage Insurance (PMI)?',
    answer:
      'Unlike conventional PMI, which automatically terminates under the Homeowners Protection Act once LTV reaches 80% (or 78%), FHA loans require both an upfront mortgage insurance premium (UFMIP, typically 1.75%) and an annual mortgage insurance premium (MIP, typically 0.85%). For borrowers putting down less than 10%, FHA MIP remains for the entire life of the loan and cannot be cancelled without refinancing into a conventional mortgage.',
  },
  {
    question: 'Does KivaroTools transmit my property price, income, or loan parameters to mortgage lenders or brokers?',
    answer:
      'No. KivaroTools operates with a strict zero-lead-capture, zero-tracking policy. All amortization algorithms, PITI escrow math, biweekly conversions, and CSV generation execute 100% locally in your web browser. Neither your purchase price, down payment, interest rate, nor personal financial figures are ever uploaded to any server or shared with mortgage lenders.',
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

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Calculate Monthly Mortgage Payments (PITI) and Amortization Schedules',
    description:
      'Step-by-step instructions to calculate monthly mortgage principal, interest, taxes, insurance (PITI), dynamic PMI drop-off, closing costs, and prepayment savings using KivaroTools.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Select Currency and Quick Preset',
        text: 'Choose your currency from over 160 ISO world currencies and optionally load a realistic preset like Conventional 30-Yr Fixed, 15-Yr Fixed Accelerated, Extra $200/Mo Payoff, or Zero Down 100% Financed.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Enter Purchase Price and Down Payment',
        text: 'Input the agreed home price and configure your down payment using either cash dollars or percentage (kept bidirectionally synchronized).',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Set Interest Rate, Term, and Frequency',
        text: 'Input the nominal annual interest rate (e.g. 6.5%), repayment term between 1 and 100 years, and payment frequency (Monthly or Accelerated Biweekly).',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Add Escrow Expenses and PMI Parameters',
        text: 'Input annual property taxes, hazard homeowners insurance, monthly HOA dues, and your estimated PMI rate with cancellation threshold (default 80% LTV).',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Model Upfront Closing Costs and Lender Fees',
        text: 'Specify closing costs (in dollars or percentage with bidirectional sync), discount points (1% per point), and lender fees to calculate total settlement cash to close.',
      },
      {
        '@type': 'HowToStep',
        position: 6,
        name: 'Simulate Prepayments and Export Schedule',
        text: 'Add extra monthly principal or a lump-sum prepayment, examine interactive SVG Donut and Amortization trajectory charts, and export your complete amortization schedule via RFC-4180 CSV.',
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

      <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-xs">
        <section aria-labelledby="mortgage-calculator-mortgage-amp-home-loan-master-" className="mb-8">
          <h2 id="mortgage-calculator-mortgage-amp-home-loan-master-" className="text-2xl sm:text-3xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Mortgage &amp; Home Loan Master Guide: PITI Breakdown, Amortization &amp; Payoff Strategies
          </h2>
          <blockquote className="p-4 my-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg dark:bg-slate-800 not-italic">
            <p className="text-sm text-slate-700 dark:text-slate-300 m-0">
              <strong>Privacy First &amp; Secure:</strong> All processing is done locally in your browser via client-side JavaScript. No financial inputs, loan parameters, or property valuations are ever uploaded to remote servers.
            </p>
          </blockquote>
          <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
            Securing a residential mortgage is the largest financial transaction most individuals undertake in a lifetime. Accurately projecting your monthly housing expenditure requires understanding how principal repayment, periodic interest, property taxes, homeowners insurance, private mortgage insurance (PMI), and closing fees interact. KivaroTools delivers a deterministic mathematical modeling engine designed to analyze the complete lifecycle of your mortgage with zero ads, zero lead capture, and complete in-browser privacy.
          </p>
        </section>

        {/* STEP-BY-STEP USER GUIDE */}
        <section aria-labelledby="mortgage-calculator-how-to-use-the-kivarotools-mor" className="mb-8">
          <h3 id="mortgage-calculator-how-to-use-the-kivarotools-mor" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            How to Use the KivaroTools Mortgage Calculator: Step-by-Step
          </h3>
          <ol className="list-decimal pl-5 space-y-2 mb-6 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            <li>
              <strong>Choose Currency &amp; Preset:</strong> Select your denomination from over 160 active ISO world currencies (with exact minor unit decimal precision). You can click any of the <em>Quick Scenario Presets</em> (e.g. Conventional 30-Yr Fixed, 15-Yr Fixed Accelerated, Extra $200/Mo Payoff, or Zero Down 100% Financed) to populate realistic parameters instantly, or enter your own custom figures.
            </li>
            <li>
              <strong>Enter Home Purchase Price:</strong> Input the agreed purchase price of the property. Formatted inputs with commas or currency symbols are cleanly parsed.
            </li>
            <li>
              <strong>Configure Down Payment:</strong> Enter either your liquid cash down payment amount or your target down payment percentage. The calculator keeps both fields bidirectionally synchronized.
            </li>
            <li>
              <strong>Set Interest Rate &amp; Loan Term:</strong> Input the lender&apos;s nominal annual interest rate (e.g., 6.5%, supported in steps of 0.001%) and desired repayment horizon (supports any term from 1 to 100 years, up to 2,600 biweekly periods).
            </li>
            <li>
              <strong>Select Payment Frequency:</strong> Choose between standard <em>Monthly</em> (12 payments/year) or <em>Accelerated Biweekly</em> (26 payments/year, where each biweekly payment equals half the monthly payment, creating 13 monthly equivalents per year to accelerate equity buildup).
            </li>
            <li>
              <strong>Expand Optional Escrow &amp; Property Expenses:</strong> Input annual property taxes, hazard homeowners insurance, monthly HOA dues, and your estimated PMI rate with custom cancellation threshold (default 80% LTV).
            </li>
            <li>
              <strong>Model Upfront Closing Costs &amp; Fees:</strong> In the advanced panel, enter either your total closing costs dollar amount ($) or percentage (%) with bidirectional synchronization, mortgage discount points (1% per point), and itemized lender fees to simulate your exact cash required on closing day.
            </li>
            <li>
              <strong>Simulate Principal Prepayments:</strong> Add a recurring extra monthly or biweekly principal payment, or model a one-time lump-sum prepayment (applied either at loan origination or at any designated future payment period) to instantly compute the interest saved, avoided PMI charges, and shortened payoff horizon.
            </li>
            <li>
              <strong>Inspect Results &amp; Export Schedule:</strong> Review your itemized monthly cost cards, loan-to-value ratio, lifetime interest total, interactive visual breakdown charts (SVG donut and balance progression curve), and complete month-by-month or year-by-year amortization schedule with one-click RFC-4180 CSV export (with formula injection defense) or clipboard summary copy.
            </li>
          </ol>
        </section>

        {/* CORE FORMULA & MATHEMATICAL DEFINITION */}
        <section aria-labelledby="mortgage-calculator-the-core-mortgage-amortization" className="mb-8">
          <h3 id="mortgage-calculator-the-core-mortgage-amortization" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            The Core Mortgage Amortization Formula Explained
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            For a conventional fully amortizing fixed-rate loan with positive principal, periodic compounding, and constant nominal annual interest rate, scheduled periodic principal and interest payment <code className="font-mono font-semibold">M</code> is governed by the standard annuity formula:
          </p>

          <div className="bg-slate-50 dark:bg-slate-900/80 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 mb-6 font-mono text-sm text-center overflow-x-auto text-blue-700 dark:text-blue-300">
            M = P &times; [ r(1 + r)^n ] / [ (1 + r)^n &minus; 1 ]
          </div>

          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400 text-sm">
            Where the variables are strictly defined as:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 mb-6 text-sm text-slate-600 dark:text-slate-400">
            <li><strong>M:</strong> Scheduled periodic principal-and-interest payment amount.</li>
            <li><strong>P:</strong> Net financed loan principal borrowed (Home Purchase Price minus Down Payment).</li>
            <li><strong>r:</strong> Periodic interest rate, equal to the nominal annual interest rate divided by the number of payment periods per year (Annual Rate &divide; 100 &divide; 12 for monthly, or &divide; 26 for biweekly).</li>
            <li><strong>n:</strong> Total number of scheduled amortization payment periods (Loan Term in Years &times; Periods per Year).</li>
            <li><strong>Zero-Interest Case (r = 0%):</strong> When the interest rate is exactly zero, the payment formula safely collapses to exact linear repayment: <code className="font-mono">M = P / n</code>, avoiding floating-point division-by-zero errors.</li>
          </ul>
        </section>

        {/* TWO WORKED EXAMPLES */}
        <section aria-labelledby="mortgage-calculator-independently-verified-worked-" className="mb-8">
          <h3 id="mortgage-calculator-independently-verified-worked-" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            Independently Verified Worked Calculations
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            To verify mathematical transparency, consider these two real-world reference cases calculated with exact precision by the KivaroTools engine:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            {/* Example 1 */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/60 dark:bg-slate-800/40">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-2">
                Example 1: Conventional 30-Year Fixed (20% Down)
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-3 font-mono">
                <li>Home Purchase Price: $400,000.00</li>
                <li>Down Payment: 20.00% ($80,000.00)</li>
                <li>Financed Principal (P): $320,000.00</li>
                <li>Nominal Annual Rate: 6.50% (r = 0.065 / 12)</li>
                <li>Term: 30 Years (n = 360 monthly payments)</li>
                <li>Annual Taxes: $4,800.00 ($400.00/mo)</li>
                <li>Annual Insurance: $1,440.00 ($120.00/mo)</li>
                <li>PMI: $0.00 (Down payment &ge; 20%)</li>
              </ul>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                <p><strong>Monthly P&amp;I:</strong> $2,022.62</p>
                <p><strong>Monthly Escrow:</strong> $520.00 ($400 tax + $120 ins)</p>
                <p><strong>Total Monthly Housing Cost:</strong> $2,542.62</p>
                <p><strong>Lifetime Interest:</strong> $408,140.64</p>
                <p><strong>Total Scheduled Outflow:</strong> $728,140.64</p>
              </div>
            </div>

            {/* Example 2 */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/60 dark:bg-slate-800/40">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-2">
                Example 2: Low-Down 30-Year Loan (5% Down + Prepayment)
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-3 font-mono">
                <li>Home Purchase Price: $300,000.00</li>
                <li>Down Payment: 5.00% ($15,000.00)</li>
                <li>Financed Principal (P): $285,000.00 (95% LTV)</li>
                <li>Nominal Annual Rate: 6.75%</li>
                <li>Term: 30 Years (360 payments)</li>
                <li>Annual PMI Rate: 0.75% on balance</li>
                <li>PMI Threshold: 80% LTV ($240,000.00 balance)</li>
                <li>Extra Principal Prepayment: $200.00/month</li>
              </ul>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                <p><strong>Base Monthly P&amp;I:</strong> $1,848.50</p>
                <p><strong>Initial Monthly PMI:</strong> $178.13</p>
                <p><strong>Total Initial Payment:</strong> $2,026.63 ($1,848.50 P&amp;I + $178.13 PMI)</p>
                <p><strong>PMI Cancellation:</strong> Month 82 (Year 7) at $239,376 balance (&le; 80% LTV)</p>
                <p><strong>Payoff Duration:</strong> 273 Months (~22.8 Years, saved 7.3 years)</p>
                <p><strong>Lifetime Interest Saved:</strong> $108,187.79</p>
                <p><strong>Avoided PMI Premiums:</strong> $7,672.64</p>
              </div>
            </div>
          </div>
        </section>

        {/* COMPLETE PITI TABLE */}
        <section aria-labelledby="mortgage-calculator-the-anatomy-of-a-piti-mortgage" className="mb-8">
          <h3 id="mortgage-calculator-the-anatomy-of-a-piti-mortgage" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            The Anatomy of a PITI Mortgage Payment
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Your monthly mortgage check is rarely paid solely to the loan principal. In conventional residential lending, payments are apportioned across four financial pillars plus recurring community assessments:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Component</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Destination</th>
                  <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Financial Function &amp; Dynamics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Principal (P)</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Loan Balance</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Reduces the remaining unpaid mortgage balance, building borrower home equity. Increases every month throughout the amortization schedule.</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Interest (I)</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Lender / Servicer</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">The financing fee billed each period based strictly on the outstanding balance. Decreases each period as the principal amortizes.</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Property Taxes (T)</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Escrow &rarr; Municipality</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Assessed by local county or city taxing districts to fund public services and schools. Disbursed semi-annually or annually from escrow.</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">Home Insurance (I)</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Escrow &rarr; Hazard Insurer</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Hazard homeowners coverage protecting against structure loss, plus Private Mortgage Insurance (PMI) if equity is below 20%.</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">HOA Dues</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Community Association</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Monthly or annual condominium, townhouse, or subdivision master association maintenance dues for common facilities.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FEATURE & TECHNICAL CAPABILITIES MATRIX */}
        <section aria-labelledby="mortgage-calculator-technical-capabilities-matrix" className="mb-8">
          <h3 id="mortgage-calculator-technical-capabilities-matrix" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            KivaroTools Mortgage Engine: Features &amp; Technical Capabilities Matrix
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            The following technical specification matrix outlines the computational architecture, inputs, and modeling capabilities implemented in the KivaroTools mortgage calculator:
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
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
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Down Payment</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Bidirectional Currency Amount ($) or Percentage (%)</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Automatically syncs both fields. Calculates Net Financed Principal: P = Home Price &minus; Down Payment.</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">Loan-to-Value (LTV) metric card &amp; Cash to Close chart segment</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Closing Costs</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Bidirectional Dollar Amount ($) or Percentage (%)</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Syncs settlement cost in dollars or as percentage of purchase price. Included in total upfront Cash to Close.</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">Closing Costs card &amp; Settlement breakdown ring chart</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Discount Points &amp; Fees</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Discount points (%) and upfront lender fees ($)</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Each point computes as 1.0% of financed loan principal. Fees added linearly to cash required at settlement.</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">Itemized Cash to Close summary table</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Payment Frequency</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Monthly (12/yr) or Accelerated Biweekly (26/yr)</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Biweekly divides standard monthly payment by 2. 26 payments/yr create 13 full payments, accelerating equity buildup.</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">Adjusts payment period labels &amp; amortization row cycles</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Escrow (Taxes &amp; Ins)</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Annual property taxes ($) and annual insurance ($)</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Divided into 12 level monthly installments and added to principal and interest for true PITI housing budget.</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">Monthly Cost card and interactive Donut chart segments</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Dynamic PMI Drop-off</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Annual PMI rate (%) and LTV threshold (default 80%)</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Evaluates current loan balance at each payment period. Automatically sets PMI to $0 when LTV &le; threshold.</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">PMI column in schedule drops to $0.00 at exact milestone</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Principal Prepayments</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Recurring extra principal ($/mo) and lump-sum prepayment ($)</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Applies extra directly to principal reduction. Dynamically recalculates interest savings and early payoff horizon.</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">Payoff Years, Interest Saved &amp; Amortization curve shift</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Amortization Export</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Annual summary view or Periodic detail view</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Full month-by-month and year-by-year schedule. RFC-4180 CSV export with formula injection defense (apostrophe prefix).</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">Paginated data table &amp; instant CSV file download</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap text-slate-900 dark:text-slate-100">Global Currencies</th>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Over 160 active ISO-4217 world currencies</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700">Strict minor unit rounding (0, 2, or 3 decimals) prevents IEEE-754 floating-point rounding errors across all world currencies.</td>
                  <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono text-xs">Formatted symbols ($ USD, &euro; EUR, &pound; GBP, &yen; JPY, etc.)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* PMI DYNAMICS */}
        <section aria-labelledby="mortgage-calculator-private-mortgage-insurance-pmi" className="mb-8">
          <h3 id="mortgage-calculator-private-mortgage-insurance-pmi" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            Private Mortgage Insurance (PMI) Cancellation Dynamics
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            When buyers put down less than 20% equity, lenders require Private Mortgage Insurance (PMI) to offset credit default risk. KivaroTools dynamically evaluates your balance at every single payment period. Once the outstanding debt drops to or below your configured cancellation threshold (default 80% Loan-to-Value), the tool removes PMI from subsequent periods in the amortization table, accurately illustrating the drop in your monthly payment.
          </p>
        </section>

        {/* 15-YR VS 30-YR COMPARISON */}
        <section aria-labelledby="mortgage-calculator-15-year-vs-30-year-fixed-mortg" className="mb-8">
          <h3 id="mortgage-calculator-15-year-vs-30-year-fixed-mortg" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            15-Year vs. 30-Year Fixed Mortgages: Financial Trade-offs
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Choosing between a 15-year and a 30-year fixed loan represents a trade-off between monthly cash-flow flexibility and cumulative lifetime wealth accumulation:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-6 text-sm text-slate-600 dark:text-slate-400">
            <li>
              <strong>30-Year Fixed Loan:</strong> Best for buyers seeking maximum purchasing power and predictable low monthly payments. You can always make voluntary extra principal prepayments to accelerate payoff while maintaining the flexibility to fall back to the lower scheduled payment during periods of financial stress.
            </li>
            <li>
              <strong>15-Year Fixed Loan:</strong> Best for high-earning buyers or refinancers who can comfortably manage payments 30% to 38% higher. In exchange, lenders typically discount the interest rate by 0.50% to 0.75%, and the loan amortizes in half the time, saving tens or hundreds of thousands of dollars in lifetime interest charges.
            </li>
          </ul>
        </section>

        {/* ZONE 5: DEDICATED PITFALLS, EDGE CASES & VERIFICATION GUIDE */}
        <section aria-labelledby="mortgage-calculator-financial-pitfalls-and-edge-cases" className="mb-8 pt-6 border-t border-gray-100 dark:border-slate-800">
          <h2 id="mortgage-calculator-financial-pitfalls-and-edge-cases" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Common Financial Pitfalls, Edge Cases &amp; Verification Guide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
                1. Accelerated Biweekly (Monthly/2) vs Standard Biweekly Math
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Many online calculators divide the annual 12-month total by 26 (i.e., Monthly &times; 12 / 26), which yields zero prepayment acceleration. KivaroTools implements genuine <em>Accelerated Biweekly</em> amortization (Monthly &divide; 2). Because there are 26 biweekly periods per year, you submit 13 full monthly payments annually, shaving 4 to 6 years off a 30-year loan without refinancing fees.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
                2. Homeowners Protection Act of 1998: 80% Request vs 78% Mandate
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Under the federal HPA, borrowers with conventional mortgages have the statutory right to request written PMI cancellation once the loan balance reaches 80% LTV of the original purchase price. Servicers are legally required to automatically drop PMI at 78% LTV. KivaroTools tracks the exact month your loan crosses these milestones and sets PMI to $0.00.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
                3. Conflating Down Payment with Total Cash to Close
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                First-time homebuyers frequently overlook closing charges. Your cash required on settlement day equals <code>Down Payment + Closing Costs + Discount Points + Lender Fees + Origination Prepayments</code>. KivaroTools features synchronized dollar and percentage inputs, allowing you to audit your official TRID Closing Disclosure before arriving at the title company.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
                4. Origination Curtailment vs Mid-Loan Lump-Sum Prepayments
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Applying a prepayment on Day 1 at loan origination immediately reduces the interest-bearing principal before Period 1 accrues. Our engine allows you to toggle between an origination curtailment and a specific period lump-sum prepayment, modeling the exact interest savings and accelerated PMI drop-off date.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
                5. Property Tax Reassessment &amp; Escrow Shortage Spikes
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Fixed-rate mortgages guarantee that Principal and Interest remain constant. However, municipal tax boards reassess newly purchased homes to reflect higher transaction prices, causing annual escrow shortages. Our non-amortizing escrow pass-through modeling separates pure debt service from municipal assessments.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
                6. RFC-4180 CSV Amortization Export &amp; Formula Injection Defense
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Exporting your 360-month or 780-biweekly schedule to Microsoft Excel or Google Sheets is protected against CSV Spreadsheet Formula Injection (CWE-1236). KivaroTools sanitizes all cell entries starting with &ldquo;=&rdquo;, &ldquo;+&rdquo;, &ldquo;-&rdquo;, or &ldquo;@&rdquo; by prepending a single quote, ensuring enterprise-grade data security.
              </p>
            </div>
          </div>
        </section>

        {/* FAQS SECTION */}
        <section aria-labelledby="mortgage-calculator-frequently-asked-questions" className="mb-8">
          <h3 id="mortgage-calculator-frequently-asked-questions" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            {MORTGAGE_CALCULATOR_FAQS.map((faq, index) => (
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

          {/* FINANCIAL DISCLAIMER */}
          <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 mb-6 text-xs text-amber-900 dark:text-amber-200 leading-relaxed mt-6">
            <strong>Important Financial &amp; Legal Disclaimer:</strong> The calculations, estimates, and amortization schedules generated by this tool are provided solely for informational and educational purposes. KivaroTools is not a mortgage lender, loan originator, or licensed financial advisor. Results do not constitute an official Loan Estimate or Closing Disclosure under the federal Truth in Lending Act (TILA) / Real Estate Settlement Procedures Act (RESPA) integrated disclosures (TRID). Actual mortgage rates, escrow requirements, private mortgage insurance premiums, and closing fees depend on individual credit profiles, property characteristics, and official lender underwriting guidelines.
          </div>
        </section>

        {/* RELATED FINANCIAL CALCULATORS */}
        <section aria-labelledby="mortgage-calculator-related-financial-calculators-" className="mb-8">
          <h3 id="mortgage-calculator-related-financial-calculators-" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
            Related Financial Calculators &amp; Utilities
          </h3>
          <p className="leading-relaxed text-slate-600 dark:text-slate-400 text-sm">
            Explore related personal finance and lending tools on KivaroTools: calculate personal and auto loan installments on the{' '}
            <Link href="/finance/emi-calculator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
              Personal &amp; Auto Loan EMI Calculator
            </Link>
            , project long-term compound investment wealth with the{' '}
            <Link href="/finance/compound-interest" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
              Compound Interest Calculator
            </Link>
            , calculate systematic mutual fund returns with the{' '}
            <Link href="/finance/sip-calculator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
              SIP Calculator
            </Link>
            , track spot gold and bullion scrap with the{' '}
            <Link href="/finance/precious-metals" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
              Precious Metals Calculator
            </Link>
            , convert international currencies with the{' '}
            <Link href="/finance/crypto-converter" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
              Currency &amp; Crypto Converter
            </Link>
            , or generate professional PDF invoices using the{' '}
            <Link href="/finance/invoice-generator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
              Pro Invoice Generator
            </Link>
            .
          </p>
        </section>
      </article>
    </>
  );
}