import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const MEXICO_SALARY_FAQS: FaqItem[] = [
  {
    question: 'How is ISR (Impuesto Sobre la Renta) calculated on salaries in Mexico?',
    answer:
      'Under Article 152 of the Ley del Impuesto Sobre la Renta (LISR), SAT applies an 11-tier progressive schedule. You locate the bracket containing your taxable income, subtract the lower limit (Límite Inferior), multiply the excess by the marginal percentage (1.92% to 35.0%), and add the fixed quota (Cuota Fija) for that bracket.',
  },
  {
    question: "How much is deducted for IMSS from an employee's paycheck in Mexico?",
    answer:
      'Employee IMSS withholdings (Cuotas Obreras covering Enfermedades y Maternidad, Invalidez y Vida, and Cesantía en Edad Avanzada y Vejez) average approximately 2.5% to 2.75% of your Salario Base de Cotización (SBC), up to the statutory cap of 25 UMAs (Unidades de Medida y Actualización).',
  },
  {
    question: 'What is the 25 UMA ceiling for IMSS contributions?',
    answer:
      'The Unidad de Medida y Actualización (UMA) is the economic reference unit set by INEGI. Social security contributions in Mexico are capped at 25 times the daily UMA (~$1,032,400 MXN annually), meaning salary earned above that threshold does not incur additional IMSS deductions.',
  },
  {
    question: 'What payroll taxes do Mexican employers pay on top of gross salary?',
    answer:
      "Employer social security burdens in Mexico are substantial (~25% to 30% of gross pay), comprising Employer IMSS quotas, 5.0% Infonavit (National Workers' Housing Fund), 2.0% SAR retirement savings, and state Impuesto Sobre Nómina (ISN, typically 2% to 3%).",
  },
  {
    question: 'Are Aguinaldo and Prima Vacacional taxed in Mexico?',
    answer:
      'Under Mexican labor law, employees receive a minimum 15-day Christmas bonus (Aguinaldo, exempt from ISR up to 30 daily UMAs) and a 25% vacation bonus (Prima Vacacional, exempt up to 15 daily UMAs).',
  }
];

export default function MexicoSalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: MEXICO_SALARY_FAQS.map((faq) => ({
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
        Mexico Salary Calculator 2026: Sueldo Bruto a Neto, SAT ISR & IMSS Cuotas
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your net take-home salary in Mexican Pesos (MXN / $) using the official Servicio de Administración Tributaria (SAT) 11-bracket Article 152 ISR tariff and Instituto Mexicano del Seguro Social (IMSS) employee and employer contributions.
      </p>

      {/* How It Works */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How Mexico Gross-to-Net Payroll &amp; Tax Withholding Is Calculated
      </h3>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>11-Bracket SAT ISR Schedule (Art. 152 LISR):</strong> Taxable income is evaluated across 11 progressive marginal tiers ranging from 1.92% on the lowest band (6.40%, 10.88%, 16.00%, 17.92%, 21.36%, 23.52%, 30.00%, 32.00%, 34.00%) up to 35.00% on top earnings.
        </li>
        <li>
          <strong>Employee IMSS Cuotas Obrero (~2.75%):</strong> Covers sickness/maternity, disability/life, and unemployment/old-age insurance branches, capped at the statutory ceiling of 25 UMAs (~$1,032,400 MXN/year).
        </li>
        <li>
          <strong>Employer IMSS + Infonavit + ISN (~25.5%):</strong> Employers pay IMSS patronal quotas, 5.0% Infonavit housing fund, 2.0% SAR retirement, and ~3.0% state payroll tax (Impuesto Sobre Nómina).
        </li>
        <li>
          <strong>Net Spendable Pay:</strong> Equals Contractual Gross Salary minus SAT ISR withholding and Employee IMSS contributions.
        </li>
      </ol>

      {/* Worked Examples */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Representative Mexico Salary &amp; Net Take-Home Pay Examples (2026)
      </h3>
      <div className="w-full overflow-x-auto mb-6 overscroll-x-contain">
        <table className="min-w-[640px] w-full text-left text-sm border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross (MXN)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">SAT ISR Income Tax</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Employee IMSS</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Net Salary</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Monthly Net Pay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">$180,000 ($15k/mo)</td>
              <td className="p-3">$19,620</td>
              <td className="p-3">$4,950</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">$155,430</td>
              <td className="p-3">$12,953 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">$360,000 ($30k/mo)</td>
              <td className="p-3">$58,080</td>
              <td className="p-3">$9,900</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">$292,020</td>
              <td className="p-3">$24,335 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">$600,000 ($50k/mo)</td>
              <td className="p-3">$122,400</td>
              <td className="p-3">$16,500</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">$461,100</td>
              <td className="p-3">$38,425 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">$1,200,000 ($100k/mo)</td>
              <td className="p-3">$315,600</td>
              <td className="p-3">$28,391 (25 UMA cap)</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">$856,009</td>
              <td className="p-3">$71,334 / mo</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> MX-SAT-2026.1</div>
        <div><strong>Source Authority:</strong> Servicio de Administración Tributaria (SAT) & IMSS</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> 2026</div>
        <div><strong>Status:</strong> Limited Statutory Model (Statutory ISR + IMSS Benchmark)</div>
        <div><strong>Last Verified:</strong> 2026-10-01</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>Subsidio para el Empleo (employment tax credit applicable only to minimum-wage earners)</li>
            <li>Aguinaldo (15-day Christmas bonus) and Prima Vacacional (25% vacation bonus) UMA tax exemptions</li>
            <li>PTU (10% statutory employee profit sharing)</li>
          </ul>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions (Mexico Income Tax &amp; Payroll)
      </h3>
      <div className="space-y-4 mb-6">
        {MEXICO_SALARY_FAQS.map((faq, index) => (
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
            href="/finance/salary-calculator/united-states"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            US Salary Calculator (IRS)
          </Link>
          <Link
            href="/finance/salary-calculator/brazil"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Brazil Salary Calculator (CLT)
          </Link>
          <Link
            href="/finance/salary-calculator/spain"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Spain Salary Calculator (IRPF)
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
