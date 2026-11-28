import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export const PRECIOUS_METALS_FAQS: FaqItem[] = [
  {
    question: 'What is raw melt value, and how is it different from retail jewelry price?',
    answer:
      'Raw melt value (intrinsic bullion value) is the commodity value of the pure precious metal inside an item at wholesale spot prices, assuming the piece is melted and refined. Retail jewelry prices are higher because they include design labor, stone setting, brand markup, and sales taxes or VAT. When selling scrap gold, silver, platinum, or palladium, raw melt value is the theoretical ceiling buyers work downward from.',
  },
  {
    question: 'How much do pawn shops, jewelers, and refiners actually pay for scrap gold?',
    answer:
      'Commercial buyers rarely pay 100% of melt value because they cover assay testing, refining losses, holding costs, and profit margins. As general industry benchmarks modeled in this scrap value calculator, high-volume refiners may pay around 95% of melt value, local coin shops and jewelers around 88% (typically 85% to 90% for clean scrap), and pawn shops or quick-cash buyers often offer 50% to 75% (modeled at a 75% reference benchmark here, with custom Sell Discount % and Fixed Assay Fee inputs to test any exact gold scrap price offer). Always compare multiple quotes.',
  },
  {
    question: 'How much is scrap silver worth?',
    answer:
      'Scrap silver value depends on its gross weight, purity stamp, and current silver spot price. For example, at an illustrative spot price of $50.00 per troy ounce, 50 grams of 925 sterling silver contains 46.25 grams of pure silver with a raw melt value of $74.35, while 100 grams of 800 European continental silver has an 800 silver scrap price (100% melt) of $128.60. Actual dealer cash offers typically range from 70% to 88% of melt value depending on lot size and buyer type.',
  },
  {
    question: 'What is the difference between a troy ounce and a kitchen scale ounce?',
    answer:
      'A troy ounce (oz t) is the international precious metals standard and weighs exactly 31.1034768 grams. An avoirdupois ounce (oz), used on household kitchen and postal scales, weighs 28.349523125 grams—about 8.86% lighter than a troy ounce (meaning a troy ounce is roughly 9.71% heavier). KivaroTools separates Troy Ounces (oz t) from Avoirdupois Ounces (oz avdp) so you do not miscalculate weight measured on a kitchen scale.',
  },
  {
    question: 'How do hallmark stamps (375, 585, 750, 916, 925, 800, Pt950) translate to purity?',
    answer:
      'Hallmark stamps indicate fineness in parts per thousand (millesimal fineness). For gold: 375 is 9K / 9ct (37.5%), 417 is 10K (41.67%), 585 is 14K (58.33%), 750 is 18K / 18ct (75.0%), 875 is 21K (87.5%), 916 is 22K (91.67%), and 999 or 999.9 is 24K bullion. For silver: 925 is Sterling Silver (92.5%), 900 is Coin Silver (90.0%), and 800 is Continental Silver (80.0%). For platinum and palladium: Pt950 and Pd950 indicate 95.0% purity, while Pd500 indicates 50.0% purity.',
  },
  {
    question: 'How do I calculate 9 carat (9ct) or 18ct scrap gold prices per gram in ZAR or GBP?',
    answer:
      'Select South Africa (ZAR) or United Kingdom (GBP) in the country or currency selector, choose Gold (XAU), and pick "9 Karat / 9 Carat (9K / 9ct) — 37.5% Fine Gold" or "18 Karat / 18 Carat (18K / 18ct) — 75.0% Fine Gold" in the Purity dropdown. Enter the gross weight in grams, troy ounces, or pennyweights. The calculator converts the international spot benchmark into ZAR or GBP and displays 100% melt value alongside 95% refiner, 88% jeweler, and 75% pawn reference tiers. Note that local VAT (such as South African 15% VAT) is not calculated automatically.',
  },
  {
    question: 'How is gold rate per tola calculated from international spot prices?',
    answer:
      'Wholesale spot markets quote gold in USD per troy ounce (31.1034768 grams). One tola equals exactly 180 grains, or 11.6638038 grams, which is exactly 0.375 (3/8) of a troy ounce. To calculate the converted 24K spot rate per tola, the tool multiplies the USD troy ounce spot price by 0.375 and converts it using the ExchangeRate-API interbank rate for PKR, INR, AED, or SAR. Local bullion markets (such as Pakistan Sarafa or India MCX/IBJA) may trade at a domestic premium plus customs duties or taxes.',
  },
  {
    question: 'Can I use this calculator if live market feeds are unavailable or markets are closed?',
    answer:
      'Yes. Click "Enter Custom Spot Override" above the calculator to enter any spot price per troy ounce in your chosen currency (or enter a local per-tola rate when Pakistan is selected). The calculator immediately recomputes fine weight, melt value, and dealer payout tiers using your custom benchmark.',
  },
  {
    question: 'How do I value multiple scrap gold, silver, platinum, and palladium items together?',
    answer:
      'Switch to the "Scrap Lot" tab to build a multi-item manifest. You can add rings, chains, 925 sterling or 800 continental silver flatware, platinum bands, or palladium pieces with different metals, purities, and weight units. The tool sums total gross grams, total pure fine metal, and aggregated dealer payout tiers, and lets you copy a text summary or export an RFC-4180 CSV spreadsheet.',
  },
  {
    question: 'Can I calculate scrap value for 925 sterling silver, 900 coin silver, and 800 silver?',
    answer:
      'Yes. Select Silver (XAG) and choose "Sterling Silver (.925)" for stamped sterling jewelry and flatware, "Coin Silver / US 90% Junk Silver (.900)" for 90% silver coins weighed by total gross weight, or "European Continental Silver (.800)" to check an 800 silver scrap price. Note that this tool values silver by measured weight and purity rather than counting individual coin denominations.',
  },
  {
    question: 'How do gemstones, watch movements, and plated stamps affect melt value?',
    answer:
      'Melt value covers solid precious metal only. Diamonds, colored stones, cubic zirconia, watch movements, and steel clasp springs add scale weight but contain no precious metal; deduct their estimated tare weight before calculating. Stamps like "14K HGE" (Heavy Gold Electroplate), "14K GF" (Gold Filled), or "EPNS" denote base metal with thin plating and should not be calculated as solid karat gold.',
  },
  {
    question: 'Does KivaroTools send my scrap weights or lot inventory to a server?',
    answer:
      'No. Your entered weights, purities, custom spot overrides, item names, scrap lot manifests, and CSV exports are computed entirely inside your browser and are never transmitted to KivaroTools servers. The page makes external read-only network requests only to fetch public market reference prices (Gold API for spot prices, ExchangeRate-API for currency rates, and our historical futures proxy for chart quotes).',
  },
  {
    question: 'How does KivaroTools protect CSV scrap lot exports against spreadsheet formula injection (CWE-1236)?',
    answer:
      'Before downloading a Scrap Lot or historical chart CSV, every cell is sanitized per CWE-1236. Any field starting with "=", "+", "-", "@", tab, or carriage return is prefixed with a leading apostrophe (\') and properly quoted under RFC-4180 rules so spreadsheet apps treat user-entered item descriptions as plain text rather than executable formulas.',
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

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Calculate Scrap Gold, Silver, Platinum, and Palladium Melt Value Online',
    description:
      'Step-by-step guide to calculating raw melt value across 9 weight units, 32 currencies, multi-item scrap lots, and commercial dealer payout tiers.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Select Country, Currency & Calculation Mode',
        text: 'Choose your country or currency (32 supported currencies) and pick Quick Calculator for single items or Scrap Lot Builder for multi-item manifests.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Choose Metal & Hallmark Purity',
        text: 'Select Gold (XAU), Silver (XAG), Platinum (XPT), or Palladium (XPD) and pick a standard purity (24K, 22K, 21K, 18K/18ct, 14K, 10K, 9K/9ct, 925 Sterling, 800 Silver, Pt950, or Pd950) or enter custom fineness.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Enter Gross Weight & Weight Unit',
        text: 'Weigh your item (excluding non-metal stones or watch movements) and enter the weight in grams, troy ounces, pennyweights (dwt), tolas, avoirdupois ounces, pounds, kilograms, 10g, or milligrams.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Review Raw Melt Value, Custom Spot & Dealer Payout Tiers',
        text: 'Inspect 100% intrinsic melt value alongside 95% refiner, 88% jeweler, and 75% pawn reference tiers, or expand Advanced Dealer Spread options to model custom buy premiums, sell discounts, fixed assay fees, or custom spot overrides.',
      },
    ],
  };

  return (
    <article className="prose prose-slate dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-[#111827] p-6 sm:p-10 rounded-3xl border border-gray-200 dark:border-slate-800 transition-colors mt-10 shadow-sm">
      {/* Structured Data: FAQPage & Verified HowTo */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* H2 #1: Core Melt Value Formula & Worked Example */}
      <section aria-labelledby="pm-how-to-calculate">
        <h2
          id="pm-how-to-calculate"
          className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-4"
        >
          How to Calculate Gold, Silver, Platinum &amp; Palladium Melt Value
        </h2>
        <p className="lead text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
          Whether you need a fast <strong>scrap gold calculator</strong> for broken 14K jewelry, a{' '}
          <strong>scrap silver calculator</strong> for inherited flatware, or a multi-metal{' '}
          <strong>precious metal calculator</strong> to audit bullion holdings, this free{' '}
          <strong>gold melt calculator</strong> and <strong>scrap value calculator</strong> computes exact fine weight
          and <strong>raw melt value</strong> for <strong>Gold (XAU)</strong>, <strong>Silver (XAG)</strong>,{' '}
          <strong>Platinum (XPT)</strong>, and <strong>Palladium (XPD)</strong> across 32 currencies and 9 standard
          weight units.
        </p>

        <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm space-y-2 mb-6">
          <p>
            <strong>1. Pure Metal Weight (g):</strong> Gross Weight (g) &times; Fineness Decimal (e.g., Karat &divide; 24 or Hallmark &divide; 1000)
          </p>
          <p>
            <strong>2. Pure Weight (Troy Oz):</strong> Pure Metal Weight (g) &divide; 31.1034768
          </p>
          <p>
            <strong>3. 100% Raw Melt Value:</strong> Pure Weight (Troy Oz) &times; Spot Price per Troy Ounce
          </p>
          <p>
            <strong>4. Modeled Cash Offer:</strong> Raw Melt Value &times; (1 &minus; Sell Discount %) &minus; Fixed Assay Fee
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 text-xs sm:text-sm mb-4">
          <h3 className="font-bold text-amber-900 dark:text-amber-300 text-sm mb-1 mt-0">
            Worked Example 1: 14K Gold Ring (5.00 Grams at $4,000.00 / oz t Illustrative Spot)
          </h3>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
            14K gold (stamped 585) has a fineness of 14 &divide; 24 = <strong>0.583333 (58.33% fine gold)</strong>.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 mb-0">
            <li>
              <strong>Pure Fine Gold:</strong> 5.00 g &times; (14 &divide; 24) = <strong>2.9167 g</strong> (<strong>0.09377 oz t</strong> / <strong>1.875 dwt</strong>)
            </li>
            <li>
              <strong>100% Raw Melt Value:</strong> 0.093773 oz t &times; $4,000.00 = <strong>$375.09</strong>
            </li>
            <li>
              <strong>Refiner Reference (95%):</strong> <strong>$356.34</strong> &bull; <strong>Jeweler Cash (88%):</strong>{' '}
              <strong>$330.08</strong> &bull; <strong>Pawn Reference (75%):</strong> <strong>$281.32</strong>
            </li>
          </ul>
        </div>
      </section>

      {/* H2 #2: Pawn Shop, Jeweler & Refiner Payout Tiers */}
      <section
        aria-labelledby="pm-payout-tiers"
        className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800"
      >
        <h2
          id="pm-payout-tiers"
          className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3"
        >
          Pawn Shop, Jeweler &amp; Refiner Payout Tiers: What Buyers Really Pay
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          No commercial buyer pays 100% of the spot <strong>scrap gold price</strong> because every buyback carries assay
          testing, smelting loss, insurance, and operating margin. Use this pawn shop gold payout and{' '}
          <strong>scrap calculator</strong> to compare a real <strong>gold scrap price</strong> quote against your
          item&apos;s raw melt floor:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm not-prose mb-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">High-Volume Refiner (~95%)</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Direct-to-refiner lots typically yield 93%–96% of melt value, often subject to minimum lot weights or flat assay fees.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Jeweler / Coin Shop (~88%)</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Reputable bullion dealers and local coin shops generally pay 85%–90% of melt value for clean, hallmarked gold and silver scrap.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Pawn Shop (50%–75% Range)</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Our quick-cash tier models 75% as an upper pawn reference, but real-world pawn and mail-in offers often fall between 50% and 75%. Expand <em>Advanced Dealer Spread &amp; Assay Fee Modeling</em> to test any custom Sell Discount % and Fixed Assay Fee.
            </p>
          </div>
        </div>
      </section>

      {/* H2 #3: 925 Sterling Silver, 800 Silver & Multi-Item Scrap Lot Builder */}
      <section
        aria-labelledby="pm-sterling-and-lots"
        className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800"
      >
        <h2
          id="pm-sterling-and-lots"
          className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3"
        >
          925 Sterling Silver, 800 Silver &amp; Multi-Item Scrap Jewelry Lot Builder (CSV)
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          When liquidating mixed estate jewelry, broken chains, and silver flatware, weighing each piece individually
          prevents lowball lump-sum offers. Use our <strong>silver scrap calculator</strong> and multi-item{' '}
          <strong>Scrap Lot</strong> tab to combine Gold (9K–24K), Silver (999 Fine, 958 Britannia, 925 Sterling, 900 Coin
          Silver, and 800 European Continental Silver), Platinum, and Palladium in one manifest. Export your itemized
          inventory as a CWE-1236 sanitized RFC-4180 CSV spreadsheet.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
            <h3 className="font-bold text-slate-900 dark:text-slate-200 text-sm mb-1 mt-0">
              Worked Example 2: 925 Sterling Silver (50.00 g @ $50 / oz t)
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 mb-0">
              <li>
                <strong>Pure Silver:</strong> 50.00 g &times; 0.925 = <strong>46.2500 g</strong> (<strong>1.48697 oz t</strong>)
              </li>
              <li>
                <strong>100% Raw Melt Value:</strong> <strong>$74.35</strong>
              </li>
              <li>
                <strong>Jeweler (88%):</strong> <strong>$65.43</strong> &bull; <strong>Pawn (75%):</strong> <strong>$55.76</strong>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
            <h3 className="font-bold text-slate-900 dark:text-slate-200 text-sm mb-1 mt-0">
              Worked Example 3: 800 Silver Scrap Price (100.00 g @ $50 / oz t)
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 mb-0">
              <li>
                <strong>Pure Silver:</strong> 100.00 g &times; 0.800 = <strong>80.0000 g</strong> (<strong>2.57206 oz t</strong>)
              </li>
              <li>
                <strong>100% Raw Melt Value:</strong> <strong>$128.60</strong>
              </li>
              <li>
                <strong>Jeweler (88%):</strong> <strong>$113.17</strong> &bull; <strong>Pawn (75%):</strong> <strong>$96.45</strong>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* H2 #4: Platinum & Palladium Scrap Pricing */}
      <section
        aria-labelledby="pm-platinum-palladium"
        className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800"
      >
        <h2
          id="pm-platinum-palladium"
          className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3"
        >
          Platinum (Pt950/900/850) &amp; Palladium (Pd950/500) Scrap Pricing
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          Platinum-group metals (PGMs) are alloyed at higher purities than typical gold jewelry—most engagement rings are
          stamped <strong>Pt950</strong> (95.0% pure) or <strong>Pt900</strong> (90.0%), while palladium bands carry{' '}
          <strong>Pd950</strong> (95.0%) or <strong>Pd500</strong> (50.0%). Because platinum and palladium require higher
          refining temperatures and specialized XRF assays, local scrap dealers often apply wider sell discounts than they do
          for gold.
        </p>

        <div className="p-4 rounded-2xl border border-sky-200 dark:border-sky-900/40 bg-sky-50/40 dark:bg-sky-950/20 text-xs sm:text-sm">
          <h3 className="font-bold text-sky-900 dark:text-sky-300 text-sm mb-1 mt-0">
            Worked Example 4: Platinum Pt950 Band (7.00 Grams at $1,500.00 / oz t Illustrative Spot)
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 mb-0">
            <li>
              <strong>Pure Fine Platinum:</strong> 7.00 g &times; 0.950 = <strong>6.6500 g</strong> (<strong>0.21380 oz t</strong>)
            </li>
            <li>
              <strong>100% Raw Melt Value:</strong> 0.21380 oz t &times; $1,500.00 = <strong>$320.70</strong>
            </li>
            <li>
              <strong>Refiner Reference (95%):</strong> <strong>$304.67</strong> &bull; <strong>Jeweler Cash (88%):</strong>{' '}
              <strong>$282.22</strong>
            </li>
          </ul>
        </div>
      </section>

      {/* H2 #5: Weight Units & Hallmark Standards */}
      <section
        aria-labelledby="pm-units-hallmarks"
        className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800"
      >
        <h2
          id="pm-units-hallmarks"
          className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3"
        >
          Troy Ounce vs. Kitchen Ounce, Pennyweight (dwt), Tola &amp; Hallmarks
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          One of the costliest mistakes in scrap valuation is weighing jewelry on a household kitchen scale (avoirdupois
          ounces, 28.3495 g) and treating the reading as troy ounces (31.1035 g)—an error of roughly 9.71%. Below are all 9
          weight units built into KivaroTools using exact NIST/BIPM factors:
        </p>

        <div className="overflow-x-auto overscroll-x-contain mb-6 not-prose">
          <table className="min-w-[600px] w-full text-xs sm:text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
            <thead>
              <tr className="bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                <th className="p-2.5 border border-gray-200 dark:border-slate-700">Supported Weight Unit</th>
                <th className="p-2.5 border border-gray-200 dark:border-slate-700">Grams Equivalent</th>
                <th className="p-2.5 border border-gray-200 dark:border-slate-700">Troy Oz Equivalent</th>
                <th className="p-2.5 border border-gray-200 dark:border-slate-700">Common Usage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <td className="p-2.5 font-bold">Gram (g)</td>
                <td className="p-2.5 font-mono">1.0000 g</td>
                <td className="p-2.5 font-mono">0.03215 oz t</td>
                <td className="p-2.5">Global metric standard for jewelry &amp; scrap scales</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">Troy Ounce (oz t)</td>
                <td className="p-2.5 font-mono">31.1035 g</td>
                <td className="p-2.5 font-mono">1.00000 oz t</td>
                <td className="p-2.5">Wholesale bullion spot contracts, coins &amp; bars</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">Pennyweight (dwt)</td>
                <td className="p-2.5 font-mono">1.5552 g</td>
                <td className="p-2.5 font-mono">0.05000 oz t</td>
                <td className="p-2.5">US jeweler bench scale unit (exact 1/20 troy oz)</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-amber-700 dark:text-amber-400">Avoirdupois Ounce (oz)</td>
                <td className="p-2.5 font-mono">28.3495 g</td>
                <td className="p-2.5 font-mono">0.91146 oz t</td>
                <td className="p-2.5">Kitchen &amp; postal scales (~8.86% lighter than troy oz)</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">Tola</td>
                <td className="p-2.5 font-mono">11.6638 g</td>
                <td className="p-2.5 font-mono">0.37500 oz t</td>
                <td className="p-2.5">South Asian &amp; Gulf retail bullion standard (exact 3/8 oz t)</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">10 Grams (10g)</td>
                <td className="p-2.5 font-mono">10.0000 g</td>
                <td className="p-2.5 font-mono">0.32151 oz t</td>
                <td className="p-2.5">India &amp; Asian retail bullion denomination</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">Kilogram (kg)</td>
                <td className="p-2.5 font-mono">1,000.0 g</td>
                <td className="p-2.5 font-mono">32.15075 oz t</td>
                <td className="p-2.5">Wholesale bullion bars &amp; institutional deliveries</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">Pound (lb avdp)</td>
                <td className="p-2.5 font-mono">453.5924 g</td>
                <td className="p-2.5 font-mono">14.58333 oz t</td>
                <td className="p-2.5">Bulk sterling flatware &amp; large scrap lots</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">Milligram (mg)</td>
                <td className="p-2.5 font-mono">0.0010 g</td>
                <td className="p-2.5 font-mono">0.000032 oz t</td>
                <td className="p-2.5">Micro-scale assay &amp; casting grain measurements</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">
          Supported Metals &amp; Hallmark Fineness Reference
        </h3>
        <div className="overflow-x-auto overscroll-x-contain mb-4 not-prose">
          <table className="min-w-[600px] w-full text-xs sm:text-sm text-left border-collapse border border-gray-200 dark:border-slate-800">
            <thead>
              <tr className="bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                <th className="p-2.5 border border-gray-200 dark:border-slate-700">Metal</th>
                <th className="p-2.5 border border-gray-200 dark:border-slate-700">Purity Rating</th>
                <th className="p-2.5 border border-gray-200 dark:border-slate-700">Hallmark (&permil;)</th>
                <th className="p-2.5 border border-gray-200 dark:border-slate-700">Pure %</th>
                <th className="p-2.5 border border-gray-200 dark:border-slate-700">Typical Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <td className="p-2.5 font-bold text-amber-600">Gold (Au)</td>
                <td className="p-2.5 font-semibold">24K / 22K / 21K</td>
                <td className="p-2.5 font-mono">999 / 916 / 875</td>
                <td className="p-2.5 font-mono">99.9% / 91.67% / 87.5%</td>
                <td className="p-2.5">Bullion bars, South Asian bridal &amp; Gulf jewelry</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-amber-600">Gold (Au)</td>
                <td className="p-2.5 font-semibold">18K (18ct) / 14K</td>
                <td className="p-2.5 font-mono">750 / 585</td>
                <td className="p-2.5 font-mono">75.0% / 58.33%</td>
                <td className="p-2.5">Fine diamond jewelry, watches, US/CA everyday rings</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-amber-600">Gold (Au)</td>
                <td className="p-2.5 font-semibold">10K / 9K (9ct)</td>
                <td className="p-2.5 font-mono">417 / 375</td>
                <td className="p-2.5 font-mono">41.67% / 37.5%</td>
                <td className="p-2.5">US minimum karat; UK, South Africa &amp; AU entry gold</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-500">Silver (Ag)</td>
                <td className="p-2.5 font-semibold">999 / 958 / 925 / 900 / 800</td>
                <td className="p-2.5 font-mono">999 / 958 / 925 / 900 / 800</td>
                <td className="p-2.5 font-mono">99.9% down to 80.0%</td>
                <td className="p-2.5">Bullion, Britannia, Sterling flatware, 90% coin &amp; 800 silver</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-sky-600">Platinum (Pt)</td>
                <td className="p-2.5 font-semibold">Pt999 / Pt950 / Pt900 / Pt850</td>
                <td className="p-2.5 font-mono">999 / 950 / 900 / 850</td>
                <td className="p-2.5 font-mono">99.9% down to 85.0%</td>
                <td className="p-2.5">Bullion, wedding bands, vintage settings, chains</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-purple-600">Palladium (Pd)</td>
                <td className="p-2.5 font-semibold">Pd999 / Pd950 / Pd500</td>
                <td className="p-2.5 font-mono">999 / 950 / 500</td>
                <td className="p-2.5 font-mono">99.9% / 95.0% / 50.0%</td>
                <td className="p-2.5">Bullion rounds, lightweight white-metal bands</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* H2 #6: South Africa (ZAR), UK (GBP) & 9 Carat (9ct) to 24K */}
      <section
        aria-labelledby="pm-south-africa-9ct"
        className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800"
      >
        <h2
          id="pm-south-africa-9ct"
          className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3"
        >
          Scrap Gold Prices per Gram: South Africa (ZAR), UK (GBP) &amp; 9 Carat (9ct) to 24K
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          In South Africa, the United Kingdom, Australia, and New Zealand, <strong>9 carat (9ct / 375)</strong> and{' '}
          <strong>18 carat (18ct / 750)</strong> are the most common scrap jewelry hallmarks. Select{' '}
          <strong>South Africa (ZAR)</strong> or <strong>United Kingdom (GBP)</strong> in the country bar to check{' '}
          <strong>scrap gold prices per gram</strong> and model local refinery, jeweler, or pawn cash offers in your
          currency.
        </p>

        <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs sm:text-sm">
          <h3 className="font-bold text-emerald-900 dark:text-emerald-300 text-sm mb-1 mt-0">
            Worked Example 5: 9ct Gold Ring in South Africa (10.00 Grams at R 70,000.00 / oz t Illustrative Spot)
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 mb-0">
            <li>
              <strong>Pure Fine Gold:</strong> 10.00 g &times; (9 &divide; 24) = <strong>3.7500 g</strong> (<strong>0.120565 oz t</strong>)
            </li>
            <li>
              <strong>100% Raw Melt Value:</strong> 0.120565 oz t &times; R 70,000.00 = <strong>R 8,439.57</strong>
            </li>
            <li>
              <strong>Refiner Reference (95%):</strong> <strong>R 8,017.59</strong> &bull; <strong>Jeweler Cash (88%):</strong>{' '}
              <strong>R 7,426.82</strong> &bull; <strong>Pawn Reference (75%):</strong> <strong>R 6,329.68</strong>
            </li>
          </ul>
        </div>
      </section>

      {/* H2 #7: International Spot vs. Regional Markets & Tax Disclaimer */}
      <section
        aria-labelledby="pm-regional-spot"
        className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800"
      >
        <h2
          id="pm-regional-spot"
          className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3"
        >
          International Spot vs. Pakistan Sarafa, India MCX, UAE &amp; Saudi (SAR)
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          This calculator starts from international wholesale spot prices (Gold API) converted at interbank foreign exchange
          rates (ExchangeRate-API). Domestic retail and bazaar markets frequently trade above interbank converted spot due to
          import duties, VAT/GST, open-market FX spreads, and local physical supply:
        </p>

        <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4">
          <li>
            <strong>Pakistan (PKR / Sarafa):</strong> No automated electronic live feed exists for All Pakistan Sarafa Gems
            and Jewellers Association (APGJSA) circular rates. Use the <em>Enter Custom Spot Override</em> helper to input
            today&apos;s local PKR per-tola rate directly.
          </li>
          <li>
            <strong>India (INR / MCX &amp; IBJA):</strong> Following the July 2024 Union Budget customs duty revision (6%
            customs duty on gold and silver; 6.4% on platinum), domestic Indian prices also reflect 3% GST on bullion and
            5% GST on jewelry making charges.
          </li>
          <li>
            <strong>UAE (AED), Saudi Arabia (SAR), South Africa (ZAR), UK, Canada &amp; US:</strong> Regional VAT/GST/sales
            taxes (such as UAE 5% VAT on jewelry, Saudi 15% VAT, South Africa 15% VAT with Krugerrand zero-rating, UK VAT on
            silver/platinum, Canadian GST/HST, and US state sales taxes) and jeweler making charges are <strong>not</strong>{' '}
            calculated by this tool.
          </li>
        </ul>

        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <strong>Informational &amp; Regional Tax Disclaimer (Verified November 28, 2026):</strong> All valuations are
          provided strictly for informational and educational reference and do not constitute financial, investment, appraisal,
          or tax advice. Customs duties, VAT/GST, making charges, and local bullion premiums change periodically—verify
          applicable rules and live local dealer quotes before transacting.
        </div>
      </section>

      {/* H2 #8: Verified Competitor Comparison Table */}
      <section
        aria-labelledby="pm-competitor-comparison"
        className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800"
      >
        <h2
          id="pm-competitor-comparison"
          className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3"
        >
          How KivaroTools Compares to Other Precious Metal Calculators
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          Each precious metal calculator serves a slightly different workflow. The table below compares publicly documented
          capabilities across KivaroTools and three established market references (verified November 28, 2026):
        </p>

        <div className="w-full max-w-full overflow-x-auto overscroll-x-contain my-4 not-prose">
          <table className="min-w-[660px] w-full text-xs sm:text-sm text-left border-collapse border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">Feature / Capability</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-bold">KivaroTools (Web)</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">Kitco (Web Hub / ScrapIt! Pro)</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">GoldPrice.org</th>
                <th scope="col" className="p-3 border border-slate-200 dark:border-slate-700 font-semibold">Dendritics Metal Calc</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Metals Supported</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">Gold, Silver, Platinum &amp; Palladium</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Gold, Silver, Platinum, Palladium (+ Rhodium on hub)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Gold &amp; Silver focus</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Gold, Silver, Platinum &amp; Palladium</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Weight Units in Browser</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">9 units (g, oz t, dwt, oz avdp, lb, tola, 10g, kg, mg)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Oz, g, kg on web hub (10 units in ScrapIt! Pro app)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Ounces, grams &amp; kilos</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Grams, troy oz &amp; dwt</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Multi-Item Scrap Lot + CSV</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">Built-in browser lot builder + CWE-1236 CSV export</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Multi-item available via ScrapIt! Pro app</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Single-item price lookup</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Single-item calculation</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Dealer / Pawn Spread Tiers</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">95% / 88% / 75% tiers + custom % &amp; assay fee</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Custom percentages in ScrapIt! Pro app</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Spot &amp; historical charts only</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Custom discount percentage</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Currencies &amp; Access</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">32 currencies, free web tool, no account required</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Major currencies on web; 100+ in mobile app</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">47+ national currencies on web</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">USD-focused web calculator</td>
              </tr>
              <tr>
                <th scope="row" className="p-3 font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">Input Privacy Model</th>
                <td className="p-3 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-medium">User weights &amp; lots stay in browser (public spot API calls only)</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Dealer/refiner platform &amp; app ecosystem</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Web chart &amp; rate portal</td>
                <td className="p-3 border border-slate-200 dark:border-slate-700">Client-side web utility</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* H2 #9: Frequently Asked Questions */}
      <section
        aria-labelledby="pm-faq"
        className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800"
      >
        <h2
          id="pm-faq"
          className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4"
        >
          Frequently Asked Questions: Melt Math, Pawn Offers &amp; Spot Overrides
        </h2>
        <div className="space-y-3 not-prose">
          {PRECIOUS_METALS_FAQS.map((faq, index) => (
            <details
              key={index}
              className="group rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 transition-colors"
            >
              <summary className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base cursor-pointer select-none list-none flex items-center justify-between gap-3">
                <span>{faq.question}</span>
                <span className="ml-2 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0">
                  &#9662;
                </span>
              </summary>
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Verified Internal Links to /finance Siblings */}
      <nav
        aria-label="Related financial calculators"
        className="mt-10 pt-6 border-t border-gray-200 dark:border-slate-800 not-prose"
      >
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
          Explore Related Financial Calculators
        </h3>
        <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
          <Link
            href="/finance"
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            Finance &amp; Calculators Hub &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">&bull;</span>
          <Link
            href="/finance/crypto-converter"
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            Live Currency &amp; Crypto Converter &rarr;
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
            Free PDF Invoice Generator &rarr;
          </Link>
          <span className="text-slate-300 dark:text-slate-700">&bull;</span>
          <Link
            href="/finance/salary-calculator"
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            Global Salary Calculator &rarr;
          </Link>
        </div>
      </nav>
    </article>
  );
}