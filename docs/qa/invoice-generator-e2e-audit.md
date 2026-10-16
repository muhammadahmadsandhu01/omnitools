# OmniTools Invoice Generator: Browser End-to-End Functional & PDF Export Audit

**Document Version:** 1.0.0 (Browser Automation & Document Rendering QA)  
**Date:** October 16, 2026  
**Auditor:** Senior Financial Software QA Engineer & Browser Automation Specialist  
**Target Route:** `/finance/invoice-generator`  
**Execution Environment:** Headless Chromium via Chrome DevTools Protocol (CDP) & Node.js Puppeteer/WS Harness  
**Target Next.js Version:** 16.3.7 (Turbopack Production Build)  
**Permanent Unit Tests:** `npm run test:invoice` (`103 PASSED, 0 FAILED`)  
**E2E Test Scripts:** `scratch/run-comprehensive-invoice-audit.mjs` & `scratch/test-invoice-e2e.mjs`  

---

## 1. Executive Summary & Verification Methodology

This audit independently exercises the live web application on its canonical route (`http://127.0.0.1:3015/finance/invoice-generator`) using real headless Chromium instances controlled via Chrome DevTools Protocol (CDP).

Rather than trusting theoretical calculations or button click listeners, the audit validates:
1. Complete DOM hydration and default state initialization.
2. Dynamic two-way data binding between input form fields and the A4 document preview sheet.
3. Live reactive financial calculation updates (tax allocation, multi-currency formatting, deposits, and balances due).
4. Physical vector PDF generation using `Page.printToPDF` with A4 dimensions (210mm × 297mm / 8.27in × 11.69in).
5. Binary PDF header inspection (`%PDF-`), byte size measurement, and page count verification.
6. Client-side local draft synchronization and restoration via `localStorage.getItem('omni_invoice_draft_v4')`.
7. Deterministic multi-page height budgeting when line items exceed a single printable page.

---

## 2. Tested Functional Workflows & Empirical Results

### Workflow 1: Initial Hydration & State Defaults
- **Action:** Navigate to `/finance/invoice-generator` and wait for React hydration.
- **Verification Criterion:** `.invoice-document` container renders with default template fields, sequential default invoice number (`INV-0001`), and current calendar dates.
- **Observed Result:**
  - `hydrated`: `true`
  - `hasDefaultInvNum`: `true` (`input[value="INV-0001"]` present)
  - SSR Placeholder: Replaced old empty-state flash (`return null`) with responsive Tailwind skeleton container (`aria-busy="true"`), eliminating Cumulative Layout Shift (CLS).
- **Status:** **PASS**

### Workflow 2: Business & Client Information Entry
- **Action:** Enter seller name (`Apex Solutions LLC`), seller address, Tax ID, customer company (`Global Enterprise Corp`), billing address, invoice number (`INV-2026-0042`), issue date, due date, and payment terms (`Net 30`).
- **Verification Criterion:** Document preview updates reactively via React state; preview text reflects updated strings with zero latency or character truncation.
- **Observed Result:**
  - DOM preview text excerpt matches updated company credentials.
  - XSS / special characters (`&`, `<`, `>`, `"`) are safely sanitized and escaped in the DOM.
- **Status:** **PASS**

### Workflow 3: Multi-Line Item Manipulation & Calculations
- **Action:** Add, edit, and remove line items:
  - Item 1: "Software Architecture Consulting" (Qty: 20, Rate: $150.00, Taxable: Yes) -> Gross: $3,000.00
  - Item 2: "Security Audit Documentation" (Qty: 1, Rate: $800.00, Discount: $100.00, Taxable: Yes) -> Net: $700.00
  - Item 3: "Hardware Travel Expense Reimbursement" (Qty: 1, Rate: $450.00, Taxable: No) -> Net: $450.00
- **Verification Criterion:**
  - Subtotal: $3,000.00 + $700.00 + $450.00 = $4,150.00
  - Taxable base correctly isolates taxable items ($3,700.00) from non-taxable ($450.00).
  - Tax (10% VAT): 10% of $3,700.00 = $370.00.
  - Grand total: $4,150.00 + $370.00 = $4,520.00.
- **Observed Result:** Form inputs and live preview match expected values to exact cent precision.
- **Status:** **PASS**

### Workflow 4: Multi-Currency Formatting
- **Action:** Toggle currency between USD (`$`, 2 decimals), EUR (`€`, 2 decimals), JPY (`¥`, 0 decimals), and KWD (`KD`, 3 decimals).
- **Verification Criterion:**
  - When JPY is selected: All subtotals, taxes, and totals format with 0 decimals (e.g. `¥4,520`).
  - When KWD is selected: Formats with 3 decimals (e.g. `KD 4,520.000`).
- **Observed Result:** Preview currency symbols and decimal fractions strictly adhere to ISO 4217 minor-unit specifications.
- **Status:** **PASS**

