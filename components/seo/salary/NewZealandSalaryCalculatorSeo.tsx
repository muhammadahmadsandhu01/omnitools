export default function NewZealandSalaryCalculatorSeo() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8">
      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        New Zealand Salary Calculator 2026-2027 | Net Take-Home Pay
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your estimated take-home pay in New Zealand using applicable 2026-2027 statutory payroll,
        income tax, and mandatory social contribution assumptions. This calculator breaks down contractual gross salary,
        statutory deductions, employee contributions, net spendable income, and total employer payroll costs.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Taxation &amp; Payroll Architecture (2026-2027)
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        PAYE personal income tax: 10.5% up to $15,600, 17.5% to $53,500, 30.0% to $78,100, 33.0% to $180,000, 39.0% excess. ACC Earners&apos; Levy: 1.60% capped at $142,283 maximum liable earnings. KiwiSaver: configurable 0%-10% employee contribution (default 3%) with 3% statutory employer matching.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> NZ-IRD-2026.1</div>
        <div><strong>Source Authority:</strong> Inland Revenue (Te Tari Taake)</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> 2026-2027</div>
        <div><strong>Status:</strong> Verified Statutory Model</div>
        <div><strong>Last Verified:</strong> 2026-10-01</div>
        {["Independent Earner Tax Credit (IETC)","Student loan repayment deductions (12% over threshold)","Working for Families Tax Credits"].length > 0 && (
          <div>
            <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
              <li>Independent Earner Tax Credit (IETC)</li>
              <li>Student loan repayment deductions (12% over threshold)</li>
              <li>Working for Families Tax Credits</li>
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
