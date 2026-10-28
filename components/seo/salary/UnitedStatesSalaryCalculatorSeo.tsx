import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const US_SALARY_FAQS: FaqItem[] = [
  {
    question: 'What are the 2026 standard deduction amounts for federal income tax?',
    answer:
      'Under IRS Revenue Procedure 2025-32, the standard deduction for tax year 2026 is $16,100 for Single and Married Filing Separately taxpayers, $32,200 for Married Filing Jointly, and $24,150 for Heads of Household. Taxpayers claiming the standard deduction reduce their gross income by these statutory thresholds before progressive tax brackets apply.',
  },
  {
    question: 'What is the 2026 Social Security (OASDI) taxable wage base cap?',
    answer:
      'The Social Security Administration announced the 2026 maximum taxable earnings limit as $184,500 (up from $176,100 in 2025). The 6.20% employee Old-Age, Survivors, and Disability Insurance (OASDI) tax applies only up to this ceiling, establishing a maximum annual employee contribution of $11,439.00.',
  },
  {
    question: 'How does the Medicare Tax and Additional Medicare Tax work?',
    answer:
      'All earned wages are subject to the standard 1.45% employee Medicare (Hospital Insurance) tax with no annual wage ceiling. Under the Affordable Care Act, an Additional Medicare Tax of 0.90% applies to wages exceeding $200,000 for Single filers ($250,000 for Married Filing Jointly), raising the marginal Medicare withholding rate to 2.35% on excess compensation.',
  },
  {
    question: 'How do progressive federal income tax brackets apply to salary?',
    answer:
      'The federal tax system is progressive: income is divided into brackets (10%, 12%, 22%, 24%, 32%, 35%, and 37%), and each rate applies solely to dollars within that specific tier—not your entire salary. Your effective tax rate is always substantially lower than your top marginal tax bracket.',
  },
  {
    question: 'Does this calculator model state and municipal income taxes?',
    answer:
      'Yes, the calculator models state income taxes using official statutory schedules (including California and New York progressive brackets, and statutory flat rates for other states). States with zero personal earned income tax (such as Texas, Florida, Washington, and Nevada) reflect a 0% state income tax withholding.',
  },
  {
    question: 'How does the United States calculator normalize Annual, Monthly, Biweekly, Weekly, Daily, and Hourly pay periods?',
    answer:
      'All statutory tax brackets and social security ceilings in United States are evaluated on an annualized basis and then normalized across 6 standard payroll frequencies: Annual (1 period), Monthly (12 periods), Biweekly (26 periods), Weekly (52 periods), Daily (260 working days), and Hourly (2,080 standard working hours).',
  },
  {
    question: 'Does this United States salary calculator compute Total Employer Cost of Employment (CTC)?',
    answer:
      'Yes. Alongside your employee net take-home pay, the Statutory Reconciliation Ledger calculates mandatory employer-side social insurance and payroll contributions on top of contractual gross pay so HR teams and founders can budget true Total Cost of Employment.',
  },
  {
    question: 'What is the difference between my marginal tax rate and effective tax rate in United States?',
    answer:
      'Your marginal tax rate is the statutory percentage applied only to the next unit of income earned in your highest active tax bracket. Your effective tax rate is your total annual income tax divided by your total annual gross salary, which is always lower than your top marginal slab due to tax-free allowances and lower progressive bands.',
  },
  {
    question: 'Can I export a complete United States payslip breakdown and slab audit to CSV or Excel?',
    answer:
      'Yes. Click the Export CSV Payslip button inside the Statutory Reconciliation Ledger to download an RFC-4180 compliant, formula-safe CSV file containing Per-Period and Annualized Gross Pay, Income Tax, Social Security, Net Take-Home Pay, Employer Cost, and the official Ruleset ID.',
  },
  {
    question: 'Are my United States salary figures or tax inputs stored or uploaded to any server?',
    answer:
      'Never. 100% of gross-to-net calculations, progressive bracket audits, and CSV payslip exports execute locally in your browser memory (RAM) with zero server uploads, zero cookies, and zero telemetry logging.',
  },
];

