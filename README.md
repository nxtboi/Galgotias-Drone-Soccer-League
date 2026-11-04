# Galgotias Drone Soccer League (GDSL 2026)

Official Championship Portal, 3D Flight Practice Arena, Team Registration System, and Secretariat Admin Dashboard for the **Galgotias Drone Soccer League (GDSL 2026)** — India's premier collegiate 5v5 caged aerial robotics championship hosted by the **Galgotias Centre for Drone Intelligence & Simulation (GCDIS)** at **Galgotias University, Greater Noida**.

---

## Championship Overview

- **Event Dates**: December 08–09, 2026 (Two-Day National Championship)
- **Venue**: Main Indoor Sports Complex & GCDIS Pro Arena, Block C, Galgotias University, Plot No. 2, Sector 17-A, Yamuna Expressway, Greater Noida, Uttar Pradesh — 203201
- **Total Prize Pool**: **₹2,00,000**
  - **Class D-40 Division (Ø 40 cm Heavyweight Sphere, ≤ 1.2 kg)**: **₹94,000** Total Division Purse (`₹41,000` 1st Place · `₹31,000` 2nd Place · `₹11,000` 3rd Place)
  - **Class D-20 Division (Ø 20 cm High-Speed Sphere, ≤ 150 g)**: **₹74,000** Total Division Purse (`₹31,000` 1st Place · `₹21,000` 2nd Place · `₹11,000` 3rd Place)
  - **Special Excellence Awards**: **₹33,000** (`₹11,000` each for *Best Pilot (MVP)*, *Maximum Goal Scorer*, and *Best Defensive Anchor*)
- **Squad Structure**: 3 to 5 Pilots per registered squad (1 Designated Striker with LED identification + up to 4 Guards/Defenders) + up to 2 Pit Crew Engineers.

---

## Key Features

### 1. Public Championship Portal
- **Interactive Championship Hero**: Live countdown timer to December 08, 2026, circular Galgotias University emblem, event highlights, and quick actions to register or enter the 3D simulator.
- **How Drone Soccer Works**: Visual breakdown of 5v5 caged aerial combat, Striker-only scoring rules, offside reset protocol, and 3×3-minute set structure.
- **Prize Pool & Championship Roadmap**: Detailed division prize breakdown and full 2-day schedule from Technical Inspection (Scrutineering) to Grand Finals.
- **GCDIS Lab Spotlight & Sponsors**: Overview of the Galgotias Centre for Drone Intelligence & Simulation, South Korea's 2025 World Cup inspiration, and partner showcase.

### 2. Interactive 3D Practice Arena (`/practice` view)
- Built with **Three.js / WebGL** for real-time 60 FPS aerial physics inside a scaled `6m × 3m × 3m` steel-mesh Drone Soccer cage.
- **Dual Transmitter Stick HUD**: Supports keyboard (`WASD` + `Arrow Keys`) and on-screen virtual RC sticks (Mode 2 configuration) with Adjustable Flight Rates (`Beginner`, `Sport`, `Pro Acro`).
- **Multi-Angle Camera System**: Instant switching between **Chase Cam**, **FPV Nose Cam**, **Top-Down Tactical**, and **Side Broadcast** views.
- **Live Match Physics**: AI-controlled defender drones, glowing LED goal rings, goal horn effects, and live scoreboard tracking.

### 3. Official Rule Book & Technical Specs
- Complete **FIDA / GDSL 2026** technical compliance tables for both **Class D-20 (20 cm)** and **Class D-40 (40 cm)** divisions.
- **Top-View Arena Schematic**: Interactive blueprint illustrating Goal Rings (`Ø 80 cm`), Center Line, Penalty Spots, Pit Zones, and Pilot Boxes.
- **5-Second Penalty Kick Simulator**: Interactive simulation demonstrating 1v1 Striker vs. Goalkeeper penalty rules.
- **Downloadable Official Rulebooks**: Instant PDF generation and download for Class D-20, Class D-40, and Complete Championship Rulebooks.

### 4. Tournament Bracket & Live Fixtures
- Interactive knockout tree (Quarterfinals, Semifinals, 3rd Place Playoff, and Grand Finale).
- Live match scorecards, set-by-set history, group stage standings, and an interactive **Simulate Next Round** engine.

### 5. Media Gallery & Leadership Directory
- **Media Gallery**: Curated visual archive of the GCDIS Lab, Korea delegation visits, and pro arena setups with full-screen lightbox view and highlight videos.
- **Our Team & Secretariat Contact**: Interactive 3D flip cards for University Patrons, Faculty Conveners, and Student Organizing Committee, plus direct secretariat helpline and inquiry submission.

### 6. 3-Step Team Registration Wizard
- **Step 1 — Squad & Institution Info**: Team name, division selection (`Class D-20` or `Class D-40`), institution details, faculty mentor, and captain contact.
- **Step 2 — Pilot & Pit Crew Roster**: Dynamic roster builder enforcing 1 Striker (`Striker`) and 2–4 Guards (`Guard/Sweeper/Keeper`), plus optional Pit Crew members and technical compliance declarations.
- **Step 3 — Credentials & Instant Excel Sync**: Generates a unique **Team ID** (e.g., `GDSL-26-XXXX`), **Squad Login Password**, QR verification code, and automatically writes the team record to the server-side Excel workbook (`data/GDSL_2026_Teams_Roster.xlsx`).

