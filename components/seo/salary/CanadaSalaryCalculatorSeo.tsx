import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const CANADA_SALARY_FAQS: FaqItem[] = [
  {
    question: 'What are the 2026 CRA federal income tax brackets in Canada?',
    answer:
      'For the 2026 tax year, federal income tax brackets are indexed by 2.0% and the lowest federal rate is reduced to 14.0% (from 15.0% in 2025). The 2026 brackets are: 14% on income up to $57,375; 20.5% from $57,375 to $114,750; 26% from $114,750 to $177,882; 29% from $177,882 to $253,414; and 33% on income exceeding $253,414.',
  },
  {
    question: 'What is the 2026 Canada Pension Plan (CPP) maximum contribution?',
    answer:
      "In 2026, the Year's Maximum Pensionable Earnings (YMPE) ceiling is $74,600 with a basic exemption of $3,500. Employees and employers each contribute 5.95% on earnings between $3,500 and $74,600, resulting in a maximum annual CPP1 contribution of $4,230.45 each.",
  },
  {
    question: 'What is the 2026 Employment Insurance (EI) maximum insurable earnings cap?',
    answer:
      'For 2026, the Maximum Insurable Earnings (MIE) ceiling is $68,900 with an employee premium rate of 1.63%, yielding a maximum annual employee EI deduction of $1,123.07. Employers pay 1.4 times the employee rate (2.282%, or up to $1,572.30).',
  },
  {
    question: 'How does the Basic Personal Amount (BPA) work in Canada?',
    answer:
      'The Basic Personal Amount is a non-refundable tax credit that every Canadian resident can claim. In 2026, the federal BPA is $16,452 ($15,705 in 2025), meaning you pay zero federal income tax on your first $16,452 of taxable earnings.',
  },
  {
    question: 'How are provincial taxes modeled alongside federal CRA tax?',
    answer:
      'Canadian employees pay both federal and provincial/territorial income tax (collected jointly by the CRA outside Quebec). This calculator allows you to select your province (Ontario, British Columbia, Alberta, Quebec, etc.) to model combined federal and provincial payroll withholdings.',
  }
];

export default function CanadaSalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: CANADA_SALARY_FAQS.map((faq) => ({
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
        Canada Salary Calculator 2026: CRA Federal Tax, CPP, EI & Provincial Take-Home Pay
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your estimated net paycheck and annual take-home pay in Canada using official Canada Revenue Agency (CRA) 2026 T4032 payroll parameters, Basic Personal Amount ($16,452), Canada Pension Plan (CPP1), and Employment Insurance (EI) ceilings.
      </p>

      {/* How It Works */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How Canada Gross-to-Net Payroll &amp; Tax Withholding Is Calculated
      </h3>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Basic Personal Amount (BPA):</strong> A non-refundable federal tax credit on the first $16,452 of income in 2026 ($15,705 in 2025) reduces federal tax payable.
        </li>
        <li>
          <strong>Federal Progressive Brackets:</strong> Taxable income is assessed across five federal brackets: 14% (reduced from 15% in 2025) up to $57,375; 20.5% up to $114,750; 26% up to $177,882; 29% up to $253,414; and 33% on excess.
        </li>
        <li>
          <strong>Canada Pension Plan (CPP1):</strong> Deducted at 5.95% on pensionable earnings between the $3,500 basic exemption and the $74,600 Year&apos;s Maximum Pensionable Earnings (YMPE) ceiling in 2026 (max $4,230.45 employee / $4,230.45 employer).
        </li>
        <li>
          <strong>Employment Insurance (EI):</strong> Deducted at 1.63% on insurable earnings up to the $68,900 Maximum Insurable Earnings (MIE) ceiling in 2026 (max $1,123.07 employee; employer contributes 1.4x = $1,572.30).
        </li>
      </ol>

      {/* Worked Examples */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Representative Canada Salary &amp; Net Take-Home Pay Examples (2026 (with 2025 comparison))
      </h3>
      <div className="w-full overflow-x-auto mb-6 overscroll-x-contain">
        <table className="min-w-[640px] w-full text-left text-sm border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross (CAD)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Federal & Prov. Tax</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">CPP1 + EI Deductions</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Net Annual Take-Home</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Monthly Net Pay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">C$55,000</td>
              <td className="p-3">C$7,418</td>
              <td className="p-3">C$3,962</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">C$43,620</td>
              <td className="p-3">C$3,635 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">C$85,000</td>
              <td className="p-3">C$15,942</td>
              <td className="p-3">C$5,354 (CPP/EI capped)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">C$63,704</td>
              <td className="p-3">C$5,309 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">C$125,000</td>
              <td className="p-3">C$28,560</td>
              <td className="p-3">C$5,354 (CPP/EI capped)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">C$91,086</td>
              <td className="p-3">C$7,591 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">C$180,000</td>
              <td className="p-3">C$48,195</td>
              <td className="p-3">C$5,354 (CPP/EI capped)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">C$126,451</td>
              <td className="p-3">C$10,538 / mo</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> CA-CRA-2026.2</div>
        <div><strong>Source Authority:</strong> Canada Revenue Agency (CRA)</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> 2026 (with 2025 comparison)</div>
        <div><strong>Status:</strong> Limited Statutory Model (Federal Statutory + Provincial Benchmark)</div>
        <div><strong>Last Verified:</strong> 2026-10-01</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>CPP2 Second Additional Contribution (4% on earnings between YMPE $74,600 and YAMPE $85,000 for 2026)</li>
            <li>Quebec Parental Insurance Plan (QPIP) and specific multi-tier provincial surtaxes (e.g. Ontario Health Premium)</li>
            <li>RRSP deduction room and Child Care Expense deductions</li>
          </ul>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions (Canada Income Tax &amp; Payroll)
      </h3>
      <div className="space-y-4 mb-6">
        {CANADA_SALARY_FAQS.map((faq, index) => (
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
            href="/finance/salary-calculator/united-states"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            US Salary Calculator (IRS/FICA)
          </Link>
          <Link
            href="/finance/salary-calculator/united-kingdom"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            UK Salary Calculator (PAYE/NI)
          </Link>
          <Link
            href="/finance/salary-calculator/australia"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Australia Salary Calculator (ATO)
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
