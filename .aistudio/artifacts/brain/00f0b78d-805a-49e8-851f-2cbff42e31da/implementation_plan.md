# Basic Utilitarian Squad User Dashboard Redesign

This plan strips away the futuristic sci-fi ("hi-fi") visual overrides—such as neon acid-lime glows, chamfered polygon buttons, and display sci-fi typography—from the Registered Squad User Dashboard, replacing them with a straightforward, clean dark neutral slate dashboard organized into five horizontal tabs.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following design and layout decisions incorporate your confirmed preferences from our clarification step:

- **Confirmed Decision 1 — Simple Dark Neutral Slate Aesthetic**: The user dashboard will use flat, understated dark slate surfaces (`#0f172a` canvas, `#1e293b` cards, `#334155` 1px borders) with standard system sans-serif typography and clean rectangular/slightly-rounded controls—completely free of neon acid-lime (`#d0fe1d`) glows, chamfered `clip-path` corners, or `Orbitron` sci-fi headings.
- **Confirmed Decision 2 — Standard Horizontal Tabs**: All squad management tools remain organized under five clean horizontal tabs: **Overview**, **Payment Receipt**, **Attendance (OD Letter)**, **Team Profile & Roster**, and **Match Schedule**.
- **Document Print & PDF Integrity (Default Choice)**: While the interactive dashboard shell uses the simple dark neutral slate theme, the printable A4 **Payment Receipt Invoice** and **College On-Duty (OD) Letter** paper sheets will retain clean, print-ready document contrast so downloaded PDFs and physical prints remain legible for university authorities.

---

## 1. Overview & Core Concept

- **What It Does**: Provides authenticated collegiate drone soccer teams with a straightforward, distraction-free portal to view their registration summary, download their official payment receipt PDF, customize and print their college On-Duty (OD) attendance letter, update squad contact/hardware specs, and check fixture schedules.
- **Target Audience / Persona**: University team captains, student pilots, and faculty coordinators who need a practical, easy-to-read administrative portal rather than a promotional esports interface.
- **Key Value**: Eliminates visual clutter and sci-fi styling interference so captains can quickly read tabular data, edit student roll numbers, and export official university paperwork without dark/neon CSS overrides corrupting print or PDF outputs.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Header & Summary Bar**: Displays the squad name, institution, registration status, and a 4-column key-value strip (Team ID, Division, Captain, Event Dates) with simple **Main Site** and **Logout** buttons.
  2. **Horizontal Tab Navigation**: A clean bottom-bordered tab bar switching immediately between:
     - **Overview**: A simple 4-column summary grid (Payment Receipt, Attendance Request, Team Profile, Match Schedule) above a two-column Registration Summary table.
     - **Payment Receipt**: Action bar with **Download Receipt (PDF)**, **Print**, and **Copy Receipt #**, above the clean A4 tax invoice.
     - **Attendance (OD Letter)**: Simple recipient form (Authority Title, Department, College Name) + **Save Changes** and **Print / Save OD Letter**, above the formal university letter with editable student roll numbers.
     - **Team Profile & Roster**: Inline contact/hardware editor (**Captain Phone**, **Drone Model**, **VTX Band**), a clean 6-row squad roster table, and a 4-column hardware specification strip.
     - **Match Schedule**: Clean status table listing event dates, fixture release time, allocated pit, and a one-click notification toggle.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Utilitarian, flat SaaS administrative dashboard.
  - *Color Palette & Mood*:
    - Dominant Canvas (60%): Deep neutral slate (`#0f172a` / `bg-slate-900`)
    - Structural Surfaces (30%): Flat slate cards (`#1e293b` / `bg-slate-800/90`) with crisp 1px borders (`#334155` / `border-slate-700`) and readable slate typography (`#f8fafc` primary, `#94a3b8` secondary)
    - Accent Budget (10%): Standard semantic blue (`#2563eb` / `bg-blue-600`) for primary actions and active tabs, with semantic green (`#16a34a`) for verified status and muted red (`#dc2626`) for logout
  - *Typography & Hierarchy*: Standard readable sans-serif (`Inter` / system UI sans) across all headings and body text on the dashboard (explicitly overriding the global `Orbitron` heading rule within the dashboard container), paired with `font-mono tabular-nums` for IDs, amounts, and roll numbers.
  - *Component Styling & Layout*: Single-elevation flat cards (`rounded-lg border border-slate-700 bg-slate-800`), standard rectangular buttons (`rounded-md px-4 py-2`), and unboxed inline text metadata with `·` separators instead of decorative emoji or neon pills.