export default function UnitedStatesSalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: US_SALARY_FAQS.map((faq) => ({
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
            name: 'How to Calculate United States Net Take-Home Pay, Income Tax & Employer Cost',
            description: 'Step-by-step statutory guide to calculating gross-to-net salary, progressive income tax slabs, employee social security, and employer payroll cost in United States.',
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
                text: 'Choose the applicable statutory tax year and any regional, filing status, or residency options for United States.',
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
        United States Salary Calculator 2026: Federal Tax, FICA &amp; Take-Home Pay Guide
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Estimate your net paycheck and annual take-home compensation in the United States using official IRS 2026
        inflation adjustments (Rev. Proc. 2025-32) and SSA 2026 payroll parameters. This calculator decomposes gross
        compensation, federal progressive tax, FICA deductions (Social Security and Medicare), and state tax baselines.
      </p>

      {/* How It Works */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        How US Payroll &amp; Federal Income Tax Withholding Is Calculated
      </h2>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Standard Deduction:</strong> The applicable statutory standard deduction ($16,100 Single / $32,200 MFJ) is subtracted from gross income to establish federal taxable income.
        </li>
        <li>
          <strong>Federal Progressive Brackets:</strong> Taxable income is taxed across the seven IRS brackets: 10% ($0–$12,400), 12% ($12,400–$50,400), 22% ($50,400–$105,700), 24% ($105,700–$201,775), 32% ($201,775–$256,225), 35% ($256,225–$640,600), and 37% (over $640,600).
        </li>
        <li>
          <strong>FICA Payroll Taxes:</strong> Social Security (OASDI) is deducted at 6.20% on wages up to $184,500 ($11,439.00 max). Medicare (HI) is deducted at 1.45% on all earnings, plus 0.90% Additional Medicare on wages exceeding $200,000 for Single filers.
        </li>
        <li>
          <strong>Net Take-Home Pay:</strong> Federal tax, FICA taxes, and applicable state income taxes are subtracted from gross earnings to produce your net spendable paycheck.
        </li>
      </ol>

      {/* Worked Examples */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Representative Salary Examples (Single Filer, 2026 Tax Year)
      </h2>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left text-sm border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Standard Deduction</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Federal Tax</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">FICA (OASDI + Med)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Net Pay (Fed Baseline)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">$50,000</td>
              <td className="p-3">$16,100</td>
              <td className="p-3">$3,820.00 (7.6% eff.)</td>
              <td className="p-3">$3,825.00</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">$42,355.00 ($3,530/mo)</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">$100,000</td>
              <td className="p-3">$16,100</td>
              <td className="p-3">$13,170.00 (13.2% eff.)</td>
              <td className="p-3">$7,650.00</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">$79,180.00 ($6,598/mo)</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">$200,000</td>
              <td className="p-3">$16,100</td>
              <td className="p-3">$36,734.00 (18.4% eff.)</td>
              <td className="p-3">$14,339.00 (OASDI capped)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">$148,927.00 ($12,411/mo)</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">$300,000</td>
              <td className="p-3">$16,100</td>
              <td className="p-3">$68,134.25 (22.7% eff.)</td>
              <td className="p-3">$16,689.00 (incl. Addl Med)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">$215,176.75 ($17,931/mo)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Statutory Provenance &amp; Ruleset Details
      </h2>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> US-FED-2026.2</div>
        <div><strong>Source Authority:</strong> Internal Revenue Service (IRS Rev. Proc. 2025-32) &amp; SSA Notice</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> Tax Year 2026</div>
        <div><strong>Status:</strong> Verified Statutory Model (Federal Baseline)</div>
        <div><strong>Last Verified:</strong> 2026-10-01</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>Local and municipal income taxes (e.g., NYC resident personal tax, Yonkers)</li>
            <li>Itemized deduction schedules (Schedule A mortgage interest, charitable donations, SALT $10k cap)</li>
            <li>Alternative Minimum Tax (AMT) and Child Tax Credit phaseouts</li>
          </ul>
        </div>
      </div>

            {/* 5-Column Country-Specific Competitor Comparison Matrix */}
      <h2 id="competitor-comparison" className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        United States Salary Calculator Comparison: KivaroTools vs. SmartAsset Paycheck &amp; ADP Salary Calculator
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
        See how KivaroTools compares against leading United States payroll and tax calculators across statutory accuracy (IRS & SSA), pre-tax relief modeling, reverse net-to-gross solving, and client-side privacy:
      </p>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left text-sm border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">Capability / Statutory Feature</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">KivaroTools (100% Free)</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">SmartAsset Paycheck</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">ADP Salary Calculator</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">Forbes Advisor / NerdWallet</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">2026 IRS Rev. Proc. 2025-32 & 2025 Brackets (All 4 Filing Statuses)</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Full 7-bracket audit for Single, MFJ, MFS & HOH ($16,100 / $32,200 Std Ded)</td>
              <td className="p-3">Summary tax total</td>
              <td className="p-3">Summary tax total</td>
              <td className="p-3">Single year only</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">All 50 US States + DC (Progressive CA/NY, Flat & 0% States)</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Instant 51-jurisdiction selector (10-bracket CA, 8-bracket NY, 9 zero-tax states)</td>
              <td className="p-3">Requires ZIP code lookup</td>
              <td className="p-3">Multi-step wizard</td>
              <td className="p-3">State approximations</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">FICA Social Security ($184,500 Cap) + Medicare & 0.9% Addl</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Exact 2026 $184,500 ($176,100 in 2025) OASDI cap + Additional Medicare + Employer FICA</td>
              <td className="p-3">Employee FICA only</td>
              <td className="p-3">Employee FICA only</td>
              <td className="p-3">Employee FICA only</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Pre-Tax 401(k) / HSA / IRA Drawer & Reverse Net Solver</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Interactive Pre-Tax 401(k)/HSA drawer + 60-Iteration Reverse Net-to-Gross Solver</td>
              <td className="p-3">Basic 401(k) field</td>
              <td className="p-3">No reverse solver</td>
              <td className="p-3">No reverse solver</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">100% Client-Side Privacy & 1-Click CSV Payslip</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Zero Financial Advisor Lead-Gen Popups + 9 Pay Periods + CSV Export</td>
              <td className="p-3">Financial advisor lead-gen</td>
              <td className="p-3">Payroll sales funnel</td>
              <td className="p-3">Affiliate ad banners</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Programmatic Long-Tail Search Intent & Statutory Coverage (26+ Queries) */}
      <div className="my-8 p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 not-prose">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
          United States Statutory Tax &amp; Payroll Search Coverage (26 Verified Long-Tail Intents)
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united states salary calculator 2026</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united states take home pay calculator usd</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united states gross to net salary after tax</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united states income tax brackets and slabs (IRS & SSA)</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united states monthly biweekly weekly daily hourly paycheck</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united states reverse net to gross target salary solver</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united states total employer cost of employment ctc</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united states employee social security contribution cap</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united states effective tax rate vs marginal tax bracket</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united states pre tax pension retirement deduction calculator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">how much tax do i pay on my salary in united states</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united states annual to monthly and hourly net wage converter</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united states expatriate and resident payroll tax comparison</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united states job offer gross to net paycheck estimator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united states biweekly 26 pay periods vs semi monthly 24 periods</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united states daily rate 260 days and hourly rate 2080 hours</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united states statutory payroll waterfall ledger csv export</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">free client side united states tax calculator zero data logging</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united states software engineer and remote worker net pay</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united states bonus overtime and gross compensation tax audit</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">us paycheck calculator 2026 irs rev proc 2025 32 federal tax brackets</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">social security wage base 184500 cap 2026 fica medicare tax calculator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">california new york texas florida washington state income tax calculator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">401k hsa traditional ira pre tax deduction take home pay calculator us</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">married filing jointly vs single head of household tax calculator 2026</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">smartasset and adp paycheck calculator free private no lead gen alternative</span>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Frequently Asked Questions (US Income Tax &amp; Payroll)
      </h2>
      <div className="space-y-3 mb-6 not-prose">
        {US_SALARY_FAQS.map((faq, index) => (
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
            Compound Interest &amp; 401(k) Growth
          </Link>
          <Link
            href="/finance/salary-calculator/canada"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Canada Salary Calculator (CPP/EI)
          </Link>
          <Link
            href="/finance/salary-calculator/united-kingdom"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            UK Salary Calculator (PAYE/NI)
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
