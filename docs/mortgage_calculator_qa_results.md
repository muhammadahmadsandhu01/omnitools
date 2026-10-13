# OmniTools Mortgage Calculator — Full UI, Responsive & Accessibility QA Results

**Audit Date:** October 13, 2026  
**Auditor:** Quantitative Test Engineer & Accessibility Specialist  
**Test Environment:** Headless Google Chrome (Version 131+), Chrome DevTools Protocol (CDP), local optimized production build (`next start`), and live production deployment (`https://omnitools-navy.vercel.app/finance/mortgage-calculator`).

---

## 1. Executive Summary & Defect Remediation

During automated browser testing across 11 target viewports, an authentic responsive defect was discovered:
- **Discovered Defect:** On ultra-compact 320px mobile viewports (e.g. iPhone SE 1st gen), the "Advanced Mortgage & Financing Options" and "Methodology & Calculation Assumptions" accordion buttons contained `whitespace-nowrap`, expanding their text to 301px. With container padding, this forced the document `scrollWidth` to 355px, yielding **+35px horizontal overflow**.
- **Remediation:** Removed `whitespace-nowrap` and applied `text-left`, allowing text to wrap cleanly on compact screens without visual clipping.
- **Verification:** Re-tested locally via Headless Chrome CDP. All 11 viewports now report **0px horizontal overflow (`scrollWidth === clientWidth`)**.

---

## 2. Multi-Viewport Responsive Matrix (11 Viewports)

| Viewport Category | Device Archetype | Viewport Dimensions | Document Scroll Width | Viewport Client Width | Horizontal Overflow | Result |
|---|---|---|---|---|---|---|
| **Compact Mobile** | iPhone SE (1st gen) | 320 &times; 568 px | 320 px | 320 px | **0 px** | **PASS** |
| **Common Android** | Samsung Galaxy S-series | 360 &times; 800 px | 360 px | 360 px | **0 px** | **PASS** |
| **Standard Mobile**| iPhone 8 / SE (2nd/3rd gen) | 375 &times; 667 px | 375 px | 375 px | **0 px** | **PASS** |
| **Modern Mobile**  | iPhone 12 / 13 / 14 / 15 | 390 &times; 844 px | 390 px | 390 px | **0 px** | **PASS** |
| **Large Mobile**   | iPhone XR / 11 / Plus | 414 &times; 896 px | 414 px | 414 px | **0 px** | **PASS** |
| **Max Mobile**     | iPhone 14/15/16 Pro Max | 430 &times; 932 px | 430 px | 430 px | **0 px** | **PASS** |
| **Tablet Portrait**| iPad 9.7 / 10.2 Portrait | 768 &times; 1024 px | 768 px | 768 px | **0 px** | **PASS** |
| **Tablet / Laptop**| iPad Landscape / Compact Laptop | 1024 &times; 768 px | 1009 px | 1009 px | **0 px** | **PASS** |
| **Desktop Small**  | Standard Desktop WXGA | 1280 &times; 800 px | 1265 px | 1265 px | **0 px** | **PASS** |
| **Desktop Medium** | MacBook Pro / QHD | 1440 &times; 900 px | 1425 px | 1425 px | **0 px** | **PASS** |
| **Desktop Large**  | Full HD 1080p Desktop | 1920 &times; 1080 px | 1905 px | 1905 px | **0 px** | **PASS** |

*Note on Desktop Scrollbar:* On viewports $\ge 1024\text{px}$, Windows default scrollbars consume 15px of client width (e.g. 1024px $\to$ 1009px, 1280px $\to$ 1265px, 1920px $\to$ 1905px). `scrollWidth` exactly equals `clientWidth` with zero horizontal overflow in all cases.

---

## 3. Interactive Functional Testing

