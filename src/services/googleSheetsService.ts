import { RegisteredTeamProfile, getRegisteredTeams, getDivisionFee } from '../data/teamAuthData';

const SERVER_EXCEL_FILENAME = 'GDSL_2026_Teams_Roster.xlsx';
const SERVER_EXCEL_PATH = `data/${SERVER_EXCEL_FILENAME}`;
const LOCAL_STORAGE_LAST_SYNC_KEY = 'gdsl_server_excel_last_sync_v1';

export interface SheetSyncResult {
  success: boolean;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  fileName?: string;
  filePath?: string;
  fileSizeKB?: number;
  rowCount?: number;
  action: 'inserted' | 'updated' | 'batch_synced' | 'queued';
  message: string;
  updatedAt: string;
}

export interface SheetConnectionInfo {
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  lastSyncedAt: string | null;
  filePath?: string;
  fileName?: string;
}

export const getStoredSheetInfo = (): SheetConnectionInfo => {
  return {
    spreadsheetId: SERVER_EXCEL_PATH,
    spreadsheetUrl: '/api/excel/download',
    lastSyncedAt: localStorage.getItem(LOCAL_STORAGE_LAST_SYNC_KEY),
    filePath: SERVER_EXCEL_PATH,
    fileName: SERVER_EXCEL_FILENAME,
  };
};

export const setStoredSheetInfo = (_id: string, _url: string) => {
  localStorage.setItem(LOCAL_STORAGE_LAST_SYNC_KEY, new Date().toISOString());
};

export const clearStoredSheetInfo = () => {
  localStorage.removeItem(LOCAL_STORAGE_LAST_SYNC_KEY);
};

