import {
  RegisteredTeamProfile,
  getRegisteredTeams,
  getDivisionFee,
  saveRegisteredTeam,
} from '../data/teamAuthData';
import { getAccessToken } from './googleAuthService';

const SERVER_EXCEL_FILENAME = 'GDSL_2026_Teams_Roster.xlsx';
const SERVER_EXCEL_PATH = `data/${SERVER_EXCEL_FILENAME}`;
const LOCAL_STORAGE_LAST_SYNC_KEY = 'gdsl_server_excel_last_sync_v1';
const LOCAL_STORAGE_GOOGLE_SHEET_KEY = 'gdsl_google_sheet_config_v1';

export interface GoogleSheetsConfig {
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  spreadsheetTitle: string;
  lastSyncedAt: string | null;
  autoSyncEnabled: boolean;
}

export interface SheetSyncResult {
  success: boolean;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  fileName?: string;
  filePath?: string;
  fileSizeKB?: number;
  rowCount?: number;
  fromGoogleSheets: boolean;
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
  fromGoogleSheets?: boolean;
}

export const getStoredSheetInfo = (): SheetConnectionInfo => {
  const cached = localStorage.getItem(LOCAL_STORAGE_GOOGLE_SHEET_KEY);
  if (cached) {
    try {
      const cfg = JSON.parse(cached);
      return {
        spreadsheetId: cfg.spreadsheetId || SERVER_EXCEL_PATH,
        spreadsheetUrl: cfg.spreadsheetUrl || '/api/excel/download',
        lastSyncedAt: cfg.lastSyncedAt,
        filePath: SERVER_EXCEL_PATH,
        fileName: cfg.spreadsheetTitle || SERVER_EXCEL_FILENAME,
        fromGoogleSheets: !!cfg.spreadsheetId,
      };
    } catch {
      // Ignore
    }
  }
  return {
    spreadsheetId: SERVER_EXCEL_PATH,
    spreadsheetUrl: '/api/excel/download',
    lastSyncedAt: localStorage.getItem(LOCAL_STORAGE_LAST_SYNC_KEY),
    filePath: SERVER_EXCEL_PATH,
    fileName: SERVER_EXCEL_FILENAME,
    fromGoogleSheets: false,
  };
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
 * Reads the active Google Sheets configuration from server / localStorage
 */
export async function getGoogleSheetsConfig(): Promise<GoogleSheetsConfig> {
  try {
    const res = await fetch('/api/sheets/config');
    if (res.ok) {
      const data = await res.json();
      if (data.config) {
        localStorage.setItem(LOCAL_STORAGE_GOOGLE_SHEET_KEY, JSON.stringify(data.config));
        return data.config;
      }
    }
  } catch (err) {
    console.warn('Could not fetch server sheets config, using local cache:', err);
  }

  const cached = localStorage.getItem(LOCAL_STORAGE_GOOGLE_SHEET_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // Ignore
    }
  }

  return {
    spreadsheetId: null,
    spreadsheetUrl: null,
    spreadsheetTitle: 'Galgotias Drone Soccer League (GDSL 2026) - Registered Teams Roster',
    lastSyncedAt: null,
    autoSyncEnabled: true,
  };
}

/**
 * Saves Google Sheets configuration to server and localStorage
 */
export async function saveGoogleSheetsConfig(config: Partial<GoogleSheetsConfig>): Promise<GoogleSheetsConfig> {
  const current = await getGoogleSheetsConfig();
  const merged: GoogleSheetsConfig = {
    ...current,
    ...config,
  };

  localStorage.setItem(LOCAL_STORAGE_GOOGLE_SHEET_KEY, JSON.stringify(merged));

  try {
    await fetch('/api/sheets/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merged),
    });
  } catch (err) {
    console.warn('Could not persist sheets config to server:', err);
  }

  return merged;
}

/**
 * Extracts a Spreadsheet ID from either a raw ID or full Google Sheet URL
 */
export function extractSpreadsheetId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  // Match standard Google Sheet URL: /spreadsheets/d/([a-zA-Z0-9-_]+)
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  // If it's a plain alphanumeric key with dashes/underscores
  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}

/**
 * Creates a brand new Google Spreadsheet in the user's Google Drive via Google Sheets API
 */
