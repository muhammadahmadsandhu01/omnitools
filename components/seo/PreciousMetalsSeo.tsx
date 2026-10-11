export default function PreciousMetalsSeo() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-8">
      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        Precious Metal Rates & Bullion Valuation: Gold, Silver, Platinum & Palladium
      </h2>
      <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
        Track real-time benchmark reference rates for <strong>Gold (XAU)</strong>, <strong>Silver (XAG)</strong>, <strong>Platinum (XPT)</strong>, and <strong>Palladium (XPD)</strong> with transparent timestamp tracking, multi-currency conversion, and flexible weight denominations. Whether you are tracking the international gold price per gram, gold price per tola, troy ounce spot references, or calculating the intrinsic melt value of 24K, 22K, and 18K bullion and jewelry, our market rates dashboard delivers institutional-grade calculations directly in your browser across 32 major global economies.
      </p>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Multi-Market Unit Conversions: Gram, Troy Ounce, 10g, Kilogram, and Tola
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Global bullion markets trade primarily in Troy Ounces and Grams, while South Asian, Gulf, and Middle Eastern markets (including Pakistan, India, UAE, and Saudi Arabia) traditionally measure physical gold in <strong>Tolas</strong> and <strong>10-Gram</strong> increments. Our platform applies exact canonical physical conversions:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2 text-slate-600 dark:text-slate-400">
        <li><strong>1 Troy Ounce</strong> = exactly <strong>31.1034768 grams</strong> = exactly 2.6666667 (8/3) Tolas.</li>
        <li><strong>1 Tola</strong> = exactly 180 grains = <strong>11.6638038 grams</strong> = exactly 0.375 (3/8) of a Troy Ounce.</li>
        <li><strong>10 Grams</strong> = 0.3215075 Troy Ounces = 0.857353 Tolas.</li>
        <li><strong>1 Kilogram</strong> = 1,000 grams = 32.1507466 Troy Ounces = 85.7353 Tolas.</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Understanding Gold Karat & Purity Spectrum
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        Pure 24K gold is malleable and generally minted into investment bars and sovereign coins. Retail jewelry is alloyed with copper, silver, or zinc to increase durability. The fine gold content directly determines the intrinsic metal value:
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
              <td className="p-3 border border-gray-200 dark:border-slate-700">Investment bullion bars, biscuits, sovereign coins</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">22 Karat (22K)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">22 / 24 = 91.67%</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">916</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">South Asian & Middle Eastern bridal jewelry</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">21 Karat (21K)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">21 / 24 = 87.5%</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">875</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Gulf and Arab traditional jewelry</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">18 Karat (18K)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">18 / 24 = 75.0%</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">750</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">Diamond fine jewelry, European luxury watches</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">14 Karat (14K)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">14 / 24 = 58.33%</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">585</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">North American everyday durable jewelry</td>
            </tr>
            <tr>
              <th scope="row" className="p-3 font-semibold border border-gray-200 dark:border-slate-700 whitespace-nowrap">9 Karat (9K)</th>
              <td className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">9 / 24 = 37.5%</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700 whitespace-nowrap">375</td>
              <td className="p-3 border border-gray-200 dark:border-slate-700">British entry-level commercial jewelry</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        International Spot Reference vs. Local Physical Dealer Rates
      </h3>
      <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-400">
        It is essential to distinguish between <strong>International Spot Reference Prices</strong> and <strong>Local Physical Dealer / Bullion Rates</strong>:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2 text-slate-600 dark:text-slate-400">
        <li><strong>International Spot (COMEX / LBMA Benchmark):</strong> Represents electronic wholesale contracts for large bullion bars (e.g., 400-oz Good Delivery bars) settled in major financial centres such as London and New York.</li>
        <li><strong>Converted International Spot Reference:</strong> Reflects the wholesale spot benchmark converted into a target local currency using real-time FX Reference Rates, adjusted for physical weight and purity fractions.</li>
        <li><strong>Local Physical Dealer / Sarafa Market Rates:</strong> Reflects retail counter rates set by regional jeweler associations (such as Sarafa associations in Pakistan, bullion guilds in India, or Gold Souk merchants in Dubai). Local physical rates incorporate import customs duties, value-added taxes (VAT/GST), shipping insurance, dealer premiums, and local cash liquidity dynamics. Unless explicitly labeled with a verified physical exchange feed, rates shown here represent converted spot references.</li>
      </ul>

      <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Frequently Asked Questions (FAQs)
      </h3>
      <div className="space-y-4 mb-6">
        <div>
          <h4 className="font-semibold text-slate-800 dark:text-slate-200">How is the gold rate per tola calculated from international spot?</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Multiply the international price per Troy Ounce (in USD) by the prevailing currency exchange rate (e.g. USD/PKR or USD/INR), and then multiply by 0.375 (since 1 tola = 3/8 troy ounce = 180 / 480 troy oz = 11.6638038 grams).
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-slate-800 dark:text-slate-200">What are making charges and how do they affect retail jewelry prices?</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Making charges represent the jeweler&apos;s labor, artistic craftsmanship, casting waste, and retail profit margin. Melt calculators display pure intrinsic bullion value only, excluding jewelry making charges and local sales taxes.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-slate-800 dark:text-slate-200">Does this tool store financial calculations or transmit user input data?</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            No. All metal value calculations, custom weights, purities, and dealer spread simulations are calculated locally in your browser. Zero user input data is transmitted to external servers.
          </p>
        </div>
      </div>
    </article>
  );
}

