import './server/loadEnv.ts';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSXModule from 'xlsx';
import { type RegisteredTeamProfile, getDivisionFee } from './src/data/teamAuthData.ts';
import { INITIAL_REGISTERED_TEAMS } from './server/seedTeams.ts';
import {
  createToken,
  getAuth,
  requireAdmin,
  checkAdminCredentials,
  isAdminIdentifier,
  findTeamForLogin,
  isRateLimited,
  recordFailure,
  clearFailures,
  applyTeamEditRules,
  applyNewRegistrationRules,
  withoutAccessCode,
  resolveAccessCode,
  hashPlainTextPasswords,
  MIN_TEAM_PASSWORD_LENGTH,
  createGoogleSignupToken,
  verifyGoogleSignupToken,
  getActiveAdmin,
  requireSuperAdmin,
} from './server/auth.ts';
import {
  AdminError,
  SUPER_ADMIN_ID,
  authenticateAdmin,
  createAdmin,
  deleteAdmin,
  findActiveAdminById,
  findAdminByIdentifier,
  readAdmins,
  recordAdminLogin,
  requestAdminAccess,
  toPublicAdmin,
  updateAdmin,
} from './server/admins.ts';
import { isEmailConfigured, sendPaymentDetailsEmail, verifyEmailTransport } from './server/mailer.ts';
import { getGooglePublicConfig, verifyGoogleCredential, GoogleAuthError } from './server/googleAuth.ts';
import type { UserQuery } from './src/data/userQueriesData.ts';
import { SEED_USER_QUERIES } from './server/seedQueries.ts';


/**
 * Error text that is safe to send to a browser: messages written for users (admin and Google
 * sign-in errors) pass through; anything else (file-system errors, stack details) is logged
 * on the server and replaced with a generic message.
 */
function safeError(err: unknown, fallback: string): string {
  if (err instanceof AdminError || err instanceof GoogleAuthError) return err.message;
  console.error('[server]', fallback, err);
  return fallback;
}

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
  queue.push(withoutAccessCode(team));
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
      // An empty list is valid (deleted queries must not come back as demo data)
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Fallback
    }
  }
  // First start: demo queries in development only
  const seed = process.env.NODE_ENV === 'production' ? [] : [...SEED_USER_QUERIES];
  try {
    fs.writeFileSync(QUERIES_JSON_PATH, JSON.stringify(seed, null, 2), 'utf-8');
  } catch {
    // Ignore
  }
  return seed;
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

