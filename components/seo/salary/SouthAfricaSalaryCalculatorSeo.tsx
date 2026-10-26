import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const SOUTH_AFRICA_SALARY_FAQS: FaqItem[] = [
  {
    question: 'What is the tax-free threshold and Primary Rebate in South Africa for 2026–2027?',
    answer:
      'For taxpayers under age 65, the SARS Primary Tax Rebate is R17,235 per year. Because the bottom tax bracket is 18%, dividing R17,235 by 0.18 establishes an effective annual tax-free threshold of R95,750 (R7,979 per month).',
  },
  {
    question: 'What are the SARS income tax brackets for 2026–2027?',
    answer:
      'The seven progressive SARS brackets are: 18% on R1–R237,100; 26% on R237,101–R370,500; 31% on R370,501–R512,800; 36% on R512,801–R673,000; 39% on R673,001–R857,900; 41% on R857,901–R1,817,000; and 45% on income above R1,817,000.',
  },
  {
    question: 'What is the maximum monthly UIF deduction in South Africa?',
    answer:
      "Unemployment Insurance Fund (UIF) contributions are calculated at 1.0% from the employee and 1.0% from the employer, capped at a maximum monthly remuneration ceiling of R17,712. Therefore, the maximum UIF deduction from an employee's payslip is R177.12 per month (R2,125.44 per year).",
  },
  {
    question: 'How do pension and retirement annuity (RA) contributions reduce PAYE?',
    answer:
      'Under Section 11F of the Income Tax Act, contributions to approved pension, provident, or retirement annuity funds are tax-deductible up to 27.5% of your taxable income or remuneration, subject to an annual ceiling of R350,000. You can enter pre-tax pension deductions directly into the calculator.',
  },
  {
    question: 'What is the Skills Development Levy (SDL)?',
    answer:
      "Employers with an annual payroll exceeding R500,000 must pay a 1.0% Skills Development Levy to SARS. SDL is strictly an employer payroll cost and is never deducted from an employee's salary.",
  }
];

export default function SouthAfricaSalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SOUTH_AFRICA_SALARY_FAQS.map((faq) => ({
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
        South Africa Salary Calculator 2026–2027: SARS PAYE Tax Tables, Primary Rebate & UIF
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your net take-home pay in South African Rand (ZAR / R) using official South African Revenue Service (SARS) 2026–2027 PAYE tax brackets (18% to 45%), the R17,235 Primary Tax Rebate, and Unemployment Insurance Fund (UIF) contributions.
      </p>

      {/* How It Works */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How South Africa Gross-to-Net Payroll &amp; Tax Withholding Is Calculated
      </h3>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>SARS 7-Bracket PAYE Schedule:</strong> Taxable income is assessed across 7 progressive brackets starting at 18% up to R237,100; 26% up to R370,500; 31% up to R512,800; 36% up to R673,000; 39% up to R857,900; 41% up to R1,817,000; and 45% above R1,817,000.
        </li>
        <li>
          <strong>Primary Tax Rebate (R17,235):</strong> Every individual taxpayer under age 65 receives an automatic R17,235 annual tax rebate subtracted from gross PAYE, creating an effective tax-free threshold of R95,750/year.
        </li>
        <li>
          <strong>Unemployment Insurance Fund (UIF 1%):</strong> Employees and employers each contribute 1.0% of remuneration up to the statutory earnings ceiling of R17,712/month (max R177.12/month or R2,125.44/year).
        </li>
        <li>
          <strong>Skills Development Levy (SDL 1%):</strong> Employers pay an additional 1.0% Skills Development Levy on gross payroll (employer cost only).
        </li>
      </ol>

      {/* Worked Examples */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Representative South Africa Salary &amp; Net Take-Home Pay Examples (2026–2027)
      </h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left text-sm border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross (ZAR)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">SARS PAYE (Net of Rebate)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Employee UIF (1% capped)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Net Take-Home</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Monthly Net Pay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">R240,000 (R20k/mo)</td>
              <td className="p-3">R26,197</td>
              <td className="p-3">R2,125 (Capped)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">R211,678</td>
              <td className="p-3">R17,640 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">R480,000 (R40k/mo)</td>
              <td className="p-3">R95,069</td>
              <td className="p-3">R2,125 (Capped)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">R382,806</td>
              <td className="p-3">R31,901 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">R750,000 (R62.5k/mo)</td>
              <td className="p-3">R191,599</td>
              <td className="p-3">R2,125 (Capped)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">R556,276</td>
              <td className="p-3">R46,356 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">R1,200,000 (R100k/mo)</td>
              <td className="p-3">R373,069</td>
              <td className="p-3">R2,125 (Capped)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">R824,806</td>
              <td className="p-3">R68,734 / mo</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> ZA-SARS-2026.1</div>
        <div><strong>Source Authority:</strong> South African Revenue Service (SARS)</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> 2026–2027</div>
        <div><strong>Status:</strong> Verified Statutory Model</div>
        <div><strong>Last Verified:</strong> 2026-10-01</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>Secondary (age 65–74: R9,444) and Tertiary (age 75+: R3,145) age-based tax rebates</li>
            <li>Section 6A/6B Medical Scheme Fees Tax Credits (R364/month for main member + first dependent)</li>
            <li>Section 11F retirement annuity / provident fund deductions (up to 27.5% of income, capped at R350,000/yr)</li>
          </ul>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions (South Africa Income Tax &amp; Payroll)
      </h3>
      <div className="space-y-4 mb-6">
        {SOUTH_AFRICA_SALARY_FAQS.map((faq, index) => (
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
            href="/finance/salary-calculator/australia"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Australia Salary Calculator (ATO)
          </Link>
          <Link
            href="/finance/salary-calculator/united-arab-emirates"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            UAE Salary Calculator
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
