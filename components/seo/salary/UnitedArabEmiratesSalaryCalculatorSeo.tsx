export default function UnitedArabEmiratesSalaryCalculatorSeo() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8">
      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        United Arab Emirates Salary Calculator 2026 | Net Take-Home Pay
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your estimated take-home pay in United Arab Emirates using applicable 2026 statutory payroll,
        income tax, and mandatory social contribution assumptions. This calculator breaks down contractual gross salary,
        statutory deductions, employee contributions, net spendable income, and total employer payroll costs.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Taxation &amp; Payroll Architecture (2026)
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        0% personal income tax. GPSSA social security for UAE/GCC nationals (5% employee, 12.5% employer, capped at AED 50,000/mo). Expatriate end-of-service gratuity provision (~5.75% of basic salary) modeled on employer side, never reducing employee net pay.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> AE-MOHRE-2026.1</div>
        <div><strong>Source Authority:</strong> Ministry of Human Resources &amp; Emiratisation (MOHRE) &amp; GPSSA</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> 2026</div>
        <div><strong>Status:</strong> Limited Statutory Scope</div>
        <div><strong>Last Verified:</strong> 2026-01-01</div>
        {["Voluntary savings schemes (DIFC Workplace Savings Scheme)","Corporate tax obligations for sole proprietorships > AED 375,000","Housing fee deductions for Dubai residents"].length > 0 && (
          <div>
            <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
              <li>Voluntary savings schemes (DIFC Workplace Savings Scheme)</li>
              <li>Corporate tax obligations for sole proprietorships &gt; AED 375,000</li>
              <li>Housing fee deductions for Dubai residents</li>
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
