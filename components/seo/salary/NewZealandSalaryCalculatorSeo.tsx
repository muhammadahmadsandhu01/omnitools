import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const NEW_ZEALAND_SALARY_FAQS: FaqItem[] = [
  {
    question: 'What are the New Zealand IRD PAYE income tax brackets for 2026–2027?',
    answer:
      'New Zealand personal income tax brackets (under Tax Code M) are: 10.5% on income from $0 to $15,600; 17.5% from $15,601 to $53,500; 30.0% from $53,501 to $78,100; 33.0% from $78,101 to $180,000; and 39.0% on all income over $180,000.',
  },
  {
    question: "What is the ACC Earners' Levy rate and cap for 2026–2027?",
    answer:
      "The Accident Compensation Corporation (ACC) Earners' Levy covers non-work physical injuries for all New Zealanders. For the 2026–2027 tax year, the levy rate is 1.75% (GST inclusive) up to a maximum liable earnings cap of NZ$156,641 (compared to 1.67% up to NZ$152,790 in 2025–2026).",
  },
  {
    question: 'How does KiwiSaver affect my take-home pay?',
    answer:
      'Eligible New Zealand employees are automatically enrolled in KiwiSaver at a default employee contribution rate of 3% (you can also choose 4%, 6%, 8%, or 10%, or take a savings suspension at 0%). Employee KiwiSaver contributions are calculated on your gross before-tax pay and deducted alongside PAYE, while your employer contributes a compulsory 3% match.',
  },
  {
    question: 'Does New Zealand have a tax-free threshold like Australia?',
    answer:
      "No. Unlike Australia's $18,200 tax-free threshold, New Zealand taxes the very first dollar of earned income at the lowest 10.5% bracket (up to $15,600).",
  },
  {
    question: 'Can I customize my KiwiSaver percentage in this calculator?',
    answer:
      'Yes. Use the KiwiSaver Employee Rate selector in the calculator workspace to switch between 0% (Opt-Out/Holiday), 3%, 4%, 6%, 8%, and 10%.',
  },
  {
    question: 'How does the New Zealand calculator normalize Annual, Monthly, Biweekly, Weekly, Daily, and Hourly pay periods?',
    answer:
      'All statutory tax brackets and social security ceilings in New Zealand are evaluated on an annualized basis and then normalized across 6 standard payroll frequencies: Annual (1 period), Monthly (12 periods), Biweekly (26 periods), Weekly (52 periods), Daily (260 working days), and Hourly (2,080 standard working hours).',
  },
  {
    question: 'Does this New Zealand salary calculator compute Total Employer Cost of Employment (CTC)?',
    answer:
      'Yes. Alongside your employee net take-home pay, the Statutory Reconciliation Ledger calculates mandatory employer-side social insurance and payroll contributions on top of contractual gross pay so HR teams and founders can budget true Total Cost of Employment.',
  },
  {
    question: 'What is the difference between my marginal tax rate and effective tax rate in New Zealand?',
    answer:
      'Your marginal tax rate is the statutory percentage applied only to the next unit of income earned in your highest active tax bracket. Your effective tax rate is your total annual income tax divided by your total annual gross salary, which is always lower than your top marginal slab due to tax-free allowances and lower progressive bands.',
  },
  {
    question: 'Can I export a complete New Zealand payslip breakdown and slab audit to CSV or Excel?',
    answer:
      'Yes. Click the Export CSV Payslip button inside the Statutory Reconciliation Ledger to download an RFC-4180 compliant, formula-safe CSV file containing Per-Period and Annualized Gross Pay, Income Tax, Social Security, Net Take-Home Pay, Employer Cost, and the official Ruleset ID.',
  },
  {
    question: 'Are my New Zealand salary figures or tax inputs stored or uploaded to any server?',
    answer:
      'Never. 100% of gross-to-net calculations, progressive bracket audits, and CSV payslip exports execute locally in your browser memory (RAM) with zero server uploads, zero cookies, and zero telemetry logging.',
  },
];

