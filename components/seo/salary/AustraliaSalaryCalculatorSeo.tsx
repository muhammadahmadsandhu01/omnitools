import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const AUSTRALIA_SALARY_FAQS: FaqItem[] = [
  {
    question: 'What are the Australian ATO income tax brackets for FY 2026–2027?',
    answer:
      'For FY 2026–2027 (effective 1 July 2026), resident tax rates are: 0% on $0–$18,200; 15% on $18,201–$45,000 (reduced from 16% in FY 2025–26); 30% on $45,001–$135,000; 37% on $135,001–$190,000; and 45% on income over $190,000.',
  },
  {
    question: 'How does the Low Income Tax Offset (LITO) reduce my tax?',
    answer:
      'If your taxable income is $37,500 or less, you receive the maximum LITO offset of $700. Between $37,500 and $45,000, the offset reduces by 5 cents for every dollar over $37,500. Between $45,000 and $66,667, it reduces by 1.5 cents per dollar, reaching zero at $66,667.',
  },
  {
    question: 'What is the Superannuation Guarantee rate for 2026–2027?',
    answer:
      "The statutory Superannuation Guarantee (SG) rate is 12.0% of an employee's Ordinary Time Earnings (OTE). Under standard base-salary contracts, employers pay this 12% on top of your gross wage into your super fund, increasing total employer cost without reducing your net paycheck.",
  },
  {
    question: 'How is the 2% Medicare Levy calculated?',
    answer:
      'Most Australian residents pay a Medicare Levy of 2.0% of their total taxable income alongside PAYG income tax withholdings. High-income earners without an eligible private hospital insurance policy may also be subject to the Medicare Levy Surcharge (1.0% to 1.5%).',
  },
  {
    question: 'Can I compare FY 2026–2027 and FY 2025–2026 take-home pay?',
    answer:
      'Yes. Use the Tax Year selector inside the calculator to toggle between FY 2026–2027 (15% second bracket) and FY 2025–2026 (16% second bracket) to see your exact annual tax cut.',
  }
];

export default function AustraliaSalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: AUSTRALIA_SALARY_FAQS.map((faq) => ({
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
        Australia Salary Calculator 2026–2027: ATO Stage 3 Tax Brackets, Medicare & Superannuation
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your exact net take-home pay in Australia for FY 2026–2027 and FY 2025–2026 using official Australian Taxation Office (ATO) resident income tax brackets, the Low Income Tax Offset (LITO), the 2.0% Medicare Levy, and the 12.0% Employer Superannuation Guarantee.
      </p>

      {/* How It Works */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How Australia Gross-to-Net Payroll &amp; Tax Withholding Is Calculated
      </h3>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Tax-Free Threshold & Stage 3 Brackets:</strong> The first A$18,200 of annual income is tax-free (0%). Under Treasury Laws Amendment Act 2024, earnings from A$18,201 to A$45,000 are taxed at 15% in FY 2026–27 (reduced from 16% in FY 2025–26), 30% up to A$135,000, 37% up to A$190,000, and 45% above A$190,000.
        </li>
        <li>
          <strong>Low Income Tax Offset (LITO):</strong> Provides up to A$700 in tax relief for earners up to A$37,500, phasing out at 5 cents per dollar between A$37,500 and A$45,000, and 1.5 cents per dollar until A$66,667.
        </li>
        <li>
          <strong>Medicare Levy (2.0%):</strong> Standard 2.0% levy applied to taxable income to fund Australia&apos;s public healthcare system (Universal Medicare).
        </li>
        <li>
          <strong>Superannuation Guarantee (12.0%):</strong> Mandatory 12.0% employer retirement contribution paid on top of ordinary time earnings (modeled as employer cost without reducing employee net pay).
        </li>
      </ol>

      {/* Worked Examples */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Representative Australia Salary &amp; Net Take-Home Pay Examples (FY 2026–2027 & FY 2025–2026)
      </h3>
      <div className="w-full overflow-x-auto mb-6 overscroll-x-contain">
        <table className="min-w-[640px] w-full text-left text-sm border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross (AUD)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">ATO Income Tax (net LITO)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Medicare Levy (2%)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Net Annual Take-Home</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Employer Super (12%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">A$60,000</td>
              <td className="p-3">A$8,445</td>
              <td className="p-3">A$1,200</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">A$50,355 (A$4,196/mo)</td>
              <td className="p-3">+A$7,200</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">A$100,000</td>
              <td className="p-3">A$20,520</td>
              <td className="p-3">A$2,000</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">A$77,480 (A$6,457/mo)</td>
              <td className="p-3">+A$12,000</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">A$150,000</td>
              <td className="p-3">A$36,570</td>
              <td className="p-3">A$3,000</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">A$110,430 (A$9,203/mo)</td>
              <td className="p-3">+A$18,000</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">A$220,000</td>
              <td className="p-3">A$64,870</td>
              <td className="p-3">A$4,400</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">A$150,730 (A$12,561/mo)</td>
              <td className="p-3">+A$26,400</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> AU-ATO-2026.2</div>
        <div><strong>Source Authority:</strong> Australian Taxation Office (ATO)</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> FY 2026–2027 & FY 2025–2026</div>
        <div><strong>Status:</strong> Verified Statutory Model</div>
        <div><strong>Last Verified:</strong> 2026-10-01</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>Medicare Levy Surcharge (MLS 1%–1.5%) for high earners without private hospital cover</li>
            <li>HELP / HECS / VET student loan compulsory repayments</li>
            <li>Division 293 additional tax on super contributions for incomes above A$250,000</li>
          </ul>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions (Australia Income Tax &amp; Payroll)
      </h3>
      <div className="space-y-4 mb-6">
        {AUSTRALIA_SALARY_FAQS.map((faq, index) => (
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
            href="/finance/salary-calculator/new-zealand"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            New Zealand Salary Calculator (IRD)
          </Link>
          <Link
            href="/finance/salary-calculator/united-kingdom"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            UK Salary Calculator (PAYE)
          </Link>
          <Link
            href="/finance/salary-calculator/singapore"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Singapore Salary Calculator (IRAS)
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
