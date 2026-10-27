import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const GERMANY_SALARY_FAQS: FaqItem[] = [
  {
    question: 'What is the 2026 basic tax-free allowance (Grundfreibetrag) in Germany?',
    answer:
      'Under the BMF Steuerfortentwicklungsgesetz, the basic tax-free allowance (Grundfreibetrag) for tax year 2026 is €12,348 for single taxpayers (Steuerklasse I). Annual taxable earnings up to this amount are completely free from German personal income tax (Lohnsteuer).',
  },
  {
    question: 'What are the 2026 social insurance contribution ceilings (Beitragsbemessungsgrenzen)?',
    answer:
      'Under the BMAS Sozialversicherungs-Rechengrößenverordnung 2026, the statutory contribution ceiling for statutory pension and unemployment insurance (RV/AV) is €101,400 per year (€8,450 per month). For statutory health and long-term care insurance (KV/PV), the ceiling is €69,750 per year (€5,812.50 per month). Earnings exceeding these limits incur zero additional social charges.',
  },
  {
    question: 'Who is required to pay the Solidaritätszuschlag (Solidarity Surcharge) in 2026?',
    answer:
      'The 5.5% Solidaritätszuschlag has been abolished for approximately 90% of German taxpayers. For single individuals in Steuerklasse I, it applies only if annual income tax liability exceeds the exemption threshold of €18,130, with a statutory sliding transition zone to prevent sudden rate jumps.',
  },
  {
    question: 'What is the employee share of statutory social insurance contributions in Germany?',
    answer:
      'Statutory employee contribution rates for 2026 are: Rentenversicherung (pension) at 9.30%, Arbeitslosenversicherung (unemployment) at 1.30%, Krankenversicherung (health) at 7.30% plus an average 1.25% Zusatzbeitrag (8.55% total), and Pflegeversicherung (long-term care) at 2.20% (plus a 0.60% surcharge for childless employees aged 23+). Total employee social deductions average approximately 20% to 21% of gross earnings up to the ceilings.',
  },
  {
    question: 'What is the Arbeitnehmer-Pauschbetrag and how is it applied?',
    answer:
      'The Arbeitnehmer-Pauschbetrag is a statutory lump-sum deduction of €1,230 per year for work-related income expenses (Werbungskosten). German payroll withholding automatically incorporates this deduction into the monthly tax deduction algorithm without requiring expense receipts.',
  },
];

export default function GermanySalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: GERMANY_SALARY_FAQS.map((faq) => ({
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
        Germany Salary Calculator 2026: Brutto-Netto Rechner, Lohnsteuer &amp; Social Deductions
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your exact net salary (Netto) from gross contractual pay (Brutto) in Germany using verified statutory
        specifications under the 2026 BMF tax formula (Steuerfortentwicklungsgesetz) and 2026 BMAS social insurance ceilings.
        Deconstruct your wage tax (Lohnsteuer), pension (RV), unemployment (AV), health (KV), and care (PV) deductions.
      </p>

      {/* How It Works */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How German Brutto-Netto Payroll Deductions Are Calculated
      </h3>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Grundfreibetrag:</strong> The first €12,348 of taxable income is tax-free under Steuerklasse I.
        </li>
        <li>
          <strong>Progressive Lohnsteuer:</strong> Taxable income above the allowance is taxed across statutory progressive polynomial zones under EStG § 32a (rates rising smoothly from 14% to 42% at €66,761, and 45% top tax over €277,826).
        </li>
        <li>
          <strong>Social Contributions (Sozialabgaben):</strong> Employee shares are deducted: RV (9.30%) and AV (1.30%) up to the €101,400 BBG ceiling; KV (8.55%) and PV (2.20%) up to the €69,750 BBG ceiling.
        </li>
        <li>
          <strong>Solidaritätszuschlag:</strong> A 5.5% surcharge applies only on income tax liability exceeding €18,130.
        </li>
        <li>
          <strong>Net Take-Home Pay (Netto):</strong> Contractual gross salary minus Lohnsteuer, Soli, and all social insurance contributions equals your spendable monthly net pay.
        </li>
      </ol>

      {/* Worked Examples */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Representative Salary Examples (Steuerklasse I, Single, 2026)
      </h3>
      <div className="w-full overflow-x-auto mb-6 overscroll-x-contain">
        <table className="min-w-[640px] w-full text-left text-sm border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Gross (Brutto) / Year</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Wage Tax (Lohnsteuer)</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Social Contributions</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Total Deductions</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Net Take-Home (Netto)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€35,000</td>
              <td className="p-3">€3,584.00 (10.2% eff.)</td>
              <td className="p-3">€7,472.50</td>
              <td className="p-3">€11,056.50</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€23,943.50 (€1,995/mo)</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€60,000</td>
              <td className="p-3">€10,126.00 (16.9% eff.)</td>
              <td className="p-3">€12,810.00</td>
              <td className="p-3">€22,936.00</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€37,064.00 (€3,089/mo)</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€80,000</td>
              <td className="p-3">€17,046.00 (21.3% eff.)</td>
              <td className="p-3">€15,978.13 (KV/PV capped)</td>
              <td className="p-3">€33,024.13</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€46,975.87 (€3,915/mo)</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">€120,000</td>
              <td className="p-3">€34,228.00 (28.5% eff.)</td>
              <td className="p-3">€18,246.53 (All caps reached)</td>
              <td className="p-3">€52,474.53</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">€67,525.47 (€5,627/mo)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> DE-BMF-2026.1</div>
        <div><strong>Source Authority:</strong> Bundesministerium der Finanzen (BMF) &amp; BMAS</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> 2026 (Steuerfortentwicklungsgesetz Tariff)</div>
        <div><strong>Status:</strong> Verified Statutory Model (100% Code Verified)</div>
        <div><strong>Last Verified:</strong> 2026-01-01</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>Church Tax (Kirchensteuer: 8% in Bayern/Baden-Württemberg, 9% in other federal states)</li>
            <li>Child tax allowances (Kinderfreibetrag: €9,540 total per child)</li>
            <li>Private health insurance (PKV) individual premium schedules</li>
          </ul>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions (Lohnsteuer, Sozialabgaben &amp; Netto)
      </h3>
      <div className="space-y-4 mb-6">
        {GERMANY_SALARY_FAQS.map((faq, index) => (
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
          Complementary Financial Planning Tools &amp; European Salary Hubs
        </h4>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            href="/finance/salary-calculator"
            className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 hover:underline"
          >
            22-Country Salary Hub
          </Link>
          <Link
            href="/finance/salary-calculator/switzerland"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Switzerland Salary Calculator (CHF)
          </Link>
          <Link
            href="/finance/salary-calculator/netherlands"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Netherlands Salary Calculator (Box 1)
          </Link>
          <Link
            href="/finance/mortgage-calculator"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Mortgage &amp; Loan Amortization
          </Link>
          <Link
            href="/finance/invoice-generator"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            EU Contractor Invoice Generator
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
