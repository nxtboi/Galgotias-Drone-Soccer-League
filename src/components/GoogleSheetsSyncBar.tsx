import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getCurrentUser,
  getAccessToken,
} from '../services/googleAuth';
import {
  getStoredSheetInfo,
  syncAllTeamsToSheet,
  SheetConnectionInfo,
} from '../services/googleSheetsService';
import { getRegisteredTeams } from '../data/teamAuthData';
import { SheetsConfirmModal } from './SheetsConfirmModal';

interface GoogleSheetsSyncBarProps {
  className?: string;
  variant?: 'banner' | 'card' | 'compact';
}

export const GoogleSheetsSyncBar: React.FC<GoogleSheetsSyncBarProps> = ({
  className = '',
  variant = 'card',
}) => {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [sheetInfo, setSheetInfo] = useState<SheetConnectionInfo>(getStoredSheetInfo());
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser) => {
        setUser(authUser);
        setSheetInfo(getStoredSheetInfo());
      },
      () => {
        setUser(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    setErrorMsg(null);
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setSheetInfo(getStoredSheetInfo());
        setSyncStatusMsg(`Connected as ${res.user.email}`);
        setTimeout(() => setSyncStatusMsg(null), 4000);
      }
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      setErrorMsg(err.message || 'Failed to authenticate with Google.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutGoogle();
      setUser(null);
      setSyncStatusMsg('Disconnected from Google Workspace.');
      setTimeout(() => setSyncStatusMsg(null), 3000);
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  const handleExecuteBatchSync = async () => {
    setIsSyncing(true);
    setErrorMsg(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Google authentication session expired. Please sign in again.');
      }
      const teams = getRegisteredTeams();
      const result = await syncAllTeamsToSheet(teams, token);
      setSheetInfo(getStoredSheetInfo());
      setSyncStatusMsg(result.message);
      setShowBatchModal(false);
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
        {user ? (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold truncate max-w-[150px]">Sheets Linked ({user.email?.split('@')[0]})</span>
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
        ) : (
          <button
            onClick={handleSignIn}
            disabled={isLoggingIn}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-3 py-1.5 rounded-full font-bold shadow-2xs hover:shadow-xs transition-all"
          >
            {/* Google G Icon */}
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.02h3.88c2.28-2.1 3.66-5.2 3.66-9.11z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.02c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.25 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.3c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3V6.57H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.43l4.03-3.13z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.25 6.57l4.03 3.13c.95-2.83 3.6-4.95 6.72-4.95z"
              />
            </svg>
            <span>Link Google Sheets</span>
          </button>
        )}
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
            {/* Google Sheets Icon */}
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H6v-2h6v2zm4-4H6v-2h10v2zm0-4H6V7h10v2z" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Google Sheets Live Roster Sync</h3>
              {user ? (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  CONNECTED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[11px] font-mono px-2 py-0.5 rounded-full">
                  OFFLINE
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-0.5">
              {user ? (
                <span>
                  Synchronizing squad registrations &amp; updates to{' '}
                  <strong className="text-slate-700">GDSL 2026 - Teams &amp; Rosters</strong> sheet ({user.email})
                </span>
              ) : (
                <span>
                  Connect your Google account to automatically store and update squad details in Google Sheets.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {user ? (
            <>
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
                onClick={() => setShowBatchModal(true)}
                disabled={isSyncing}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSyncing ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>🔄</span>
                )}
                <span>Sync All Squads</span>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="px-2.5 py-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-xs font-medium transition-colors"
                title="Disconnect Google account"
              >
                Disconnect
              </button>
            </>
          ) : (
            /* Official Google Sign-In button specification from SKILL.md */
            <button
              type="button"
              onClick={handleSignIn}
              disabled={isLoggingIn}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-slate-700 font-bold text-xs shadow-xs transition-all hover:shadow-sm active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isLoggingIn ? (
                <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.02h3.88c2.28-2.1 3.66-5.2 3.66-9.11z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.02c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.25 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.3c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3V6.57H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.43l4.03-3.13z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.25 6.57l4.03 3.13c.95-2.83 3.6-4.95 6.72-4.95z"
                  />
                </svg>
              )}
              <span>Sign in with Google</span>
            </button>
          )}
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

      {/* Explicit User Confirmation Modal for Batch Mutation */}
      <SheetsConfirmModal
        isOpen={showBatchModal}
        title="Sync All Tournament Squads to Google Sheets?"
        description="This will write all registered teams and their complete pilot & technical rosters into the connected Google Sheets spreadsheet."
        details={[
          { label: 'Target Spreadsheet', value: 'GDSL 2026 - Galgotias Drone Soccer League' },
          { label: 'Registered Squads Count', value: `${getRegisteredTeams().length} Teams` },
          { label: 'Google Account', value: user?.email || 'Connected User' },
        ]}
        confirmLabel="Yes, Sync to Google Sheets"
        cancelLabel="Cancel"
        isLoading={isSyncing}
        onConfirm={handleExecuteBatchSync}
        onCancel={() => setShowBatchModal(false)}
      />
    </div>
  );
};