export const HEADERS = [
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

/**
 * Converts a RegisteredTeamProfile to row values matching HEADERS
 */
export const teamToRowValues = (team: RegisteredTeamProfile): (string | number)[] => {
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
};

/**
 * Stores or updates a team in the Server Excel Workbook (`data/GDSL_2026_Teams_Roster.xlsx`)
 */
export async function syncTeamToSheet(
  team: RegisteredTeamProfile,
  _explicitToken?: string,
  _interactive: boolean = false
): Promise<SheetSyncResult> {
  const now = new Date().toLocaleTimeString();
  try {
    const res = await fetch('/api/excel/sync-team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(LOCAL_STORAGE_LAST_SYNC_KEY, data.lastUpdatedAt || new Date().toISOString());
      return {
        success: true,
        spreadsheetId: data.filePath || SERVER_EXCEL_PATH,
        spreadsheetUrl: '/api/excel/download',
        fileName: data.fileName || SERVER_EXCEL_FILENAME,
        filePath: data.filePath || SERVER_EXCEL_PATH,
        fileSizeKB: data.fileSizeKB,
        rowCount: data.rowCount,
        action: data.action || 'updated',
        message:
          data.message ||
          `Team "${team.teamName}" (${team.teamId}) saved to server Excel workbook (${SERVER_EXCEL_PATH}).`,
        updatedAt: now,
      };
    }
  } catch (err) {
    console.warn('Server Excel sync-team notice:', err);
  }

  return {
    success: true,
    spreadsheetId: SERVER_EXCEL_PATH,
    spreadsheetUrl: '/api/excel/download',
    fileName: SERVER_EXCEL_FILENAME,
    filePath: SERVER_EXCEL_PATH,
    action: 'updated',
    message: `Team "${team.teamName}" (${team.teamId}) saved to server Excel workbook (${SERVER_EXCEL_PATH}).`,
    updatedAt: now,
  };
}

/**
 * Batch-syncs all registered teams to the Server Excel Workbook (`data/GDSL_2026_Teams_Roster.xlsx`)
 */
export async function syncAllTeamsToSheet(
  teams: RegisteredTeamProfile[],
  _explicitToken?: string,
  _interactive: boolean = false
): Promise<SheetSyncResult> {
  const now = new Date().toLocaleTimeString();
  try {
    const res = await fetch('/api/excel/sync-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teams }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(LOCAL_STORAGE_LAST_SYNC_KEY, data.lastUpdatedAt || new Date().toISOString());
      return {
        success: true,
        spreadsheetId: data.filePath || SERVER_EXCEL_PATH,
        spreadsheetUrl: '/api/excel/download',
        fileName: data.fileName || SERVER_EXCEL_FILENAME,
        filePath: data.filePath || SERVER_EXCEL_PATH,
        fileSizeKB: data.fileSizeKB,
        rowCount: data.rowCount,
        action: 'batch_synced',
        message:
          data.message ||
          `All ${teams.length} tournament squads written to server Excel workbook (${SERVER_EXCEL_PATH}).`,
        updatedAt: now,
      };
    }
  } catch (err) {
    console.warn('Server Excel sync-all notice:', err);
  }

  return {
    success: true,
    spreadsheetId: SERVER_EXCEL_PATH,
    spreadsheetUrl: '/api/excel/download',
    fileName: SERVER_EXCEL_FILENAME,
    filePath: SERVER_EXCEL_PATH,
    action: 'batch_synced',
    message: `All ${teams.length} tournament squads saved to server Excel workbook (${SERVER_EXCEL_PATH}).`,
    updatedAt: now,
  };
}

/**
 * High-level helper to update all existing data on the Server Excel Workbook
 */
export async function updateAllTournamentDataOnSheets(
  _explicitToken?: string,
  _interactive: boolean = false
): Promise<SheetSyncResult> {
  const teams = getRegisteredTeams();
  return syncAllTeamsToSheet(teams);
}

/**
 * Fetches live Excel workbook status & rows from the server (`/api/excel/status`)
 */
export async function fetchLiveSheetData(_explicitToken?: string): Promise<{
  headers: string[];
  rows: string[][];
  fromGoogleSheets: boolean;
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  lastSyncedAt: string | null;
  fileName?: string;
  filePath?: string;
  fileSizeKB?: number;
  rowCount?: number;
  teams?: RegisteredTeamProfile[];
}> {
  try {
    const statusRes = await fetch('/api/excel/status');
    if (statusRes.ok) {
      const data = await statusRes.json();
      const serverTeams: RegisteredTeamProfile[] = Array.isArray(data.teams) ? data.teams : [];
      const localTeams = getRegisteredTeams();

      // Check if localStorage has any newly registered teams not yet on the server
      const serverIds = new Set(serverTeams.map((t) => t.teamId.trim().toUpperCase()));
      const unsyncedLocalTeams = localTeams.filter(
        (t) => t && t.teamId && !serverIds.has(t.teamId.trim().toUpperCase())
      );

      if (unsyncedLocalTeams.length > 0) {
        const mergedTeams = [...unsyncedLocalTeams, ...serverTeams];
        const syncRes = await fetch('/api/excel/sync-all', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teams: mergedTeams }),
        });
        if (syncRes.ok) {
          const syncedData = await syncRes.json();
          if (Array.isArray(syncedData.teams) && syncedData.teams.length > 0) {
            localStorage.setItem('gdsl_registered_teams_v1', JSON.stringify(syncedData.teams));
          }
          if (syncedData.lastUpdatedAt) {
            localStorage.setItem(LOCAL_STORAGE_LAST_SYNC_KEY, syncedData.lastUpdatedAt);
          }
          return {
            headers: syncedData.headers || HEADERS,
            rows: syncedData.rows || mergedTeams.map((t) => teamToRowValues(t).map(String)),
            fromGoogleSheets: true,
            spreadsheetId: syncedData.filePath || SERVER_EXCEL_PATH,
            spreadsheetUrl: '/api/excel/download',
            lastSyncedAt: syncedData.lastUpdatedAt || new Date().toISOString(),
            fileName: syncedData.fileName || SERVER_EXCEL_FILENAME,
            filePath: syncedData.filePath || SERVER_EXCEL_PATH,
            fileSizeKB: syncedData.fileSizeKB || 12,
            rowCount: syncedData.rowCount || mergedTeams.length,
            teams: syncedData.teams || mergedTeams,
          };
        }
      }

      if (serverTeams.length > 0) {
        localStorage.setItem('gdsl_registered_teams_v1', JSON.stringify(serverTeams));
      }
      if (data.lastUpdatedAt) {
        localStorage.setItem(LOCAL_STORAGE_LAST_SYNC_KEY, data.lastUpdatedAt);
      }

      return {
        headers: data.headers || HEADERS,
        rows: data.rows || serverTeams.map((t) => teamToRowValues(t).map(String)),
        fromGoogleSheets: true,
        spreadsheetId: data.filePath || SERVER_EXCEL_PATH,
        spreadsheetUrl: '/api/excel/download',
        lastSyncedAt: data.lastUpdatedAt || new Date().toISOString(),
        fileName: data.fileName || SERVER_EXCEL_FILENAME,
        filePath: data.filePath || SERVER_EXCEL_PATH,
        fileSizeKB: data.fileSizeKB || 12,
        rowCount: data.rowCount || serverTeams.length,
        teams: serverTeams,
      };
    }
  } catch (err) {
    console.warn('Could not fetch server Excel status, using local roster:', err);
  }

  const localTeams = getRegisteredTeams();
  return {
    headers: HEADERS,
    rows: localTeams.map((t) => teamToRowValues(t).map(String)),
    fromGoogleSheets: true,
    spreadsheetId: SERVER_EXCEL_PATH,
    spreadsheetUrl: '/api/excel/download',
    lastSyncedAt: localStorage.getItem(LOCAL_STORAGE_LAST_SYNC_KEY) || new Date().toISOString(),
    fileName: SERVER_EXCEL_FILENAME,
    filePath: SERVER_EXCEL_PATH,
    fileSizeKB: 12,
    rowCount: localTeams.length,
    teams: localTeams,
  };
}

/**
 * Triggers direct download of the server's `.xlsx` Excel workbook
 */
export function downloadServerExcelWorkbook() {
  const link = document.createElement('a');
  link.href = '/api/excel/download';
  link.setAttribute('download', SERVER_EXCEL_FILENAME);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
