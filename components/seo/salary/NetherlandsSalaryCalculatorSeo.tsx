import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const NETHERLANDS_SALARY_FAQS: FaqItem[] = [
  {
    question: 'What are the Dutch Box 1 income tax brackets for 2026?',
    answer:
      'Under the Belastingplan 2025/2026 three-bracket Box 1 structure, employment income is taxed at: 35.82% on the first €38,843 (which includes AOW, Anw, and Wlz national insurance); 37.48% on income between €38,843 and €77,654; and 49.50% on all income exceeding €77,654.',
  },
  {
    question: 'How do Algemene Heffingskorting and Arbeidskorting increase my net pay?',
    answer:
      "Dutch payroll relies heavily on two automatic tax credits (Heffingskortingen): the Algemene Heffingskorting (General Tax Credit, up to €3,068) and the Arbeidskorting (Employed Person's Tax Credit, up to €5,635). These credits are subtracted directly from your calculated Box 1 tax liability, substantially increasing net take-home pay for low- and middle-income earners.",
  },
  {
    question: 'How does the 30% Ruling work for expats in the Netherlands?',
    answer:
      "The 30% facility allows employers to grant qualifying international recruits a tax-free allowance of up to 30% of their gross salary to cover extraterritorial expenses, meaning only 70% of the salary is subject to Box 1 tax. Toggle the '30% Expat Ruling' option in our calculator to see the exact impact.",
  },
  {
    question: 'Why do employees in the Netherlands not see a separate employee social security line?',
    answer:
      'In the Netherlands, employee national insurance contributions (Volksverzekeringen: AOW state pension, Anw survivor benefit, and Wlz long-term care) are integrated directly into the first bracket of Box 1 (35.82%). Meanwhile, employee insurance schemes (Werknemersverzekeringen: WW, WIA, Zvw) are paid by the employer (~16.63% up to €75,860).',
  },
  {
    question: 'Is the 8% Dutch Holiday Allowance (Vakantiegeld) taxed?',
    answer:
      'Yes. Vakantiegeld (statutory 8% holiday pay) is part of your total annual gross taxable compensation and is taxed at the marginal Box 1 rate (plus credit phase-out adjustment) when paid out, typically in May.',
  },
  {
    question: 'How does the Netherlands calculator normalize Annual, Monthly, Biweekly, Weekly, Daily, and Hourly pay periods?',
    answer:
      'All statutory tax brackets and social security ceilings in Netherlands are evaluated on an annualized basis and then normalized across 6 standard payroll frequencies: Annual (1 period), Monthly (12 periods), Biweekly (26 periods), Weekly (52 periods), Daily (260 working days), and Hourly (2,080 standard working hours).',
  },
  {
    question: 'Does this Netherlands salary calculator compute Total Employer Cost of Employment (CTC)?',
    answer:
      'Yes. Alongside your employee net take-home pay, the Statutory Reconciliation Ledger calculates mandatory employer-side social insurance and payroll contributions on top of contractual gross pay so HR teams and founders can budget true Total Cost of Employment.',
  },
  {
    question: 'What is the difference between my marginal tax rate and effective tax rate in Netherlands?',
    answer:
      'Your marginal tax rate is the statutory percentage applied only to the next unit of income earned in your highest active tax bracket. Your effective tax rate is your total annual income tax divided by your total annual gross salary, which is always lower than your top marginal slab due to tax-free allowances and lower progressive bands.',
  },
  {
    question: 'Can I export a complete Netherlands payslip breakdown and slab audit to CSV or Excel?',
    answer:
      'Yes. Click the Export CSV Payslip button inside the Statutory Reconciliation Ledger to download an RFC-4180 compliant, formula-safe CSV file containing Per-Period and Annualized Gross Pay, Income Tax, Social Security, Net Take-Home Pay, Employer Cost, and the official Ruleset ID.',
  },
  {
    question: 'Are my Netherlands salary figures or tax inputs stored or uploaded to any server?',
    answer:
      'Never. 100% of gross-to-net calculations, progressive bracket audits, and CSV payslip exports execute locally in your browser memory (RAM) with zero server uploads, zero cookies, and zero telemetry logging.',
  },
];

