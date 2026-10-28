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
  },
  {
    question: 'How does the Brazil calculator normalize Annual, Monthly, Biweekly, Weekly, Daily, and Hourly pay periods?',
    answer:
      'All statutory tax brackets and social security ceilings in Brazil are evaluated on an annualized basis and then normalized across 6 standard payroll frequencies: Annual (1 period), Monthly (12 periods), Biweekly (26 periods), Weekly (52 periods), Daily (260 working days), and Hourly (2,080 standard working hours).',
  },
  {
    question: 'Does this Brazil salary calculator compute Total Employer Cost of Employment (CTC)?',
    answer:
      'Yes. Alongside your employee net take-home pay, the Statutory Reconciliation Ledger calculates mandatory employer-side social insurance and payroll contributions on top of contractual gross pay so HR teams and founders can budget true Total Cost of Employment.',
  },
  {
    question: 'What is the difference between my marginal tax rate and effective tax rate in Brazil?',
    answer:
      'Your marginal tax rate is the statutory percentage applied only to the next unit of income earned in your highest active tax bracket. Your effective tax rate is your total annual income tax divided by your total annual gross salary, which is always lower than your top marginal slab due to tax-free allowances and lower progressive bands.',
  },
  {
    question: 'Can I export a complete Brazil payslip breakdown and slab audit to CSV or Excel?',
    answer:
      'Yes. Click the Export CSV Payslip button inside the Statutory Reconciliation Ledger to download an RFC-4180 compliant, formula-safe CSV file containing Per-Period and Annualized Gross Pay, Income Tax, Social Security, Net Take-Home Pay, Employer Cost, and the official Ruleset ID.',
  },
  {
    question: 'Are my Brazil salary figures or tax inputs stored or uploaded to any server?',
    answer:
      'Never. 100% of gross-to-net calculations, progressive bracket audits, and CSV payslip exports execute locally in your browser memory (RAM) with zero server uploads, zero cookies, and zero telemetry logging.',
  },
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
            name: 'How to Calculate Brazil Net Take-Home Pay, Income Tax & Employer Cost',
            description: 'Step-by-step statutory guide to calculating gross-to-net salary, progressive income tax slabs, employee social security, and employer payroll cost in Brazil.',
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
                text: 'Choose the applicable statutory tax year and any regional, filing status, or residency options for Brazil.',
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
        Brazil Salary Calculator 2026: Salário Líquido CLT, IRPF & INSS Progressivo
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your net salary in Brazil (Salário Bruto para Líquido CLT in R$) using Receita Federal progressive IRPF brackets (0% to 27.5%), the Portaria Interministerial 2026 progressive INSS schedule (capped at R$ 8,475.55/mo), and employer FGTS/INSS costs.
      </p>

      {/* How It Works */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        How Brazil Gross-to-Net Payroll &amp; Tax Withholding Is Calculated
      </h2>
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
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Representative Brazil Salary &amp; Net Take-Home Pay Examples (2026 & 2025)
      </h2>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left text-sm border-collapse">
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
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Statutory Provenance &amp; Ruleset Details
      </h2>
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

            {/* 5-Column Country-Specific Competitor Comparison Matrix */}
      <h2 id="competitor-comparison" className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Brazil Salary Calculator Comparison: KivaroTools vs. Salario.com.br &amp; iDinheiro / Mobills CLT
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
        See how KivaroTools compares against leading Brazil payroll and tax calculators across statutory accuracy (Receita Federal), pre-tax relief modeling, reverse net-to-gross solving, and client-side privacy:
      </p>
      <div className="w-full overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm my-6 not-prose">
        <table className="w-full min-w-[680px] text-left text-sm border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">Capability / Statutory Feature</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">KivaroTools (100% Free)</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">Salario.com.br</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">iDinheiro / Mobills CLT</th>
              <th scope="col" className="p-3 border border-slate-200 dark:border-slate-800 whitespace-nowrap">Talent.com BR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Progressive CLT INSS vs. R$ 564.80 Simplified Discount</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Auto-optimizes Legal INSS vs. R$ 564.80 Desconto Simplificado</td>
              <td className="p-3">Manual or single method</td>
              <td className="p-3">Basic CLT INSS only</td>
              <td className="p-3">Flat approximation</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">5-Bracket Monthly IRPF Slab Audit</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Full 0% to 27.5% parcel-to-deduct slab-by-slab table</td>
              <td className="p-3">Summary total only</td>
              <td className="p-3">Summary total only</td>
              <td className="p-3">Summary total only</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Employer INSS (20%) + FGTS (8%) CTC Model</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">Yes (Full 28% Encargos Patronais Employer Cost Ledger)</td>
              <td className="p-3">Employee view only</td>
              <td className="p-3">Employee view only</td>
              <td className="p-3">None</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Reverse Net-to-Gross Solver & 9 Pay Periods</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">60-Iteration Reverse Net Solver + 9 Periods + CSV Export</td>
              <td className="p-3">Monthly only</td>
              <td className="p-3">Monthly only</td>
              <td className="p-3">Basic periods</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">Salary Data Privacy & Speed</th>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">100% In-Browser RAM (Zero Server Uploads)</td>
              <td className="p-3">Heavy ad popups</td>
              <td className="p-3">Lead-gen forms</td>
              <td className="p-3">Server-side logging</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Programmatic Long-Tail Search Intent & Statutory Coverage (26+ Queries) */}
      <div className="my-8 p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 not-prose">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
          Brazil Statutory Tax &amp; Payroll Search Coverage (26 Verified Long-Tail Intents)
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">brazil salary calculator 2026</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">brazil take home pay calculator brl</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">brazil gross to net salary after tax</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">brazil income tax brackets and slabs (Receita Federal)</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">brazil monthly biweekly weekly daily hourly paycheck</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">brazil reverse net to gross target salary solver</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">brazil total employer cost of employment ctc</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">brazil employee social security contribution cap</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">brazil effective tax rate vs marginal tax bracket</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">brazil pre tax pension retirement deduction calculator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">how much tax do i pay on my salary in brazil</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">brazil annual to monthly and hourly net wage converter</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">brazil expatriate and resident payroll tax comparison</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">brazil job offer gross to net paycheck estimator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">brazil biweekly 26 pay periods vs semi monthly 24 periods</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">brazil daily rate 260 days and hourly rate 2080 hours</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">brazil statutory payroll waterfall ledger csv export</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">free client side brazil tax calculator zero data logging</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">brazil software engineer and remote worker net pay</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">brazil bonus overtime and gross compensation tax audit</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">calculadora salario liquido clt 2026 inss irpf desconto simplificado</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">brazil clt progressive inss 7.5 9 12 14 percent ceiling calculator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">receita federal irpf 27.5 percent bracket take home pay brl</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">custo total empregador fgts 8 por cento inss patronal calculadora</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">pre tax previdencia privada pgbldeduction brazil salary calculator</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/80 dark:border-slate-700/70">salario com br alternative free client side clt calculator</span>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-4 text-slate-900 dark:text-white">
        Frequently Asked Questions (Brazil Income Tax &amp; Payroll)
      </h2>
      <div className="space-y-3 mb-6 not-prose">
        {BRAZIL_SALARY_FAQS.map((faq, index) => (
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
