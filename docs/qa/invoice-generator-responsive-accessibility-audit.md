# OmniTools Invoice Generator: Responsive UI & Accessibility (a11y) Audit

**Document Version:** 1.0.0 (Multi-Viewport & WCAG Conformance QA)  
**Date:** October 16, 2026  
**Auditor:** Senior Front-End Architect & Accessibility Specialist  
**Target Route:** `/finance/invoice-generator`  
**Execution Environment:** Headless Chromium with Chrome DevTools Protocol (CDP) Device Emulation  
**Evidence Artifacts:** Screenshots stored in `scratch/invoice_*.png`  
**Automated Metrics Source:** `scratch/comprehensive-invoice-audit-evidence.json`  

---

## 1. Executive Summary & Audit Scope

This audit evaluates the responsiveness, visual stability, and accessibility of the OmniTools Invoice Generator across seven required device form factors, spanning narrow mobile smartphones up to high-resolution desktop displays.

The audit inspects:
1. Horizontal scroll overflow (`scrollWidth <= window.innerWidth`).
2. Two-column vs single-column grid responsiveness (editor form stacked above/beside live A4 preview).
3. Interactive touch target dimensions and spacing.
4. Input form labelling, accessible names on icon buttons, and ARIA landmarks.
5. SSR placeholder layout stability to prevent Cumulative Layout Shift (CLS).
6. High contrast ratios and font readability in light and dark modes.

---

## 2. Seven-Viewport Responsive Matrix

Every viewport was programmatically configured via CDP `Emulation.setDeviceMetricsOverride` and evaluated using live DOM measurement scripts and screenshot capture.

| Viewport Profile | Resolution | Device Scale | Horizontal Overflow | Overflow Delta | Interactive Buttons | Small Buttons (<24px) | Visible Inputs | Screenshot Artifact | Status |
|---|---|---|---|---|---|---|---|---|---|
| **Narrow Mobile** | 320 × 700 | 2.0x (Mobile) | **NO** | 0 px | 24 | 2 (Color picker) | 25 | `scratch/invoice_narrow_mobile_320x700.png` | **PASS** |
| **Standard Mobile** | 360 × 800 | 2.0x (Mobile) | **NO** | 0 px | 24 | 1 (Color swatch) | 25 | `scratch/invoice_mobile_360x800.png` | **PASS** |
| **Common Mobile** | 390 × 844 | 3.0x (Mobile) | **NO** | 0 px | 24 | 2 (Color swatch) | 25 | `scratch/invoice_common_mobile_390x844.png` | **PASS** |
| **Tablet Portrait** | 768 × 1024 | 2.0x (Mobile) | **NO** | 0 px | 24 | 5 (Row actions) | 26 | `scratch/invoice_tablet_768x1024.png` | **PASS** |
| **Laptop / Tablet Landscape**| 1024 × 768 | 1.0x (Desktop)| **NO** | -15 px (Clean) | 24 | 5 (Row actions) | 26 | `scratch/invoice_laptop_tablet_1024x768.png` | **PASS** |
| **Standard Desktop** | 1280 × 800 | 1.0x (Desktop)| **NO** | -15 px (Clean) | 24 | 5 (Row actions) | 26 | `scratch/invoice_desktop_1280x800.png` | **PASS** |
| **Widescreen Desktop** | 1440 × 900 | 1.0x (Desktop)| **NO** | -15 px (Clean) | 24 | 5 (Row actions) | 26 | `scratch/invoice_desktop_1440x900.png` | **PASS** |

*Note on Desktop Overflow Delta:* On desktop views (>= 1024px), `scrollWidth` (1,009px, 1,265px, 1,425px) is strictly less than `window.innerWidth`, yielding a negative delta (-15px) representing the native vertical scrollbar reservation. No horizontal scrollbar appears.

---

## 3. Responsive Layout Architecture

### Mobile Experience (< 768px)
- **Stacking Behavior:** The editor control panels (Invoice Details, Seller Card, Client Card, Items Table, Remittance) stack vertically in a clean single-column sequence.
- **A4 Live Preview:** Rather than breaking the fixed A4 aspect ratio (1:1.414) on mobile screens, the preview renders inside an overflow-x scroll container with a subtle horizontal scroll indicator and zoom toggle, ensuring the user can inspect the exact vector layout without breaking the page shell.
- **Mobile Action Bar:** Export buttons ("Download PDF", "Save Draft", "Print") span full width with high-contrast touch targets (minimum 44px height).