| Test Area | Automated / Manual Step | Expected Behavior | Observed Result | Status |
|---|---|---|---|---|
| **Scenario Presets** | Click "Conventional 30-Yr (20% Down)" | Price: $400k, Down: 20%, Term: 30y, Rate: 6.5%. | Payment immediately renders $2,022.62/mo; Cash to close $89,200. | **PASS** |
| **15-Yr Accelerated**| Click "15-Yr Fixed Accelerated" | Term: 15y, Rate: 5.75%, Down: 20%. | Payment renders $2,657.31/mo; Payoff is 180 months. | **PASS** |
| **FHA 3.5% + PMI**   | Click "FHA 30-Yr (3.5% Down + PMI)" | Down: 3.5%, PMI: 0.85% active. | PMI card displays ~$273/mo; cancels dynamically when LTV drops to 80%. | **PASS** |
| **Zero Down (VA/USDA)**| Click "Zero Down (100% Financed)" | Down: $0 (0%). Financed principal equals full price. | Computes without division-by-zero or NaN errors. | **PASS** |
| **Extra Payments**   | Enter $200 recurring extra principal | Accelerates payoff schedule. | Payoff period drops from 360 to 280 months; displays ~$111k interest saved. | **PASS** |
| **One-Time Lump Sum**| Enter $10,000 at month 12 | Principal reduced immediately at month 12. | Subsequent interest decreases; loan pays off early. | **PASS** |
| **Single-Click Reset**| Click "Reset to Defaults" button (`#btn-reset`) | Wipes custom inputs and derived acceleration state. | All inputs restored to blank/initial defaults; stale calculations cleared. | **PASS** |
| **Amortization View**| Toggle between Monthly and Annual tabs | Displays month-by-month and year-by-year rows. | Pagination controls function smoothly; balances match ending debt. | **PASS** |
| **CSV Export**       | Click "Export CSV Schedule" | Downloads RFC-4180 CSV file with safe quoting. | Verified formula escaping (`'`, `=`, `+`, `-`, `@`); no malicious Excel injection. | **PASS** |

---

## 4. Accessibility & Semantic HTML Audit

### Automated Accessibility Checks (Passed)
- **Primary Entity Heading:** Single `<h1>` (`Mortgage & Home Loan Calculator`).
- **Heading Order:** Strict H1 $\to$ H2 $\to$ H3 semantic nesting without skipped levels.
- **Input Labels:** Every input control (`#home-price`, `#down-payment-amt`, `#down-payment-pct`, `#interest-rate`, `#loan-term-years`, `#hoa-dues`, `#property-tax`, `#home-insurance`, `#pmi-rate`) has an associated `<label>` connected via `htmlFor` / `id`.
- **ARIA Attributes:** Accordion triggers feature `aria-expanded` and `aria-controls` referencing their respective expandable container IDs (`advancedControlsId`, `methodologyControlsId`, `scheduleControlsId`).
- **Semantic Tables:** The PITI table and Amortization tables use valid `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>` (with `scope="col"` and `scope="row"`), and `<td>`.
- **Color Contrast:** Text tokens utilize `text-slate-900` / `text-slate-700` on light backgrounds and `text-slate-100` / `text-slate-300` on dark backgrounds (`#111827` / `#0f172a`), exceeding WCAG 2.1 AA 4.5:1 contrast requirements.
- **Focus Rings:** Interactive elements provide visible focus outlines (`focus:ring-2 focus:ring-blue-500 focus:outline-hidden`).

### Assistive Technology Disclosure
- **Scope Disclosure:** Accessibility testing was conducted using automated DOM evaluation tools, keyboard navigation simulation (Tab, Shift+Tab, Space, Enter), and Chrome DevTools accessibility tree inspection.
- **Limitation:** An exhaustive end-user audit with dedicated screen-reading hardware/software (e.g. JAWS, NVDA, VoiceOver) was **not manually performed** by a native assistive technology user. Basic ARIA labels and keyboard focus paths have been verified.

---

## 5. Console Errors & Network Hygiene

During local and live Chrome CDP testing:
- **JavaScript Console Errors:** `0` (Zero uncaught errors or React hydration warnings).
- **Network Failures:** `0` (Zero 404s, failed chunks, or blocked fonts).
- **Client-Side Data Privacy:** 100% of mathematical evaluations occur in browser memory; zero outbound POST requests or tracking beacons.
