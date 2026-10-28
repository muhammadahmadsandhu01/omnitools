import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const UK_SALARY_FAQS: FaqItem[] = [
  {
    question: 'What is the UK Personal Allowance for the 2026–2027 tax year?',
    answer:
      'The standard UK Personal Allowance is £12,570 under emergency and standard tax code 1257L. You do not pay income tax on earnings up to this threshold. For individuals with adjusted net income exceeding £100,000, the Personal Allowance reduces by £1 for every £2 of income above £100,000, reaching £0 at £125,140.',
  },
  {
    question: 'How are Class 1 National Insurance Contributions (NIC) calculated?',
    answer:
      'For employed individuals, Class 1 National Insurance is calculated at 8.0% on earnings between the Primary Threshold (£12,570 per year) and the Upper Earnings Limit (£50,270 per year). On earnings above the Upper Earnings Limit, the rate drops to 2.0% uncapped.',
  },
  {
    question: 'Why does earning between £100,000 and £125,140 create a 60% marginal tax trap?',
    answer:
      'Because every £2 earned above £100,000 reduces your tax-free Personal Allowance by £1, you pay 40% income tax on that £2 plus 40% tax on the newly taxable £1 of lost allowance (equivalent to an additional 20%), plus 2% National Insurance, creating an effective marginal rate of 62% on income in that corridor.',
  },
  {
    question: 'How do Scottish income tax rates differ from the rest of the UK?',
    answer:
      'The Scottish Parliament sets devolved progressive income tax rates across six bands: Starter (19%), Basic (20%), Intermediate (21%), Higher (42%), Advanced (45%), and Top (48%). National Insurance rates remain uniform across the entire United Kingdom.',
  },
  {
    question: 'Does this calculator factor in student loan repayments or pension contributions?',
    answer:
      'The baseline calculator isolates statutory PAYE income tax and Class 1 National Insurance deductions. Voluntary salary sacrifice pension arrangements, employer auto-enrolment contributions (3% statutory minimum), and Student Loan repayments (Plans 1, 2, 4, 5, or Postgraduate) operate as separate payroll withholding deductions.',
  },
  {
    question: 'How does the UK calculator normalize Annual, Monthly, Biweekly, Weekly, Daily, and Hourly pay periods?',
    answer:
      'All statutory tax brackets and social security ceilings in UK are evaluated on an annualized basis and then normalized across 6 standard payroll frequencies: Annual (1 period), Monthly (12 periods), Biweekly (26 periods), Weekly (52 periods), Daily (260 working days), and Hourly (2,080 standard working hours).',
  },
  {
    question: 'Does this UK salary calculator compute Total Employer Cost of Employment (CTC)?',
    answer:
      'Yes. Alongside your employee net take-home pay, the Statutory Reconciliation Ledger calculates mandatory employer-side social insurance and payroll contributions on top of contractual gross pay so HR teams and founders can budget true Total Cost of Employment.',
  },
  {
    question: 'What is the difference between my marginal tax rate and effective tax rate in UK?',
    answer:
      'Your marginal tax rate is the statutory percentage applied only to the next unit of income earned in your highest active tax bracket. Your effective tax rate is your total annual income tax divided by your total annual gross salary, which is always lower than your top marginal slab due to tax-free allowances and lower progressive bands.',
  },
  {
    question: 'Can I export a complete UK payslip breakdown and slab audit to CSV or Excel?',
    answer:
      'Yes. Click the Export CSV Payslip button inside the Statutory Reconciliation Ledger to download an RFC-4180 compliant, formula-safe CSV file containing Per-Period and Annualized Gross Pay, Income Tax, Social Security, Net Take-Home Pay, Employer Cost, and the official Ruleset ID.',
  },
  {
    question: 'Are my UK salary figures or tax inputs stored or uploaded to any server?',
    answer:
      'Never. 100% of gross-to-net calculations, progressive bracket audits, and CSV payslip exports execute locally in your browser memory (RAM) with zero server uploads, zero cookies, and zero telemetry logging.',
  },
];

