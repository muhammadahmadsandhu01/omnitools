# OmniTools Mortgage Calculator — Remediation Plan & Architecture Inventory

**Date:** October 13, 2026  
**Author:** Senior Financial-Calculator Engineer, Quantitative QA Specialist & Technical SEO Lead  
**Scope:** Remediation baseline audit of the OmniTools Mortgage Calculator (`/finance/mortgage-calculator`) across mathematical accounting, UI consistency, competitor research depth, search visibility, and release verification.

---

## 1. Initial State & Repository Inventory

### Git Status & Branch Context
- **Repository:** `https://github.com/muhammadahmadsandhu01/omnitools`
- **Current Branch:** `main` (clean working tree on remote `origin/main`).
- **Latest Commit Baseline:** `713ab81` (`docs: finalize master release audit report with live production verification`) following `60a4790` (`feat(finance): enterprise mortgage calculator upgrade with extracted engine, presets, reset action, expanded SEO content and master audit`).
- **Preserved Untracked Files:** `SALARY_CALCULATOR_22_COUNTRY_ACCURACY_AUDIT.md`, `repomix-output.xml`, `scratch/`, `test-results/`. (None of these files will be modified or removed).

### Core Components Under Audit
1. **Calculation Engine:** [`lib/mortgageEngine.ts`](file:///d:/omnitools/lib/mortgageEngine.ts) (590 lines). Contains `calculatePeriodicPayment`, `buildMortgageModel`, `roundMinor`, `annualizeSchedule`, `generateMortgageCsv`, `WORLD_CURRENCIES`, and `MORTGAGE_PRESETS`.
2. **Interactive UI Component:** [`components/tools/MortgageCalculator.tsx`](file:///d:/omnitools/components/tools/MortgageCalculator.tsx) (1,444 lines). Client-side interactive component with fresh-state defaults, 5 scenario presets, `#btn-reset` action, bidirectional down payment sync, itemized breakdown cards, and paginated amortization table.
3. **SEO & Educational Component:** [`components/seo/MortgageCalculatorSeo.tsx`](file:///d:/omnitools/components/seo/MortgageCalculatorSeo.tsx) (373 lines). 100% original educational content, step-by-step UI instructions, two worked examples, PITI table, 12 FAQs matching Schema.org `FAQPage` JSON-LD, and financial disclaimer.
4. **Metadata Registry:** [`config/toolsData.ts`](file:///d:/omnitools/config/toolsData.ts) (lines 104–117). Title: 56 chars, Description: 159 chars.
5. **Component Registry:** [`config/toolRegistry.ts`](file:///d:/omnitools/config/toolRegistry.ts). Maps `mortgage-calculator` to `MortgageCalculator` and `MortgageCalculatorSeo`.
6. **Dynamic Route Handler:** [`app/[category]/[slug]/page.tsx`](file:///d:/omnitools/app/[category]/[slug]/page.tsx). Renders breadcrumbs, single H1, `SoftwareApplication` JSON-LD, tool component, and SEO component.
7. **Sitemap Registry:** [`app/sitemap.ts`](file:///d:/omnitools/app/sitemap.ts). Includes published `/finance/mortgage-calculator` route.

---

## 2. Functional Mapping of Financial Calculations

| Financial Dimension | Responsible Function(s) | Current Mathematical Implementation | Underlying Assumptions |
|---|---|---|---|
| **Scheduled P&I Payment** | `calculatePeriodicPayment(principal, annualRate, periods, paymentsPerYear, minorUnit)` | $M = P \times \frac{r(1+r)^n}{(1+r)^n - 1}$ where $r = \frac{\text{annualRate}}{100 \times \text{paymentsPerYear}}$, $n = \text{years} \times \text{paymentsPerYear}$. Linear division $P/n$ for $r=0$. | Fixed-rate annuity; monthly compounding for monthly frequency. Standard nominal rate (not APR). |
| **Outstanding Balance** | `buildMortgageModel` (lines 363–419) | Iterative period-by-period tracking: $\text{balance}_{t} = \max(0, \text{balance}_{t-1} - \text{principal}_{t})$. | Interest calculated on beginning balance of each period. Rounded to currency minor unit. |
| **Total Interest & Outflow** | `buildMortgageModel` (lines 401–435) | Cumulative sum of rounded period interest + cash to close + principal + PMI + taxes/insurance. | Sum of components without double-counting; final period capped at remaining balance. |
| **Recurring Extra Principal** | `buildMortgageModel` (lines 341, 381–387) | $\text{extraPerPeriod} = \frac{\text{extra} \times 12}{\text{paymentsPerYear}}$. In period: $\text{extra} = \min(\text{extraPerPeriod}, \text{balance} - \text{scheduledPrincipal})$. | Extra principal applied directly to principal reduction each period; cannot cause negative balance. |
| **Lump-Sum Prepayment** | `buildMortgageModel` (lines 334–338, 382–384) | At origination: reduces starting balance before period 1. At period: added to `extraPerPeriod` at specified `prepayPeriod`. | Capped at remaining balance; cannot create negative balance. |
| **Biweekly Schedule** | `buildMortgageModel` (lines 327, 340, 421) | Sets `paymentsPerYear = 26`, $n = \text{years} \times 26$. Calculates 26-period annuity payment. | **Inconsistency identified (see Section 3 below).** |
| **PMI Calculation & Drop-Off** | `buildMortgageModel` (lines 393–398) | Triggered when original LTV > 80%. Evaluates $\text{currentLtv} = (\text{nextBalance} / \text{price}) \times 100$. Cancels when $\text{currentLtv} \le \text{pmiThreshold}$ (default 80%). | Balance-based PMI estimate; drops off period-by-period dynamically. |
| **Closing Costs & Cash to Close** | `buildMortgageModel` (lines 347–350) | $\text{CashToClose} = \text{down} + (\text{price} \times \text{closingPct}) + (\text{loan} \times \text{points}) + \text{lenderFees} + \text{originationPrepay}$. | Percentage closing cost based on home price; discount points based on loan amount. |
| **Payoff Timing & Savings** | `MortgageCalculator.tsx` (lines 142–148, 506–509) | `baseline` model computed with extra=0, prepay=0. Savings = `baseline.interestTotal - result.interestTotal`. | Baseline uses identical loan parameters without prepayments. |

---

## 3. Discrepancies & Deficiencies Identified for Remediation

### Inconsistency A — Biweekly Payment Semantics
- **The Issue:** In `MortgageCalculatorSeo.tsx` (FAQ #6), the text explains:
  *"Because there are 26 half-payments, you effectively complete 13 full monthly payments each year—one extra full monthly payment applied directly toward principal reduction. On a typical 30-year loan, this biweekly schedule eliminates roughly 4 to 6 years of repayment duration and saves tens of thousands in lifetime interest..."*
- **The Implementation Reality:** In `lib/mortgageEngine.ts` (line 340), `scheduled` is calculated with $n = \text{years} \times 26 = 780$. It calculates the payment required to pay off the loan in 780 periods (30 years)! Thus, the current biweekly mode takes the full 30 years and does not accelerate payoff.
- **The Solution:** Implement the consumer standard **Accelerated Biweekly** convention where scheduled biweekly payment equals **half of the 30-year monthly payment** ($M_{\text{monthly}} / 2$). Under this convention, making 26 payments of $M/2$ per year yields 13 monthly payments, accelerating payoff to ~24 years and saving ~6 years of interest.

### Inconsistency B — PMI Legal vs. Mathematical Modeling
- **The Issue:** The Homeowners Protection Act of 1998 (HPA) specifies two distinct cancellation thresholds:
  1. Borrower-requested cancellation at 80% LTV of original value (subject to good payment history).
  2. Mandatory automatic lender cancellation at 78% LTV based on the original amortization schedule.
- **The Solution:** Clarify in the UI and documentation that the calculator models the standard 80% LTV threshold dynamically based on the actual amortizing balance, and that actual cancellation eligibility requires lender confirmation under HPA statutory guidelines.

### Deficiency C — Competitor Verification Tier Classification
- **The Issue:** The existing matrix documented 28 accessible sites but did not distinguish between interactive testing (hands-on input manipulation) and automated HTTP/HTML inspection.
- **The Solution:** Classify all competitors into explicit tiers:
  - **Tier 1 — Hands-on Interactive Testing** (at least 10 distinct calculators tested interactively).
  - **Tier 2 — Page, HTML and Feature Inspection** (verified HTTP 200, forms, and features).
  - **Tier 3 — Secondary Documentation / Enterprise Claims**.
  - **Blocked / Inaccessible Candidates**.

### Deficiency D — Search Console & AI Discovery Transparency
- **The Issue:** Search console indexing and AI citations must be stated with complete honesty.
- **The Solution:** Mark GSC indexing and AI citations as **NOT VERIFIED**, provide step-by-step instructions for the site owner to inspect canonical URLs in Search Console, and document reproducible queries tested in public AI search services.

---

## 4. Phase-by-Phase Remediation Roadmap

1. **Phase 2:** Build an independent mathematical reference test oracle in `scratch/independent-math-oracle.ts` (without importing `lib/mortgageEngine.ts`). Harmonize the accelerated biweekly convention in `lib/mortgageEngine.ts` and `MortgageCalculator.tsx`. Produce `docs/mortgage_calculator_financial_validation.md`.
2. **Phase 3:** Conduct hands-on interactive testing on at least 10 external calculators and inspect at least 26 relevant websites. Update `docs/mortgage_calculator_competitor_matrix.md`, update `docs/mortgage_calculator_search_intent_map.md`, and create `docs/mortgage_calculator_feature_gap_analysis.md`.
3. **Phase 4:** Perform live technical SEO audit on `https://omnitools-navy.vercel.app/finance/mortgage-calculator` and produce `docs/mortgage_calculator_search_visibility_audit.md`.
4. **Phase 5:** Audit indexing, canonical status, sitemap, robots, and AI discoverability. Produce `docs/mortgage_calculator_indexing_ai_visibility_audit.md`.
5. **Phase 6:** Run headless Chrome CDP test across 11 viewports and produce `docs/mortgage_calculator_qa_results.md`.
6. **Phase 7:** Run all checks (`test:registry`, `tsc`, `eslint`, `build`), commit, push, verify live deployment, and finalize `docs/mortgage_calculator_final_audit.md`.
