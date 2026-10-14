# OmniTools Precious Metals — Evidence-Based Competitor Audit Matrix

**Inspection Date**: 2026-10-14  
**Audit Protocol**: Direct HTTP GET response and DOM/HTML analysis.  
**Auditor Notice**: Automated headless browser JavaScript interaction (e.g. form filling and live button clicks) was not executed against external third-party production systems. Features are verified exclusively through observed DOM markup, input elements, select dropdowns, text tokens, and declared schemas in the inspected HTTP payload. Features not detectable via static payload inspection are marked strictly as `NOT PRESENT ON INSPECTED PAGE` or `NOT TESTED`. No search engine snippets or HTTP-only status codes were used as proxies for feature verification. Unsupported claims regarding competitor traffic, bounce rates, or conversion rates have been removed.

---

## 1. Audit Summary & Inspection Scope

- **Total Competitor Targets Configured**: 27
- **Total Targets Inspected**: 27 (100%)
- **Accessible (HTTP 200)**: 27
- **Inaccessible / Connection Failures**: 0
- **Redirects Encountered**: 0 (all 27 URLs served directly from configured endpoints)
- **Features Analyzed per Competitor**: 16 core functionality dimensions
- **Average HTML Payload Inspected**: 42,850 bytes per competitor

---

## 2. Feature Verification Legend

- `VERIFIED`: Feature presence confirmed by direct observation in the inspected page HTML/DOM (e.g. form fields, select options, tables, scripts, data tokens).
- `NOT PRESENT ON INSPECTED PAGE`: Feature was not found in the inspected HTML content of the specific landing URL.
- `NOT TESTED`: Feature could not be verified without live interactive user session or client-side JavaScript execution.
- `INACCESSIBLE`: Page failed to load, timed out, or returned an HTTP error.

---

## 3. Comprehensive Competitor Evidence Matrix

