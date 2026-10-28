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
  },
  {
    question: 'How does the Mexico calculator normalize Annual, Monthly, Biweekly, Weekly, Daily, and Hourly pay periods?',
    answer:
      'All statutory tax brackets and social security ceilings in Mexico are evaluated on an annualized basis and then normalized across 6 standard payroll frequencies: Annual (1 period), Monthly (12 periods), Biweekly (26 periods), Weekly (52 periods), Daily (260 working days), and Hourly (2,080 standard working hours).',
  },
  {
    question: 'Does this Mexico salary calculator compute Total Employer Cost of Employment (CTC)?',
    answer:
      'Yes. Alongside your employee net take-home pay, the Statutory Reconciliation Ledger calculates mandatory employer-side social insurance and payroll contributions on top of contractual gross pay so HR teams and founders can budget true Total Cost of Employment.',
  },
  {
    question: 'What is the difference between my marginal tax rate and effective tax rate in Mexico?',
    answer:
      'Your marginal tax rate is the statutory percentage applied only to the next unit of income earned in your highest active tax bracket. Your effective tax rate is your total annual income tax divided by your total annual gross salary, which is always lower than your top marginal slab due to tax-free allowances and lower progressive bands.',
  },
  {
    question: 'Can I export a complete Mexico payslip breakdown and slab audit to CSV or Excel?',
    answer:
      'Yes. Click the Export CSV Payslip button inside the Statutory Reconciliation Ledger to download an RFC-4180 compliant, formula-safe CSV file containing Per-Period and Annualized Gross Pay, Income Tax, Social Security, Net Take-Home Pay, Employer Cost, and the official Ruleset ID.',
  },
  {
    question: 'Are my Mexico salary figures or tax inputs stored or uploaded to any server?',
    answer:
      'Never. 100% of gross-to-net calculations, progressive bracket audits, and CSV payslip exports execute locally in your browser memory (RAM) with zero server uploads, zero cookies, and zero telemetry logging.',
  },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'How to Calculate Mexico Net Take-Home Pay, Income Tax & Employer Cost',
            description: 'Step-by-step statutory guide to calculating gross-to-net salary, progressive income tax slabs, employee social security, and employer payroll cost in Mexico.',
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
                text: 'Choose the applicable statutory tax year and any regional, filing status, or residency options for Mexico.',
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
        Mexico Salary Calculator 2026: Sueldo Bruto a Neto, SAT ISR & IMSS Cuotas
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your net take-home salary in Mexican Pesos (MXN / $) using the official Servicio de Administración Tributaria (SAT) 11-bracket Article 152 ISR tariff and Instituto Mexicano del Seguro Social (IMSS) employee and employer contributions.
      </p>

      {/* How It Works */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        How Mexico Gross-to-Net Payroll &amp; Tax Withholding Is Calculated
      </h2>
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
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Representative Mexico Salary &amp; Net Take-Home Pay Examples (2026)
      </h2>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left text-sm border-collapse">
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
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Statutory Provenance &amp; Ruleset Details
      </h2>
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

            {/* 5-Column Country-Specific Competitor Comparison Matrix */}
      <h2 id="competitor-comparison" className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Mexico Salary Calculator Comparison: KivaroTools vs. Nominax Calculadora ISR &amp; FiscoClic / El Contribuyente
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
        See how KivaroTools compares against leading Mexico payroll and tax calculators across statutory accuracy (SAT & IMSS), pre-tax relief modeling, reverse net-to-gross solving, and client-side privacy:
      </p>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left text-sm border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">Capability / Statutory Feature</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">KivaroTools (100% Free)</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">Nominax Calculadora ISR</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">FiscoClic / El Contribuyente</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">Talent.com MX</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Art. 152 LISR 11-Bracket ISR Tariff & Cuota Fija</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Full 11-tier SAT progressive table (1.92% to 35%) with slab audit</td>
              <td className="p-3">Summary ISR total</td>
              <td className="p-3">Summary ISR total</td>
              <td className="p-3">Simplified brackets</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">IMSS Cuotas Obreras (2.75% up to 25 UMAs) & Infonavit</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Employee IMSS (2.75%) + Employer IMSS/Infonavit/SAR (25.5% CTC)</td>
              <td className="p-3">Employee view only</td>
              <td className="p-3">Employee view only</td>
              <td className="p-3">Employee view only</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Pre-Tax PPR / Deducciones Personales Drawer</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Interactive Pre-Tax Plan Personal de Retiro (PPR) tax drawer</td>
              <td className="p-3">None</td>
              <td className="p-3">None</td>
              <td className="p-3">None</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Reverse Sueldo Neto-a-Bruto Solver & CSV</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">60-Iteration Reverse Net Solver + 9 Pay Periods + CSV Export</td>
              <td className="p-3">Basic toggle</td>
              <td className="p-3">None</td>
              <td className="p-3">None</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">100% Client-Side Privacy</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Zero Server Uploads or Lead-Gen Forms</td>
              <td className="p-3">HR software lead-gen</td>
              <td className="p-3">Ad-heavy page</td>
              <td className="p-3">Server logging</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Programmatic Long-Tail Search Intent & Statutory Coverage (26+ Queries) */}
      <div className="my-8 p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 not-prose">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
          Mexico Statutory Tax &amp; Payroll Search Coverage (26 Verified Long-Tail Intents)
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">mexico salary calculator 2026</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">mexico take home pay calculator mxn</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">mexico gross to net salary after tax</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">mexico income tax brackets and slabs (SAT & IMSS)</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">mexico monthly biweekly weekly daily hourly paycheck</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">mexico reverse net to gross target salary solver</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">mexico total employer cost of employment ctc</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">mexico employee social security contribution cap</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">mexico effective tax rate vs marginal tax bracket</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">mexico pre tax pension retirement deduction calculator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">how much tax do i pay on my salary in mexico</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">mexico annual to monthly and hourly net wage converter</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">mexico expatriate and resident payroll tax comparison</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">mexico job offer gross to net paycheck estimator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">mexico biweekly 26 pay periods vs semi monthly 24 periods</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">mexico daily rate 260 days and hourly rate 2080 hours</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">mexico statutory payroll waterfall ledger csv export</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">free client side mexico tax calculator zero data logging</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">mexico software engineer and remote worker net pay</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">mexico bonus overtime and gross compensation tax audit</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">calculadora sueldo bruto a neto mexico 2026 tablas isr sat articulo 152</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">cuota fija y porcentaje sobre excedente limite inferior isr mexico</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">cuotas obreras imss 2.75 por ciento tope 25 umas calculadora mxn</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">costo patronal imss infonavit sar 25.5 por ciento calculadora nomina</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">plan personal de retiro ppr deducciones personales isr mexico</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">nominax y fiscoclic calculadora isr sueldo neto alternativa gratis</span>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Frequently Asked Questions (Mexico Income Tax &amp; Payroll)
      </h2>
      <div className="space-y-3 mb-6 not-prose">
        {MEXICO_SALARY_FAQS.map((faq, index) => (
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
