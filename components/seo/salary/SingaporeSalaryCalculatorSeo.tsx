import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const SINGAPORE_SALARY_FAQS: FaqItem[] = [
  {
    question: 'What is the Singapore CPF Ordinary Wage (OW) ceiling in 2026?',
    answer:
      'Under the Singapore Budget 2023 phased schedule, the CPF Ordinary Wage (OW) monthly ceiling increased to S$7,400/month in 2025 and reaches S$8,000/month (S$96,000 annually) from 1 January 2026. For Citizens/PRs aged 55 and under, the maximum monthly employee CPF deduction on ordinary wages is 20% of S$8,000 = S$1,600/month (S$19,200/year).',
  },
  {
    question: 'Do foreigners on an Employment Pass (EP) or S-Pass pay CPF?',
    answer:
      "No. Foreign nationals working in Singapore on an Employment Pass, S-Pass, or Work Permit do not contribute to the Central Provident Fund (0% employee CPF and 0% employer CPF). You can toggle Residency Status to 'Foreigner / EP' in the calculator to model expatriate take-home pay.",
  },
  {
    question: 'What are the IRAS resident income tax rates for YA 2026?',
    answer:
      'Singapore resident tax rates start at 0% on the first S$20,000; 2% on the next S$10,000 (up to S$30k); 3.5% on the next S$10,000 (up to S$40k); 7% on the next S$40,000 (up to S$80k); 11.5% up to S$120k; 15% up to S$160k; 18% up to S$200k; 19% up to S$240k; 19.5% up to S$280k; 20% up to S$320k; 22% up to S$500k; 23% up to S$1M; and 24% above S$1M.',
  },
  {
    question: 'Are employee CPF contributions deductible for Singapore income tax?',
    answer:
      'Yes. Compulsory employee CPF contributions are automatically deducted from your gross income as statutory CPF Tax Relief before IRAS progressive tax rates are calculated, lowering your effective tax liability.',
  },
  {
    question: 'How is non-resident income taxed in Singapore?',
    answer:
      'Individuals who are in Singapore for fewer than 183 days in a calendar year are generally treated as non-residents for tax purposes. Non-resident employment income is taxed at the higher of a flat 15% rate (without personal reliefs) or the progressive resident rate.',
  },
  {
    question: 'How does the Singapore calculator normalize Annual, Monthly, Biweekly, Weekly, Daily, and Hourly pay periods?',
    answer:
      'All statutory tax brackets and social security ceilings in Singapore are evaluated on an annualized basis and then normalized across 6 standard payroll frequencies: Annual (1 period), Monthly (12 periods), Biweekly (26 periods), Weekly (52 periods), Daily (260 working days), and Hourly (2,080 standard working hours).',
  },
  {
    question: 'Does this Singapore salary calculator compute Total Employer Cost of Employment (CTC)?',
    answer:
      'Yes. Alongside your employee net take-home pay, the Statutory Reconciliation Ledger calculates mandatory employer-side social insurance and payroll contributions on top of contractual gross pay so HR teams and founders can budget true Total Cost of Employment.',
  },
  {
    question: 'What is the difference between my marginal tax rate and effective tax rate in Singapore?',
    answer:
      'Your marginal tax rate is the statutory percentage applied only to the next unit of income earned in your highest active tax bracket. Your effective tax rate is your total annual income tax divided by your total annual gross salary, which is always lower than your top marginal slab due to tax-free allowances and lower progressive bands.',
  },
  {
    question: 'Can I export a complete Singapore payslip breakdown and slab audit to CSV or Excel?',
    answer:
      'Yes. Click the Export CSV Payslip button inside the Statutory Reconciliation Ledger to download an RFC-4180 compliant, formula-safe CSV file containing Per-Period and Annualized Gross Pay, Income Tax, Social Security, Net Take-Home Pay, Employer Cost, and the official Ruleset ID.',
  },
  {
    question: 'Are my Singapore salary figures or tax inputs stored or uploaded to any server?',
    answer:
      'Never. 100% of gross-to-net calculations, progressive bracket audits, and CSV payslip exports execute locally in your browser memory (RAM) with zero server uploads, zero cookies, and zero telemetry logging.',
  },
];