function writeTeamsToExcelFile(inputTeams: RegisteredTeamProfile[]) {
  ensureDataDirectory();

  // Never persist a plain-text team password: hash anything that isn't hashed yet.
  const { teams } = hashPlainTextPasswords(inputTeams);

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

// Kept in data/ (NOT public/) because it contains captain emails and phone numbers.
// Admins download it through GET /api/excel/csv.
const ATTACHED_CSV_PATH = path.join(DATA_DIR, 'GDSL_2026_Teams_Roster.csv');

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
      // An empty list is a valid state (e.g. a fresh live server) and must not be re-seeded.
      if (Array.isArray(parsed)) {
        if (!fs.existsSync(EXCEL_FILE_PATH)) {
          writeTeamsToExcelFile(parsed);
        }
        return parsed;
      }
    } catch (err) {
      console.warn('Error reading teams_store.json, re-seeding:', err);
    }
  }

  // First start: demo teams in development only. A live (production) server starts empty,
  // because the demo teams' passwords are in the source code.
  const seed = process.env.NODE_ENV === 'production' ? [] : INITIAL_REGISTERED_TEAMS;
  writeTeamsToExcelFile(seed);
  return seed;
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
    // Password hashes never leave the server, not even to admins.
    teams: teams.map(withoutAccessCode),
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Allow larger payloads for base64 receipt proof images
  app.use(express.json({ limit: '15mb' }));
  app.disable('x-powered-by');
  // Browser security headers on every response
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    // Allows the Google sign-in popup to report back to this page
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
    }
    next();
  });
  // Never serve private project files, in any mode. (In development the Vite dev server would
  // otherwise serve raw files such as data/teams_store.json, data/admins.json or server code.)
  app.use((req, res, next) => {
    let p: string;
    try {
      p = decodeURIComponent(req.path).replace(/\\/g, '/').toLowerCase();
    } catch {
      res.status(400).end();
      return;
    }
    if (
      /^\/(data|server|\.git|\.claude)(\/|$)/.test(p) ||
      /^\/\.env/.test(p) ||
      /^\/(server\.ts|package(-lock)?\.json|docker-compose\.yml|dockerfile|ecosystem\.config\.cjs|nginx\.conf|deploy-vps\.sh|tsconfig\.json|vite\.config\.ts|vps_deployment\.md|readme\.md)$/.test(p)
    ) {
      res.status(404).end();
      return;
    }
    next();
  });
  // Behind Nginx (same host or Docker network): take the client IP from X-Forwarded-For
  // only when the request comes from a local proxy, so login rate limiting can't be spoofed.
  app.set('trust proxy', 'loopback, uniquelocal');

  void verifyEmailTransport();

  // Initialize Excel workbook on server startup, and hash any plain-text
  // passwords left over from older versions of the portal.
  {
    const startupTeams = readServerTeams();
    const { changed } = hashPlainTextPasswords(startupTeams);
    if (changed > 0) {
      writeTeamsToExcelFile(startupTeams);
      console.log(`[auth] Hashed ${changed} plain-text team password(s) in data/teams_store.json`);
    }
  }

  // Health check endpoint for VPS, container orchestration, and uptime monitors
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'gdsl-tournament-portal',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  // AUTH: POST /api/auth/login — checks admin or team credentials on the server
  app.post('/api/auth/login', (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (isRateLimited(ip)) {
      res.status(429).json({ success: false, error: 'Too many failed sign-in attempts. Please wait 15 minutes and try again.' });
      return;
    }
    const identifier = String(req.body?.identifier || '').slice(0, 200);
    const password = String(req.body?.password || '').slice(0, 200);
    if (!identifier.trim() || !password.trim()) {
      res.status(400).json({ success: false, error: 'Please enter your Team ID / email and password.' });
      return;
    }

    // 1. Super admin (from .env)
    if (isAdminIdentifier(identifier)) {
      if (checkAdminCredentials(identifier, password)) {
        clearFailures(ip);
        res.json({
          success: true,
          role: 'admin',
          adminRole: 'super_admin',
          name: 'Super Admin',
          token: createToken({ role: 'admin', adminId: SUPER_ADMIN_ID, adminRole: 'super_admin' }),
        });
        return;
      }
    } else {
      // 2. Registered / approved admins (data/admins.json) — must be active.
      // A wrong password falls through to the team check, so a fake admin request that reuses
      // a captain's email can't block that captain's login.
      const adminAccount = findAdminByIdentifier(identifier);
      if (adminAccount) {
        try {
          const account = authenticateAdmin(adminAccount, password);
          clearFailures(ip);
          recordAdminLogin(account.id);
          res.json({
            success: true,
            role: 'admin',
            adminRole: 'admin',
            name: account.name,
            token: createToken({ role: 'admin', adminId: account.id, adminRole: 'admin' }),
          });
          return;
        } catch (err: any) {
          if (err instanceof AdminError && err.status === 403) {
            res.status(403).json({ success: false, error: err.message });
            return;
          }
        }
      }

      // 3. Teams
      const team = findTeamForLogin(readServerTeams(), identifier, password);
      if (team) {
        clearFailures(ip);
        res.json({
          success: true,
          role: 'team',
          token: createToken({ role: 'team', teamId: team.teamId }),
          team: withoutAccessCode(team),
        });
        return;
      }
    }

    recordFailure(ip);
    res.status(401).json({ success: false, error: 'Incorrect Team ID / email or password.' });
  });

  // AUTH: GET /api/auth/google/config — lets the browser hide the Google button when not configured
  app.get('/api/auth/google/config', (_req, res) => {
    res.json(getGooglePublicConfig());
  });

  // AUTH: POST /api/auth/google — "Continue with Google" for team leaders (captains) only.
  // Existing leader -> signed in to their team. New leader -> short-lived signup token used to
  // register a team whose captain email is locked to the verified Google address.
  app.post('/api/auth/google', async (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (isRateLimited(ip)) {
      res.status(429).json({ success: false, error: 'Too many failed sign-in attempts. Please wait 15 minutes and try again.' });
      return;
    }
    const credential = typeof req.body?.credential === 'string' ? req.body.credential.trim() : '';
    if (!credential || credential.length > 8192) {
      res.status(400).json({ success: false, error: 'Missing Google credential.' });
      return;
    }

    let identity;
    try {
      identity = await verifyGoogleCredential(credential);
    } catch (err: any) {
      recordFailure(ip);
      const status = err instanceof GoogleAuthError ? err.status : 401;
      res.status(status).json({ success: false, error: safeError(err, 'Google sign-in failed. Please try again.') });
      return;
    }

    const teams = readServerTeams();
    let index = teams.findIndex((t) => t.captainGoogleSub === identity.sub);
    if (index < 0) {
      const byEmail = teams
        .map((t, i) => ({ t, i }))
        .filter(({ t }) => (t.captainEmail || '').trim().toLowerCase() === identity.email);
      if (byEmail.length > 1) {
        res.status(409).json({
          success: false,
          error: 'More than one team uses this captain email. Please sign in with your Team ID and password.',
        });
        return;
      }
      if (byEmail.length === 1) {
        const match = byEmail[0];
        if (match.t.captainGoogleSub && match.t.captainGoogleSub !== identity.sub) {
          res.status(403).json({ success: false, error: 'A different Google account is already linked to this team.' });
          return;
        }
        // Google has proved ownership of the captain email: link this Google account to the team.
        index = match.i;
        const updatedTeams = [...teams];
        updatedTeams[index] = { ...match.t, captainGoogleSub: identity.sub };
        writeTeamsToExcelFile(updatedTeams);
        teams[index] = updatedTeams[index];
      }
    }

    clearFailures(ip);
    if (index >= 0) {
      const team = teams[index];
      res.json({
        success: true,
        status: 'signed_in',
        role: 'team',
        token: createToken({ role: 'team', teamId: team.teamId }),
        team: withoutAccessCode(team),
      });
      return;
    }

    res.json({
      success: true,
      status: 'new_leader',
      signupToken: createGoogleSignupToken(identity),
      profile: { email: identity.email, name: identity.name },
    });
  });

  // ADMINS: public request for admin access (stays pending until the super admin approves it)
  app.post('/api/admins/request', (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (isRateLimited(ip)) {
      res.status(429).json({ success: false, error: 'Too many attempts. Please wait 15 minutes and try again.' });
      return;
    }
    try {
      requestAdminAccess(req.body || {});
      recordFailure(ip); // counts toward the per-IP limit so the form can't be spammed
      res.json({ success: true, message: 'Request sent. You can sign in once the super admin approves it.' });
    } catch (err: any) {
      res.status(err instanceof AdminError ? err.status : 500).json({ success: false, error: safeError(err, 'Request failed.') });
    }
  });

  // ADMINS: super admin manages admin accounts
  app.get('/api/admins', requireSuperAdmin, (_req, res) => {
    res.json({ success: true, admins: readAdmins().map(toPublicAdmin) });
  });

  app.post('/api/admins', requireSuperAdmin, (req, res) => {
    try {
      const account = createAdmin(req.body || {});
      res.json({ success: true, admin: toPublicAdmin(account) });
    } catch (err: any) {
      res.status(err instanceof AdminError ? err.status : 500).json({ success: false, error: safeError(err, 'Could not create admin.') });
    }
  });

  app.patch('/api/admins/:id', requireSuperAdmin, (req, res) => {
    try {
      const account = updateAdmin(String(req.params.id), {
        status: req.body?.status,
        password: req.body?.password,
      });
      res.json({ success: true, admin: toPublicAdmin(account) });
    } catch (err: any) {
      res.status(err instanceof AdminError ? err.status : 500).json({ success: false, error: safeError(err, 'Could not update admin.') });
    }
  });

  app.delete('/api/admins/:id', requireSuperAdmin, (req, res) => {
    try {
      deleteAdmin(String(req.params.id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(err instanceof AdminError ? err.status : 500).json({ success: false, error: safeError(err, 'Could not remove admin.') });
    }
  });

  // AUTH: GET /api/auth/me — who does this token belong to?
  app.get('/api/auth/me', (req, res) => {
    const auth = getAuth(req);
    if (!auth) {
      res.status(401).json({ success: false, error: 'Not signed in.' });
      return;
    }
    if (auth.role === 'admin') {
      const admin = getActiveAdmin(req);
      if (!admin) {
        res.status(401).json({ success: false, error: 'This admin session is no longer valid.' });
        return;
      }
      const account = admin.adminId === SUPER_ADMIN_ID ? null : findActiveAdminById(admin.adminId);
      res.json({
        success: true,
        role: 'admin',
        adminRole: admin.adminRole,
        name: account ? account.name : 'Super Admin',
      });
      return;
    }
    const team = readServerTeams().find((t) => t.teamId === auth.teamId);
    if (!team) {
      res.status(401).json({ success: false, error: 'Team no longer exists.' });
      return;
    }
    res.json({ success: true, role: 'team', team: withoutAccessCode(team) });
  });

  // 1. GET /api/excel/status — Workbook metadata. Team rows only for the signed-in team (own row) or admin (all).
  app.get('/api/excel/status', (req, res) => {
    try {
      const auth = getAuth(req);
      const allTeams = readServerTeams();
      const meta = getExcelMetadata(allTeams);
      if (getActiveAdmin(req)) {
        res.json({ success: true, ...meta });
        return;
      }
      if (auth?.role === 'team') {
        // A team sees only its own record
        res.json({ success: true, teams: allTeams.filter((t) => t.teamId === auth.teamId).map(withoutAccessCode) });
        return;
      }
      // Anonymous visitors get nothing about the roster (not even how many teams exist)
      res.json({ success: true, teams: [] });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: safeError(err, 'Failed to read server Excel workbook.'),
      });
    }
  });

  const registrationLog = new Map<string, number[]>();
  const REGISTRATIONS_PER_IP_PER_HOUR = 10;

  // 2. POST /api/excel/sync-team — Upsert a single team into the server Excel sheet
  app.post('/api/excel/sync-team', (req, res) => {
    try {
      const incomingTeam = req.body?.team as RegisteredTeamProfile | undefined;
      if (!incomingTeam || !incomingTeam.teamId) {
        res.status(400).json({ success: false, error: 'Missing valid team payload.' });
        return;
      }

      const auth = getAuth(req);
      const currentTeams = readServerTeams();
      const existingIndex = currentTeams.findIndex(
        (t) => t.teamId.trim().toLowerCase() === incomingTeam.teamId.trim().toLowerCase()
      );

      let action: 'inserted' | 'updated';
      let updatedTeams: RegisteredTeamProfile[];
      let savedTeam: RegisteredTeamProfile;
      let newToken: string | undefined;

      if (existingIndex >= 0) {
        const existing = currentTeams[existingIndex];
        if (getActiveAdmin(req)) {
          // Admin may reset the password by sending a new one; blank keeps the current hash.
          savedTeam = {
            ...existing,
            ...incomingTeam,
            captainGoogleSub: existing.captainGoogleSub,
            captainGoogleLinked: undefined,
            accessCode: resolveAccessCode(existing.accessCode, incomingTeam.accessCode),
          };
        } else if (auth?.role === 'team' && auth.teamId === existing.teamId) {
          savedTeam = applyTeamEditRules(existing, incomingTeam);
        } else if (!auth) {
          // Not signed in: this is a new registration whose random Team ID is already taken
          res.status(409).json({
            success: false,
            code: 'TEAM_ID_TAKEN',
            error: 'This Team ID is already registered. Sign in as this team to update it.',
          });
          return;
        } else {
          res.status(401).json({ success: false, error: 'Sign in as this team (or as admin) to update it.' });
          return;
        }
        updatedTeams = [...currentTeams];
        updatedTeams[existingIndex] = savedTeam;
        action = 'updated';
      } else {
        // New public registration (limited per visitor so the roster can't be spammed)
        if (!getActiveAdmin(req)) {
          const ip = req.ip || req.socket.remoteAddress || 'unknown';
          const now = Date.now();
          const recent = (registrationLog.get(ip) || []).filter((t) => now - t < 60 * 60 * 1000);
          if (recent.length >= REGISTRATIONS_PER_IP_PER_HOUR) {
            res.status(429).json({ success: false, error: 'Too many registrations from this network. Please try again later.' });
            return;
          }
          recent.push(now);
          registrationLog.set(ip, recent);
        }
        if (!/^[A-Za-z0-9-]{4,40}$/.test(incomingTeam.teamId.trim())) {
          res.status(400).json({ success: false, error: 'Invalid Team ID.' });
          return;
        }
        // Only the two real divisions are accepted (a missing one used to break every later save)
        const division = String(incomingTeam.division || '');
        if (division !== 'Class 20 (200mm)' && division !== 'Class 40 (400mm)') {
          res.status(400).json({ success: false, error: 'Please choose a valid division.' });
          return;
        }
        if (!String(incomingTeam.teamName || '').trim()) {
          res.status(400).json({ success: false, error: 'Team name is required.' });
          return;
        }
        // Leader who signed up with Google: lock the captain email to the verified Google address
        let googleLeader: { sub: string; email: string; name: string } | null = null;
        if (req.body?.googleSignupToken !== undefined) {
          googleLeader = verifyGoogleSignupToken(req.body.googleSignupToken);
          if (!googleLeader) {
            res.status(401).json({ success: false, error: 'Your Google sign-in has expired. Please continue with Google again.' });
            return;
          }
          if (currentTeams.some((t) => t.captainGoogleSub === googleLeader!.sub)) {
            res.status(409).json({ success: false, error: 'This Google account already leads a registered team. Please sign in instead.' });
            return;
          }
        }
        if (!incomingTeam.accessCode || incomingTeam.accessCode.trim().length < MIN_TEAM_PASSWORD_LENGTH) {
          res.status(400).json({
            success: false,
            error: `A squad password of at least ${MIN_TEAM_PASSWORD_LENGTH} characters is required.`,
          });
          return;
        }
        const hashed: RegisteredTeamProfile = {
          ...incomingTeam,
          accessCode: resolveAccessCode('', incomingTeam.accessCode),
          captainGoogleLinked: undefined,
          // Only a verified Google signup token can set the Google link
          captainGoogleSub: googleLeader ? googleLeader.sub : undefined,
          ...(googleLeader
            ? { captainEmail: googleLeader.email, captainName: incomingTeam.captainName?.trim() || googleLeader.name }
            : {}),
        };
        savedTeam = getActiveAdmin(req) ? hashed : applyNewRegistrationRules(hashed);
        updatedTeams = [savedTeam, ...currentTeams];
        action = 'inserted';
        if (!getActiveAdmin(req)) {
          newToken = createToken({ role: 'team', teamId: savedTeam.teamId });
        }
      }

      writeTeamsToExcelFile(updatedTeams);
      appendToPendingQueue(savedTeam);

      res.json({
        success: true,
        action,
        message: `Team "${savedTeam.teamName}" (${savedTeam.teamId}) ${action} on the server.`,
        team: withoutAccessCode(savedTeam),
        ...(newToken ? { token: newToken } : {}),
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: safeError(err, 'Failed to write team to server Excel workbook.'),
      });
    }
  });

  // 3. POST /api/excel/sync-all — Write full list of teams into the server Excel sheet
  app.post('/api/excel/sync-all', requireAdmin, (req, res) => {
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
            const key = t.teamId.trim().toUpperCase();
            const existing = mergedMap.get(key);
            // Browsers never hold password hashes, so keep the stored one unless a new password was typed.
            mergedMap.set(key, { ...t, accessCode: resolveAccessCode(existing?.accessCode, t.accessCode) });
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
        error: safeError(err, 'Failed to sync teams to server Excel workbook.'),
      });
    }
  });

  // 4. GET /api/excel/download — Download the live .xlsx file directly from the server
  app.get('/api/excel/download', requireAdmin, (_req, res) => {
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
        error: safeError(err, 'Failed to download server Excel file.'),
      });
    }
  });

  // PAYMENTS: POST /api/payments/request-details — a team asks for the fee payment details.
  // The request is always recorded (status "PAYMENT REQUESTED" + the address), which admins see
  // in the dashboard and Excel. If email is configured, the details are also emailed from the
  // single official address (MAIL_FROM); otherwise the secretariat sends them manually.
  const paymentRequestLog = new Map<string, number[]>();
  const PAYMENT_REQUESTS_PER_HOUR = 5;
  app.post('/api/payments/request-details', async (req, res) => {
    const auth = getAuth(req);
    if (!auth || auth.role !== 'team' || !auth.teamId) {
      res.status(401).json({ success: false, error: 'Please sign in to your team dashboard first.' });
      return;
    }

    const to = String(req.body?.email || '').trim().toLowerCase();
    // One plain address only
    if (to.length > 200 || !/^[^\s@,;<>"'()\\]+@[^\s@,;<>"'()\\]+\.[A-Za-z]{2,}$/.test(to)) {
      res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
      return;
    }

    const now = Date.now();
    const recent = (paymentRequestLog.get(auth.teamId) || []).filter((t) => now - t < 60 * 60 * 1000);
    if (recent.length >= PAYMENT_REQUESTS_PER_HOUR) {
      res.status(429).json({
        success: false,
        error: 'You have already requested payment details several times in the last hour. The secretariat will email you within 24 hours.',
      });
      return;
    }

    const teams = readServerTeams();
    const index = teams.findIndex((t) => t.teamId === auth.teamId);
    if (index < 0) {
      res.status(404).json({ success: false, error: 'Team not found.' });
      return;
    }
    const team = teams[index];

    const requestedAt = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const status = String(team.paymentInfo?.status || 'PENDING').toUpperCase();
    const updated: RegisteredTeamProfile = {
      ...team,
      paymentInfo: {
        ...team.paymentInfo,
        // Don't move a PAID / VERIFIED team back to "requested"
        status: status === 'PENDING' ? 'PAYMENT REQUESTED' : team.paymentInfo.status,
        emailRequestedTo: to,
        emailRequestedAt: `${requestedAt} IST`,
      },
    };
    const updatedTeams = [...teams];
    updatedTeams[index] = updated;
    writeTeamsToExcelFile(updatedTeams);
    recent.push(now);
    paymentRequestLog.set(auth.teamId, recent);

    let emailSent = false;
    if (isEmailConfigured()) {
      const portalUrl =
        process.env.PUBLIC_URL && !process.env.PUBLIC_URL.includes('example.com')
          ? process.env.PUBLIC_URL
          : `${req.protocol}://${req.get('host')}`;
      try {
        await sendPaymentDetailsEmail(updated, to, portalUrl);
        emailSent = true;
        console.log(`[payments] ${team.teamId}: payment details emailed to ${to}`);
      } catch (err: any) {
        console.error(`[payments] ${team.teamId}: email to ${to} failed (${err?.message || err}); send manually`);
      }
    } else {
      console.log(`[payments] ${team.teamId} requested payment details at ${to} (email not configured: send manually)`);
    }
    res.json({ success: true, requestedTo: to, emailSent, team: withoutAccessCode(updated) });
  });

  // 4b. GET /api/excel/csv — Admin download of the CSV mirror of the roster
  app.get('/api/excel/csv', requireAdmin, (_req, res) => {
    try {
      updateAttachedGoogleSheetCsv(readServerTeams());
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="GDSL_2026_Teams_Roster.csv"');
      fs.createReadStream(ATTACHED_CSV_PATH).pipe(res);
    } catch (err: any) {
      res.status(500).json({ success: false, error: safeError(err, 'Failed to build CSV.') });
    }
  });

  // 5. GET /api/sheets/config — Retrieve current Google Sheets integration config
  app.get('/api/sheets/config', requireAdmin, (_req, res) => {
    try {
      const config = readSheetsConfig();
      res.json({ success: true, config });
    } catch (err: any) {
      res.status(500).json({ success: false, error: safeError(err, 'Failed to read Google Sheets config.') });
    }
  });

  // 6. POST /api/sheets/config — Update Google Sheets integration config
  app.post('/api/sheets/config', requireAdmin, (req, res) => {
    try {
      const current = readSheetsConfig();
      const updated: GoogleSheetsConfig = {
        ...current,
        ...(req.body || {}),
      };
      writeSheetsConfig(updated);
      res.json({ success: true, config: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: safeError(err, 'Failed to update Google Sheets config.') });
    }
  });

  // 7. POST /api/sheets/mark-synced — Update last synced timestamp
  app.post('/api/sheets/mark-synced', requireAdmin, (req, res) => {
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
      res.status(500).json({ success: false, error: safeError(err, 'Failed to mark Google Sheet as synced.') });
    }
  });

  // 8. GET /api/sheets/pending — Fetch queued registrations waiting to be appended to Google Sheet
  app.get('/api/sheets/pending', requireAdmin, (_req, res) => {
    try {
      const queue = readPendingQueue();
      res.json({ success: true, pendingTeams: queue });
    } catch (err: any) {
      res.status(500).json({ success: false, error: safeError(err, 'Failed to read pending queue.') });
    }
  });

  // 9. POST /api/sheets/pending/clear — Clear queue once flushed to Google Sheet
  app.post('/api/sheets/pending/clear', requireAdmin, (_req, res) => {
    try {
      clearPendingQueue();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: safeError(err, 'Failed to clear pending queue.') });
    }
  });

  // 10. GET /api/queries — Fetch all inquiries submitted by users
  app.get('/api/queries', requireAdmin, (_req, res) => {
    try {
      const queries = readQueriesStore();
      res.json({ success: true, queries });
    } catch (err: any) {
      res.status(500).json({ success: false, error: safeError(err, 'Failed to read queries.') });
    }
  });

  // 11. POST /api/queries — Save new user inquiry
  app.post('/api/queries', (req, res) => {
    try {
      const current = readQueriesStore();
      const body = (req.body || {}) as Partial<UserQuery>;
      const clip = (v: unknown, max: number) => String(v ?? '').slice(0, max);
      if (!body.email || !body.message) {
        return res.status(400).json({ success: false, error: 'Query requires email and message.' });
      }
      // Public submissions: only whitelisted fields, status forced to UNREAD, and an existing
      // inquiry can never be overwritten by re-using its id.
      const requestedId = clip(body.id, 60);
      const id =
        /^[A-Za-z0-9-]{4,60}$/.test(requestedId) && !current.some((q) => q.id === requestedId)
          ? requestedId
          : `GDSL-QRY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const priority = body.priority === 'HIGH' || body.priority === 'URGENT' ? body.priority : 'NORMAL';
      const newQuery: UserQuery = {
        id,
        name: clip(body.name, 120),
        email: clip(body.email, 200),
        institution: clip(body.institution, 200),
        topic: clip(body.topic, 120),
        subject: clip(body.subject, 300),
        message: clip(body.message, 5000),
        submittedAt: new Date().toISOString(),
        status: 'UNREAD',
        priority,
      };
      const updated = [newQuery, ...current];
      writeQueriesStore(updated);
      res.json({ success: true, query: newQuery });
    } catch (err: any) {
      res.status(500).json({ success: false, error: safeError(err, 'Failed to save query.') });
    }
  });

  // 12. PATCH /api/queries/:id — Update inquiry status or admin notes
  app.patch('/api/queries/:id', requireAdmin, (req, res) => {
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
      res.status(500).json({ success: false, error: safeError(err, 'Failed to update query.') });
    }
  });

  // 13. DELETE /api/queries/:id — Delete inquiry
  app.delete('/api/queries/:id', requireAdmin, (req, res) => {
    try {
      const { id } = req.params;
      const current = readQueriesStore();
      const updated = current.filter((q) => q.id !== id);
      writeQueriesStore(updated);
      res.json({ success: true, queries: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: safeError(err, 'Failed to delete query.') });
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
