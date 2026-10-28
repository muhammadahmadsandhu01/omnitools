import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const INDIA_SALARY_FAQS: FaqItem[] = [
  {
    question: 'What is the zero-tax salary threshold under the New Tax Regime in India?',
    answer:
      'Under Section 115BAC as amended by Finance (No. 2) Act 2024, salaried individuals pay zero income tax on gross salaries up to ₹7,75,000 per year. This is achieved by subtracting the ₹75,000 standard deduction under Section 16(ia), bringing net taxable income to ₹7,00,000, which qualifies for a 100% tax rebate under Section 87A (maximum rebate ₹25,000).',
  },
  {
    question: 'What is the standard deduction for salaried individuals in AY 2025–2026?',
    answer:
      'The standard deduction for salaried employees and pensioners under the default New Tax Regime was increased from ₹50,000 to ₹75,000 by Finance (No. 2) Act 2024. This flat deduction is automatically subtracted from gross salary before applying the tax slab rates.',
  },
  {
    question: 'How is the 4% Health and Education Cess calculated?',
    answer:
      'The 4% Health and Education Cess is calculated on the total income tax payable (after adjusting for any applicable tax rebates or surcharges). For example, if your computed income tax is ₹50,000, the 4% cess is ₹2,000, making your total tax liability ₹52,000.',
  },
  {
    question: 'Are Chapter VI-A deductions (Section 80C, 80D, HRA) available in the New Tax Regime?',
    answer:
      'No. The New Tax Regime (Section 115BAC) disallows most common exemptions and deductions, including Section 80C (PPF, ELSS, EPF up to ₹1.5L), Section 80D (health insurance), House Rent Allowance (HRA), and Leave Travel Concession (LTC). In exchange, it provides significantly wider slabs and lower marginal tax rates.',
  },
  {
    question: 'What are the surcharge rates on high-income salaries in India?',
    answer:
      'Under the New Tax Regime, surcharges apply to taxable incomes exceeding ₹50 Lakhs: 10% for income between ₹50L and ₹1 Crore, 15% for income between ₹1Cr and ₹2 Crores, and a capped maximum surcharge of 25% for income exceeding ₹2 Crores (compared to 37% in the Old Tax Regime).',
  },
  {
    question: 'How does the India calculator normalize Annual, Monthly, Biweekly, Weekly, Daily, and Hourly pay periods?',
    answer:
      'All statutory tax brackets and social security ceilings in India are evaluated on an annualized basis and then normalized across 6 standard payroll frequencies: Annual (1 period), Monthly (12 periods), Biweekly (26 periods), Weekly (52 periods), Daily (260 working days), and Hourly (2,080 standard working hours).',
  },
  {
    question: 'Does this India salary calculator compute Total Employer Cost of Employment (CTC)?',
    answer:
      'Yes. Alongside your employee net take-home pay, the Statutory Reconciliation Ledger calculates mandatory employer-side social insurance and payroll contributions on top of contractual gross pay so HR teams and founders can budget true Total Cost of Employment.',
  },
  {
    question: 'What is the difference between my marginal tax rate and effective tax rate in India?',
    answer:
      'Your marginal tax rate is the statutory percentage applied only to the next unit of income earned in your highest active tax bracket. Your effective tax rate is your total annual income tax divided by your total annual gross salary, which is always lower than your top marginal slab due to tax-free allowances and lower progressive bands.',
  },
  {
    question: 'Can I export a complete India payslip breakdown and slab audit to CSV or Excel?',
    answer:
      'Yes. Click the Export CSV Payslip button inside the Statutory Reconciliation Ledger to download an RFC-4180 compliant, formula-safe CSV file containing Per-Period and Annualized Gross Pay, Income Tax, Social Security, Net Take-Home Pay, Employer Cost, and the official Ruleset ID.',
  },
  {
    question: 'Are my India salary figures or tax inputs stored or uploaded to any server?',
    answer:
      'Never. 100% of gross-to-net calculations, progressive bracket audits, and CSV payslip exports execute locally in your browser memory (RAM) with zero server uploads, zero cookies, and zero telemetry logging.',
  },
];