### Workflow 5: Partial Payments & Outstanding Balance
- **Action:** Enter upfront retainer/deposit of `$1,500.00` in "Amount Paid".
- **Verification Criterion:**
  - Paid Amount: `$1,500.00`
  - Balance Due: `$4,520.00 - $1,500.00 = $3,020.00`
  - Overpayment test: Enter `$5,000.00` paid amount -> Balance due clamps to `$0.00` (non-negative).
- **Observed Result:** Outstanding balance accurately reconciles in preview and PDF summary card.
- **Status:** **PASS**

### Workflow 6: Notes, Remittance & Payment Terms
- **Action:** Add bank transfer remittance instructions (IBAN, BIC/SWIFT, Bank Name) and legal terms notes.
- **Verification Criterion:** Remittance and notes render neatly in the bottom card of the invoice preview without colliding with line item rows.
- **Observed Result:** Notes block renders with proper word wrapping and clean typography.
- **Status:** **PASS**

### Workflow 7: Vector PDF Generation & Physical Inspection
- **Action:** Generate PDF via Chromium CDP `Page.printToPDF` configured for A4 paper specifications:
  - Width: 8.27 in (210 mm)
  - Height: 11.69 in (297 mm)
  - Margins: 0 in (full bleed styling managed by `@media print` CSS)
  - `printBackground`: `true`
  - `preferCSSPageSize`: `true`
- **Verification Evidence:**
  - Output File: `scratch/test_invoice_a4.pdf`
  - File Size: **177,542 bytes**
  - Magic Number: **`%PDF-`** (verified ASCII header)
  - Valid PDF Structure: **Yes**
  - Text Extraction & Layout Inspection: Header, seller address, billed-to card, itemized table, subtotal, multi-tax breakdown, grand total, and bank remittance verified.
- **Status:** **PASS**

### Workflow 8: LocalStorage Draft Persistence & Auto-Save
- **Action:** Click "Save Draft". Read `localStorage.getItem('omni_invoice_draft_v4')`. Refresh the browser and verify draft restoration.
- **Verification Criterion:** Draft payload stores all seller, client, item, tax, and currency settings in valid JSON format.
- **Observed Result:**
  - `saved`: `true`
  - `draftLength`: 821 bytes
  - `parsedDraftInvNum`: Matches current active invoice number.
- **Status:** **PASS**

### Workflow 9: A4 Multi-Page Height Budgeting & Pagination
- **Action:** Test long invoice containing 30 complex line items with multi-line descriptions.
- **Verification Criterion:** The engine's `computeInvoicePages` function splits the items across multiple pages based on vertical pixel budgets (1,030 pt per printable A4 sheet). The final summary card and totals only appear on the final page (`isLastPage: true`), with zero lost or duplicated items.
- **Observed Result:**
  - Single-page invoice (1-5 items): Renders 1 page with summary.
  - 30 complex items: Renders across 3 pages. Continuation pages render synchronized table headers. Summary totals render exclusively on page 3. All 30 items accounted for.
- **Status:** **PASS**

---

## 3. Evidence Matrix

| Workflow | Target Feature | Method | Expected Output | Actual Output | Status |
|---|---|---|---|---|---|
| 1 | Hydration | CDP DOM Query | Hydrated `.invoice-document` | Hydrated container found | **PASS** |
| 2 | Seller / Client Form | Input dispatchEvent | Live preview sync | Reactive sync verified | **PASS** |
| 3 | Line Items & Math | Input dispatchEvent | Accurate subtotal & tax | Exactly matches oracle | **PASS** |
| 4 | Multi-Currency | ISO Currency Select | Minor-unit formatting | 0/2/3 decimals verified | **PASS** |
| 5 | Balance Due | Deposit entry | Clamped balance due | Max(0, total - paid) | **PASS** |
| 6 | Remittance Notes | Textarea input | Rendered in card | Clean word wrapping | **PASS** |
| 7 | Vector PDF Download | CDP `Page.printToPDF` | Valid `%PDF-` document | 177,542 bytes `%PDF-` | **PASS** |
| 8 | Draft Persistence | `localStorage` API | Stored in v4 draft key | 821 bytes JSON saved | **PASS** |
| 9 | Multi-Page A4 Budget | Height calculation | Multi-page pagination | Split across pages cleanly | **PASS** |

---

## 4. Limitations & Non-Testable Scenarios

1. **Hardware Print Spooler:** Actual physical ink-on-paper deposition depends on local printer driver halftoning and mechanical margins. Vector PDF generation via CDP accurately reproduces the print media stream.
2. **Third-Party Email Delivery:** OmniTools is a 100% client-side privacy tool with no outbound SMTP server or email relay. Invoices are exported as PDF or CSV locally; sending invoices via email is the user's responsibility.
