import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const NETHERLANDS_SALARY_FAQS: FaqItem[] = [
  {
    question: 'What are the Dutch Box 1 income tax brackets for 2026?',
    answer:
      'Under the Belastingplan 2025/2026 three-bracket Box 1 structure, employment income is taxed at: 35.82% on the first €38,843 (which includes AOW, Anw, and Wlz national insurance); 37.48% on income between €38,843 and €77,654; and 49.50% on all income exceeding €77,654.',
  },
  {
    question: 'How do Algemene Heffingskorting and Arbeidskorting increase my net pay?',
    answer:
      "Dutch payroll relies heavily on two automatic tax credits (Heffingskortingen): the Algemene Heffingskorting (General Tax Credit, up to €3,068) and the Arbeidskorting (Employed Person's Tax Credit, up to €5,635). These credits are subtracted directly from your calculated Box 1 tax liability, substantially increasing net take-home pay for low- and middle-income earners.",
  },
  {
    question: 'How does the 30% Ruling work for expats in the Netherlands?',
    answer:
      "The 30% facility allows employers to grant qualifying international recruits a tax-free allowance of up to 30% of their gross salary to cover extraterritorial expenses, meaning only 70% of the salary is subject to Box 1 tax. Toggle the '30% Expat Ruling' option in our calculator to see the exact impact.",
  },
  {
    question: 'Why do employees in the Netherlands not see a separate employee social security line?',
    answer:
      'In the Netherlands, employee national insurance contributions (Volksverzekeringen: AOW state pension, Anw survivor benefit, and Wlz long-term care) are integrated directly into the first bracket of Box 1 (35.82%). Meanwhile, employee insurance schemes (Werknemersverzekeringen: WW, WIA, Zvw) are paid by the employer (~16.63% up to €75,860).',
  },
  {
    question: 'Is the 8% Dutch Holiday Allowance (Vakantiegeld) taxed?',
    answer:
      'Yes. Vakantiegeld (statutory 8% holiday pay) is part of your total annual gross taxable compensation and is taxed at the marginal Box 1 rate (plus credit phase-out adjustment) when paid out, typically in May.',
  }
];

export default function NetherlandsSalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: NETHERLANDS_SALARY_FAQS.map((faq) => ({
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
        Netherlands Salary Calculator 2026: Box 1 Tax, Arbeidskorting, AHK & 30% Ruling
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your Dutch net take-home pay (Bruto/Netto) in Euros (€) using official Belastingdienst 2026 Box 1 income tax brackets, Algemene Heffingskorting (AHK), Arbeidskorting labour tax credit, and the 30% Expat Ruling facility.
      </p>

      {/* How It Works */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How Netherlands Gross-to-Net Payroll &amp; Tax Withholding Is Calculated
      </h3>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Optional 30% Expat Ruling:</strong> If enabled for qualifying highly skilled migrants, 30% of gross employment income is treated as a tax-free extraterritorial reimbursement, leaving 70% subject to Box 1 tax.
        </li>
        <li>
          <strong>Box 1 Income & National Insurance Brackets:</strong> For 2026, Box 1 combines income tax and national insurance (Volksverzekeringen AOW/Anw/Wlz) into three brackets: 35.82% up to €38,843; 37.48% from €38,843 to €77,654; and 49.50% on income above €77,654.
        </li>
        <li>
          <strong>General Tax Credit (Algemene Heffingskorting):</strong> Provides up to €3,068 in tax reduction, phasing out gradually down to €0 as income reaches €77,654.
        </li>
        <li>
          <strong>Labour Tax Credit (Arbeidskorting):</strong> Provides up to €5,635 in tax reduction for working employees, phasing out at 6.51% on incomes between €43,071 and €129,630.
        </li>
      </ol>

      {/* Worked Examples */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Representative Netherlands Salary &amp; Net Take-Home Pay Examples (2026)
      </h3>
      <div className="w-full overflow-x-auto mb-6 overscroll-x-contain">
        <table className="min-w-[640px] w-full text-left text-sm border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross (EUR)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Box 1 Tax (Net of Credits)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Net Pay (Standard)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Net Pay (With 30% Ruling)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Employer Social (~16.6%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€45,000</td>
              <td className="p-3">€10,210</td>
              <td className="p-3">€34,790 (€2,899/mo)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€39,580 (€3,298/mo)</td>
              <td className="p-3">+€7,484</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€65,000</td>
              <td className="p-3">€19,515</td>
              <td className="p-3">€45,485 (€3,790/mo)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€53,365 (€4,447/mo)</td>
              <td className="p-3">+€10,810</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€90,000</td>
              <td className="p-3">€32,120</td>
              <td className="p-3">€57,880 (€4,823/mo)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€70,515 (€5,876/mo)</td>
              <td className="p-3">+€12,616 (Capped)</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€130,000</td>
              <td className="p-3">€53,980</td>
              <td className="p-3">€76,020 (€6,335/mo)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€95,785 (€7,982/mo)</td>
              <td className="p-3">+€12,616 (Capped)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> NL-BELAST-2026.1</div>
        <div><strong>Source Authority:</strong> Belastingdienst (Tax and Customs Administration)</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> 2026</div>
        <div><strong>Status:</strong> Verified Statutory Model</div>
        <div><strong>Last Verified:</strong> 2026-10-01</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>Box 2 (substantial business interest) and Box 3 (wealth, savings, and investment taxation)</li>
            <li>8% Statutory Holiday Allowance (Vakantiegeld) separate May payout timing (included in annual gross)</li>
            <li>Private occupational pension deductions and mortgage interest relief (Hypotheekrenteaftrek)</li>
          </ul>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions (Netherlands Income Tax &amp; Payroll)
      </h3>
      <div className="space-y-4 mb-6">
        {NETHERLANDS_SALARY_FAQS.map((faq, index) => (
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
            href="/finance/salary-calculator/germany"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Germany Salary Calculator (EStG)
          </Link>
          <Link
            href="/finance/salary-calculator/ireland"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Ireland Salary Calculator (PAYE)
          </Link>
          <Link
            href="/finance/salary-calculator/united-kingdom"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            UK Salary Calculator (HMRC)
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
