import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const FRANCE_SALARY_FAQS: FaqItem[] = [
  {
    question: 'What is the difference between Salaire Net Avant Impôt and Salaire Net Après Impôt in France?',
    answer:
      'Salaire Net Avant Impôt is your gross salary minus employee social security contributions (URSSAF, CSG/CRDS, Agirc-Arrco), which typically removes ~21% to 23% of gross pay. Salaire Net Après Impôt (net spendable pay) further subtracts your Prélèvement à la Source (PAS) income tax withholding.',
  },
  {
    question: 'What are the French income tax brackets (Barème IR) for 2026?',
    answer:
      'For a single adult (1 part fiscale), the progressive tranches are: 0% up to €11,294; 11% from €11,295 to €28,797; 30% from €28,798 to €82,341; 41% from €82,342 to €177,106; and 45% on income exceeding €177,106.',
  },
  {
    question: 'How does the 10% professional expenses deduction (Abattement de 10%) work?',
    answer:
      'When calculating French income tax, the DGFiP automatically reduces your net taxable salary by 10% to cover everyday employment costs (commuting, meals), subject to a statutory floor of €495 and a ceiling of €14,171.',
  },
  {
    question: 'How much do French employers pay in social charges (Cotisations Patronales)?',
    answer:
      "Employer payroll charges in France (covering health insurance, family allowances, unemployment insurance, and pensions) average between 30% and 42% of gross salary, making total employer cost roughly 1.3x to 1.42x the employee's gross salary.",
  },
  {
    question: 'What is Prélèvement à la Source (PAS)?',
    answer:
      "Introduced in 2019, Prélèvement à la Source is France's pay-as-you-earn income tax withholding system, where income tax is deducted directly from your monthly payslip by your employer using the tax rate transmitted by the DGFiP.",
  }
];

export default function FranceSalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FRANCE_SALARY_FAQS.map((faq) => ({
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
        France Salary Calculator 2026: Salaire Brut en Net, Impôt sur le Revenu & URSSAF
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Convert French gross salary to net pay (Salaire Brut en Net) in Euros (€) using the official DGFiP progressive income tax scale (Barème de l&apos;impôt sur le revenu), the 10% professional expenses abatement, and URSSAF social security contribution benchmarks.
      </p>

      {/* How It Works */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How France Gross-to-Net Payroll &amp; Tax Withholding Is Calculated
      </h3>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Cotisations Sociales Salariales (~21%):</strong> Mandatory employee social security contributions (CSG, CRDS, Assurance Maladie, Retraite de base CNAV, and Agirc-Arrco complementary pension) reduce gross salary (Salaire Brut) to net taxable pay.
        </li>
        <li>
          <strong>10% Abattement pour Frais Professionnels:</strong> The tax authority automatically applies a 10% standard deduction for professional expenses (minimum €495, capped at €14,171) before evaluating income tax brackets.
        </li>
        <li>
          <strong>Barème Progressif de l&apos;Impôt sur le Revenu:</strong> Net taxable income is taxed across five progressive tranches: 0% up to €11,294; 11% from €11,294 to €28,797; 30% from €28,797 to €82,341; 41% from €82,341 to €177,106; and 45% above €177,106.
        </li>
        <li>
          <strong>Cotisations Patronales (Employer Cost):</strong> French employers pay approximately 30% to 42% in employer URSSAF charges on top of contractual gross salary (Coût total employeur).
        </li>
      </ol>

      {/* Worked Examples */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Representative France Salary &amp; Net Take-Home Pay Examples (2026)
      </h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left text-sm border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross (EUR)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Employee Social (~21%)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Income Tax (IR)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Net After Tax</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Monthly Net (Après Impôt)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€35,000</td>
              <td className="p-3">€7,350</td>
              <td className="p-3">€1,880</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€25,770</td>
              <td className="p-3">€2,148 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€50,000</td>
              <td className="p-3">€10,500</td>
              <td className="p-3">€4,585</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€34,915</td>
              <td className="p-3">€2,910 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€75,000</td>
              <td className="p-3">€15,750</td>
              <td className="p-3">€11,335</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€47,915</td>
              <td className="p-3">€3,993 / mo</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€120,000</td>
              <td className="p-3">€25,200</td>
              <td className="p-3">€25,672</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€69,128</td>
              <td className="p-3">€5,761 / mo</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> FR-DGFIP-2026.1</div>
        <div><strong>Source Authority:</strong> Direction Générale des Finances Publiques (DGFiP) & URSSAF</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> 2026</div>
        <div><strong>Status:</strong> Limited Statutory Model (Barème Progressif IR + Social Benchmark)</div>
        <div><strong>Last Verified:</strong> 2026-10-10</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>Quotient familial household parts splitting for married couples and dependent children (demi-parts)</li>
            <li>Cadre vs Non-Cadre specific Agirc-Arrco tranche differences and company Mutuelle health packages</li>
            <li>Contribution Exceptionnelle sur les Hauts Revenus (CEHR 3%–4% above €250,000)</li>
          </ul>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions (France Income Tax &amp; Payroll)
      </h3>
      <div className="space-y-4 mb-6">
        {FRANCE_SALARY_FAQS.map((faq, index) => (
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
            href="/finance/salary-calculator/switzerland"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Switzerland Salary Calculator
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
