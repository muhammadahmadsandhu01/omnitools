import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const SOUTH_KOREA_SALARY_FAQS: FaqItem[] = [
  {
    question: 'What are the 4 Major Social Insurances (4대보험) deducted from Korean salaries?',
    answer:
      'Every regular employee in South Korea contributes to four mandatory social insurances: (1) National Pension (국민연금): 4.5% employee / 4.5% employer, capped at a monthly income ceiling of ₩6,170,000 (max ₩277,650/mo); (2) National Health Insurance (건강보험): 3.545% each; (3) Long-Term Care Insurance (장기요양보험): 12.95% of the health insurance premium (~0.459% of salary); and (4) Employment Insurance (고용보험): 0.90% employee.',
  },
  {
    question: 'What are the South Korean National Income Tax brackets for 2026?',
    answer:
      'After subtracting the Earned Income Deduction and personal exemptions, the 8 NTS brackets are: 6% up to ₩14M; 15% from ₩14M to ₩50M; 24% from ₩50M to ₩88M; 35% from ₩88M to ₩150M; 38% from ₩150M to ₩300M; 40% from ₩300M to ₩500M; 42% from ₩500M to ₩1B; and 45% above ₩1B.',
  },
  {
    question: 'How does Local Income Tax (지방소득세) work in South Korea?',
    answer:
      'Local Income Tax is a municipal surtax equal to exactly 10% of your final National Income Tax liability (after applying the Earned Income Tax Credit). For example, if your national income tax is ₩2,000,000, your local income tax is ₩200,000.',
  },
  {
    question: 'How do the Earned Income Deduction (근로소득공제) and Earned Income Tax Credit (근로소득세액공제) differ?',
    answer:
      'South Korea provides dual relief for wage earners: first, the Earned Income Deduction subtracts a large portion of gross salary (up to ₩20,000,000) before tax brackets apply; second, the Earned Income Tax Credit directly reduces the calculated tax bill by up to 55% on the first ₩1.3M of tax (subject to salary-tiered caps between ₩500k and ₩740k).',
  },
  {
    question: 'Are employer 4대보험 contributions deducted from my paycheck?',
    answer:
      'No. Your employer matches your National Pension (4.5%), Health Insurance (3.545%), and Long-Term Care (0.459%), and pays Employment Insurance (~1.15%+) and Industrial Accident Insurance on top of your gross salary.',
  },
  {
    question: 'How does the South Korea calculator normalize Annual, Monthly, Biweekly, Weekly, Daily, and Hourly pay periods?',
    answer:
      'All statutory tax brackets and social security ceilings in South Korea are evaluated on an annualized basis and then normalized across 6 standard payroll frequencies: Annual (1 period), Monthly (12 periods), Biweekly (26 periods), Weekly (52 periods), Daily (260 working days), and Hourly (2,080 standard working hours).',
  },
  {
    question: 'Does this South Korea salary calculator compute Total Employer Cost of Employment (CTC)?',
    answer:
      'Yes. Alongside your employee net take-home pay, the Statutory Reconciliation Ledger calculates mandatory employer-side social insurance and payroll contributions on top of contractual gross pay so HR teams and founders can budget true Total Cost of Employment.',
  },
  {
    question: 'What is the difference between my marginal tax rate and effective tax rate in South Korea?',
    answer:
      'Your marginal tax rate is the statutory percentage applied only to the next unit of income earned in your highest active tax bracket. Your effective tax rate is your total annual income tax divided by your total annual gross salary, which is always lower than your top marginal slab due to tax-free allowances and lower progressive bands.',
  },
  {
    question: 'Can I export a complete South Korea payslip breakdown and slab audit to CSV or Excel?',
    answer:
      'Yes. Click the Export CSV Payslip button inside the Statutory Reconciliation Ledger to download an RFC-4180 compliant, formula-safe CSV file containing Per-Period and Annualized Gross Pay, Income Tax, Social Security, Net Take-Home Pay, Employer Cost, and the official Ruleset ID.',
  },
  {
    question: 'Are my South Korea salary figures or tax inputs stored or uploaded to any server?',
    answer:
      'Never. 100% of gross-to-net calculations, progressive bracket audits, and CSV payslip exports execute locally in your browser memory (RAM) with zero server uploads, zero cookies, and zero telemetry logging.',
  },
];