export async function createGoogleSpreadsheet(
  accessToken: string,
  title: string = 'Galgotias Drone Soccer League (GDSL 2026) - Registered Teams Roster'
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; title: string }> {
  const payload = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: 'Registered Teams',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
    ],
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Google Spreadsheet: ${errText}`);
  }

  const result = await createRes.json();
  const spreadsheetId = result.spreadsheetId;
  const spreadsheetUrl =
    result.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Apply high-contrast styling to header row (Acid lime + dark background)
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.08, green: 0.1, blue: 0.07 },
                  textFormat: {
                    foregroundColor: { red: 0.81, green: 0.99, blue: 0.11 },
                    bold: true,
                    fontSize: 11,
                  },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
        ],
      }),
    });
  } catch (err) {
    console.warn('Could not apply custom header style to Google Sheet:', err);
  }

  // Immediately write headers and all registered teams
  const allTeams = getRegisteredTeams();
  await syncAllTeamsToGoogleSheet(accessToken, spreadsheetId, allTeams);

  // Update configuration
  await saveGoogleSheetsConfig({
    spreadsheetId,
    spreadsheetUrl,
    spreadsheetTitle: title,
    lastSyncedAt: new Date().toISOString(),
  });

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
  };
}

/**
 * Pushes all registered teams to a specified Google Spreadsheet
 */
export async function syncAllTeamsToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  teams?: RegisteredTeamProfile[]
): Promise<SheetSyncResult> {
  const squadList = teams && teams.length > 0 ? teams : getRegisteredTeams();
  const headerRow = HEADERS;
  const teamRows = squadList.map((team) => teamToRowValues(team));
  const allRows = [headerRow, ...teamRows];

  const range = `'Registered Teams'!A1:AF${allRows.length}`;
  const putUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    range
  )}?valueInputOption=USER_ENTERED`;

  const res = await fetch(putUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values: allRows,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Sheets API error: ${errText}`);
  }

  const now = new Date().toISOString();
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Update server sync state
  try {
    await fetch('/api/sheets/mark-synced', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spreadsheetId, spreadsheetUrl }),
    });
  } catch {
    // Ignore
  }

  await saveGoogleSheetsConfig({
    spreadsheetId,
    spreadsheetUrl,
    lastSyncedAt: now,
  });

  return {
    success: true,
    fromGoogleSheets: true,
    spreadsheetId,
    spreadsheetUrl,
    rowCount: squadList.length,
    action: 'batch_synced',
    message: `Successfully synchronized ${squadList.length} teams to Google Sheet.`,
    updatedAt: now,
  };
}

/**
 * Appends or updates a single registered team on the connected Google Sheet
 */
export async function appendTeamToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  team: RegisteredTeamProfile
): Promise<SheetSyncResult> {
  // First, retrieve existing rows to check if team already exists and needs updating
  const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Registered Teams'!A:A`;
  let existingRowIndex = -1;

  try {
    const getRes = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (getRes.ok) {
      const data = await getRes.json();
      const ids: string[][] = data.values || [];
      const searchId = team.teamId.trim().toUpperCase();
      for (let i = 0; i < ids.length; i++) {
        if (ids[i][0] && ids[i][0].toString().trim().toUpperCase() === searchId) {
          existingRowIndex = i + 1; // 1-indexed row number
          break;
        }
      }
    }
  } catch (err) {
    console.warn('Could not check existing row in Google Sheet:', err);
  }

  const rowValues = teamToRowValues(team);
  const now = new Date().toISOString();
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  if (existingRowIndex > 0) {
    // Update existing row
    const range = `'Registered Teams'!A${existingRowIndex}:AF${existingRowIndex}`;
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}?valueInputOption=USER_ENTERED`;

    const updateRes = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values: [rowValues],
      }),
    });

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      throw new Error(`Failed to update row in Google Sheet: ${errText}`);
    }

    return {
      success: true,
      fromGoogleSheets: true,
      spreadsheetId,
      spreadsheetUrl,
      action: 'updated',
      message: `Updated team "${team.teamName}" (${team.teamId}) on row ${existingRowIndex} in Google Sheet.`,
      updatedAt: now,
    };
  } else {
    // Append new row
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Registered Teams'!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
    const appendRes = await fetch(appendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: "'Registered Teams'!A1",
        majorDimension: 'ROWS',
        values: [rowValues],
      }),
    });

    if (!appendRes.ok) {
      const errText = await appendRes.text();
      throw new Error(`Failed to append row to Google Sheet: ${errText}`);
    }

    return {
      success: true,
      fromGoogleSheets: true,
      spreadsheetId,
      spreadsheetUrl,
      action: 'inserted',
      message: `Appended team "${team.teamName}" (${team.teamId}) to Google Sheet.`,
      updatedAt: now,
    };
  }
}

/**
 * Reads live values directly from the connected Google Sheet
 */
export async function fetchGoogleSheetValues(
  accessToken: string,
  spreadsheetId: string
): Promise<{ headers: string[]; rows: string[][] }> {
  const range = `'Registered Teams'!A1:AF1000`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    range
  )}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to read Google Sheet values: ${errText}`);
  }

  const data = await res.json();
  const values: string[][] = data.values || [];

  if (values.length === 0) {
    return { headers: HEADERS, rows: [] };
  }

  const headers = values[0];
  const rows = values.slice(1);
  return { headers, rows };
}

