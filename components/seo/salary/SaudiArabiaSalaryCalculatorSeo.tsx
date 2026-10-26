import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const SAUDI_SALARY_FAQS: FaqItem[] = [
  {
    question: 'Do expatriates pay income tax or GOSI in Saudi Arabia?',
    answer:
      'No. Expatriate employees working in Saudi Arabia pay 0% personal income tax and 0% employee GOSI deductions, meaning their net take-home salary equals 100% of their contractual gross salary. Employers pay a 2.0% GOSI Occupational Hazards contribution on behalf of expatriate staff.',
  },
  {
    question: "How much is deducted for GOSI from a Saudi National's salary?",
    answer:
      'Under the standard GOSI schedule, Saudi nationals have 9.75% deducted from their basic salary plus housing allowance (9.0% for the Annuity pension branch and 0.75% for SANED unemployment insurance). The employer contributes an additional 11.75%.',
  },
  {
    question: 'What is the maximum monthly salary cap for GOSI in Saudi Arabia?',
    answer:
      'GOSI contributions are subject to a statutory wage ceiling of SAR 45,000 per month (SAR 540,000 per year). Any salary earned above SAR 45,000/month is exempt from additional GOSI deductions, capping the maximum employee contribution at SAR 4,387.50/month.',
  },
  {
    question: 'What is SANED in Saudi payroll?',
    answer:
      "SANED is Saudi Arabia's mandatory unemployment insurance scheme administered by GOSI. It provides financial compensation and training support to Saudi nationals who lose their jobs for reasons beyond their control. Both employee and employer contribute 0.75% of contributory wages.",
  },
  {
    question: 'How do I toggle between Saudi National and Expatriate calculation modes?',
    answer:
      "Inside the calculator workspace above, select either 'Expatriate' (default 0% deduction) or 'Saudi National' (9.75% GOSI deduction) to immediately recalculate your net monthly and annual paycheck.",
  }
];

export default function SaudiArabiaSalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SAUDI_SALARY_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-xs">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        Saudi Arabia Salary Calculator 2026: 0% Income Tax, GOSI & SANED Payroll Guide
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate net take-home pay and employer payroll costs in the Kingdom of Saudi Arabia (SAR) under ZATCA and General Organization for Social Insurance (GOSI) regulations. Models 0% personal income tax, 9.75% Saudi National GOSI/SANED deductions, and expatriate occupational hazard costs.
      </p>

      {/* How It Works */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How Saudi Arabia Gross-to-Net Payroll &amp; Tax Withholding Is Calculated
      </h3>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Zero Personal Income Tax (0% PIT):</strong> Under ZATCA regulations, Saudi Arabia does not levy personal income tax on employment wages for either Saudi citizens or foreign expatriates.
        </li>
        <li>
          <strong>Saudi Nationals (9.75% Employee GOSI):</strong> Saudi citizens contribute 9.0% for Annuities (Pension) plus 0.75% for SANED unemployment insurance (9.75% total employee deduction), capped at a maximum contributory wage of SAR 45,000/month (SAR 540,000/year).
        </li>
        <li>
          <strong>Saudi National Employer Cost (11.75%):</strong> Employers of Saudi nationals contribute 9.0% Annuities + 0.75% SANED + 2.0% Occupational Hazards = 11.75% up to SAR 45,000/month.
        </li>
        <li>
          <strong>Expatriate Workers (100% Net Pay):</strong> Non-Saudi expatriate employees pay 0% income tax and 0% employee GOSI (receiving 100% of gross pay net), while employers pay a mandatory 2.0% Occupational Hazards contribution.
        </li>
      </ol>

      {/* Worked Examples */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Representative Saudi Arabia Salary &amp; Net Take-Home Pay Examples (2026)
      </h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left text-sm border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross (SAR)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Monthly Gross</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Net Pay (Expatriate)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Net Pay (Saudi National)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Saudi GOSI Deducted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">SAR 120,000</td>
              <td className="p-3">SAR 10,000</td>
              <td className="p-3">SAR 120,000 (100%)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">SAR 108,300 (SAR 9,025/mo)</td>
              <td className="p-3">SAR 11,700 (9.75%)</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">SAR 240,000</td>
              <td className="p-3">SAR 20,000</td>
              <td className="p-3">SAR 240,000 (100%)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">SAR 216,600 (SAR 18,050/mo)</td>
              <td className="p-3">SAR 23,400 (9.75%)</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">SAR 420,000</td>
              <td className="p-3">SAR 35,000</td>
              <td className="p-3">SAR 420,000 (100%)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">SAR 379,050 (SAR 31,588/mo)</td>
              <td className="p-3">SAR 40,950 (9.75%)</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">SAR 600,000</td>
              <td className="p-3">SAR 50,000</td>
              <td className="p-3">SAR 600,000 (100%)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">SAR 547,350 (SAR 45,613/mo)</td>
              <td className="p-3">SAR 52,650 (Capped at 45k/mo)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> SA-GOSI-2026.1</div>
        <div><strong>Source Authority:</strong> General Organization for Social Insurance (GOSI) & ZATCA</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> 2026</div>
        <div><strong>Status:</strong> Limited Statutory Model (0% PIT + GOSI Statutory Scope)</div>
        <div><strong>Last Verified:</strong> 2026-10-10</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>Phased GOSI contribution increases for newly entering Saudi employees post-July 2024 with zero prior GOSI record</li>
            <li>Expatriate family/dependent Iqama renewal levies (SAR 400/month per dependent)</li>
            <li>End-of-Service Award (EOSA) severance accruals under the Saudi Labor Law</li>
          </ul>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions (Saudi Arabia Income Tax &amp; Payroll)
      </h3>
      <div className="space-y-4 mb-6">
        {SAUDI_SALARY_FAQS.map((faq, index) => (
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
            Compound Interest &amp; Retirement
          </Link>
          <Link
            href="/finance/salary-calculator/united-arab-emirates"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            UAE Salary Calculator (0% Tax)
          </Link>
          <Link
            href="/finance/salary-calculator/pakistan"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Pakistan Salary Calculator (FBR)
          </Link>
          <Link
            href="/finance/salary-calculator/india"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            India Salary Calculator (115BAC)
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