export default function NewZealandSalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: NEW_ZEALAND_SALARY_FAQS.map((faq) => ({
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
            name: 'How to Calculate New Zealand Net Take-Home Pay, Income Tax & Employer Cost',
            description: 'Step-by-step statutory guide to calculating gross-to-net salary, progressive income tax slabs, employee social security, and employer payroll cost in New Zealand.',
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
                text: 'Choose the applicable statutory tax year and any regional, filing status, or residency options for New Zealand.',
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
        New Zealand Salary Calculator 2026–2027: IRD PAYE Tax, ACC Levy & KiwiSaver
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your net take-home pay in New Zealand (NZD) using official Inland Revenue (IRD) PAYE tax brackets, the ACC Earners&apos; Levy (1.75% for 2026–27), and customizable KiwiSaver retirement contributions (0% to 10%).
      </p>

      {/* How It Works */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        How New Zealand Gross-to-Net Payroll &amp; Tax Withholding Is Calculated
      </h2>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>IRD Progressive PAYE Tax Brackets:</strong> Under Budget 2024 thresholds: 10.5% up to NZ$15,600; 17.5% from NZ$15,601 to NZ$53,500; 30.0% from NZ$53,501 to NZ$78,100; 33.0% from NZ$78,101 to NZ$180,000; and 39.0% above NZ$180,000.
        </li>
        <li>
          <strong>ACC Earners&apos; Levy:</strong> Deducted at 1.75% up to the NZ$156,641 maximum liable earnings cap for 2026–27 (1.67% up to NZ$152,790 for 2025–26) to fund no-fault accidental injury cover.
        </li>
        <li>
          <strong>KiwiSaver Employee Contribution:</strong> Configurable at 0%, 3% (default), 4%, 6%, 8%, or 10% of gross pay, deducted post-tax.
        </li>
        <li>
          <strong>KiwiSaver Employer Matching (3%):</strong> Employers contribute a mandatory minimum of 3.0% on top of gross salary toward your KiwiSaver account.
        </li>
      </ol>

      {/* Worked Examples */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Representative New Zealand Salary &amp; Net Take-Home Pay Examples (2026–2027 & 2025–2026)
      </h2>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left text-sm border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross (NZD)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">IRD PAYE Tax</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">ACC (1.75%) + KiwiSaver (3%)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Net Take-Home</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Monthly Net Pay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">NZ$60,000</td>
              <td className="p-3">NZ$10,220</td>
              <td className="p-3">NZ$2,850</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">NZ$46,930</td>
              <td className="p-3">NZ$3,911 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">NZ$90,000</td>
              <td className="p-3">NZ$19,577</td>
              <td className="p-3">NZ$4,275</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">NZ$66,148</td>
              <td className="p-3">NZ$5,512 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">NZ$130,000</td>
              <td className="p-3">NZ$32,777</td>
              <td className="p-3">NZ$6,175</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">NZ$91,048</td>
              <td className="p-3">NZ$7,587 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">NZ$200,000</td>
              <td className="p-3">NZ$57,077</td>
              <td className="p-3">NZ$8,741 (ACC capped)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">NZ$134,182</td>
              <td className="p-3">NZ$11,182 / mo</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Statutory Provenance &amp; Ruleset Details
      </h2>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> NZ-IRD-2026.1</div>
        <div><strong>Source Authority:</strong> Inland Revenue Department (IRD) & ACC</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> 2026–2027 & 2025–2026</div>
        <div><strong>Status:</strong> Verified Statutory Model</div>
        <div><strong>Last Verified:</strong> 2026-10-01</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>Independent Earner Tax Credit (IETC up to NZ$520/yr for incomes between NZ$24,000 and NZ$70,000 without Working for Families)</li>
            <li>Student Loan repayment deductions (12% on income above the annual repayment threshold)</li>
            <li>Employer Superannuation Contribution Tax (ESCT) deducted from the employer&apos;s 3% KiwiSaver match</li>
          </ul>
        </div>
      </div>

            {/* 5-Column Country-Specific Competitor Comparison Matrix */}
      <h2 id="competitor-comparison" className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        New Zealand Salary Calculator Comparison: KivaroTools vs. PAYE.net.nz &amp; IRD Tax Calculator
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
        See how KivaroTools compares against leading New Zealand payroll and tax calculators across statutory accuracy (Inland Revenue (IRD)), pre-tax relief modeling, reverse net-to-gross solving, and client-side privacy:
      </p>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left text-sm border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">Capability / Statutory Feature</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">KivaroTools (100% Free)</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">PAYE.net.nz</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">IRD Tax Calculator</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">Seek NZ / Careers.govt.nz</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Enacted IRD PAYE Thresholds (10.5% to 39%)</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Full 5-bracket IRD progressive slab audit (2026–27 & 2025–26)</td>
              <td className="p-3">Yes (Summary view)</td>
              <td className="p-3">Official steps only</td>
              <td className="p-3">Summary total only</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">ACC Earners&apos; Levy (1.75% up to NZ$156,641 Cap)</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Exact year-specific ACC Levy (1.75% 2026–27 / 1.67% 2025–26) + Cap</td>
              <td className="p-3">Yes</td>
              <td className="p-3">Manual lookup</td>
              <td className="p-3">Approximate ACC</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Interactive KiwiSaver Selector (0%, 3%, 4%, 6%, 8%, 10%)</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Full Employee KiwiSaver selector + 3% Employer Match CTC Ledger</td>
              <td className="p-3">Yes</td>
              <td className="p-3">Basic</td>
              <td className="p-3">3% default only</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Reverse Net-to-Gross Solver & 9 Pay Periods</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">60-Iteration Reverse Net Solver + 9 Pay Periods + CSV Export</td>
              <td className="p-3">Basic toggle</td>
              <td className="p-3">None</td>
              <td className="p-3">Annual / Monthly only</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">100% Client-Side Privacy</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Zero Server Uploads or Tracking Cookies</td>
              <td className="p-3">Ad banners</td>
              <td className="p-3">Government form</td>
              <td className="p-3">Job board tracking</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Programmatic Long-Tail Search Intent & Statutory Coverage (26+ Queries) */}
      <div className="my-8 p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 not-prose">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
          New Zealand Statutory Tax &amp; Payroll Search Coverage (26 Verified Long-Tail Intents)
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">new zealand salary calculator 2026</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">new zealand take home pay calculator nzd</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">new zealand gross to net salary after tax</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">new zealand income tax brackets and slabs (Inland Revenue (IRD))</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">new zealand monthly biweekly weekly daily hourly paycheck</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">new zealand reverse net to gross target salary solver</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">new zealand total employer cost of employment ctc</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">new zealand employee social security contribution cap</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">new zealand effective tax rate vs marginal tax bracket</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">new zealand pre tax pension retirement deduction calculator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">how much tax do i pay on my salary in new zealand</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">new zealand annual to monthly and hourly net wage converter</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">new zealand expatriate and resident payroll tax comparison</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">new zealand job offer gross to net paycheck estimator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">new zealand biweekly 26 pay periods vs semi monthly 24 periods</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">new zealand daily rate 260 days and hourly rate 2080 hours</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">new zealand statutory payroll waterfall ledger csv export</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">free client side new zealand tax calculator zero data logging</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">new zealand software engineer and remote worker net pay</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">new zealand bonus overtime and gross compensation tax audit</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">new zealand ird paye tax brackets 10.5 17.5 30 33 39 percent calculator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">acc earners levy 1.75 percent cap 156641 nzd salary calculator 2026</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">kiwisaver 3 4 6 8 10 percent employee employer contribution calculator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">new zealand take home pay fortnightly weekly monthly annual nzd</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">paye net nz and ird tax calculator free private alternative</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">new zealand total employer cost kiwisaver match payroll calculator</span>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Frequently Asked Questions (New Zealand Income Tax &amp; Payroll)
      </h2>
      <div className="space-y-3 mb-6 not-prose">
        {NEW_ZEALAND_SALARY_FAQS.map((faq, index) => (
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
            href="/finance/salary-calculator/australia"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Australia Salary Calculator (ATO)
          </Link>
          <Link
            href="/finance/salary-calculator/united-kingdom"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            UK Salary Calculator (PAYE)
          </Link>
          <Link
            href="/finance/salary-calculator/canada"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Canada Salary Calculator (CRA)
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