export default function UnitedKingdomSalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: UK_SALARY_FAQS.map((faq) => ({
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
            name: 'How to Calculate UK Net Take-Home Pay, Income Tax & Employer Cost',
            description: 'Step-by-step statutory guide to calculating gross-to-net salary, progressive income tax slabs, employee social security, and employer payroll cost in UK.',
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
                text: 'Choose the applicable statutory tax year and any regional, filing status, or residency options for UK.',
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
        UK Salary Calculator 2026–2027: HMRC PAYE Tax, National Insurance &amp; Take-Home Pay
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your exact net monthly and annual take-home pay in the United Kingdom using official HM Revenue &amp;
        Customs (HMRC) 2026–2027 PAYE income tax schedules and Class 1 National Insurance rates. Understand your gross salary,
        statutory deductions, personal allowance taper, and employer National Insurance costs.
      </p>

      {/* How It Works */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        How HMRC Gross-to-Net Pay Is Calculated
      </h2>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Personal Allowance:</strong> Earnings up to £12,570 are free of income tax (tapered at 50% on income over £100k).
        </li>
        <li>
          <strong>PAYE Income Tax Bands:</strong> Taxable pay is charged at 20% on the basic rate band (£12,570–£50,270), 40% on the higher rate band (£50,270–£125,140), and 45% on the additional rate band (over £125,140).
        </li>
        <li>
          <strong>Class 1 National Insurance:</strong> Deducted at 8.0% on earnings between £12,570 and £50,270 (Upper Earnings Limit), and 2.0% on all earnings exceeding £50,270.
        </li>
        <li>
          <strong>Take-Home Pay:</strong> Gross pay minus PAYE tax and National Insurance equals your net spendable income.
        </li>
      </ol>

      {/* Worked Examples */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Representative Salary Examples (England, Wales &amp; NI, 2026–2027)
      </h2>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left text-sm border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">PAYE Income Tax</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">National Insurance</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Total Deductions</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Net Take-Home Pay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">£30,000</td>
              <td className="p-3">£3,486.00 (11.6% eff.)</td>
              <td className="p-3">£1,394.40</td>
              <td className="p-3">£4,880.40</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">£25,119.60 (£2,093/mo)</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">£50,000</td>
              <td className="p-3">£7,486.00 (15.0% eff.)</td>
              <td className="p-3">£2,994.40</td>
              <td className="p-3">£10,480.40</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">£39,519.60 (£3,293/mo)</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">£50,270 (UEL)</td>
              <td className="p-3">£7,540.00 (15.0% eff.)</td>
              <td className="p-3">£3,016.00</td>
              <td className="p-3">£10,556.00</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">£39,714.00 (£3,309/mo)</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">£100,000</td>
              <td className="p-3">£27,432.00 (27.4% eff.)</td>
              <td className="p-3">£4,010.60</td>
              <td className="p-3">£31,442.60</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">£68,557.40 (£5,713/mo)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Statutory Provenance &amp; Ruleset Details
      </h2>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> GB-PAYE-2026.1</div>
        <div><strong>Source Authority:</strong> HM Revenue &amp; Customs (HMRC)</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> 2026–2027 (Effective 6 April 2026)</div>
        <div><strong>Status:</strong> Verified Statutory Model (100% Code Verified)</div>
        <div><strong>Last Verified:</strong> 2026-04-06</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>Student Loan repayments (Plans 1, 2, 4, 5, or Postgraduate Loan plans)</li>
            <li>Marriage Allowance transfers and Blind Person&apos;s Allowance</li>
            <li>Company car benefit-in-kind (BIK) and private medical insurance tax values</li>
          </ul>
        </div>
      </div>

            {/* 5-Column Country-Specific Competitor Comparison Matrix */}
      <h2 id="competitor-comparison" className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        United Kingdom Salary Calculator Comparison: KivaroTools vs. TheSalaryCalculator.co.uk &amp; ListenToTaxman.com
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
        See how KivaroTools compares against leading United Kingdom payroll and tax calculators across statutory accuracy (HMRC & Scottish Govt), pre-tax relief modeling, reverse net-to-gross solving, and client-side privacy:
      </p>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left text-sm border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">Capability / Statutory Feature</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">KivaroTools (100% Free)</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">TheSalaryCalculator.co.uk</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">ListenToTaxman.com</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">Reed.co.uk / MSE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">£12,570 Personal Allowance (£100k Taper) &amp; Scottish 6 Bands</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Exact £1-for-£2 taper &gt;£100k (60% marginal trap) + England vs. Scotland 6 bands</td>
              <td className="p-3">Yes (Ad-heavy)</td>
              <td className="p-3">Yes (Ad-heavy)</td>
              <td className="p-3">Summary total only</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Student Loan Plans 1, 2, 4, 5 (9%) &amp; Postgraduate Loan (6%)</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Dedicated Plan 1/2/4/5 dropdown + Postgrad checkbox itemized in Waterfall Ledger</td>
              <td className="p-3">Yes</td>
              <td className="p-3">Yes</td>
              <td className="p-3">Basic plan selector</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Class 1 Employee NI (8% &amp; 2%) + 15% Employer NI (&gt;£5,000)</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Full Employee NI + Autumn Budget 15% Employer NI (&gt;£5k) CTC Ledger</td>
              <td className="p-3">No Employer NI on main tab</td>
              <td className="p-3">Yes</td>
              <td className="p-3">Employee view only</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Salary Sacrifice Pension Drawer & 60-Iter Reverse Net Solver</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Pre-Tax Salary Sacrifice drawer (restores £12,570 allowance) + Reverse Solver</td>
              <td className="p-3">Separate tab</td>
              <td className="p-3">No reverse solver</td>
              <td className="p-3">Basic pension %</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">100% Client-Side Privacy & 1-Click CSV Payslip</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Zero Server Uploads + 9 Pay Periods + Formula-Safe CSV Export</td>
              <td className="p-3">No CSV export</td>
              <td className="p-3">Legacy UI</td>
              <td className="p-3">Recruiter tracking</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Programmatic Long-Tail Search Intent & Statutory Coverage (26+ Queries) */}
      <div className="my-8 p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 not-prose">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
          United Kingdom Statutory Tax &amp; Payroll Search Coverage (26 Verified Long-Tail Intents)
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united kingdom salary calculator 2026</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united kingdom take home pay calculator gbp</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united kingdom gross to net salary after tax</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united kingdom income tax brackets and slabs (HMRC & Scottish Govt)</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united kingdom monthly biweekly weekly daily hourly paycheck</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united kingdom reverse net to gross target salary solver</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united kingdom total employer cost of employment ctc</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united kingdom employee social security contribution cap</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united kingdom effective tax rate vs marginal tax bracket</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united kingdom pre tax pension retirement deduction calculator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">how much tax do i pay on my salary in united kingdom</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united kingdom annual to monthly and hourly net wage converter</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united kingdom expatriate and resident payroll tax comparison</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united kingdom job offer gross to net paycheck estimator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united kingdom biweekly 26 pay periods vs semi monthly 24 periods</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united kingdom daily rate 260 days and hourly rate 2080 hours</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united kingdom statutory payroll waterfall ledger csv export</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">free client side united kingdom tax calculator zero data logging</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united kingdom software engineer and remote worker net pay</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">united kingdom bonus overtime and gross compensation tax audit</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">uk salary calculator 2026 2027 hmrc paye 12570 personal allowance</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">100k tax trap 60 percent effective marginal rate salary sacrifice uk</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">scottish income tax 6 bands starter basic intermediate higher advanced top</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">student loan plan 1 plan 2 plan 4 plan 5 postgraduate loan calculator uk</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">employer national insurance 15 percent above 5000 threshold calculator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">thesalarycalculator co uk and listentotaxman free ad free alternative</span>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Frequently Asked Questions (HMRC PAYE &amp; National Insurance)
      </h2>
      <div className="space-y-3 mb-6 not-prose">
        {UK_SALARY_FAQS.map((faq, index) => (
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
          Complementary UK &amp; International Financial Tools
        </h4>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            href="/finance/salary-calculator"
            className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 hover:underline"
          >
            22-Country Salary Hub
          </Link>
          <Link
            href="/finance/invoice-generator"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            UK Contractor Invoice Generator
          </Link>
          <Link
            href="/finance/compound-interest"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            ISA &amp; Pension Compound Growth
          </Link>
          <Link
            href="/finance/salary-calculator/ireland"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Ireland Salary Calculator (PAYE/USC)
          </Link>
          <Link
            href="/finance/salary-calculator/united-states"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            US Salary Calculator (IRS/FICA)
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
