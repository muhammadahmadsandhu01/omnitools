export default function ItalySalaryCalculatorSeo() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8">
      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        Italy Salary Calculator 2026 | Net Take-Home Pay
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your estimated take-home pay in Italy using applicable 2026 statutory payroll,
        income tax, and mandatory social contribution assumptions. This calculator breaks down contractual gross salary,
        statutory deductions, employee contributions, net spendable income, and total employer payroll costs.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Taxation &amp; Payroll Architecture (2026)
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        IRPEF 3 progressive brackets: 23% up to €28,000, 35% to €50,000, 43% excess. Detrazione da lavoro dipendente (up to €1,955). Regional surtax by region (Lombardia, Lazio, Piemonte, Veneto, etc.) and municipal surtax 0.80%. Employee INPS: 9.19% (plus 1% solidarity over €55,008) capped at massimale €116,366/year. INPS is deductible before IRPEF. Employer INPS: ~30.0% capped.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> IT-ADE-2026.1</div>
        <div><strong>Source Authority:</strong> Agenzia delle Entrate &amp; INPS</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> 2026</div>
        <div><strong>Status:</strong> Verified Statutory Model</div>
        <div><strong>Last Verified:</strong> 2026-10-01</div>
        {["Trattamento Integrativo (ex Bonus Renzi €100/mo) specific conditionality","Detrazioni per carichi di famiglia (figli a carico / coniuge)","Spese sanitarie e mutui detraibili al 19%","TFR (Trattamento di Fine Rapporto) separate taxation"].length > 0 && (
          <div>
            <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
              <li>Trattamento Integrativo (ex Bonus Renzi €100/mo) specific conditionality</li>
              <li>Detrazioni per carichi di famiglia (figli a carico / coniuge)</li>
              <li>Spese sanitarie e mutui detraibili al 19%</li>
              <li>TFR (Trattamento di Fine Rapporto) separate taxation</li>
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
