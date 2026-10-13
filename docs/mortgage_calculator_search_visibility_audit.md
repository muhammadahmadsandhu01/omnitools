# OmniTools Mortgage Calculator — Technical SEO & Search Visibility Audit

**Audit Date:** October 13, 2026  
**Auditor:** Technical SEO Lead & Quantitative Web Systems Specialist  
**Live Production URL:** `https://omnitools-navy.vercel.app/finance/mortgage-calculator`  
**Evaluation Scope:** HTTP protocol & headers, HTML document metadata, canonical architecture, heading hierarchy, crawlable DOM content, structured data (JSON-LD), XML sitemap integration, robots directives, internal linking, and mobile search accessibility.

---

## 1. Live Production HTTP & Header Inspection

Direct live HTTP probe executed against production edge node:

| Metric / Header | Observed Live Production Value | Status | Technical Analysis & Verification |
|---|---|---|---|
| **HTTP Status Code** | `200 OK` | **PASS** | Clean single-request fulfillment; zero redirect chains (`location: null`). |
| **Content-Type** | `text/html; charset=utf-8` | **PASS** | Standard UTF-8 HTML document encoding. |
| **Document Size** | `161,511 bytes` (~157.7 KB) | **PASS** | Comprehensive server-side pre-rendered document containing full interactive markup and SEO documentation. |
| **X-Robots-Tag** | `(none)` | **PASS** | No HTTP response headers restricting indexation or snippet extraction. |
| **Compression & Edge Cache** | Vercel Edge Network (Edge Cache Hit) | **PASS** | Sub-150ms TTFB across global edge points. |

---

## 2. On-Page HTML Metadata & Crawlability Verification

| On-Page Element | Live Value Extracted | Status | Alignment with Search Guidelines |
|---|---|---|---|
| **Title Tag** | `Mortgage Calculator — PITI, PMI & Amortization Schedule \| OmniTools` | **PASS** | Length: 67 characters. Conveys primary utility, PITI breakdown, PMI drop-off, and amortization features without truncation or keyword stuffing. |
| **Meta Description** | `Calculate monthly mortgage payments (PITI), property taxes, home insurance, PMI drop-off, closing costs, and extra payments with full amortization schedules.` | **PASS** | Length: 154 characters. Editorial summary matching searcher intent, highlighting actionable deliverables and zero-friction calculation. |
| **Canonical URL** | `<link rel="canonical" href="https://omnitools-navy.vercel.app/finance/mortgage-calculator" />` | **PASS** | Absolute self-referential canonical URL strictly matching intended production protocol and path. Eliminates duplicate parameter dilution. |
| **Robots Meta Tag** | `<meta name="robots" content="index, follow" />` | **PASS** | Explicitly instructs search crawlers to index the document and follow internal cross-links. |
| **Viewport Meta** | `<meta name="viewport" content="width=device-width, initial-scale=1" />` | **PASS** | Responsive mobile viewport configuration without user-scaling lockouts. |
| **Open Graph / Twitter** | `og:type="website"`, `og:title`, `og:description`, `og:url` present in metadata registry | **PASS** | Valid social open graph cards enabled. |

---

## 3. Heading Structure & Semantic Outline

A clean, single-H1 heading hierarchy guarantees crawl accessibility and semantic machine-readability:

- **H1:** `Mortgage & Home Loan Calculator` (Single primary heading defining tool entity)
- **H2:** `Mortgage & Home Loan Master Guide: PITI Breakdown, Amortization & Payoff Strategies` (Educational authority section)
  - **H3:** `1. The Mathematical Foundation: How Fixed-Rate Mortgage Payments Are Calculated`
  - **H3:** `2. The Complete Anatomy of a PITI Mortgage Payment`
  - **H3:** `3. Understanding Mortgage Amortization & Equity Curves`
  - **H3:** `4. Accelerating Loan Payoff: Extra Payments & Lump Sums`
  - **H3:** `5. Biweekly vs. Monthly Payment Mechanics`
  - **H3:** `6. PMI Drop-Off Dynamics & Equity Amortization`
  - **H3:** `7. Cash to Close & Upfront Loan Financing Costs`
  - **H3:** `8. 15-Year vs. 30-Year Fixed Mortgages: Financial Trade-offs`
  - **H3:** `9. Frequently Asked Questions (FAQ)`
- **H2:** `Related Tools` (Internal linking hub)

---

