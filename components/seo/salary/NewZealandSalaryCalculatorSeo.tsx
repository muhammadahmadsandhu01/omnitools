import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const NEW_ZEALAND_SALARY_FAQS: FaqItem[] = [
  {
    question: 'What are the New Zealand IRD PAYE income tax brackets for 2026–2027?',
    answer:
      'New Zealand personal income tax brackets (under Tax Code M) are: 10.5% on income from $0 to $15,600; 17.5% from $15,601 to $53,500; 30.0% from $53,501 to $78,100; 33.0% from $78,101 to $180,000; and 39.0% on all income over $180,000.',
  },
  {
    question: "What is the ACC Earners' Levy rate and cap for 2026–2027?",
    answer:
      "The Accident Compensation Corporation (ACC) Earners' Levy covers non-work physical injuries for all New Zealanders. For the 2026–2027 tax year, the levy rate is 1.75% (GST inclusive) up to a maximum liable earnings cap of NZ$156,641 (compared to 1.67% up to NZ$152,790 in 2025–2026).",
  },
  {
    question: 'How does KiwiSaver affect my take-home pay?',
    answer:
      'Eligible New Zealand employees are automatically enrolled in KiwiSaver at a default employee contribution rate of 3% (you can also choose 4%, 6%, 8%, or 10%, or take a savings suspension at 0%). Employee KiwiSaver contributions are calculated on your gross before-tax pay and deducted alongside PAYE, while your employer contributes a compulsory 3% match.',
  },
  {
    question: 'Does New Zealand have a tax-free threshold like Australia?',
    answer:
      "No. Unlike Australia's $18,200 tax-free threshold, New Zealand taxes the very first dollar of earned income at the lowest 10.5% bracket (up to $15,600).",
  },
  {
    question: 'Can I customize my KiwiSaver percentage in this calculator?',
    answer:
      'Yes. Use the KiwiSaver Employee Rate selector in the calculator workspace to switch between 0% (Opt-Out/Holiday), 3%, 4%, 6%, 8%, and 10%.',
  }
];

export default function NewZealandSalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: NEW_ZEALAND_SALARY_FAQS.map((faq) => ({
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
        New Zealand Salary Calculator 2026–2027: IRD PAYE Tax, ACC Levy & KiwiSaver
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your net take-home pay in New Zealand (NZD) using official Inland Revenue (IRD) PAYE tax brackets, the ACC Earners&apos; Levy (1.75% for 2026–27), and customizable KiwiSaver retirement contributions (0% to 10%).
      </p>

      {/* How It Works */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How New Zealand Gross-to-Net Payroll &amp; Tax Withholding Is Calculated
      </h3>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>IRD Progressive PAYE Tax Brackets:</strong> Under Budget 2024 thresholds: 10.5% up to NZ$15,600; 17.5% from NZ$15,601 to NZ$53,500; 30.0% from NZ$53,501 to NZ$78,100; 33.0% from NZ$78,101 to NZ$180,000; and 39.0% above NZ$180,000.
        </li>
        <li>
          <strong>ACC Earners&apos; Levy:</strong> Deducted at 1.75% up to the NZ$156,641 maximum liable earnings cap for 2026–27 (1.67% up to NZ$152,790 for 2025–26) to fund no-fault accidental injury cover.
        </li>
        <li>
          <strong>KiwiSaver Employee Contribution:</strong> Configurable at 0%, 3% (default), 4%, 6%, 8%, or 10% of gross pay, deducted post-tax.
        </li>
        <li>
          <strong>KiwiSaver Employer Matching (3%):</strong> Employers contribute a mandatory minimum of 3.0% on top of gross salary toward your KiwiSaver account.
        </li>
      </ol>

      {/* Worked Examples */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Representative New Zealand Salary &amp; Net Take-Home Pay Examples (2026–2027 & 2025–2026)
      </h3>
      <div className="w-full overflow-x-auto mb-6 overscroll-x-contain">
        <table className="min-w-[640px] w-full text-left text-sm border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross (NZD)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">IRD PAYE Tax</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">ACC (1.75%) + KiwiSaver (3%)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Net Take-Home</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Monthly Net Pay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">NZ$60,000</td>
              <td className="p-3">NZ$10,220</td>
              <td className="p-3">NZ$2,850</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">NZ$46,930</td>
              <td className="p-3">NZ$3,911 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">NZ$90,000</td>
              <td className="p-3">NZ$19,577</td>
              <td className="p-3">NZ$4,275</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">NZ$66,148</td>
              <td className="p-3">NZ$5,512 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">NZ$130,000</td>
              <td className="p-3">NZ$32,777</td>
              <td className="p-3">NZ$6,175</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">NZ$91,048</td>
              <td className="p-3">NZ$7,587 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">NZ$200,000</td>
              <td className="p-3">NZ$57,077</td>
              <td className="p-3">NZ$8,741 (ACC capped)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">NZ$134,182</td>
              <td className="p-3">NZ$11,182 / mo</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> NZ-IRD-2026.1</div>
        <div><strong>Source Authority:</strong> Inland Revenue Department (IRD) & ACC</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> 2026–2027 & 2025–2026</div>
        <div><strong>Status:</strong> Verified Statutory Model</div>
        <div><strong>Last Verified:</strong> 2026-10-01</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>Independent Earner Tax Credit (IETC up to NZ$520/yr for incomes between NZ$24,000 and NZ$70,000 without Working for Families)</li>
            <li>Student Loan repayment deductions (12% on income above the annual repayment threshold)</li>
            <li>Employer Superannuation Contribution Tax (ESCT) deducted from the employer&apos;s 3% KiwiSaver match</li>
          </ul>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions (New Zealand Income Tax &amp; Payroll)
      </h3>
      <div className="space-y-4 mb-6">
        {NEW_ZEALAND_SALARY_FAQS.map((faq, index) => (
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
            href="/finance/salary-calculator/australia"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Australia Salary Calculator (ATO)
          </Link>
          <Link
            href="/finance/salary-calculator/united-kingdom"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            UK Salary Calculator (PAYE)
          </Link>
          <Link
            href="/finance/salary-calculator/canada"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Canada Salary Calculator (CRA)
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
