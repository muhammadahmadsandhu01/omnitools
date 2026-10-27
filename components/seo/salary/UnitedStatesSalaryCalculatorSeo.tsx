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

      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        United States Salary Calculator 2026: Federal Tax, FICA &amp; Take-Home Pay Guide
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Estimate your net paycheck and annual take-home compensation in the United States using official IRS 2026
        inflation adjustments (Rev. Proc. 2025-32) and SSA 2026 payroll parameters. This calculator decomposes gross
        compensation, federal progressive tax, FICA deductions (Social Security and Medicare), and state tax baselines.
      </p>

      {/* How It Works */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How US Payroll &amp; Federal Income Tax Withholding Is Calculated
      </h3>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Standard Deduction:</strong> The applicable statutory standard deduction ($16,100 Single / $32,200 MFJ) is subtracted from gross income to establish federal taxable income.
        </li>
        <li>
          <strong>Federal Progressive Brackets:</strong> Taxable income is taxed across the seven IRS brackets: 10% ($0–$11,925), 12% ($11,925–$48,475), 22% ($48,475–$103,350), 24% ($103,350–$197,300), 32% ($197,300–$250,525), 35% ($250,525–$626,350), and 37% (over $626,350).
        </li>
        <li>
          <strong>FICA Payroll Taxes:</strong> Social Security (OASDI) is deducted at 6.20% on wages up to $184,500 ($11,439.00 max). Medicare (HI) is deducted at 1.45% on all earnings, plus 0.90% Additional Medicare on wages exceeding $200,000 for Single filers.
        </li>
        <li>
          <strong>Net Take-Home Pay:</strong> Federal tax, FICA taxes, and applicable state income taxes are subtracted from gross earnings to produce your net spendable paycheck.
        </li>
      </ol>

      {/* Worked Examples */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Representative Salary Examples (Single Filer, 2026 Tax Year)
      </h3>
      <div className="w-full overflow-x-auto mb-6 overscroll-x-contain">
        <table className="min-w-[640px] w-full text-left text-sm border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
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
              <td className="p-3">$3,829.50 (7.7% eff.)</td>
              <td className="p-3">$3,825.00</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">$42,345.50 ($3,528/mo)</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">$100,000</td>
              <td className="p-3">$16,100</td>
              <td className="p-3">$13,381.50 (13.4% eff.)</td>
              <td className="p-3">$7,650.00</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">$78,968.50 ($6,580/mo)</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">$200,000</td>
              <td className="p-3">$16,100</td>
              <td className="p-3">$35,768.50 (17.9% eff.)</td>
              <td className="p-3">$14,339.00 (OASDI capped)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">$149,892.50 ($12,491/mo)</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">$300,000</td>
              <td className="p-3">$16,100</td>
              <td className="p-3">$67,737.50 (22.6% eff.)</td>
              <td className="p-3">$16,689.00 (incl. Addl Med)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">$215,573.50 ($17,964/mo)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
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

      {/* Frequently Asked Questions */}
      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions (US Income Tax &amp; Payroll)
      </h3>
      <div className="space-y-4 mb-6">
        {US_SALARY_FAQS.map((faq, index) => (
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
