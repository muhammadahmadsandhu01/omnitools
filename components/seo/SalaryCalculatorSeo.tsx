import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const SALARY_CALCULATOR_FAQS: FaqItem[] = [
  {
    question: 'How does the gross-to-net salary deduction waterfall work?',
    answer:
      'Payroll processing follows a strict six-step mathematical waterfall: (1) Contractual Gross Compensation (base salary plus taxable bonuses, commissions, overtime, and allowances); (2) Pre-Tax Deductions (such as 401k, pension salary sacrifice, or health FSAs that lower taxable income); (3) Progressive Statutory Income Tax evaluated across incremental marginal tax brackets; (4) Mandatory Employee Social Security Contributions (such as US FICA, UK Class 1 NI, German Sozialversicherung, Canadian CPP/EI, or Pakistani EOBI) subject to statutory wage ceilings; (5) Post-Tax Deductions; and (6) Net Spendable Take-Home Pay.',
  },
  {
    question: 'Why does my effective tax rate differ from my marginal tax bracket?',
    answer:
      'In progressive tax systems, your marginal tax rate applies only to the top portion of income falling inside that highest bracket—not your entire salary. Lower portions of your income are taxed at 0% (via personal allowances or standard deductions) and lower progressive bands (e.g., 10%, 12%, 20%). Your effective tax rate is your total income tax divided by your total gross compensation, which is always substantially lower than your marginal bracket.',
  },
  {
    question: 'Why is biweekly pay not equal to half of monthly pay?',
    answer:
      'A calendar year has 12 months (24 semi-monthly pay periods) but 52.14 weeks (26 biweekly pay periods). Dividing an annual salary by 26 produces a slightly smaller per-paycheck amount than dividing by 24, because biweekly earners receive three paychecks in two months of every calendar year. KivaroTools normalizes Annual (1), Monthly (12), Semi-Monthly (24), Biweekly (26), Weekly (52), Daily (260 working days), and Hourly (2,080 hours) exactly.',
  },
  {
    question: 'Which 22 countries have dedicated statutory tax and payroll engines on KivaroTools?',
    answer:
      'KivaroTools provides dedicated statutory payroll calculators for the United States, United Kingdom, Germany, India, Pakistan, Canada, Australia, Singapore, United Arab Emirates, Saudi Arabia, France, Japan, Switzerland, Netherlands, Ireland, New Zealand, Spain, Italy, South Africa, Brazil, Mexico, and South Korea, plus a 212-jurisdiction global directory.',
  },
  {
    question: 'What is the difference between Verified Statutory, Limited Statutory, and Custom Estimate status?',
    answer:
      'Verified Statutory models implement the complete national progressive income tax schedule, personal allowances/rebates, and mandatory employee/employer social insurance caps verified against primary tax authorities. Limited Statutory models implement the core federal/national income tax schedule alongside representative regional or social security benchmarks where municipal or cantonal tariffs vary locally. Custom Estimate models allow user-defined tax and social rates for territories without a dedicated statutory engine.',
  },
  {
    question: 'How is Total Employer Cost of Employment calculated?',
    answer:
      'When an employer hires an employee, the true corporate cost exceeds the contractual gross salary. Employers must pay statutory employer payroll taxes and social contributions on top of gross pay—such as 7.65% employer FICA in the US, 15.0% employer Class 1 NI in the UK, 12.0% Superannuation Guarantee in Australia, ~20% employer social security in Germany, or 35.8% CLT charges in Brazil. KivaroTools computes both employee net take-home pay and total employer cost simultaneously.',
  },
  {
    question: 'How are zero-income-tax countries like the UAE and Saudi Arabia modeled?',
    answer:
      'Both the United Arab Emirates and Saudi Arabia levy 0% personal income tax (PIT) on employment wages. However, mandatory social insurance applies to citizens (5% employee GPSSA in UAE; 9.75% employee GOSI + SANED in Saudi Arabia), while expatriates receive 100% of gross pay net of PIT alongside statutory employer-funded End-of-Service Gratuity or occupational hazard provisions.',
  },
  {
    question: 'How does the Reverse Net-to-Gross Salary Goal Solver work?',
    answer:
      'When negotiating a job offer or relocation package, candidates often know their desired monthly net take-home pay but need to know what gross salary to request before taxes. Our engine uses a 50-iteration numerical bisection solver to invert progressive tax brackets, allowance tapers, and social security caps, pinpointing the exact required gross salary.',
  },
  {
    question: 'Does KivaroTools store, log, or upload my salary figures?',
    answer:
      'No. All gross-to-net calculations, tax bracket audits, reverse goal solving, and CSV exports run 100% client-side in your browser memory. Zero salary inputs, compensation figures, or jurisdiction selections are ever stored in cookies or transmitted to any server.',
  },
  {
    question: 'Can I export a complete payroll tax breakdown to CSV or Excel?',
    answer:
      'Yes. Every statutory calculator includes an RFC-4180 compliant CSV export with CWE-1236 spreadsheet formula injection protection. The exported table lists Annual, Monthly, and Pay-Period figures across Gross Pay, Pre-Tax Deductions, Taxable Income, Income Tax, Social Security, Net Take-Home Pay, Employer Cost, and the official Ruleset ID.',
  },
];

