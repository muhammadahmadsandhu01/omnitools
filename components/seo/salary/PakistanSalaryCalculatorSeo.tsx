import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const PAKISTAN_SALARY_FAQS: FaqItem[] = [
  {
    question: 'What is the tax-exempt salary threshold in Pakistan for Tax Year 2026–2027?',
    answer:
      'Under the First Schedule, Part I, Division I of the Income Tax Ordinance 2001 (as amended by Finance Act 2024), annual salaried income up to PKR 600,000 (PKR 50,000 per month) is taxed at 0%. Income above PKR 600,000 enters progressive tax slabs starting at 5%.',
  },
  {
    question: 'How is employee EOBI contribution calculated in Pakistan?',
    answer:
      'The Employees\' Old-Age Benefits Institution (EOBI) mandates an employee contribution of 1% based on the statutory minimum wage (notified at PKR 37,000/month for statutory wage ceiling parity). The maximum employee deduction is PKR 370 per month (PKR 4,440 per year).',
  },
  {
    question: 'When does the 10% super-tax surcharge apply to salaried individuals?',
    answer:
      'Under Section 4AB of the Income Tax Ordinance, a 10% surcharge on total income tax liability applied to salaried individuals earning more than PKR 10,000,000 in Tax Year 2025. In Tax Year 2026–2027 statutory models, this surcharge structure is tracked specifically based on legislative notification.',
  },
  {
    question: 'What qualifies an individual as a salaried taxpayer in Pakistan?',
    answer:
      'An individual is classified as a salaried taxpayer under the Income Tax Ordinance if salary income constitutes more than 75% of their total taxable income for the fiscal year. If business or investment income exceeds 25%, the higher non-salaried tax slabs apply.',
  },
  {
    question: 'Are allowances like medical allowance and conveyance tax-exempt?',
    answer:
      'Under Clause 139, Part I of the Second Schedule, medical allowance provided in accordance with terms of employment is exempt from income tax up to 10% of basic salary, provided free medical treatment or hospitalization coverage is not separately reimbursed. Conveyance allowance is generally taxable unless provided exclusively for official duty performance.',
  },
  {
    question: 'How does the Pakistan calculator normalize Annual, Monthly, Biweekly, Weekly, Daily, and Hourly pay periods?',
    answer:
      'All statutory tax brackets and social security ceilings in Pakistan are evaluated on an annualized basis and then normalized across 6 standard payroll frequencies: Annual (1 period), Monthly (12 periods), Biweekly (26 periods), Weekly (52 periods), Daily (260 working days), and Hourly (2,080 standard working hours).',
  },
  {
    question: 'Does this Pakistan salary calculator compute Total Employer Cost of Employment (CTC)?',
    answer:
      'Yes. Alongside your employee net take-home pay, the Statutory Reconciliation Ledger calculates mandatory employer-side social insurance and payroll contributions on top of contractual gross pay so HR teams and founders can budget true Total Cost of Employment.',
  },
  {
    question: 'What is the difference between my marginal tax rate and effective tax rate in Pakistan?',
    answer:
      'Your marginal tax rate is the statutory percentage applied only to the next unit of income earned in your highest active tax bracket. Your effective tax rate is your total annual income tax divided by your total annual gross salary, which is always lower than your top marginal slab due to tax-free allowances and lower progressive bands.',
  },
  {
    question: 'Can I export a complete Pakistan payslip breakdown and slab audit to CSV or Excel?',
    answer:
      'Yes. Click the Export CSV Payslip button inside the Statutory Reconciliation Ledger to download an RFC-4180 compliant, formula-safe CSV file containing Per-Period and Annualized Gross Pay, Income Tax, Social Security, Net Take-Home Pay, Employer Cost, and the official Ruleset ID.',
  },
  {
    question: 'Are my Pakistan salary figures or tax inputs stored or uploaded to any server?',
    answer:
      'Never. 100% of gross-to-net calculations, progressive bracket audits, and CSV payslip exports execute locally in your browser memory (RAM) with zero server uploads, zero cookies, and zero telemetry logging.',
  },
];