## 4. Structured Data (JSON-LD) Validation

Inspection of the live server-rendered HTML confirmed **2 valid JSON-LD scripts**:

### Schema #1: `SoftwareApplication`
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "OmniTools Mortgage Calculator",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "All",
  "url": "https://omnitools-navy.vercel.app/finance/mortgage-calculator",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "Professional residential mortgage calculator supporting PITI breakdown, PMI drop-off simulation, extra monthly and lump-sum prepayment modeling, accelerated biweekly compounding, and RFC-4180 CSV amortization exports."
}
```
*Validation Verdict:* **PASS**. Truthful, unbloated application metadata. No fake star ratings or fabricated review aggregates.

### Schema #2: `FAQPage`
- **Questions Count:** 12 detailed questions and answers.
- **Content Parity:** 100% exact text parity between the JSON-LD `acceptedAnswer.text` and the visible on-page accordion DOM text.
- **Topics Covered:** PITI components, Homeowners Protection Act (HPA 1998) 80%/78% PMI rules, 15y vs 30y trade-offs, discount points breakeven formula, annual escrow adjustments, biweekly compounding mechanics, APR vs nominal rate, prepayment mathematics, zero-down VA/USDA loans, closing cost ranges, property tax re-assessments, and tax deductibility limits ($750k acquisition debt cap, $10k SALT cap).
*Validation Verdict:* **PASS**. Syntactically valid, adheres to Google FAQ schema guidelines.

---

## 5. Site Architecture, Sitemap & Robots Verification

1. **`robots.txt` Verification:**
   - **URL:** `https://omnitools-navy.vercel.app/robots.txt`
   - **Status:** `200 OK`
   - **Directives:**
     ```
     User-Agent: *
     Allow: /
     Disallow: /api/

     Sitemap: https://omnitools-navy.vercel.app/sitemap.xml
     ```
   - **Verdict:** Clean. No disallow blocks affecting `/finance/mortgage-calculator` or dependent CSS/JS assets.

2. **XML Sitemap Verification:**
   - **URL:** `https://omnitools-navy.vercel.app/sitemap.xml`
   - **Status:** `200 OK`
   - **Entry Verified:** `https://omnitools-navy.vercel.app/finance/mortgage-calculator` exists in dynamic sitemap output.

3. **Internal Linking Health:**
   - Anchor links in "Related Tools" navigate to live published finance tools:
     - `/finance/compound-interest-calculator`
     - `/finance/investment-calculator`
     - `/finance/auto-loan-calculator`
     - `/finance/roi-calculator`
     - `/finance/inflation-calculator`
   - All destination routes return `200 OK` without broken 404 links.

---

## 6. On-Page Search Intent & Mathematical Reconciliation

The on-page guide features a worked reference example that is completely reconciled with the underlying computation engine:
- **Baseline Scenario:** \$400,000 purchase price, 20% down payment (\$80,000), \$320,000 loan amount, 30-year fixed term, 6.50% annual interest rate.
- **Engine Output:**
  - Scheduled Monthly Principal & Interest: **\$2,022.62**
  - Property Taxes (1.2% / \$4,800/yr): **\$400.00**
  - Hazard Homeowners Insurance (\$1,200/yr): **\$100.00**
  - HOA Dues: **\$0.00**
  - Private Mortgage Insurance (PMI): **\$0.00** (80% initial LTV)
  - **Total Monthly PITI Housing Outlay: \$2,522.62**
  - Cumulative Lifetime Interest Paid: **\$408,141.67**
  - Cumulative Lifetime Cost of Loan: **\$728,141.67**
- **Exact Parity:** The on-page narrative tables and worked examples reflect the exact precision of [`lib/mortgageEngine.ts`](file:///d:/omnitools/lib/mortgageEngine.ts).

---

## 7. Search Engine Guidelines & Disclosure Rules

- **Zero Keyword Stuffing:** Natural prose constructed around mathematical concepts, financial principles, and statutory explanations.
- **No Doorway Pages:** All related variations (amortization, escrow, biweekly, prepayments) reside on this single authoritative canonical URL.
- **Honest Schema:** Explicitly avoids fabricating reviews, editor ratings, or third-party endorsements.
- **Search Engine Prerogative:** Valid technical SEO and rich schema provide crawler discoverability and eligibility, but Google and other search engines retain autonomous algorithmic discretion over indexing priority and SERP placement.
