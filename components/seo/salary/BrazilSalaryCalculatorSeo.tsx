import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const BRAZIL_SALARY_FAQS: FaqItem[] = [
  {
    question: 'How is progressive INSS calculated in Brazil for 2026?',
    answer:
      'Since the 2020 pension reform (EC 103/2019), INSS is calculated progressively across four slices (7.5%, 9%, 12%, and 14%) just like income tax, rather than applying a single flat rate to the whole salary. For 2026 (Portaria Interministerial MPS/MF nº 13/2026), the contribution ceiling (Teto) is R$ 8,475.55/month, resulting in a maximum monthly employee INSS deduction of R$ 988.09.',
  },
  {
    question: 'How does the IRPF Desconto Simplificado (Simplified Discount) work?',
    answer:
      'Receita Federal allows salaried taxpayers to deduct either their actual legal deductions (such as INSS) or a flat Simplified Monthly Discount of R$ 564.80/month (R$ 6,777.60/year)—whichever is more beneficial to the employee. Our engine automatically selects the larger deduction to maximize your net pay.',
  },
  {
    question: 'What are the Receita Federal IRPF tax brackets?',
    answer:
      'The five progressive IRPF brackets are: 0% on the exempt tier, followed by 7.5%, 15.0%, 22.5%, and 27.5% on the top tier.',
  },
  {
    question: "Is the 8% FGTS deducted from the employee's salary in Brazil?",
    answer:
      'No. Under Brazilian CLT labor law, the Fundo de Garantia do Tempo de Serviço (FGTS — 8% of gross monthly pay) is paid entirely by the employer into a linked Caixa Econômica Federal account for the employee; it is never subtracted from your net paycheck.',
  },
  {
    question: 'Can I compare 2026 and 2025 INSS ceilings in this calculator?',
    answer:
      'Yes. Use the Tax Year dropdown to switch between 2026 (INSS ceiling R$ 8,475.55/mo) and 2025 (INSS ceiling R$ 8,157.41/mo).',
  }
];

export default function BrazilSalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: BRAZIL_SALARY_FAQS.map((faq) => ({
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
        Brazil Salary Calculator 2026: Salário Líquido CLT, IRPF & INSS Progressivo
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your net salary in Brazil (Salário Bruto para Líquido CLT in R$) using Receita Federal progressive IRPF brackets (0% to 27.5%), the Portaria Interministerial 2026 progressive INSS schedule (capped at R$ 8,475.55/mo), and employer FGTS/INSS costs.
      </p>

      {/* How It Works */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How Brazil Gross-to-Net Payroll &amp; Tax Withholding Is Calculated
      </h3>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Progressive INSS Deduction (7.5% to 14%):</strong> Employee social security is calculated progressively across 4 tiers up to the 2026 statutory ceiling (Teto do INSS) of R$ 8,475.55/month (max contribution R$ 988.09/month or R$ 11,857.08/year).
        </li>
        <li>
          <strong>IRPF Tax Base & Simplified Discount:</strong> The taxpayer deducts either actual INSS contributions or the simplified monthly discount (Desconto Simplificado of R$ 564.80/month = R$ 6,777.60/year), whichever yields the lower tax.
        </li>
        <li>
          <strong>Progressive IRPF Brackets:</strong> Assessed across 5 tiers: 0% exempt band, 7.5%, 15.0%, 22.5%, and 27.5% (with parcel-to-deduct adjustments).
        </li>
        <li>
          <strong>Employer CLT Charges (35.8%):</strong> Brazilian CLT employers contribute 20% Patronal INSS + 8% FGTS severance fund + 5.8% Sistema S / Terceiros + 2% RAT = 35.8% on top of gross salary.
        </li>
      </ol>

      {/* Worked Examples */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Representative Brazil Salary &amp; Net Take-Home Pay Examples (2026 & 2025)
      </h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left text-sm border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross (BRL)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Employee INSS</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">IRPF Income Tax</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Net (CLT)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Monthly Net Salary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">R$ 48,000 (R$ 4k/mo)</td>
              <td className="p-3">R$ 4,548</td>
              <td className="p-3">R$ 1,568</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">R$ 41,884</td>
              <td className="p-3">R$ 3,490 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">R$ 84,000 (R$ 7k/mo)</td>
              <td className="p-3">R$ 9,375</td>
              <td className="p-3">R$ 9,420</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">R$ 65,205</td>
              <td className="p-3">R$ 5,434 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">R$ 120,000 (R$ 10k/mo)</td>
              <td className="p-3">R$ 11,857 (Capped)</td>
              <td className="p-3">R$ 18,645</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">R$ 89,498</td>
              <td className="p-3">R$ 7,458 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">R$ 240,000 (R$ 20k/mo)</td>
              <td className="p-3">R$ 11,857 (Capped)</td>
              <td className="p-3">R$ 51,645</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">R$ 176,498</td>
              <td className="p-3">R$ 14,708 / mo</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> BR-RFB-2026.1</div>
        <div><strong>Source Authority:</strong> Receita Federal do Brasil (RFB) & Previdência Social</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> 2026 & 2025</div>
        <div><strong>Status:</strong> Verified Statutory Model (CLT Progressive INSS & IRPF)</div>
        <div><strong>Last Verified:</strong> 2026-10-01</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>13º Salário (Christmas bonus) and 1/3 Constitucional de Férias separate payout months</li>
            <li>Per-dependent monthly IRPF deduction (R$ 189.59 per dependent)</li>
            <li>Vale-Transporte (6% cap) and Vale-Refeição co-pay deductions</li>
          </ul>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions (Brazil Income Tax &amp; Payroll)
      </h3>
      <div className="space-y-4 mb-6">
        {BRAZIL_SALARY_FAQS.map((faq, index) => (
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
            href="/finance/salary-calculator/mexico"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Mexico Salary Calculator (ISR)
          </Link>
          <Link
            href="/finance/salary-calculator/spain"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Spain Salary Calculator (IRPF)
          </Link>
          <Link
            href="/finance/salary-calculator/united-states"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            US Salary Calculator (IRS)
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
