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
      'A troy ounce (oz t) is the universal international standard for precious metals trading and weighs exactly 31.1034768 grams. An ordinary avoirdupois ounce (oz), standard on American kitchen and postal scales, weighs only 28.349523125 grams. One troy ounce is approximately 9.71% heavier than an ordinary ounce. If you weigh scrap jewelry on a household kitchen scale and assume the reading is troy ounces, your valuation will be inaccurate by nearly 9.7%. KivaroTools explicitly separates troy ounces from ordinary ounces to prevent this costly error.',
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
  {
    question: 'How do I calculate the melt value of multiple scrap gold and silver items at once?',
    answer:
      'Switch from the Quick Melt tab to our Scrap Lot Builder. This institutional accumulator lets you enter distinct line items with independent metal types (Gold, Silver, Platinum, Palladium), hallmark purities (e.g., 10K, 14K, 18K, Sterling 925), gross weights, and weight units (grams, troy ounces, pennyweights, tolas). The calculator computes individual fine masses and cumulative scrap lot melt value, displaying aggregate dealer payout tiers, CSV spreadsheet export, and a clean printable valuation receipt.',
  },
  {
    question: 'What is the exact conversion between 1 tola, 1 pennyweight (dwt), and 1 troy ounce?',
    answer:
      'In precision precious metals metrology: 1 Troy Ounce (oz_t) equals exactly 31.1034768 grams or 20 Pennyweights (dwt) or 480 Grains. 1 Pennyweight (dwt) equals exactly 1.55517384 grams (0.05 oz_t). 1 Tola equals exactly 11.6638038 grams (180 grains or exactly 0.375 troy ounces). Standardizing to the exact gram equivalent ensures that calculations in PKR, INR, AED, or USD remain mathematically irreproachable.',
  },
  {
    question: 'How is 21K (875 fineness) and 22K (916 fineness) gold valued compared to 24K spot?',
    answer:
      'Pure 24K gold has a decimal fineness of 0.999 to 1.000. 22K crown gold (popular across India, Pakistan, and the UK) contains 22/24 parts gold, translating to a decimal fineness of 0.9167 (91.67% pure). 21K gold (popular in Saudi Arabia, UAE, and the Arabian Gulf) contains 21/24 parts gold, translating to a decimal fineness of 0.8750 (87.5% pure). The melt price per gram is simply 24K spot per gram multiplied by 0.9167 for 22K, or multiplied by 0.8750 for 21K.',
  },
  {
    question: 'Can I calculate scrap value for 925 sterling silver flatware and 900 junk silver coins?',
    answer:
      'Yes. For sterling silver tableware, flatware, and jewelry, select Silver and Sterling 925 (92.5% pure silver). For pre-1965 US circulation coinage (dimes, quarters, half-dollars, often called "90% junk silver"), select Silver and Coin 900 (90.0% pure silver). KivaroTools extracts the net fine silver troy ounces and multiplies by the live XAG spot benchmark.',
  },
  {
    question: 'Why do platinum (Pt950, Pt900, Pt850) and palladium (Pd999, Pd950, Pd500) scrap prices differ from gold?',
    answer:
      'Platinum (XPT) and Palladium (XPD) are platinum-group metals (PGMs) with distinct industrial supply and catalytic converter demand profiles. While gold is alloyed primarily with copper, silver, and zinc, platinum is typically alloyed with ruthenium, iridium, or cobalt at 950 (95%), 900 (90%), or 850 (85%) fineness. Palladium jewelry alloys range from Pd950 (95%) to Pd500 (50%). Refineries apply distinct assay testing and higher smelting temperatures to PGMs, often resulting in slightly wider dealer spreads.',
  },
  {
    question: 'How to convert gold spot price per troy ounce in USD to price per gram in EUR, GBP, INR, or PKR?',
    answer:
      'Divide the USD spot price per troy ounce by 31.1034768 to establish the USD price per gram. Then, multiply that per-gram USD rate by the prevailing foreign exchange cross-rate for EUR, GBP, INR, PKR, AED, SAR, CAD, or AUD (sourced automatically from the European Central Bank ECB Frankfurter feed with Open ExchangeRate fallback). KivaroTools handles this two-tier conversion automatically in real time across 32 international fiat currencies.',
  },
  {
    question: 'How does KivaroTools sanitize CSV scrap lot exports against spreadsheet formula injection (CWE-1236)?',
    answer:
      'When you export your multi-item scrap jewelry inventory to an RFC-4180 compliant CSV spreadsheet, KivaroTools inspects every cell string. If any item label begins with characters that trigger dynamic execution in Microsoft Excel, Apple Numbers, or Google Sheets (such as "=", "+", "-", or "@"), KivaroTools automatically prepends an apostrophe (\') escape prefix. This prevents formula injection and malware execution while keeping all calculations 100% browser-local.',
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'How to Calculate Gold, Silver, Platinum, and Palladium Value & Zakat Online',
            description: 'Step-by-step guide to valuing precious metals across Tola, Grams, Troy Ounces, and Kilograms by karat purity (24K–9K), dealer spread, making charges, and Nisab Zakat.',
            step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Select Precious Metal & Karat/Fineness Purity',
        text: 'Choose Gold, Silver, Platinum, or Palladium and select the exact purity (24K, 22K, 21K, 18K, 14K, 999, or 925 Sterling).',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Enter Weight & Traditional or Metric Unit',
        text: 'Input your metal weight and choose Grams, Troy Ounces, Tola (11.6638g), Masha, Ratti, Kilograms, or Grains.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Set Market Spot Rate, Currency & Making Charges',
        text: 'Select your local currency (USD, PKR, INR, AED, SAR, GBP, EUR) and optionally add jewelry making charges, wastage, GST/VAT, and dealer buy/sell spread.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Review Melt Value, Retail Total & Zakat Nisab Status',
        text: 'Inspect the intrinsic melt value, net resale value, retail purchase breakdown, and 2.5% Islamic Zakat liability against the statutory gold/silver Nisab threshold.',
      }
            ],
          }),
        }}
      />

      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-4">
        Precious Metals Market Rates &amp; Scrap Bullion Valuation Guide
      </h2>

      <p className="lead text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
        Whether evaluating broken scrap jewelry before visiting a pawn broker, auditing bullion spot prices,
        cataloging inherited sterling flatware, or calculating cumulative multi-item scrap lots, our <strong>Precious Metals Calculator</strong> provides
        exact, institutional melt valuations for <strong>Gold (XAU)</strong>, <strong>Silver (XAG)</strong>, <strong>Platinum (XPT)</strong>,
        and <strong>Palladium (XPD)</strong> across 32 world fiat currencies and 9 canonical weight denominations.
      </p>

      {/* How to use the calculator */}
      <section aria-labelledby="precious-metals-how-to-use-the-precious-metals" className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
        <h3 id="precious-metals-how-to-use-the-precious-metals" className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
          How to Use the Precious Metals Calculator
        </h3>
        <ol className="list-decimal pl-6 space-y-2.5 text-sm sm:text-base text-slate-600 dark:text-slate-400">
          <li>
            <strong>Select Calculation Mode:</strong> Use <em>Quick Melt Calculator</em> for single rings, bullion bars, or sovereign coins, or switch to <em>Scrap Lot Builder</em> to inventory multi-item lots of varying metals, purities, and units.
          </li>
          <li>
            <strong>Choose Precious Metal &amp; Purity Fineness:</strong> Select Gold, Silver, Platinum, or Palladium. Choose standard hallmark purities (24K, 22K, 21K, 18K, 14K, 10K, 9K Gold; 999 Fine, 958 Britannia, 925 Sterling, 900 Coin Silver; Pt 999 to Pt 850; Pd 999 to Pd 500) or enter custom millesimal fineness decimals.
          </li>
          <li>
            <strong>Enter Gross Measured Weight &amp; Unit:</strong> Weigh your scrap item on a physical scale and choose from 9 exact units: troy ounces (<code>oz_t</code> = 31.1034768 g), grams (<code>g</code>), kilograms (<code>kg</code>), milligrams (<code>mg</code>), kitchen avoirdupois ounces (<code>oz_av</code> = 28.349523125 g), pounds (<code>lb</code>), pennyweights (<code>dwt</code> = 1.55517384 g), tolas (<code>tola</code> = 11.6638038 g), or grains (<code>gr</code> = 0.06479891 g).
          </li>
          <li>
            <strong>Select Spot Pricing Basis &amp; Currency:</strong> Rates sync automatically with live LBMA/COMEX wholesale spot feeds converted across 32 currencies (USD, EUR, GBP, INR, PKR, AED, SAR, CAD, AUD, etc.). Use <em>Enter Custom Spot Override</em> if markets are closed or testing a local jeweler quote.
          </li>
          <li>
            <strong>Audit Dealer Payout Tiers:</strong> Compare full 100% intrinsic melt value against 4 commercial buyer tiers (100% Melt Benchmark, 95% High Refinery/Bullion, 85% Standard Coin Shop, 75% Fast Cash/Pawn) or set a custom payout percentage from 50% to 105%.
          </li>
        </ol>
      </section>

      {/* Input Breakdown */}
      <section aria-labelledby="precious-metals-understanding-calculator-input" className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
        <h3 id="precious-metals-understanding-calculator-input" className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
          Understanding Calculator Inputs &amp; Valuation Parameters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Gross Item Weight &amp; Unit Standardization</h4>
            <p className="text-slate-600 dark:text-slate-400">
              The total physical weight recorded on your balance. Non-metal components (gemstones, internal steel springs, enamel, hollow wax cores) must be deducted before entering gross weight.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Purity &amp; Fineness Rating</h4>
            <p className="text-slate-600 dark:text-slate-400">
              The proportion of pure precious metal alloyed into the piece. Measured in Karats out of 24 for gold, or parts-per-thousand (millesimal fineness, e.g., 925 for sterling silver, 950 for platinum, 875 for 21K gold).
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Live Spot Price Benchmark</h4>
            <p className="text-slate-600 dark:text-slate-400">
              The wholesale market clearing price for one troy ounce of unrefined London Good Delivery bullion. KivaroTools utilizes multi-tier market feeds backed by European Central Bank (ECB) currency cross-rates.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Dealer Payout Tiers &amp; Custom Sliders</h4>
            <p className="text-slate-600 dark:text-slate-400">
              Commercial buyers deduct assay, smelting, insurance, and profit margins. Our engine models four standard tiers (100% Melt, 95% Refinery, 85% Coin Shop, 75% Pawn) plus a custom slider (50% to 105%).
            </p>
          </div>
        </div>
      </section>

      {/* Melt Value Formula & Worked Numerical Examples */}
      <section aria-labelledby="precious-metals-mathematical-formulas-amp-work" className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
        <h3 id="precious-metals-mathematical-formulas-amp-work" className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
          Mathematical Formulas &amp; Worked Numerical Examples
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          All bullion valuation calculations adhere to strict international metrology standards:
        </p>

        <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm space-y-2 mb-6">
          <p><strong>1. Pure Metal Weight (g):</strong> Gross Weight (g) &times; (Purity Fineness &divide; 1000 or Karat &divide; 24)</p>
          <p><strong>2. Pure Weight (Troy Oz):</strong> Pure Metal Weight (g) &divide; 31.1034768</p>
          <p><strong>3. Intrinsic Melt Value:</strong> Pure Weight (Troy Oz) &times; Spot Price Per Troy Ounce</p>
          <p><strong>4. Dealer Cash Offer:</strong> Intrinsic Melt Value &times; Payout Percentage (e.g., 0.85 for 85%)</p>
        </div>

        <div className="space-y-4">
          {/* Worked Example 1: Gold */}
          <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 text-xs sm:text-sm">
            <h4 className="font-bold text-amber-900 dark:text-amber-300 text-sm mb-1">
              Worked Example 1: 14K Gold Ring (5.00 Grams)
            </h4>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Suppose gold spot price is <strong>$4,000.00 / oz t</strong>. 14K gold has a fineness of 14 &divide; 24 = <strong>0.583333 (58.33% pure)</strong>.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
              <li><strong>Fine Pure Gold:</strong> 5.00 g &times; (14 &divide; 24) = <strong>2.9167 grams</strong></li>
              <li><strong>Fine Troy Ounces:</strong> 2.9167 g &divide; 31.1034768 = <strong>0.093774 oz t</strong></li>
              <li><strong>100% Intrinsic Melt Value:</strong> 0.093774 oz t &times; $4,000.00 = <strong>$375.10</strong></li>
              <li><strong>Refiner Cash Offer (95%):</strong> $375.10 &times; 0.95 = <strong>$356.35</strong></li>
              <li><strong>Coin Shop Offer (85%):</strong> $375.10 &times; 0.85 = <strong>$318.84</strong></li>
              <li><strong>Pawn Shop Offer (75%):</strong> $375.10 &times; 0.75 = <strong>$281.33</strong></li>
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
              <li><strong>Fine Pure Silver:</strong> 120.00 g &times; 0.925 = <strong>111.00 grams</strong></li>
              <li><strong>Fine Troy Ounces:</strong> 111.00 g &divide; 31.1034768 = <strong>3.56873 oz t</strong></li>
              <li><strong>100% Intrinsic Melt Value:</strong> 3.56873 oz t &times; $50.00 = <strong>$178.44</strong></li>
              <li><strong>Bullion Dealer Offer (85%):</strong> $178.44 &times; 0.85 = <strong>$151.67</strong></li>
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
              <li><strong>Fine Pure Platinum:</strong> 7.00 g &times; 0.950 = <strong>6.65 grams</strong></li>
              <li><strong>Fine Troy Ounces:</strong> 6.65 g &divide; 31.1034768 = <strong>0.21380 oz t</strong></li>
              <li><strong>100% Intrinsic Melt Value:</strong> 0.21380 oz t &times; $1,500.00 = <strong>$320.70</strong></li>
              <li><strong>Refinery Cash Offer (95%):</strong> $320.70 &times; 0.95 = <strong>$304.67</strong></li>
            </ul>
          </div>
        </div>
      </section>

      {/* Purity Standards Across 4 Metals */}
      <section aria-labelledby="precious-metals-supported-metals-amp-purity-st" className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
        <h3 id="precious-metals-supported-metals-amp-purity-st" className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
          Supported Metals &amp; Purity Standards
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Never apply gold karat logic to silver or platinum. Each precious metal adheres to statutory hallmarking conventions:
        </p>

        <div className="w-full overflow-x-auto mb-6 overscroll-x-contain">
          <table className="min-w-[640px] w-full text-xs sm:text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
            <thead>
              <tr className="bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                <th className="p-2.5 border border-gray-200 dark:border-slate-700">Metal</th>
                <th className="p-2.5 border border-gray-200 dark:border-slate-700">Purity Rating</th>
                <th className="p-2.5 border border-gray-200 dark:border-slate-700">Fineness (&permil;)</th>
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
                <td className="p-2.5 font-bold text-amber-600">Gold (Au)</td>
                <td className="p-2.5 font-semibold">9K Gold</td>
                <td className="p-2.5 font-mono">375.0</td>
                <td className="p-2.5 font-mono">37.5%</td>
                <td className="p-2.5">British &amp; Commonwealth traditional hallmarked jewelry</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-500">Silver (Ag)</td>
                <td className="p-2.5 font-semibold">Fine Silver .999</td>
                <td className="p-2.5 font-mono">999.0</td>
                <td className="p-2.5 font-mono">99.9%</td>
                <td className="p-2.5">Silver bullion bars, 1 oz Silver Eagles, Maples</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-500">Silver (Ag)</td>
                <td className="p-2.5 font-semibold">Britannia Silver .958</td>
                <td className="p-2.5 font-mono">958.0</td>
                <td className="p-2.5 font-mono">95.8%</td>
                <td className="p-2.5">Historical UK silverware, collector bullion</td>
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
                <td className="p-2.5 font-bold text-sky-600">Platinum (Pt)</td>
                <td className="p-2.5 font-semibold">Pt900 / Pt850</td>
                <td className="p-2.5 font-mono">900.0 / 850.0</td>
                <td className="p-2.5 font-mono">90.0% &ndash; 85.0%</td>
                <td className="p-2.5">Japanese and European platinum-iridium alloys</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-purple-600">Palladium (Pd)</td>
                <td className="p-2.5 font-semibold">Pd950 / Pd500</td>
                <td className="p-2.5 font-mono">950.0 / 500.0</td>
                <td className="p-2.5 font-mono">95.0% &ndash; 50.0%</td>
                <td className="p-2.5">Lightweight white-metal jewelry &amp; catalytic metal</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Troy Ounce vs Avoirdupois Ounce Comparison */}
      <section aria-labelledby="precious-metals-troy-ounces-vs-kitchen-ounces-" className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
        <h3 id="precious-metals-troy-ounces-vs-kitchen-ounces-" className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
          Troy Ounces vs. Kitchen Ounces: The Critical Distinction
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
          One of the most frequent mistakes scrap sellers make is weighing their jewelry on a household kitchen or shipping scale (which reads in avoirdupois ounces) and multiplying by the troy ounce spot price. The table below illustrates the standard physical conversions:
        </p>

        <div className="w-full overflow-x-auto mb-6 overscroll-x-contain">
          <table className="min-w-[640px] w-full text-xs sm:text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
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
                <td className="p-2.5">Kitchen scales, postage scales (~8.86% lighter than troy oz; loses 9.7% value if confused)</td>
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
                <td className="p-2.5">South Asian and Middle Eastern traditional retail standard (180 grains)</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">Grain (gr)</td>
                <td className="p-2.5 font-mono">0.0648 g</td>
                <td className="p-2.5 font-mono">0.002083 oz t</td>
                <td className="p-2.5">Precision troy metrology (480 grains = 1 troy ounce)</td>
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
      <section aria-labelledby="precious-metals-practical-use-cases-supported-" className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
        <h3 id="precious-metals-practical-use-cases-supported-" className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
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
              3. Bullion Stacking &amp; Sovereign Coins
            </h4>
            <p className="text-slate-600 dark:text-slate-400">
              Physical investors holding sovereign coins (Krugerrands, Maple Leafs, American Eagles, British Sovereigns) can track total fine troy ounces and current market values with real-time foreign exchange conversion across 32 currencies.
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

      {/* Zone 5: Dedicated Pitfalls, Edge Cases & Verification Guide */}
      <section aria-labelledby="precious-metals-financial-pitfalls-and-edge-cases" className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
        <h2 id="precious-metals-financial-pitfalls-and-edge-cases" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Common Financial Pitfalls, Edge Cases &amp; Verification Guide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
              1. Troy Ounces vs. Kitchen Avoirdupois Ounces (The 9.7% Loss)
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Weighing jewelry on a standard digital kitchen scale calibrated to avoirdupois ounces (28.3495 g) and multiplying by the spot price per troy ounce (31.1035 g) leads to a 9.71% undervaluation. Always verify scale units are set to grams or troy ounces, or convert using <code>grams / 31.1034768</code>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
              2. Gemstone &amp; Movement Tare Weight Deductions
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Large cubic zirconia, natural diamonds, synthetic gems, watch movements, and hollow resin bangles add deceptive gross weight. Smelters and scrap buyers do not pay for non-metallic weight. Always subtract estimated stone weight (tare) to avoid overestimating pure gold mass.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
              3. Hallmark Stamp Verification: Solid vs Plated Marks
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Legitimate solid hallmarks state millesimal fineness: 375 (9K), 417 (10K), 585 (14K), 750 (18K), 875 (21K), 916 (22K), or 999 (24K). Conversely, stamps such as &ldquo;14K HGE&rdquo; (Heavy Gold Electroplate), &ldquo;1/10 14K GF&rdquo; (Gold Filled), or &ldquo;EPNS&rdquo; represent base metal with microscopic gold/silver plating possessing zero scrap melt value.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
              4. Commercial Dealer Payout Margins &amp; Lowball Pawn Offers
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Wholesale refiners pay 93% to 96% of melt value because of smelting and assay costs. Reputable local coin shops pay 80% to 88%. Pawn shops and mail-order cash-for-gold programs often bid only 50% to 75%. Calculating your exact melt baseline allows you to walk away from predatory cash offers.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
              5. Acid Scratch Testing vs XRF Spectrometer Verification
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Unmarked or vintage estate items should be verified via non-destructive X-Ray Fluorescence (XRF) spectroscopy or nitric acid scratch testing. Heavy gold-filled jewelry will pass a surface magnetic test but fails an electronic specific gravity or acid assay test when filed.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">
              6. Multi-Tier Live API Freshness &amp; LocalStorage Caching
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              KivaroTools fetches live rates through multi-tier fallback APIs paired with Frankfurt ECB currency conversions. If market data APIs are unreachable or you are operating offline, the utility falls back seamlessly to browser-cached rates (<code>kivarotools_precious_metals_cache_v2</code>) or user-specified custom spot overrides.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section aria-labelledby="precious-metals-frequently-asked-questions" className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
        <h3 id="precious-metals-frequently-asked-questions" className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">
          Frequently Asked Questions
        </h3>
        <div className="space-y-3">
          {PRECIOUS_METALS_FAQS.map((faq, index) => (
            <details
              key={index}
              className="group rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 transition-colors"
            >
              <summary className="font-semibold text-slate-900 dark:text-slate-100 text-base cursor-pointer select-none list-none flex items-center justify-between">
                <span>{faq.question}</span>
                <span className="ml-2 text-slate-400 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
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
          <span className="text-slate-300 dark:text-slate-700">&bull;</span>
          <Link
            href="/finance/mortgage-calculator"
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            Mortgage &amp; Home Loan Calculator &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">&bull;</span>
          <Link
            href="/finance/emi-calculator"
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            Loan EMI Calculator &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">&bull;</span>
          <Link
            href="/finance/compound-interest"
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            Compound Interest Calculator &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">&bull;</span>
          <Link
            href="/finance/sip-calculator"
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            SIP &amp; Mutual Funds Calculator &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">&bull;</span>
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
