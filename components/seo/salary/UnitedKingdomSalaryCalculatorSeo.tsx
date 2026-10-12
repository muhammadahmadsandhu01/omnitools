import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const UK_SALARY_FAQS: FaqItem[] = [
  {
    question: 'What is the UK Personal Allowance for the 2026–2027 tax year?',
    answer:
      'The standard UK Personal Allowance is £12,570 under emergency and standard tax code 1257L. You do not pay income tax on earnings up to this threshold. For individuals with adjusted net income exceeding £100,000, the Personal Allowance reduces by £1 for every £2 of income above £100,000, reaching £0 at £125,140.',
  },
  {
    question: 'How are Class 1 National Insurance Contributions (NIC) calculated?',
    answer:
      'For employed individuals, Class 1 National Insurance is calculated at 8.0% on earnings between the Primary Threshold (£12,570 per year) and the Upper Earnings Limit (£50,270 per year). On earnings above the Upper Earnings Limit, the rate drops to 2.0% uncapped.',
  },
  {
    question: 'Why does earning between £100,000 and £125,140 create a 60% marginal tax trap?',
    answer:
      'Because every £2 earned above £100,000 reduces your tax-free Personal Allowance by £1, you pay 40% income tax on that £2 plus 40% tax on the newly taxable £1 of lost allowance (equivalent to an additional 20%), plus 2% National Insurance, creating an effective marginal rate of 62% on income in that corridor.',
  },
  {
    question: 'How do Scottish income tax rates differ from the rest of the UK?',
    answer:
      'The Scottish Parliament sets devolved progressive income tax rates across six bands: Starter (19%), Basic (20%), Intermediate (21%), Higher (42%), Advanced (45%), and Top (48%). National Insurance rates remain uniform across the entire United Kingdom.',
  },
  {
    question: 'Does this calculator factor in student loan repayments or pension contributions?',
    answer:
      'The baseline calculator isolates statutory PAYE income tax and Class 1 National Insurance deductions. Voluntary salary sacrifice pension arrangements, employer auto-enrolment contributions (3% statutory minimum), and Student Loan repayments (Plans 1, 2, 4, 5, or Postgraduate) operate as separate payroll withholding deductions.',
  },
];

export default function UnitedKingdomSalaryCalculatorSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: UK_SALARY_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8 shadow-xs">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        UK Salary Calculator 2026–2027: HMRC PAYE Tax, National Insurance &amp; Take-Home Pay
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Calculate your exact net monthly and annual take-home pay in the United Kingdom using official HM Revenue &amp;
        Customs (HMRC) 2026–2027 PAYE income tax schedules and Class 1 National Insurance rates. Understand your gross salary,
        statutory deductions, personal allowance taper, and employer National Insurance costs.
      </p>

      {/* How It Works */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        How HMRC Gross-to-Net Pay Is Calculated
      </h3>
      <ol className="list-decimal pl-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <li>
          <strong>Personal Allowance:</strong> Earnings up to £12,570 are free of income tax (tapered at 50% on income over £100k).
        </li>
        <li>
          <strong>PAYE Income Tax Bands:</strong> Taxable pay is charged at 20% on the basic rate band (£12,570–£50,270), 40% on the higher rate band (£50,270–£125,140), and 45% on the additional rate band (over £125,140).
        </li>
        <li>
          <strong>Class 1 National Insurance:</strong> Deducted at 8.0% on earnings between £12,570 and £50,270 (Upper Earnings Limit), and 2.0% on all earnings exceeding £50,270.
        </li>
        <li>
          <strong>Take-Home Pay:</strong> Gross pay minus PAYE tax and National Insurance equals your net spendable income.
        </li>
      </ol>

      {/* Worked Examples */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Representative Salary Examples (England, Wales &amp; NI, 2026–2027)
      </h3>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left text-sm border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold">
            <tr>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Annual Gross</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">PAYE Income Tax</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">National Insurance</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Total Deductions</th>
              <th className="p-3 border border-slate-200 dark:border-slate-800">Net Take-Home Pay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">£30,000</td>
              <td className="p-3">£3,486.00 (11.6% eff.)</td>
              <td className="p-3">£1,394.40</td>
              <td className="p-3">£4,880.40</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">£25,119.60 (£2,093/mo)</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">£50,000</td>
              <td className="p-3">£7,486.00 (15.0% eff.)</td>
              <td className="p-3">£2,994.40</td>
              <td className="p-3">£10,480.40</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">£39,519.60 (£3,293/mo)</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">£50,270 (UEL)</td>
              <td className="p-3">£7,540.00 (15.0% eff.)</td>
              <td className="p-3">£3,016.00</td>
              <td className="p-3">£10,556.00</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">£39,714.00 (£3,309/mo)</td>
            </tr>
            <tr>
              <td className="p-3 font-medium text-slate-900 dark:text-slate-100">£100,000</td>
              <td className="p-3">£27,432.00 (27.4% eff.)</td>
              <td className="p-3">£4,010.60</td>
              <td className="p-3">£31,442.60</td>
              <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">£68,557.40 (£5,713/mo)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statutory Provenance */}
      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Statutory Provenance &amp; Ruleset Details
      </h3>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-2">
        <div><strong>Ruleset Identifier:</strong> GB-PAYE-2026.1</div>
        <div><strong>Source Authority:</strong> HM Revenue &amp; Customs (HMRC)</div>
        <div><strong>Tax Year / Fiscal Basis:</strong> 2026–2027 (Effective 6 April 2026)</div>
        <div><strong>Status:</strong> Verified Statutory Model (100% Code Verified)</div>
        <div><strong>Last Verified:</strong> 2026-04-06</div>
        <div>
          <strong>Documented Statutory Limitations &amp; Exclusions:</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>Student Loan repayments (Plans 1, 2, 4, 5, or Postgraduate Loan plans)</li>
            <li>Marriage Allowance transfers and Blind Person&apos;s Allowance</li>
            <li>Company car benefit-in-kind (BIK) and private medical insurance tax values</li>
          </ul>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions (HMRC PAYE &amp; National Insurance)
      </h3>
      <div className="space-y-4 mb-6">
        {UK_SALARY_FAQS.map((faq, index) => (
          <div
            key={index}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40"
          >
            <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {faq.question}
            </h4>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>

      {/* Related Calculators & Internal Links */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Complementary UK &amp; International Financial Tools
        </h4>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            href="/finance/salary-calculator"
            className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 hover:underline"
          >
            22-Country Salary Hub
          </Link>
          <Link
            href="/finance/invoice-generator"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            UK Contractor Invoice Generator
          </Link>
          <Link
            href="/finance/compound-interest"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            ISA &amp; Pension Compound Growth
          </Link>
          <Link
            href="/finance/salary-calculator/ireland"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            Ireland Salary Calculator (PAYE/USC)
          </Link>
          <Link
            href="/finance/salary-calculator/united-states"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline"
          >
            US Salary Calculator (IRS/FICA)
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
