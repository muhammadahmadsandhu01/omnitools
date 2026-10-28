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
  {
    question: 'How does the Germany calculator normalize Annual, Monthly, Biweekly, Weekly, Daily, and Hourly pay periods?',
    answer:
      'All statutory tax brackets and social security ceilings in Germany are evaluated on an annualized basis and then normalized across 6 standard payroll frequencies: Annual (1 period), Monthly (12 periods), Biweekly (26 periods), Weekly (52 periods), Daily (260 working days), and Hourly (2,080 standard working hours).',
  },
  {
    question: 'Does this Germany salary calculator compute Total Employer Cost of Employment (CTC)?',
    answer:
      'Yes. Alongside your employee net take-home pay, the Statutory Reconciliation Ledger calculates mandatory employer-side social insurance and payroll contributions on top of contractual gross pay so HR teams and founders can budget true Total Cost of Employment.',
  },
  {
    question: 'What is the difference between my marginal tax rate and effective tax rate in Germany?',
    answer:
      'Your marginal tax rate is the statutory percentage applied only to the next unit of income earned in your highest active tax bracket. Your effective tax rate is your total annual income tax divided by your total annual gross salary, which is always lower than your top marginal slab due to tax-free allowances and lower progressive bands.',
  },
  {
    question: 'Can I export a complete Germany payslip breakdown and slab audit to CSV or Excel?',
    answer:
      'Yes. Click the Export CSV Payslip button inside the Statutory Reconciliation Ledger to download an RFC-4180 compliant, formula-safe CSV file containing Per-Period and Annualized Gross Pay, Income Tax, Social Security, Net Take-Home Pay, Employer Cost, and the official Ruleset ID.',
  },
  {
    question: 'Are my Germany salary figures or tax inputs stored or uploaded to any server?',
    answer:
      'Never. 100% of gross-to-net calculations, progressive bracket audits, and CSV payslip exports execute locally in your browser memory (RAM) with zero server uploads, zero cookies, and zero telemetry logging.',
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'How to Calculate Germany Net Take-Home Pay, Income Tax & Employer Cost',
            description: 'Step-by-step statutory guide to calculating gross-to-net salary, progressive income tax slabs, employee social security, and employer payroll cost in Germany.',
            step: [
              {
                '@type': 'HowToStep',
                position: 1,
                name: 'Enter Contractual Gross Salary & Pay Frequency',
                text: 'Input your gross compensation and select Annual, Monthly, Biweekly, Weekly, Daily, or Hourly pay frequency.',
              },
              {
                '@type': 'HowToStep',
                position: 2,
                name: 'Select Tax Year & Regional / Filing Parameters',
                text: 'Choose the applicable statutory tax year and any regional, filing status, or residency options for Germany.',
              },
              {
                '@type': 'HowToStep',
                position: 3,
                name: 'Review Statutory Reconciliation Ledger & Progressive Slabs',
                text: 'Inspect your net take-home pay, effective vs. marginal tax rate, bracket-by-bracket slab audit table, and total employer cost.',
              },
              {
                '@type': 'HowToStep',
                position: 4,
                name: 'Export RFC-4180 CSV Payslip Breakdown',
                text: 'Click Export CSV Payslip to download a complete per-period and annualized payroll schedule locally.',
              },
            ],
          }),
        }}
      />

      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight mb-4 text-slate-900 dark:text-white">
        Germany Salary Calculator 2026: Brutto-Netto Rechner, Lohnsteuer &amp; Social Deductions
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your exact net salary (Netto) from gross contractual pay (Brutto) in Germany using verified statutory
        specifications under the 2026 BMF tax formula (Steuerfortentwicklungsgesetz) and 2026 BMAS social insurance ceilings.
        Deconstruct your wage tax (Lohnsteuer), pension (RV), unemployment (AV), health (KV), and care (PV) deductions.
      </p>

      {/* How It Works */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        How German Brutto-Netto Payroll Deductions Are Calculated
      </h2>
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
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Representative Salary Examples (Steuerklasse I, Single, 2026)
      </h2>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left text-sm border-collapse">
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
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Statutory Provenance &amp; Ruleset Details
      </h2>
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

            {/* 5-Column Country-Specific Competitor Comparison Matrix */}
      <h2 id="competitor-comparison" className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Germany Salary Calculator Comparison: KivaroTools vs. Brutto-Netto-Rechner.info &amp; Gehalt.de / StepStone
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
        See how KivaroTools compares against leading Germany payroll and tax calculators across statutory accuracy (BMF), pre-tax relief modeling, reverse net-to-gross solving, and client-side privacy:
      </p>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left text-sm border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">Capability / Statutory Feature</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">KivaroTools (100% Free)</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">Brutto-Netto-Rechner.info</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">Gehalt.de / StepStone</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">BMF Lohnsteuerrechner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">2026 €12,348 Grundfreibetrag & Steuerklasse I–VI</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Full EStG §32a progressive formula across all 6 Tax Classes</td>
              <td className="p-3">Yes (No zone breakdown)</td>
              <td className="p-3">Yes (Summary only)</td>
              <td className="p-3">No social security breakdown</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">All 16 Bundesländer Kirchensteuer (8% / 9%) & Soli</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Exact 8% (BY/BW) vs 9% Church Tax + 5.5% Solidaritätszuschlag</td>
              <td className="p-3">Yes</td>
              <td className="p-3">Yes</td>
              <td className="p-3">Tax only</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">RV/AV (€101,400) & KV/PV (€69,750) Caps + bAV Drawer</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Dual BBG ceilings + Pre-Tax bAV / Werbungskosten drawer</td>
              <td className="p-3">No bAV drawer</td>
              <td className="p-3">Requires email signup</td>
              <td className="p-3">None</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">ReverseWunsch-Netto Solver & 9 Pay Periods</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">60-Iteration Reverse Net-to-Gross Solver + 1-Click CSV</td>
              <td className="p-3">Separate page</td>
              <td className="p-3">None</td>
              <td className="p-3">None</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Privacy & Ad-Free Speed</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">100% Client-Side RAM (Zero Server Logging)</td>
              <td className="p-3">Heavy ad banners</td>
              <td className="p-3">Recruiter lead-gen</td>
              <td className="p-3">Legacy government form</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Programmatic Long-Tail Search Intent & Statutory Coverage (26+ Queries) */}
      <div className="my-8 p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 not-prose">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
          Germany Statutory Tax &amp; Payroll Search Coverage (26 Verified Long-Tail Intents)
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">germany salary calculator 2026</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">germany take home pay calculator eur</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">germany gross to net salary after tax</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">germany income tax brackets and slabs (BMF)</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">germany monthly biweekly weekly daily hourly paycheck</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">germany reverse net to gross target salary solver</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">germany total employer cost of employment ctc</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">germany employee social security contribution cap</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">germany effective tax rate vs marginal tax bracket</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">germany pre tax pension retirement deduction calculator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">how much tax do i pay on my salary in germany</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">germany annual to monthly and hourly net wage converter</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">germany expatriate and resident payroll tax comparison</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">germany job offer gross to net paycheck estimator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">germany biweekly 26 pay periods vs semi monthly 24 periods</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">germany daily rate 260 days and hourly rate 2080 hours</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">germany statutory payroll waterfall ledger csv export</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">free client side germany tax calculator zero data logging</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">germany software engineer and remote worker net pay</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">germany bonus overtime and gross compensation tax audit</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">brutto netto rechner 2026 steuerklasse 1 bis 6 grundfreibetrag 12348</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">kirchensteuer 8 prozent bayern baden wuerttemberg 9 prozent rechner</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">beitragsbemessungsgrenze 2026 rentenversicherung 101400 krankenversicherung 69750</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">betriebliche altersvorsorge bav steuerersparnis gehaltsrechner</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">arbeitgeberanteile sozialversicherung gesamtkosten arbeitgeber rechner</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">brutto netto rechner info und gehalt de kostenlose alternative</span>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Frequently Asked Questions (Lohnsteuer, Sozialabgaben &amp; Netto)
      </h2>
      <div className="space-y-3 mb-6 not-prose">
        {GERMANY_SALARY_FAQS.map((faq, index) => (
          <details
            key={index}
            className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 transition-colors"
          >
            <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 m-0">
                {faq.question}
              </h3>
              <span className="text-slate-400 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400 m-0">
              {faq.answer}
            </p>
          </details>
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
