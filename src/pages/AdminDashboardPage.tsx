import React, { useState, useEffect } from 'react';
import { GcdisLogo } from '../components/GcdisLogo';
import {
  RegisteredTeamProfile,
  getRegisteredTeams,
  saveRegisteredTeam,
  getDivisionFee,
  getCurrentSession,
  setCurrentSession,
} from '../data/teamAuthData';
import {
  fetchLiveSheetData,
  updateAllTournamentDataOnSheets,
  syncTeamToSheet,
  downloadServerExcelWorkbook,
  HEADERS,
  getGoogleSheetsConfig,
  saveGoogleSheetsConfig,
  createGoogleSpreadsheet,
  syncAllTeamsToGoogleSheet,
  appendTeamToGoogleSheet,
  flushPendingRegistrationsToGoogleSheet,
  extractSpreadsheetId,
  GoogleSheetsConfig,
} from '../services/googleSheetsService';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getCurrentGoogleUser,
  getAccessToken,
} from '../services/googleAuthService';
import type { User } from 'firebase/auth';

export interface AdminDashboardPageProps {
  onLogout: () => void;
  onNavigate: (tab: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onLogout,
  onNavigate,
}) => {
  const [teams, setTeams] = useState<RegisteredTeamProfile[]>([]);
  const [sheetData, setSheetData] = useState<{
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
  }>({
    headers: HEADERS,
    rows: [],
    fromGoogleSheets: true,
    spreadsheetId: 'data/GDSL_2026_Teams_Roster.xlsx',
    spreadsheetUrl: '/api/excel/download',
    lastSyncedAt: null,
    fileName: 'GDSL_2026_Teams_Roster.xlsx',
    filePath: 'data/GDSL_2026_Teams_Roster.xlsx',
    fileSizeKB: 12,
    rowCount: 0,
  });

  // Google Account & Google Sheets state
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>({
    spreadsheetId: null,
    spreadsheetUrl: null,
    spreadsheetTitle: 'Galgotias Drone Soccer League (GDSL 2026) - Registered Teams Roster',
    lastSyncedAt: null,
    autoSyncEnabled: true,
  });
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [sheetInputUrl, setSheetInputUrl] = useState('');
  const [autoSyncTimer, setAutoSyncTimer] = useState<number>(30);

  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [activeView, setActiveView] = useState<'sheet' | 'cards' | 'live_google_sheet'>('sheet');
  const [selectedTeam, setSelectedTeam] = useState<RegisteredTeamProfile | null>(null);
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [editTeamForm, setEditTeamForm] = useState<RegisteredTeamProfile | null>(null);

  const openTeamModal = (team: RegisteredTeamProfile, startInEditMode: boolean = false) => {
    setSelectedTeam(team);
    setEditTeamForm(JSON.parse(JSON.stringify(team)));
    setIsEditingTeam(startInEditMode);
  };

  const handleSaveEditedTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTeamForm) return;
    saveRegisteredTeam(editTeamForm);
    setSelectedTeam(editTeamForm);
    setIsEditingTeam(false);
    const updatedTeams = getRegisteredTeams();
    setTeams(updatedTeams);

    // Sync active squad session if this team is currently logged in
    const activeSession = getCurrentSession();
    if (activeSession && activeSession.teamId === editTeamForm.teamId) {
      setCurrentSession(editTeamForm);
    }

    setSyncMessage(`Updated all details for ${editTeamForm.teamName} (${editTeamForm.teamId}) in Server Excel Workbook.`);
    setTimeout(() => setSyncMessage(null), 5000);

    try {
      await syncTeamToSheet(editTeamForm);
      const liveData = await fetchLiveSheetData();
      setSheetData(liveData);
    } catch (err) {
      console.warn('Admin team edit Excel sync notice:', err);
    }
  };

  // Instant update of registration payment status for any team
  const handleQuickUpdatePaymentStatus = async (
    teamId: string,
    newStatus: 'PENDING' | 'PAYMENT REQUESTED' | 'PAID' | 'VERIFIED' | string
  ) => {
    const currentTeams = getRegisteredTeams();
    const targetIndex = currentTeams.findIndex((t) => t.teamId === teamId);
    if (targetIndex >= 0) {
      const targetTeam = currentTeams[targetIndex];
      const feeFormatted = getDivisionFee(targetTeam.division).formatted;
      const isPendingLike = newStatus === 'PENDING' || newStatus === 'PAYMENT REQUESTED';
      const updatedTeam: RegisteredTeamProfile = {
        ...targetTeam,
        scrutineeringStatus: isPendingLike ? 'PENDING_ON_SITE' : 'PRE_APPROVED',
        paymentInfo: {
          ...targetTeam.paymentInfo,
          amount: targetTeam.paymentInfo?.amount || feeFormatted,
          status: newStatus as any,
          receiptNo:
            isPendingLike
              ? 'PENDING'
              : targetTeam.paymentInfo.receiptNo === 'PENDING' || !targetTeam.paymentInfo.receiptNo
              ? `GDSL-REC-2026-${Math.floor(100 + Math.random() * 900)}`
              : targetTeam.paymentInfo.receiptNo,
          paidAt:
            newStatus === 'PAYMENT REQUESTED'
              ? 'Payment Requested (Awaiting Remittance)'
              : newStatus === 'PENDING'
              ? 'Awaiting Fee Payment'
              : targetTeam.paymentInfo.paidAt === 'Awaiting Fee Payment'
              ? new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
              : targetTeam.paymentInfo.paidAt,
        },
      };

      saveRegisteredTeam(updatedTeam);
      const updatedAll = getRegisteredTeams();
      setTeams(updatedAll);

      // If this team is in active session, sync it immediately
      const activeSession = getCurrentSession();
      if (activeSession && activeSession.teamId === teamId) {
        setCurrentSession(updatedTeam);
      }

      setSyncMessage(`Updated registration payment status to ${newStatus} for ${updatedTeam.teamName} (${teamId}) in Server Excel Sheet.`);
      setTimeout(() => setSyncMessage(null), 4000);

      try {
        await syncTeamToSheet(updatedTeam);
        const liveData = await fetchLiveSheetData();
        setSheetData(liveData);
      } catch (err) {
        console.warn('Admin status Excel sync notice:', err);
      }
    }
  };

  // Load team data and server Excel info
  const loadData = async (explicitToken?: string) => {
    setIsLoading(true);
    try {
      const cfg = await getGoogleSheetsConfig();
      setSheetsConfig(cfg);
      const liveData = await fetchLiveSheetData(explicitToken);
      setSheetData(liveData);
      const currentTeams = getRegisteredTeams();
      setTeams(currentTeams);
    } catch (err: any) {
      console.warn('Error loading admin Excel data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen to Google Auth changes
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // 30-Second Auto-Sync Loop to keep Google Sheet and Admin Panel continuously updated
  useEffect(() => {
    if (!sheetsConfig.autoSyncEnabled) return;

    const interval = setInterval(async () => {
      setAutoSyncTimer((prev) => {
        if (prev <= 1) {
          // Trigger background auto-sync
          (async () => {
            try {
              const token = googleToken || (await getAccessToken());
              const cfg = await getGoogleSheetsConfig();
              const latestTeams = getRegisteredTeams();
              setTeams(latestTeams);

              if (token && cfg.spreadsheetId) {
                // First flush any pending new registrations from visitors
                await flushPendingRegistrationsToGoogleSheet(token, cfg.spreadsheetId);
                await syncAllTeamsToGoogleSheet(token, cfg.spreadsheetId, latestTeams);
                setSheetsConfig((c) => ({ ...c, lastSyncedAt: new Date().toISOString() }));
              }
              const updated = await fetchLiveSheetData(token || undefined);
              setSheetData(updated);
            } catch (err) {
              console.warn('Auto-sync cycle notification:', err);
            }
          })();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sheetsConfig.autoSyncEnabled, sheetsConfig.spreadsheetId, googleToken]);

  // Google Sign-In with official workspace scopes
  const handleGoogleSignIn = async () => {
    setIsConnectingGoogle(true);
    setSyncError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
        setSyncMessage(`Connected to Google as ${res.user.displayName || res.user.email}!`);
        setTimeout(() => setSyncMessage(null), 5000);

        const currentCfg = await getGoogleSheetsConfig();
        if (!currentCfg.spreadsheetId) {
          setIsCreatingSheet(true);
          const newSheet = await createGoogleSpreadsheet(res.accessToken);
          setSheetsConfig((prev) => ({
            ...prev,
            spreadsheetId: newSheet.spreadsheetId,
            spreadsheetUrl: newSheet.spreadsheetUrl,
            spreadsheetTitle: newSheet.title,
            lastSyncedAt: new Date().toISOString(),
          }));
          setSyncMessage(`Created & connected live Google Sheet: "${newSheet.title}"`);
        } else {
          await syncAllTeamsToGoogleSheet(res.accessToken, currentCfg.spreadsheetId, teams);
          setSyncMessage(`Synchronized all teams to Google Sheet (${currentCfg.spreadsheetTitle}).`);
        }
        await loadData(res.accessToken);
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setSyncError(err?.message || 'Failed to connect Google account.');
      setTimeout(() => setSyncError(null), 6000);
    } finally {
      setIsConnectingGoogle(false);
      setIsCreatingSheet(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setGoogleToken(null);
    setSyncMessage('Google Account disconnected.');
    setTimeout(() => setSyncMessage(null), 4000);
  };

  // 1-Click Create new Google Sheet in Google Drive
  const handleCreateNewGoogleSheet = async () => {
    let token = googleToken || (await getAccessToken());
    if (!token) {
      const res = await googleSignIn();
      if (!res) return;
      token = res.accessToken;
      setGoogleUser(res.user);
      setGoogleToken(token);
    }

    setIsCreatingSheet(true);
    setSyncError(null);
    try {
      const newSheet = await createGoogleSpreadsheet(token);
      const updatedCfg: GoogleSheetsConfig = {
        spreadsheetId: newSheet.spreadsheetId,
        spreadsheetUrl: newSheet.spreadsheetUrl,
        spreadsheetTitle: newSheet.title,
        lastSyncedAt: new Date().toISOString(),
        autoSyncEnabled: true,
      };
      setSheetsConfig(updatedCfg);
      setSyncMessage(`Live Google Sheet created and populated! Opening ${newSheet.title}...`);
      await loadData(token);
      setTimeout(() => setSyncMessage(null), 7000);
    } catch (err: any) {
      setSyncError(err?.message || 'Failed to create Google Sheet.');
      setTimeout(() => setSyncError(null), 6000);
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // Connect existing Google Sheet by ID or URL
  const handleConnectExistingSheet = async () => {
    if (!sheetInputUrl.trim()) return;
    const extractedId = extractSpreadsheetId(sheetInputUrl.trim());
    if (!extractedId) {
      setSyncError('Please enter a valid Google Spreadsheet URL or Spreadsheet ID.');
      setTimeout(() => setSyncError(null), 5000);
      return;
    }

    const fullUrl = `https://docs.google.com/spreadsheets/d/${extractedId}/edit`;
    const updated = await saveGoogleSheetsConfig({
      spreadsheetId: extractedId,
      spreadsheetUrl: fullUrl,
      lastSyncedAt: new Date().toISOString(),
    });
    setSheetsConfig(updated);
    setSheetInputUrl('');
    setSyncMessage(`Linked to Google Sheet ID: ${extractedId}. Syncing current roster...`);

    const token = googleToken || (await getAccessToken());
    if (token) {
      try {
        await syncAllTeamsToGoogleSheet(token, extractedId, teams);
        setSyncMessage(`Connected and synchronized ${teams.length} teams to Google Sheet!`);
      } catch (err: any) {
        console.warn('Sync notice:', err);
      }
    }
    await loadData(token || undefined);
    setTimeout(() => setSyncMessage(null), 6000);
  };

  const handleUnlinkSheet = async () => {
    const updated = await saveGoogleSheetsConfig({
      spreadsheetId: null,
      spreadsheetUrl: null,
      spreadsheetTitle: 'GDSL 2026 - Registered Teams Roster',
      lastSyncedAt: null,
    });
    setSheetsConfig(updated);
    setSyncMessage('Google Sheet unlinked. Reverted to server storage.');
    await loadData();
    setTimeout(() => setSyncMessage(null), 4000);
  };

  // Manual Sync trigger
  const handlePushToSheets = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    setSyncError(null);

    try {
      const token = googleToken || (await getAccessToken());
      const currentTeams = getRegisteredTeams();
      if (token && sheetsConfig.spreadsheetId) {
        const gsRes = await syncAllTeamsToGoogleSheet(token, sheetsConfig.spreadsheetId, currentTeams);
        setSyncMessage(gsRes.message);
      } else {
        const res = await updateAllTournamentDataOnSheets();
        setSyncMessage(res.message);
      }
      const updated = await fetchLiveSheetData(token || undefined);
      setSheetData(updated);
      setTimeout(() => setSyncMessage(null), 6000);
    } catch (err: any) {
      console.error('Admin sync error:', err);
      setSyncError(err.message || 'Failed to synchronize teams.');
      setTimeout(() => setSyncError(null), 6000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Export CSV download
  const handleExportCsv = () => {
    const csvContent = [
      sheetData.headers.join(','),
      ...sheetData.rows.map((row) =>
        row
          .map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GDSL_2026_Teams_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered teams list
  const filteredTeams = teams.filter((t) => {
    const matchQuery =
      t.teamId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.captainName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchDivision =
      selectedDivision === 'ALL' ||
      (selectedDivision === 'CLASS_20' && t.division.includes('20')) ||
      (selectedDivision === 'CLASS_40' && t.division.includes('40'));

    return matchQuery && matchDivision;
  });

  const totalRevenue = teams.reduce((acc, t) => {
    if (t.paymentInfo?.status === 'PENDING') return acc;
    const rawAmount = t.paymentInfo?.amount || getDivisionFee(t.division).formatted;
    const num = parseInt(rawAmount.replace(/[^0-9]/g, ''), 10);
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  return (
    <div className="relative z-20 min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-12 text-white font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Admin Header Bar */}
        <div className="bg-[#141612]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <GcdisLogo size="md" showWordmark={false} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#d0fe1d]/15 text-[#d0fe1d] border border-[#d0fe1d]/40">
                    👑 TOURNAMENT ADMIN &amp; SECRETARIAT
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/70 text-white border border-white/20">
                    GDSL 2026
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-orbitron font-black text-white uppercase tracking-wider mt-2">
                  Tournament Control <span className="text-[#d0fe1d]">Panel</span>
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400 font-mono mt-1">
                  Server Excel Storage: <span className="font-bold text-[#d0fe1d]">{sheetData.filePath || 'data/GDSL_2026_Teams_Roster.xlsx'}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => onNavigate('home')}
                className="px-4 py-2 text-xs font-rajdhani font-bold uppercase tracking-wider rounded-xl border border-white/20 bg-white/5 text-neutral-200 hover:text-[#d0fe1d] hover:border-[#d0fe1d] hover:bg-[#d0fe1d]/10 transition-all cursor-pointer"
              >
                Public Site
              </button>
              <button
                onClick={() => onNavigate('bracket')}
                className="px-4 py-2 text-xs font-rajdhani font-bold uppercase tracking-wider rounded-xl border border-[#d0fe1d]/30 text-[#d0fe1d] bg-[#d0fe1d]/10 hover:bg-[#d0fe1d]/20 transition-all cursor-pointer"
              >
                Fixtures
              </button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
            <div className="bg-[#1b1e17] border border-white/10 hover:border-[#d0fe1d]/40 rounded-2xl p-4 transition-all shadow-lg">
              <span className="text-xs font-mono font-bold text-neutral-400 block uppercase tracking-wider">TOTAL SQUADS</span>
              <span className="text-3xl font-black font-orbitron text-white mt-1 block">
                {teams.length}
              </span>
              <span className="text-[11px] text-[#d0fe1d] mt-1 block font-mono">
                {teams.filter((t) => t.division.includes('20')).length} Class 20 · {teams.filter((t) => t.division.includes('40')).length} Class 40
              </span>
            </div>

            <div className="bg-[#1b1e17] border border-white/10 hover:border-[#d0fe1d]/40 rounded-2xl p-4 transition-all shadow-lg">
              <span className="text-xs font-mono font-bold text-neutral-400 block uppercase tracking-wider">FEES COLLECTED</span>
              <span className="text-3xl font-black font-orbitron text-[#d0fe1d] mt-1 block">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-emerald-400 mt-1 block font-mono">
                ✓ 100% Verified Entry Fees
              </span>
            </div>

            <div className="bg-[#1b1e17] border border-white/10 hover:border-[#d0fe1d]/40 rounded-2xl p-4 transition-all shadow-lg">
              <span className="text-xs font-mono font-bold text-neutral-400 block uppercase tracking-wider">REGISTERED PILOTS</span>
              <span className="text-3xl font-black font-orbitron text-white mt-1 block">
                {teams.length * 6}
              </span>
              <span className="text-[11px] text-neutral-400 mt-1 block font-mono">
                6 Crew members per squad
              </span>
            </div>

            <div className="bg-[#1b1e17] border border-white/10 hover:border-[#d0fe1d]/40 rounded-2xl p-4 transition-all shadow-lg">
              <span className="text-xs font-mono font-bold text-neutral-400 block uppercase tracking-wider">GOOGLE SHEETS SYNC</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2.5 h-2.5 rounded-full ${sheetsConfig.spreadsheetId ? 'bg-[#d0fe1d] animate-pulse' : 'bg-emerald-400'}`} />
                <span className="text-sm font-orbitron font-bold text-white">
                  {sheetsConfig.spreadsheetId ? 'Live Google Sheet' : 'Server Auto-Sync'}
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block font-mono truncate">
                {sheetsConfig.spreadsheetId ? `Auto-sync: ${autoSyncTimer}s` : 'Server .XLSX + Sheets ready'}
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Banners */}
        {syncMessage && (
          <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-medium flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-lg">✓</span>
              <span>{syncMessage}</span>
            </div>
            <button
              onClick={() => setSyncMessage(null)}
              className="text-xs font-bold text-emerald-400 hover:text-white cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {syncError && (
          <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs sm:text-sm font-medium flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span>{syncError}</span>
            </div>
            <button
              onClick={() => setSyncError(null)}
              className="text-xs font-bold text-rose-400 hover:text-white cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Google Sheets Live Sync & Command Control Center */}
        <div className="bg-[#141612]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-white/10 pb-5">
            <div className="space-y-1.5 text-left">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-2xl">📑</span>
                <h2 className="text-lg sm:text-xl font-orbitron font-black text-white uppercase tracking-wider">
                  Google Sheets Live Auto-Sync
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#d0fe1d]/15 text-[#d0fe1d] border border-[#d0fe1d]/40 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#d0fe1d] animate-ping" />
                  <span>Auto-Update Active</span>
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Tournament registrations automatically write and update to your Google Sheet in real-time.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-neutral-400">
                <span>
                  Connected Sheet:{' '}
                  <span className="text-white font-semibold">
                    {sheetsConfig.spreadsheetTitle}
                  </span>
                </span>
                <span>·</span>
                <span>
                  Sync Interval:{' '}
                  <span className="text-[#d0fe1d]">
                    {sheetsConfig.autoSyncEnabled ? `Every 30s (${autoSyncTimer}s remaining)` : 'Paused'}
                  </span>
                </span>
                <span>·</span>
                <span>
                  Last Synced:{' '}
                  <span className="text-white">
                    {sheetsConfig.lastSyncedAt
                      ? new Date(sheetsConfig.lastSyncedAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST'
                      : 'Just now'}
                  </span>
                </span>
              </div>
            </div>

            {/* Google Account Connection Status */}
            <div className="flex flex-wrap items-center gap-3">
              {googleUser ? (
                <div className="flex items-center gap-3 bg-white/5 border border-white/15 rounded-2xl px-3.5 py-2">
                  {googleUser.photoURL ? (
                    <img
                      src={googleUser.photoURL}
                      alt={googleUser.displayName || 'Google Account'}
                      className="w-8 h-8 rounded-full border border-[#d0fe1d]/50"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#d0fe1d] text-black font-bold flex items-center justify-center text-xs">
                      {(googleUser.email || 'G')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="text-left">
                    <div className="text-xs font-bold text-white leading-tight truncate max-w-[150px]">
                      {googleUser.displayName || 'Google Connected'}
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono truncate max-w-[150px]">
                      {googleUser.email}
                    </div>
                  </div>
                  <button
                    onClick={handleGoogleSignOut}
                    className="ml-1 text-[11px] text-neutral-400 hover:text-rose-400 font-mono transition-colors cursor-pointer"
                    title="Disconnect Google Account"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isConnectingGoogle}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 text-xs font-bold font-sans flex items-center gap-2.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isConnectingGoogle ? 'Connecting Google...' : 'Sign in with Google'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Row: Actions & Direct Sheet Links */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              {sheetsConfig.spreadsheetUrl ? (
                <a
                  href={sheetsConfig.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] text-black text-xs font-orbitron font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(208,254,29,0.3)] flex items-center gap-2"
                >
                  <span>↗ Open Live Google Sheet</span>
                </a>
              ) : null}

              <button
                onClick={handlePushToSheets}
                disabled={isSyncing}
                className="px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 text-white text-xs font-orbitron font-bold uppercase tracking-wider transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSyncing ? (
                  <span className="w-3.5 h-3.5 border-2 border-[#d0fe1d] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>🔄</span>
                )}
                <span>Sync Now</span>
              </button>

              <button
                onClick={handleCreateNewGoogleSheet}
                disabled={isCreatingSheet}
                className="px-4 py-2.5 rounded-xl border border-[#d0fe1d]/50 bg-[#d0fe1d]/10 hover:bg-[#d0fe1d]/20 text-[#d0fe1d] text-xs font-orbitron font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isCreatingSheet ? (
                  <span className="w-3.5 h-3.5 border-2 border-[#d0fe1d] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>+</span>
                )}
                <span>Create New Sheet</span>
              </button>

              <button
                onClick={downloadServerExcelWorkbook}
                className="px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:border-white/30 text-neutral-300 text-xs font-rajdhani font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Download backup Excel workbook"
              >
                <span>📥 .XLSX</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:border-white/30 text-neutral-300 text-xs font-rajdhani font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Export CSV text format"
              >
                <span>📄 CSV</span>
              </button>
            </div>

            {/* Link Existing Sheet Input */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                value={sheetInputUrl}
                onChange={(e) => setSheetInputUrl(e.target.value)}
                placeholder="Paste Google Sheet URL or ID..."
                className="px-3 py-2 rounded-xl border border-white/15 bg-black/60 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d0fe1d] w-full md:w-64 font-mono"
              />
              <button
                onClick={handleConnectExistingSheet}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
              >
                Link Sheet
              </button>
            </div>
          </div>
        </div>

        {/* Search, Filter & View Controls */}
        <div className="bg-[#141612]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Team ID, Squad Name, College, City, Captain..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/15 bg-black/50 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d0fe1d] focus:ring-1 focus:ring-[#d0fe1d]/30"
              />
            </div>

            {/* Division Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">Division:</span>
              {(['ALL', 'CLASS_20', 'CLASS_40'] as const).map((div) => (
                <button
                  key={div}
                  onClick={() => setSelectedDivision(div)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedDivision === div
                      ? 'bg-[#d0fe1d] text-black shadow-[0_0_15px_rgba(208,254,29,0.3)]'
                      : 'bg-white/5 border border-white/10 text-neutral-300 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {div === 'ALL' ? 'All Divisions' : div === 'CLASS_20' ? 'Class 20' : 'Class 40'}
                </button>
              ))}

              <div className="h-4 w-px bg-white/15 mx-1 hidden sm:block" />

              {/* View Toggle */}
              <div className="flex items-center bg-black/60 border border-white/10 rounded-lg p-0.5">
                <button
                  onClick={() => setActiveView('sheet')}
                  className={`px-3 py-1 rounded-md text-xs font-rajdhani font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeView === 'sheet'
                      ? 'bg-[#d0fe1d] text-black shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Spreadsheet
                </button>
                <button
                  onClick={() => setActiveView('cards')}
                  className={`px-3 py-1 rounded-md text-xs font-rajdhani font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeView === 'cards'
                      ? 'bg-[#d0fe1d] text-black shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Squad Dossiers
                </button>
                <button
                  onClick={() => setActiveView('live_google_sheet')}
                  className={`px-3 py-1 rounded-md text-xs font-rajdhani font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeView === 'live_google_sheet'
                      ? 'bg-[#d0fe1d] text-black shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>Google Sheet (Live)</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </button>
              </div>
            </div>
          </div>

          {/* Table View (Spreadsheet Row Replica) */}
          {activeView === 'sheet' && (
            <div className="overflow-x-auto rounded-2xl border border-white/15 bg-black/40">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-[#0e100d] text-neutral-400 font-mono uppercase text-[11px] border-b border-white/15">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Team ID</th>
                    <th className="py-3 px-4">Squad Name</th>
                    <th className="py-3 px-4">Division</th>
                    <th className="py-3 px-4">Institution</th>
                    <th className="py-3 px-4">City / State</th>
                    <th className="py-3 px-4">Captain</th>
                    <th className="py-3 px-4">Captain Phone</th>
                    <th className="py-3 px-4">Captain Email</th>
                    <th className="py-3 px-4">Drone Model</th>
                    <th className="py-3 px-4">VTX Band</th>
                    <th className="py-3 px-4">Fee Paid</th>
                    <th className="py-3 px-4">Receipt No</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {filteredTeams.length === 0 ? (
                    <tr>
                      <td colSpan={15} className="py-8 text-center text-neutral-400 font-mono">
                        No registered squads matched the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTeams.map((t, idx) => (
                      <tr key={t.teamId} className="hover:bg-white/[0.04] transition-colors">
                        <td className="py-3 px-4 font-mono text-neutral-500">{idx + 1}</td>
                        <td className="py-3 px-4 font-mono font-bold text-[#d0fe1d]">{t.teamId}</td>
                        <td className="py-3 px-4 font-bold text-white">{t.teamName}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              t.division.includes('20')
                                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                                : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                            }`}
                          >
                            {t.division}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-neutral-300 max-w-[200px] truncate" title={t.institution}>
                          {t.institution}
                        </td>
                        <td className="py-3 px-4 text-neutral-400">
                          {t.city}, {t.state}
                        </td>
                        <td className="py-3 px-4 font-medium text-white">{t.captainName}</td>
                        <td className="py-3 px-4 font-mono text-neutral-300">{t.captainPhone}</td>
                        <td className="py-3 px-4 text-neutral-300">{t.captainEmail}</td>
                        <td className="py-3 px-4 text-neutral-300">{t.droneModel}</td>
                        <td className="py-3 px-4 font-mono text-neutral-300">{t.vtxBand}</td>
                        <td className="py-3 px-4 font-mono font-bold text-[#d0fe1d]">
                          {t.paymentInfo?.amount || getDivisionFee(t.division).formatted}
                        </td>
                        <td className="py-3 px-4 font-mono text-neutral-400">
                          {t.paymentInfo?.receiptNo || 'PENDING'}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={t.paymentInfo?.status || 'VERIFIED'}
                            onChange={(e) =>
                              handleQuickUpdatePaymentStatus(
                                t.teamId,
                                e.target.value
                              )
                            }
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border cursor-pointer outline-none transition-all ${
                              (t.paymentInfo?.status || 'VERIFIED') === 'PAYMENT REQUESTED'
                                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/60 hover:border-cyan-400'
                                : (t.paymentInfo?.status || 'VERIFIED') === 'PENDING'
                                ? 'bg-amber-950/80 text-amber-300 border-amber-500/60 hover:border-amber-400'
                                : (t.paymentInfo?.status || 'VERIFIED') === 'PAID'
                                ? 'bg-blue-950/80 text-blue-300 border-blue-500/60 hover:border-blue-400'
                                : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 hover:border-emerald-400'
                            }`}
                            title="Click to update registration payment status"
                          >
                            <option value="PAYMENT REQUESTED" className="bg-[#141612] text-cyan-300">
                              📩 PAYMENT REQUESTED
                            </option>
                            <option value="PENDING" className="bg-[#141612] text-amber-300">
                              ⏳ PENDING
                            </option>
                            <option value="PAID" className="bg-[#141612] text-blue-300">
                              ✓ PAID
                            </option>
                            <option value="VERIFIED" className="bg-[#141612] text-emerald-300">
                              ✓ VERIFIED
                            </option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openTeamModal(t, false)}
                              className="px-2.5 py-1 rounded-lg bg-[#d0fe1d]/10 hover:bg-[#d0fe1d] text-[#d0fe1d] hover:text-black font-rajdhani font-bold text-xs uppercase transition-all cursor-pointer"
                            >
                              Dossier
                            </button>
                            <button
                              onClick={() => openTeamModal(t, true)}
                              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-[#d0fe1d] text-white hover:text-black font-rajdhani font-bold text-xs uppercase transition-all cursor-pointer"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Cards View */}
          {activeView === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {filteredTeams.map((t) => (
                <div
                  key={t.teamId}
                  className="bg-[#1b1e17] border border-white/10 hover:border-[#d0fe1d]/40 rounded-2xl p-5 shadow-xl transition-all space-y-4 text-left"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#d0fe1d] block">{t.teamId}</span>
                      <h3 className="font-orbitron font-black text-white text-base mt-0.5">{t.teamName}</h3>
                      <p className="text-xs text-neutral-400 truncate max-w-[220px]">{t.institution}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        t.division.includes('20')
                          ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                          : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {t.division}
                    </span>
                  </div>

                  <div className="text-xs space-y-1.5 pt-2 border-t border-white/10 text-neutral-300">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Captain:</span>
                      <span className="font-semibold text-white">{t.captainName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Striker:</span>
                      <span className="text-neutral-200">{t.strikerPilot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Goalkeeper:</span>
                      <span className="text-neutral-200">{t.goalkeeper}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Drone Hardware:</span>
                      <span className="font-mono text-[11px] text-neutral-200">{t.droneModel} ({t.vtxBand})</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Entry Fee:</span>
                      <span
                        className={`font-mono font-bold ${
                          t.paymentInfo?.status === 'PENDING' ? 'text-amber-400' : 'text-[#d0fe1d]'
                        }`}
                      >
                        {t.paymentInfo?.amount || getDivisionFee(t.division).formatted}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-white/5">
                      <span className="text-neutral-400">Registration Status:</span>
                      <select
                        value={t.paymentInfo?.status || 'VERIFIED'}
                        onChange={(e) =>
                          handleQuickUpdatePaymentStatus(
                            t.teamId,
                            e.target.value
                          )
                        }
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border cursor-pointer outline-none ${
                          (t.paymentInfo?.status || 'VERIFIED') === 'PAYMENT REQUESTED'
                            ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/60'
                            : (t.paymentInfo?.status || 'VERIFIED') === 'PENDING'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-500/60'
                            : (t.paymentInfo?.status || 'VERIFIED') === 'PAID'
                            ? 'bg-blue-950/80 text-blue-300 border-blue-500/60'
                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60'
                        }`}
                      >
                        <option value="PAYMENT REQUESTED" className="bg-[#141612] text-cyan-300">📩 PAYMENT REQUESTED</option>
                        <option value="PENDING" className="bg-[#141612] text-amber-300">⏳ PENDING</option>
                        <option value="PAID" className="bg-[#141612] text-blue-300">✓ PAID</option>
                        <option value="VERIFIED" className="bg-[#141612] text-emerald-300">✓ VERIFIED</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-white/10">
                    <span className="text-[11px] font-mono text-neutral-400">
                      Receipt: {t.paymentInfo?.receiptNo}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openTeamModal(t, true)}
                        className="px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 text-white hover:border-[#d0fe1d] hover:text-[#d0fe1d] text-xs font-rajdhani font-bold uppercase transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openTeamModal(t, false)}
                        className="px-3 py-1.5 rounded-lg bg-[#d0fe1d] text-black text-xs font-orbitron font-bold uppercase hover:bg-[#e2ff54] transition-colors cursor-pointer"
                      >
                        View Dossier
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Live Google Sheet View (Embedded or Interactive Table) */}
          {activeView === 'live_google_sheet' && (
            <div className="space-y-4">
              {sheetsConfig.spreadsheetId ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-black/60 border border-white/10 rounded-2xl">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#d0fe1d] animate-pulse" />
                      <div className="text-left">
                        <span className="text-xs font-mono font-bold text-white block">
                          {sheetsConfig.spreadsheetTitle}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-400">
                          {sheetsConfig.spreadsheetId &&
                          sheetsConfig.spreadsheetId.length > 20 &&
                          !sheetsConfig.spreadsheetId.startsWith('attached') ? (
                            <>
                              Spreadsheet ID: <code className="text-[#d0fe1d]">{sheetsConfig.spreadsheetId}</code> · Real-Time Google Cloud Sync
                            </>
                          ) : (
                            <>
                              Attached Google Sheet Database · <code className="text-[#d0fe1d]">{teams.length} Teams Linked</code> · Dynamic Auto-Append
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handlePushToSheets}
                        disabled={isSyncing}
                        className="px-3.5 py-1.5 rounded-xl border border-white/20 bg-white/5 hover:border-[#d0fe1d] hover:text-[#d0fe1d] text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        {isSyncing ? (
                          <span className="w-3 h-3 border-2 border-[#d0fe1d] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span>🔄</span>
                        )}
                        <span>Sync Sheet</span>
                      </button>
                      <a
                        href="/api/excel/download"
                        download="GDSL_2026_Teams_Roster.xlsx"
                        className="px-3.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold transition-all flex items-center gap-1.5"
                      >
                        <span>📥 Download .XLSX</span>
                      </a>
                      <a
                        href="/assets/aistudio/GDSL_2026_-_Galgotias_Drone_Soccer_League__Teams___Rosters__2676c7ff"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs font-mono font-bold transition-all flex items-center gap-1.5"
                      >
                        <span>📄 View Attached CSV</span>
                      </a>
                      {sheetsConfig.spreadsheetId &&
                        sheetsConfig.spreadsheetId.length > 20 &&
                        !sheetsConfig.spreadsheetId.startsWith('attached') && (
                          <a
                            href={
                              sheetsConfig.spreadsheetUrl ||
                              `https://docs.google.com/spreadsheets/d/${sheetsConfig.spreadsheetId}/edit`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-1.5 rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] text-black text-xs font-orbitron font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(208,254,29,0.3)] flex items-center gap-1.5"
                          >
                            <span>Open in Google Sheets</span>
                            <span>↗</span>
                          </a>
                        )}
                      <button
                        onClick={handleUnlinkSheet}
                        className="px-3 py-1.5 rounded-xl border border-rose-500/30 hover:border-rose-500 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-mono transition-all cursor-pointer"
                        title="Unlink current Google Sheet"
                      >
                        Change / Unlink
                      </button>
                    </div>
                  </div>

                  {sheetsConfig.spreadsheetId &&
                  sheetsConfig.spreadsheetId.length > 20 &&
                  !sheetsConfig.spreadsheetId.startsWith('attached') ? (
                    <div className="relative w-full h-[650px] sm:h-[750px] rounded-2xl overflow-hidden border border-white/20 bg-white shadow-2xl">
                      <iframe
                        src={`https://docs.google.com/spreadsheets/d/${sheetsConfig.spreadsheetId}/edit?rm=minimal&widget=true`}
                        className="w-full h-full border-0"
                        title="Google Sheet Live View"
                        allow="clipboard-write"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Google Sheets Header bar */}
                      <div className="rounded-2xl border border-emerald-500/30 bg-[#0f1912] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl shrink-0">
                            📊
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-orbitron font-bold text-sm text-white">
                                {sheetsConfig.spreadsheetTitle}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                LINKED DATABASE
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-neutral-400 block mt-0.5">
                              {teams.length} Registered Squads · Synchronized with tournament engine · Auto-appends new entries
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Live Auto-Sync Active
                          </span>
                        </div>
                      </div>

                      {/* Full Spreadsheet Grid */}
                      <div className="overflow-x-auto rounded-2xl border border-white/15 bg-black/50 shadow-2xl max-h-[600px] overflow-y-auto">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                          <thead className="sticky top-0 z-20 bg-[#121611] text-emerald-400 font-mono uppercase text-[11px] border-b border-emerald-500/30 shadow-md">
                            <tr>
                              <th className="py-3 px-3">#</th>
                              <th className="py-3 px-3">Team ID</th>
                              <th className="py-3 px-3">Team Name</th>
                              <th className="py-3 px-3">Division</th>
                              <th className="py-3 px-3">Institution</th>
                              <th className="py-3 px-3">City / State</th>
                              <th className="py-3 px-3">Captain Name</th>
                              <th className="py-3 px-3">Captain Email</th>
                              <th className="py-3 px-3">Captain Phone</th>
                              <th className="py-3 px-3">Striker</th>
                              <th className="py-3 px-3">Goalkeeper</th>
                              <th className="py-3 px-3">Defender 1</th>
                              <th className="py-3 px-3">Defender 2</th>
                              <th className="py-3 px-3">Mechanic</th>
                              <th className="py-3 px-3">Drone Model</th>
                              <th className="py-3 px-3">Protocol</th>
                              <th className="py-3 px-3">VTX Band</th>
                              <th className="py-3 px-3">Scrutineering</th>
                              <th className="py-3 px-3">Pit Allocation</th>
                              <th className="py-3 px-3">Payment</th>
                              <th className="py-3 px-3">Receipt No</th>
                              <th className="py-3 px-3">Reg Date</th>
                              <th className="py-3 px-3">Faculty Mentor</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                            {teams.map((t, idx) => (
                              <tr key={t.teamId} className="hover:bg-emerald-500/[0.06] transition-colors">
                                <td className="py-2.5 px-3 text-neutral-500 font-bold">{idx + 1}</td>
                                <td className="py-2.5 px-3 font-bold text-[#d0fe1d]">{t.teamId}</td>
                                <td className="py-2.5 px-3 text-white font-sans font-bold">{t.teamName}</td>
                                <td className="py-2.5 px-3 text-neutral-300">{t.division}</td>
                                <td className="py-2.5 px-3 text-neutral-400 max-w-[180px] truncate" title={t.institution}>
                                  {t.institution}
                                </td>
                                <td className="py-2.5 px-3 text-neutral-400">
                                  {t.city}, {t.state}
                                </td>
                                <td className="py-2.5 px-3 text-white font-sans">{t.captainName}</td>
                                <td className="py-2.5 px-3 text-neutral-300">{t.captainEmail}</td>
                                <td className="py-2.5 px-3 text-neutral-300">{t.captainPhone}</td>
                                <td className="py-2.5 px-3 text-neutral-400">{t.strikerPilot}</td>
                                <td className="py-2.5 px-3 text-neutral-400">{t.goalkeeper}</td>
                                <td className="py-2.5 px-3 text-neutral-400">{t.defender1}</td>
                                <td className="py-2.5 px-3 text-neutral-400">{t.defender2}</td>
                                <td className="py-2.5 px-3 text-neutral-400">{t.pitMechanic}</td>
                                <td className="py-2.5 px-3 text-neutral-300">{t.droneModel}</td>
                                <td className="py-2.5 px-3 text-neutral-400">{t.controlProtocol}</td>
                                <td className="py-2.5 px-3 text-neutral-400">{t.vtxBand}</td>
                                <td className="py-2.5 px-3">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      t.scrutineeringStatus === 'PRE_APPROVED'
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : 'bg-amber-500/20 text-amber-300'
                                    }`}
                                  >
                                    {t.scrutineeringStatus}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-neutral-400">{t.allocatedPit}</td>
                                <td className="py-2.5 px-3">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      t.paymentInfo?.status === 'VERIFIED'
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : t.paymentInfo?.status === 'PAID'
                                        ? 'bg-blue-500/20 text-blue-300'
                                        : t.paymentInfo?.status === 'PAYMENT REQUESTED'
                                        ? 'bg-cyan-500/20 text-cyan-300'
                                        : 'bg-amber-500/20 text-amber-300'
                                    }`}
                                  >
                                    {t.paymentInfo?.status || 'PENDING'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-neutral-400">
                                  {t.paymentInfo?.receiptNo || 'PENDING'}
                                </td>
                                <td className="py-2.5 px-3 text-neutral-400">{t.registeredAt}</td>
                                <td className="py-2.5 px-3 text-neutral-400">
                                  {t.attendanceData?.facultyName || 'Pending Dean Endorsement'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Optional Cloud Link Box */}
                      <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-left">
                          <span className="text-xs font-orbitron font-bold text-white block">
                            Have a Google Cloud Spreadsheet URL?
                          </span>
                          <span className="text-[11px] font-mono text-neutral-400">
                            Paste your docs.google.com link anytime to also view Google Drive's live iframe directly in this tab.
                          </span>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <input
                            type="text"
                            value={sheetInputUrl}
                            onChange={(e) => setSheetInputUrl(e.target.value)}
                            placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                            className="px-3 py-2 bg-black/80 border border-white/20 rounded-xl text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-[#d0fe1d] w-full sm:w-80"
                          />
                          <button
                            onClick={handleConnectExistingSheet}
                            className="px-4 py-2 bg-[#d0fe1d] hover:bg-[#e2ff54] text-black font-orbitron font-bold text-xs uppercase rounded-xl transition-all shrink-0 cursor-pointer"
                          >
                            Save URL
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 px-6 text-center bg-black/40 border border-white/10 rounded-2xl space-y-6 max-w-2xl mx-auto">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center text-3xl">
                    📑
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-orbitron font-bold text-lg text-white">Permanently Link Your Google Sheet Database</h3>
                    <p className="text-xs text-neutral-400 max-w-md mx-auto">
                      Paste your Google Spreadsheet URL or ID below to bind it permanently as the primary tournament database. All team registrations, payments, and scrutineering statuses will sync in real time.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={sheetInputUrl}
                      onChange={(e) => setSheetInputUrl(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit"
                      className="px-4 py-3 rounded-xl border border-white/20 bg-black/60 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d0fe1d] w-full font-mono"
                    />
                    <button
                      onClick={handleConnectExistingSheet}
                      className="px-5 py-3 rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] text-black font-orbitron font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0"
                    >
                      Save &amp; Link Sheet
                    </button>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-center gap-3">
                    <span className="text-xs text-neutral-400 font-mono">Or create one automatically:</span>
                    {googleUser ? (
                      <button
                        onClick={handleCreateNewGoogleSheet}
                        disabled={isCreatingSheet}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-orbitron font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isCreatingSheet ? (
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span>+</span>
                        )}
                        <span>Create Live GDSL Google Sheet</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleGoogleSignIn}
                        disabled={isConnectingGoogle}
                        className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-sans font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                      >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        </svg>
                        <span>{isConnectingGoogle ? 'Connecting...' : 'Sign in with Google to Auto-Generate'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Team Dossier Detail & Full Edit Modal */}
      {selectedTeam && editTeamForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#141612] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#d0fe1d]/40 shadow-[0_0_60px_rgba(0,0,0,0.9)] p-6 sm:p-8 space-y-6 text-left">
            <div className="flex items-start justify-between border-b border-white/10 pb-4 gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#d0fe1d]">
                  {selectedTeam.teamId} · {selectedTeam.division}
                </span>
                <h2 className="text-2xl font-orbitron font-black text-white uppercase mt-1 tracking-wider">
                  {selectedTeam.teamName}
                </h2>
                <p className="text-xs text-neutral-400">
                  {selectedTeam.institution} · {selectedTeam.city}, {selectedTeam.state}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditTeamForm(JSON.parse(JSON.stringify(selectedTeam)));
                    setIsEditingTeam(!isEditingTeam);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#d0fe1d]/15 border border-[#d0fe1d]/40 text-[#d0fe1d] hover:bg-[#d0fe1d] hover:text-black font-orbitron font-bold text-xs uppercase transition-all cursor-pointer"
                >
                  {isEditingTeam ? 'Cancel Edit' : 'Edit All Details'}
                </button>
                <button
                  onClick={() => {
                    setSelectedTeam(null);
                    setIsEditingTeam(false);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-neutral-300 hover:text-white font-bold text-sm cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {isEditingTeam ? (
              <form onSubmit={handleSaveEditedTeam} className="space-y-5 text-xs">
                {/* 1. Team & Institution */}
                <div className="space-y-3">
                  <h4 className="font-orbitron font-bold text-[#d0fe1d] text-xs uppercase tracking-wider">
                    1. Team &amp; Institution Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Team Name</label>
                      <input
                        type="text"
                        required
                        value={editTeamForm.teamName}
                        onChange={(e) => setEditTeamForm({ ...editTeamForm, teamName: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Institution</label>
                      <input
                        type="text"
                        required
                        value={editTeamForm.institution}
                        onChange={(e) => setEditTeamForm({ ...editTeamForm, institution: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Division</label>
                      <select
                        value={editTeamForm.division}
                        onChange={(e) =>
                          setEditTeamForm({
                            ...editTeamForm,
                            division: e.target.value as 'Class 40 (400mm)' | 'Class 20 (200mm)',
                          })
                        }
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white"
                      >
                        <option value="Class 40 (400mm)">Class 40 (400mm)</option>
                        <option value="Class 20 (200mm)">Class 20 (200mm)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">City</label>
                      <input
                        type="text"
                        value={editTeamForm.city}
                        onChange={(e) => setEditTeamForm({ ...editTeamForm, city: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">State</label>
                      <input
                        type="text"
                        value={editTeamForm.state}
                        onChange={(e) => setEditTeamForm({ ...editTeamForm, state: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Access Code</label>
                      <input
                        type="text"
                        value={editTeamForm.accessCode}
                        onChange={(e) => setEditTeamForm({ ...editTeamForm, accessCode: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Pilot Roster */}
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <h4 className="font-orbitron font-bold text-[#d0fe1d] text-xs uppercase tracking-wider">
                    2. Captain &amp; Squad Pilots (6 Members)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Captain Name</label>
                      <input
                        type="text"
                        value={editTeamForm.captainName}
                        onChange={(e) => setEditTeamForm({ ...editTeamForm, captainName: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Captain Email</label>
                      <input
                        type="email"
                        value={editTeamForm.captainEmail}
                        onChange={(e) => setEditTeamForm({ ...editTeamForm, captainEmail: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Captain Phone</label>
                      <input
                        type="text"
                        value={editTeamForm.captainPhone}
                        onChange={(e) => setEditTeamForm({ ...editTeamForm, captainPhone: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Striker Pilot</label>
                      <input
                        type="text"
                        value={editTeamForm.strikerPilot}
                        onChange={(e) => setEditTeamForm({ ...editTeamForm, strikerPilot: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Goalkeeper Pilot</label>
                      <input
                        type="text"
                        value={editTeamForm.goalkeeper}
                        onChange={(e) => setEditTeamForm({ ...editTeamForm, goalkeeper: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Defender 1</label>
                      <input
                        type="text"
                        value={editTeamForm.defender1}
                        onChange={(e) => setEditTeamForm({ ...editTeamForm, defender1: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Defender 2</label>
                      <input
                        type="text"
                        value={editTeamForm.defender2}
                        onChange={(e) => setEditTeamForm({ ...editTeamForm, defender2: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Pit Mechanic</label>
                      <input
                        type="text"
                        value={editTeamForm.pitMechanic}
                        onChange={(e) => setEditTeamForm({ ...editTeamForm, pitMechanic: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Hardware & Payment */}
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <h4 className="font-orbitron font-bold text-[#d0fe1d] text-xs uppercase tracking-wider">
                    3. Hardware, Pit Bay &amp; Payment Status
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Drone Model</label>
                      <input
                        type="text"
                        value={editTeamForm.droneModel}
                        onChange={(e) => setEditTeamForm({ ...editTeamForm, droneModel: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Control Protocol</label>
                      <input
                        type="text"
                        value={editTeamForm.controlProtocol}
                        onChange={(e) => setEditTeamForm({ ...editTeamForm, controlProtocol: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">VTX Band</label>
                      <input
                        type="text"
                        value={editTeamForm.vtxBand}
                        onChange={(e) => setEditTeamForm({ ...editTeamForm, vtxBand: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Allocated Pit Bay</label>
                      <input
                        type="text"
                        value={editTeamForm.allocatedPit}
                        onChange={(e) => setEditTeamForm({ ...editTeamForm, allocatedPit: e.target.value })}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Payment Status</label>
                      <select
                        value={editTeamForm.paymentInfo.status}
                        onChange={(e) =>
                          setEditTeamForm({
                            ...editTeamForm,
                            paymentInfo: {
                              ...editTeamForm.paymentInfo,
                              status: e.target.value as any,
                            },
                          })
                        }
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-mono"
                      >
                        <option value="VERIFIED">VERIFIED</option>
                        <option value="PAID">PAID</option>
                        <option value="PAYMENT REQUESTED">PAYMENT REQUESTED</option>
                        <option value="PENDING">PENDING</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px]">Receipt Number</label>
                      <input
                        type="text"
                        value={editTeamForm.paymentInfo.receiptNo}
                        onChange={(e) =>
                          setEditTeamForm({
                            ...editTeamForm,
                            paymentInfo: {
                              ...editTeamForm.paymentInfo,
                              receiptNo: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingTeam(false)}
                    className="px-4 py-2.5 rounded-xl border border-white/20 bg-white/5 text-neutral-300 hover:bg-white/10 text-xs font-rajdhani font-bold uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] text-black text-xs font-orbitron font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(208,254,29,0.3)]"
                  >
                    Save Team Changes
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Pilots Roster Grid */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
                    Official Roster Credentials
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#1b1e17] border border-white/10">
                      <span className="text-[10px] font-mono font-bold text-[#d0fe1d] block">CAPTAIN</span>
                      <span className="font-bold text-white block">{selectedTeam.captainName}</span>
                      <span className="text-neutral-400 text-[11px] block">{selectedTeam.captainPhone}</span>
                      <span className="text-neutral-400 text-[11px] block">{selectedTeam.captainEmail}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#1b1e17] border border-white/10">
                      <span className="text-[10px] font-mono font-bold text-neutral-400 block">STRIKER PILOT</span>
                      <span className="font-bold text-white block">{selectedTeam.strikerPilot}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#1b1e17] border border-white/10">
                      <span className="text-[10px] font-mono font-bold text-neutral-400 block">GOALKEEPER</span>
                      <span className="font-bold text-white block">{selectedTeam.goalkeeper}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#1b1e17] border border-white/10">
                      <span className="text-[10px] font-mono font-bold text-neutral-400 block">DEFENDER 1 &amp; 2</span>
                      <span className="font-bold text-white block">
                        {selectedTeam.defender1} / {selectedTeam.defender2}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#1b1e17] border border-white/10">
                      <span className="text-[10px] font-mono font-bold text-neutral-400 block">PIT MECHANIC</span>
                      <span className="font-bold text-white block">{selectedTeam.pitMechanic}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#1b1e17] border border-[#d0fe1d]/30">
                      <span className="text-[10px] font-mono font-bold text-[#d0fe1d] block">PAYMENT RECEIPT</span>
                      <span className="font-bold text-white block">
                        {selectedTeam.paymentInfo?.amount || getDivisionFee(selectedTeam.division).formatted} ({selectedTeam.paymentInfo?.status || 'VERIFIED'})
                      </span>
                      <span className="text-[#d0fe1d] font-mono text-[11px] block">
                        {selectedTeam.paymentInfo?.receiptNo}
                      </span>
                      {selectedTeam.paymentInfo?.transactionId && (
                        <span className="text-neutral-300 font-mono text-[10px] block mt-0.5">
                          UTR/TXN: {selectedTeam.paymentInfo.transactionId}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Uploaded Payment Proof & Email Request Details */}
                  {(selectedTeam.paymentInfo?.uploadedAt ||
                    selectedTeam.paymentInfo?.proofDataUrl ||
                    selectedTeam.paymentInfo?.emailRequestedTo) && (
                    <div className="p-4 rounded-2xl bg-[#1b1e17] border border-[#d0fe1d]/30 text-xs space-y-2 mt-3">
                      <span className="text-[10px] font-mono font-bold text-[#d0fe1d] uppercase block">
                        User Payment Submission &amp; Email Dispatch Log
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-300">
                        {selectedTeam.paymentInfo?.emailRequestedTo && (
                          <div>
                            <span className="text-neutral-400 block text-[11px]">Payment Details Emailed To:</span>
                            <span className="font-mono font-bold text-white">
                              {selectedTeam.paymentInfo.emailRequestedTo} ({selectedTeam.paymentInfo.emailRequestedAt})
                            </span>
                          </div>
                        )}
                        {selectedTeam.paymentInfo?.payerDetails && (
                          <div>
                            <span className="text-neutral-400 block text-[11px]">Payer / Sender Account:</span>
                            <span className="font-mono font-bold text-white">{selectedTeam.paymentInfo.payerDetails}</span>
                          </div>
                        )}
                        {selectedTeam.paymentInfo?.uploadedAt && (
                          <div>
                            <span className="text-neutral-400 block text-[11px]">Uploaded Timestamp:</span>
                            <span className="font-mono font-bold text-emerald-400">{selectedTeam.paymentInfo.uploadedAt}</span>
                          </div>
                        )}
                        {selectedTeam.paymentInfo?.remarks && (
                          <div>
                            <span className="text-neutral-400 block text-[11px]">User Remarks:</span>
                            <span className="text-white">{selectedTeam.paymentInfo.remarks}</span>
                          </div>
                        )}
                      </div>
                      {selectedTeam.paymentInfo?.proofDataUrl &&
                        selectedTeam.paymentInfo.proofDataUrl.startsWith('data:image') && (
                          <div className="pt-2">
                            <span className="text-neutral-400 block text-[11px] mb-1">
                              Uploaded Receipt Screenshot ({selectedTeam.paymentInfo.proofFileName || 'Proof'}):
                            </span>
                            <img
                              src={selectedTeam.paymentInfo.proofDataUrl}
                              alt="Uploaded Payment Proof"
                              className="max-h-48 rounded-xl border border-white/15 object-contain bg-black/60 p-1"
                            />
                          </div>
                        )}
                    </div>
                  )}
                </div>

                {/* Technical Specs */}
                <div className="p-4 rounded-2xl bg-[#1b1e17] border border-white/10 text-xs space-y-2">
                  <span className="text-[10px] font-mono font-bold text-[#d0fe1d] uppercase block">
                    Hardware Scrutineering Specifications
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-neutral-300">
                    <div>
                      <span className="text-neutral-400 block text-[11px]">Drone Frame:</span>
                      <span className="font-mono font-bold text-white">{selectedTeam.droneModel}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[11px]">Control Protocol:</span>
                      <span className="font-mono font-bold text-white">{selectedTeam.controlProtocol}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[11px]">5.8 GHz VTX Band:</span>
                      <span className="font-mono font-bold text-white">{selectedTeam.vtxBand}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[11px]">Allocated Pit Bay:</span>
                      <span className="font-mono font-bold text-white">{selectedTeam.allocatedPit}</span>
                    </div>
                  </div>
                </div>

                {/* Attendance OD Application */}
                {selectedTeam.attendanceData && (
                  <div className="p-4 rounded-2xl bg-[#1b1e17] border border-white/10 text-xs space-y-2">
                    <span className="text-[10px] font-mono font-bold text-[#d0fe1d] uppercase block">
                      Institutional OD Attendance Application
                    </span>
                    <p className="text-neutral-300">
                      Applied to: <span className="font-bold text-white">{selectedTeam.attendanceData.facultyName}</span> ({selectedTeam.attendanceData.department}, {selectedTeam.attendanceData.collegeName})
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      {selectedTeam.attendanceData.students?.length || 6} students included for official duty exemptions.
                    </p>
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingTeam(true)}
                    className="px-5 py-2.5 rounded-xl border border-[#d0fe1d]/50 bg-[#d0fe1d]/10 hover:bg-[#d0fe1d] text-[#d0fe1d] hover:text-black text-xs font-orbitron font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Edit Team Details
                  </button>
                  <button
                    onClick={() => setSelectedTeam(null)}
                    className="px-6 py-2.5 rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] text-black text-xs font-orbitron font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(208,254,29,0.3)]"
                  >
                    Close Dossier
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