- **Interactive Feedback & Motion**: Instantaneous tab switching, clear inline confirmation banners when saving profile or attendance updates, and spinner state during `html2pdf` invoice generation.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Decoupling User Dashboard from Global `.xotc-page-scope` Overrides**:
  - *Chosen Approach*: Remove the `.xotc-page-scope` wrapper around the User Dashboard route and apply a dedicated `.basic-dashboard-scope` container that resets headings (`h1–h6`) to standard sans-serif and uses standard Tailwind slate classes.
  - *Why*: `.xotc-page-scope` uses `!important` rules to force `Orbitron` fonts, `#161814` backgrounds, and chamfered `#d0fe1d` buttons across all child elements, which made the dashboard look overly futuristic and interfered with clean invoice/letter rendering.
  - *Alternatives Considered*: Overriding individual classes inside `.xotc-page-scope` was rejected because cascading `!important` selectors are brittle and harder to maintain.
- **Decision 2 — Replacing Card Sandwiches & Emoji Clutter with Clean Tables**:
  - *Chosen Approach*: Replace decorative emojis (`🧾`, `🎓`, `👤`, `⏱️`) and colored pill badges with clean text labels, subtle hairline borders, and structured data tables.
  - *Why*: Aligns with enterprise dashboard design standards for high scannability and a calm, basic administrative look.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Application Router (App)                        │
│     Unwraps User Dashboard from `.xotc-page-scope` sci-fi overrides     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│               Basic Squad User Dashboard (TeamDashboardPage)            │
│       Neutral Dark Slate (#0f172a / #1e293b) · Standard Sans Font       │
├─────────────────────────────────────────────────────────────────────────┤
│  1. Top Header Bar                                                      │
│     ├─ Squad Title, Institution, Registration Status                    │
│     ├─ 4-Column Key Info Strip (Team ID, Division, Captain, Dates)      │
│     └─ Navigation Actions (Main Site, Logout)                           │
├─────────────────────────────────────────────────────────────────────────┤
│  2. Horizontal Tab Controller                                           │
│     [Overview]  [Payment Receipt]  [OD Letter]  [Profile]  [Schedule]   │
└──┬─────────────────┬───────────────────┬──────────────┬──────────────┬──┘
   │                 │                   │              │              │
   ▼                 ▼                   ▼              ▼              ▼
┌──────────┐  ┌──────────────┐  ┌────────────────┐ ┌──────────┐ ┌──────────┐
│ Overview │  │   Receipt    │  │   OD Letter    │ │ Profile  │ │ Schedule │
│ 4-Card   │  │ html2pdf A4  │  │ Recipient Form │ │ Inline   │ │ Fixture  │
│ Grid +   │  │ Invoice +    │  │ + Editable     │ │ Editor + │ │ Status + │
│ Summary  │  │ Print/Copy   │  │ Roll No Table  │ │ Roster   │ │ Alert    │
│ Table    │  │ Handlers     │  │ + Sheets Sync  │ │ Table    │ │ Toggle   │
└──────────┘  └──────────────┘  └────────────────┘ └──────────┘ └──────────┘
```

- **Data Model & State**:
  - Preserves `RegisteredTeamProfile` session state (`localStorage` + `saveRegisteredTeam` + automatic background Google Sheets synchronization via `syncTeamToSheet`).
- **Interactive Component & State Mapping**:
  - **Tab Switcher (`activeTab`)**: Switches cleanly between `overview`, `receipt`, `attendance`, `profile`, and `schedule`.
  - **Receipt Actions (`handleDownloadReceiptPdf`, `handlePrint`, `handleCopyReceiptNo`)**: Generates A4 PDF via `html2pdf.js`, triggers browser print, or copies receipt reference to clipboard.
  - **Attendance Form (`handleSaveAttendance`, `handleUpdateRoll`)**: Updates authority/department/college fields and per-student roll numbers in state, persists to `localStorage`, and syncs to Google Sheets.
  - **Profile Editor (`handleSaveProfile`)**: Toggles inline form to edit captain phone, drone model, and VTX channel, saving changes to session state and Google Sheets.
