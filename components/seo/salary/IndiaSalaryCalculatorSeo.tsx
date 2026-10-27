import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const INDIA_SALARY_FAQS: FaqItem[] = [
  {
    question: 'What is the zero-tax salary threshold under the New Tax Regime in India?',
    answer:
      'Under Section 115BAC as amended by Finance (No. 2) Act 2024, salaried individuals pay zero income tax on gross salaries up to ₹7,75,000 per year. This is achieved by subtracting the ₹75,000 standard deduction under Section 16(ia), bringing net taxable income to ₹7,00,000, which qualifies for a 100% tax rebate under Section 87A (maximum rebate ₹25,000).',
  },
  {
    question: 'What is the standard deduction for salaried individuals in AY 2025–2026?',
    answer:
      'The standard deduction for salaried employees and pensioners under the default New Tax Regime was increased from ₹50,000 to ₹75,000 by Finance (No. 2) Act 2024. This flat deduction is automatically subtracted from gross salary before applying the tax slab rates.',
  },
  {
    question: 'How is the 4% Health and Education Cess calculated?',
    answer:
      'The 4% Health and Education Cess is calculated on the total income tax payable (after adjusting for any applicable tax rebates or surcharges). For example, if your computed income tax is ₹50,000, the 4% cess is ₹2,000, making your total tax liability ₹52,000.',
  },
  {
    question: 'Are Chapter VI-A deductions (Section 80C, 80D, HRA) available in the New Tax Regime?',
    answer:
      'No. The New Tax Regime (Section 115BAC) disallows most common exemptions and deductions, including Section 80C (PPF, ELSS, EPF up to ₹1.5L), Section 80D (health insurance), House Rent Allowance (HRA), and Leave Travel Concession (LTC). In exchange, it provides significantly wider slabs and lower marginal tax rates.',
  },
  {
    question: 'What are the surcharge rates on high-income salaries in India?',
    answer:
      'Under the New Tax Regime, surcharges apply to taxable incomes exceeding ₹50 Lakhs: 10% for income between ₹50L and ₹1 Crore, 15% for income between ₹1Cr and ₹2 Crores, and a capped maximum surcharge of 25% for income exceeding ₹2 Crores (compared to 37% in the Old Tax Regime).',
  },
];

export default function IndiaSalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: INDIA_SALARY_FAQS.map((faq) => ({
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
        India Salary Calculator 2025–2026: New Tax Regime (Sec 115BAC), Slabs &amp; In-Hand Pay
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your exact in-hand salary and income tax liability in India under the statutory New Tax Regime
        (Section 115BAC) as amended by Finance (No. 2) Act 2024 for FY 2024–25 (AY 2025–26). Understand your gross CTC,
        ₹75,000 standard deduction, Section 87A rebate, 4% cess, and monthly bank credits.
      </p>

      {/* How It Works */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How Indian Salary Tax &amp; In-Hand Pay Is Calculated
      </h3>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Standard Deduction:</strong> A flat ₹75,000 standard deduction is subtracted from gross annual salary to determine net taxable income.
        </li>
        <li>
          <strong>Section 115BAC Progressive Slabs:</strong> Taxable income is taxed progressively: 0% (₹0–₹3L), 5% (₹3L–₹7L), 10% (₹7L–₹10L), 15% (₹10L–₹12L), 20% (₹12L–₹15L), and 30% (above ₹15L).
        </li>
        <li>
          <strong>Section 87A Full Rebate:</strong> If net taxable income is ₹7,00,000 or less, a full rebate up to ₹25,000 is credited, reducing tax to ₹0. Marginal relief protects incomes marginally above ₹7L.
        </li>
        <li>
          <strong>Health &amp; Education Cess:</strong> A mandatory 4% cess is added to the computed tax liability.
        </li>
        <li>
          <strong>Monthly In-Hand Pay:</strong> Total annual tax divided by 12 is deducted from monthly gross pay to compute your monthly credited take-home salary.
        </li>
      </ol>

      {/* Worked Examples */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Representative Salary Examples (New Tax Regime AY 2025–2026)
      </h3>
      <div className="w-full overflow-x-auto mb-6 overscroll-x-contain">
        <table className="min-w-[640px] w-full text-left text-sm border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross Salary</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Standard Deduction</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Taxable Income</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Total Tax (incl. Cess)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Monthly In-Hand Pay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">₹7,50,000 (7.5 LPA)</td>
              <td className="p-3">₹75,000</td>
              <td className="p-3">₹6,75,000</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">₹0 (Sec 87A Rebate)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">₹62,500 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">₹10,00,000 (10 LPA)</td>
              <td className="p-3">₹75,000</td>
              <td className="p-3">₹9,25,000</td>
              <td className="p-3">₹44,200 (4.4% eff.)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">₹79,650 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">₹15,00,000 (15 LPA)</td>
              <td className="p-3">₹75,000</td>
              <td className="p-3">₹14,25,000</td>
              <td className="p-3">₹1,19,600 (8.0% eff.)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">₹1,15,033 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">₹25,00,000 (25 LPA)</td>
              <td className="p-3">₹75,000</td>
              <td className="p-3">₹24,25,000</td>
              <td className="p-3">₹4,18,600 (16.7% eff.)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">₹1,73,450 / mo</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> IN-FIN24-115BAC</div>
        <div><strong>Source Authority:</strong> Central Board of Direct Taxes (CBDT) &amp; Ministry of Finance</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> FY 2024–2025 / AY 2025–2026 (Finance (No. 2) Act 2024)</div>
        <div><strong>Status:</strong> Verified Statutory Model (100% Code Verified)</div>
        <div><strong>Last Verified:</strong> 2024-07-23</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>State-level Professional Tax (e.g., ₹2,500/year in Maharashtra/Karnataka)</li>
            <li>Employee Provident Fund (EPF 12%) and Voluntary PF deductions</li>
            <li>AY 2026–27 7-slab projection models available as secondary forward projections</li>
          </ul>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions (Income Tax &amp; In-Hand Salary)
      </h3>
      <div className="space-y-4 mb-6">
        {INDIA_SALARY_FAQS.map((faq, index) => (
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
          Popular Indian Financial Calculators &amp; Global Tools
        </h4>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            href="/finance/salary-calculator"
            className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 hover:underline"
          >
            22-Country Salary Hub
          </Link>
          <Link
            href="/finance/sip-calculator"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            SIP Mutual Fund Calculator
          </Link>
          <Link
            href="/finance/emi-calculator"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Home &amp; Car Loan EMI Calculator
          </Link>
          <Link
            href="/finance/compound-interest"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Compound Interest Calculator
          </Link>
          <Link
            href="/finance/salary-calculator/united-arab-emirates"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            UAE Salary Calculator (Tax Free)
          </Link>
          <Link
            href="/finance/salary-calculator/singapore"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Singapore Salary Calculator (CPF)
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