const STATUTORY_COUNTRY_LINKS = [
  { slug: 'united-states', name: 'United States', code: 'IRS + FICA + 50 States', currency: 'USD' },
  { slug: 'united-kingdom', name: 'United Kingdom', code: 'HMRC PAYE + Class 1 NI', currency: 'GBP' },
  { slug: 'germany', name: 'Germany', code: 'BMF EStG + Soli + Sozial', currency: 'EUR' },
  { slug: 'india', name: 'India', code: 'CBDT Sec 115BAC + 87A', currency: 'INR' },
  { slug: 'pakistan', name: 'Pakistan', code: 'FBR Slabs + EOBI', currency: 'PKR' },
  { slug: 'canada', name: 'Canada', code: 'CRA Federal + CPP + EI', currency: 'CAD' },
  { slug: 'australia', name: 'Australia', code: 'ATO Stage 3 + Medicare + Super', currency: 'AUD' },
  { slug: 'singapore', name: 'Singapore', code: 'IRAS Resident + CPF OW Cap', currency: 'SGD' },
  { slug: 'united-arab-emirates', name: 'United Arab Emirates', code: '0% PIT + GPSSA / Gratuity', currency: 'AED' },
  { slug: 'saudi-arabia', name: 'Saudi Arabia', code: '0% PIT + GOSI & SANED', currency: 'SAR' },
  { slug: 'france', name: 'France', code: 'DGFiP Barème IR + URSSAF', currency: 'EUR' },
  { slug: 'japan', name: 'Japan', code: 'NTA Shotokuzei + Juminzei', currency: 'JPY' },
  { slug: 'switzerland', name: 'Switzerland', code: 'ESTV Federal + Cantons + AHV', currency: 'CHF' },
  { slug: 'netherlands', name: 'Netherlands', code: 'Box 1 + Heffingskorting + 30%', currency: 'EUR' },
  { slug: 'ireland', name: 'Ireland', code: 'Revenue PAYE + USC + PRSI', currency: 'EUR' },
  { slug: 'new-zealand', name: 'New Zealand', code: 'IRD PAYE + ACC + KiwiSaver', currency: 'NZD' },
  { slug: 'spain', name: 'Spain', code: 'AEAT Dual IRPF + Seg. Social', currency: 'EUR' },
  { slug: 'italy', name: 'Italy', code: 'IRPEF 3-Scaglioni + INPS', currency: 'EUR' },
  { slug: 'south-africa', name: 'South Africa', code: 'SARS PAYE + Rebate + UIF', currency: 'ZAR' },
  { slug: 'brazil', name: 'Brazil', code: 'RFB IRPF + INSS CLT + FGTS', currency: 'BRL' },
  { slug: 'mexico', name: 'Mexico', code: 'SAT Art. 152 ISR + IMSS', currency: 'MXN' },
  { slug: 'south-korea', name: 'South Korea', code: 'NTS Income Tax + 4 Insurances', currency: 'KRW' },
];

