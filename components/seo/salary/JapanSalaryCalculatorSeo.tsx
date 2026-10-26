import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const JAPAN_SALARY_FAQS: FaqItem[] = [
  {
    question: 'What percentage of gross salary is net take-home pay (Tedori) in Japan?',
    answer:
      'In Japan, net take-home pay (Tedori / 手取り) typically ranges between 75% and 80% of gross annual compensation for middle-income earners (¥4M to ¥8M), after accounting for Shakai Hoken social insurance, National Income Tax, and 10% Resident Tax.',
  },
  {
    question: 'How does the Japanese Employment Income Deduction (Kyuyo Shotoku Kojo) work?',
    answer:
      'Instead of itemizing work expenses, Japanese salaried employees automatically receive a statutory deduction under NTA Tax Answer No. 1410: minimum ¥550,000 for incomes up to ¥1.625M, scaling by formula up to a maximum deduction of ¥1,950,000 for salaries over ¥8,500,000.',
  },
  {
    question: 'What are the National Income Tax (Shotokuzei) brackets in Japan?',
    answer:
      'Taxable income (after employment, social insurance, and basic ¥480,000 deductions) is taxed at: 5% up to ¥1.95M; 10% up to ¥3.3M; 20% up to ¥6.95M; 23% up to ¥9.0M; 33% up to ¥18.0M; 40% up to ¥40.0M; and 45% above ¥40.0M, plus a 2.1% Reconstruction Special Tax on the base tax.',
  },
  {
    question: 'What is Juminzei (Resident Inhabitant Tax)?',
    answer:
      "Juminzei is Japan's local municipal and prefectural income tax, levied at a standard combined rate of 10% of your taxable income. In practice, Juminzei is billed in arrears starting in June of the following year, though annualized salary calculators include it so you see your true steady-state net income.",
  },
  {
    question: 'What does Shakai Hoken cover?',
    answer:
      "Shakai Hoken (社会保険) bundles Employees' Health Insurance (Kenko Hoken ~5%), Employees' Pension Insurance (Kosei Nenkin 9.15%), and Employment Insurance (Koyo Hoken ~0.6%), totaling roughly 14.5% to 15% each for employee and employer.",
  }
];

export default function JapanSalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: JAPAN_SALARY_FAQS.map((faq) => ({
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
        Japan Salary Calculator 2026: Shotokuzei, Juminzei Resident Tax & Shakai Hoken
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your net take-home pay (Tedori / 手取り) in Japanese Yen (¥) using National Tax Agency (NTA) Shotokuzei progressive brackets, the Employment Income Deduction (Kyuyo Shotoku Kojo), 10% Inhabitant Resident Tax (Juminzei), and Shakai Hoken social insurance.
      </p>

      {/* How It Works */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How Japan Gross-to-Net Payroll &amp; Tax Withholding Is Calculated
      </h3>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Employment Income Deduction (給与所得控除):</strong> Salaried employees receive a generous statutory sliding-scale deduction (from ¥550,000 minimum up to ¥1,950,000 maximum at ¥8.5M+ gross) plus the ¥480,000 Basic Exemption (Kiso Kojo).
        </li>
        <li>
          <strong>Social Insurance (社会保険 / Shakai Hoken):</strong> Covers Health Insurance (Kenko Hoken), Employees&apos; Pension (Kosei Nenkin), and Employment Insurance (~15.0% employee share, which is also tax-deductible).
        </li>
        <li>
          <strong>National Income Tax (所得税 / Shotokuzei):</strong> Assessed across 7 progressive brackets (5%, 10%, 20%, 23%, 33%, 40%, 45%) plus the 2.1% Special Reconstruction Income Tax surtax.
        </li>
        <li>
          <strong>Resident Inhabitant Tax (住民税 / Juminzei):</strong> Flat 10% local prefectural and municipal tax (6% municipal + 4% prefectural) assessed on taxable income.
        </li>
      </ol>

      {/* Worked Examples */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Representative Japan Salary &amp; Net Take-Home Pay Examples (2026)
      </h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left text-sm border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross (JPY)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Shakai Hoken (~15%)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">National + Resident Tax</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Net (Tedori)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Monthly Net Take-Home</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">¥4,000,000</td>
              <td className="p-3">¥600,000</td>
              <td className="p-3">¥245,000</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">¥3,155,000</td>
              <td className="p-3">¥262,917 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">¥6,000,000</td>
              <td className="p-3">¥900,000</td>
              <td className="p-3">¥498,500</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">¥4,601,500</td>
              <td className="p-3">¥383,458 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">¥10,000,000</td>
              <td className="p-3">¥1,500,000</td>
              <td className="p-3">¥1,376,000</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">¥7,124,000</td>
              <td className="p-3">¥593,667 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">¥15,000,000</td>
              <td className="p-3">¥2,250,000</td>
              <td className="p-3">¥2,958,000</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">¥9,792,000</td>
              <td className="p-3">¥816,000 / mo</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> JP-NTA-2026.1</div>
        <div><strong>Source Authority:</strong> National Tax Agency (NTA) & Japan Pension Service</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> 2026</div>
        <div><strong>Status:</strong> Limited Statutory Model (Shotokuzei + Juminzei + Shakai Hoken)</div>
        <div><strong>Last Verified:</strong> 2026-10-10</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>Prefecture-specific Kyokai Kenpo health insurance grade table variations and Nursing Care Insurance (Kaigo Hoken for ages 40–64)</li>
            <li>iDeCo individual defined contribution pension and Furusato Nozei hometown tax donation credits</li>
            <li>Dependent spouse deduction (Haigusha Kojo) phase-outs</li>
          </ul>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions (Japan Income Tax &amp; Payroll)
      </h3>
      <div className="space-y-4 mb-6">
        {JAPAN_SALARY_FAQS.map((faq, index) => (
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
            href="/finance/salary-calculator/south-korea"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            South Korea Salary Calculator (NTS)
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
