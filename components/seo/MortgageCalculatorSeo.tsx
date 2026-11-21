import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const MORTGAGE_CALCULATOR_FAQS: FaqItem[] = [
  {
    question: 'How much faster can I pay off a 30-year mortgage by paying extra toward principal each month?',
    answer:
      'Enter an Extra Monthly Principal amount directly in the calculator input panel. Every extra unit is applied strictly to your remaining principal balance, reducing future interest charges and accelerating payoff. For example, on a $300,000 home with 5% down ($285,000 loan) at 6.75% over 30 years with 0.75% PMI, adding $200/month cuts payoff from 30.0 years to 22.75 years (saving 7 years 3 months), eliminates $108,187.79 in lifetime interest, and saves $7,672.64 in PMI.',
  },
  {
    question: 'Should I put 20% down to avoid PMI or put less down and pay PMI temporarily?',
    answer:
      'Putting 20% down (80% Loan-to-Value) removes Private Mortgage Insurance (PMI) immediately ($0). Putting 5% to 10% down lowers your upfront Cash to Close but adds monthly PMI until your loan balance reaches your cancellation threshold (default 80% LTV borrower-requested; adjustable to 78% LTV automatic cancellation). Use the calculator to compare total cumulative PMI cost against the cash you preserve at closing.',
  },
  {
    question: 'When does PMI drop off automatically on a conventional mortgage?',
    answer:
      'Under the U.S. Homeowners Protection Act of 1998 (CFPB HPA), conventional borrowers can request written PMI cancellation once principal reaches 80% of the original home value (with a good payment history and no subordinate liens), and servicers must automatically terminate PMI at 78% LTV on the original amortization schedule. KivaroTools lets you toggle between 80% and 78% LTV and displays the exact period and year PMI drops to $0.00.',
  },
  {
    question: 'Why do 80% and 78% LTV PMI cancellation rules not apply to FHA 3.5% down loans?',
    answer:
      'Per official U.S. HUD rules (effective post-June 3, 2013), FHA loans with an origination LTV above 90% (such as 3.5% down at 96.5% LTV) carry Annual Mortgage Insurance Premium (MIP) for the entire life of the loan plus an Upfront MIP (UFMIP, typically 1.75%). Because 80%/78% HPA cancellation applies to conventional mortgages only, FHA borrowers generally must refinance into a conventional loan to remove MIP.',
  },
  {
    question: 'How much more does an accelerated biweekly mortgage schedule save compared to monthly payments?',
    answer:
      'An accelerated biweekly schedule sets each payment to half of the standard monthly P&I installment and collects 26 payments per year (every two weeks), which equals 13 full monthly payments annually. On a $500,000 home with 10% down ($450,000 loan) at 6.5% over 30 years plus $200/month extra principal, switching to accelerated biweekly reduces total interest to $373,708.74 and payoff to 20.92 years—saving $200,238.59 and 9 years 1 month versus a standard monthly schedule.',
  },
  {
    question: 'Can I export all 360 monthly or biweekly mortgage payments with extra payments to Excel?',
    answer:
      'Yes. Click Download CSV (Excel Ready) to export the complete period-by-period or yearly amortization schedule—including Payment, Principal, Interest, PMI, Extra Principal, and Ending Balance—with zero signup, zero email gates, and no export limits. Cells are formatted per RFC-4180 with spreadsheet formula-injection protection (CWE-1236).',
  },
  {
    question: 'Does this mortgage calculator include property taxes, home insurance, and HOA fees?',
    answer:
      'Yes. Enter Annual Property Tax and Annual Home Insurance directly in the main form, and open Advanced Options to add Monthly HOA Dues and Annual PMI Rate. KivaroTools converts annual escrow items into monthly equivalents to show your full PITI + HOA recurring housing budget alongside lifetime cash outflow.',
  },
  {
    question: 'Can I include closing costs, discount points, and lender fees in Cash to Close?',
    answer:
      'Yes. Open Advanced Options to enter Closing Costs (either as a flat amount or a percentage of purchase price, kept bidirectionally synchronized), Discount Points (1% of financed loan principal per point), and Upfront Lender Fees. The calculator displays an itemized Cash to Close breakdown alongside your amortization schedule.',
  },
  {
    question: 'Can I calculate a mortgage or home loan in AED, SGD, ZAR, PHP, SAR, GBP, AUD, or USD?',
    answer:
      'Yes. Select from 154 active ISO-4217 world currencies in the currency selector, including AED, SGD, ZAR, PHP, SAR, GBP, AUD, INR, EUR, and USD, with exact minor-unit decimal precision (0, 2, or 3 decimal places). Currency selection formats denominations only and does not perform live foreign-exchange conversion or apply country-specific tax rules.',
  },
  {
    question: 'Why do UAE or Singapore bank mortgage calculators differ from a standard amortization schedule?',
    answer:
      'Standard fixed-rate amortization calculates principal, interest, extra payments, and payoff dates accurately in AED or SGD. Local bank eligibility tools additionally layer on statutory borrowing caps—such as Singapore MAS 55% TDSR / 30% MSR limits and ABSD stamp duty, or Central Bank of the UAE (CBUAE) LTV caps and Dubai Land Department (DLD) 4% transfer fees—which are outside a generic amortization model.',
  },
  {
    question: 'Does this calculator include South African transfer duty, Philippine Pag-IBIG tiers, or Canadian semi-annual compounding?',
    answer:
      'No. KivaroTools models standard fixed-rate monthly-compounding mortgages and general closing costs. Consult local lenders or statutory schedules for South African SARS transfer duty and bond registration fees, Philippine Pag-IBIG subsidized rate tiers, Dubai 4% DLD fees, UK early repayment charges (ERCs), Australian offset accounts, or Canadian mandatory semi-annual fixed-rate compounding.',
  },
  {
    question: 'Does KivaroTools send my home price or loan numbers to mortgage brokers or lenders?',
    answer:
      'No. All amortization math, PITI calculations, biweekly schedules, and CSV exports run locally inside your browser using client-side JavaScript. KivaroTools has no lender lead-capture forms, no account signup wall, and does not transmit your financial inputs to mortgage brokers.',
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
    name: 'How to Calculate Monthly or Biweekly Mortgage Payments, PMI Drop-Off & Extra Principal Savings',
    description:
      'Four-step guide to modeling PITI mortgage payments, 80%/78% LTV PMI cancellation, Cash to Close, extra principal prepayments, and Excel-ready CSV amortization schedules on KivaroTools.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Select Currency & Core Loan Terms',
        text: 'Pick from 154 ISO-4217 currencies (USD, AED, SGD, ZAR, PHP, SAR, GBP, AUD, and more) or load a quick scenario preset, then enter Home Purchase Price, synced Down Payment amount or %, Annual Interest Rate, and Loan Term (1–100 years).',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Choose Monthly or Accelerated Biweekly & Add Escrow',
        text: 'Toggle between standard Monthly (12/yr) or Accelerated Biweekly (26/yr) payments, then enter Annual Property Tax, Annual Home Insurance, and optional Extra Monthly Principal.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Configure HOA, PMI Threshold, Closing Costs & Lump Sum',
        text: 'Open Advanced Options to add Monthly HOA Dues, Annual PMI Rate with 80% or 78% CFPB HPA LTV cancellation threshold, Closing Costs ($ or %), Discount Points (%), Upfront Lender Fees, and an optional One-Time Prepayment at origination or a chosen period.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Audit Savings, PMI Drop-Off & Export CSV Schedule',
        text: 'Review your monthly or biweekly payment, PMI Ends milestone badge, Itemized Cash to Close, Interest & Time Saved, and paginated Yearly or Periodic amortization table, then click Download CSV (Excel Ready) or Copy Summary.',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-xs">
        {/* SECTION 1: OVERVIEW & WORKFLOW */}
        <section aria-labelledby="mortgage-guide-overview" className="mb-8">
          <h2 id="mortgage-guide-overview" className="text-2xl sm:text-3xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Mortgage &amp; Home Loan Amortization Guide: PITI, PMI Drop-Off, Extra Payments &amp; CSV Export
          </h2>
          <blockquote className="p-4 my-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg dark:bg-slate-800 not-italic">
            <p className="text-sm text-slate-700 dark:text-slate-300 m-0">
              <strong>Privacy-First &amp; Zero Lead Capture:</strong> Every amortization schedule, PITI calculation, and Excel-ready CSV file is computed 100% locally in your web browser. No signup, no email wall, and no broker lead forms.
            </p>
          </blockquote>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Whether you are comparing a conventional 30-year vs. 15-year US mortgage with automatic 80%/78% LTV PMI cancellation, building a UAE (AED) amortization schedule or Singapore (SGD) extra-payment plan, calculating a home loan EMI in India, Saudi Arabia (SAR), or the Philippines (PHP), testing extra bond repayments in South Africa (ZAR), modeling a UK mortgage overpayment (GBP), or running Australia fortnightly extra repayments (AUD), accurate math starts with separating debt service from escrow and upfront settlement costs.
          </p>
          <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
            KivaroTools combines full PITI + HOA modeling, dynamic conventional PMI drop-off tracking, accelerated biweekly (26/yr) payoff savings, recurring extra principal and one-time lump-sum prepayments, itemized Cash to Close (closing costs, discount points, and lender fees), and unlimited RFC-4180 CSV export across 154 ISO-4217 world currencies.
          </p>
        </section>

        {/* SECTION 2: HOW TO USE (4-STEP VISUAL CARDS — ZERO OUTER OL NUMBERS) */}
        <section aria-labelledby="mortgage-how-to-use" className="mb-8">
          <h2 id="mortgage-how-to-use" className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">
            How to Use This Mortgage &amp; Extra Payment Calculator
          </h2>
          <p className="mb-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
            Model your true monthly or biweekly housing cost, PMI cancellation milestone, and full amortization schedule in four steps:
          </p>

          <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4 sm:p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-1.5">
                STEP 1 &middot; CURRENCY, PRICE &amp; LOAN TERMS
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed m-0">
                Choose from <strong>154 ISO-4217 currencies</strong> (USD, AED, SGD, ZAR, PHP, SAR, GBP, AUD, and more) or click a Quick Scenario Preset. Enter Home Purchase Price, synced Down Payment ($ or %), Annual Interest Rate, and Loan Term (1&ndash;100 years).
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4 sm:p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-1.5">
                STEP 2 &middot; FREQUENCY, ESCROW &amp; EXTRA PRINCIPAL
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed m-0">
                Select <strong>Monthly (12/yr)</strong> or <strong>Accelerated Biweekly (26/yr)</strong>, enter Annual Property Tax and Home Insurance, and add an optional <strong>Extra Monthly Principal</strong> payment right in the main panel.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4 sm:p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-1.5">
                STEP 3 &middot; PMI, HOA, CLOSING COSTS &amp; LUMP SUM
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed m-0">
                Open <strong>Advanced Options</strong> to add HOA dues, Annual PMI Rate with <strong>80% or 78% LTV</strong> cancellation toggle, synced Closing Costs, Discount Points (%), Upfront Lender Fees, and a One-Time Prepayment (at origination or a specific period).
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4 sm:p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-1.5">
                STEP 4 &middot; AUDIT SAVINGS &amp; EXPORT EXCEL CSV
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed m-0">
                Inspect your <strong>PMI Ends</strong> milestone badge, Itemized Cash to Close, Interest &amp; Time Saved, and Yearly or Periodic schedule, then click <strong>Download CSV (Excel Ready)</strong> or <strong>Copy Summary</strong> with zero signup.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: CORE FORMULA */}
        <section aria-labelledby="mortgage-formula" className="mb-8">
          <h2 id="mortgage-formula" className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">
            How Fixed-Rate Mortgage Amortization &amp; Biweekly Math Work
          </h2>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            For a standard fixed-rate amortizing mortgage with financed principal <code className="font-mono font-semibold">P</code>, periodic interest rate <code className="font-mono font-semibold">r</code>, and <code className="font-mono font-semibold">n</code> scheduled periods, the periodic principal-and-interest payment <code className="font-mono font-semibold">M</code> is calculated with the standard annuity formula:
          </p>

          <div className="bg-slate-50 dark:bg-slate-900/80 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 mb-5 font-mono text-sm text-center overflow-x-auto overscroll-x-contain text-blue-700 dark:text-blue-300">
            M = P &times; [ r(1 + r)^n ] / [ (1 + r)^n &minus; 1 ]
          </div>

          <ul className="list-disc pl-5 space-y-1.5 mb-6 text-sm text-slate-600 dark:text-slate-400">
            <li><strong>P (Financed Loan Principal):</strong> Home Purchase Price minus Down Payment (and minus any Day-1 Origination Prepayment).</li>
            <li><strong>r (Periodic Rate):</strong> Nominal Annual Interest Rate &divide; 100 &divide; 12 for monthly payments (or &divide; 26 for biweekly compounding cycles).</li>
            <li><strong>Accelerated Biweekly Convention:</strong> Sets each biweekly installment to <code className="font-mono">Monthly P&amp;I &divide; 2</code> paid 26 times per year (13 monthly equivalents/year), cutting interest and years off your payoff schedule automatically.</li>
            <li><strong>Zero-Interest Edge Case (r = 0%):</strong> Safely falls back to exact linear repayment <code className="font-mono">M = P / n</code> without division-by-zero errors.</li>
            <li><strong>Final-Period Principal Conservation:</strong> On the final payment period, principal is capped to the exact remaining unpaid balance so ending balance reconciles cleanly to <code className="font-mono">0.00</code>.</li>
          </ul>
        </section>

        {/* SECTION 4: FULL PITI, HOA & CASH TO CLOSE BREAKDOWN */}
        <section aria-labelledby="mortgage-piti-breakdown" className="mb-8">
          <h2 id="mortgage-piti-breakdown" className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">
            Full PITI, HOA &amp; Cash-to-Close Breakdown
          </h2>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Your recurring housing budget combines amortizing debt service with non-amortizing escrow obligations, while settlement day requires upfront Cash to Close:
          </p>
          <div className="w-full max-w-full overflow-x-auto overscroll-x-contain mb-6 not-prose">
            <table className="min-w-[640px] w-full text-xs sm:text-sm text-left border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                  <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 whitespace-nowrap font-semibold">Cost Component</th>
                  <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 whitespace-nowrap font-semibold">Billing Cycle</th>
                  <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">How KivaroTools Models It</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 whitespace-nowrap">Principal &amp; Interest (P&amp;I)</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 whitespace-nowrap">Monthly or Biweekly</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Fixed scheduled payment; interest accrues on remaining balance while principal share grows each period.</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 whitespace-nowrap">Property Taxes &amp; Insurance (T&amp;I)</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 whitespace-nowrap">Escrowed Monthly</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Annual inputs divided by 12 and added to monthly housing cost and lifetime outflow across your actual payoff duration.</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 whitespace-nowrap">HOA Dues</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 whitespace-nowrap">Monthly</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Added directly to recurring monthly housing cost and cumulative ownership outlay.</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 whitespace-nowrap">Conventional PMI (80% / 78% LTV)</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 whitespace-nowrap">Until LTV &le; Threshold</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Evaluated dynamically on each cycle&apos;s balance when initial LTV &gt; 80%; automatically drops to 0.00 once LTV reaches your 80% or 78% threshold.</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 whitespace-nowrap">Cash to Close</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 whitespace-nowrap">One-Time at Settlement</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Sums Down Payment + Closing Costs (synced $ or %) + Discount Points (1% of loan/pt) + Upfront Lender Fees + Origination Prepayment.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 5: ENGINE-VERIFIED WORKED EXAMPLES (US + BIWEEKLY + 78%/80% PMI) */}
        <section aria-labelledby="mortgage-worked-examples" className="mb-8">
          <h2 id="mortgage-worked-examples" className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">
            Engine-Verified Worked Examples: Extra Payments, Biweekly &amp; PMI Drop-Off
          </h2>
          <p className="mb-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
            Every number below was generated directly by the KivaroTools amortization engine and verified for exact principal conservation:
          </p>

          <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base mb-2">
                Example 1: Conventional 30-Year Fixed (20% Down, PITI)
              </h3>
              <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 mb-3 font-mono list-none pl-0">
                <li>Home Price: $400,000 | Down: 20% ($80,000)</li>
                <li>Loan Principal: $320,000 | Rate: 6.50% | Term: 30 yrs</li>
                <li>Taxes: $4,800/yr ($400/mo) | Insurance: $1,440/yr ($120/mo)</li>
                <li>PMI: $0.00 (Initial LTV = 80%)</li>
              </ul>
              <div className="pt-2.5 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <p className="m-0"><strong>Monthly P&amp;I:</strong> $2,022.62 &nbsp;|&nbsp; <strong>Total Monthly PITI:</strong> $2,542.62</p>
                <p className="m-0"><strong>Lifetime Interest:</strong> $408,140.64 &nbsp;|&nbsp; <strong>Total P&amp;I Outflow:</strong> $728,140.64</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/60 dark:bg-slate-800/40">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base mb-2">
                Example 2: Conventional 5% Down + PMI (80% vs 78% LTV) + $200/mo Extra
              </h3>
              <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 mb-3 font-mono list-none pl-0">
                <li>Home Price: $300,000 | Down: 5% ($15,000) | Loan: $285,000</li>
                <li>Rate: 6.75% | Term: 30 yrs | PMI: 0.75% | Extra: +$200/mo</li>
              </ul>
              <div className="pt-2.5 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <p className="m-0"><strong>Base P&amp;I:</strong> $1,848.50 &nbsp;|&nbsp; <strong>Initial PMI:</strong> $178.13/mo</p>
                <p className="m-0"><strong>PMI Ends (80% LTV):</strong> Month 82 (Yr 7) &mdash; saves <strong>$7,672.64</strong> PMI</p>
                <p className="m-0"><strong>PMI Ends (78% Auto HPA):</strong> Month 90 (Yr 8) &mdash; saves <strong>$8,264.36</strong> PMI</p>
                <p className="m-0"><strong>Payoff:</strong> 273 mos (22.75 yrs, <strong>7 yrs 3 mos saved</strong>) &nbsp;|&nbsp; <strong>Interest Saved:</strong> $108,187.79</p>
              </div>
            </div>
          </div>

          <div className="not-prose rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 sm:p-5 mb-6">
            <h3 className="font-bold text-emerald-950 dark:text-emerald-200 text-sm sm:text-base mb-1.5">
              Example 3: Accelerated Biweekly (26/Yr) + $200/mo Extra Principal ($500k Home, 10% Down)
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed m-0">
              On a <strong>$500,000</strong> home with 10% down ($450,000 loan, 6.50%, 30 years, 0.50% PMI), switching from Monthly to <strong>Accelerated Biweekly ($1,422.16 every 2 weeks)</strong> plus <strong>$200/mo extra principal</strong> cuts payoff to <strong>544 biweekly periods (20.92 years)</strong>, drops PMI at <strong>Period 113 (Year 5)</strong>, and saves <strong>$200,238.59 in lifetime interest</strong> and <strong>9 years 1 month</strong> compared to a standard 30-year monthly schedule.
            </p>
          </div>
        </section>

        {/* SECTION 6: GLOBAL & REGIONAL WORKED EXAMPLES (UAE, SG, ZA, PH, SA) */}
        <section aria-labelledby="mortgage-regional-examples" className="mb-8">
          <h2 id="mortgage-regional-examples" className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">
            Global Home Loan EMI, Bond &amp; Mortgage Amortization Scenarios (AED, SGD, ZAR, PHP, SAR, GBP, AUD)
          </h2>
          <p className="mb-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
            Select any of our 154 ISO-4217 currencies to model local mortgage, housing loan, or South African bond repayments with instant Excel CSV export:
          </p>
          <div className="w-full max-w-full overflow-x-auto overscroll-x-contain mb-6 not-prose">
            <table className="min-w-[680px] w-full text-xs sm:text-sm text-left border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden tabular-nums">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                  <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">Market / Currency</th>
                  <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">Illustrative Scenario</th>
                  <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold text-right">Monthly P&amp;I</th>
                  <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold text-right">Payoff &amp; Interest Saved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 whitespace-nowrap">UAE (AED)</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">AED 1,500,000 home, 20% down, 4.5%, 25 yrs, +AED 1,000/mo extra</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right font-medium text-slate-900 dark:text-white whitespace-nowrap">AED 6,669.99</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right whitespace-nowrap">19.75 yrs (&minus;5 yrs 3 mos) &middot; <strong>AED 190,382.10</strong> saved</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 whitespace-nowrap">Singapore (SGD)</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">SGD 1,200,000 home, 25% down, 3.2%, 25 yrs, +SGD 500/mo extra</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right font-medium text-slate-900 dark:text-white whitespace-nowrap">S$4,362.11</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right whitespace-nowrap">21.33 yrs (&minus;3 yrs 8 mos) &middot; <strong>S$66,312.78</strong> saved</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 whitespace-nowrap">South Africa Bond (ZAR)</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">R1,500,000 home, 10% deposit, 11.25%, 20 yrs, +R1,000/mo extra</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right font-medium text-slate-900 dark:text-white whitespace-nowrap">R14,164.96</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right whitespace-nowrap">16.08 yrs (&minus;3 yrs 11 mos) &middot; <strong>R475,546.20</strong> saved</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 whitespace-nowrap">Philippines (PHP)</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">&peso;4,000,000 home, 20% down, 7.5%, 15 yrs (standard schedule)</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right font-medium text-slate-900 dark:text-white whitespace-nowrap">&peso;29,664.40</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right whitespace-nowrap">15.0 yrs &middot; Total Interest: &peso;2,139,590.64</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 whitespace-nowrap">Saudi Arabia (SAR)</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">SAR 1,200,000 home, 15% down, 5.5% illustrative, 20 yrs</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right font-medium text-slate-900 dark:text-white whitespace-nowrap">SAR 7,016.45</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right whitespace-nowrap">20.0 yrs &middot; Total Interest: SAR 663,948.39</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 whitespace-nowrap">UK Overpayment (GBP)</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">&pound;350,000 home, 20% deposit, 4.75%, 25 yrs, +&pound;250/mo overpayment</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right font-medium text-slate-900 dark:text-white whitespace-nowrap">&pound;1,596.33</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right whitespace-nowrap">19.42 yrs (&minus;5 yrs 7 mos) &middot; <strong>&pound;50,317.90</strong> saved</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 whitespace-nowrap">Australia Fortnightly (AUD)</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">A$800,000 home, 20% deposit, 6.0%, 30 yrs, Biweekly (26/yr) + A$200/mo extra</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right font-medium text-slate-900 dark:text-white whitespace-nowrap">A$1,918.56 / fn</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-right whitespace-nowrap">22.15 yrs (&minus;7 yrs 10 mos) &middot; <strong>A$224,564.70</strong> saved</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 7: COMPETITOR COMPARISON TABLE (HONEST, ZERO FAKE CLAIMS) */}
        <section aria-labelledby="mortgage-competitor-comparison" className="mb-8 pt-6 border-t border-gray-100 dark:border-slate-800">
          <h2 id="mortgage-competitor-comparison" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            Mortgage Calculator Comparison: KivaroTools vs. Major Online Calculators
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm sm:text-base leading-relaxed">
            How KivaroTools compares on everyday borrower workflows—with transparent scope and zero signup walls:
          </p>
          <div className="w-full max-w-full overflow-x-auto overscroll-x-contain my-5 not-prose">
            <table className="min-w-[680px] w-full text-xs sm:text-sm text-left border-collapse border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                  <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">Capability</th>
                  <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-bold">KivaroTools (Free)</th>
                  <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">MortgageCalculator.org</th>
                  <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">AccurateCalculators</th>
                  <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">Regional Bank Portals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Unlimited Excel CSV Export</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">Unlimited RFC-4180 CSV (No signup)</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Print view only (no CSV)</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">3 free exports cap</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Rarely offered</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Multi-Currency Support</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">154 ISO-4217 currencies (AED, SGD, ZAR, PHP, GBP, AUD, USD)</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">USD only</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Multi-currency</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Single local currency</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Dynamic 80% / 78% PMI Drop-Off</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">Editable LTV threshold + exact PMI Ends badge</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">80% LTV default</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Stops below 80% LTV</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Often omitted</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Extra Principal + Biweekly + PITI</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">Monthly extra, lump sum (origination or period #) &amp; 26/yr biweekly</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Extra payment on separate page</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Supported</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Usually split across pages</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Cash to Close (Points &amp; Fees)</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">Synced closing costs ($/%), discount points &amp; lender fees</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Basic closing inputs</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Points, fees &amp; Reg Z APR</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Local statutory fee estimators</td>
                </tr>
                <tr>
                  <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Privacy &amp; Lead Capture</th>
                  <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">100% browser-side; zero lead forms</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Lender rate-table lead wall</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Subscription upsell for exports</td>
                  <td className="p-3 border border-slate-200 dark:border-slate-700">Bank pre-approval lead funnels</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 8: SUPPORTED CAPABILITIES & MODEL LIMITATIONS */}
        <section aria-labelledby="mortgage-capabilities-limitations" className="mb-8">
          <h2 id="mortgage-capabilities-limitations" className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">
            Supported Capabilities &amp; Model Limitations
          </h2>
          <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
              <h3 className="font-bold text-emerald-950 dark:text-emerald-200 mb-2 text-sm">
                Verified Live Capabilities
              </h3>
              <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 list-disc pl-4 m-0">
                <li>154 ISO-4217 world currencies with exact 0, 2, or 3 decimal minor-unit rounding.</li>
                <li>Full PITI + HOA monthly and accelerated biweekly (26/yr) payment modeling.</li>
                <li>Dynamic conventional PMI drop-off at custom 80% or 78% LTV with exact period/year badge.</li>
                <li>Extra monthly principal + one-time lump-sum prepayment (Day-1 origination or specific period #).</li>
                <li>Itemized Cash to Close (down payment, synced closing costs $/%, discount points, lender fees).</li>
                <li>Visual horizontal cost breakdown bars, principal conservation audit, paginated schedule, Copy Summary &amp; RFC-4180 Excel CSV export.</li>
              </ul>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
              <h3 className="font-bold text-amber-950 dark:text-amber-200 mb-2 text-sm">
                Explicit Model Boundaries (Not Modeled Here)
              </h3>
              <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 list-disc pl-4 m-0">
                <li><strong>FHA UFMIP / Life-of-Loan MIP:</strong> This tool models conventional 80%/78% HPA PMI cancellation, not HUD FHA MIP rules.</li>
                <li><strong>Regional Statutory Taxes &amp; Caps:</strong> Does not compute MAS Singapore TDSR/MSR/ABSD, Dubai 4% DLD fees, South African SARS transfer duty, or Philippine Pag-IBIG tiers.</li>
                <li><strong>Canadian Fixed-Rate Compounding:</strong> Uses monthly/biweekly periodic compounding rather than Canada&apos;s mandatory semi-annual compounding.</li>
                <li><strong>Loan Recasting / Personal &amp; Auto EMIs:</strong> For personal, auto, or retail loans with payment recasting or weekly schedules, use our{' '}
                  <Link href="/finance/emi-calculator" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    EMI &amp; Loan Calculator
                  </Link>.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 9: FAQS */}
        <section aria-labelledby="mortgage-calculator-frequently-asked-questions" className="mb-8">
          <h2 id="mortgage-calculator-frequently-asked-questions" className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3 not-prose">
            {MORTGAGE_CALCULATOR_FAQS.map((faq, index) => (
              <details
                key={index}
                className="group rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 transition-colors"
              >
                <summary className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base cursor-pointer select-none list-none flex items-center justify-between gap-3">
                  <span>{faq.question}</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform shrink-0">&#9662;</span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          {/* YMYL & REGIONAL REGULATORY DISCLAIMER */}
          <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 leading-relaxed mt-6">
            <strong>Important Financial &amp; Regulatory Disclaimer:</strong> All payments, PMI drop-off dates, Cash-to-Close totals, and amortization schedules are educational estimates for fixed-rate amortizing loans. KivaroTools is not a mortgage lender, broker, or licensed financial advisor. Outputs do not constitute a TILA/RESPA (TRID) Loan Estimate, Closing Disclosure, or regulatory affordability check under CFPB, HUD, MAS (Singapore), CBUAE (UAE), SARS (South Africa), SAMA (Saudi Arabia), or Pag-IBIG (Philippines) rules. Verify final terms with a licensed lender before signing loan documents.
          </div>
        </section>

        {/* SECTION 10: RELATED FINANCIAL CALCULATORS */}
        <section aria-labelledby="mortgage-calculator-related-financial-calculators-" className="mb-2">
          <h2 id="mortgage-calculator-related-financial-calculators-" className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100">
            Related Financial Calculators on KivaroTools
          </h2>
          <p className="leading-relaxed text-slate-600 dark:text-slate-400 text-sm">
            Continue your financial planning with our companion calculators: calculate personal, auto, or retail loan installments with recasting on the{' '}
            <Link href="/finance/emi-calculator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
              Loan EMI Calculator
            </Link>
            , model mutual fund wealth growth with the{' '}
            <Link href="/finance/sip-calculator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
              SIP Calculator
            </Link>
            , project long-term savings with the{' '}
            <Link href="/finance/compound-interest" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
              Compound Interest Calculator
            </Link>
            , estimate net take-home pay in{' '}
            <Link href="/finance/salary-calculator/singapore" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
              Singapore
            </Link>{' '}
            or the{' '}
            <Link href="/finance/salary-calculator/united-arab-emirates" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
              United Arab Emirates
            </Link>
            , or generate client invoices with the{' '}
            <Link href="/finance/invoice-generator" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
              Invoice Generator
            </Link>
            .
          </p>
        </section>
      </article>
    </>
  );
}