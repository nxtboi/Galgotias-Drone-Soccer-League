import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSXModule from 'xlsx';
import {
  type RegisteredTeamProfile,
  INITIAL_REGISTERED_TEAMS,
  getDivisionFee,
} from './src/data/teamAuthData.ts';
import { SEED_USER_QUERIES, type UserQuery } from './src/data/userQueriesData.ts';

const XLSX: typeof XLSXModule = (XLSXModule as any).default || XLSXModule;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const EXCEL_FILE_NAME = 'GDSL_2026_Teams_Roster.xlsx';
const EXCEL_FILE_PATH = path.join(DATA_DIR, EXCEL_FILE_NAME);
const TEAMS_JSON_PATH = path.join(DATA_DIR, 'teams_store.json');
const SHEETS_CONFIG_PATH = path.join(DATA_DIR, 'sheets_config.json');
const QUERIES_JSON_PATH = path.join(DATA_DIR, 'queries_store.json');
const SHEET_NAME = 'Registered Teams';

export interface GoogleSheetsConfig {
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  spreadsheetTitle: string;
  lastSyncedAt: string | null;
  autoSyncEnabled: boolean;
}

function readSheetsConfig(): GoogleSheetsConfig {
  ensureDataDirectory();
  if (fs.existsSync(SHEETS_CONFIG_PATH)) {
    try {
      const raw = fs.readFileSync(SHEETS_CONFIG_PATH, 'utf-8');
      return JSON.parse(raw);
    } catch {
      // Fallback
    }
  }
  return {
    spreadsheetId: null,
    spreadsheetUrl: null,
    spreadsheetTitle: 'GDSL 2026 - Registered Teams Roster',
    lastSyncedAt: null,
    autoSyncEnabled: true,
  };
}