### 7. Squad Login & Team Dashboard
- **Real-Time Payment Status Banner**:
  - When a team's payment status is set to **`PENDING`**, the dashboard displays an action banner across the **Overview**, **Event Pass**, **Payment Receipt**, and **OD Letter** tabs with three immediate options:
    1. **Complete Registration (Pay Online)**: Opens an interactive UPI / Card / NetBanking payment gateway modal that verifies payment and updates the team's status to `PAID`.
    2. **Request Payment Details on Email**: Dispatches official Galgotias University NEFT/RTGS/IMPS & UPI merchant bank details (`HDFC0004821` / `gdsl2026.galgotias@hdfcbank`) to the captain's email with one-click copy buttons.
    3. **Upload Payment Details**: Allows the captain to submit an offline bank transfer **UTR / Reference Number**, payment mode, paid amount, remarks, and upload a **Receipt Screenshot / PDF proof** (`Base64`), which is immediately synced to the server and flagged for Admin verification.
- **Editable Squad Profile & Pilot Roster**: Captains can update institution details, drone specs (`Exoskeleton Diameter`, `Weight`, `Battery`, `Failsafe`), and pilot names/roles at any time.
- **Official Printable / Downloadable PDF Documents**:
  - **Official Event Pass**: Gate entry pass with QR verification badge, squad roster, and hardware clearance tag.
  - **Official Payment Receipt**: Itemized tax/registration receipt (with pending alert and instant pay/upload triggers if payment is still pending).
  - **Official On-Duty (OD) Attendance Letter**: Formal university-headquartered letter signed by the GDSL 2026 Organizing Secretariat for institutional attendance credit.

### 8. Secretariat Admin Control Panel
- **Server Excel Workbook Sync Bar**: Displays real-time connection status, row count, and last-modified timestamp of `data/GDSL_2026_Teams_Roster.xlsx` on the server, with one-click **Download Excel (`.xlsx`)** and **Save All to Server Excel** actions.
- **Live Spreadsheet Table & Squad Dossiers**: Filterable by division (`All`, `Class D-20`, `Class D-40`) and searchable by Team ID, Squad Name, Institution, or Captain.
- **Instant Payment Status Control**: Admins can toggle any team's registration fee status between **`PENDING`**, **`PAID`**, and **`VERIFIED`** directly from the table or team editor; changes reflect immediately in the user's Team Dashboard and persist to the server Excel sheet.
- **Payment Proof Inspection**: View uploaded UTR numbers, payment timestamps, and full-size payment receipt screenshots submitted by teams, with a one-click **Approve & Mark Verified** button.
- **Full Team Profile Editor**: Edit any squad's name, division, institution, password, pilot roster, or payment status.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript + Vite 6 |
| **Styling & Motion** | Tailwind CSS v4 (`@tailwindcss/vite`), `motion` (Framer Motion), Lucide Icons |
| **3D Flight Simulator** | Three.js (`three`, `@types/three`) |
| **Document & QR Generation** | `html2pdf.js` (A4 PDF export), `qrcode` |
| **Backend Server** | Node.js + Express (`server.ts` executed via `tsx`) |
| **Server-Side Excel Storage** | SheetJS (`xlsx`) writing structured `.xlsx` workbooks to `data/GDSL_2026_Teams_Roster.xlsx` |

---

## Server-Side Excel Storage & API Architecture

All team registrations, profile updates, payment proofs, and admin status changes are persisted on the server in both a structured Microsoft Excel workbook (`data/GDSL_2026_Teams_Roster.xlsx`) and a JSON backing store (`data/teams_store.json`).

### Excel Workbook Specification
- **File Path**: `data/GDSL_2026_Teams_Roster.xlsx`
- **Worksheet Name**: `Registered Teams`
- **Columns (30 Columns)**:
  `Team ID` · `Squad Name` · `Password` · `Division` · `Registered At` · `Payment Status` · `Amount Paid (₹)` · `Payment Ref / UTR` · `Payment Mode` · `Payment Proof Uploaded` · `Payment Proof Date` · `Payment Notes` · `Institution Name` · `Institution Type` · `City` · `State` · `Country` · `Faculty Mentor Name` · `Faculty Mentor Email` · `Faculty Mentor Phone` · `Captain Name` · `Captain Email` · `Captain Phone` · `Pilot Count` · `Striker Pilot` · `Pilot Roster (Name | Role | Callsign | Jersey)` · `Pit Crew` · `Drone Frame Size` · `Total Weight` · `Battery Spec`

### Express REST API Endpoints (`server.ts`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/excel/status` | Returns server workbook metadata (`exists`, `fileName`, `filePath`, `updatedAt`, `rowCount`, and `teams` array). |
| `POST` | `/api/excel/sync-team` | Upserts a single team record into `data/teams_store.json` and regenerates `data/GDSL_2026_Teams_Roster.xlsx`. |
| `POST` | `/api/excel/sync-all` | Bulk-syncs all team records and regenerates `data/GDSL_2026_Teams_Roster.xlsx`. |
| `GET` | `/api/excel/download` | Streams `GDSL_2026_Teams_Roster.xlsx` as a binary `.xlsx` file download. |

