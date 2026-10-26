import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const ITALY_SALARY_FAQS: FaqItem[] = [
  {
    question: 'What are the Italian IRPEF tax brackets for 2026?',
    answer:
      'Following the D.Lgs. 216/2023 tax reform (consolidated for 2025/2026), Italy merged the first two brackets into a three-tier structure: 23% on taxable income up to €28,000; 35% on income from €28,001 to €50,000; and 43% on all income exceeding €50,000.',
  },
  {
    question: 'How is Imponibile IRPEF (taxable income) calculated from RAL (gross salary)?',
    answer:
      'In Italy, your contractual annual gross salary is called RAL (Retribuzione Annua Lorda). First, mandatory employee INPS social security contributions (9.19%, plus 1% above €55,008) are deducted from RAL. The remaining amount is your Imponibile IRPEF, on which income taxes are calculated.',
  },
  {
    question: 'How does the Detrazione da Lavoro Dipendente reduce my Italian tax?',
    answer:
      'Salaried workers with taxable income up to €50,000 receive an automatic employment tax credit (Detrazione). It equals €1,955 for incomes up to €15,000, scales between €1,910 and €1,955 for incomes up to €28,000, and phases out linearly between €28,000 and €50,000, reaching zero above €50,000.',
  },
  {
    question: 'What are Addizionale Regionale and Addizionale Comunale?',
    answer:
      'In addition to national IRPEF, Italian residents pay a regional income surtax (varying from ~1.23% to 3.33% depending on your region such as Lombardia, Lazio, Piemonte, or Veneto) and a municipal surtax (typically ~0.80%). You can switch regions inside our calculator.',
  },
  {
    question: 'How does RAL translate to 13 or 14 monthly paychecks (Mensilità)?',
    answer:
      'Many Italian national collective bargaining agreements (CCNL Commercio, Metalmeccanici) divide your annual net pay into 13 (with a December Tredicesima) or 14 (plus a June Quattordicesima) installments. Divide the Annual Net Pay shown in the calculator by 13 or 14 to see your per-installment amount.',
  }
];

export default function ItalySalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ITALY_SALARY_FAQS.map((faq) => ({
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
        Italy Salary Calculator 2026: Stipendio Netto, 3-Bracket IRPEF, Addizionali & INPS
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your net salary in Italy (Stipendio Lordo a Netto in €) using the reformed 3-bracket Agenzia delle Entrate IRPEF schedule (23%, 35%, 43%), Detrazioni da lavoro dipendente, regional/municipal surtaxes (Lombardia, Lazio, Veneto), and INPS social contributions.
      </p>

      {/* How It Works */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How Italy Gross-to-Net Payroll &amp; Tax Withholding Is Calculated
      </h3>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>INPS Employee Contributions (9.19%):</strong> Mandatory social security (Previdenza Sociale) is deducted at 9.19% on gross pay (plus 1.0% additional contribution on income over €55,008), capped at the €116,366 annual massimale. INPS is fully deductible before IRPEF.
        </li>
        <li>
          <strong>3-Bracket Reformed IRPEF:</strong> Taxable income (Imponibile IRPEF) is taxed across three statutory brackets: 23% up to €28,000; 35% from €28,001 to €50,000; and 43% on income above €50,000.
        </li>
        <li>
          <strong>Detrazione da Lavoro Dipendente:</strong> Salaried employees receive an employment tax credit up to €1,955 (for incomes up to €15,000), phasing out progressively to €0 at €50,000.
        </li>
        <li>
          <strong>Addizionali Regionali e Comunali:</strong> Regional surtax (e.g., Lombardia 1.73%, Lazio 3.33%) plus municipal surtax (~0.80% benchmark) are added to determine total tax.
        </li>
      </ol>

      {/* Worked Examples */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Representative Italy Salary &amp; Net Take-Home Pay Examples (2026)
      </h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left text-sm border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross (RAL €)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">INPS Employee</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Net IRPEF + Addizionali</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Net Pay</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Monthly Net (12 Mensilità)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€30,000</td>
              <td className="p-3">€2,757</td>
              <td className="p-3">€5,410</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€21,833</td>
              <td className="p-3">€1,819 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€45,000</td>
              <td className="p-3">€4,136</td>
              <td className="p-3">€10,695</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€30,169</td>
              <td className="p-3">€2,514 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€65,000</td>
              <td className="p-3">€6,026</td>
              <td className="p-3">€19,580</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€39,394</td>
              <td className="p-3">€3,283 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€100,000</td>
              <td className="p-3">€9,595</td>
              <td className="p-3">€34,150</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€56,255</td>
              <td className="p-3">€4,688 / mo</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> IT-ADE-2026.1</div>
        <div><strong>Source Authority:</strong> Agenzia delle Entrate & INPS</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> 2026</div>
        <div><strong>Status:</strong> Limited Statutory Model (Statutory IRPEF + Regional Benchmark)</div>
        <div><strong>Last Verified:</strong> 2026-10-01</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>13th-month (Tredicesima) and 14th-month (Quattordicesima) CCNL contract installment splits (annual net is exact)</li>
            <li>Regime Impatriati inbound worker tax relief (50% tax exemption for qualifying professionals moving to Italy)</li>
            <li>TFR (Trattamento di Fine Rapporto ~6.91% employer severance accrual)</li>
          </ul>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions (Italy Income Tax &amp; Payroll)
      </h3>
      <div className="space-y-4 mb-6">
        {ITALY_SALARY_FAQS.map((faq, index) => (
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
            href="/finance/salary-calculator/spain"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Spain Salary Calculator (IRPF)
          </Link>
          <Link
            href="/finance/salary-calculator/france"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            France Salary Calculator (IR)
          </Link>
          <Link
            href="/finance/salary-calculator/switzerland"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Switzerland Salary Calculator
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
