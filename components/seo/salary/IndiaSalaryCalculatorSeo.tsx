export default function IndiaSalaryCalculatorSeo() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8">
      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        India Salary Calculator FY 2025-2026 (AY 2026-2027) | Net Take-Home Pay
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your estimated take-home pay in India using applicable FY 2025-2026 (AY 2026-2027) statutory payroll,
        income tax, and mandatory social contribution assumptions. This calculator breaks down contractual gross salary,
        statutory deductions, employee contributions, net spendable income, and total employer payroll costs.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Taxation &amp; Payroll Architecture (FY 2025-2026 (AY 2026-2027))
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        AY 2026-27 (Budget 2025): New Tax Regime with ₹75,000 standard deduction, Section 87A full rebate up to ₹12 Lakhs taxable income (7 revised slabs 0%–30%), 4% Health &amp; Education Cess, and Old Regime fallback. AY 2025-26: Section 87A rebate up to ₹7 Lakhs, Finance (No. 2) Act 2024 slabs.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> IN-CBDT-2026.2</div>
        <div><strong>Source Authority:</strong> Income Tax Department of India (CBDT)</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> FY 2025-2026 (AY 2026-2027)</div>
        <div><strong>Status:</strong> Verified Statutory Model</div>
        <div><strong>Last Verified:</strong> 2026-07-23</div>
        {["House Rent Allowance (HRA) exemption under Old Regime","Section 80D health insurance premium deductions","Marginal relief mechanism for income marginally above ₹12 lakh threshold (AY 2026-27)"].length > 0 && (
          <div>
            <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
              <li>House Rent Allowance (HRA) exemption under Old Regime</li>
              <li>Section 80D health insurance premium deductions</li>
              <li>Marginal relief mechanism for income marginally above ₹12 lakh threshold (AY 2026-27)</li>
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