---

## Project Structure

```text
├── data/
│   ├── GDSL_2026_Teams_Roster.xlsx     # Auto-generated server-side Excel workbook
│   └── teams_store.json                # Server JSON persistence backing store
├── public/
│   └── assets/aistudio/                # University logos, portraits, and arena photos
├── src/
│   ├── components/
│   │   ├── DroneSoccerHero.tsx         # Landing page hero with live countdown & modal rules
│   │   ├── TournamentOverviewSection.tsx # How it works, ₹2L prize pool, & 2-day roadmap
│   │   ├── SponsorsDivisionSection.tsx # Partner marquee & division overview
│   │   ├── GcdisSpotlightBanner.tsx    # GCDIS lab & Korea World Cup spotlight
│   │   ├── GoogleSheetsSyncBar.tsx     # Server Excel Workbook status & download bar
│   │   ├── GcdisLogo.tsx               # Circular Galgotias University emblem component
│   │   └── GlobalFooter.tsx            # Championship footer & quick navigation
│   ├── data/
│   │   ├── teamsStore.ts               # Client/server state synchronization & seeded squads
│   │   ├── tournamentData.ts           # Brackets, fixtures, and group standings data
│   │   ├── leadershipData.ts           # Patrons, Conveners, and Organizing Committee data
│   │   └── mediaArchiveData.ts         # GCDIS Lab & Pro Arena photo/video items
│   ├── pages/
│   │   ├── PracticeArenaPage.tsx       # Three.js 3D Drone Soccer flight simulator
│   │   ├── TournamentBracketPage.tsx   # Live tournament bracket & match simulator
│   │   ├── RulesAndSpecsPage.tsx       # Class D-20 / D-40 specs, schematic & penalty sim
│   │   ├── GalleryPage.tsx             # Visual archive & highlight videos
│   │   ├── OurTeamPage.tsx             # Leadership & organizing committee directory
│   │   ├── ContactPage.tsx             # Venue map, helpline & inquiry form
│   │   ├── TeamRegistrationPage.tsx    # 3-step registration wizard
│   │   ├── TeamLoginPage.tsx           # Squad & Secretariat Admin login portal
│   │   ├── TeamDashboardPage.tsx       # Squad dashboard, payment modal, proof upload & PDFs
│   │   └── AdminDashboardPage.tsx      # Secretariat admin control panel & Excel manager
│   ├── services/
│   │   ├── googleAuth.ts               # Server Excel status client helper
│   │   └── googleSheetsService.ts      # Client service for `/api/excel/*` endpoints
│   ├── utils/
│   │   └── rulebookPdfGenerator.ts     # Dynamic HTML/PDF generator for official rulebooks
│   ├── App.tsx                         # Main application router & top navigation bar
│   └── main.tsx                        # React DOM entry point
├── server.ts                           # Express + Vite server & SheetJS Excel engine
├── package.json                        # Dependencies and build/start scripts
└── README.md                           # Project documentation
```

---

## Getting Started

### Prerequisites
- **Node.js** `v18+` (recommended `v20+`)
- **npm** `v9+`

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server (Express + Vite Middleware)
Runs the full-stack server (`server.ts`) on `http://localhost:3000`:
```bash
npm run dev
```

### 3. Build for Production
Compiles TypeScript and bundles the frontend into `dist/`:
```bash
npm run build
```

### 4. Start Production Server
```bash
npm start
```

---

## Demo & Secretariat Login Credentials

Use the **Squad Login** button in the top navigation bar to test both the **Registered Squad Dashboard** and the **Secretariat Admin Panel**:

### 1. Demo Squad Login (`Squad Login` Tab)
| Squad Name | Team ID / Email | Password | Initial Payment Status |
| :--- | :--- | :--- | :--- |
| **Galgotias Test Strikers** *(Demo)* | `GDSL-TEST-01` or `test@gdsl.in` | `test123` | `PAID` (Can be toggled to `PENDING` in Admin Panel) |
| **AeroStriker Galgotias** | `GDSL-26-T101` | `hawks2026` | `VERIFIED` |
| **IIT Delhi Vortex** | `GDSL-26-T102` | `vortex2026` | `VERIFIED` |
| **SRM SkyBlazers** | `GDSL-26-T103` | `phoenix2026` | `PAID` |
| **DTU RotorX** | `GDSL-26-T104` | `hyper2026` | `PENDING` *(Test pending payment & proof upload immediately)* |

### 2. Secretariat Admin Login (`Admin Panel` Tab)
- **Admin Username / Email**: `admin` or `admin@gdsl.in`
- **Admin Password**: `admin2026`

---

## License & Attribution

© 2026 **Galgotias Centre for Drone Intelligence & Simulation (GCDIS)**, Galgotias University, Greater Noida, Uttar Pradesh, India. All rights reserved.
