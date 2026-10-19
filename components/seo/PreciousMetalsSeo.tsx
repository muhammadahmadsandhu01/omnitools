import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const PRECIOUS_METALS_FAQS: FaqItem[] = [
  {
    question: 'What is melt value, and how is it different from retail jewelry price?',
    answer:
      'Melt value (or intrinsic bullion value) represents the raw commodity value of the pure precious metal contained inside an item at wholesale spot market prices, assuming the item was melted down and refined. Retail jewelry prices are significantly higher because they include manufacturer design, stone setting, brand premiums, craftsmanship labor, retailer markup, and sales taxes. When selling scrap jewelry to a buyer, melt value is the baseline ceiling they work downward from.',
  },
  {
    question: 'What is the critical difference between a troy ounce and an ordinary kitchen scale ounce?',
    answer:
      'A troy ounce (oz t) is the universal international standard for precious metals trading and weighs exactly 31.1034768 grams. An ordinary avoirdupois ounce (oz), standard on American kitchen and postal scales, weighs only 28.349523125 grams. One troy ounce is approximately 9.71% heavier than an ordinary ounce. If you weigh scrap jewelry on a household kitchen scale and assume the reading is troy ounces, your valuation will be inaccurate by nearly 9%. KivaroTools explicitly separates troy ounces from ordinary ounces to prevent this costly error.',
  },
  {
    question: 'How much do refiners, bullion dealers, and pawn shops actually pay for scrap gold?',
    answer:
      'No commercial buyer pays 100% of melt value because they must cover assay testing, chemical refining losses, capital holding costs, and business profit. High-volume precious metal refiners typically pay 93% to 96% of melt value. Local coin shops and reputable bullion dealers generally pay 85% to 90% for clean scrap jewelry. Pawn shops, jewelry kiosks, and mail-in cash-for-gold operations often pay 65% to 80% (and sometimes as low as 50%). Always obtain multiple quotes and know your item’s exact melt value before negotiating.',
  },
  {
    question: 'How do hallmark stamps (such as 585, 750, 916, and 925) translate to purity?',
    answer:
      'Hallmark stamps indicate fineness in parts-per-thousand (millesimal fineness). 375 corresponds to 9K gold (37.5% pure); 417 corresponds to 10K gold (41.67% pure); 585 corresponds to 14K gold (58.33% pure); 750 corresponds to 18K gold (75.0% pure); 875 corresponds to 21K gold (87.5% pure); 916 corresponds to 22K gold (91.67% pure); and 999 or 999.9 indicates 24K pure bullion. For silver, 925 signifies Sterling Silver (92.5% pure), 900 indicates Coin Silver (90.0% pure), and 800 indicates European Continental Silver. For platinum, Pt950 indicates 95.0% pure platinum.',
  },
  {
    question: 'How is gold rate per tola calculated from international spot prices?',
    answer:
      'Wholesale spot contracts in London (LBMA) and New York (COMEX) trade in USD per Troy Ounce (31.1034768 grams). 1 Tola is an ancient Vedic and Gulf physical standard defined as exactly 180 grains, or 11.6638038 grams, which equals exactly 0.375 (3/8) of a Troy Ounce. To calculate the 24K price per tola, the international spot price per troy ounce is multiplied by 0.375 and then converted into local currency (such as PKR, INR, or AED) using prevailing foreign exchange reference rates.',
  },
  {
    question: 'Can I use this calculator if the live market feed is down or closed for the weekend?',
    answer:
      'Yes. KivaroTools provides a dedicated "Enter Custom Spot Override" toggle. When enabled, you can enter any custom spot benchmark price per troy ounce in your selected currency. The calculator will immediately recompute all gross weights, fine weights, melt values, and dealer payout tiers based on your manual figure.',
  },
  {
    question: 'How do gemstones and diamonds affect scrap jewelry melt value?',
    answer:
      'Melt value calculators determine the value of the precious metal only. Heavy gemstones, diamonds, cubic zirconia, enamel, and spring mechanisms in clasps add gross weight on a scale but contain zero gold. Professional buyers will subtract the estimated stone weight (known as tare weight) before computing their offer. If your jewelry contains certified, valuable natural diamonds or precious gems, consider having the stones appraised separately or unset before selling the metal for melt.',
  },
  {
    question: 'Does KivaroTools store my scrap lot items or transmit my personal weights to a server?',
    answer:
      'No. All mathematical valuation algorithms, unit conversions, multi-item scrap lot calculations, and dealer spread simulations execute 100% locally inside your web browser. Neither your weights, item names, lot manifests, nor estimated payouts are ever transmitted, tracked, or saved on KivaroTools servers.',
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
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-6 sm:p-10 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-10 shadow-sm">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-4">
        Precious Metals Melt Value &amp; Scrap Bullion Valuation Guide
      </h2>

      <p className="lead text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
        Whether you are evaluating old scrap jewelry before visiting a pawn shop, verifying wholesale bullion prices,
        cataloging estate silverware, or calculating multi-item scrap lots, our <strong>Precious Metals Calculator</strong> provides
        accurate, transparent melt valuation for <strong>Gold (XAU)</strong>, <strong>Silver (XAG)</strong>, <strong>Platinum (XPT)</strong>,
        and <strong>Palladium (XPD)</strong> across 32 world currencies and 9 canonical weight denominations.
      </p>

      {/* How to use the calculator */}
      <section className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
          How to Use the Precious Metals Calculator
        </h3>
        <ol className="list-decimal pl-6 space-y-2.5 text-sm sm:text-base text-slate-600 dark:text-slate-400">
          <li>
            <strong>Select Your Calculation Mode:</strong> Use <em>Quick Melt Calculator</em> for single rings, bars, or coins, or switch to <em>Scrap Lot Builder</em> to sum multiple items of varying metals and purities.
          </li>
          <li>
            <strong>Choose Your Metal &amp; Purity:</strong> Select Gold, Silver, Platinum, or Palladium. Choose the standard hallmark fineness (e.g. 14K Gold, Sterling 925 Silver, Pt950 Platinum) or select <em>Custom Fineness</em> to enter exact decimal purity or percentages.
          </li>
          <li>
            <strong>Enter Gross Weight &amp; Weight Unit:</strong> Weigh your item on a scale and select the matching unit: grams, troy ounces, pennyweights (dwt), kitchen scale ounces, tolas, kilograms, or milligrams.
          </li>
          <li>
            <strong>Select Spot Pricing Basis:</strong> By default, calculations automatically sync with live wholesale market spot rates. Click <em>Enter Custom Spot Override</em> if markets are closed or if you have a local jeweler quote to test.
          </li>
          <li>
            <strong>Review Your Valuation Breakdown:</strong> Inspect pure fine metal content, wholesale melt benchmark (100%), and realistic dealer cash payout estimates (Refiner 95%, Jeweler 88%, Pawn Shop 75%).
          </li>
        </ol>
      </section>

      {/* Input Breakdown */}
      <section className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
          Understanding Calculator Inputs &amp; Valuation Parameters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Gross Item Weight</h4>
            <p className="text-slate-600 dark:text-slate-400">
              The total mass of the object as measured on a physical scale before purity extraction. Note that non-metal components (gemstones, watch movements, internal springs) must be excluded from this figure.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Purity &amp; Fineness Rating</h4>
            <p className="text-slate-600 dark:text-slate-400">
              The proportion of precious metal alloyed into the piece. Measured in Karats out of 24 for gold, or parts-per-thousand (millesimal fineness e.g. 925 for sterling silver, 950 for platinum).
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Spot Price Benchmark</h4>
            <p className="text-slate-600 dark:text-slate-400">
              The current trading price for one troy ounce of raw, unrefined bullion bar on major commodity exchanges (LBMA and COMEX). Spot rates fluctuate continuously during trading hours.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Dealer Payout Tiers</h4>
            <p className="text-slate-600 dark:text-slate-400">
              Realistic cash offers based on industry buyer category: High-volume refiners (~95%), bullion dealers (~88%), and pawn shops (~75%), accounting for melting, assay, and operational margins.
            </p>
          </div>
        </div>
      </section>

      {/* Melt Value Formula & Worked Numerical Examples */}
      <section className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
          Mathematical Formulas &amp; Worked Numerical Examples
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          All bullion valuation calculations adhere to strict international metrology standards:
        </p>

        <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm space-y-2 mb-6">
          <p><strong>1. Pure Metal Weight (g):</strong> Gross Weight (g) × (Purity Fineness ÷ 1000 or Karat ÷ 24)</p>
          <p><strong>2. Pure Weight (Troy Oz):</strong> Pure Metal Weight (g) ÷ 31.1034768</p>
          <p><strong>3. Intrinsic Melt Value:</strong> Pure Weight (Troy Oz) × Spot Price Per Troy Ounce</p>
          <p><strong>4. Dealer Cash Offer:</strong> Intrinsic Melt Value × Payout Percentage (e.g. 0.88 for 88%)</p>
        </div>

        <div className="space-y-4">
          {/* Worked Example 1: Gold */}
          <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 text-xs sm:text-sm">
            <h4 className="font-bold text-amber-900 dark:text-amber-300 text-sm mb-1">
              Worked Example 1: 14K Gold Ring (5.00 Grams)
            </h4>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Suppose gold spot price is <strong>$4,000.00 / oz t</strong>. 14K gold has a fineness of 14 ÷ 24 = <strong>0.583333 (58.33% pure)</strong>.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
              <li><strong>Fine Pure Gold:</strong> 5.00 g × (14 ÷ 24) = <strong>2.9167 grams</strong></li>
              <li><strong>Fine Troy Ounces:</strong> 2.9167 g ÷ 31.1034768 = <strong>0.093774 oz t</strong></li>
              <li><strong>100% Intrinsic Melt Value:</strong> 0.093774 oz t × $4,000.00 = <strong>$375.10</strong></li>
              <li><strong>Refiner Cash Offer (95%):</strong> $375.10 × 0.95 = <strong>$356.35</strong></li>
              <li><strong>Pawn Shop Offer (75%):</strong> $375.10 × 0.75 = <strong>$281.33</strong></li>
            </ul>
          </div>

          {/* Worked Example 2: Silver */}
          <div className="p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-xs sm:text-sm">
            <h4 className="font-bold text-slate-900 dark:text-slate-200 text-sm mb-1">
              Worked Example 2: Sterling Silver Flatware (120.00 Grams)
            </h4>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Suppose silver spot price is <strong>$50.00 / oz t</strong>. Sterling silver has a hallmark of 925 (<strong>92.5% pure silver</strong>).
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
              <li><strong>Fine Pure Silver:</strong> 120.00 g × 0.925 = <strong>111.00 grams</strong></li>
              <li><strong>Fine Troy Ounces:</strong> 111.00 g ÷ 31.1034768 = <strong>3.56873 oz t</strong></li>
              <li><strong>100% Intrinsic Melt Value:</strong> 3.56873 oz t × $50.00 = <strong>$178.44</strong></li>
              <li><strong>Bullion Dealer Offer (88%):</strong> $178.44 × 0.88 = <strong>$157.03</strong></li>
            </ul>
          </div>

          {/* Worked Example 3: Platinum */}
          <div className="p-4 rounded-2xl border border-sky-200 dark:border-sky-900/40 bg-sky-50/40 dark:bg-sky-950/20 text-xs sm:text-sm">
            <h4 className="font-bold text-sky-900 dark:text-sky-300 text-sm mb-1">
              Worked Example 3: Platinum Pt950 Band (7.00 Grams)
            </h4>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Suppose platinum spot price is <strong>$1,500.00 / oz t</strong>. Pt950 contains <strong>95.0% pure platinum</strong>.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
              <li><strong>Fine Pure Platinum:</strong> 7.00 g × 0.950 = <strong>6.65 grams</strong></li>
              <li><strong>Fine Troy Ounces:</strong> 6.65 g ÷ 31.1034768 = <strong>0.21380 oz t</strong></li>
              <li><strong>100% Intrinsic Melt Value:</strong> 0.21380 oz t × $1,500.00 = <strong>$320.70</strong></li>
            </ul>
          </div>
        </div>
      </section>

      {/* Purity Standards Across 4 Metals */}
      <section className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
          Supported Metals &amp; Purity Standards
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Never apply gold karat logic to silver or platinum. Each precious metal adheres to statutory hallmarking conventions:
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-xs sm:text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
            <thead>
              <tr className="bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                <th className="p-2.5 border border-gray-200 dark:border-slate-700">Metal</th>
                <th className="p-2.5 border border-gray-200 dark:border-slate-700">Purity Rating</th>
                <th className="p-2.5 border border-gray-200 dark:border-slate-700">Fineness (‰)</th>
                <th className="p-2.5 border border-gray-200 dark:border-slate-700">Percentage</th>
                <th className="p-2.5 border border-gray-200 dark:border-slate-700">Common Use Case</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <td className="p-2.5 font-bold text-amber-600">Gold (Au)</td>
                <td className="p-2.5 font-semibold">24K (Pure Bullion)</td>
                <td className="p-2.5 font-mono">999.9</td>
                <td className="p-2.5 font-mono">99.9%</td>
                <td className="p-2.5">Investment bars, sovereign coins, wafers</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-amber-600">Gold (Au)</td>
                <td className="p-2.5 font-semibold">22K (Crown Gold)</td>
                <td className="p-2.5 font-mono">916.7</td>
                <td className="p-2.5 font-mono">91.67%</td>
                <td className="p-2.5">South Asian bridal jewelry, British Sovereigns</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-amber-600">Gold (Au)</td>
                <td className="p-2.5 font-semibold">21K Gold</td>
                <td className="p-2.5 font-mono">875.0</td>
                <td className="p-2.5 font-mono">87.5%</td>
                <td className="p-2.5">Arabian Gulf and Middle Eastern gold jewelry</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-amber-600">Gold (Au)</td>
                <td className="p-2.5 font-semibold">18K Gold</td>
                <td className="p-2.5 font-mono">750.0</td>
                <td className="p-2.5 font-mono">75.0%</td>
                <td className="p-2.5">Diamond fine jewelry, Swiss luxury watches</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-amber-600">Gold (Au)</td>
                <td className="p-2.5 font-semibold">14K Gold</td>
                <td className="p-2.5 font-mono">583.3 / 585</td>
                <td className="p-2.5 font-mono">58.33%</td>
                <td className="p-2.5">Everyday durable North American jewelry</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-amber-600">Gold (Au)</td>
                <td className="p-2.5 font-semibold">10K Gold</td>
                <td className="p-2.5 font-mono">416.7 / 417</td>
                <td className="p-2.5 font-mono">41.67%</td>
                <td className="p-2.5">US legal minimum karat, high-school rings</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-500">Silver (Ag)</td>
                <td className="p-2.5 font-semibold">Fine Silver .999</td>
                <td className="p-2.5 font-mono">999.0</td>
                <td className="p-2.5 font-mono">99.9%</td>
                <td className="p-2.5">Silver bullion bars, 1 oz Silver Eagles</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-500">Silver (Ag)</td>
                <td className="p-2.5 font-semibold">Sterling Silver .925</td>
                <td className="p-2.5 font-mono">925.0</td>
                <td className="p-2.5 font-mono">92.5%</td>
                <td className="p-2.5">Flatware, tableware, chains, silver rings</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-500">Silver (Ag)</td>
                <td className="p-2.5 font-semibold">Coin / US 90% Junk</td>
                <td className="p-2.5 font-mono">900.0</td>
                <td className="p-2.5 font-mono">90.0%</td>
                <td className="p-2.5">Pre-1965 US dimes, quarters, half-dollars</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-sky-600">Platinum (Pt)</td>
                <td className="p-2.5 font-semibold">Pt950 Platinum</td>
                <td className="p-2.5 font-mono">950.0</td>
                <td className="p-2.5 font-mono">95.0%</td>
                <td className="p-2.5">High-end wedding bands, solitaire mountings</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-purple-600">Palladium (Pd)</td>
                <td className="p-2.5 font-semibold">Pd950 Palladium</td>
                <td className="p-2.5 font-mono">950.0</td>
                <td className="p-2.5 font-mono">95.0%</td>
                <td className="p-2.5">Lightweight platinum-family jewelry &amp; catalytic metal</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Troy Ounce vs Avoirdupois Ounce Comparison */}
      <section className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
          Troy Ounces vs. Kitchen Ounces: The Critical Distinction
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
          One of the most frequent mistakes scrap sellers make is weighing their jewelry on a household kitchen or shipping scale (which reads in avoirdupois ounces) and multiplying by the troy ounce spot price. The table below illustrates the standard physical conversions:
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-xs sm:text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
            <thead>
              <tr className="bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                <th className="p-2.5 border border-gray-200 dark:border-slate-700">Weight Unit</th>
                <th className="p-2.5 border border-gray-200 dark:border-slate-700">Grams Equivalent</th>
                <th className="p-2.5 border border-gray-200 dark:border-slate-700">Troy Oz Equivalent</th>
                <th className="p-2.5 border border-gray-200 dark:border-slate-700">Industry Standard Usage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <td className="p-2.5 font-bold">Troy Ounce (oz t)</td>
                <td className="p-2.5 font-mono">31.1035 g</td>
                <td className="p-2.5 font-mono">1.0000 oz t</td>
                <td className="p-2.5">Global wholesale bullion contracts, coins, bars</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-amber-600">Avoirdupois Ounce (oz)</td>
                <td className="p-2.5 font-mono">28.3495 g</td>
                <td className="p-2.5 font-mono">0.9115 oz t</td>
                <td className="p-2.5">Kitchen scales, postage scales (~8.86% lighter than troy oz)</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">Pennyweight (dwt)</td>
                <td className="p-2.5 font-mono">1.5552 g</td>
                <td className="p-2.5 font-mono">0.0500 oz t</td>
                <td className="p-2.5">US jeweler bench scale unit (exactly 1/20 troy oz)</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">Tola</td>
                <td className="p-2.5 font-mono">11.6638 g</td>
                <td className="p-2.5 font-mono">0.3750 oz t</td>
                <td className="p-2.5">South Asian and Middle Eastern traditional retail standard</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">Kilogram (kg)</td>
                <td className="p-2.5 font-mono">1,000.0 g</td>
                <td className="p-2.5 font-mono">32.1507 oz t</td>
                <td className="p-2.5">Central bank reserve bars and wholesale industrial deliveries</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Practical Use Cases */}
      <section className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
          Practical Use Cases Supported by KivaroTools
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
              1. Negotiating Scrap Jewelry Sales
            </h4>
            <p className="text-slate-600 dark:text-slate-400">
              Before taking unwanted broken jewelry, chains, or old dental gold to a local pawn broker, calculate its intrinsic melt floor. Knowing that your 14K chain has $450 of pure gold prevents accepting predatory 50% lowball offers.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
              2. Estate &amp; Silverware Inventory
            </h4>
            <p className="text-slate-600 dark:text-slate-400">
              Liquidating inherited silver tableware and flatware? Use our <em>Scrap Lot Builder</em> to enter forks, spoons, and teapots by weight, aggregating their total fine silver grams and wholesale bullion cash value.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
              3. Bullion Stacking &amp; Portfolio Tracking
            </h4>
            <p className="text-slate-600 dark:text-slate-400">
              Physical investors holding sovereign coins (Krugerrands, Maple Leafs, Eagles) can track total fine troy ounces and current market values with real-time foreign exchange conversion across 32 currencies.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
              4. Artisanal Casting &amp; Bench Recycling
            </h4>
            <p className="text-slate-600 dark:text-slate-400">
              Metalsmiths and jewelry bench artisans recycling sprues, bench sweeps, and casting cutoffs can model refiner assay fees and determine net cash returns before sending scrap lots to commercial smelters.
            </p>
          </div>
        </div>
      </section>

      {/* Common Pitfalls & Troubleshooting */}
      <section className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
          Troubleshooting &amp; Common Valuation Pitfalls
        </h3>
        <ul className="list-disc pl-6 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          <li>
            <strong>Gold-Plated Items (HGE, GF, RGP, EPNS):</strong> Stamps like &ldquo;14K HGE&rdquo; (Heavy Gold Electroplate), &ldquo;1/10 14K GF&rdquo; (Gold Filled), or &ldquo;EPNS&rdquo; (Electroplated Nickel Silver) indicate base metal coated in microscopic gold or silver. These items have virtually zero scrap melt value and will be rejected by refiners.
          </li>
          <li>
            <strong>Magnetic Testing Failure:</strong> Real gold and fine silver are non-magnetic. If a piece stamped &ldquo;18K&rdquo; strongly attracts a neodymium magnet, it is likely gold-plated brass or steel.
          </li>
          <li>
            <strong>Overlooking Stone Weight:</strong> Large cubic zirconias, gemstones, or lead-filled hollow bangles add deceptive weight on a scale. Always request that buyers zero out non-metallic materials before calculating payments.
          </li>
          <li>
            <strong>Confusing Pennyweights with Grams:</strong> 1 pennyweight (dwt) is 1.5552 grams. If a seller enters 10 dwt as 10 grams, they under-report weight by over 35%. Always ensure scale and selector units align.
          </li>
        </ul>
      </section>

      {/* FAQ Section */}
      <section className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">
          Frequently Asked Questions
        </h3>
        <dl className="space-y-6">
          {PRECIOUS_METALS_FAQS.map((faq, index) => (
            <div key={index}>
              <dt className="text-base font-bold text-slate-900 dark:text-slate-100">
                {faq.question}
              </dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Internal Links to Related Utilities */}
      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-slate-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
          Explore Related Financial Calculators
        </h4>
        <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
          <Link
            href="/finance/crypto-converter"
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            Crypto &amp; Currency Converter &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/finance/salary-calculator"
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            Salary Take-Home Pay Calculator &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/finance/mortgage-calculator"
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            Mortgage &amp; Home Loan Calculator &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/finance/compound-interest"
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            Compound Interest Calculator &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link
            href="/finance/invoice-generator"
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            Pro PDF Invoice Generator &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
}