function writeSheetsConfig(config: GoogleSheetsConfig) {
  ensureDataDirectory();
  fs.writeFileSync(SHEETS_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

const PENDING_QUEUE_PATH = path.join(DATA_DIR, 'pending_sheets_queue.json');

function readPendingQueue(): RegisteredTeamProfile[] {
  ensureDataDirectory();
  if (fs.existsSync(PENDING_QUEUE_PATH)) {
    try {
      const raw = fs.readFileSync(PENDING_QUEUE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Fallback
    }
  }
  return [];
}

function appendToPendingQueue(team: RegisteredTeamProfile) {
  ensureDataDirectory();
  const queue = readPendingQueue();
  queue.push(team);
  fs.writeFileSync(PENDING_QUEUE_PATH, JSON.stringify(queue, null, 2), 'utf-8');
}

function clearPendingQueue() {
  ensureDataDirectory();
  fs.writeFileSync(PENDING_QUEUE_PATH, JSON.stringify([], null, 2), 'utf-8');
}

function readQueriesStore(): UserQuery[] {
  ensureDataDirectory();
  if (fs.existsSync(QUERIES_JSON_PATH)) {
    try {
      const raw = fs.readFileSync(QUERIES_JSON_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // Fallback
    }
  }
  // Initialize with seed queries if empty
  try {
    fs.writeFileSync(QUERIES_JSON_PATH, JSON.stringify(SEED_USER_QUERIES, null, 2), 'utf-8');
  } catch {
    // Ignore
  }
  return [...SEED_USER_QUERIES];
}

function writeQueriesStore(queries: UserQuery[]) {
  ensureDataDirectory();
  fs.writeFileSync(QUERIES_JSON_PATH, JSON.stringify(queries, null, 2), 'utf-8');
}

export const EXCEL_HEADERS = [
  'Team ID',
  'Team Name',
  'Division',
  'Institution',
  'City',
  'State',
  'Captain Name',
  'Captain Email',
  'Captain Phone',
  'Striker Pilot',
  'Goalkeeper',
  'Defender 1',
  'Defender 2',
  'Pit Mechanic',
  'Drone Model',
  'Control Protocol',
  'VTX Channel / Band',
  'Scrutineering Status',
  'Allocated Pit',
  'Fee Amount',
  'Payment Status',
  'Receipt No',
  'Transaction ID / UTR',
  'Payment Mode',
  'Paid Date',
  'Payer Details',
  'Email Requested To',
  'Registration Date',
  'Faculty Mentor / HOD',
  'Department',
  'Total Students',
  'Last Updated (IST)',
];

function teamToExcelRow(team: RegisteredTeamProfile): (string | number)[] {
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
  const studentsCount = team.attendanceData?.students?.length || 6;
  const faculty = team.attendanceData?.facultyName || 'Pending Dean Endorsement';
  const department = team.attendanceData?.department || 'Aerospace / Robotics';
  const feeAmount = team.paymentInfo?.amount || getDivisionFee(team.division).formatted;

  return [
    team.teamId,
    team.teamName,
    team.division,
    team.institution,
    team.city,
    team.state,
    team.captainName,
    team.captainEmail,
    team.captainPhone,
    team.strikerPilot,
    team.goalkeeper,
    team.defender1,
    team.defender2,
    team.pitMechanic,
    team.droneModel,
    team.controlProtocol,
    team.vtxBand,
    team.scrutineeringStatus,
    team.allocatedPit,
    feeAmount,
    team.paymentInfo?.status || 'VERIFIED',
    team.paymentInfo?.receiptNo || 'PENDING',
    team.paymentInfo?.transactionId || 'PENDING',
    team.paymentInfo?.paymentMode || 'N/A',
    team.paymentInfo?.paidAt || 'N/A',
    team.paymentInfo?.payerDetails || team.captainName,
    team.paymentInfo?.emailRequestedTo || '-',
    team.registeredAt,
    faculty,
    department,
    studentsCount,
    now,
  ];
}

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function writeTeamsToExcelFile(teams: RegisteredTeamProfile[]) {
  ensureDataDirectory();

  // Save full JSON mirror alongside the Excel workbook
  fs.writeFileSync(TEAMS_JSON_PATH, JSON.stringify(teams, null, 2), 'utf-8');

  // Build Excel worksheet rows (Header + Team rows)
  const rows = teams.map(teamToExcelRow);
  const aoa = [EXCEL_HEADERS, ...rows];

  const worksheet = XLSX.utils.aoa_to_sheet(aoa);

  // Set readable column widths on the Excel worksheet
  worksheet['!cols'] = EXCEL_HEADERS.map((header, colIdx) => {
    let maxLen = header.length;
    for (const row of rows) {
      const cellStr = String(row[colIdx] ?? '');
      if (cellStr.length > maxLen) {
        maxLen = Math.min(cellStr.length, 42);
      }
    }
    return { wch: Math.max(maxLen + 3, 14) };
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, SHEET_NAME);

  // Write the .xlsx binary file to disk using buffer + fs.writeFileSync
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  fs.writeFileSync(EXCEL_FILE_PATH, excelBuffer);
  updateAttachedGoogleSheetCsv(teams);
}

const ATTACHED_CSV_PATH = path.join(
  __dirname,
  'public/assets/aistudio/GDSL_2026_-_Galgotias_Drone_Soccer_League__Teams___Rosters__2676c7ff'
);

function updateAttachedGoogleSheetCsv(teams: RegisteredTeamProfile[]) {
  try {
    const csvHeaders = [
      'Team ID',
      'Team Name',
      'Division',
      'Institution',
      'City',
      'State',
      'Captain Name',
      'Captain Email',
      'Captain Phone',
      'Striker Pilot',
      'Goalkeeper',
      'Defender 1',
      'Defender 2',
      'Pit Mechanic',
      'Drone Model',
      'Control Protocol',
      'VTX Channel / Band',
      'Scrutineering Status',
      'Allocated Pit',
      'Payment Status',
      'Receipt No',
      'Registration Date',
      'Faculty Mentor / HOD',
      'Department',
      'Total Students',
      'Last Synchronized',
    ];

    const formatCsvCell = (val: any) => {
      const s = String(val ?? '');
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const rows = teams.map((t) => {
      const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
      return [
        t.teamId,
        t.teamName,
        t.division,
        t.institution,
        t.city,
        t.state,
        t.captainName,
        t.captainEmail,
        t.captainPhone,
        t.strikerPilot,
        t.goalkeeper,
        t.defender1,
        t.defender2,
        t.pitMechanic,
        t.droneModel,
        t.controlProtocol,
        t.vtxBand,
        t.scrutineeringStatus,
        t.allocatedPit,
        t.paymentInfo?.status || 'PENDING',
        t.paymentInfo?.receiptNo || 'PENDING',
        t.registeredAt || 'Nov 06, 2026',
        t.attendanceData?.facultyName || 'Pending Dean Endorsement',
        t.attendanceData?.department || 'Aerospace / Robotics',
        t.attendanceData?.students?.length || 5,
        now,
      ]
        .map(formatCsvCell)
        .join(',');
    });

    const csvContent = [csvHeaders.join(','), ...rows].join('\n');
    fs.writeFileSync(ATTACHED_CSV_PATH, csvContent, 'utf-8');
  } catch (err) {
    console.warn('Could not sync to attached Google Sheet CSV file:', err);
  }
}

function readServerTeams(): RegisteredTeamProfile[] {
  ensureDataDirectory();

  if (fs.existsSync(TEAMS_JSON_PATH)) {
    try {
      const raw = fs.readFileSync(TEAMS_JSON_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (!fs.existsSync(EXCEL_FILE_PATH)) {
          writeTeamsToExcelFile(parsed);
        }
        return parsed;
      }
    } catch (err) {
      console.warn('Error reading teams_store.json, re-seeding:', err);
    }
  }

  // Seed initial teams and write the Excel workbook on server startup
  writeTeamsToExcelFile(INITIAL_REGISTERED_TEAMS);
  return INITIAL_REGISTERED_TEAMS;
}

function getExcelMetadata(teams: RegisteredTeamProfile[]) {
  ensureDataDirectory();
  if (!fs.existsSync(EXCEL_FILE_PATH)) {
    writeTeamsToExcelFile(teams);
  }
  const stats = fs.statSync(EXCEL_FILE_PATH);
  const rows = teams.map((t) => teamToExcelRow(t).map(String));

  return {
    fileName: EXCEL_FILE_NAME,
    filePath: `data/${EXCEL_FILE_NAME}`,
    sheetName: SHEET_NAME,
    fileSizeKB: Math.max(1, Math.round(stats.size / 1024)),
    rowCount: teams.length,
    lastUpdatedAt: stats.mtime.toISOString(),
    headers: EXCEL_HEADERS,
    rows,
    teams,
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Allow larger payloads for base64 receipt proof images
  app.use(express.json({ limit: '15mb' }));

  // Initialize Excel workbook on server startup
  readServerTeams();

  // Health check endpoint for VPS, container orchestration, and uptime monitors
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'gdsl-tournament-portal',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV || 'development',
    });
  });

  // 1. GET /api/excel/status — Inspect server Excel workbook & read rows
  app.get('/api/excel/status', (_req, res) => {
    try {
      const teams = readServerTeams();
      const meta = getExcelMetadata(teams);
      res.json({
        success: true,
        ...meta,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err?.message || 'Failed to read server Excel workbook.',
      });
    }
  });

  // 2. POST /api/excel/sync-team — Upsert a single team into the server Excel sheet
  app.post('/api/excel/sync-team', (req, res) => {
    try {
      const incomingTeam = req.body?.team as RegisteredTeamProfile | undefined;
      if (!incomingTeam || !incomingTeam.teamId) {
        res.status(400).json({ success: false, error: 'Missing valid team payload.' });
        return;
      }

      const currentTeams = readServerTeams();
      const existingIndex = currentTeams.findIndex(
        (t) => t.teamId.trim().toLowerCase() === incomingTeam.teamId.trim().toLowerCase()
      );

      let action: 'inserted' | 'updated';
      let updatedTeams: RegisteredTeamProfile[];

      if (existingIndex >= 0) {
        updatedTeams = [...currentTeams];
        updatedTeams[existingIndex] = incomingTeam;
        action = 'updated';
      } else {
        updatedTeams = [incomingTeam, ...currentTeams];
        action = 'inserted';
      }

      writeTeamsToExcelFile(updatedTeams);
      appendToPendingQueue(incomingTeam);
      const meta = getExcelMetadata(updatedTeams);

      res.json({
        success: true,
        action,
        message: `Team "${incomingTeam.teamName}" (${incomingTeam.teamId}) ${action} in server Excel sheet (${meta.filePath}).`,
        ...meta,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err?.message || 'Failed to write team to server Excel workbook.',
      });
    }
  });

  // 3. POST /api/excel/sync-all — Write full list of teams into the server Excel sheet
  app.post('/api/excel/sync-all', (req, res) => {
    try {
      const incomingTeams = req.body?.teams as RegisteredTeamProfile[] | undefined;
      const currentTeams = readServerTeams();

      // Merge incomingTeams with currentTeams by teamId so no server teams are lost
      let finalTeams: RegisteredTeamProfile[];
      if (Array.isArray(incomingTeams) && incomingTeams.length > 0) {
        const mergedMap = new Map<string, RegisteredTeamProfile>();
        for (const t of currentTeams) {
          mergedMap.set(t.teamId.trim().toUpperCase(), t);
        }
        for (const t of incomingTeams) {
          if (t && t.teamId) {
            mergedMap.set(t.teamId.trim().toUpperCase(), t);
          }
        }
        finalTeams = Array.from(mergedMap.values());
      } else {
        finalTeams = currentTeams;
      }

      writeTeamsToExcelFile(finalTeams);
      const meta = getExcelMetadata(finalTeams);

      res.json({
        success: true,
        action: 'batch_synced',
        message: `Saved all ${finalTeams.length} tournament squads to server Excel workbook (${meta.filePath}).`,
        ...meta,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err?.message || 'Failed to sync teams to server Excel workbook.',
      });
    }
  });

  // 4. GET /api/excel/download — Download the live .xlsx file directly from the server
  app.get('/api/excel/download', (_req, res) => {
    try {
      const teams = readServerTeams();
      if (!fs.existsSync(EXCEL_FILE_PATH)) {
        writeTeamsToExcelFile(teams);
      }
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${EXCEL_FILE_NAME}"`
      );
      const fileStream = fs.createReadStream(EXCEL_FILE_PATH);
      fileStream.pipe(res);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err?.message || 'Failed to download server Excel file.',
      });
    }
  });

  // 5. GET /api/sheets/config — Retrieve current Google Sheets integration config
  app.get('/api/sheets/config', (_req, res) => {
    try {
      const config = readSheetsConfig();
      res.json({ success: true, config });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Failed to read Google Sheets config.' });
    }
  });

  // 6. POST /api/sheets/config — Update Google Sheets integration config
  app.post('/api/sheets/config', (req, res) => {
    try {
      const current = readSheetsConfig();
      const updated: GoogleSheetsConfig = {
        ...current,
        ...(req.body || {}),
      };
      writeSheetsConfig(updated);
      res.json({ success: true, config: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Failed to update Google Sheets config.' });
    }
  });

  // 7. POST /api/sheets/mark-synced — Update last synced timestamp
  app.post('/api/sheets/mark-synced', (req, res) => {
    try {
      const current = readSheetsConfig();
      const updated: GoogleSheetsConfig = {
        ...current,
        lastSyncedAt: new Date().toISOString(),
        ...(req.body?.spreadsheetId ? { spreadsheetId: req.body.spreadsheetId } : {}),
        ...(req.body?.spreadsheetUrl ? { spreadsheetUrl: req.body.spreadsheetUrl } : {}),
      };
      writeSheetsConfig(updated);
      res.json({ success: true, config: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Failed to mark Google Sheet as synced.' });
    }
  });

  // 8. GET /api/sheets/pending — Fetch queued registrations waiting to be appended to Google Sheet
  app.get('/api/sheets/pending', (_req, res) => {
    try {
      const queue = readPendingQueue();
      res.json({ success: true, pendingTeams: queue });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Failed to read pending queue.' });
    }
  });

  // 9. POST /api/sheets/pending/clear — Clear queue once flushed to Google Sheet
  app.post('/api/sheets/pending/clear', (_req, res) => {
    try {
      clearPendingQueue();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Failed to clear pending queue.' });
    }
  });

  // 10. GET /api/queries — Fetch all inquiries submitted by users
  app.get('/api/queries', (_req, res) => {
    try {
      const queries = readQueriesStore();
      res.json({ success: true, queries });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Failed to read queries.' });
    }
  });

  // 11. POST /api/queries — Save new user inquiry
  app.post('/api/queries', (req, res) => {
    try {
      const current = readQueriesStore();
      const newQuery = req.body as UserQuery;
      if (!newQuery || !newQuery.email || !newQuery.message) {
        return res.status(400).json({ success: false, error: 'Query requires email and message.' });
      }
      const updated = [newQuery, ...current.filter((q) => q.id !== newQuery.id)];
      writeQueriesStore(updated);
      res.json({ success: true, query: newQuery });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Failed to save query.' });
    }
  });

  // 12. PATCH /api/queries/:id — Update inquiry status or admin notes
  app.patch('/api/queries/:id', (req, res) => {
    try {
      const { id } = req.params;
      const current = readQueriesStore();
      const updated = current.map((q) => {
        if (q.id === id) {
          return { ...q, ...req.body };
        }
        return q;
      });
      writeQueriesStore(updated);
      res.json({ success: true, queries: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Failed to update query.' });
    }
  });

  // 13. DELETE /api/queries/:id — Delete inquiry
  app.delete('/api/queries/:id', (req, res) => {
    try {
      const { id } = req.params;
      const current = readQueriesStore();
      const updated = current.filter((q) => q.id !== id);
      writeQueriesStore(updated);
      res.json({ success: true, queries: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Failed to delete query.' });
    }
  });

  // Serve static public folder with byte-range support for video streaming & static assets
  app.use(express.static(path.join(__dirname, 'public')));

  // Vite middleware for development or static serving for production
  const distPath = path.join(__dirname, 'dist');
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`GDSL Server & Excel Engine running on http://0.0.0.0:${PORT}`);
    console.log(`Server Excel Sheet stored at: ${EXCEL_FILE_PATH}`);
  });

  const handleShutdown = (signal: string) => {
    console.log(`\n[${signal}] Initiating graceful shutdown...`);
    server.close(() => {
      console.log('HTTP server closed cleanly. Exiting process.');
      process.exit(0);
    });

    // Force shutdown if connections do not close in 10s
    setTimeout(() => {
      console.error('Forced shutdown: open connections did not drain in time.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

startServer();
