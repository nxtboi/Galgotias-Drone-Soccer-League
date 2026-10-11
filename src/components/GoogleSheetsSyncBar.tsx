import React, { useState, useEffect } from 'react';
import {
  initAuth,
  getCurrentUser,
  DEFAULT_LINKED_ACCOUNT,
} from '../services/googleAuth';
import {
  getStoredSheetInfo,
  syncAllTeamsToSheet,
  SheetConnectionInfo,
} from '../services/googleSheetsService';
import { getRegisteredTeams } from '../data/teamAuthData';

interface GoogleSheetsSyncBarProps {
  className?: string;
  variant?: 'banner' | 'card' | 'compact';
}

export const GoogleSheetsSyncBar: React.FC<GoogleSheetsSyncBarProps> = ({
  className = '',
  variant = 'card',
}) => {
  const [user, setUser] = useState(getCurrentUser());
  const [isSyncing, setIsSyncing] = useState(false);
  const [sheetInfo, setSheetInfo] = useState<SheetConnectionInfo>(getStoredSheetInfo());
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser) => {
        setUser(authUser);
        setSheetInfo(getStoredSheetInfo());
      },
      () => {
        setUser({ email: DEFAULT_LINKED_ACCOUNT, displayName: 'vk16122001' } as any);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleExecuteBatchSync = async () => {
    setIsSyncing(true);
    setErrorMsg(null);
    try {
      const teams = getRegisteredTeams();
      const result = await syncAllTeamsToSheet(teams);
      setSheetInfo(getStoredSheetInfo());
      setSyncStatusMsg(result.message);
      setTimeout(() => setSyncStatusMsg(null), 5000);
    } catch (err: any) {
      console.error('Sync failed:', err);
      setErrorMsg(err.message || 'Failed to sync squad data to Google Sheets.');
    } finally {
      setIsSyncing(false);
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 text-xs ${className}`}>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold truncate max-w-[150px]">Sheets Linked ({DEFAULT_LINKED_ACCOUNT})</span>
          {sheetInfo.spreadsheetUrl && (
            <a
              href={sheetInfo.spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-emerald-950 font-bold ml-1"
            >
              Open ↗
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs transition-all text-left ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Branding & Status */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-600">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H6v-2h6v2zm4-4H6v-2h10v2zm0-4H6V7h10v2z" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Google Sheets Live Roster Sync</h3>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LINKED ({DEFAULT_LINKED_ACCOUNT})
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-0.5">
              <span>
                Synchronizing squad registrations &amp; updates to{' '}
                <strong className="text-slate-700">GDSL 2026 - Teams &amp; Rosters</strong> sheet ({DEFAULT_LINKED_ACCOUNT})
              </span>
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {sheetInfo.spreadsheetUrl && (
            <a
              href={sheetInfo.spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5"
              title="Open live spreadsheet in Google Sheets"
            >
              <span>Open Sheet</span>
              <span>↗</span>
            </a>
          )}

          <button
            type="button"
            onClick={handleExecuteBatchSync}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isSyncing ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>🔄</span>
            )}
            <span>Update All Squads</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {syncStatusMsg && (
        <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span>✅ {syncStatusMsg}</span>
          <button onClick={() => setSyncStatusMsg(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">
            ✕
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-600 hover:text-rose-900 font-bold">
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
export default GoogleSheetsSyncBar;
