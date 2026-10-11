export default function BrazilSalaryCalculatorSeo() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8">
      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        Brazil Salary Calculator 2026 | Net Take-Home Pay
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your estimated take-home pay in Brazil using applicable 2026 statutory payroll,
        income tax, and mandatory social contribution assumptions. This calculator breaks down contractual gross salary,
        statutory deductions, employee contributions, net spendable income, and total employer payroll costs.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Taxation &amp; Payroll Architecture (2026)
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        IRPF monthly progressive table (0%, 7.5%, 15%, 22.5%, 27.5%) with simplified monthly discount (R$ 564.80). INSS progressive employee tiers (7.5%, 9.0%, 12.0%, 14.0%) capped at R$ 7,786.02/month. INSS is deductible before IRPF. Employer statutory CLT burden: 20% INSS + 5.8% Terceiros + 2% RAT + 8% FGTS = 35.8%.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> BR-RFB-2026.1</div>
        <div><strong>Source Authority:</strong> Receita Federal do Brasil (RFB) &amp; Previdência Social</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> 2026</div>
        <div><strong>Status:</strong> Verified Statutory Model</div>
        <div><strong>Last Verified:</strong> 2026-10-01</div>
        {["13th salary and 1/3 vacation bonus separate taxation","Dependent deduction (Dedução por dependente R$ 189.59/month)","Medical and private education deductions"].length > 0 && (
          <div>
            <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
              <li>13th salary and 1/3 vacation bonus separate taxation</li>
              <li>Dependent deduction (Dedução por dependente R$ 189.59/month)</li>
              <li>Medical and private education deductions</li>
            </ul>
          </div>
        )}
      </div>

      <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-xs text-amber-800 dark:text-amber-300">
        <strong>Disclaimer:</strong> This calculation is for individual financial planning and gross-to-net estimation.
        Actual payroll withholding may vary based on localized municipal levies, specific tax codes, benefits in kind,
        and personal filing circumstances. It does not constitute formal legal, accounting, or tax advice.
      </div>
    </article>
  );
}
