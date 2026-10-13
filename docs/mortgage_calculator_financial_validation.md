# OmniTools Mortgage Calculator — Independent Financial Mathematics Validation

**Audit Date:** October 13, 2026  
**Auditor:** Quantitative Financial QA Engineer & Mortgage Mathematics Specialist  
**Target Engine:** [`lib/mortgageEngine.ts`](file:///d:/omnitools/lib/mortgageEngine.ts)  
**Interactive UI:** [`components/tools/MortgageCalculator.tsx`](file:///d:/omnitools/components/tools/MortgageCalculator.tsx)  
**Independent Reference Oracle:** `scratch/independent-math-oracle.ts` (Separately implemented from first principles)  
**Deterministic Status:** **PASS (23/23 Independent Oracle Benchmarks Reconciled within Strict Tolerance)**  

---

## 1. Independent Oracle Architecture & Verification Methodology

To prevent the common testing fallacy of importing the production code into the test suite and testing an implementation against itself, a separate **Independent Financial Mathematics Reference Oracle** was constructed in `scratch/independent-math-oracle.ts`.

### Mathematical First Principles Implemented:
1. **Periodic Annuity Payment Formula:**
   $$M = P \times \frac{r(1+r)^n}{(1+r)^n - 1}$$
   Where $P$ is the financed loan principal, $r = \frac{\text{nominalAnnualRate}}{100 \times \text{paymentsPerYear}}$, and $n = \text{years} \times \text{paymentsPerYear}$.
2. **Zero-Interest Linear Division Limiting Case:**
   $$\lim_{r \to 0} M = \frac{P}{n}$$
   Verified with zero division-by-zero floating point anomalies.
3. **Independent Period Simulation:**
   Iterative simulation tracking beginning balance, period interest accrued ($B_{t-1} \times r$), scheduled principal, additional prepayment principal, ending balance ($B_t$), and final period balance settlement without principal overshoot.
4. **Accelerated Biweekly Convention:**
   $$\text{Biweekly Payment} = \frac{M_{\text{monthly}}}{2}$$
   Making 26 half-payments per year equals 13 monthly payments annually (one extra monthly payment applied to principal every year), accelerating loan payoff by roughly 4 to 6 years on a 30-year term.

---

## 2. Comprehensive Benchmark Reconciliation Table

All 23 independent reference cases were evaluated against `lib/mortgageEngine.ts`. Tolerances reflect currency cent rounding.

| Benchmark ID | Scenario Description | Tested Financial Metric | Independent Oracle | Production Engine | Absolute Tolerance | Absolute Difference | Audit Status |
|---|---|---|---|---|---|---|---|
| **BM-01A** | 30-Yr Fixed $320k @ 6.50% | Scheduled Monthly P&I | $2,022.62 | $2,022.62 | $\pm \$0.01$ | $0.0000$ | **PASS** |
| **BM-01B** | 30-Yr Fixed $320k @ 6.50% | Payoff Duration (Months) | 360 | 360 | 0 | 0 | **PASS** |
| **BM-01C** | 30-Yr Fixed $320k @ 6.50% | Cumulative Lifetime Interest | $408,140.64 | $408,140.64 | $\pm \$0.50$ | $0.0000$ | **PASS** |
| **BM-01D** | 30-Yr Fixed $320k @ 6.50% | Principal Conservation | $320,000.00 | $320,000.00 | $\pm \$0.01$ | $0.0000$ | **PASS** |
| **BM-02A** | 15-Yr Fixed $320k @ 5.75% | Scheduled Monthly P&I | $2,657.31 | $2,657.31 | $\pm \$0.01$ | $0.0000$ | **PASS** |
| **BM-02B** | 15-Yr Fixed $320k @ 5.75% | Payoff Duration (Months) | 180 | 180 | 0 | 0 | **PASS** |
| **BM-02C** | 15-Yr Fixed $320k @ 5.75% | Cumulative Lifetime Interest | $158,316.59 | $158,316.59 | $\pm \$0.50$ | $0.0000$ | **PASS** |
| **BM-03A** | Zero Interest $120k @ 0% 10-Yr | Monthly Payment | $1,000.00 | $1,000.00 | $\pm \$0.001$ | $0.0000$ | **PASS** |
| **BM-03B** | Zero Interest $120k @ 0% 10-Yr | Cumulative Lifetime Interest | $0.00 | $0.00 | $\pm \$0.001$ | $0.0000$ | **PASS** |
| **BM-03C** | Zero Interest $120k @ 0% 10-Yr | Payoff Duration (Months) | 120 | 120 | 0 | 0 | **PASS** |
| **BM-04** | Low Interest $100k @ 0.01% 30-Yr | Monthly Payment | $278.20 | $278.20 | $\pm \$0.01$ | $0.0000$ | **PASS** |
| **BM-05** | High Interest $50k @ 25.00% 5-Yr | Monthly Payment | $1,467.57 | $1,467.57 | $\pm \$0.01$ | $0.0000$ | **PASS** |
| **BM-06** | Micro Loan $1,000 @ 5.00% 1-Yr | Monthly Payment | $85.61 | $85.61 | $\pm \$0.01$ | $0.0000$ | **PASS** |
| **BM-07** | Jumbo Loan $10,000,000 @ 6.50% | Monthly Payment | $63,206.80 | $63,206.80 | $\pm \$0.05$ | $0.0000$ | **PASS** |
| **BM-08A** | Accelerated Biweekly $320k @ 6.5% | Scheduled Biweekly Payment | $1,011.31 | $1,011.31 | $\pm \$0.01$ | $0.0000$ | **PASS** |
| **BM-08B** | Accelerated Biweekly $320k @ 6.5% | Payoff Duration (Periods) | 628 | 628 | $\pm 2$ | 0 | **PASS** |
| **BM-08C** | Accelerated Biweekly $320k @ 6.5% | Payoff Duration (Years) | 24.15 yrs | 24.15 yrs | $\pm 0.1$ | $0.00$ | **PASS** |
| **BM-09A** | Extra $200/Mo Prepayment ($350k) | Payoff Duration (Months) | 280 | 280 | $\pm 1$ | 0 | **PASS** |
| **BM-09B** | Extra $200/Mo Prepayment ($350k) | Cumulative Lifetime Interest | $296,816.94 | $296,816.94 | $\pm \$1.00$ | $0.0000$ | **PASS** |
| **BM-10A** | PMI Cancellation at 80% LTV | Total PMI Paid ($300k, 5% down) | $21,049.28 | $21,049.28 | $\pm \$5.00$ | $0.0000$ | **PASS** |
| **BM-10B** | PMI Cancellation at 80% LTV | Initial Period Monthly PMI | $178.13 | $178.13 | $\pm \$0.05$ | $0.0000$ | **PASS** |
| **BM-11A** | JPY Currency (0 Minor Units) | Integer Monthly Payment | ¥110,438 | ¥110,438 | 0 | 0 | **PASS** |
| **BM-11B** | BHD Currency (3 Minor Units) | 3-Decimal Dinar Payment | 286.572 BHD | 286.572 BHD | $\pm 0.001$ | $0.0000$ | **PASS** |

---

## 3. Financial Accounting Invariants Verified

1. **Balance Non-Negativity:**  
   Across all tested schedules (including 100-year loans and large prepayments), ending balance is strictly bounded by $\text{balance}_t \ge 0$.
2. **Principal Conservation:**  
   The sum of all principal repayments across all amortization periods plus any origination prepayments reconciles identically to the original loan principal ($\sum \text{principal} = P$).
3. **Final Settlement Cap:**  
   In the final payment period, principal payment is capped at the exact residual balance plus accrued interest. The loan is never overpaid.
4. **Interest Termination:**  
   Once the balance reaches zero, interest accrual stops immediately; no phantom interest or payment rows are generated.
5. **Prepayment Non-Inversion:**  
   Adding extra principal strictly decreases cumulative interest paid and strictly decreases or maintains payoff duration; extra payments never increase borrowing costs.

---

## 4. Biweekly Compounding Semantics Clarified

### The Mathematical Problem:
In consumer lending, two distinct biweekly concepts exist:
1. **Ordinary Biweekly (26 payments = 12 months):** Calculates a 26-period compounding annuity payment. Total annual payments equal 12 monthly payments. Payoff takes the full 30 years (780 periods).
2. **Accelerated Biweekly (The Consumer Industry Standard):** The borrower pays **half of the regular 30-year monthly payment** ($M_{\text{monthly}} / 2$) every two weeks. Across 52 weeks, 26 payments are made, which equals $26 \times (M/2) = 13 \times M$ (13 full monthly payments per year).

### Implemented Convention in OmniTools:
OmniTools implements **Accelerated Biweekly**.  
- On a \$320,000 loan at 6.50% interest, the monthly payment is \$2,022.62.  
- The biweekly payment is \$1,011.31.  
- By paying \$1,011.31 every two weeks, the loan amortizes in **628 biweekly payments (24.15 years)**, saving **5.85 years of debt** and **\$111,000+ in interest charges**.  
- The displayed monthly equivalent cost reflects $\frac{\text{Biweekly Payment} \times 26}{12} = \$2,191.17/\text{month}$, accurately representing the borrower's annual cash flow requirement.

---

## 5. Private Mortgage Insurance (PMI) Audit & Legal Framework

### Regulatory Basis:
The federal **Homeowners Protection Act of 1998 (HPA)** (12 U.S.C. § 4901 et seq.) establishes two statutory PMI cancellation thresholds for residential mortgages:
1. **Borrower-Requested Cancellation (80% LTV):** Borrowers have the right to request PMI cancellation once the principal balance reaches 80% of the original property value, subject to a good payment history and no subordinate liens.
2. **Automatic Termination (78% LTV):** Mortgage servicers are legally required to automatically terminate PMI on the date the principal balance is scheduled to reach 78% of the original value, provided payments are current.

### Engine Remediation:
- **Defect Fixed:** PMI was previously evaluated on `nextBalance` (the balance *after* principal deduction), causing initial period PMI to display as \$177.97 instead of \$178.13.  
- **Remediation:** PMI is now evaluated on the cycle's beginning balance, accurately computing initial PMI as $(285,000 \times 0.0075) / 12 = \$178.13$.  
- Once the balance reaches or falls below the configured cancellation threshold (default 80% LTV), PMI drops to \$0.00 for all subsequent periods.

---

## 6. Disclosed Model Assumptions & Operational Limitations

1. **Nominal Rate vs. APR:** The calculator computes scheduled payments using the nominal annual interest rate. Upfront points and lender fees are itemized in cash to close, but are not converted into an effective APR cash-flow internal rate of return (IRR).
2. **Canadian Mortgage Compounding:** Canadian mortgages are required by law to compound semi-annually, not monthly. OmniTools uses standard monthly/biweekly compounding.
3. **Escrow Levelization:** Property taxes and insurance are modeled as constant annual estimates divided evenly across billing cycles; actual municipal tax adjustments and escrow shortages vary by county.
4. **FHA Mortgage Insurance Premium (MIP):** FHA loans often require annual MIP for the entire 30-year life of the loan if the down payment was under 10%. OmniTools allows users to adjust the cancellation threshold or set it to 0% to model life-of-loan MIP.