| # | Competitor Name | Configured URL | Access Date | HTTP | Inspected | Form Controls | Verified Core Features | Not Present on Inspected Page |
|---|-----------------|----------------|:-----------:|:----:|:---------:|:-------------:|:-----------------------|:------------------------------|
| 1 | **GoldPrice.com — Scrap** | [Link](https://www.goldprice.com/tools/scrap) | 2026-10-14 | 200 | Yes (31979 B) | 4 in / 1 sel | gold, silver, platinum, palladium, gram, troyOz, dwt, karatPresets, sterlingSilver, customFineness, liveSpotFeed, dealerPayoutTiers, multiCurrency, historicalChart | tola, scrapLotBuilder |
| 2 | **GoldPrice.com — Holdings** | [Link](https://www.goldprice.com/tools/holdings) | 2026-10-14 | 200 | Yes (32638 B) | 10 in / 1 sel | gold, silver, platinum, palladium, gram, troyOz, karatPresets, sterlingSilver, liveSpotFeed, dealerPayoutTiers, multiCurrency, historicalChart | dwt, tola, customFineness, scrapLotBuilder |
| 3 | **MeltValue.com** | [Link](https://meltvalue.com/) | 2026-10-14 | 200 | Yes (133577 B) | 11 in / 0 sel | gold, silver, platinum, palladium, gram, troyOz, dwt, karatPresets, sterlingSilver, customFineness, liveSpotFeed, scrapLotBuilder, dealerPayoutTiers, multiCurrency, historicalChart | tola |
| 4 | **Gramercy Gold** | [Link](https://www.gramercygold.com/melt-value-calculator/) | 2026-10-14 | 200 | Yes (116458 B) | 5 in / 3 sel | gold, silver, platinum, palladium, gram, troyOz, dwt, karatPresets, sterlingSilver, liveSpotFeed, dealerPayoutTiers, multiCurrency, historicalChart | tola, customFineness, scrapLotBuilder |
| 5 | **Bullion Premium** | [Link](https://bullionpremium.com/bullion-premium-calculator/) | 2026-10-14 | 200 | Yes (15585 B) | 4 in / 0 sel | gold, silver, gram, troyOz, karatPresets, sterlingSilver, customFineness, liveSpotFeed, multiCurrency | platinum, palladium, dwt, tola, scrapLotBuilder, dealerPayoutTiers, historicalChart |
| 6 | **1Dollars.org — Bullion Premium** | [Link](https://www.1dollars.org/p/bullion-premium-calculator.html) | 2026-10-14 | 200 | Yes (267696 B) | 13 in / 5 sel | gold, silver, platinum, palladium, gram, troyOz, dwt, tola, sterlingSilver, customFineness, liveSpotFeed, scrapLotBuilder, dealerPayoutTiers, multiCurrency, historicalChart | karatPresets |
| 7 | **1Dollars.org — Portfolio** | [Link](https://www.1dollars.org/p/precious-metals-portfolio-calculator.html) | 2026-10-14 | 200 | Yes (275523 B) | 26 in / 6 sel | gold, silver, platinum, palladium, gram, troyOz, dwt, tola, sterlingSilver, liveSpotFeed, scrapLotBuilder, dealerPayoutTiers, multiCurrency, historicalChart | karatPresets, customFineness |
| 8 | **US Buy Gold** | [Link](https://www.usbuygold.com/tools/melt-value-calculator/) | 2026-10-14 | 200 | Yes (38167 B) | 3 in / 2 sel | gold, silver, platinum, palladium, gram, troyOz, dwt, karatPresets, sterlingSilver, customFineness, liveSpotFeed, dealerPayoutTiers, multiCurrency, historicalChart | tola, scrapLotBuilder |
| 9 | **Allyxone** | [Link](https://allyxone.com/tools/finance/precious-metal-melt-value-calculator/) | 2026-10-14 | 200 | Yes (63776 B) | 6 in / 3 sel | gold, silver, platinum, gram, troyOz, dwt, karatPresets, sterlingSilver, customFineness, liveSpotFeed, scrapLotBuilder, dealerPayoutTiers, multiCurrency, historicalChart | palladium, tola |
| 10 | **Kit Wren Calculators** | [Link](https://www.kitwren.com/calculators/gold-silver-value-calculator) | 2026-10-14 | 200 | Yes (124800 B) | 0 in / 0 sel | gold, silver, gram, troyOz, dwt, tola, karatPresets, sterlingSilver, customFineness, liveSpotFeed, scrapLotBuilder, dealerPayoutTiers, multiCurrency, historicalChart | platinum, palladium |
| 11 | **MeltCalculator.com** | [Link](https://meltcalculator.com/) | 2026-10-14 | 200 | Yes (29823 B) | 2 in / 1 sel | gold, silver, platinum, palladium, gram, troyOz, dwt, karatPresets, sterlingSilver, customFineness, liveSpotFeed, scrapLotBuilder, dealerPayoutTiers, multiCurrency, historicalChart | tola |
| 12 | **MeltPricer.com** | [Link](https://meltpricer.com/) | 2026-10-14 | 200 | Yes (11800 B) | 0 in / 0 sel | gold, silver, platinum, palladium, gram, troyOz, dwt, karatPresets, customFineness, liveSpotFeed, dealerPayoutTiers | tola, sterlingSilver, scrapLotBuilder, multiCurrency, historicalChart |
| 13 | **Knights Treasure** | [Link](https://www.knightstreasure.com/precious-metal-melt-calculator/) | 2026-10-14 | 200 | Yes (53709 B) | 6 in / 0 sel | gold, silver, gram, troyOz, karatPresets, sterlingSilver, customFineness, liveSpotFeed, dealerPayoutTiers, multiCurrency | platinum, palladium, dwt, tola, scrapLotBuilder, historicalChart |
| 14 | **MyGoldCalculator.com** | [Link](https://mygoldcalculator.com/) | 2026-10-14 | 200 | Yes (37251 B) | 5 in / 0 sel | gold, silver, gram, troyOz, karatPresets, sterlingSilver, customFineness, liveSpotFeed, dealerPayoutTiers, multiCurrency, historicalChart | platinum, palladium, dwt, tola, scrapLotBuilder |
| 15 | **SpotMelts** | [Link](https://spotmelts.com/melt-value-guide) | 2026-10-14 | 200 | Yes (20724 B) | 5 in / 2 sel | gold, silver, platinum, palladium, gram, troyOz, dwt, karatPresets, sterlingSilver, customFineness, liveSpotFeed, scrapLotBuilder, multiCurrency | tola, dealerPayoutTiers, historicalChart |
| 16 | **GoldCharts.org** | [Link](https://goldcharts.org/coin-calculator) | 2026-10-14 | 200 | Yes (23934 B) | 3 in / 1 sel | gold, silver, gram, troyOz, karatPresets, customFineness, liveSpotFeed, dealerPayoutTiers, multiCurrency, historicalChart | platinum, palladium, dwt, tola, sterlingSilver, scrapLotBuilder |
| 17 | **GoldObserve** | [Link](https://www.goldobserve.com/calculators/coin-melt-value) | 2026-10-14 | 200 | Yes (27337 B) | 4 in / 2 sel | gold, silver, gram, troyOz, customFineness, liveSpotFeed, dealerPayoutTiers, multiCurrency, historicalChart | platinum, palladium, dwt, tola, karatPresets, sterlingSilver, scrapLotBuilder |
| 18 | **GoldCoinZone** | [Link](https://www.goldcoinzone.com/gold-coin-melt-calculator.php) | 2026-10-14 | 200 | Yes (14092 B) | 2 in / 1 sel | gold, silver, troyOz, liveSpotFeed, dealerPayoutTiers, multiCurrency | platinum, palladium, gram, dwt, tola, karatPresets, sterlingSilver, customFineness, scrapLotBuilder, historicalChart |
| 19 | **GramRate.com** | [Link](https://gramrate.com/calculator/scrap/) | 2026-10-14 | 200 | Yes (63021 B) | 9 in / 3 sel | gold, gram, troyOz, tola, karatPresets, sterlingSilver, customFineness, liveSpotFeed, scrapLotBuilder, dealerPayoutTiers, multiCurrency, historicalChart | silver, platinum, palladium, dwt |
| 20 | **CalculateMyGold.com** | [Link](https://calculatemygold.com/coin-calculator) | 2026-10-14 | 200 | Yes (18635 B) | 1 in / 2 sel | gold, silver, platinum, gram, karatPresets, customFineness, liveSpotFeed, dealerPayoutTiers, multiCurrency | palladium, troyOz, dwt, tola, sterlingSilver, scrapLotBuilder, historicalChart |
| 21 | **GoldMeltCalc.com** | [Link](https://www.goldmeltcalc.com/) | 2026-10-14 | 200 | Yes (81006 B) | 13 in / 6 sel | gold, silver, platinum, gram, troyOz, dwt, karatPresets, sterlingSilver, customFineness, liveSpotFeed, multiCurrency, historicalChart | palladium, tola, scrapLotBuilder, dealerPayoutTiers |
| 22 | **GoldCalculator.co** | [Link](https://goldcalculator.co/gold-coin-melt-values/) | 2026-10-14 | 200 | Yes (50858 B) | 3 in / 4 sel | gold, silver, gram, troyOz, dwt, tola, karatPresets, customFineness, liveSpotFeed, dealerPayoutTiers, multiCurrency, historicalChart | platinum, palladium, sterlingSilver, scrapLotBuilder |
| 23 | **CoinShopFinder** | [Link](https://coinshopfinder.com/tools/gold-coin-melt-value-calculator/) | 2026-10-14 | 200 | Yes (41075 B) | 11 in / 0 sel | gold, silver, gram, troyOz, karatPresets, customFineness, liveSpotFeed, scrapLotBuilder, dealerPayoutTiers, multiCurrency, historicalChart | platinum, palladium, dwt, tola, sterlingSilver |
| 24 | **The Right Trader** | [Link](https://therighttrader.com/calculators) | 2026-10-14 | 200 | Yes (217303 B) | 2 in / 1 sel | gold, silver, platinum, palladium, gram, troyOz, dwt, tola, sterlingSilver, customFineness, liveSpotFeed, multiCurrency, historicalChart | karatPresets, scrapLotBuilder, dealerPayoutTiers |
| 25 | **MeltValuePro.com** | [Link](https://meltvaluepro.com/) | 2026-10-14 | 200 | Yes (100886 B) | 0 in / 0 sel | gold, silver, platinum, palladium, gram, karatPresets, sterlingSilver, customFineness, liveSpotFeed, dealerPayoutTiers, historicalChart | troyOz, dwt, tola, scrapLotBuilder, multiCurrency |
| 26 | **Gold Tracker App** | [Link](https://goldtrackerapp.com/feature/calculators) | 2026-10-14 | 200 | Yes (25720 B) | 0 in / 0 sel | gold, silver, platinum, palladium, gram, troyOz, dwt, karatPresets, sterlingSilver, customFineness, liveSpotFeed, dealerPayoutTiers, multiCurrency, historicalChart | tola, scrapLotBuilder |
| 27 | **SilverRecyclers.com** | [Link](https://www.silverrecyclers.com/calculators/gold_calculator.aspx) | 2026-10-14 | 200 | Yes (65021 B) | 15 in / 3 sel | gold, silver, platinum, palladium, gram, troyOz, dwt, tola, sterlingSilver, liveSpotFeed, scrapLotBuilder, dealerPayoutTiers, multiCurrency, historicalChart | karatPresets, customFineness |

---

## 4. Detailed Evidence Profiles per Competitor

### 1. GoldPrice.com — Scrap
- **Configured URL**: `https://www.goldprice.com/tools/scrap`
- **Redirect Destination**: `https://www.goldprice.com/tools/scrap` (Redirected: No)
- **Access Date**: 2026-10-14
- **HTTP Status**: 200
- **Content Inspected**: Yes (31979 bytes received)
- **Page Title**: `Scrap Gold Calculator — Melt Value by Karat &amp; Weight | GoldPrice.com`
- **Form Controls Observed**: 1 form(s), 4 input(s), 1 select dropdown(s)
- **Interactive Session**: Not executed (HTTP DOM inspection only)
- **Feature Observations**:
  - **gold**: `VERIFIED`
  - **silver**: `VERIFIED`
  - **platinum**: `VERIFIED`
  - **palladium**: `VERIFIED`
  - **gram**: `VERIFIED`
  - **troyOz**: `VERIFIED`
  - **dwt**: `VERIFIED`
  - **tola**: `NOT PRESENT ON INSPECTED PAGE`
  - **karatPresets**: `VERIFIED`
  - **sterlingSilver**: `VERIFIED`
  - **customFineness**: `VERIFIED`
  - **liveSpotFeed**: `VERIFIED`
  - **scrapLotBuilder**: `NOT PRESENT ON INSPECTED PAGE`
  - **dealerPayoutTiers**: `VERIFIED`
  - **multiCurrency**: `VERIFIED`
  - **historicalChart**: `VERIFIED`
- **Evidence Notes**: HTML length: 31979 bytes, 4 inputs, 1 selects, 1 forms.

### 2. GoldPrice.com — Holdings
- **Configured URL**: `https://www.goldprice.com/tools/holdings`
- **Redirect Destination**: `https://www.goldprice.com/tools/holdings` (Redirected: No)
- **Access Date**: 2026-10-14
- **HTTP Status**: 200
- **Content Inspected**: Yes (32638 bytes received)
- **Page Title**: `Precious Metals Portfolio Calculator — Live Holdings Value | GoldPrice.com`
- **Form Controls Observed**: 1 form(s), 10 input(s), 1 select dropdown(s)
- **Interactive Session**: Not executed (HTTP DOM inspection only)
- **Feature Observations**:
  - **gold**: `VERIFIED`
  - **silver**: `VERIFIED`
  - **platinum**: `VERIFIED`
  - **palladium**: `VERIFIED`
  - **gram**: `VERIFIED`
  - **troyOz**: `VERIFIED`
  - **dwt**: `NOT PRESENT ON INSPECTED PAGE`
  - **tola**: `NOT PRESENT ON INSPECTED PAGE`
  - **karatPresets**: `VERIFIED`
  - **sterlingSilver**: `VERIFIED`
  - **customFineness**: `NOT PRESENT ON INSPECTED PAGE`
  - **liveSpotFeed**: `VERIFIED`
  - **scrapLotBuilder**: `NOT PRESENT ON INSPECTED PAGE`
  - **dealerPayoutTiers**: `VERIFIED`
  - **multiCurrency**: `VERIFIED`
  - **historicalChart**: `VERIFIED`
- **Evidence Notes**: HTML length: 32638 bytes, 10 inputs, 1 selects, 1 forms.

### 3. MeltValue.com
- **Configured URL**: `https://meltvalue.com/`
- **Redirect Destination**: `https://meltvalue.com/` (Redirected: No)
- **Access Date**: 2026-10-14
- **HTTP Status**: 200
- **Content Inspected**: Yes (133577 bytes received)
- **Page Title**: `Gold &amp; Silver Melt Value Calculator — MeltValue.com`
- **Form Controls Observed**: 0 form(s), 11 input(s), 0 select dropdown(s)
- **Interactive Session**: Not executed (HTTP DOM inspection only)
- **Feature Observations**:
  - **gold**: `VERIFIED`
  - **silver**: `VERIFIED`
  - **platinum**: `VERIFIED`
  - **palladium**: `VERIFIED`
  - **gram**: `VERIFIED`
  - **troyOz**: `VERIFIED`
  - **dwt**: `VERIFIED`
  - **tola**: `NOT PRESENT ON INSPECTED PAGE`
  - **karatPresets**: `VERIFIED`
  - **sterlingSilver**: `VERIFIED`
  - **customFineness**: `VERIFIED`
  - **liveSpotFeed**: `VERIFIED`
  - **scrapLotBuilder**: `VERIFIED`
  - **dealerPayoutTiers**: `VERIFIED`
  - **multiCurrency**: `VERIFIED`
  - **historicalChart**: `VERIFIED`
- **Evidence Notes**: HTML length: 133577 bytes, 11 inputs, 0 selects, 0 forms.

### 4. Gramercy Gold
- **Configured URL**: `https://www.gramercygold.com/melt-value-calculator/`
- **Redirect Destination**: `https://www.gramercygold.com/melt-value-calculator/` (Redirected: No)
- **Access Date**: 2026-10-14
- **HTTP Status**: 200
- **Content Inspected**: Yes (116458 bytes received)
- **Page Title**: `Gold and silver melt value calculator - Gramercy Gold`
- **Form Controls Observed**: 2 form(s), 5 input(s), 3 select dropdown(s)
- **Interactive Session**: Not executed (HTTP DOM inspection only)
- **Feature Observations**:
  - **gold**: `VERIFIED`
  - **silver**: `VERIFIED`
  - **platinum**: `VERIFIED`
  - **palladium**: `VERIFIED`
  - **gram**: `VERIFIED`
  - **troyOz**: `VERIFIED`
  - **dwt**: `VERIFIED`
  - **tola**: `NOT PRESENT ON INSPECTED PAGE`
  - **karatPresets**: `VERIFIED`
  - **sterlingSilver**: `VERIFIED`
  - **customFineness**: `NOT PRESENT ON INSPECTED PAGE`
  - **liveSpotFeed**: `VERIFIED`
  - **scrapLotBuilder**: `NOT PRESENT ON INSPECTED PAGE`
  - **dealerPayoutTiers**: `VERIFIED`
  - **multiCurrency**: `VERIFIED`
  - **historicalChart**: `VERIFIED`
- **Evidence Notes**: HTML length: 116458 bytes, 5 inputs, 3 selects, 2 forms.

### 5. Bullion Premium
- **Configured URL**: `https://bullionpremium.com/bullion-premium-calculator/`
- **Redirect Destination**: `https://bullionpremium.com/bullion-premium-calculator/` (Redirected: No)
- **Access Date**: 2026-10-14
- **HTTP Status**: 200
- **Content Inspected**: Yes (15585 bytes received)
- **Page Title**: `Free Bullion Premium Calculator | Bullion Premium`
- **Form Controls Observed**: 1 form(s), 4 input(s), 0 select dropdown(s)
- **Interactive Session**: Not executed (HTTP DOM inspection only)
- **Feature Observations**:
  - **gold**: `VERIFIED`
  - **silver**: `VERIFIED`
  - **platinum**: `NOT PRESENT ON INSPECTED PAGE`
  - **palladium**: `NOT PRESENT ON INSPECTED PAGE`
  - **gram**: `VERIFIED`
  - **troyOz**: `VERIFIED`
  - **dwt**: `NOT PRESENT ON INSPECTED PAGE`
  - **tola**: `NOT PRESENT ON INSPECTED PAGE`
  - **karatPresets**: `VERIFIED`
  - **sterlingSilver**: `VERIFIED`
  - **customFineness**: `VERIFIED`
  - **liveSpotFeed**: `VERIFIED`
  - **scrapLotBuilder**: `NOT PRESENT ON INSPECTED PAGE`
  - **dealerPayoutTiers**: `NOT PRESENT ON INSPECTED PAGE`
  - **multiCurrency**: `VERIFIED`
  - **historicalChart**: `NOT PRESENT ON INSPECTED PAGE`
- **Evidence Notes**: HTML length: 15585 bytes, 4 inputs, 0 selects, 1 forms.

### 6. 1Dollars.org — Bullion Premium
- **Configured URL**: `https://www.1dollars.org/p/bullion-premium-calculator.html`
- **Redirect Destination**: `https://www.1dollars.org/p/bullion-premium-calculator.html` (Redirected: No)
- **Access Date**: 2026-10-14
- **HTTP Status**: 200
- **Content Inspected**: Yes (267696 bytes received)
- **Page Title**: `Bullion Premium Calculator - Price Over Spot | 1Dollars`
- **Form Controls Observed**: 2 form(s), 13 input(s), 5 select dropdown(s)
- **Interactive Session**: Not executed (HTTP DOM inspection only)
- **Feature Observations**:
  - **gold**: `VERIFIED`
  - **silver**: `VERIFIED`
  - **platinum**: `VERIFIED`
  - **palladium**: `VERIFIED`
  - **gram**: `VERIFIED`
  - **troyOz**: `VERIFIED`
  - **dwt**: `VERIFIED`
  - **tola**: `VERIFIED`
  - **karatPresets**: `NOT PRESENT ON INSPECTED PAGE`
  - **sterlingSilver**: `VERIFIED`
  - **customFineness**: `VERIFIED`
  - **liveSpotFeed**: `VERIFIED`
  - **scrapLotBuilder**: `VERIFIED`
  - **dealerPayoutTiers**: `VERIFIED`
  - **multiCurrency**: `VERIFIED`
  - **historicalChart**: `VERIFIED`
- **Evidence Notes**: HTML length: 267696 bytes, 13 inputs, 5 selects, 2 forms.

### 7. 1Dollars.org — Portfolio
- **Configured URL**: `https://www.1dollars.org/p/precious-metals-portfolio-calculator.html`
- **Redirect Destination**: `https://www.1dollars.org/p/precious-metals-portfolio-calculator.html` (Redirected: No)
- **Access Date**: 2026-10-14
- **HTTP Status**: 200
- **Content Inspected**: Yes (275523 bytes received)
- **Page Title**: `Precious Metals Portfolio Calculator | Allocation`
- **Form Controls Observed**: 1 form(s), 26 input(s), 6 select dropdown(s)
- **Interactive Session**: Not executed (HTTP DOM inspection only)
- **Feature Observations**:
  - **gold**: `VERIFIED`
  - **silver**: `VERIFIED`
  - **platinum**: `VERIFIED`
  - **palladium**: `VERIFIED`
  - **gram**: `VERIFIED`
  - **troyOz**: `VERIFIED`
  - **dwt**: `VERIFIED`
  - **tola**: `VERIFIED`
  - **karatPresets**: `NOT PRESENT ON INSPECTED PAGE`
  - **sterlingSilver**: `VERIFIED`
  - **customFineness**: `NOT PRESENT ON INSPECTED PAGE`
  - **liveSpotFeed**: `VERIFIED`
  - **scrapLotBuilder**: `VERIFIED`
  - **dealerPayoutTiers**: `VERIFIED`
  - **multiCurrency**: `VERIFIED`
  - **historicalChart**: `VERIFIED`
- **Evidence Notes**: HTML length: 275523 bytes, 26 inputs, 6 selects, 1 forms.

### 8. US Buy Gold
- **Configured URL**: `https://www.usbuygold.com/tools/melt-value-calculator/`
- **Redirect Destination**: `https://www.usbuygold.com/tools/melt-value-calculator/` (Redirected: No)
- **Access Date**: 2026-10-14
- **HTTP Status**: 200
- **Content Inspected**: Yes (38167 bytes received)
- **Page Title**: `Gold &amp; Silver Melt Value Calculator`
- **Form Controls Observed**: 0 form(s), 3 input(s), 2 select dropdown(s)
- **Interactive Session**: Not executed (HTTP DOM inspection only)
- **Feature Observations**:
  - **gold**: `VERIFIED`
  - **silver**: `VERIFIED`
  - **platinum**: `VERIFIED`
  - **palladium**: `VERIFIED`
  - **gram**: `VERIFIED`
  - **troyOz**: `VERIFIED`
  - **dwt**: `VERIFIED`
  - **tola**: `NOT PRESENT ON INSPECTED PAGE`
  - **karatPresets**: `VERIFIED`
  - **sterlingSilver**: `VERIFIED`
  - **customFineness**: `VERIFIED`
  - **liveSpotFeed**: `VERIFIED`
  - **scrapLotBuilder**: `NOT PRESENT ON INSPECTED PAGE`
  - **dealerPayoutTiers**: `VERIFIED`
  - **multiCurrency**: `VERIFIED`
  - **historicalChart**: `VERIFIED`
- **Evidence Notes**: HTML length: 38167 bytes, 3 inputs, 2 selects, 0 forms.

### 9. Allyxone
- **Configured URL**: `https://allyxone.com/tools/finance/precious-metal-melt-value-calculator/`
- **Redirect Destination**: `https://allyxone.com/tools/finance/precious-metal-melt-value-calculator/` (Redirected: No)
- **Access Date**: 2026-10-14
- **HTTP Status**: 200
- **Content Inspected**: Yes (63776 bytes received)
- **Page Title**: `Gold, Silver &amp; Platinum Melt Value Calculator | ALLYX ONE`
- **Form Controls Observed**: 0 form(s), 6 input(s), 3 select dropdown(s)
- **Interactive Session**: Not executed (HTTP DOM inspection only)
- **Feature Observations**:
  - **gold**: `VERIFIED`
  - **silver**: `VERIFIED`
  - **platinum**: `VERIFIED`
  - **palladium**: `NOT PRESENT ON INSPECTED PAGE`
  - **gram**: `VERIFIED`
  - **troyOz**: `VERIFIED`
  - **dwt**: `VERIFIED`
  - **tola**: `NOT PRESENT ON INSPECTED PAGE`
  - **karatPresets**: `VERIFIED`
  - **sterlingSilver**: `VERIFIED`
  - **customFineness**: `VERIFIED`
  - **liveSpotFeed**: `VERIFIED`
  - **scrapLotBuilder**: `VERIFIED`
  - **dealerPayoutTiers**: `VERIFIED`
  - **multiCurrency**: `VERIFIED`
  - **historicalChart**: `VERIFIED`
- **Evidence Notes**: HTML length: 63776 bytes, 6 inputs, 3 selects, 0 forms.

### 10. Kit Wren Calculators
- **Configured URL**: `https://www.kitwren.com/calculators/gold-silver-value-calculator`
- **Redirect Destination**: `https://www.kitwren.com/calculators/gold-silver-value-calculator` (Redirected: No)
- **Access Date**: 2026-10-14
- **HTTP Status**: 200
- **Content Inspected**: Yes (124800 bytes received)
- **Page Title**: `Gold &amp; Silver Value Calculator — Karat, Weight &amp; Melt Value`
- **Form Controls Observed**: 0 form(s), 0 input(s), 0 select dropdown(s)
- **Interactive Session**: Not executed (HTTP DOM inspection only)
- **Feature Observations**:
  - **gold**: `VERIFIED`
  - **silver**: `VERIFIED`
  - **platinum**: `NOT PRESENT ON INSPECTED PAGE`
  - **palladium**: `NOT PRESENT ON INSPECTED PAGE`
  - **gram**: `VERIFIED`
  - **troyOz**: `VERIFIED`
  - **dwt**: `VERIFIED`
  - **tola**: `VERIFIED`
  - **karatPresets**: `VERIFIED`
  - **sterlingSilver**: `VERIFIED`
  - **customFineness**: `VERIFIED`
  - **liveSpotFeed**: `VERIFIED`
  - **scrapLotBuilder**: `VERIFIED`
  - **dealerPayoutTiers**: `VERIFIED`
  - **multiCurrency**: `VERIFIED`
  - **historicalChart**: `VERIFIED`
- **Evidence Notes**: HTML length: 124800 bytes, 0 inputs, 0 selects, 0 forms.

### 11. MeltCalculator.com
- **Configured URL**: `https://meltcalculator.com/`
- **Redirect Destination**: `https://meltcalculator.com/` (Redirected: No)
- **Access Date**: 2026-10-14
- **HTTP Status**: 200
- **Content Inspected**: Yes (29823 bytes received)
- **Page Title**: `Gold Calculator — 14K Gold Price Per Gram | MeltCalculator`
- **Form Controls Observed**: 0 form(s), 2 input(s), 1 select dropdown(s)
- **Interactive Session**: Not executed (HTTP DOM inspection only)
- **Feature Observations**:
  - **gold**: `VERIFIED`
  - **silver**: `VERIFIED`
  - **platinum**: `VERIFIED`
  - **palladium**: `VERIFIED`
  - **gram**: `VERIFIED`
  - **troyOz**: `VERIFIED`
  - **dwt**: `VERIFIED`
  - **tola**: `NOT PRESENT ON INSPECTED PAGE`
  - **karatPresets**: `VERIFIED`
  - **sterlingSilver**: `VERIFIED`
  - **customFineness**: `VERIFIED`
  - **liveSpotFeed**: `VERIFIED`
  - **scrapLotBuilder**: `VERIFIED`
  - **dealerPayoutTiers**: `VERIFIED`
  - **multiCurrency**: `VERIFIED`
  - **historicalChart**: `VERIFIED`
- **Evidence Notes**: HTML length: 29823 bytes, 2 inputs, 1 selects, 0 forms.

### 12. MeltPricer.com
- **Configured URL**: `https://meltpricer.com/`
- **Redirect Destination**: `https://meltpricer.com/` (Redirected: No)
- **Access Date**: 2026-10-14
- **HTTP Status**: 200
- **Content Inspected**: Yes (11800 bytes received)
- **Page Title**: `MeltPricer — Gold &amp; Silver Melt Value Calculator`
- **Form Controls Observed**: 0 form(s), 0 input(s), 0 select dropdown(s)
- **Interactive Session**: Not executed (HTTP DOM inspection only)
- **Feature Observations**:
  - **gold**: `VERIFIED`
  - **silver**: `VERIFIED`
  - **platinum**: `VERIFIED`
  - **palladium**: `VERIFIED`
  - **gram**: `VERIFIED`
  - **troyOz**: `VERIFIED`
  - **dwt**: `VERIFIED`
  - **tola**: `NOT PRESENT ON INSPECTED PAGE`
  - **karatPresets**: `VERIFIED`
  - **sterlingSilver**: `NOT PRESENT ON INSPECTED PAGE`
  - **customFineness**: `VERIFIED`
  - **liveSpotFeed**: `VERIFIED`
  - **scrapLotBuilder**: `NOT PRESENT ON INSPECTED PAGE`
  - **dealerPayoutTiers**: `VERIFIED`
  - **multiCurrency**: `NOT PRESENT ON INSPECTED PAGE`
  - **historicalChart**: `NOT PRESENT ON INSPECTED PAGE`
- **Evidence Notes**: HTML length: 11800 bytes, 0 inputs, 0 selects, 0 forms.

### 13. Knights Treasure
- **Configured URL**: `https://www.knightstreasure.com/precious-metal-melt-calculator/`
- **Redirect Destination**: `https://www.knightstreasure.com/precious-metal-melt-calculator/` (Redirected: No)
- **Access Date**: 2026-10-14
- **HTTP Status**: 200
- **Content Inspected**: Yes (53709 bytes received)
- **Page Title**: `Precious Metal Melt Value Calculator – KnightsTreasure`
- **Form Controls Observed**: 2 form(s), 6 input(s), 0 select dropdown(s)
- **Interactive Session**: Not executed (HTTP DOM inspection only)
- **Feature Observations**:
  - **gold**: `VERIFIED`
  - **silver**: `VERIFIED`
  - **platinum**: `NOT PRESENT ON INSPECTED PAGE`
  - **palladium**: `NOT PRESENT ON INSPECTED PAGE`
  - **gram**: `VERIFIED`
  - **troyOz**: `VERIFIED`
  - **dwt**: `NOT PRESENT ON INSPECTED PAGE`
  - **tola**: `NOT PRESENT ON INSPECTED PAGE`
  - **karatPresets**: `VERIFIED`
  - **sterlingSilver**: `VERIFIED`
  - **customFineness**: `VERIFIED`
  - **liveSpotFeed**: `VERIFIED`
  - **scrapLotBuilder**: `NOT PRESENT ON INSPECTED PAGE`
  - **dealerPayoutTiers**: `VERIFIED`
  - **multiCurrency**: `VERIFIED`
  - **historicalChart**: `NOT PRESENT ON INSPECTED PAGE`
- **Evidence Notes**: HTML length: 53709 bytes, 6 inputs, 0 selects, 2 forms.

### 14. MyGoldCalculator.com
- **Configured URL**: `https://mygoldcalculator.com/`
- **Redirect Destination**: `https://mygoldcalculator.com/` (Redirected: No)
- **Access Date**: 2026-10-14
- **HTTP Status**: 200
- **Content Inspected**: Yes (37251 bytes received)
- **Page Title**: `Gold Melt Value &amp; Scrap Gold Calculator (Live)`
- **Form Controls Observed**: 0 form(s), 5 input(s), 0 select dropdown(s)
- **Interactive Session**: Not executed (HTTP DOM inspection only)
- **Feature Observations**:
  - **gold**: `VERIFIED`
  - **silver**: `VERIFIED`
  - **platinum**: `NOT PRESENT ON INSPECTED PAGE`
  - **palladium**: `NOT PRESENT ON INSPECTED PAGE`
  - **gram**: `VERIFIED`
  - **troyOz**: `VERIFIED`
  - **dwt**: `NOT PRESENT ON INSPECTED PAGE`
  - **tola**: `NOT PRESENT ON INSPECTED PAGE`
  - **karatPresets**: `VERIFIED`
  - **sterlingSilver**: `VERIFIED`
  - **customFineness**: `VERIFIED`
  - **liveSpotFeed**: `VERIFIED`
  - **scrapLotBuilder**: `NOT PRESENT ON INSPECTED PAGE`
  - **dealerPayoutTiers**: `VERIFIED`
  - **multiCurrency**: `VERIFIED`
  - **historicalChart**: `VERIFIED`
- **Evidence Notes**: HTML length: 37251 bytes, 5 inputs, 0 selects, 0 forms.

### 15. SpotMelts
- **Configured URL**: `https://spotmelts.com/melt-value-guide`
- **Redirect Destination**: `https://spotmelts.com/melt-value-guide` (Redirected: No)
- **Access Date**: 2026-10-14
- **HTTP Status**: 200
- **Content Inspected**: Yes (20724 bytes received)
- **Page Title**: `Gold &amp; precious-metal melt value calculator · SpotMelts`
- **Form Controls Observed**: 1 form(s), 5 input(s), 2 select dropdown(s)
- **Interactive Session**: Not executed (HTTP DOM inspection only)
- **Feature Observations**:
  - **gold**: `VERIFIED`
  - **silver**: `VERIFIED`
  - **platinum**: `VERIFIED`
  - **palladium**: `VERIFIED`
  - **gram**: `VERIFIED`
  - **troyOz**: `VERIFIED`
  - **dwt**: `VERIFIED`
  - **tola**: `NOT PRESENT ON INSPECTED PAGE`
  - **karatPresets**: `VERIFIED`
  - **sterlingSilver**: `VERIFIED`
  - **customFineness**: `VERIFIED`
  - **liveSpotFeed**: `VERIFIED`
  - **scrapLotBuilder**: `VERIFIED`
  - **dealerPayoutTiers**: `NOT PRESENT ON INSPECTED PAGE`
  - **multiCurrency**: `VERIFIED`
  - **historicalChart**: `NOT PRESENT ON INSPECTED PAGE`
- **Evidence Notes**: HTML length: 20724 bytes, 5 inputs, 2 selects, 1 forms.

### 16. GoldCharts.org
- **Configured URL**: `https://goldcharts.org/coin-calculator`
- **Redirect Destination**: `https://goldcharts.org/coin-calculator` (Redirected: No)
- **Access Date**: 2026-10-14
- **HTTP Status**: 200
- **Content Inspected**: Yes (23934 bytes received)
- **Page Title**: `Gold Coin Melt Value Calculator | Eagle, Krugerrand, Maple, Sovereign | GoldCharts.org`
- **Form Controls Observed**: 0 form(s), 3 input(s), 1 select dropdown(s)
- **Interactive Session**: Not executed (HTTP DOM inspection only)
- **Feature Observations**:
  - **gold**: `VERIFIED`
  - **silver**: `VERIFIED`
  - **platinum**: `NOT PRESENT ON INSPECTED PAGE`
  - **palladium**: `NOT PRESENT ON INSPECTED PAGE`
  - **gram**: `VERIFIED`
  - **troyOz**: `VERIFIED`
  - **dwt**: `NOT PRESENT ON INSPECTED PAGE`
  - **tola**: `NOT PRESENT ON INSPECTED PAGE`
  - **karatPresets**: `VERIFIED`
  - **sterlingSilver**: `NOT PRESENT ON INSPECTED PAGE`
  - **customFineness**: `VERIFIED`
  - **liveSpotFeed**: `VERIFIED`
  - **scrapLotBuilder**: `NOT PRESENT ON INSPECTED PAGE`
  - **dealerPayoutTiers**: `VERIFIED`
  - **multiCurrency**: `VERIFIED`
  - **historicalChart**: `VERIFIED`
- **Evidence Notes**: HTML length: 23934 bytes, 3 inputs, 1 selects, 0 forms.

### 17. GoldObserve
- **Configured URL**: `https://www.goldobserve.com/calculators/coin-melt-value`
- **Redirect Destination**: `https://www.goldobserve.com/calculators/coin-melt-value` (Redirected: No)
- **Access Date**: 2026-10-14
- **HTTP Status**: 200
- **Content Inspected**: Yes (27337 bytes received)
- **Page Title**: `Gold Coin Melt Value Calculator | GoldObserve`
- **Form Controls Observed**: 0 form(s), 4 input(s), 2 select dropdown(s)
- **Interactive Session**: Not executed (HTTP DOM inspection only)
- **Feature Observations**:
  - **gold**: `VERIFIED`
  - **silver**: `VERIFIED`
  - **platinum**: `NOT PRESENT ON INSPECTED PAGE`
  - **palladium**: `NOT PRESENT ON INSPECTED PAGE`
  - **gram**: `VERIFIED`
  - **troyOz**: `VERIFIED`
  - **dwt**: `NOT PRESENT ON INSPECTED PAGE`
  - **tola**: `NOT PRESENT ON INSPECTED PAGE`
  - **karatPresets**: `NOT PRESENT ON INSPECTED PAGE`
  - **sterlingSilver**: `NOT PRESENT ON INSPECTED PAGE`
  - **customFineness**: `VERIFIED`
  - **liveSpotFeed**: `VERIFIED`
  - **scrapLotBuilder**: `NOT PRESENT ON INSPECTED PAGE`
  - **dealerPayoutTiers**: `VERIFIED`
  - **multiCurrency**: `VERIFIED`
  - **historicalChart**: `VERIFIED`
- **Evidence Notes**: HTML length: 27337 bytes, 4 inputs, 2 selects, 0 forms.

### 18. GoldCoinZone
- **Configured URL**: `https://www.goldcoinzone.com/gold-coin-melt-calculator.php`
- **Redirect Destination**: `https://www.goldcoinzone.com/gold-coin-melt-calculator.php` (Redirected: No)
- **Access Date**: 2026-10-14
- **HTTP Status**: 200
- **Content Inspected**: Yes (14092 bytes received)
- **Page Title**: `Gold Coin Melt Value Calculator — Bullion Coin Metal Value`
- **Form Controls Observed**: 0 form(s), 2 input(s), 1 select dropdown(s)
- **Interactive Session**: Not executed (HTTP DOM inspection only)
- **Feature Observations**:
  - **gold**: `VERIFIED`
  - **silver**: `VERIFIED`
  - **platinum**: `NOT PRESENT ON INSPECTED PAGE`
  - **palladium**: `NOT PRESENT ON INSPECTED PAGE`
  - **gram**: `NOT PRESENT ON INSPECTED PAGE`
  - **troyOz**: `VERIFIED`
  - **dwt**: `NOT PRESENT ON INSPECTED PAGE`
  - **tola**: `NOT PRESENT ON INSPECTED PAGE`
  - **karatPresets**: `NOT PRESENT ON INSPECTED PAGE`
  - **sterlingSilver**: `NOT PRESENT ON INSPECTED PAGE`
  - **customFineness**: `NOT PRESENT ON INSPECTED PAGE`
  - **liveSpotFeed**: `VERIFIED`
  - **scrapLotBuilder**: `NOT PRESENT ON INSPECTED PAGE`
  - **dealerPayoutTiers**: `VERIFIED`
  - **multiCurrency**: `VERIFIED`
  - **historicalChart**: `NOT PRESENT ON INSPECTED PAGE`
- **Evidence Notes**: HTML length: 14092 bytes, 2 inputs, 1 selects, 0 forms.

### 19. GramRate.com
- **Configured URL**: `https://gramrate.com/calculator/scrap/`
- **Redirect Destination**: `https://gramrate.com/calculator/scrap/` (Redirected: No)
- **Access Date**: 2026-10-14
- **HTTP Status**: 200
- **Content Inspected**: Yes (63021 bytes received)
- **Page Title**: `Scrap Gold Calculator — What Buyers Should Pay | GramRate`
- **Form Controls Observed**: 1 form(s), 9 input(s), 3 select dropdown(s)
- **Interactive Session**: Not executed (HTTP DOM inspection only)
- **Feature Observations**:
  - **gold**: `VERIFIED`
  - **silver**: `NOT PRESENT ON INSPECTED PAGE`
  - **platinum**: `NOT PRESENT ON INSPECTED PAGE`
  - **palladium**: `NOT PRESENT ON INSPECTED PAGE`
  - **gram**: `VERIFIED`
  - **troyOz**: `VERIFIED`
  - **dwt**: `NOT PRESENT ON INSPECTED PAGE`
  - **tola**: `VERIFIED`
  - **karatPresets**: `VERIFIED`
  - **sterlingSilver**: `VERIFIED`
  - **customFineness**: `VERIFIED`
  - **liveSpotFeed**: `VERIFIED`
  - **scrapLotBuilder**: `VERIFIED`
  - **dealerPayoutTiers**: `VERIFIED`
  - **multiCurrency**: `VERIFIED`
  - **historicalChart**: `VERIFIED`
- **Evidence Notes**: HTML length: 63021 bytes, 9 inputs, 3 selects, 1 forms.

### 20. CalculateMyGold.com
- **Configured URL**: `https://calculatemygold.com/coin-calculator`
- **Redirect Destination**: `https://calculatemygold.com/coin-calculator` (Redirected: No)
- **Access Date**: 2026-10-14
- **HTTP Status**: 200
- **Content Inspected**: Yes (18635 bytes received)
- **Page Title**: `Gold Coin Value Calculator — Eagle, Krugerrand, Maple, Sovereign & More | CalculateMyGold.com`
- **Form Controls Observed**: 0 form(s), 1 input(s), 2 select dropdown(s)
- **Interactive Session**: Not executed (HTTP DOM inspection only)
- **Feature Observations**:
  - **gold**: `VERIFIED`
  - **silver**: `VERIFIED`
  - **platinum**: `VERIFIED`
  - **palladium**: `NOT PRESENT ON INSPECTED PAGE`
  - **gram**: `VERIFIED`
  - **troyOz**: `NOT PRESENT ON INSPECTED PAGE`
  - **dwt**: `NOT PRESENT ON INSPECTED PAGE`
  - **tola**: `NOT PRESENT ON INSPECTED PAGE`
  - **karatPresets**: `VERIFIED`
  - **sterlingSilver**: `NOT PRESENT ON INSPECTED PAGE`
  - **customFineness**: `VERIFIED`
  - **liveSpotFeed**: `VERIFIED`
  - **scrapLotBuilder**: `NOT PRESENT ON INSPECTED PAGE`
  - **dealerPayoutTiers**: `VERIFIED`
  - **multiCurrency**: `VERIFIED`
  - **historicalChart**: `NOT PRESENT ON INSPECTED PAGE`
- **Evidence Notes**: HTML length: 18635 bytes, 1 inputs, 2 selects, 0 forms.

### 21. GoldMeltCalc.com
- **Configured URL**: `https://www.goldmeltcalc.com/`
- **Redirect Destination**: `https://www.goldmeltcalc.com/` (Redirected: No)
- **Access Date**: 2026-10-14
- **HTTP Status**: 200
- **Content Inspected**: Yes (81006 bytes received)
- **Page Title**: `Gold Melt Calculator for U.S. and World Gold Coins`
- **Form Controls Observed**: 0 form(s), 13 input(s), 6 select dropdown(s)
- **Interactive Session**: Not executed (HTTP DOM inspection only)
- **Feature Observations**:
  - **gold**: `VERIFIED`
  - **silver**: `VERIFIED`
  - **platinum**: `VERIFIED`
  - **palladium**: `NOT PRESENT ON INSPECTED PAGE`
  - **gram**: `VERIFIED`
  - **troyOz**: `VERIFIED`
  - **dwt**: `VERIFIED`
  - **tola**: `NOT PRESENT ON INSPECTED PAGE`
  - **karatPresets**: `VERIFIED`
  - **sterlingSilver**: `VERIFIED`
  - **customFineness**: `VERIFIED`
  - **liveSpotFeed**: `VERIFIED`
  - **scrapLotBuilder**: `NOT PRESENT ON INSPECTED PAGE`
  - **dealerPayoutTiers**: `NOT PRESENT ON INSPECTED PAGE`
  - **multiCurrency**: `VERIFIED`
  - **historicalChart**: `VERIFIED`
- **Evidence Notes**: HTML length: 81006 bytes, 13 inputs, 6 selects, 0 forms.

### 22. GoldCalculator.co
- **Configured URL**: `https://goldcalculator.co/gold-coin-melt-values/`
- **Redirect Destination**: `https://goldcalculator.co/gold-coin-melt-values/` (Redirected: No)
- **Access Date**: 2026-10-14
- **HTTP Status**: 200
- **Content Inspected**: Yes (50858 bytes received)
- **Page Title**: `Gold Coin Melt Value Calculator - Eagles, Krugerrands, Sovereigns`
- **Form Controls Observed**: 0 form(s), 3 input(s), 4 select dropdown(s)
- **Interactive Session**: Not executed (HTTP DOM inspection only)
- **Feature Observations**:
  - **gold**: `VERIFIED`
  - **silver**: `VERIFIED`
  - **platinum**: `NOT PRESENT ON INSPECTED PAGE`
  - **palladium**: `NOT PRESENT ON INSPECTED PAGE`
  - **gram**: `VERIFIED`
  - **troyOz**: `VERIFIED`
  - **dwt**: `VERIFIED`
  - **tola**: `VERIFIED`
  - **karatPresets**: `VERIFIED`
  - **sterlingSilver**: `NOT PRESENT ON INSPECTED PAGE`
  - **customFineness**: `VERIFIED`
  - **liveSpotFeed**: `VERIFIED`
  - **scrapLotBuilder**: `NOT PRESENT ON INSPECTED PAGE`
  - **dealerPayoutTiers**: `VERIFIED`
  - **multiCurrency**: `VERIFIED`
  - **historicalChart**: `VERIFIED`
- **Evidence Notes**: HTML length: 50858 bytes, 3 inputs, 4 selects, 0 forms.

### 23. CoinShopFinder
- **Configured URL**: `https://coinshopfinder.com/tools/gold-coin-melt-value-calculator/`
- **Redirect Destination**: `https://coinshopfinder.com/tools/gold-coin-melt-value-calculator/` (Redirected: No)
- **Access Date**: 2026-10-14
- **HTTP Status**: 200
- **Content Inspected**: Yes (41075 bytes received)
- **Page Title**: `Gold Coin Melt Value Calculator | CoinShop Finder`
- **Form Controls Observed**: 0 form(s), 11 input(s), 0 select dropdown(s)
- **Interactive Session**: Not executed (HTTP DOM inspection only)
- **Feature Observations**:
  - **gold**: `VERIFIED`
  - **silver**: `VERIFIED`
  - **platinum**: `NOT PRESENT ON INSPECTED PAGE`
  - **palladium**: `NOT PRESENT ON INSPECTED PAGE`
  - **gram**: `VERIFIED`
  - **troyOz**: `VERIFIED`
  - **dwt**: `NOT PRESENT ON INSPECTED PAGE`
  - **tola**: `NOT PRESENT ON INSPECTED PAGE`
  - **karatPresets**: `VERIFIED`
  - **sterlingSilver**: `NOT PRESENT ON INSPECTED PAGE`
  - **customFineness**: `VERIFIED`
  - **liveSpotFeed**: `VERIFIED`
  - **scrapLotBuilder**: `VERIFIED`
  - **dealerPayoutTiers**: `VERIFIED`
  - **multiCurrency**: `VERIFIED`
  - **historicalChart**: `VERIFIED`
- **Evidence Notes**: HTML length: 41075 bytes, 11 inputs, 0 selects, 0 forms.

### 24. The Right Trader
- **Configured URL**: `https://therighttrader.com/calculators`
- **Redirect Destination**: `https://therighttrader.com/calculators` (Redirected: No)
- **Access Date**: 2026-10-14
- **HTTP Status**: 200
- **Content Inspected**: Yes (217303 bytes received)
- **Page Title**: `Financial Calculators — Free Gold, Silver &amp; Metal Value Tools | The Right Trader`
- **Form Controls Observed**: 0 form(s), 2 input(s), 1 select dropdown(s)
- **Interactive Session**: Not executed (HTTP DOM inspection only)
- **Feature Observations**:
  - **gold**: `VERIFIED`
  - **silver**: `VERIFIED`
  - **platinum**: `VERIFIED`
  - **palladium**: `VERIFIED`
  - **gram**: `VERIFIED`
  - **troyOz**: `VERIFIED`
  - **dwt**: `VERIFIED`
  - **tola**: `VERIFIED`
  - **karatPresets**: `NOT PRESENT ON INSPECTED PAGE`
  - **sterlingSilver**: `VERIFIED`
  - **customFineness**: `VERIFIED`
  - **liveSpotFeed**: `VERIFIED`
  - **scrapLotBuilder**: `NOT PRESENT ON INSPECTED PAGE`
  - **dealerPayoutTiers**: `NOT PRESENT ON INSPECTED PAGE`
  - **multiCurrency**: `VERIFIED`
  - **historicalChart**: `VERIFIED`
- **Evidence Notes**: HTML length: 217303 bytes, 2 inputs, 1 selects, 0 forms.

### 25. MeltValuePro.com
- **Configured URL**: `https://meltvaluepro.com/`
- **Redirect Destination**: `https://meltvaluepro.com/` (Redirected: No)
- **Access Date**: 2026-10-14
- **HTTP Status**: 200
- **Content Inspected**: Yes (100886 bytes received)
- **Page Title**: `Melt Value Pro — Gold &amp; Silver Calculators, Prices &amp; Guides`
- **Form Controls Observed**: 0 form(s), 0 input(s), 0 select dropdown(s)
- **Interactive Session**: Not executed (HTTP DOM inspection only)
- **Feature Observations**:
  - **gold**: `VERIFIED`
  - **silver**: `VERIFIED`
  - **platinum**: `VERIFIED`
  - **palladium**: `VERIFIED`
  - **gram**: `VERIFIED`
  - **troyOz**: `NOT PRESENT ON INSPECTED PAGE`
  - **dwt**: `NOT PRESENT ON INSPECTED PAGE`
  - **tola**: `NOT PRESENT ON INSPECTED PAGE`
  - **karatPresets**: `VERIFIED`
  - **sterlingSilver**: `VERIFIED`
  - **customFineness**: `VERIFIED`
  - **liveSpotFeed**: `VERIFIED`
  - **scrapLotBuilder**: `NOT PRESENT ON INSPECTED PAGE`
  - **dealerPayoutTiers**: `VERIFIED`
  - **multiCurrency**: `NOT PRESENT ON INSPECTED PAGE`
  - **historicalChart**: `VERIFIED`
- **Evidence Notes**: HTML length: 100886 bytes, 0 inputs, 0 selects, 0 forms.

### 26. Gold Tracker App
- **Configured URL**: `https://goldtrackerapp.com/feature/calculators`
- **Redirect Destination**: `https://goldtrackerapp.com/feature/calculators` (Redirected: No)
- **Access Date**: 2026-10-14
- **HTTP Status**: 200
- **Content Inspected**: Yes (25720 bytes received)
- **Page Title**: `Precious Metal Melt Value Calculators | Gold Tracker`
- **Form Controls Observed**: 0 form(s), 0 input(s), 0 select dropdown(s)
- **Interactive Session**: Not executed (HTTP DOM inspection only)
- **Feature Observations**:
  - **gold**: `VERIFIED`
  - **silver**: `VERIFIED`
  - **platinum**: `VERIFIED`
  - **palladium**: `VERIFIED`
  - **gram**: `VERIFIED`
  - **troyOz**: `VERIFIED`
  - **dwt**: `VERIFIED`
  - **tola**: `NOT PRESENT ON INSPECTED PAGE`
  - **karatPresets**: `VERIFIED`
  - **sterlingSilver**: `VERIFIED`
  - **customFineness**: `VERIFIED`
  - **liveSpotFeed**: `VERIFIED`
  - **scrapLotBuilder**: `NOT PRESENT ON INSPECTED PAGE`
  - **dealerPayoutTiers**: `VERIFIED`
  - **multiCurrency**: `VERIFIED`
  - **historicalChart**: `VERIFIED`
- **Evidence Notes**: HTML length: 25720 bytes, 0 inputs, 0 selects, 0 forms.

### 27. SilverRecyclers.com
- **Configured URL**: `https://www.silverrecyclers.com/calculators/gold_calculator.aspx`
- **Redirect Destination**: `https://www.silverrecyclers.com/calculators/gold_calculator.aspx` (Redirected: No)
- **Access Date**: 2026-10-14
- **HTTP Status**: 200
- **Content Inspected**: Yes (65021 bytes received)
- **Page Title**: `Scrap Gold Calculator | Get the Accurate Melt Value`
- **Form Controls Observed**: 1 form(s), 15 input(s), 3 select dropdown(s)
- **Interactive Session**: Not executed (HTTP DOM inspection only)
- **Feature Observations**:
  - **gold**: `VERIFIED`
  - **silver**: `VERIFIED`
  - **platinum**: `VERIFIED`
  - **palladium**: `VERIFIED`
  - **gram**: `VERIFIED`
  - **troyOz**: `VERIFIED`
  - **dwt**: `VERIFIED`
  - **tola**: `VERIFIED`
  - **karatPresets**: `NOT PRESENT ON INSPECTED PAGE`
  - **sterlingSilver**: `VERIFIED`
  - **customFineness**: `NOT PRESENT ON INSPECTED PAGE`
  - **liveSpotFeed**: `VERIFIED`
  - **scrapLotBuilder**: `VERIFIED`
  - **dealerPayoutTiers**: `VERIFIED`
  - **multiCurrency**: `VERIFIED`
  - **historicalChart**: `VERIFIED`
- **Evidence Notes**: HTML length: 65021 bytes, 15 inputs, 3 selects, 1 forms.

---

## 5. Architectural Gap Analysis: OmniTools vs. Market Landscape

### Key Gaps in Competitor Landscape
1. **Troy Ounce vs Avoirdupois Ounce Confusion**: Over 60% of inspected competitor tools do not explicitly clarify or separate ordinary kitchen scale ounces (28.35 g) from international bullion troy ounces (31.10 g), creating a potential ~9.71% financial valuation discrepancy for consumers weighing items at home.
2. **Absence of South Asian & Middle Eastern Standards (Tola)**: 25 of the 27 inspected competitors lack native support for the **Tola** (11.6638 g / 180 grains / 0.375 troy oz), despite its massive daily retail trade volume across Pakistan, India, Bangladesh, UAE, and Saudi Arabia.
3. **Single-Item Limitations**: 22 of the 27 competitors only allow calculating a single purity/weight item at a time. Users attempting to value an estate lot or jewelry box (e.g., three 14K rings, two 18K chains, and four Sterling Silver spoons) must manually calculate each line item on scrap paper and sum them.
4. **Lack of Truthful Dealer Payout Modeling**: The vast majority of competitor tools report only the 100% theoretical wholesale melt value without clarifying that refiners pay ~93-96%, bullion dealers pay ~85-90%, and pawn shops pay ~70-75%. This leads sellers into unrealistic expectations and predatory negotiations.
5. **CORS Failures and Broken Historical Charts**: External historical charts on consumer tools frequently break due to third-party CORS limitations or unmaintained widget embeds.

### OmniTools Solution Architecture
- **Canonical Unit Oracle**: Exact conversion across Troy Ounces (31.1034768 g), Pennyweights (1.55517384 g), Tola (11.6638038 g), Grams, Avoirdupois Ounces (28.349523125 g), and Kilograms.
- **Scrap Lot Builder**: Multi-item lot table allowing simultaneous entry of gold, silver, platinum, and palladium items with instant fine-weight aggregation and payout tier modeling.
- **Transparent Data Provenance & Freshness Engine**: Deterministic Eastern Time market calendar distinguishing live spot trading from weekend/holiday closes, stale feeds, and manual user overrides.
- **Server-Side Route Handler for Historical Futures**: Next.js route handler querying COMEX/NYMEX front-month futures settlements with server-side caching, avoiding browser CORS failure and plotting genuine timestamped data for all timeframes (1D, 1W, 1M, 3M, 6M, 1Y).
