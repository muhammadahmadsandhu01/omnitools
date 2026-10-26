import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const SINGAPORE_SALARY_FAQS: FaqItem[] = [
  {
    question: 'What is the Singapore CPF Ordinary Wage (OW) ceiling in 2026?',
    answer:
      'Under the Singapore Budget 2023 phased schedule, the CPF Ordinary Wage (OW) monthly ceiling increased to S$7,400/month in 2025 and reaches S$8,000/month (S$96,000 annually) from 1 January 2026. For Citizens/PRs aged 55 and under, the maximum monthly employee CPF deduction on ordinary wages is 20% of S$8,000 = S$1,600/month (S$19,200/year).',
  },
  {
    question: 'Do foreigners on an Employment Pass (EP) or S-Pass pay CPF?',
    answer:
      "No. Foreign nationals working in Singapore on an Employment Pass, S-Pass, or Work Permit do not contribute to the Central Provident Fund (0% employee CPF and 0% employer CPF). You can toggle Residency Status to 'Foreigner / EP' in the calculator to model expatriate take-home pay.",
  },
  {
    question: 'What are the IRAS resident income tax rates for YA 2026?',
    answer:
      'Singapore resident tax rates start at 0% on the first S$20,000; 2% on the next S$10,000 (up to S$30k); 3.5% on the next S$10,000 (up to S$40k); 7% on the next S$40,000 (up to S$80k); 11.5% up to S$120k; 15% up to S$160k; 18% up to S$200k; 19% up to S$240k; 19.5% up to S$280k; 20% up to S$320k; 22% up to S$500k; 23% up to S$1M; and 24% above S$1M.',
  },
  {
    question: 'Are employee CPF contributions deductible for Singapore income tax?',
    answer:
      'Yes. Compulsory employee CPF contributions are automatically deducted from your gross income as statutory CPF Tax Relief before IRAS progressive tax rates are calculated, lowering your effective tax liability.',
  },
  {
    question: 'How is non-resident income taxed in Singapore?',
    answer:
      'Individuals who are in Singapore for fewer than 183 days in a calendar year are generally treated as non-residents for tax purposes. Non-resident employment income is taxed at the higher of a flat 15% rate (without personal reliefs) or the progressive resident rate.',
  }
];

export default function SingaporeSalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SINGAPORE_SALARY_FAQS.map((faq) => ({
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
        Singapore Salary Calculator YA 2026: IRAS Resident Tax & CPF Ordinary Wage Ceiling
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your net take-home salary in Singapore (SGD) using official Inland Revenue Authority of Singapore (IRAS) resident progressive tax rates (0% to 24%) and Central Provident Fund (CPF) contribution rules with the S$8,000/month Ordinary Wage ceiling.
      </p>

      {/* How It Works */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How Singapore Gross-to-Net Payroll &amp; Tax Withholding Is Calculated
      </h3>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Central Provident Fund (CPF):</strong> For Singapore Citizens and 3rd-year+ PRs aged 55 and below, employees contribute 20% and employers contribute 17% of Ordinary Wages up to the S$8,000 monthly ceiling (S$96,000/year in 2026; S$7,400/mo in 2025). Foreigners on EP/S-Pass pay 0% CPF.
        </li>
        <li>
          <strong>Taxable Chargeable Income:</strong> Compulsory employee CPF contributions are tax-deductible, reducing your assessable income before IRAS progressive brackets are evaluated.
        </li>
        <li>
          <strong>IRAS Progressive Tax Brackets:</strong> The first S$20,000 of chargeable income is tax-free (0%). Subsequent tiers scale progressively from 2%, 3.5%, 7%, 11.5%, 15%, 18%, 19%, 19.5%, 20%, 22%, 23%, up to 24% above S$1,000,000.
        </li>
        <li>
          <strong>Net Spendable Pay & Employer Cost:</strong> Net salary equals Gross Pay minus Employee CPF and IRAS Income Tax. Total Employer Cost includes Gross Pay plus the 17% Employer CPF contribution.
        </li>
      </ol>

      {/* Worked Examples */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Representative Singapore Salary &amp; Net Take-Home Pay Examples (YA 2026 (Calendar 2026 & 2025 CPF Ceilings))
      </h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left text-sm border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross (SGD)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Employee CPF (20% capped)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">IRAS Income Tax</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Net Annual Pay (Citizen)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Employer CPF (17%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">S$60,000 (S$5k/mo)</td>
              <td className="p-3">S$12,000</td>
              <td className="p-3">S$900</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">S$47,100 (S$3,925/mo)</td>
              <td className="p-3">+S$10,200</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">S$96,000 (S$8k/mo)</td>
              <td className="p-3">S$19,200 (Max OW)</td>
              <td className="p-3">S$3,134</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">S$73,666 (S$6,139/mo)</td>
              <td className="p-3">+S$16,320</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">S$150,000 (S$12.5k/mo)</td>
              <td className="p-3">S$19,200 (Max OW)</td>
              <td className="p-3">S$9,500</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">S$121,300 (S$10,108/mo)</td>
              <td className="p-3">+S$16,320</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">S$240,000 (S$20k/mo)</td>
              <td className="p-3">S$19,200 (Max OW)</td>
              <td className="p-3">S$24,180</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">S$196,620 (S$16,385/mo)</td>
              <td className="p-3">+S$16,320</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> SG-IRAS-2026.1</div>
        <div><strong>Source Authority:</strong> Inland Revenue Authority of Singapore (IRAS) & CPF Board</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> YA 2026 (Calendar 2026 & 2025 CPF Ceilings)</div>
        <div><strong>Status:</strong> Limited Statutory Model (IRAS Resident + CPF Age &le; 55)</div>
        <div><strong>Last Verified:</strong> 2026-10-10</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>Graduated CPF rates for 1st-year and 2nd-year Singapore Permanent Residents (SPR)</li>
            <li>Age-stepped CPF contribution rates for employees aged above 55 (55–60, 60–65, 65–70, 70+)</li>
            <li>Supplementary Retirement Scheme (SRS) voluntary tax relief and NSman/Parenthood tax reliefs</li>
          </ul>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions (Singapore Income Tax &amp; Payroll)
      </h3>
      <div className="space-y-4 mb-6">
        {SINGAPORE_SALARY_FAQS.map((faq, index) => (
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
            href="/finance/salary-calculator/united-arab-emirates"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            UAE Salary Calculator (0% Tax)
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
