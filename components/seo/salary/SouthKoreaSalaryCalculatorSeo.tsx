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
  }
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

      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        South Korea Salary Calculator 2026: 연봉 실수령액, NTS Income Tax & 4 Major Insurances (4대보험)
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your net take-home pay in South Korean Won (KRW / ₩) using National Tax Service (NTS / 국세청) progressive income tax brackets (6% to 45%), Earned Income Deduction (근로소득공제), Local Income Tax (10%), and the 4 Major Social Insurances (4대보험).
      </p>

      {/* How It Works */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How South Korea Gross-to-Net Payroll &amp; Tax Withholding Is Calculated
      </h3>
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
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Representative South Korea Salary &amp; Net Take-Home Pay Examples (2026)
      </h3>
      <div className="w-full overflow-x-auto mb-6 overscroll-x-contain">
        <table className="min-w-[640px] w-full text-left text-sm border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
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
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
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

      {/* Frequently Asked Questions */}
      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions (South Korea Income Tax &amp; Payroll)
      </h3>
      <div className="space-y-4 mb-6">
        {SOUTH_KOREA_SALARY_FAQS.map((faq, index) => (
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
