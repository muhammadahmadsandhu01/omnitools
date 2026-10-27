import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const PAKISTAN_SALARY_FAQS: FaqItem[] = [
  {
    question: 'What are the FBR salaried income tax slabs in Pakistan for FY 2026–2027 (Finance Act 2026)?',
    answer:
      'Under the First Schedule, Part I, Division I of the Income Tax Ordinance 2001 (Finance Act 2026), salaried slabs are: 0% up to PKR 600,000; 1% on PKR 600,001–1,200,000; PKR 6,000 + 11% on PKR 1,200,001–2,200,000; PKR 116,000 + 20% on PKR 2,200,001–3,200,000; PKR 316,000 + 25% on PKR 3,200,001–4,100,000; PKR 541,000 + 29% on PKR 4,100,001–5,600,000; PKR 976,000 + 32% on PKR 5,600,001–7,000,000; and PKR 1,424,000 + 35% above PKR 7,000,000.',
  },
  {
    question: 'How do FY 2026–2027 slabs compare with FY 2025–2026 (Finance Act 2025) and FY 2024–2025?',
    answer:
      'In FY 2024–25 (Finance Act 2024), the second slab was 5% and the third slab was 15%. In FY 2025–26 (Finance Act 2025), rates were reduced to 1%, 11%, 23%, 30%, and 35% (with a 9% surcharge above PKR 10M). In FY 2026–27 (Finance Act 2026), middle and upper-middle slabs were further reduced to 20%, 25%, 29%, and 32% up to PKR 7,000,000, and the 9% high-earner salaried surcharge was abolished.',
  },
  {
    question: 'How is employee EOBI contribution calculated in Pakistan?',
    answer:
      "The Employees' Old-Age Benefits Institution (EOBI) mandates an employee contribution of 1% and an employer contribution of 5% based on the statutory minimum wage (PKR 37,000/month). The standard employee deduction is PKR 370 per month (PKR 4,440 per year), while the employer contributes PKR 1,850 per month (PKR 22,200 per year).",
  },
  {
    question: 'How does the 10% Medical Allowance tax exemption (Clause 139) work?',
    answer:
      'Under Clause 139, Part I of the Second Schedule to the Income Tax Ordinance 2001, medical allowance paid by an employer is exempt from income tax up to 10% of basic salary (equivalent to 1/11th of gross pay when structured as Basic + 10% Medical), provided free hospitalization or medical reimbursement is not separately provided under the employment terms.',
  },
  {
    question: 'What qualifies an individual as a salaried taxpayer in Pakistan?',
    answer:
      'An individual is classified as a salaried taxpayer under the Income Tax Ordinance if salary income constitutes more than 75% of their total taxable income for the fiscal year. If business or freelance income exceeds 25%, non-salaried/AOP progressive slabs apply.',
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
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-xs">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        Pakistan Salary Calculator 2026–2027: Official FBR Tax Slabs, Multi-Year Comparison &amp; EOBI Guide
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your exact net take-home salary in Pakistan across <strong>FY 2026–2027 (Finance Act 2026)</strong>,{' '}
        <strong>FY 2025–2026 (Finance Act 2025)</strong>, and <strong>FY 2024–2025 (Finance Act 2024)</strong> under the
        Federal Board of Revenue (FBR) First Schedule, Part I, Division I salaried tax schedule. Model 10% Medical Allowance
        exemptions (Clause 139), Section 60 Zakat deductions, EOBI contributions, and reverse Net-to-Gross pay targets.
      </p>

      {/* How It Works */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How Gross-to-Net Salary Calculation Works in Pakistan
      </h3>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Annual Gross Salary &amp; Exemptions:</strong> Contractual monthly gross pay is multiplied by 12. If your salary structure includes a 10% Medical Allowance (Clause 139) or Section 60 Zakat / recognized Provident Fund deductions, those amounts are deducted before computing taxable salary.
        </li>
        <li>
          <strong>FBR Progressive Tax Slabs (FY 2026–27):</strong> Annual taxable income up to PKR 600,000 (PKR 50,000/month) is 100% tax-free (0%). Above PKR 600,000, progressive rates of 1%, 11%, 20%, 25%, 29%, 32%, and 35% apply only to the income within each slab.
        </li>
        <li>
          <strong>EOBI Deduction:</strong> Mandatory employee EOBI of 1% on the statutory minimum wage (PKR 37,000/month = PKR 370/month or PKR 4,440/year) is subtracted alongside monthly withholding tax.
        </li>
        <li>
          <strong>Multi-Year Budget Savings:</strong> Compare your exact monthly tax under Finance Act 2026 vs. Finance Act 2025 and Finance Act 2024 with a single click.
        </li>
      </ol>

      {/* Worked Examples */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Representative Pakistan Salary &amp; Tax Examples (FY 2026–2027 vs FY 2025–2026)
      </h3>
      <div className="w-full overflow-x-auto mb-6 overscroll-x-contain">
        <table className="min-w-[640px] w-full text-left text-sm border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Monthly Gross</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">FY 2026–27 Monthly Tax</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">FY 2025–26 Monthly Tax</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">FY 2026–27 Net Take-Home (after EOBI)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">PKR 50,000</td>
              <td className="p-3">PKR 600,000</td>
              <td className="p-3">PKR 0 (0%)</td>
              <td className="p-3">PKR 0 (0%)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">PKR 49,630 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">PKR 100,000</td>
              <td className="p-3">PKR 1,200,000</td>
              <td className="p-3">PKR 500 / mo (PKR 6,000/yr)</td>
              <td className="p-3">PKR 500 / mo (PKR 6,000/yr)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">PKR 99,130 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">PKR 150,000</td>
              <td className="p-3">PKR 1,800,000</td>
              <td className="p-3">PKR 6,000 / mo (PKR 72,000/yr)</td>
              <td className="p-3">PKR 6,000 / mo (PKR 72,000/yr)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">PKR 143,630 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">PKR 250,000</td>
              <td className="p-3">PKR 3,000,000</td>
              <td className="p-3">PKR 23,000 / mo (PKR 276,000/yr)</td>
              <td className="p-3">PKR 25,000 / mo (PKR 300,000/yr)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">PKR 226,630 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">PKR 500,000</td>
              <td className="p-3">PKR 6,000,000</td>
              <td className="p-3">PKR 92,000 / mo (PKR 1,104,000/yr)</td>
              <td className="p-3">PKR 106,750 / mo (PKR 1,281,000/yr)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">PKR 407,630 / mo</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> PK-FBR-2026.2</div>
        <div><strong>Source Authority:</strong> Federal Board of Revenue (FBR) Pakistan</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> FY 2026–2027 (Finance Act 2026), FY 2025–2026 (Finance Act 2025) &amp; FY 2024–2025</div>
        <div><strong>Status:</strong> Verified Statutory Model (100% Code Verified)</div>
        <div><strong>Last Verified:</strong> 2026-10-20</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>Provincial professional taxes (Punjab / Sindh / KP / Balochistan professional tax schedules)</li>
            <li>Full-time teacher / researcher tax reduction under Second Schedule Clause 9A</li>
            <li>Company-provided vehicle perquisite valuation under Section 13</li>
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