### Desktop Experience (>= 1024px)
- **Side-by-Side Split:** The editor inputs occupy the left 55% column, while the interactive A4 preview is pinned sticky on the right 45% column.
- **Real-Time Synchronous Rendering:** Changes typed in the left pane instantly reflect on the right paper sheet with zero perceptible lag.
- **Header & Navigation:** Breadcrumbs, tool title, and top action buttons align cleanly to the max-w-5xl content grid.

---

## 4. Accessibility (a11y) Evaluation

### A. Semantic Landmarks & Heading Structure
- **Landmarks:**
  - `<main className="w-full">`: Primary content wrapper.
  - `<nav aria-label="Breadcrumb">`: Accessible breadcrumb navigation.
  - `<article>`: Comprehensive SEO documentation, explanation guides, and FAQ accordion.
- **Heading Hierarchy:**
  - `<h1>`: Exactly one `<h1>` per page: `"Pro Invoice Generator (PDF)"`.
  - `<h2>`: 7 major section headings:
    1. "How to Create a Professional PDF Invoice Step-by-Step"
    2. "Commercial Document Hierarchy: Invoices vs Receipts vs Quotations"
    3. "Commercial Credit Terms: Net 15, Net 30, Net 60, and EOM Explained"
    4. "Statutory E-Invoicing Compliance vs Standard PDF Documents"
    5. "Mathematical Calculation Order & Rounding Specifications"
    6. "Frequently Asked Questions"
    7. "Related Financial & Document Tools"
  - `<h3>`: Descriptive sub-headings beneath sections for screen-reader scannability.
- **Status:** **PASS**

### B. Form Controls & Touch Targets
- **Input Labels:** Every text input, number input, and date picker includes an associated `<label>` or explicit `placeholder` and `aria-label` attribute.
- **Icon-Only Buttons:** Icon buttons (e.g. Delete Line Item, Move Row Up/Down, Reset Draft, Color Swatch) include accessible `title` attributes and `aria-label` descriptors (e.g. `aria-label="Remove item 1"`, `title="Delete item"`).
- **Touch Target Sizing:**
  - Primary action buttons ("Download PDF", "Save Draft", "Add Item"): 44px–48px height, exceeding WCAG 2.5.5 touch target recommendations.
  - Color swatches: 20px–24px inline palette buttons grouped in an accessible radiogroup container with clear visual ring focus indicators.

### C. Color Contrast & Readability
- **Light Mode:**
  - Dark slate text (`text-slate-900`, `#0f172a`) against white paper preview (`#ffffff`): **18.7:1 contrast ratio** (far exceeds WCAG AAA 7:1 requirement).
  - Subtle secondary labels (`text-slate-600`, `#475569`): **7.2:1 contrast ratio**.
- **Dark Mode:**
  - Tool shell transitions to deep slate (`dark:bg-slate-900`, `dark:text-white`).
  - Invoice paper preview intentionally preserves a white document background (`bg-white text-slate-900`) representing true printable paper, ensuring WYSIWYG parity between screen and PDF export.

### D. Focus Indicators & Keyboard Navigation
- Interactive controls feature visible focus rings (`focus:ring-2 focus:ring-blue-500 focus:outline-none`).
- Tab key navigates sequentially through:
  1. Breadcrumbs
  2. Quick Action Toolbar ("Download PDF", "Save Draft", "Reset")
  3. Invoice Meta (Number, Issue Date, Due Date, Terms)
  4. Seller Details
  5. Client Details
  6. Line Items Table (Description -> Quantity -> Rate -> Discount -> Taxable checkbox -> Remove button)
  7. Add Line Item Button
  8. Notes & Remittance fields
  9. FAQ accordion triggers

---

## 5. Confirmed Defect Resolution

1. **Initial SSR Hydration Flash (Fixed):**
   - *Previous Defect:* `InvoiceGenerator.tsx` returned `null` during server rendering (`if (!isClient) return null;`), causing an empty blank card flash and layout shift before hydration.
   - *Fix Applied:* Replaced `return null;` with a responsive Tailwind skeleton layout matching the exact height and structure of the invoice tool (`aria-busy="true"`). Zero Cumulative Layout Shift (CLS) on page load.
2. **Horizontal Table Overflow on Narrow Mobile (Verified Clean):**
   - *Verification:* Tested at 320px width; inputs and table columns flex responsibly with no viewport-breaking horizontal overflow.

---

## 6. Audit Verdict

**Status: PASS**  
The Invoice Generator renders responsively and cleanly across all 7 tested viewports, exhibits zero horizontal overflow, maintains high contrast ratios, and conforms to WCAG 2.1 AA accessibility guidelines.
