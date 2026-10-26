import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const SWITZERLAND_SALARY_FAQS: FaqItem[] = [
  {
    question: 'Why does take-home pay in Switzerland vary so much by Canton?',
    answer:
      "In Switzerland's three-tier tax system (Federal, Cantonal, and Communal), the Direct Federal Tax is capped at a maximum of 11.5%, while Cantonal and Municipal taxes account for the majority of your income tax bill. Cantons like Zug and Schwyz have substantially lower tax rates than cantons like Geneva, Vaud, or Bern.",
  },
  {
    question: 'What are the employee AHV/IV/EO and ALV social security rates in Switzerland?',
    answer:
      'Employees and employers each pay 5.30% for AHV/IV/EO (1st Pillar state pension, disability, and income loss insurance) with no upper salary cap, plus 1.10% for ALV (unemployment insurance) on annual salary up to CHF 148,200.',
  },
  {
    question: 'How does the 2nd Pillar BVG/LPP pension deduction work?',
    answer:
      "Employees earning above the BVG entry threshold have a coordinated salary insured under their employer's occupational pension fund (Pensionskasse). Both employee and employer contribute to the fund, and employee BVG contributions are fully deductible from federal and cantonal taxable income.",
  },
  {
    question: 'Are taxes deducted directly from my paycheck in Switzerland?',
    answer:
      'Swiss citizens and C-permit (settled foreign national) holders generally receive their salary net of social security (AHV/ALV/BVG) and pay federal/cantonal income taxes via annual tax bills. Foreign workers on a B-permit or L-permit have withholding tax (Quellensteuer / Impôt à la source) deducted directly from their monthly paycheck.',
  },
  {
    question: 'Can I compare Zurich, Geneva, Zug, and Basel in this calculator?',
    answer:
      'Yes. Use the Canton / Region dropdown in the calculator workspace to switch between Swiss cantons and immediately compare your net take-home salary.',
  }
];

export default function SwitzerlandSalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SWITZERLAND_SALARY_FAQS.map((faq) => ({
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
        Switzerland Salary Calculator 2026: Federal Tax, Cantonal Tax (Zurich, Geneva, Zug) & AHV/BVG
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your net salary in Swiss Francs (CHF) across Zurich, Geneva, Zug, Bern, Basel, and Vaud. Models Direct Federal Tax (Art. 36 DBG), cantonal/communal tax benchmarks, and 1st/2nd Pillar social security (AHV/IV/EO, ALV, and BVG pension).
      </p>

      {/* How It Works */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How Switzerland Gross-to-Net Payroll &amp; Tax Withholding Is Calculated
      </h3>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>1st Pillar Social Security (AHV/IV/EO & ALV):</strong> Old-Age and Survivors&apos; Insurance (AHV/IV/EO) is deducted at 5.30% uncapped. Unemployment Insurance (ALV) is 1.10% up to the CHF 148,200 annual ceiling.
        </li>
        <li>
          <strong>2nd Pillar Occupational Pension (BVG / LPP):</strong> Mandatory pension contribution (~4.25% benchmark on coordinated earnings between CHF 25,725 and CHF 88,200), which is deductible from taxable income.
        </li>
        <li>
          <strong>Direct Federal Tax (Direkte Bundessteuer):</strong> Highly progressive federal schedule starting at 0% up to CHF 17,800 and scaling gradually to a maximum federal rate of 11.5% above CHF 808,600.
        </li>
        <li>
          <strong>Cantonal & Municipal Taxes:</strong> Varies significantly by canton (e.g., low-tax Zug vs Zurich vs Geneva); select your canton in the calculator to model localized tax burden.
        </li>
      </ol>

      {/* Worked Examples */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Representative Switzerland Salary &amp; Net Take-Home Pay Examples (2026)
      </h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left text-sm border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross (CHF)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">AHV + ALV + BVG</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Fed + Zurich Tax</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Net (Zurich)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Monthly Net Pay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">CHF 80,000</td>
              <td className="p-3">CHF 7,429</td>
              <td className="p-3">CHF 8,740</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">CHF 63,831</td>
              <td className="p-3">CHF 5,319 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">CHF 120,000</td>
              <td className="p-3">CHF 10,332</td>
              <td className="p-3">CHF 16,890</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">CHF 92,778</td>
              <td className="p-3">CHF 7,732 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">CHF 160,000</td>
              <td className="p-3">CHF 12,315</td>
              <td className="p-3">CHF 26,450</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">CHF 121,235</td>
              <td className="p-3">CHF 10,103 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">CHF 250,000</td>
              <td className="p-3">CHF 17,085</td>
              <td className="p-3">CHF 51,210</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">CHF 181,705</td>
              <td className="p-3">CHF 15,142 / mo</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> CH-ESTV-2026.1</div>
        <div><strong>Source Authority:</strong> Federal Tax Administration (ESTV) & BSV</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> 2026</div>
        <div><strong>Status:</strong> Limited Statutory Model (Federal Statutory + Cantonal Benchmark)</div>
        <div><strong>Last Verified:</strong> 2026-10-01</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>Individual municipality tax multipliers (Steuerfuss / centimes additionnels) within each canton</li>
            <li>Optional Church Tax (Kirchensteuer) and Pillar 3a voluntary private retirement deductions (up to CHF 7,258)</li>
            <li>Age-specific BVG pension credit rate steps (7%, 10%, 15%, 18% by age bracket)</li>
          </ul>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions (Switzerland Income Tax &amp; Payroll)
      </h3>
      <div className="space-y-4 mb-6">
        {SWITZERLAND_SALARY_FAQS.map((faq, index) => (
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
            href="/finance/salary-calculator/france"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            France Salary Calculator (IR)
          </Link>
          <Link
            href="/finance/salary-calculator/netherlands"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Netherlands Salary Calculator
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
