import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const SPAIN_SALARY_FAQS: FaqItem[] = [
  {
    question: "How does Spain's dual State and Autonomous Community IRPF tax system work?",
    answer:
      'In Spain, Personal Income Tax (IRPF) is split 50/50 between the Central Government (Escala Estatal) and your Autonomous Community of residence (Escala Autonómica). While the state scale runs from 9.5% to 24.5%, regions like Comunidad de Madrid apply lower regional rates (starting at 8.5%) compared to Cataluña (starting at 10.5%). You can switch regions inside our calculator.',
  },
  {
    question: 'What are the employee Seguridad Social contribution rates and caps in 2026?',
    answer:
      'Under the Régimen General, employees pay approximately 6.47% to 6.50% (4.70% common contingencies, 1.55% unemployment for permanent contracts, 0.10% vocational training, plus the Mecanismo de Equidad Intergeneracional MEI), capped at the statutory maximum base of €58,950/year. Employers pay ~31.90% up to the same cap.',
  },
  {
    question: 'Are employee Seguridad Social contributions tax-deductible in Spain?',
    answer:
      'Yes. Your mandatory employee Seguridad Social contributions—alongside the €2,000 general employment expense deduction (Gastos Deducibles)—are subtracted from your gross salary before your IRPF taxable base is calculated.',
  },
  {
    question: 'What is the difference between 12 Pagas and 14 Pagas in Spain?',
    answer:
      'Your annual gross salary, total IRPF tax, and total annual net pay are identical under both systems. With 12 Pagas, your extra summer and Christmas bonuses (Pagas Extraordinarias) are prorated evenly across 12 monthly paychecks. With 14 Pagas, you receive 12 smaller regular monthly payments plus two extra payments in June/July and December.',
  },
  {
    question: 'How is the €5,550 Mínimo Personal applied?',
    answer:
      'Instead of simply subtracting €5,550 from your top bracket, Spanish tax law calculates the tax on €5,550 at the bottom progressive brackets (9.5% state + ~9% regional) and subtracts that credit from your gross IRPF quota.',
  }
];

export default function SpainSalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SPAIN_SALARY_FAQS.map((faq) => ({
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
        Spain Salary Calculator 2026: Sueldo Bruto a Neto, IRPF (Madrid, Cataluña) & Seguridad Social
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your net salary in Spain (€) using Agencia Tributaria (AEAT) dual State and Autonomous Community IRPF scales (Madrid, Cataluña, Andalucía, Valencia), the €5,550 personal minimum allowance, and Seguridad Social Régimen General contributions.
      </p>

      {/* How It Works */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How Spain Gross-to-Net Payroll &amp; Tax Withholding Is Calculated
      </h3>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Seguridad Social (6.50% Employee):</strong> Covers Contingencias Comunes (4.70%), Desempleo (1.55%), Formación Profesional (0.10%), and MEI (0.15%), capped at the maximum contribution base of €58,950/year (€4,912.50/month).
        </li>
        <li>
          <strong>Reducción por Rendimientos del Trabajo (€2,000):</strong> Employee Social Security contributions and the €2,000 general employment expense deduction reduce gross salary to net taxable base (Base Liquidable).
        </li>
        <li>
          <strong>Mínimo Personal y Familiar (€5,550):</strong> The first €5,550 of the tax base is sheltered via the personal minimum tax credit applied against the state and regional scales.
        </li>
        <li>
          <strong>Dual State & Autonomous IRPF Scales:</strong> Combines the Estatal scale (9.5% to 24.5%) with your selected Autonomous Community scale (Madrid, Cataluña, Andalucía, Valencia, or General) for total progressive rates from ~18.5% to 47%.
        </li>
      </ol>

      {/* Worked Examples */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Representative Spain Salary &amp; Net Take-Home Pay Examples (2026)
      </h3>
      <div className="w-full overflow-x-auto mb-6 overscroll-x-contain">
        <table className="min-w-[640px] w-full text-left text-sm border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross (EUR)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Seguridad Social (6.5%)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">IRPF (Madrid Scale)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Net Salary</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Monthly Net (12 Pagas)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€30,000</td>
              <td className="p-3">€1,950</td>
              <td className="p-3">€4,420</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€23,630</td>
              <td className="p-3">€1,969 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€45,000</td>
              <td className="p-3">€2,925</td>
              <td className="p-3">€8,915</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€33,160</td>
              <td className="p-3">€2,763 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€65,000</td>
              <td className="p-3">€3,832 (Capped)</td>
              <td className="p-3">€16,185</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€44,983</td>
              <td className="p-3">€3,749 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€100,000</td>
              <td className="p-3">€3,832 (Capped)</td>
              <td className="p-3">€31,260</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€64,908</td>
              <td className="p-3">€5,409 / mo</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> ES-AEAT-2026.1</div>
        <div><strong>Source Authority:</strong> Agencia Estatal de Administración Tributaria (AEAT) & Seguridad Social</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> 2026</div>
        <div><strong>Status:</strong> Verified Statutory Model (Dual State + Autonomous IRPF & Seguridad Social)</div>
        <div><strong>Last Verified:</strong> 2026-10-01</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>Special Expatriate Tax Regime (Ley Beckham — 24% flat tax up to €600,000 for qualifying inbound workers)</li>
            <li>Family situation adjustments (Situación familiar 1, 2, 3 for dependent children and ascendants)</li>
            <li>Foral tax regimes of Navarra and the Basque Country (Bizkaia, Gipuzkoa, Araba)</li>
          </ul>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions (Spain Income Tax &amp; Payroll)
      </h3>
      <div className="space-y-4 mb-6">
        {SPAIN_SALARY_FAQS.map((faq, index) => (
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
            href="/finance/salary-calculator/italy"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Italy Salary Calculator (IRPEF)
          </Link>
          <Link
            href="/finance/salary-calculator/france"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            France Salary Calculator (IR)
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
