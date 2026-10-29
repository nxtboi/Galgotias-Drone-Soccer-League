import React, { useState, useEffect } from 'react';
import { GcdisLogo } from '../components/GcdisLogo';
import {
  RegisteredTeamProfile,
  getRegisteredTeams,
  saveRegisteredTeam,
  getDivisionFee,
} from '../data/teamAuthData';
import {
  fetchLiveSheetData,
  updateAllTournamentDataOnSheets,
  syncTeamToSheet,
  getStoredSheetInfo,
  HEADERS,
} from '../services/googleSheetsService';
import {
  DEFAULT_LINKED_ACCOUNT,
  googleSignIn,
} from '../services/googleAuth';

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
  }>({
    headers: HEADERS,
    rows: [],
    fromGoogleSheets: false,
    spreadsheetId: null,
    spreadsheetUrl: null,
    lastSyncedAt: null,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [activeView, setActiveView] = useState<'sheet' | 'cards'>('sheet');
  const [selectedTeam, setSelectedTeam] = useState<RegisteredTeamProfile | null>(null);
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [editTeamForm, setEditTeamForm] = useState<RegisteredTeamProfile | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

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
    setSyncMessage(`Updated all details for ${editTeamForm.teamName} (${editTeamForm.teamId}).`);
    setTimeout(() => setSyncMessage(null), 5000);

    try {
      await syncTeamToSheet(editTeamForm);
      const liveData = await fetchLiveSheetData();
      setSheetData(liveData);
    } catch (err) {
      console.warn('Admin team edit sheet sync notice:', err);
    }
  };

  // Load team data and sheet info
  const loadData = async (forceRemote: boolean = false) => {
    setIsLoading(true);
    try {
      const currentTeams = getRegisteredTeams();
      setTeams(currentTeams);

      const liveData = await fetchLiveSheetData();
      setSheetData(liveData);
    } catch (err: any) {
      console.warn('Error loading admin sheet data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync / Push all teams to Google Sheets
  const handlePushToSheets = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    setSyncError(null);

    try {
      // Trigger interactive sync (user click gesture allows popup if needed)
      const res = await updateAllTournamentDataOnSheets(undefined, true);
      setSyncMessage(res.message);
      const updated = await fetchLiveSheetData();
      setSheetData(updated);
      setTimeout(() => setSyncMessage(null), 6000);
    } catch (err: any) {
      console.error('Admin sync error:', err);
      setSyncError(err.message || 'Failed to update Google Sheets.');
      setTimeout(() => setSyncError(null), 6000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Explicit Google Drive authorization
  const handleAuthorizeDrive = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    setSyncError(null);
    try {
      const res = await googleSignIn();
      if (res?.accessToken) {
        setSyncMessage(`Authorized with Google (${DEFAULT_LINKED_ACCOUNT}). Syncing data...`);
        const syncRes = await updateAllTournamentDataOnSheets(res.accessToken, false);
        setSyncMessage(syncRes.message);
        const updated = await fetchLiveSheetData(res.accessToken);
        setSheetData(updated);
      } else {
        setSyncMessage(`Active session preserved for ${DEFAULT_LINKED_ACCOUNT}.`);
      }
      setTimeout(() => setSyncMessage(null), 6000);
    } catch (err: any) {
      setSyncError(err.message || 'Google authorization interrupted.');
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

  const handleCopySheetLink = () => {
    const url = sheetData.spreadsheetUrl || getStoredSheetInfo().spreadsheetUrl;
    if (url) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
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

  const sheetUrl = sheetData.spreadsheetUrl || getStoredSheetInfo().spreadsheetUrl;
  const sheetId = sheetData.spreadsheetId || getStoredSheetInfo().spreadsheetId;

  return (
    <div className="relative z-20 min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-10 text-white font-sans">
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
                  Connected Sheets Account: <span className="font-bold text-[#d0fe1d]">{DEFAULT_LINKED_ACCOUNT}</span>
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
              <button
                onClick={onLogout}
                className="px-4 py-2 text-xs font-rajdhani font-bold uppercase tracking-wider rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-all cursor-pointer"
              >
                Logout Admin
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
              <span className="text-xs font-mono font-bold text-neutral-400 block uppercase tracking-wider">SHEET SYNC STATUS</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d0fe1d] animate-pulse" />
                <span className="text-sm font-orbitron font-bold text-white">
                  {sheetData.fromGoogleSheets ? 'Live Cloud Connected' : 'Auto-Sync Active'}
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block font-mono truncate">
                {DEFAULT_LINKED_ACCOUNT}
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

        {/* Google Sheets Live Integration Command Bar */}
        <div className="bg-[#141612]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <h2 className="text-lg font-orbitron font-black text-white uppercase tracking-wider">
                  Google Sheets Document Details
                </h2>
              </div>
              <p className="text-xs text-neutral-400">
                Official Spreadsheet: <span className="font-semibold text-white">GDSL 2026 - Galgotias Drone Soccer League (Teams &amp; Rosters)</span>
              </p>
              {sheetId && (
                <p className="text-[11px] text-neutral-400 font-mono">
                  Sheet ID: <span className="text-[#d0fe1d] select-all">{sheetId}</span>
                </p>
              )}
            </div>

            {/* Direct Sheet Operations */}
            <div className="flex flex-wrap items-center gap-2.5">
              {sheetUrl ? (
                <a
                  href={sheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] text-black text-xs font-orbitron font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(208,254,29,0.3)] flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open Sheet in Google Drive</span>
                  <span>↗</span>
                </a>
              ) : (
                <button
                  onClick={handleAuthorizeDrive}
                  disabled={isSyncing}
                  className="px-4 py-2.5 rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] text-black text-xs font-orbitron font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(208,254,29,0.3)] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>Create / Connect Sheet in Drive</span>
                  <span>↗</span>
                </button>
              )}

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
                <span>Sync / Push All to Sheet</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="px-4 py-2.5 rounded-xl border border-white/20 bg-white/5 hover:border-[#d0fe1d] hover:text-[#d0fe1d] text-neutral-200 text-xs font-rajdhani font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>📥</span>
                <span>Export CSV</span>
              </button>

              {sheetUrl && (
                <button
                  onClick={handleCopySheetLink}
                  className="px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono transition-colors cursor-pointer"
                  title="Copy Spreadsheet URL"
                >
                  {copiedLink ? '✓ Copied' : '🔗 Copy Link'}
                </button>
              )}
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
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              t.paymentInfo?.status === 'PENDING'
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {t.paymentInfo?.status || 'VERIFIED'}
                          </span>
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
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Entry Fee:</span>
                      <span
                        className={`font-mono font-bold ${
                          t.paymentInfo?.status === 'PENDING' ? 'text-amber-400' : 'text-[#d0fe1d]'
                        }`}
                      >
                        {t.paymentInfo?.amount || getDivisionFee(t.division).formatted} ({t.paymentInfo?.status || 'VERIFIED'})
                      </span>
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
                              status: e.target.value as 'PENDING' | 'PAID' | 'VERIFIED',
                            },
                          })
                        }
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-white font-mono"
                      >
                        <option value="VERIFIED">VERIFIED</option>
                        <option value="PAID">PAID</option>
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
                    </div>
                  </div>
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
