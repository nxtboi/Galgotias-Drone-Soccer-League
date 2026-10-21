# Paid Registration & Dashboard Payment Gateway Setup (D-20: ₹1,400 · D-40: ₹4,000)

This plan implements division-based paid registration (**₹1,400** for Class 20 / D-20 and **₹4,000** for Class 40 / D-40), a complete interactive Razorpay-style multi-method payment gateway inside the Squad Dashboard, and strict gating so official Event Passes and receipts are unlocked only after payment completion.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and workflow decisions directly reflect your answers from the clarification step:

- **Confirmed Decision 1 — Post-Registration Payment in Squad Dashboard**: Completing the 3-step registration form creates the squad account with a `PENDING` payment status (`₹1,400` for D-20 or `₹4,000` for D-40) and routes the captain to their Squad Dashboard to complete payment.
- **Confirmed Decision 2 — Event Passes Locked Until Payment**: The Official Event Pass (along with the verified Payment Receipt invoice) remains locked while payment status is `PENDING`. Only after completing payment through the dashboard gateway does the participant unlock and download their Official Event Pass.
- **Confirmed Decision 3 — Razorpay-Style Multi-Method Checkout Modal**: The payment gateway supports **UPI QR & UPI ID Instant Pay**, **Credit & Debit Cards** (with OTP verification step), and **Net Banking / Institutional Transfer**.
- **Division Fee Alignment**: All division selectors, invoices, and pre-seeded squad records are aligned to **₹1,400** for Class 20 (D-20) and **₹4,000** for Class 40 (D-40).

---

## 1. Overview & Core Concept

- **What It Does**: Establishes a complete end-to-end registration-to-payment-to-pass lifecycle. Newly registered squads submit their roster and hardware specs first, land in their Squad Dashboard with a pending fee balance (`₹1,400` for D-20 or `₹4,000` for D-40), pay via an interactive checkout gateway, and immediately unlock their printable Official Event Pass and tax receipt.
- **Target Audience / Persona**: Collegiate drone soccer team captains and university coordinators registering squads in Class 20 or Class 40 divisions.
- **Key Value**: Ensures no event pass or pit bay credential is issued before fee settlement while providing a realistic, multi-method Indian payment checkout experience (UPI, Card, Net Banking) with automatic Google Sheets synchronization.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **3-Step Squad Registration (`TeamRegistrationPage`)**:
     - Step 1 displays the exact entry fee alongside each division (**Class 40 / D-40: ₹4,000** and **Class 20 / D-20: ₹1,400**).
     - Upon submitting Step 3, the squad profile is saved with `paymentInfo.status = 'PENDING'` and payable amount set to `₹1,400` (D-20) or `₹4,000` (D-40).
     - Step 4 displays a clear **"Registration Recorded — Payment Required in Dashboard"** notice with the assigned Team ID and a primary action button that takes the user directly into their **Squad Dashboard** to complete payment and unlock their Event Pass.
  2. **Dashboard Payment Prompt & Pass Gating (`TeamDashboardPage`)**:
     - When `paymentInfo.status === 'PENDING'`, a top alert banner and the Overview tab display the pending fee (`₹1,400` or `₹4,000`) with a primary **Pay Registration Fee Now** button.
     - Adds a dedicated **Event Pass** tab to the dashboard horizontal tab bar (`Overview`, `Event Pass`, `Payment Receipt`, `OD Letter`, `Profile & Roster`, `Schedule`).
     - If payment is `PENDING`, the **Event Pass** and **Payment Receipt** tabs display a locked state explaining that payment of `₹1,400` (D-20) or `₹4,000` (D-40) is required to generate the official pass and receipt, accompanied by a one-click **Proceed to Payment Gateway** button.
  3. **Interactive Razorpay-Style Payment Gateway (`PaymentGatewayModal`)**:
     - Displays merchant header (**GCDIS · Galgotias Drone Soccer League**), Squad Name, Team ID, Division, and exact fee (`₹1,400.00` or `₹4,000.00`).
     - **Method 1 — UPI (QR & VPA)**: Interactive scannable UPI QR code and VPA input (`captain@okaxis`, `@ybl`, `@paytm`) with format validation.
     - **Method 2 — Credit / Debit Cards**: 16-digit card number formatting, expiry (`MM/YY`), CVV, cardholder name, and a 6-digit OTP verification step.
     - **Method 3 — Net Banking & Institutional NEFT**: Quick-select bank buttons (SBI, HDFC, ICICI, Axis, PNB, Kotak) plus an option for institutional NEFT/UTR reference submission.
     - Upon payment confirmation, generates an official receipt number (`GDSL-REC-2026-XXX`) and transaction ID, updates status to `VERIFIED`, persists to `localStorage` and Google Sheets, and automatically opens the newly unlocked **Event Pass** tab.
  4. **Unlocked Official Event Pass (`TeamDashboardPage`)**:
     - Once paid, displays the printable/downloadable **Official GDSL 2026 Squad Event Pass** containing the Team ID, Division (`D-20` or `D-40`), Allocated Pit Bay, 6-member accredited squad list, verification QR code, and verified payment reference (`₹1,400` or `₹4,000` Paid), with **Download Pass (PDF)** and **Print Pass** actions.
