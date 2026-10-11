export default function SouthKoreaSalaryCalculatorSeo() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8">
      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        South Korea Salary Calculator 2026 | Net Take-Home Pay
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your estimated take-home pay in South Korea using applicable 2026 statutory payroll,
        income tax, and mandatory social contribution assumptions. This calculator breaks down contractual gross salary,
        statutory deductions, employee contributions, net spendable income, and total employer payroll costs.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Taxation &amp; Payroll Architecture (2026)
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Statutory Korean individual employment income taxation: Earned Income Deduction (근로소득공제), Basic Personal Deduction (기본공제), 8 progressive national tax brackets (6%–45%), Local Income Tax (지방소득세 10% surtax), Earned Income Tax Credit (근로소득세액공제), and 4 Major Insurances (National Pension 4.5% capped at ₩6,170,000/mo, Health Insurance 3.545%, Long-Term Care 12.95% of NHI = 0.459%, Employment Insurance 0.90%).
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> KR-NTS-2026.1</div>
        <div><strong>Source Authority:</strong> National Tax Service (NTS / 국세청) &amp; NHIS (국민건강보험공단)</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> 2026</div>
        <div><strong>Status:</strong> Verified Statutory Model</div>
        <div><strong>Last Verified:</strong> 2026-10-01</div>
        {["Special family deductions (부양가족공제) beyond single filer","Special expense tax credits (medical, education, donation, housing credits)","Severance pay retirement income tax (퇴직소득세)","Non-taxable meal/transport allowance caps exceeding statutory limits"].length > 0 && (
          <div>
            <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
              <li>Special family deductions (부양가족공제) beyond single filer</li>
              <li>Special expense tax credits (medical, education, donation, housing credits)</li>
              <li>Severance pay retirement income tax (퇴직소득세)</li>
              <li>Non-taxable meal/transport allowance caps exceeding statutory limits</li>
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
