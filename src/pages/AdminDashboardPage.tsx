import React, { useState, useEffect } from 'react';
import { GcdisLogo } from '../components/GcdisLogo';
import {
  RegisteredTeamProfile,
  getRegisteredTeams,
  getDivisionFee,
} from '../data/teamAuthData';
import {
  fetchLiveSheetData,
  updateAllTournamentDataOnSheets,
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
  const [copiedLink, setCopiedLink] = useState(false);

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
    <div className="relative z-20 min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-10 bg-slate-50/80">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Admin Header Bar */}
        <div className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <GcdisLogo size="md" showWordmark={false} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                    👑 TOURNAMENT ADMIN &amp; SECRETARIAT
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                    GDSL 2026
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-sans font-black text-blue-950 uppercase mt-1">
                  Google Sheets Tournament Control Panel
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-mono mt-0.5">
                  Default Connected Account: <span className="font-bold text-blue-900">{DEFAULT_LINKED_ACCOUNT}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => onNavigate('home')}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Public Site
              </button>
              <button
                onClick={() => onNavigate('bracket')}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-blue-200 text-blue-800 bg-blue-50/50 hover:bg-blue-100/50 transition-colors cursor-pointer"
              >
                Fixtures
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
              >
                Logout Admin
              </button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4">
              <span className="text-xs font-mono font-bold text-blue-800 block">TOTAL SQUADS</span>
              <span className="text-3xl font-black font-sans text-blue-950 mt-1 block">
                {teams.length}
              </span>
              <span className="text-[11px] text-blue-600 mt-1 block">
                {teams.filter((t) => t.division.includes('20')).length} Class 20 · {teams.filter((t) => t.division.includes('40')).length} Class 40
              </span>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4">
              <span className="text-xs font-mono font-bold text-emerald-800 block">FEES COLLECTED</span>
              <span className="text-3xl font-black font-sans text-emerald-950 mt-1 block">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-emerald-600 mt-1 block">
                100% Verified Entry Fees
              </span>
            </div>

            <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-4">
              <span className="text-xs font-mono font-bold text-purple-800 block">REGISTERED PILOTS</span>
              <span className="text-3xl font-black font-sans text-purple-950 mt-1 block">
                {teams.length * 6}
              </span>
              <span className="text-[11px] text-purple-600 mt-1 block">
                6 Crew members per squad
              </span>
            </div>

            <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4">
              <span className="text-xs font-mono font-bold text-amber-800 block">SHEET SYNC STATUS</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-black font-sans text-amber-950">
                  {sheetData.fromGoogleSheets ? 'Live Cloud Connected' : 'Auto-Sync Active'}
                </span>
              </div>
              <span className="text-[11px] text-amber-700 mt-1 block font-mono truncate">
                {DEFAULT_LINKED_ACCOUNT}
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Banners */}
        {syncMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">✓</span>
              <span>{syncMessage}</span>
            </div>
            <button
              onClick={() => setSyncMessage(null)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-950 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {syncError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span>{syncError}</span>
            </div>
            <button
              onClick={() => setSyncError(null)}
              className="text-xs font-bold text-rose-700 hover:text-rose-950 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Google Sheets Live Integration Command Bar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <h2 className="text-lg font-sans font-black text-blue-950 uppercase">
                  Google Sheets Document Details
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Official Spreadsheet: <span className="font-semibold text-slate-700">GDSL 2026 - Galgotias Drone Soccer League (Teams &amp; Rosters)</span>
              </p>
              {sheetId && (
                <p className="text-[11px] text-slate-400 font-mono">
                  Sheet ID: <span className="text-slate-600 select-all">{sheetId}</span>
                </p>
              )}
            </div>

            {/* Direct Sheet Operations */}
            <div className="flex flex-wrap items-center gap-2">
              {sheetUrl ? (
                <a
                  href={sheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open Sheet in Google Drive</span>
                  <span>↗</span>
                </a>
              ) : (
                <button
                  onClick={handleAuthorizeDrive}
                  disabled={isSyncing}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>Create / Connect Sheet in Drive</span>
                  <span>↗</span>
                </button>
              )}

              <button
                onClick={handlePushToSheets}
                disabled={isSyncing}
                className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSyncing ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>🔄</span>
                )}
                <span>Sync / Push All to Sheet</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>📥</span>
                <span>Export CSV</span>
              </button>

              {sheetUrl && (
                <button
                  onClick={handleCopySheetLink}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
                  title="Copy Spreadsheet URL"
                >
                  {copiedLink ? '✓ Copied' : '🔗 Copy Link'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search, Filter & View Controls */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Team ID, Squad Name, College, City, Captain..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
              />
            </div>

            {/* Division Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">Division:</span>
              {(['ALL', 'CLASS_20', 'CLASS_40'] as const).map((div) => (
                <button
                  key={div}
                  onClick={() => setSelectedDivision(div)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    selectedDivision === div
                      ? 'bg-blue-950 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {div === 'ALL' ? 'All Divisions' : div === 'CLASS_20' ? 'Class 20' : 'Class 40'}
                </button>
              ))}

              <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

              {/* View Toggle */}
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                <button
                  onClick={() => setActiveView('sheet')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    activeView === 'sheet'
                      ? 'bg-white text-blue-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Spreadsheet
                </button>
                <button
                  onClick={() => setActiveView('cards')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    activeView === 'cards'
                      ? 'bg-white text-blue-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Squad Dossiers
                </button>
              </div>
            </div>
          </div>

          {/* Table View (Spreadsheet Row Replica) */}
          {activeView === 'sheet' && (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-100 text-slate-700 font-mono uppercase text-[11px] border-b border-slate-200">
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
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredTeams.length === 0 ? (
                    <tr>
                      <td colSpan={15} className="py-8 text-center text-slate-400 font-mono">
                        No registered squads matched the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTeams.map((t, idx) => (
                      <tr key={t.teamId} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-mono font-bold text-blue-900">{t.teamId}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{t.teamName}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              t.division.includes('20')
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {t.division}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 max-w-[200px] truncate" title={t.institution}>
                          {t.institution}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {t.city}, {t.state}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">{t.captainName}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{t.captainPhone}</td>
                        <td className="py-3 px-4 text-slate-600">{t.captainEmail}</td>
                        <td className="py-3 px-4 text-slate-600">{t.droneModel}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{t.vtxBand}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                          {t.paymentInfo?.amount || getDivisionFee(t.division).formatted}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {t.paymentInfo?.receiptNo || 'PENDING'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              t.paymentInfo?.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {t.paymentInfo?.status || 'VERIFIED'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setSelectedTeam(t)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Dossier ↗
                          </button>
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
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:border-blue-300 transition-all space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-900 block">{t.teamId}</span>
                      <h3 className="font-sans font-black text-slate-900 text-base">{t.teamName}</h3>
                      <p className="text-xs text-slate-500 truncate max-w-[220px]">{t.institution}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        t.division.includes('20')
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {t.division}
                    </span>
                  </div>

                  <div className="text-xs space-y-1.5 pt-2 border-t border-slate-100 text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Captain:</span>
                      <span className="font-semibold text-slate-800">{t.captainName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Striker:</span>
                      <span>{t.strikerPilot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Goalkeeper:</span>
                      <span>{t.goalkeeper}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Drone Hardware:</span>
                      <span className="font-mono text-[11px]">{t.droneModel} ({t.vtxBand})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Entry Fee:</span>
                      <span
                        className={`font-mono font-bold ${
                          t.paymentInfo?.status === 'PENDING' ? 'text-amber-700' : 'text-emerald-800'
                        }`}
                      >
                        {t.paymentInfo?.amount || getDivisionFee(t.division).formatted} ({t.paymentInfo?.status || 'VERIFIED'})
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="text-[11px] font-mono text-slate-400">
                      Receipt: {t.paymentInfo?.receiptNo}
                    </span>
                    <button
                      onClick={() => setSelectedTeam(t)}
                      className="px-3 py-1.5 rounded-lg bg-blue-900 text-white text-xs font-bold hover:bg-blue-950 transition-colors cursor-pointer"
                    >
                      View Dossier
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Team Dossier Detail Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-blue-200 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-blue-800">
                  {selectedTeam.teamId} · {selectedTeam.division}
                </span>
                <h2 className="text-2xl font-black font-sans text-blue-950 uppercase mt-0.5">
                  {selectedTeam.teamName}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedTeam.institution} · {selectedTeam.city}, {selectedTeam.state}
                </p>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Pilots Roster Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-slate-500 uppercase">
                Official Roster Credentials
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                  <span className="text-[10px] font-mono font-bold text-blue-800 block">CAPTAIN</span>
                  <span className="font-bold text-slate-900 block">{selectedTeam.captainName}</span>
                  <span className="text-slate-500 text-[11px] block">{selectedTeam.captainPhone}</span>
                  <span className="text-slate-500 text-[11px] block">{selectedTeam.captainEmail}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-mono font-bold text-slate-500 block">STRIKER PILOT</span>
                  <span className="font-bold text-slate-900 block">{selectedTeam.strikerPilot}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-mono font-bold text-slate-500 block">GOALKEEPER</span>
                  <span className="font-bold text-slate-900 block">{selectedTeam.goalkeeper}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-mono font-bold text-slate-500 block">DEFENDER 1 &amp; 2</span>
                  <span className="font-bold text-slate-900 block">
                    {selectedTeam.defender1} / {selectedTeam.defender2}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-mono font-bold text-slate-500 block">PIT MECHANIC</span>
                  <span className="font-bold text-slate-900 block">{selectedTeam.pitMechanic}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <span className="text-[10px] font-mono font-bold text-emerald-800 block">PAYMENT RECEIPT</span>
                  <span className="font-bold text-emerald-950 block">
                    {selectedTeam.paymentInfo?.amount || getDivisionFee(selectedTeam.division).formatted} ({selectedTeam.paymentInfo?.status || 'VERIFIED'})
                  </span>
                  <span className="text-emerald-700 font-mono text-[11px] block">
                    {selectedTeam.paymentInfo?.receiptNo}
                  </span>
                </div>
              </div>
            </div>

            {/* Technical Specs */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                Hardware Scrutineering Specifications
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[11px]">Drone Frame:</span>
                  <span className="font-mono font-bold">{selectedTeam.droneModel}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Control Protocol:</span>
                  <span className="font-mono font-bold">{selectedTeam.controlProtocol}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">5.8 GHz VTX Band:</span>
                  <span className="font-mono font-bold">{selectedTeam.vtxBand}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Allocated Pit Bay:</span>
                  <span className="font-mono font-bold">{selectedTeam.allocatedPit}</span>
                </div>
              </div>
            </div>

            {/* Attendance OD Application */}
            {selectedTeam.attendanceData && (
              <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 text-xs space-y-2">
                <span className="text-[10px] font-mono font-bold text-blue-800 uppercase block">
                  Institutional OD Attendance Application
                </span>
                <p className="text-slate-700">
                  Applied to: <span className="font-bold">{selectedTeam.attendanceData.facultyName}</span> ({selectedTeam.attendanceData.department}, {selectedTeam.attendanceData.collegeName})
                </p>
                <p className="text-[11px] text-slate-500">
                  {selectedTeam.attendanceData.students?.length || 6} students included for official duty exemptions.
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTeam(null)}
                className="px-6 py-2.5 rounded-xl bg-blue-950 text-white text-xs font-bold hover:bg-blue-900 transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