- **Visual Identity & Theme**:
  - Preserves the clean, utilitarian dark neutral slate theme (`bg-slate-900`, `bg-slate-800`, `border-slate-700`) on the Squad Dashboard and a crisp, trustworthy payment gateway modal with standard sans-serif typography and tabular numerals (`tabular-nums`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Post-Registration Dashboard Checkout vs. Inline Form Checkout**:
  - *Chosen Approach*: Save the registration profile on Step 3 with `status: 'PENDING'`, log the squad into their dashboard session, and require payment completion inside the dashboard to unlock the Event Pass.
  - *Why*: Matches your exact workflow requirement so teams never lose their entered roster data if payment is completed later from their dashboard, while strictly gating the Event Pass behind verified payment.
- **Decision 2 — Division-Driven Fee Calculation (`D-20 = ₹1,400`, `D-40 = ₹4,000`)**:
  - *Chosen Approach*: Centralize division fee lookup (`getDivisionFee(division)`) returning `₹1,400` for Class 20 and `₹4,000` for Class 40 across registration, payment gateway, invoices, and admin tables.
  - *Why*: Guarantees single-source-of-truth pricing across all views and prevents mismatched invoice totals.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    3-Step Team Registration Flow                        │
│   Selects D-20 (₹1,400) or D-40 (₹4,000) -> Saves Profile as PENDING    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   Squad User Dashboard (TeamDashboardPage)              │
│  Checks `team.paymentInfo.status` ('PENDING' vs 'VERIFIED' / 'PAID')    │
├────────────────────────────────────┬────────────────────────────────────┤
│       IF STATUS === 'PENDING'      │      IF STATUS === 'VERIFIED'      │
│  ┌──────────────────────────────┐  │  ┌──────────────────────────────┐  │
│  │ • Pending Fee Alert Banner   │  │  │ • Event Pass Tab UNLOCKED    │  │
│  │ • Event Pass Tab LOCKED      │  │  │   (Printable + PDF Download) │  │
│  │ • Receipt Invoice LOCKED     │  │  │ • Official Tax Invoice PDF   │  │
│  │ • [Pay ₹1,400 / ₹4,000 Now]  │  │  │ • College OD Letter Active   │  │
│  └──────────────┬───────────────┘  │  └──────────────────────────────┘  │
└─────────────────┼──────────────────┴───────────────────▲────────────────┘
                  │ Opens Modal                          │ Updates State
                  ▼                                      │ & Syncs Sheets
┌────────────────────────────────────────────────────────┴────────────────┐
│            Interactive Checkout Gateway (PaymentGatewayModal)           │
│  ├─ Tab 1: UPI Instant Pay (Dynamic QR Code + UPI ID VPA Verification)  │
│  ├─ Tab 2: Credit / Debit Card (Card Input + Simulated 6-Digit OTP)     │
│  └─ Tab 3: Net Banking & Institutional NEFT (Bank Grid + UTR Entry)     │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - Extends `RegisteredTeamProfile['paymentInfo']['status']` to support `'PENDING' | 'PAID' | 'VERIFIED'`.
  - Adds helper `getDivisionFee(division: string): { numeric: number; formatted: string }` returning `{ numeric: 1400, formatted: '₹1,400' }` for Class 20 and `{ numeric: 4000, formatted: '₹4,000' }` for Class 40.
- **Interactive Component & State Mapping**:
  - **Registration Submission (`handleNextStep`)**: Creates profile with `status: 'PENDING'`, `amount: '₹1,400'` or `'₹4,000'`, `transactionId: 'PENDING'`, and `receiptNo: 'PENDING'`, logs the team in, and offers direct navigation to the Squad Dashboard.
  - **Payment Gateway Completion (`handlePaymentSuccess`)**: Updates `team.paymentInfo` with `status: 'VERIFIED'`, generated `receiptNo`, `transactionId`, selected `paymentMode` (`UPI`, `Card`, or `Net Banking`), and timestamp; saves to `localStorage`, syncs with Google Sheets, and switches the dashboard to the unlocked `pass` tab.
