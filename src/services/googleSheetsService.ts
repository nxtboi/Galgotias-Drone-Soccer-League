import { RegisteredTeamProfile } from '../data/teamAuthData';
import { getAccessToken } from './googleAuth';

const SPREADSHEET_TITLE = 'GDSL 2026 - Galgotias Drone Soccer League (Teams & Rosters)';
const LOCAL_STORAGE_SHEET_KEY = 'gdsl_google_spreadsheet_id_v1';
const LOCAL_STORAGE_SHEET_URL_KEY = 'gdsl_google_spreadsheet_url_v1';
const LOCAL_STORAGE_LAST_SYNC_KEY = 'gdsl_google_sheet_last_sync_v1';

export interface SheetSyncResult {
  success: boolean;
  spreadsheetId: string;
  spreadsheetUrl: string;
  action: 'inserted' | 'updated' | 'batch_synced';
  message: string;
  updatedAt: string;
}

export interface SheetConnectionInfo {
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  lastSyncedAt: string | null;
}

export const getStoredSheetInfo = (): SheetConnectionInfo => {
  return {
    spreadsheetId: localStorage.getItem(LOCAL_STORAGE_SHEET_KEY),
    spreadsheetUrl: localStorage.getItem(LOCAL_STORAGE_SHEET_URL_KEY),
    lastSyncedAt: localStorage.getItem(LOCAL_STORAGE_LAST_SYNC_KEY),
  };
};

export const setStoredSheetInfo = (id: string, url: string) => {
  localStorage.setItem(LOCAL_STORAGE_SHEET_KEY, id);
  localStorage.setItem(LOCAL_STORAGE_SHEET_URL_KEY, url);
};

export const clearStoredSheetInfo = () => {
  localStorage.removeItem(LOCAL_STORAGE_SHEET_KEY);
  localStorage.removeItem(LOCAL_STORAGE_SHEET_URL_KEY);
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
  'Payment Status',
  'Receipt No',
  'Registration Date',
  'Faculty Mentor / HOD',
  'Department',
  'Total Students',
  'Last Synchronized',
];

/**
 * Converts a RegisteredTeamProfile to row values matching HEADERS
 */
export const teamToRowValues = (team: RegisteredTeamProfile): (string | number)[] => {
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const studentsCount = team.attendanceData?.students?.length || 5;
  const faculty = team.attendanceData?.facultyName || 'Pending Dean Endorsement';
  const department = team.attendanceData?.department || 'Aerospace / Robotics';

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
    team.paymentInfo?.status || 'VERIFIED',
    team.paymentInfo?.receiptNo || 'N/A',
    team.registeredAt,
    faculty,
    department,
    studentsCount,
    now + ' IST',
  ];
};

/**
 * Finds an existing tournament sheet on Google Drive or returns null
 */
async function findExistingSpreadsheet(accessToken: string): Promise<{ id: string; url: string } | null> {
  try {
    const query = encodeURIComponent(
      `name = '${SPREADSHEET_TITLE}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`
    );
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.files && data.files.length > 0) {
        const file = data.files[0];
        return {
          id: file.id,
          url: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
        };
      }
    }
  } catch (err) {
    console.warn('Error querying Google Drive for existing sheet:', err);
  }
  return null;
}

/**
 * Formats the header row of the spreadsheet with custom GDSL tournament styling
 */
async function formatHeaderRow(spreadsheetId: string, sheetId: number, accessToken: string) {
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          // Format header row background & font
          {
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.08,
                    green: 0.16,
                    blue: 0.35,
                  },
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    bold: true,
                    fontSize: 10,
                  },
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
          // Auto-resize column widths for readability
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: HEADERS.length,
              },
            },
          },
        ],
      }),
    });
  } catch (err) {
    console.warn('Could not format header row:', err);
  }
}

/**
 * Creates a brand new Google Spreadsheet for GDSL and sets headers
 */
async function createTournamentSpreadsheet(accessToken: string): Promise<{ id: string; url: string; sheetName: string }> {
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: SPREADSHEET_TITLE,
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
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Google Spreadsheet: ${errText}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const sheetName = sheetData.sheets?.[0]?.properties?.title || 'Registered Teams';
  const sheetId = sheetData.sheets?.[0]?.properties?.sheetId || 0;
  const url = sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Write headers
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${sheetName}'!A1:Z1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [HEADERS],
      }),
    }
  );

  // Apply styling
  await formatHeaderRow(spreadsheetId, sheetId, accessToken);

  return { id: spreadsheetId, url, sheetName };
}

/**
 * Resolves the active tournament spreadsheet (cached ID -> Drive Search -> Create New)
 */