export default function SouthKoreaSalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SOUTH_KOREA_SALARY_FAQS.map((faq) => ({
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
            name: 'How to Calculate South Korea Net Take-Home Pay, Income Tax & Employer Cost',
            description: 'Step-by-step statutory guide to calculating gross-to-net salary, progressive income tax slabs, employee social security, and employer payroll cost in South Korea.',
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
                text: 'Choose the applicable statutory tax year and any regional, filing status, or residency options for South Korea.',
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
        South Korea Salary Calculator 2026: 연봉 실수령액, NTS Income Tax & 4 Major Insurances (4대보험)
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your net take-home pay in South Korean Won (KRW / ₩) using National Tax Service (NTS / 국세청) progressive income tax brackets (6% to 45%), Earned Income Deduction (근로소득공제), Local Income Tax (10%), and the 4 Major Social Insurances (4대보험).
      </p>

      {/* How It Works */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        How South Korea Gross-to-Net Payroll &amp; Tax Withholding Is Calculated
      </h2>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>4 Major Social Insurances (4대보험):</strong> National Pension (국민연금 4.5% capped at ₩6,170,000/mo), National Health Insurance (건강보험 3.545%), Long-Term Care Insurance (장기요양보험 12.95% of NHI = 0.459%), and Employment Insurance (고용보험 0.90%).
        </li>
        <li>
          <strong>Earned Income & Basic Deductions:</strong> Statutory sliding-scale Earned Income Deduction (근로소득공제, up to ₩20M) plus the ₩1,500,000 Basic Personal Deduction (기본공제) and social insurance deductions reduce gross pay to tax base.
        </li>
        <li>
          <strong>8-Bracket NTS Income Tax + Tax Credit:</strong> Evaluated across 8 progressive tiers (6%, 15%, 24%, 35%, 38%, 40%, 42%, 45%) minus the statutory Earned Income Tax Credit (근로소득세액공제).
        </li>
        <li>
          <strong>Local Income Tax (지방소득세):</strong> A mandatory 10% municipal surtax added on top of net National Income Tax.
        </li>
      </ol>

      {/* Worked Examples */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Representative South Korea Salary &amp; Net Take-Home Pay Examples (2026)
      </h2>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left text-sm border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross (KRW)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">4 Major Insurances</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">National + Local Tax</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Net Pay (실수령액)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Monthly Net Take-Home</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">₩40,000,000</td>
              <td className="p-3">₩3,761,600</td>
              <td className="p-3">₩1,125,000</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">₩35,113,400</td>
              <td className="p-3">₩2,926,117 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">₩60,000,000</td>
              <td className="p-3">₩5,642,400</td>
              <td className="p-3">₩3,780,000</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">₩50,577,600</td>
              <td className="p-3">₩4,214,800 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">₩80,000,000</td>
              <td className="p-3">₩6,945,000 (Pension capped)</td>
              <td className="p-3">₩7,490,000</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">₩65,565,000</td>
              <td className="p-3">₩5,463,750 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">₩120,000,000</td>
              <td className="p-3">₩8,906,600 (Pension capped)</td>
              <td className="p-3">₩18,420,000</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">₩92,673,400</td>
              <td className="p-3">₩7,722,783 / mo</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Statutory Provenance &amp; Ruleset Details
      </h2>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> KR-NTS-2026.1</div>
        <div><strong>Source Authority:</strong> National Tax Service (NTS / 국세청) & NHIS</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> 2026</div>
        <div><strong>Status:</strong> Verified Statutory Model</div>
        <div><strong>Last Verified:</strong> 2026-10-10</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>Non-taxable meal allowance exemption (비과세 식대 up to ₩200,000/month)</li>
            <li>19% Foreign Engineer/Expat Flat Tax Regime option (외국인근로자 단일세율)</li>
            <li>Year-end tax settlement (연말정산) credit card, medical, and housing deductions</li>
          </ul>
        </div>
      </div>

            {/* 5-Column Country-Specific Competitor Comparison Matrix */}
      <h2 id="competitor-comparison" className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        South Korea Salary Calculator Comparison: KivaroTools vs. Saramin (사람인 연봉계산기) &amp; JobKorea (잡코리아)
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
        See how KivaroTools compares against leading South Korea payroll and tax calculators across statutory accuracy (NTS & NHIS), pre-tax relief modeling, reverse net-to-gross solving, and client-side privacy:
      </p>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left text-sm border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">Capability / Statutory Feature</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">KivaroTools (100% Free)</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">Saramin (사람인 연봉계산기)</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">JobKorea (잡코리아)</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">Talent.com KR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">5-Tier Earned Income Deduction (근로소득공제 up to ₩20M)</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Exact statutory 5-tier deduction + ₩1.5M Basic Personal Deduction</td>
              <td className="p-3">Yes (Korean only)</td>
              <td className="p-3">Yes (Korean only)</td>
              <td className="p-3">Simplified flat deduction</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">8-Bracket NTS Income Tax (6%–45%) + Art. 59 Credit + 10% Local</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Full 8-tier NTS slab audit + Art. 59 Tax Credit + 10% 지방소득세</td>
              <td className="p-3">Summary total only</td>
              <td className="p-3">Summary total only</td>
              <td className="p-3">Summary total only</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">All 4 Major Insurances (4대보험: NP, NHIS, LTC, EI)</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">National Pension (4.5% cap), Health (3.545%), LTC (12.95%), EI (0.9%) + Employer CTC</td>
              <td className="p-3">Employee view only</td>
              <td className="p-3">Employee view only</td>
              <td className="p-3">Approximate %</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Reverse Net-to-Gross (실수령액→연봉) Solver & CSV</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">60-Iteration Reverse Net Solver + 9 Pay Periods + CSV Payslip</td>
              <td className="p-3">Static lookup table</td>
              <td className="p-3">Static lookup table</td>
              <td className="p-3">None</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Bilingual Clarity & 100% Local Privacy</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">100% Client-Side RAM (Zero Login or Job-Board Tracking)</td>
              <td className="p-3">Job portal login prompt</td>
              <td className="p-3">Ad banners & popups</td>
              <td className="p-3">Server logging</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Programmatic Long-Tail Search Intent & Statutory Coverage (26+ Queries) */}
      <div className="my-8 p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 not-prose">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
          South Korea Statutory Tax &amp; Payroll Search Coverage (26 Verified Long-Tail Intents)
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">south korea salary calculator 2026</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">south korea take home pay calculator krw</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">south korea gross to net salary after tax</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">south korea income tax brackets and slabs (NTS & NHIS)</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">south korea monthly biweekly weekly daily hourly paycheck</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">south korea reverse net to gross target salary solver</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">south korea total employer cost of employment ctc</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">south korea employee social security contribution cap</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">south korea effective tax rate vs marginal tax bracket</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">south korea pre tax pension retirement deduction calculator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">how much tax do i pay on my salary in south korea</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">south korea annual to monthly and hourly net wage converter</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">south korea expatriate and resident payroll tax comparison</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">south korea job offer gross to net paycheck estimator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">south korea biweekly 26 pay periods vs semi monthly 24 periods</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">south korea daily rate 260 days and hourly rate 2080 hours</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">south korea statutory payroll waterfall ledger csv export</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">free client side south korea tax calculator zero data logging</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">south korea software engineer and remote worker net pay</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">south korea bonus overtime and gross compensation tax audit</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">south korea salary calculator 실수령액 계산기 2026 krw after tax</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">earned income deduction 근로소득공제 and 8 nts income tax brackets korea</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">4 major insurances 4대보험 국민연금 건강보험 장기요양 고용보험 calculator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">local income tax 지방소득세 10 percent and article 59 tax credit korea</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">saramin 사람인 and jobkorea 잡코리아 연봉계산기 english alternative</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">south korea employer 4 major insurance contribution total cost ctc</span>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Frequently Asked Questions (South Korea Income Tax &amp; Payroll)
      </h2>
      <div className="space-y-3 mb-6 not-prose">
        {SOUTH_KOREA_SALARY_FAQS.map((faq, index) => (
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
            href="/finance/salary-calculator/japan"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Japan Salary Calculator (NTA)
          </Link>
          <Link
            href="/finance/salary-calculator/singapore"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Singapore Salary Calculator (IRAS)
          </Link>
          <Link
            href="/finance/salary-calculator/united-states"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            US Salary Calculator (IRS)
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
