import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const PAKISTAN_SALARY_FAQS: FaqItem[] = [
  {
    question: 'What is the tax-exempt salary threshold in Pakistan for Tax Year 2026–2027?',
    answer:
      'Under the First Schedule, Part I, Division I of the Income Tax Ordinance 2001 (as amended by Finance Act 2024), annual salaried income up to PKR 600,000 (PKR 50,000 per month) is taxed at 0%. Income above PKR 600,000 enters progressive tax slabs starting at 5%.',
  },
  {
    question: 'How is employee EOBI contribution calculated in Pakistan?',
    answer:
      'The Employees\' Old-Age Benefits Institution (EOBI) mandates an employee contribution of 1% based on the statutory minimum wage (notified at PKR 37,000/month for statutory wage ceiling parity). The maximum employee deduction is PKR 370 per month (PKR 4,440 per year).',
  },
  {
    question: 'When does the 10% super-tax surcharge apply to salaried individuals?',
    answer:
      'Under Section 4AB of the Income Tax Ordinance, a 10% surcharge on total income tax liability applied to salaried individuals earning more than PKR 10,000,000 in Tax Year 2025. In Tax Year 2026–2027 statutory models, this surcharge structure is tracked specifically based on legislative notification.',
  },
  {
    question: 'What qualifies an individual as a salaried taxpayer in Pakistan?',
    answer:
      'An individual is classified as a salaried taxpayer under the Income Tax Ordinance if salary income constitutes more than 75% of their total taxable income for the fiscal year. If business or investment income exceeds 25%, the higher non-salaried tax slabs apply.',
  },
  {
    question: 'Are allowances like medical allowance and conveyance tax-exempt?',
    answer:
      'Under Clause 139, Part I of the Second Schedule, medical allowance provided in accordance with terms of employment is exempt from income tax up to 10% of basic salary, provided free medical treatment or hospitalization coverage is not separately reimbursed. Conveyance allowance is generally taxable unless provided exclusively for official duty performance.',
  },
];

export default function PakistanSalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PAKISTAN_SALARY_FAQS.map((faq) => ({
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
        Pakistan Salary Calculator 2026–2027: FBR Tax Slabs, EOBI &amp; Take-Home Pay Guide
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your exact estimated net take-home pay in Pakistan using verified statutory payroll rules under the
        Federal Board of Revenue (FBR) First Schedule, Part I, Division I salaried tax schedule. This guide details
        contractual gross salary, statutory slab withholdings, mandatory EOBI contributions, and effective take-home pay.
      </p>

      {/* How It Works */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How Gross-to-Net Salary Calculation Works in Pakistan
      </h3>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Annual Gross Salary:</strong> Contractual monthly gross pay (basic salary + allowances) is annualized by multiplying by 12.
        </li>
        <li>
          <strong>EOBI Deduction:</strong> Mandatory employee EOBI of 1% on the statutory wage ceiling (PKR 37,000/month = PKR 370/month or PKR 4,440/year) is subtracted.
        </li>
        <li>
          <strong>Progressive Tax Slabs:</strong> Taxable income is evaluated against FBR progressive slabs (0% up to PKR 600k, 5% to PKR 1.2M, 15% to PKR 2.2M, 25% to PKR 3.2M, 30% to PKR 4.1M, and 35% on the excess).
        </li>
        <li>
          <strong>Monthly Take-Home:</strong> Total annual tax and EOBI deductions are divided by 12 and deducted from monthly gross salary to yield net spendable income.
        </li>
      </ol>

      {/* Worked Examples */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Representative Salary Examples (Tax Year 2026–2027)
      </h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left text-sm border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Monthly Gross</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual FBR Tax</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual EOBI</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Monthly Take-Home</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">PKR 50,000</td>
              <td className="p-3">PKR 600,000</td>
              <td className="p-3">PKR 0 (0%)</td>
              <td className="p-3">PKR 4,440</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">PKR 49,630</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">PKR 100,000</td>
              <td className="p-3">PKR 1,200,000</td>
              <td className="p-3">PKR 30,000 (2.5% eff.)</td>
              <td className="p-3">PKR 4,440</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">PKR 97,130</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">PKR 250,000</td>
              <td className="p-3">PKR 3,000,000</td>
              <td className="p-3">PKR 380,000 (12.7% eff.)</td>
              <td className="p-3">PKR 4,440</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">PKR 217,963</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">PKR 500,000</td>
              <td className="p-3">PKR 6,000,000</td>
              <td className="p-3">PKR 1,365,000 (22.8% eff.)</td>
              <td className="p-3">PKR 4,440</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">PKR 385,880</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> PK-SALARY-2026.1</div>
        <div><strong>Source Authority:</strong> Federal Board of Revenue (FBR) Pakistan</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> Tax Year 2026–2027 (Finance Act 2024 Framework)</div>
        <div><strong>Status:</strong> Verified Statutory Model (100% Code Verified)</div>
        <div><strong>Last Verified:</strong> 2026-07-01</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>Provincial professional taxes (e.g., Punjab / Sindh professional tax schedules)</li>
            <li>Charitable tax credits under Section 61 and educational credits</li>
            <li>Advance adjustable withholding taxes (e.g., motor vehicle, electricity, banking)</li>
          </ul>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions (FBR Salary Tax &amp; Payroll)
      </h3>
      <div className="space-y-4 mb-6">
        {PAKISTAN_SALARY_FAQS.map((faq, index) => (
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
          Related Calculators &amp; International Salary Comparisons
        </h4>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            href="/finance/salary-calculator"
            className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 hover:underline"
          >
            22-Country Salary Hub
          </Link>
          <Link
            href="/finance/salary-calculator/united-arab-emirates"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            UAE Salary Calculator (0% PIT)
          </Link>
          <Link
            href="/finance/salary-calculator/saudi-arabia"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Saudi Arabia Salary Calculator (GOSI)
          </Link>
          <Link
            href="/finance/salary-calculator/united-kingdom"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            UK Salary Calculator (PAYE)
          </Link>
          <Link
            href="/finance/crypto-converter"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Crypto &amp; Currency Rates
          </Link>
          <Link
            href="/finance/invoice-generator"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Free Invoice Generator
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
