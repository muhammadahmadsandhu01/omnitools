import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const PRECIOUS_METALS_FAQS: FaqItem[] = [
  {
    question: 'How is the gold rate per tola calculated from international spot prices?',
    answer:
      'The international wholesale spot benchmark is quoted in USD per Troy Ounce (31.1034768 grams). To calculate the price per tola, the Troy Ounce price is multiplied by the target currency exchange rate (e.g. USD to PKR or INR) and then multiplied by 0.375 (since 1 tola = 3/8 Troy Ounce = 180 / 480 grains = 11.6638038 grams).',
  },
  {
    question: 'What are making charges and how do they impact physical retail jewelry purchases?',
    answer:
      'Making charges represent the artisan labor, casting waste, design craftsmanship, and retailer margin added on top of raw bullion value. Melt value calculators estimate the pure intrinsic metal content only; physical jewelry stores will add making charges (typically 5% to 25%+) plus local sales taxes or VAT.',
  },
  {
    question: 'Why do local physical jeweler rates differ from international spot reference rates?',
    answer:
      'International spot rates represent wholesale electronic contracts for 400-oz Good Delivery bullion bars in financial centers like London (LBMA) and New York (COMEX). Local over-the-counter rates (such as Sarafa associations in Pakistan, bullion guilds in India, or Dubai Souk merchants) incorporate import customs tariffs, shipping logistics, refining markups, cash liquidity premiums, and regional supply/demand.',
  },
  {
    question: 'What is the exact gold content difference between 24K, 22K, and 18K gold?',
    answer:
      'Karat measures gold purity in parts out of 24. 24 Karat is 100% pure bullion (999.9 fineness). 22 Karat is 22/24 parts gold (91.67% purity, common in traditional South Asian and Middle Eastern jewelry). 18 Karat is 18/24 parts gold (75.0% purity, standard for diamond settings and luxury timepieces).',
  },
  {
    question: 'Does this calculator store user inputs or guarantee trade execution prices?',
    answer:
      'No. All bullion valuation calculations, custom weights, purity ratios, and dealer spread simulations execute locally in your browser with zero input transmission. Rates provided are indicative reference benchmarks for informational and valuation planning purposes, not guaranteed trade execution quotes.',
  },
];

export default function PreciousMetalsSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PRECIOUS_METALS_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        Precious Metal Rates &amp; Bullion Valuation: Gold, Silver, Platinum &amp; Palladium
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Track benchmark market reference rates for <strong>Gold (XAU)</strong>, <strong>Silver (XAG)</strong>, <strong>Platinum (XPT)</strong>, and <strong>Palladium (XPD)</strong> with multi-currency conversion and flexible weight denominations.
        Whether you are evaluating the international gold price per gram, gold price per tola, troy ounce spot references,
        or calculating the intrinsic melt value of 24K, 22K, and 18K bullion and jewelry, our market rates dashboard delivers
        transparent reference calculations directly in your browser across 32 major global economies.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Multi-Market Unit Conversions: Gram, Troy Ounce, 10g, Kilogram &amp; Tola
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Global bullion markets trade wholesale contracts in Troy Ounces and Grams, while South Asian, Gulf, and Middle Eastern markets
        (including Pakistan, India, UAE, and Saudi Arabia) traditionally measure physical gold in <strong>Tolas</strong> and <strong>10-Gram</strong> increments.
        Our platform applies canonical physical conversion ratios:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2 text-slate-600 dark:text-slate-400">
        <li><strong>1 Troy Ounce (oz t):</strong> Exactly <strong>31.1034768 grams</strong> = exactly 2.6666667 (8/3) Tolas.</li>
        <li><strong>1 Tola:</strong> Exactly 180 grains = <strong>11.6638038 grams</strong> = exactly 0.375 (3/8) of a Troy Ounce.</li>
        <li><strong>10 Grams:</strong> 0.3215075 Troy Ounces = 0.857353 Tolas.</li>
        <li><strong>1 Kilogram (kg):</strong> 1,000 grams = 32.1507466 Troy Ounces = 85.7353 Tolas.</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Understanding Gold Karat &amp; Purity Spectrum
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Pure 24K gold is malleable and generally minted into investment bars and sovereign coins. Retail jewelry is alloyed with copper, silver, or zinc to increase mechanical strength. The fine gold content directly determines intrinsic metal value:
      </p>
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Karat</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Purity Ratio</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Fineness</th>
              <th scope="col" className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">Common Application</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">24 Karat (24K)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">24 / 24 = 100.0%</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">999.9</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Investment bullion bars, minted coins, sovereign wafers</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">22 Karat (22K)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">22 / 24 = 91.67%</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">916.7</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">South Asian &amp; Middle Eastern bridal jewelry</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">21 Karat (21K)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">21 / 24 = 87.5%</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">875.0</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Gulf and Arab traditional craftsmanship</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">18 Karat (18K)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">18 / 24 = 75.0%</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">750.0</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Diamond fine jewelry, European luxury watches</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">14 Karat (14K)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">14 / 24 = 58.33%</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">583.3</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">North American everyday durable jewelry</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">9 Karat (9K)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">9 / 24 = 37.5%</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">375.0</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">British commercial entry-level jewelry</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        International Spot Reference vs. Local Physical Dealer Rates
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        It is essential to distinguish between wholesale electronic benchmarks and retail physical prices:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2 text-slate-600 dark:text-slate-400">
        <li><strong>International Spot (COMEX / LBMA Benchmark):</strong> Represents wholesale settlement contracts for large bullion bars (e.g. 400-oz Good Delivery bars) in financial centers like London and New York.</li>
        <li><strong>Converted Spot Reference:</strong> Reflects wholesale spot benchmarks converted into local currency using real-time FX reference rates, adjusted for physical weight and purity fractions.</li>
        <li><strong>Local Physical Dealer / Sarafa Market Rates:</strong> Reflects retail counter rates set by regional jeweler associations (such as Sarafa associations in Pakistan, bullion guilds in India, or Gold Souk merchants in Dubai). Local rates incorporate import duties, VAT/GST, dealer premiums, and retail logistics.</li>
      </ul>

      <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions
      </h3>
      <dl className="space-y-6 mb-6">
        {PRECIOUS_METALS_FAQS.map((faq, index) => (
          <div key={index}>
            <dt className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {faq.question}
            </dt>
            <dd className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              {faq.answer}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-800">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
          Related Financial &amp; Conversion Utilities
        </h4>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/finance/crypto-converter"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Crypto &amp; Currency Converter &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/finance/salary-calculator"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Salary &amp; Net Take-Home Pay Calculator &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/finance/compound-interest"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Compound Interest Calculator &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/finance/invoice-generator"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Free Invoice Generator &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
}