export async function getOrCreateSpreadsheet(
  accessToken: string
): Promise<{ id: string; url: string; sheetName: string }> {
  const stored = getStoredSheetInfo();

  if (stored.spreadsheetId && stored.spreadsheetUrl) {
    // Validate that this sheet still exists and is accessible
    try {
      const verifyRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${stored.spreadsheetId}?fields=sheets(properties(title,sheetId))`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (verifyRes.ok) {
        const data = await verifyRes.json();
        const sheetName = data.sheets?.[0]?.properties?.title || 'Registered Teams';
        return {
          id: stored.spreadsheetId,
          url: stored.spreadsheetUrl,
          sheetName,
        };
      }
    } catch {
      // Continue to fallback
    }
  }

  // Check Drive for existing file
  const existing = await findExistingSpreadsheet(accessToken);
  if (existing) {
    // Inspect sheet name
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${existing.id}?fields=sheets(properties(title,sheetId))`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    let sheetName = 'Registered Teams';
    if (metaRes.ok) {
      const data = await metaRes.json();
      sheetName = data.sheets?.[0]?.properties?.title || 'Registered Teams';
    }
    setStoredSheetInfo(existing.id, existing.url);
    return { id: existing.id, url: existing.url, sheetName };
  }

  // Create new spreadsheet
  const created = await createTournamentSpreadsheet(accessToken);
  setStoredSheetInfo(created.id, created.url);
  return created;
}

/**
 * Stores or updates a team in the connected Google Sheet
 */
export async function syncTeamToSheet(
  team: RegisteredTeamProfile,
  explicitToken?: string
): Promise<SheetSyncResult> {
  const token = explicitToken || (await getAccessToken());
  if (!token) {
    throw new Error('Google authentication required. Please sign in with your Google account.');
  }

  const { id: spreadsheetId, url: spreadsheetUrl, sheetName } = await getOrCreateSpreadsheet(token);

  // 1. Fetch existing rows to see if teamId already exists
  const readRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${sheetName}'!A:A`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  let existingRowIndex = -1;
  if (readRes.ok) {
    const data = await readRes.json();
    const rows = (data.values || []) as string[][];
    // Find index (1-indexed for Sheets)
    for (let i = 1; i < rows.length; i++) {
      if (rows[i] && rows[i][0] && rows[i][0].trim().toLowerCase() === team.teamId.trim().toLowerCase()) {
        existingRowIndex = i + 1; // 1-indexed line in Sheets
        break;
      }
    }
  }

  const rowValues = teamToRowValues(team);
  const now = new Date().toLocaleTimeString();

  if (existingRowIndex > 0) {
    // 2. Update existing row
    const updateRange = `'${sheetName}'!A${existingRowIndex}:Z${existingRowIndex}`;
    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${updateRange}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowValues],
        }),
      }
    );

    if (!updateRes.ok) {
      const err = await updateRes.text();
      throw new Error(`Failed to update team row in Google Sheets: ${err}`);
    }

    localStorage.setItem(LOCAL_STORAGE_LAST_SYNC_KEY, new Date().toISOString());
    return {
      success: true,
      spreadsheetId,
      spreadsheetUrl,
      action: 'updated',
      message: `Team "${team.teamName}" (${team.teamId}) successfully updated at row ${existingRowIndex} in Google Sheets.`,
      updatedAt: now,
    };
  } else {
    // 3. Append new row
    const appendRange = `'${sheetName}'!A:Z`;
    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${appendRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowValues],
        }),
      }
    );

    if (!appendRes.ok) {
      const err = await appendRes.text();
      throw new Error(`Failed to append team row in Google Sheets: ${err}`);
    }

    localStorage.setItem(LOCAL_STORAGE_LAST_SYNC_KEY, new Date().toISOString());
    return {
      success: true,
      spreadsheetId,
      spreadsheetUrl,
      action: 'inserted',
      message: `Team "${team.teamName}" (${team.teamId}) successfully appended to Google Sheets roster.`,
      updatedAt: now,
    };
  }
}

/**
 * Batch-syncs all registered teams to Google Sheets
 */
export async function syncAllTeamsToSheet(
  teams: RegisteredTeamProfile[],
  explicitToken?: string
): Promise<SheetSyncResult> {
  const token = explicitToken || (await getAccessToken());
  if (!token) {
    throw new Error('Google authentication required. Please sign in with your Google account.');
  }

  const { id: spreadsheetId, url: spreadsheetUrl, sheetName } = await getOrCreateSpreadsheet(token);

  // Clear existing and rewrite header + all rows cleanly
  const allRows = [HEADERS, ...teams.map(teamToRowValues)];

  const writeRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${sheetName}'!A1:Z${allRows.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: allRows,
      }),
    }
  );

  if (!writeRes.ok) {
    const err = await writeRes.text();
    throw new Error(`Failed to batch sync teams: ${err}`);
  }

  localStorage.setItem(LOCAL_STORAGE_LAST_SYNC_KEY, new Date().toISOString());
  return {
    success: true,
    spreadsheetId,
    spreadsheetUrl,
    action: 'batch_synced',
    message: `All ${teams.length} tournament squads synced with Google Sheets!`,
    updatedAt: new Date().toLocaleTimeString(),
  };
}
