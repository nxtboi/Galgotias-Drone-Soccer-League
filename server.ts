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

const XLSX: typeof XLSXModule = (XLSXModule as any).default || XLSXModule;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const EXCEL_FILE_NAME = 'GDSL_2026_Teams_Roster.xlsx';
const EXCEL_FILE_PATH = path.join('/tmp', EXCEL_FILE_NAME);
const TEAMS_JSON_PATH = path.join(DATA_DIR, 'teams_store.json');
const SHEET_NAME = 'Registered Teams';

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

  // Serve public assets (including hero video) with full HTTP byte-range support
  app.use(
    express.static(path.join(__dirname, 'public'), {
      acceptRanges: true,
      maxAge: 0,
    })
  );

  // Initialize Excel workbook on server startup
  readServerTeams();

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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GDSL Server & Excel Engine running on http://0.0.0.0:${PORT}`);
    console.log(`Server Excel Sheet stored at: ${EXCEL_FILE_PATH}`);
  });
}

startServer();