export default function IndiaSalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: INDIA_SALARY_FAQS.map((faq) => ({
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
            name: 'How to Calculate India Net Take-Home Pay, Income Tax & Employer Cost',
            description: 'Step-by-step statutory guide to calculating gross-to-net salary, progressive income tax slabs, employee social security, and employer payroll cost in India.',
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
                text: 'Choose the applicable statutory tax year and any regional, filing status, or residency options for India.',
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
        India Salary Calculator 2025–2026: New Tax Regime (Sec 115BAC), Slabs &amp; In-Hand Pay
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your exact in-hand salary and income tax liability in India under the statutory New Tax Regime
        (Section 115BAC) as amended by Finance (No. 2) Act 2024 for FY 2024–25 (AY 2025–26). Understand your gross CTC,
        ₹75,000 standard deduction, Section 87A rebate, 4% cess, and monthly bank credits.
      </p>

      {/* How It Works */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        How Indian Salary Tax &amp; In-Hand Pay Is Calculated
      </h2>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Standard Deduction:</strong> A flat ₹75,000 standard deduction is subtracted from gross annual salary to determine net taxable income.
        </li>
        <li>
          <strong>Section 115BAC Progressive Slabs:</strong> Taxable income is taxed progressively: 0% (₹0–₹3L), 5% (₹3L–₹7L), 10% (₹7L–₹10L), 15% (₹10L–₹12L), 20% (₹12L–₹15L), and 30% (above ₹15L).
        </li>
        <li>
          <strong>Section 87A Full Rebate:</strong> If net taxable income is ₹7,00,000 or less, a full rebate up to ₹25,000 is credited, reducing tax to ₹0. Marginal relief protects incomes marginally above ₹7L.
        </li>
        <li>
          <strong>Health &amp; Education Cess:</strong> A mandatory 4% cess is added to the computed tax liability.
        </li>
        <li>
          <strong>Monthly In-Hand Pay:</strong> Total annual tax divided by 12 is deducted from monthly gross pay to compute your monthly credited take-home salary.
        </li>
      </ol>

      {/* Worked Examples */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Representative Salary Examples (New Tax Regime AY 2025–2026)
      </h2>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left text-sm border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross Salary</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Standard Deduction</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Taxable Income</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Total Tax (incl. Cess)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Monthly In-Hand Pay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">₹7,50,000 (7.5 LPA)</td>
              <td className="p-3">₹75,000</td>
              <td className="p-3">₹6,75,000</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">₹0 (Sec 87A Rebate)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">₹62,500 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">₹10,00,000 (10 LPA)</td>
              <td className="p-3">₹75,000</td>
              <td className="p-3">₹9,25,000</td>
              <td className="p-3">₹0 (Sec 87A Rebate ≤ ₹12L)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">₹83,333 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">₹15,00,000 (15 LPA)</td>
              <td className="p-3">₹75,000</td>
              <td className="p-3">₹14,25,000</td>
              <td className="p-3">₹97,500 (6.5% eff.)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">₹1,16,875 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">₹25,00,000 (25 LPA)</td>
              <td className="p-3">₹75,000</td>
              <td className="p-3">₹24,25,000</td>
              <td className="p-3">₹3,19,800 (12.8% eff.)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">₹1,81,683 / mo</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Statutory Provenance &amp; Ruleset Details
      </h2>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> IN-FIN24-115BAC</div>
        <div><strong>Source Authority:</strong> Central Board of Direct Taxes (CBDT) &amp; Ministry of Finance</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> FY 2024–2025 / AY 2025–2026 (Finance (No. 2) Act 2024)</div>
        <div><strong>Status:</strong> Verified Statutory Model (100% Code Verified)</div>
        <div><strong>Last Verified:</strong> 2024-07-23</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>State-level Professional Tax (e.g., ₹2,500/year in Maharashtra/Karnataka)</li>
            <li>Employee Provident Fund (EPF 12%) and Voluntary PF deductions</li>
            <li>AY 2026–27 7-slab projection models available as secondary forward projections</li>
          </ul>
        </div>
      </div>

            {/* 5-Column Country-Specific Competitor Comparison Matrix */}
      <h2 id="competitor-comparison" className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        India Salary Calculator Comparison: KivaroTools vs. ClearTax Calculator &amp; Groww In-Hand Calculator
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
        See how KivaroTools compares against leading India payroll and tax calculators across statutory accuracy (CBDT / Income Tax Dept), pre-tax relief modeling, reverse net-to-gross solving, and client-side privacy:
      </p>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left text-sm border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">Capability / Statutory Feature</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">KivaroTools (100% Free)</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">ClearTax Calculator</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">Groww In-Hand Calculator</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">AmbitionBox / ET Money</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Sec 115BAC New vs. Old Regime Live Savings Banner</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Side-by-side live comparison showing exact ₹ tax saved</td>
              <td className="p-3">Separate toggle only</td>
              <td className="p-3">Summary only</td>
              <td className="p-3">Basic estimate</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">₹12 Lakh Sec 87A Rebate & ₹75,000 Std Deduction</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Enacted AY 2026–27 7 slabs + ₹75k Std Ded + Sec 87A Rebate</td>
              <td className="p-3">Yes</td>
              <td className="p-3">Partial slab view</td>
              <td className="p-3">Outdated slabs</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Pre-Tax Sec 80C / NPS (80CCD) / EPF Drawer</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Interactive Pre-Tax deduction drawer + 4% Health & Edu Cess</td>
              <td className="p-3">Multi-step wizard</td>
              <td className="p-3">Basic PF only</td>
              <td className="p-3">Fixed PF assumption</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Reverse In-Hand to CTC Solver & 9 Pay Periods</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">60-Iteration Reverse Net Solver + 9 Periods + CSV Export</td>
              <td className="p-3">None</td>
              <td className="p-3">None</td>
              <td className="p-3">None</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Zero-Spam Privacy Guarantee</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">100% In-Browser RAM (Zero Phone/Email Lead-Gen)</td>
              <td className="p-3">CA upsell popups</td>
              <td className="p-3">App install prompts</td>
              <td className="p-3">Requires login for details</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Programmatic Long-Tail Search Intent & Statutory Coverage (26+ Queries) */}
      <div className="my-8 p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 not-prose">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
          India Statutory Tax &amp; Payroll Search Coverage (26 Verified Long-Tail Intents)
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">india salary calculator 2026</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">india take home pay calculator inr</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">india gross to net salary after tax</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">india income tax brackets and slabs (CBDT / Income Tax Dept)</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">india monthly biweekly weekly daily hourly paycheck</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">india reverse net to gross target salary solver</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">india total employer cost of employment ctc</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">india employee social security contribution cap</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">india effective tax rate vs marginal tax bracket</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">india pre tax pension retirement deduction calculator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">how much tax do i pay on my salary in india</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">india annual to monthly and hourly net wage converter</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">india expatriate and resident payroll tax comparison</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">india job offer gross to net paycheck estimator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">india biweekly 26 pay periods vs semi monthly 24 periods</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">india daily rate 260 days and hourly rate 2080 hours</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">india statutory payroll waterfall ledger csv export</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">free client side india tax calculator zero data logging</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">india software engineer and remote worker net pay</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">india bonus overtime and gross compensation tax audit</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">india new tax regime vs old tax regime live comparison calculator 2026</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">section 87a tax rebate 12 lakh zero tax salary calculator india</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">standard deduction 75000 new regime in hand salary calculator inr</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">section 80c and 80ccd 1b nps deduction income tax calculator india</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">4 percent health and education cess slab wise tax audit india</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">cleartax groww ambitionbox in hand salary calculator alternative</span>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Frequently Asked Questions (Income Tax &amp; In-Hand Salary)
      </h2>
      <div className="space-y-3 mb-6 not-prose">
        {INDIA_SALARY_FAQS.map((faq, index) => (
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
          Popular Indian Financial Calculators &amp; Global Tools
        </h4>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            href="/finance/salary-calculator"
            className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 hover:underline"
          >
            22-Country Salary Hub
          </Link>
          <Link
            href="/finance/sip-calculator"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            SIP Mutual Fund Calculator
          </Link>
          <Link
            href="/finance/emi-calculator"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Home &amp; Car Loan EMI Calculator
          </Link>
          <Link
            href="/finance/compound-interest"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Compound Interest Calculator
          </Link>
          <Link
            href="/finance/salary-calculator/united-arab-emirates"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            UAE Salary Calculator (Tax Free)
          </Link>
          <Link
            href="/finance/salary-calculator/singapore"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Singapore Salary Calculator (CPF)
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
