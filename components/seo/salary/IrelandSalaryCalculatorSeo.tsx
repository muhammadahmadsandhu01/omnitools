import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const IRELAND_SALARY_FAQS: FaqItem[] = [
  {
    question: 'What is the 2026 standard rate cut-off point for PAYE tax in Ireland?',
    answer:
      'For a single taxpayer, the standard 20% rate cut-off band is €44,000 per year. Earnings up to €44,000 are taxed at 20%, and earnings above €44,000 are taxed at the 40% higher rate.',
  },
  {
    question: 'How do the €2,000 Personal and €2,000 Employee PAYE Tax Credits work?',
    answer:
      'Unlike tax deductions that only reduce taxable income, Irish tax credits are subtracted dollar-for-dollar from your calculated gross PAYE tax bill. Every single PAYE employee receives a €2,000 Single Personal Credit plus a €2,000 Employee PAYE Credit (€4,000 total), wiping out the 20% tax on your first €20,000 of earnings.',
  },
  {
    question: 'What are the Universal Social Charge (USC) rates in Ireland?',
    answer:
      'If your annual income exceeds the €13,000 exemption threshold, USC is charged at: 0.5% on the first €12,012; 2.0% from €12,012.01 to €27,382; 3.0% from €27,382.01 to €70,044; and 8.0% on PAYE income above €70,044.',
  },
  {
    question: 'How much is Class A PRSI for employees and employers?',
    answer:
      'Most private-sector employees fall under PRSI Class A, paying 4.10% on all gross earnings (provided weekly income exceeds €352, with a tapered PRSI credit between €352 and €424/week). Employers pay 11.15% Class A PRSI on top of gross salary.',
  },
  {
    question: 'Do pension contributions reduce USC and PRSI in Ireland?',
    answer:
      'Employee occupational pension and PRSA contributions qualify for income tax relief at your marginal PAYE rate (20% or 40%), subject to age-related percentage limits and the €115,000 earnings cap, but they do not reduce USC or employee PRSI.',
  }
];

export default function IrelandSalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: IRELAND_SALARY_FAQS.map((faq) => ({
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
        Ireland Salary Calculator 2026: Revenue PAYE Tax, USC & PRSI Take-Home Pay
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your net take-home pay in Ireland (€) using official Revenue Commissioners 2026 PAYE tax bands (20% and 40%), Personal and Employee Tax Credits (€4,000 combined), Universal Social Charge (USC), and Class A PRSI.
      </p>

      {/* How It Works */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How Ireland Gross-to-Net Payroll &amp; Tax Withholding Is Calculated
      </h3>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>PAYE Income Tax Bands:</strong> For a single individual, the first €44,000 of annual income is taxed at the 20% Standard Rate, and any balance above €44,000 is taxed at the 40% Higher Rate.
        </li>
        <li>
          <strong>Tax Credits (€4,000 Combined):</strong> Gross PAYE tax is reduced directly by the Single Person Tax Credit (€2,000) and the Employee PAYE Tax Credit (€2,000), making the first €20,000 effectively free of PAYE income tax.
        </li>
        <li>
          <strong>Universal Social Charge (USC):</strong> Exempt if total income is €13,000 or less. Otherwise charged at 0.5% up to €12,012; 2.0% from €12,012 to €27,382; 3.0% from €27,382 to €70,044; and 8.0% on balance above €70,044.
        </li>
        <li>
          <strong>Class A PRSI (4.10%):</strong> Pay Related Social Insurance is deducted at 4.10% for employees (exempt if weekly pay &le; €352) and 11.15% for employers.
        </li>
      </ol>

      {/* Worked Examples */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Representative Ireland Salary &amp; Net Take-Home Pay Examples (2026)
      </h3>
      <div className="w-full overflow-x-auto mb-6 overscroll-x-contain">
        <table className="min-w-[640px] w-full text-left text-sm border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross (EUR)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Net PAYE Tax</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">USC + PRSI (4.1%)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Net Take-Home</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Monthly Net Pay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€40,000</td>
              <td className="p-3">€4,000</td>
              <td className="p-3">€2,386</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€33,614</td>
              <td className="p-3">€2,801 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€60,000</td>
              <td className="p-3">€11,200</td>
              <td className="p-3">€4,106</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€44,694</td>
              <td className="p-3">€3,725 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€85,000</td>
              <td className="p-3">€21,200</td>
              <td className="p-3">€6,329</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€57,471</td>
              <td className="p-3">€4,789 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€120,000</td>
              <td className="p-3">€35,200</td>
              <td className="p-3">€10,564</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€74,236</td>
              <td className="p-3">€6,186 / mo</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> IE-REV-2026.1</div>
        <div><strong>Source Authority:</strong> Revenue Commissioners & Department of Social Protection</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> 2026</div>
        <div><strong>Status:</strong> Verified Statutory Model</div>
        <div><strong>Last Verified:</strong> 2026-10-01</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>Married / Civil Partner dual-earner standard rate cut-off bands (up to €53,000 / €88,000)</li>
            <li>Rent Tax Credit (€1,000) and Home Carer Tax Credit</li>
            <li>Self-employed Class S PRSI and 3% USC surcharge on non-PAYE income over €100,000</li>
          </ul>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions (Ireland Income Tax &amp; Payroll)
      </h3>
      <div className="space-y-4 mb-6">
        {IRELAND_SALARY_FAQS.map((faq, index) => (
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
            href="/finance/salary-calculator/united-kingdom"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            UK Salary Calculator (PAYE/NI)
          </Link>
          <Link
            href="/finance/salary-calculator/netherlands"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Netherlands Salary Calculator
          </Link>
          <Link
            href="/finance/salary-calculator/germany"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Germany Salary Calculator (EStG)
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