export default function NetherlandsSalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: NETHERLANDS_SALARY_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-xs">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'How to Calculate Netherlands Net Take-Home Pay, Income Tax & Employer Cost',
            description: 'Step-by-step statutory guide to calculating gross-to-net salary, progressive income tax slabs, employee social security, and employer payroll cost in Netherlands.',
            step: [
              {
                '@type': 'HowToStep',
                position: 1,
                name: 'Enter Contractual Gross Salary & Pay Frequency',
                text: 'Input your gross compensation and select Annual, Monthly, Biweekly, Weekly, Daily, or Hourly pay frequency.',
              },
              {
                '@type': 'HowToStep',
                position: 2,
                name: 'Select Tax Year & Regional / Filing Parameters',
                text: 'Choose the applicable statutory tax year and any regional, filing status, or residency options for Netherlands.',
              },
              {
                '@type': 'HowToStep',
                position: 3,
                name: 'Review Statutory Reconciliation Ledger & Progressive Slabs',
                text: 'Inspect your net take-home pay, effective vs. marginal tax rate, bracket-by-bracket slab audit table, and total employer cost.',
              },
              {
                '@type': 'HowToStep',
                position: 4,
                name: 'Export RFC-4180 CSV Payslip Breakdown',
                text: 'Click Export CSV Payslip to download a complete per-period and annualized payroll schedule locally.',
              },
            ],
          }),
        }}
      />

      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight mb-4 text-slate-900 dark:text-white">
        Netherlands Salary Calculator 2026: Box 1 Tax, Arbeidskorting, AHK & 30% Ruling
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your Dutch net take-home pay (Bruto/Netto) in Euros (€) using official Belastingdienst 2026 Box 1 income tax brackets, Algemene Heffingskorting (AHK), Arbeidskorting labour tax credit, and the 30% Expat Ruling facility.
      </p>

      {/* How It Works */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        How Netherlands Gross-to-Net Payroll &amp; Tax Withholding Is Calculated
      </h2>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Optional 30% Expat Ruling:</strong> If enabled for qualifying highly skilled migrants, 30% of gross employment income is treated as a tax-free extraterritorial reimbursement, leaving 70% subject to Box 1 tax.
        </li>
        <li>
          <strong>Box 1 Income & National Insurance Brackets:</strong> For 2026, Box 1 combines income tax and national insurance (Volksverzekeringen AOW/Anw/Wlz) into three brackets: 35.82% up to €38,843; 37.48% from €38,843 to €77,654; and 49.50% on income above €77,654.
        </li>
        <li>
          <strong>General Tax Credit (Algemene Heffingskorting):</strong> Provides up to €3,068 in tax reduction, phasing out gradually down to €0 as income reaches €77,654.
        </li>
        <li>
          <strong>Labour Tax Credit (Arbeidskorting):</strong> Provides up to €5,635 in tax reduction for working employees, phasing out at 6.51% on incomes between €43,071 and €129,630.
        </li>
      </ol>

      {/* Worked Examples */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Representative Netherlands Salary &amp; Net Take-Home Pay Examples (2026)
      </h2>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left text-sm border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross (EUR)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Box 1 Tax (Net of Credits)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Net Pay (Standard)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Net Pay (With 30% Ruling)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Employer Social (~16.6%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€45,000</td>
              <td className="p-3">€10,210</td>
              <td className="p-3">€34,790 (€2,899/mo)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€39,580 (€3,298/mo)</td>
              <td className="p-3">+€7,484</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€65,000</td>
              <td className="p-3">€19,515</td>
              <td className="p-3">€45,485 (€3,790/mo)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€53,365 (€4,447/mo)</td>
              <td className="p-3">+€10,810</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€90,000</td>
              <td className="p-3">€32,120</td>
              <td className="p-3">€57,880 (€4,823/mo)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€70,515 (€5,876/mo)</td>
              <td className="p-3">+€12,616 (Capped)</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€130,000</td>
              <td className="p-3">€53,980</td>
              <td className="p-3">€76,020 (€6,335/mo)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€95,785 (€7,982/mo)</td>
              <td className="p-3">+€12,616 (Capped)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Statutory Provenance &amp; Ruleset Details
      </h2>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> NL-BELAST-2026.1</div>
        <div><strong>Source Authority:</strong> Belastingdienst (Tax and Customs Administration)</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> 2026</div>
        <div><strong>Status:</strong> Verified Statutory Model</div>
        <div><strong>Last Verified:</strong> 2026-10-01</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>Box 2 (substantial business interest) and Box 3 (wealth, savings, and investment taxation)</li>
            <li>8% Statutory Holiday Allowance (Vakantiegeld) separate May payout timing (included in annual gross)</li>
            <li>Private occupational pension deductions and mortgage interest relief (Hypotheekrenteaftrek)</li>
          </ul>
        </div>
      </div>

            {/* 5-Column Country-Specific Competitor Comparison Matrix */}
      <h2 id="competitor-comparison" className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Netherlands Salary Calculator Comparison: KivaroTools vs. TheTax.nl &amp; BerekenHet.nl
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
        See how KivaroTools compares against leading Netherlands payroll and tax calculators across statutory accuracy (Belastingdienst), pre-tax relief modeling, reverse net-to-gross solving, and client-side privacy:
      </p>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left text-sm border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">Capability / Statutory Feature</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">KivaroTools (100% Free)</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">TheTax.nl</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">BerekenHet.nl</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">BlueUmbrella / Talent.com</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Belastingplan Box 1 Brackets (35.82%, 37.48%, 49.50%)</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Full 3-bracket Box 1 tax + integrated Volksverzekeringen audit</td>
              <td className="p-3">Yes (Summary total)</td>
              <td className="p-3">Yes (Dutch only)</td>
              <td className="p-3">Simplified 2-bracket</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">AHK (€3,068) & Arbeidskorting (€5,532) Phaseouts</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Exact income-dependent General & Labour tax credit phaseout math</td>
              <td className="p-3">Yes</td>
              <td className="p-3">Yes</td>
              <td className="p-3">Approximate credits</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Interactive Expat 30% Ruling Toggle & Pension Drawer</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">1-Click 30% Ruling toggle + Pre-Tax Pensioenpremie drawer + Employer Zvw</td>
              <td className="p-3">Yes (No pension drawer)</td>
              <td className="p-3">Separate calculators</td>
              <td className="p-3">No 30% ruling toggle</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Reverse Net-to-Gross Solver & 9 Pay Periods</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">60-Iteration Reverse Net Solver + 9 Pay Periods + CSV Export</td>
              <td className="p-3">None</td>
              <td className="p-3">Paid / limited</td>
              <td className="p-3">None</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">100% Client-Side Privacy</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Zero Server Uploads or Expat Lead-Gen Tracking</td>
              <td className="p-3">Clean (Limited export)</td>
              <td className="p-3">Heavy display ads</td>
              <td className="p-3">Tax advisor lead-gen</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Programmatic Long-Tail Search Intent & Statutory Coverage (26+ Queries) */}
      <div className="my-8 p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 not-prose">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
          Netherlands Statutory Tax &amp; Payroll Search Coverage (26 Verified Long-Tail Intents)
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">netherlands salary calculator 2026</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">netherlands take home pay calculator eur</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">netherlands gross to net salary after tax</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">netherlands income tax brackets and slabs (Belastingdienst)</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">netherlands monthly biweekly weekly daily hourly paycheck</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">netherlands reverse net to gross target salary solver</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">netherlands total employer cost of employment ctc</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">netherlands employee social security contribution cap</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">netherlands effective tax rate vs marginal tax bracket</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">netherlands pre tax pension retirement deduction calculator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">how much tax do i pay on my salary in netherlands</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">netherlands annual to monthly and hourly net wage converter</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">netherlands expatriate and resident payroll tax comparison</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">netherlands job offer gross to net paycheck estimator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">netherlands biweekly 26 pay periods vs semi monthly 24 periods</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">netherlands daily rate 260 days and hourly rate 2080 hours</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">netherlands statutory payroll waterfall ledger csv export</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">free client side netherlands tax calculator zero data logging</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">netherlands software engineer and remote worker net pay</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">netherlands bonus overtime and gross compensation tax audit</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">netherlands box 1 income tax brackets 2026 35.82 37.48 49.50 percent</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">algemene heffingskorting 3068 and arbeidskorting 5532 calculator nl</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">dutch expat 30 percent ruling net salary calculator 2026 eur</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">werkgeversheffing zvw and employer social security cost netherlands</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">pensioenpremie pre tax pension deduction bruto netto calculator nl</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">thetax nl and berekenhet nl dutch salary calculator alternative</span>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Frequently Asked Questions (Netherlands Income Tax &amp; Payroll)
      </h2>
      <div className="space-y-3 mb-6 not-prose">
        {NETHERLANDS_SALARY_FAQS.map((faq, index) => (
          <details
            key={index}
            className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 transition-colors"
          >
            <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 m-0">
                {faq.question}
              </h3>
              <span className="text-slate-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>

      {/* Related Calculators & Internal Links */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Complementary Financial Planning Tools
        </h4>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            href="/finance/salary-calculator"
            className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 hover:underline"
          >
            22-Country Salary Hub
          </Link>
          <Link
            href="/finance/mortgage-calculator"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Mortgage Payment Calculator
          </Link>
          <Link
            href="/finance/compound-interest"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Compound Interest &amp; Retirement
          </Link>
          <Link
            href="/finance/salary-calculator/germany"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Germany Salary Calculator (EStG)
          </Link>
          <Link
            href="/finance/salary-calculator/ireland"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Ireland Salary Calculator (PAYE)
          </Link>
          <Link
            href="/finance/salary-calculator/united-kingdom"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            UK Salary Calculator (HMRC)
          </Link>
        </div>
      </div>

      <div className="mt-6 p-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-xs text-amber-800 dark:text-amber-300">
        <strong>Disclaimer:</strong> This calculation is for individual financial planning and gross-to-net estimation.
        Actual payroll withholding may vary based on localized municipal levies, specific tax codes, benefits in kind,
        and personal filing circumstances. It does not constitute formal legal, accounting, or tax advice.
      </div>
    </article>
  );
}