export default function SalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SALARY_CALCULATOR_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8">
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
            name: 'How to Calculate Net Take-Home Pay, Income Tax & Payroll Deductions Across 22 Countries',
            description: 'Step-by-step guide to calculating gross-to-net salary, progressive income tax brackets, social security contributions, and employer payroll costs across 22 jurisdictions.',
            step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Select Country Tax Jurisdiction',
        text: 'Choose from 22 statutory country tax engines including the United States, United Kingdom, Canada, Germany, Australia, India, Pakistan, UAE, and Singapore.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Enter Gross Salary & Pay Frequency',
        text: 'Input your annual, monthly, bi-weekly, weekly, or hourly compensation and configure standard working hours.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Configure Filing Status, Allowances & Pre-Tax Deductions',
        text: 'Select your marital/filing status, regional state/province/tax code, and optional pre-tax pension or retirement contributions (401k, RRSP, Superannuation, EPF).',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Inspect Progressive Tax Brackets & Export Payslip Breakdown',
        text: 'Review your net take-home pay across all pay periods, marginal vs. effective tax rates, bracket-by-bracket tax table, and total employer cost.',
      }
            ],
          }),
        }}
      />

      <section aria-labelledby="salary-calculator-salary-calculator-by-country-c" className="mb-8">
        <h2 id="salary-calculator-salary-calculator-by-country-c" className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
          Global Salary &amp; Net Take-Home Pay Calculator: 22 Statutory Tax Engines &amp; 212 Jurisdictions
        </h2>
        <blockquote className="p-4 my-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg dark:bg-slate-800 not-italic">
          <p className="text-sm text-slate-700 dark:text-slate-300 m-0">
            <strong>Privacy First &amp; Secure:</strong> All payroll calculations, progressive tax bracket audits, and reverse salary goal solving execute 100% locally in your browser. Zero salary figures or personal tax elections are ever uploaded to external servers.
          </p>
        </blockquote>
        <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
          Understanding how contractual gross salary translates into actual spendable net take-home pay is essential for job seekers, remote software engineers, international expatriates, and global HR compensation teams. KivaroTools provides a comprehensive directory of <strong>212 jurisdictions</strong>, featuring <strong>22 dedicated statutory payroll calculators</strong> codified against official government tax authorities (IRS, HMRC, BMF, CBDT, FBR, CRA, ATO, IRAS, Belastingdienst, Revenue Ireland, IRD, AEAT, SARS, RFB, SAT, NTS) alongside transparent custom benchmark estimation across the global catalogue.
        </p>
      </section>

      {/* Direct Links to All 22 Statutory Country Calculators */}
      <section aria-labelledby="salary-calculator-direct-country-links" className="mb-10 not-prose">
        <h3 id="salary-calculator-direct-country-links" className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100">
          Direct Access: 22 Statutory Country Salary Calculators (2026–2027)
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Select any jurisdiction below to open its standalone statutory calculator with progressive tax bracket tables, regional/state selectors, and worked salary examples:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {STATUTORY_COUNTRY_LINKS.map((item) => (
            <Link
              key={item.slug}
              href={`/finance/salary-calculator/${item.slug}`}
              className="flex flex-col justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 hover:border-blue-400 dark:hover:border-blue-700 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400">
                  {item.name} Salary Calculator
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-100/70 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {item.currency}
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {item.code}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="salary-calculator-the-gross-to-net-payroll-deduc" className="mb-8">
        <h3 id="salary-calculator-the-gross-to-net-payroll-deduc" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
          The Gross-to-Net Payroll Deduction Waterfall
        </h3>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          Professional payroll processing follows a deterministic sequential deduction waterfall. Employee compensation is
          segregated into taxable components, deductible allowances, statutory government contributions, and voluntary
          benefits:
        </p>

        <div className="w-full overflow-x-auto mb-6 overscroll-x-contain">
          <table className="min-w-[640px] w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Step</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Calculation Component</th>
                <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700">Description &amp; Tax Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">1. Gross Compensation</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Base + Bonus + Allowances</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Total contractual earnings before statutory or voluntary withholdings.</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">2. Pre-Tax Deductions</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Pension / 401(k) / Health FSA</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Directly reduces taxable income before statutory income tax brackets are evaluated.</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">3. Statutory Income Tax</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Progressive Tax Slabs / Brackets</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Government income tax assessed incrementally on portions of income falling within statutory bands.</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">4. Social Contributions</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">FICA / NI / EOBI / CPP / EI / CPF / GOSI</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Mandatory state insurance or retirement funds, subject to statutory earnings thresholds and wage caps.</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">5. Post-Tax Deductions</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Roth / Loan Repayments / Dues</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">Deductions subtracted after tax liabilities have been assessed.</td>
              </tr>
              <tr className="bg-emerald-50/50 dark:bg-emerald-950/20 font-semibold text-emerald-800 dark:text-emerald-300">
                <th scope="row" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">6. Net Take-Home Pay</th>
                <td className="p-3 border border-gray-200 dark:border-slate-700 font-mono">Gross - All Deductions</td>
                <td className="p-3 border border-gray-200 dark:border-slate-700">The actual spendable cash credited to your bank account on scheduled payroll dates.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="salary-calculator-pay-period-normalization-exact" className="mb-8">
        <h3 id="salary-calculator-pay-period-normalization-exact" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
          Pay Period Normalization: Exact Frequency Periods
        </h3>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          A common payroll calculation error is assuming biweekly pay equals monthly pay divided by two. In calendar
          accounting, a standard working year consists of 52 weeks and 260 working days:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2 text-slate-600 dark:text-slate-400">
          <li><strong>Annual:</strong> 1 period per calendar year.</li>
          <li><strong>Monthly:</strong> Exactly 12 equal pay periods.</li>
          <li><strong>Semi-Monthly:</strong> Exactly 24 periods (typically paid on the 1st/15th and last day of each month).</li>
          <li><strong>Biweekly:</strong> Exactly 26 pay periods (paid every alternating week; creates two three-paycheck months per year).</li>
          <li><strong>Weekly:</strong> Exactly 52 pay periods per year.</li>
          <li><strong>Daily:</strong> Standardized on 260 working business days (52 weeks × 5 days).</li>
          <li><strong>Hourly:</strong> Standardized on 2,080 working hours (52 weeks × 40 standard weekly hours).</li>
        </ul>
      </section>

      <section aria-labelledby="salary-calculator-total-cost-of-employment-emplo" className="mb-8">
        <h3 id="salary-calculator-total-cost-of-employment-emplo" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
          Total Cost of Employment (Employer Side Reconciliation)
        </h3>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          In modern international hiring, gross salary is only a portion of total employment costs. Employers incur mandatory
          payroll taxes, statutory social contributions, pension matching, and healthcare provisions that do not reduce the
          employee&apos;s take-home pay but significantly affect corporate budgeting:
        </p>
        <div className="p-4 bg-gray-50 dark:bg-[#0a0f1a] rounded-2xl border border-gray-200 dark:border-slate-800 text-sm font-mono mb-6 text-slate-700 dark:text-slate-300">
          Total Employer Cost = Contractual Gross Compensation + Statutory Employer Social Security + Pension Match + Employer Healthcare &amp; Benefits
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section aria-labelledby="salary-calculator-faqs" className="mb-8">
        <h3 id="salary-calculator-faqs" className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
          Frequently Asked Questions (Global Salary &amp; Payroll Taxation)
        </h3>
        <div className="space-y-4 not-prose">
          {SALARY_CALCULATOR_FAQS.map((faq, index) => (
            <div
              key={index}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40"
            >
              <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {faq.question}
              </h4>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="salary-calculator-statutory-freshness-provenance" className="mb-4">
        <h3 id="salary-calculator-statutory-freshness-provenance" className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
          Statutory Freshness, Provenance &amp; Privacy Standard
        </h3>
        <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
          Unlike web tools that silently store financial figures or send salary queries across analytics APIs, KivaroTools
          operates strictly on client-side deterministic evaluation. <strong>Zero salary data is persisted</strong> to local
          storage, session cookies, or external servers. Every supported statutory engine explicitly publishes its ruleset ID,
          statutory source authority, last verified date, and documented calculation scope.
        </p>

        <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-xs text-amber-800 dark:text-amber-300">
          <strong>Disclaimer:</strong> This tool provides financial estimation and gross-to-net tax planning models. It is
          not formal legal, accounting, or tax advisory. Actual withholding tax schedules and net pay may vary depending on
          individual payroll cycles, localized municipal taxes, specialized tax codes, and personal filing elections.
        </div>
      </section>
    </article>
  );
}
