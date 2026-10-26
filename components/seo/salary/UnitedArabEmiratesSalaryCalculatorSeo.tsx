import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const UAE_SALARY_FAQS: FaqItem[] = [
  {
    question: 'Is there any personal income tax on salaries in Dubai or the UAE in 2026?',
    answer:
      'No. The United Arab Emirates levies 0% personal income tax on employment salaries, bonuses, and allowances for both expatriate residents and UAE nationals. While a 9% federal corporate tax was introduced in 2023 for business profits exceeding AED 375,000, employment wages remain 100% exempt.',
  },
  {
    question: 'How do GPSSA pension deductions work for Emirati nationals?',
    answer:
      'UAE nationals registered under the General Pension and Social Security Authority (GPSSA) baseline law contribute 5.0% of their contribution calculation salary via monthly payroll deduction, while private-sector employers contribute 12.5% (and the government contributes 2.5%), up to a monthly salary cap of AED 50,000.',
  },
  {
    question: 'How is UAE End-of-Service Gratuity (EOSB) calculated for expatriates?',
    answer:
      'Under UAE Federal Decree-Law No. 33 of 2021, expatriate employees who complete at least one year of continuous service are entitled to an End-of-Service Gratuity calculated at 21 calendar days of basic wage for each of the first 5 years of service (~5.75% per year), and 30 calendar days for each subsequent year (~8.22% per year). This is an employer-funded benefit that never reduces your monthly take-home pay.',
  },
  {
    question: 'Can I switch between Expatriate and UAE National modes in the calculator?',
    answer:
      'Yes. Use the Residency Status selector inside the calculator to toggle between Expatriate (0% deductions, 100% net take-home pay) and UAE National (5% GPSSA deduction) to compare exact take-home pay and employer cost.',
  },
  {
    question: 'Does UAE VAT (5%) get deducted from my salary paycheck?',
    answer:
      'No. Value Added Tax (5% VAT) is an indirect consumption tax applied when purchasing goods and services in the UAE; it is never withheld from your employment paycheck.',
  }
];

export default function UnitedArabEmiratesSalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: UAE_SALARY_FAQS.map((faq) => ({
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
        UAE Salary Calculator 2026: 0% Income Tax, GPSSA Emirati Pension & Expat Gratuity
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate net take-home salary and total employer cost in the United Arab Emirates (AED) across Dubai, Abu Dhabi, and Sharjah. Models 0% Personal Income Tax, GPSSA statutory pension contributions for Emirati/GCC nationals, and End-of-Service Gratuity provisions for expatriates.
      </p>

      {/* How It Works */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How United Arab Emirates Gross-to-Net Payroll &amp; Tax Withholding Is Calculated
      </h3>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Zero Personal Income Tax (0% PIT):</strong> The UAE Federal Tax Authority levies 0% personal income tax, 0% capital gains tax, and 0% municipal wage tax on individual employment salaries.
        </li>
        <li>
          <strong>Expatriate Employees (100% Net Pay):</strong> Expatriate workers retain 100% of their contractual gross salary as net take-home pay, while employers accrue statutory End-of-Service Gratuity (~5.75% of basic pay under UAE Labour Law).
        </li>
        <li>
          <strong>UAE / GCC Nationals (GPSSA Pension):</strong> Emirati nationals contribute 5.0% of pensionable salary (capped at AED 50,000/month under baseline Federal Law No. 7 of 1999) toward GPSSA retirement, matched by 12.5% from the employer.
        </li>
        <li>
          <strong>Total Employer Cost:</strong> Includes gross compensation plus either the 12.5% employer GPSSA contribution (Nationals) or the statutory End-of-Service Gratuity accrual (Expatriates).
        </li>
      </ol>

      {/* Worked Examples */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Representative United Arab Emirates Salary &amp; Net Take-Home Pay Examples (2026)
      </h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left text-sm border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross (AED)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Monthly Gross</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Net Pay (Expatriate)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Net Pay (UAE National)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Employer Cost (Expat)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">AED 120,000</td>
              <td className="p-3">AED 10,000</td>
              <td className="p-3">AED 120,000 (100%)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">AED 114,000 (-5% GPSSA)</td>
              <td className="p-3">AED 126,900</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">AED 240,000</td>
              <td className="p-3">AED 20,000</td>
              <td className="p-3">AED 240,000 (100%)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">AED 228,000 (-5% GPSSA)</td>
              <td className="p-3">AED 253,800</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">AED 420,000</td>
              <td className="p-3">AED 35,000</td>
              <td className="p-3">AED 420,000 (100%)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">AED 399,000 (-5% GPSSA)</td>
              <td className="p-3">AED 444,150</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">AED 720,000</td>
              <td className="p-3">AED 60,000</td>
              <td className="p-3">AED 720,000 (100%)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">AED 690,000 (GPSSA capped)</td>
              <td className="p-3">AED 761,400</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> AE-MOHRE-2026.1</div>
        <div><strong>Source Authority:</strong> Ministry of Human Resources & Emiratisation (MOHRE) & GPSSA</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> 2026</div>
        <div><strong>Status:</strong> Limited Statutory Model (0% PIT + GPSSA / Gratuity Scope)</div>
        <div><strong>Last Verified:</strong> 2026-10-10</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>Federal Decree-Law No. 57/2023 new entrant GPSSA rules (11% employee contribution up to AED 70,000/mo cap for Emiratis joining workforce post-Nov 2023)</li>
            <li>Voluntary DIFC Employee Workplace Savings (DEWS) top-ups</li>
            <li>Dubai 5% municipal housing fee (billed via DEWA utility statements rather than payroll withholding)</li>
          </ul>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions (United Arab Emirates Income Tax &amp; Payroll)
      </h3>
      <div className="space-y-4 mb-6">
        {UAE_SALARY_FAQS.map((faq, index) => (
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
            href="/finance/salary-calculator/saudi-arabia"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Saudi Arabia Salary Calculator (GOSI)
          </Link>
          <Link
            href="/finance/salary-calculator/singapore"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Singapore Salary Calculator (IRAS)
          </Link>
          <Link
            href="/finance/salary-calculator/pakistan"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Pakistan Salary Calculator (FBR)
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
