export default function SouthAfricaSalaryCalculatorSeo() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8">
      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        South Africa Salary Calculator 2026-2027 | Net Take-Home Pay
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your estimated take-home pay in South Africa using applicable 2026-2027 statutory payroll,
        income tax, and mandatory social contribution assumptions. This calculator breaks down contractual gross salary,
        statutory deductions, employee contributions, net spendable income, and total employer payroll costs.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Taxation &amp; Payroll Architecture (2026-2027)
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        SARS PAYE progressive tax brackets: 18% to 45% with Primary Tax Rebate R 17,235 (tax threshold R 95,750). UIF: 1.0% employee and 1.0% employer capped at R 17,712/month (R 212,544/year). Employer Skills Development Levy (SDL): 1.0%.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> ZA-SARS-2026.1</div>
        <div><strong>Source Authority:</strong> South African Revenue Service (SARS)</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> 2026-2027</div>
        <div><strong>Status:</strong> Verified Statutory Model</div>
        <div><strong>Last Verified:</strong> 2026-10-01</div>
        {["Secondary and tertiary age rebates (age 65+ and 75+)","Medical Scheme Fees Tax Credits (Section 6A/6B)","Retirement annuity fund deductions (Section 11F)"].length > 0 && (
          <div>
            <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
              <li>Secondary and tertiary age rebates (age 65+ and 75+)</li>
              <li>Medical Scheme Fees Tax Credits (Section 6A/6B)</li>
              <li>Retirement annuity fund deductions (Section 11F)</li>
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