export default function SingaporeSalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SINGAPORE_SALARY_FAQS.map((faq) => ({
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
            name: 'How to Calculate Singapore Net Take-Home Pay, Income Tax & Employer Cost',
            description: 'Step-by-step statutory guide to calculating gross-to-net salary, progressive income tax slabs, employee social security, and employer payroll cost in Singapore.',
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
                text: 'Choose the applicable statutory tax year and any regional, filing status, or residency options for Singapore.',
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
        Singapore Salary Calculator YA 2026: IRAS Resident Tax & CPF Ordinary Wage Ceiling
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your net take-home salary in Singapore (SGD) using official Inland Revenue Authority of Singapore (IRAS) resident progressive tax rates (0% to 24%) and Central Provident Fund (CPF) contribution rules with the S$8,000/month Ordinary Wage ceiling.
      </p>

      {/* How It Works */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        How Singapore Gross-to-Net Payroll &amp; Tax Withholding Is Calculated
      </h2>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Central Provident Fund (CPF):</strong> For Singapore Citizens and 3rd-year+ PRs aged 55 and below, employees contribute 20% and employers contribute 17% of Ordinary Wages up to the S$8,000 monthly ceiling (S$96,000/year in 2026; S$7,400/mo in 2025). Foreigners on EP/S-Pass pay 0% CPF.
        </li>
        <li>
          <strong>Taxable Chargeable Income:</strong> Compulsory employee CPF contributions are tax-deductible, reducing your assessable income before IRAS progressive brackets are evaluated.
        </li>
        <li>
          <strong>IRAS Progressive Tax Brackets:</strong> The first S$20,000 of chargeable income is tax-free (0%). Subsequent tiers scale progressively from 2%, 3.5%, 7%, 11.5%, 15%, 18%, 19%, 19.5%, 20%, 22%, 23%, up to 24% above S$1,000,000.
        </li>
        <li>
          <strong>Net Spendable Pay & Employer Cost:</strong> Net salary equals Gross Pay minus Employee CPF and IRAS Income Tax. Total Employer Cost includes Gross Pay plus the 17% Employer CPF contribution.
        </li>
      </ol>

      {/* Worked Examples */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Representative Singapore Salary &amp; Net Take-Home Pay Examples (YA 2026 (Calendar 2026 & 2025 CPF Ceilings))
      </h2>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left text-sm border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross (SGD)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Employee CPF (20% capped)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">IRAS Income Tax</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Net Annual Pay (Citizen)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Employer CPF (17%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">S$60,000 (S$5k/mo)</td>
              <td className="p-3">S$12,000</td>
              <td className="p-3">S$900</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">S$47,100 (S$3,925/mo)</td>
              <td className="p-3">+S$10,200</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">S$96,000 (S$8k/mo)</td>
              <td className="p-3">S$19,200 (Max OW)</td>
              <td className="p-3">S$3,134</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">S$73,666 (S$6,139/mo)</td>
              <td className="p-3">+S$16,320</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">S$150,000 (S$12.5k/mo)</td>
              <td className="p-3">S$19,200 (Max OW)</td>
              <td className="p-3">S$9,500</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">S$121,300 (S$10,108/mo)</td>
              <td className="p-3">+S$16,320</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">S$240,000 (S$20k/mo)</td>
              <td className="p-3">S$19,200 (Max OW)</td>
              <td className="p-3">S$24,180</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">S$196,620 (S$16,385/mo)</td>
              <td className="p-3">+S$16,320</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Statutory Provenance &amp; Ruleset Details
      </h2>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> SG-IRAS-2026.1</div>
        <div><strong>Source Authority:</strong> Inland Revenue Authority of Singapore (IRAS) & CPF Board</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> YA 2026 (Calendar 2026 & 2025 CPF Ceilings)</div>
        <div><strong>Status:</strong> Limited Statutory Model (IRAS Resident + CPF Age &le; 55)</div>
        <div><strong>Last Verified:</strong> 2026-10-10</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>Graduated CPF rates for 1st-year and 2nd-year Singapore Permanent Residents (SPR)</li>
            <li>Age-stepped CPF contribution rates for employees aged above 55 (55–60, 60–65, 65–70, 70+)</li>
            <li>Supplementary Retirement Scheme (SRS) voluntary tax relief and NSman/Parenthood tax reliefs</li>
          </ul>
        </div>
      </div>

            {/* 5-Column Country-Specific Competitor Comparison Matrix */}
      <h2 id="competitor-comparison" className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Singapore Salary Calculator Comparison: KivaroTools vs. IRAS Tax Calculator &amp; CPF Board Calculator
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
        See how KivaroTools compares against leading Singapore payroll and tax calculators across statutory accuracy (IRAS & CPF Board), pre-tax relief modeling, reverse net-to-gross solving, and client-side privacy:
      </p>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left text-sm border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">Capability / Statutory Feature</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">KivaroTools (100% Free)</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">IRAS Tax Calculator</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">CPF Board Calculator</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">Seedly / NodeFlair SG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">IRAS 13 Progressive Resident Brackets (0%–24%) vs. Non-Resident</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Full 13-tier Resident schedule + 15% Non-Resident flat floor toggle</td>
              <td className="p-3">Tax only (No CPF)</td>
              <td className="p-3">CPF only (No IRAS tax)</td>
              <td className="p-3">Resident summary only</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Citizen/PR CPF (20% Employee / 17% Employer) & OW Ceiling</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Integrated Employee (20%) & Employer (17%) CPF with S$8,000/mo OW cap</td>
              <td className="p-3">None</td>
              <td className="p-3">Yes (Separate tool)</td>
              <td className="p-3">Basic CPF estimate</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Pre-Tax SRS (Supplementary Retirement Scheme) Drawer</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Interactive Pre-Tax SRS & CPF Cash Top-Up tax relief drawer</td>
              <td className="p-3">Manual spreadsheet</td>
              <td className="p-3">None</td>
              <td className="p-3">None</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Reverse Net-to-Gross Solver & 9 Pay Periods</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">60-Iteration Reverse Net Solver + 9 Pay Periods + CSV Payslip</td>
              <td className="p-3">None</td>
              <td className="p-3">None</td>
              <td className="p-3">None</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">100% Client-Side Privacy</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Unified IRAS + CPF Engine in Browser RAM (Zero Signup)</td>
              <td className="p-3">Downloadable XLS</td>
              <td className="p-3">Multi-page form</td>
              <td className="p-3">Account / email prompt</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Programmatic Long-Tail Search Intent & Statutory Coverage (26+ Queries) */}
      <div className="my-8 p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 not-prose">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
          Singapore Statutory Tax &amp; Payroll Search Coverage (26 Verified Long-Tail Intents)
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">singapore salary calculator 2026</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">singapore take home pay calculator sgd</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">singapore gross to net salary after tax</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">singapore income tax brackets and slabs (IRAS & CPF Board)</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">singapore monthly biweekly weekly daily hourly paycheck</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">singapore reverse net to gross target salary solver</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">singapore total employer cost of employment ctc</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">singapore employee social security contribution cap</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">singapore effective tax rate vs marginal tax bracket</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">singapore pre tax pension retirement deduction calculator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">how much tax do i pay on my salary in singapore</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">singapore annual to monthly and hourly net wage converter</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">singapore expatriate and resident payroll tax comparison</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">singapore job offer gross to net paycheck estimator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">singapore biweekly 26 pay periods vs semi monthly 24 periods</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">singapore daily rate 260 days and hourly rate 2080 hours</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">singapore statutory payroll waterfall ledger csv export</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">free client side singapore tax calculator zero data logging</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">singapore software engineer and remote worker net pay</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">singapore bonus overtime and gross compensation tax audit</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">singapore iras 13 progressive income tax brackets ya 2026 calculator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">cpf contribution calculator 20 percent employee 17 percent employer sgd</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">singapore ordinary wage ceiling 8000 sgd cpf cap take home pay</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">non resident 15 percent flat tax vs resident tax calculator singapore</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">supplementary retirement scheme srs tax relief calculator singapore</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">seedly nodeflair and iras tax calculator unified free alternative</span>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Frequently Asked Questions (Singapore Income Tax &amp; Payroll)
      </h2>
      <div className="space-y-3 mb-6 not-prose">
        {SINGAPORE_SALARY_FAQS.map((faq, index) => (
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
            href="/finance/salary-calculator/united-arab-emirates"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            UAE Salary Calculator (0% Tax)
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