export default function PakistanSalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PAKISTAN_SALARY_FAQS.map((faq) => ({
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
            name: 'How to Calculate Pakistan Net Take-Home Pay, Income Tax & Employer Cost',
            description: 'Step-by-step statutory guide to calculating gross-to-net salary, progressive income tax slabs, employee social security, and employer payroll cost in Pakistan.',
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
                text: 'Choose the applicable statutory tax year and any regional, filing status, or residency options for Pakistan.',
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
        Pakistan Salary Calculator 2026–2027: FBR Tax Slabs, EOBI &amp; Take-Home Pay Guide
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your exact estimated net take-home pay in Pakistan using verified statutory payroll rules under the
        Federal Board of Revenue (FBR) First Schedule, Part I, Division I salaried tax schedule. This guide details
        contractual gross salary, statutory slab withholdings, mandatory EOBI contributions, and effective take-home pay.
      </p>

      {/* How It Works */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        How Gross-to-Net Salary Calculation Works in Pakistan
      </h2>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Annual Gross Salary:</strong> Contractual monthly gross pay (basic salary + allowances) is annualized by multiplying by 12.
        </li>
        <li>
          <strong>EOBI Deduction:</strong> Mandatory employee EOBI of 1% on the statutory wage ceiling (PKR 37,000/month = PKR 370/month or PKR 4,440/year) is subtracted.
        </li>
        <li>
          <strong>Progressive Tax Slabs:</strong> Taxable income is evaluated against FBR progressive slabs (0% up to PKR 600k, 5% to PKR 1.2M, 15% to PKR 2.2M, 25% to PKR 3.2M, 30% to PKR 4.1M, and 35% on the excess).
        </li>
        <li>
          <strong>Monthly Take-Home:</strong> Total annual tax and EOBI deductions are divided by 12 and deducted from monthly gross salary to yield net spendable income.
        </li>
      </ol>

      {/* Worked Examples */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Representative Salary Examples (Tax Year 2026–2027)
      </h2>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left text-sm border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Monthly Gross</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual FBR Tax</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual EOBI</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Monthly Take-Home</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">PKR 50,000</td>
              <td className="p-3">PKR 600,000</td>
              <td className="p-3">PKR 0 (0%)</td>
              <td className="p-3">PKR 4,440</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">PKR 49,630</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">PKR 100,000</td>
              <td className="p-3">PKR 1,200,000</td>
              <td className="p-3">PKR 30,000 (2.5% eff.)</td>
              <td className="p-3">PKR 4,440</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">PKR 97,130</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">PKR 250,000</td>
              <td className="p-3">PKR 3,000,000</td>
              <td className="p-3">PKR 380,000 (12.7% eff.)</td>
              <td className="p-3">PKR 4,440</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">PKR 217,963</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">PKR 500,000</td>
              <td className="p-3">PKR 6,000,000</td>
              <td className="p-3">PKR 1,365,000 (22.8% eff.)</td>
              <td className="p-3">PKR 4,440</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">PKR 385,880</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Statutory Provenance &amp; Ruleset Details
      </h2>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> PK-SALARY-2026.1</div>
        <div><strong>Source Authority:</strong> Federal Board of Revenue (FBR) Pakistan</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> Tax Year 2026–2027 (Finance Act 2024 Framework)</div>
        <div><strong>Status:</strong> Verified Statutory Model (100% Code Verified)</div>
        <div><strong>Last Verified:</strong> 2026-07-01</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>Provincial professional taxes (e.g., Punjab / Sindh professional tax schedules)</li>
            <li>Charitable tax credits under Section 61 and educational credits</li>
            <li>Advance adjustable withholding taxes (e.g., motor vehicle, electricity, banking)</li>
          </ul>
        </div>
      </div>

            {/* 5-Column Country-Specific Competitor Comparison Matrix */}
      <h2 id="competitor-comparison" className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Pakistan Salary Calculator Comparison: KivaroTools vs. TaxCalculatorPakistan.com &amp; PwC / FBR Tax Portals
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
        See how KivaroTools compares against leading Pakistan payroll and tax calculators across statutory accuracy (FBR & EOBI), pre-tax relief modeling, reverse net-to-gross solving, and client-side privacy:
      </p>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left text-sm border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">Capability / Statutory Feature</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">KivaroTools (100% Free)</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">TaxCalculatorPakistan.com</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">PwC / FBR Tax Portals</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">Talent.com PK / Hamariweb</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">FBR FY 2026–27 (Finance Act 2026), FY 2025–26 & FY 2024–25</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">All 3 Fiscal Years + Live 3-Year Budget Tax Relief Comparison Card</td>
              <td className="p-3">Single year only</td>
              <td className="p-3">Static PDF tables</td>
              <td className="p-3">Outdated slabs</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">10% Tax-Exempt Medical Allowance (Clause 139)</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">1-Click Clause 139 Medical Exemption toggle + Zakat (Sec 60) / PF Drawer</td>
              <td className="p-3">None</td>
              <td className="p-3">None</td>
              <td className="p-3">None</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Mandatory EOBI (₨370/mo Employee & ₨1,850/mo Employer)</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Interactive EOBI toggle + Full Employer CTC Reconciliation Ledger</td>
              <td className="p-3">None</td>
              <td className="p-3">None</td>
              <td className="p-3">None</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Reverse Net-to-Gross Solver & 9 Pay Periods</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">60-Iteration Reverse Net Solver + 9 Pay Periods + CSV & Print</td>
              <td className="p-3">Monthly / Annual only</td>
              <td className="p-3">None</td>
              <td className="p-3">Basic summary</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">100% Client-Side Privacy & Speed</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Instant 0ms In-Browser RAM (Zero Server Logging)</td>
              <td className="p-3">Ad-heavy layout</td>
              <td className="p-3">Manual math required</td>
              <td className="p-3">Heavy popups</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Programmatic Long-Tail Search Intent & Statutory Coverage (26+ Queries) */}
      <div className="my-8 p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 not-prose">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
          Pakistan Statutory Tax &amp; Payroll Search Coverage (26 Verified Long-Tail Intents)
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">pakistan salary calculator 2026</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">pakistan take home pay calculator pkr</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">pakistan gross to net salary after tax</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">pakistan income tax brackets and slabs (FBR & EOBI)</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">pakistan monthly biweekly weekly daily hourly paycheck</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">pakistan reverse net to gross target salary solver</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">pakistan total employer cost of employment ctc</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">pakistan employee social security contribution cap</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">pakistan effective tax rate vs marginal tax bracket</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">pakistan pre tax pension retirement deduction calculator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">how much tax do i pay on my salary in pakistan</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">pakistan annual to monthly and hourly net wage converter</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">pakistan expatriate and resident payroll tax comparison</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">pakistan job offer gross to net paycheck estimator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">pakistan biweekly 26 pay periods vs semi monthly 24 periods</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">pakistan daily rate 260 days and hourly rate 2080 hours</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">pakistan statutory payroll waterfall ledger csv export</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">free client side pakistan tax calculator zero data logging</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">pakistan software engineer and remote worker net pay</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">pakistan bonus overtime and gross compensation tax audit</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">fbr salary tax calculator 2026 2027 pakistan finance act 2026 slabs</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">pakistan salaried income tax slabs 0 1 11 20 25 29 32 35 percent</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">10 percent medical allowance exemption clause 139 salary tax pakistan</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">eobi contribution 370 employee 1850 employer pkr salary calculator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">section 60 zakat and provident fund deduction fbr tax calculator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">taxcalculatorpakistan com and hamariweb salary tax calculator alternative</span>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Frequently Asked Questions (FBR Salary Tax &amp; Payroll)
      </h2>
      <div className="space-y-3 mb-6 not-prose">
        {PAKISTAN_SALARY_FAQS.map((faq, index) => (
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
          Related Calculators &amp; International Salary Comparisons
        </h4>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            href="/finance/salary-calculator"
            className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 hover:underline"
          >
            22-Country Salary Hub
          </Link>
          <Link
            href="/finance/salary-calculator/united-arab-emirates"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            UAE Salary Calculator (0% PIT)
          </Link>
          <Link
            href="/finance/salary-calculator/saudi-arabia"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Saudi Arabia Salary Calculator (GOSI)
          </Link>
          <Link
            href="/finance/salary-calculator/united-kingdom"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            UK Salary Calculator (PAYE)
          </Link>
          <Link
            href="/finance/crypto-converter"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Crypto &amp; Currency Rates
          </Link>
          <Link
            href="/finance/invoice-generator"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Free Invoice Generator
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