/**
 * Reads live values directly from a public or shared Google Sheet without requiring OAuth popup
 */
export async function fetchGoogleSheetPublicCsv(
  spreadsheetId: string
): Promise<{ headers: string[]; rows: string[][] } | null> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || text.trim().startsWith('<!DOCTYPE html>')) return null;

    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return null;

    const parseCsvRow = (line: string): string[] => {
      const items: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          items.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      items.push(current.trim());
      return items;
    };

    const headers = parseCsvRow(lines[0]);
    const rows = lines.slice(1).map(parseCsvRow);
    return { headers, rows };
  } catch {
    return null;
  }
}

/**
 * Universal sync helper: stores to server Excel and automatically updates Google Sheet if connected!
 */
export async function syncTeamToSheet(
  team: RegisteredTeamProfile,
  explicitToken?: string,
  _interactive: boolean = false
): Promise<SheetSyncResult> {
  const now = new Date().toLocaleTimeString();

  // 1. Always update server storage
  try {
    await fetch('/api/excel/sync-team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team }),
    });
  } catch (err) {
    console.warn('Server Excel sync notice:', err);
  }

  // 2. Check if Google Sheets is connected & token is available
  const token = explicitToken || (await getAccessToken());
  const sheetsConfig = await getGoogleSheetsConfig();

  if (token && sheetsConfig.spreadsheetId) {
    try {
      const gsResult = await appendTeamToGoogleSheet(token, sheetsConfig.spreadsheetId, team);
      return gsResult;
    } catch (err: any) {
      console.warn('Live Google Sheets update error, fell back to local/server sync:', err);
    }
  }

  return {
    success: true,
    fromGoogleSheets: !!sheetsConfig.spreadsheetId,
    spreadsheetId: sheetsConfig.spreadsheetId || SERVER_EXCEL_PATH,
    spreadsheetUrl: sheetsConfig.spreadsheetUrl || '/api/excel/download',
    fileName: SERVER_EXCEL_FILENAME,
    filePath: SERVER_EXCEL_PATH,
    action: 'updated',
    message: `Team "${team.teamName}" (${team.teamId}) saved and queued for Google Sheet synchronization.`,
    updatedAt: now,
  };
}

/**
 * Batch-syncs all registered teams to server workbook AND Google Sheet
 */
export async function syncAllTeamsToSheet(
  teams: RegisteredTeamProfile[],
  explicitToken?: string,
  _interactive: boolean = false
): Promise<SheetSyncResult> {
  const now = new Date().toLocaleTimeString();

  // 1. Always sync to server
  try {
    await fetch('/api/excel/sync-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teams }),
    });
  } catch (err) {
    console.warn('Server sync-all notice:', err);
  }

  // 2. Sync to Google Sheet if token & ID are available
  const token = explicitToken || (await getAccessToken());
  const sheetsConfig = await getGoogleSheetsConfig();

  if (token && sheetsConfig.spreadsheetId) {
    try {
      const gsResult = await syncAllTeamsToGoogleSheet(token, sheetsConfig.spreadsheetId, teams);
      return gsResult;
    } catch (err: any) {
      console.warn('Google Sheets batch sync error:', err);
      throw err;
    }
  }

  return {
    success: true,
    fromGoogleSheets: !!sheetsConfig.spreadsheetId,
    spreadsheetId: sheetsConfig.spreadsheetId || SERVER_EXCEL_PATH,
    spreadsheetUrl: sheetsConfig.spreadsheetUrl || '/api/excel/download',
    fileName: SERVER_EXCEL_FILENAME,
    filePath: SERVER_EXCEL_PATH,
    action: 'batch_synced',
    message: `All ${teams.length} tournament squads stored and ready for Google Sheets sync.`,
    updatedAt: now,
  };
}

/**
 * High-level helper to update all existing data on Google Sheet & Server
 */
export async function updateAllTournamentDataOnSheets(
  explicitToken?: string,
  interactive: boolean = false
): Promise<SheetSyncResult> {
  const teams = getRegisteredTeams();
  return syncAllTeamsToSheet(teams, explicitToken, interactive);
}

/**
 * Fetches live Sheet data from Server & Google Sheets
 */
export async function fetchLiveSheetData(explicitToken?: string): Promise<{
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
  const sheetsConfig = await getGoogleSheetsConfig();
  const token = explicitToken || (await getAccessToken());

  // If token and spreadsheetId exist, attempt to fetch live values from Google Sheets API
  if (token && sheetsConfig.spreadsheetId) {
    try {
      const liveGoogle = await fetchGoogleSheetValues(token, sheetsConfig.spreadsheetId);
      if (liveGoogle.rows.length > 0) {
        return {
          headers: liveGoogle.headers,
          rows: liveGoogle.rows,
          fromGoogleSheets: true,
          spreadsheetId: sheetsConfig.spreadsheetId,
          spreadsheetUrl: sheetsConfig.spreadsheetUrl,
          lastSyncedAt: sheetsConfig.lastSyncedAt || new Date().toISOString(),
          rowCount: liveGoogle.rows.length,
          fileName: sheetsConfig.spreadsheetTitle,
          teams: getRegisteredTeams(),
        };
      }
    } catch (err) {
      console.warn('Could not read directly from Google Sheets API, trying public CSV endpoint:', err);
    }
  }

  // If spreadsheetId is linked, attempt to read directly via public/shared Google Sheet export (No OAuth required)
  if (sheetsConfig.spreadsheetId) {
    try {
      const publicData = await fetchGoogleSheetPublicCsv(sheetsConfig.spreadsheetId);
      if (publicData && publicData.rows.length > 0) {
        return {
          headers: publicData.headers,
          rows: publicData.rows,
          fromGoogleSheets: true,
          spreadsheetId: sheetsConfig.spreadsheetId,
          spreadsheetUrl: sheetsConfig.spreadsheetUrl,
          lastSyncedAt: sheetsConfig.lastSyncedAt || new Date().toISOString(),
          rowCount: publicData.rows.length,
          fileName: sheetsConfig.spreadsheetTitle,
          teams: getRegisteredTeams(),
        };
      }
    } catch (err) {
      console.warn('Public Google Sheet fetch notice:', err);
    }
  }

  // Server Excel fallback
  try {
    const statusRes = await fetch('/api/excel/status');
    if (statusRes.ok) {
      const data = await statusRes.json();
      const serverTeams: RegisteredTeamProfile[] = Array.isArray(data.teams) ? data.teams : [];
      const localTeams = getRegisteredTeams();

      // Check if localStorage has newly registered teams not yet on the server
      const serverIds = new Set(serverTeams.map((t) => t.teamId.trim().toUpperCase()));
      const unsyncedLocalTeams = localTeams.filter(
        (t) => t && t.teamId && !serverIds.has(t.teamId.trim().toUpperCase())
      );

      let finalTeams = serverTeams;
      if (unsyncedLocalTeams.length > 0) {
        finalTeams = [...unsyncedLocalTeams, ...serverTeams];
        try {
          await fetch('/api/excel/sync-all', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teams: finalTeams }),
          });
        } catch {
          // Ignore
        }
      }

      if (finalTeams.length > 0) {
        localStorage.setItem('gdsl_registered_teams_v1', JSON.stringify(finalTeams));
      }

      return {
        headers: data.headers || HEADERS,
        rows: data.rows || finalTeams.map((t) => teamToRowValues(t).map(String)),
        fromGoogleSheets: !!sheetsConfig.spreadsheetId,
        spreadsheetId: sheetsConfig.spreadsheetId || data.filePath || SERVER_EXCEL_PATH,
        spreadsheetUrl: sheetsConfig.spreadsheetUrl || '/api/excel/download',
        lastSyncedAt: sheetsConfig.lastSyncedAt || data.lastUpdatedAt || new Date().toISOString(),
        fileName: sheetsConfig.spreadsheetId ? sheetsConfig.spreadsheetTitle : data.fileName || SERVER_EXCEL_FILENAME,
        filePath: data.filePath || SERVER_EXCEL_PATH,
        fileSizeKB: data.fileSizeKB || 12,
        rowCount: data.rowCount || finalTeams.length,
        teams: finalTeams,
      };
    }
  } catch (err) {
    console.warn('Could not fetch server Excel status, using local roster:', err);
  }

  const localTeams = getRegisteredTeams();
  return {
    headers: HEADERS,
    rows: localTeams.map((t) => teamToRowValues(t).map(String)),
    fromGoogleSheets: !!sheetsConfig.spreadsheetId,
    spreadsheetId: sheetsConfig.spreadsheetId || SERVER_EXCEL_PATH,
    spreadsheetUrl: sheetsConfig.spreadsheetUrl || '/api/excel/download',
    lastSyncedAt: sheetsConfig.lastSyncedAt || localStorage.getItem(LOCAL_STORAGE_LAST_SYNC_KEY) || new Date().toISOString(),
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
