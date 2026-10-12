import React, { useState } from 'react';
import { GcdisLogo } from '../components/GcdisLogo';
import {
  authenticateTeam,
  INITIAL_REGISTERED_TEAMS,
  RegisteredTeamProfile,
} from '../data/teamAuthData';
import { GDSL_TOURNAMENT_INFO } from '../data/droneSoccerData';

export interface TeamLoginPageProps {
  onLoginSuccess: (team: RegisteredTeamProfile) => void;
  onAdminLoginSuccess?: () => void;
  onNavigate: (tab: string) => void;
  loggedInTeam?: RegisteredTeamProfile | null;
  isAdminLoggedIn?: boolean;
  onLogout?: () => void;
}

export const TeamLoginPage: React.FC<TeamLoginPageProps> = ({
  onLoginSuccess,
  onAdminLoginSuccess,
  onNavigate,
  loggedInTeam,
  isAdminLoggedIn = false,
  onLogout,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const idClean = identifier.trim().toLowerCase();
    const passClean = accessCode.trim();

    // Administrator Authentication
    if (idClean === 'admin' && passClean === 'gdsl@147896') {
      setTimeout(() => {
        setIsLoading(false);
        if (onAdminLoginSuccess) {
          onAdminLoginSuccess();
        }
      }, 300);
      return;
    }

    setTimeout(() => {
      const result = authenticateTeam(identifier, accessCode);
      setIsLoading(false);

      if (result.success && result.team) {
        onLoginSuccess(result.team);
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please check credentials.');
      }
    }, 350);
  };

  const handleAdminQuickLogin = () => {
    setIdentifier('admin');
    setAccessCode('gdsl@147896');
    setErrorMessage(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onAdminLoginSuccess) {
        onAdminLoginSuccess();
      }
    }, 200);
  };

  const handleQuickDemoLogin = (team: RegisteredTeamProfile) => {
    setIdentifier(team.teamId);
    setAccessCode(team.accessCode);
    setErrorMessage(null);
    setIsLoading(true);
    setTimeout(() => {
      const result = authenticateTeam(team.teamId, team.accessCode);
      setIsLoading(false);
      if (result.success && result.team) {
        onLoginSuccess(result.team);
      }
    }, 200);
  };

  return (
    <div className="relative z-20 min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-12 bg-white/80">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 px-4 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>OFFICIAL PARTICIPANT PORTAL · GDSL 2026</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-sans font-black text-blue-950 uppercase tracking-tight">
            REGISTERED TEAM LOGIN
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Access your verified squad dashboard to download your official payment receipt, generate University On-Duty (OD) attendance exemption applications, review your pilot roster, and track tournament fixtures.
          </p>
        </div>

        {/* Main Login Card & Quick Demo Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Main: Credentials Form */}
          <div className="lg:col-span-7 bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-md">
            <div className="flex items-center gap-3 border-b border-blue-100 pb-4 mb-6">
              <GcdisLogo size="sm" showWordmark={false} />
              <div>
                <h3 className="font-sans font-black text-lg text-blue-950 uppercase">
                  SQUAD &amp; ADMIN CREDENTIALS
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Sign in with Team ID, Captain Email, or Admin (<span className="text-blue-900 font-bold">admin</span> / <span className="text-blue-900 font-bold">gdsl@147896</span>)
                </p>
              </div>
            </div>

            {/* Active Session Status (if already authenticated) */}
            {loggedInTeam && (
              <div className="mb-6 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <div>
                    <span className="font-bold">Currently Logged In:</span> {loggedInTeam.teamName} ({loggedInTeam.teamId})
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigate('dashboard')}
                    className="px-3 py-1.5 rounded-lg bg-blue-950 text-white font-bold text-xs hover:bg-blue-900 transition-colors cursor-pointer"
                  >
                    Go to Hub →
                  </button>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={onLogout}
                      className="px-3 py-1.5 rounded-lg bg-red-100 text-red-800 font-bold text-xs hover:bg-red-200 transition-colors cursor-pointer"
                    >
                      Logout
                    </button>
                  )}
                </div>
              </div>
            )}

            {isAdminLoggedIn && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  <div>
                    <span className="font-bold">Administrator Session Active:</span> GDSL Secretariat
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigate('admin')}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors cursor-pointer"
                  >
                    Go to Admin Hub →
                  </button>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={onLogout}
                      className="px-3 py-1.5 rounded-lg bg-red-100 text-red-800 font-bold text-xs hover:bg-red-200 transition-colors cursor-pointer"
                    >
                      Logout
                    </button>
                  )}
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-3">
                <span className="text-base leading-none">⚠️</span>
                <div className="space-y-1">
                  <span className="font-bold block">Login Issue:</span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-5 text-left">
              <div>
                <label className="block text-xs font-mono font-bold text-blue-950 uppercase mb-1.5">
                  TEAM ID OR CAPTAIN EMAIL <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="e.g. GDSL-26-T101 or captain@university.edu"
                    className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:border-blue-700 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-sans transition-all text-blue-950 bg-slate-50/50"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500 font-mono">
                  Assigned upon official tournament registration.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono font-bold text-blue-950 uppercase">
                    SQUAD ACCESS PASSCODE / PIN <span className="text-rose-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-mono text-blue-700 hover:text-blue-900 font-semibold cursor-pointer"
                  >
                    {showPassword ? 'Hide PIN' : 'Show PIN'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={accessCode}
                    onChange={(e) => {
                      setAccessCode(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Enter team access passcode"
                    className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:border-blue-700 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-sans transition-all text-blue-950 bg-slate-50/50"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Demo code for pre-seeded teams: <code className="bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-mono">hawks2026</code>, <code className="bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-mono">vortex2026</code>
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-full bg-blue-950 hover:bg-blue-900 text-white font-sans font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>AUTHENTICATING SQUAD...</span>
                    </>
                  ) : (
                    <>
                      <span>ENTER TEAM DASHBOARD</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                <span>Not registered yet?</span>
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="font-bold text-blue-900 hover:text-blue-950 underline"
                >
                  Register Your Squad (₹1L Cup) →
                </button>
              </div>
            </form>
          </div>

          {/* Right: Quick Demo Accounts & Event Quick Facts */}
          <div className="lg:col-span-5 space-y-6 text-left">
            {/* Quick Demo Access Card */}
            <div className="bg-gradient-to-br from-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-blue-400/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-amber-300 font-bold uppercase tracking-wider">
                  ⚡ INSTANT DEMO ACCESS
                </span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono">
                  1-CLICK LOGIN
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Click any of the pre-verified collegiate squads below to instantly test the attendance letter generator and payment receipt download:
              </p>

              <div className="space-y-2.5 pt-1">
                {/* 1-Click Tournament Admin Access */}
                <button
                  type="button"
                  onClick={handleAdminQuickLogin}
                  className="w-full text-left p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 border border-amber-400/40 hover:border-amber-400 transition-all group flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-sm text-amber-300 group-hover:text-amber-200 transition-colors flex items-center gap-1.5">
                      <span>👑</span>
                      <span>Tournament Admin Panel</span>
                    </div>
                    <div className="text-[11px] text-amber-100/80 font-mono">
                      User: <span className="font-bold text-white">admin</span> · Pass: <span className="font-bold text-white">gdsl@147896</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold bg-amber-400 text-slate-950 px-2.5 py-1 rounded-md transition-all">
                      Admin Hub →
                    </span>
                  </div>
                </button>

                {INITIAL_REGISTERED_TEAMS.map((team) => (
                  <button
                    key={team.teamId}
                    type="button"
                    onClick={() => handleQuickDemoLogin(team)}
                    className="w-full text-left p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 hover:border-blue-400 transition-all group flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                        {team.teamName}
                      </div>
                      <div className="text-[11px] text-sky-200 font-mono">
                        {team.institution} · <span className="text-amber-300">{team.division.split(' ')[0]} {team.division.split(' ')[1]}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono font-bold bg-white/20 px-2 py-1 rounded text-white group-hover:bg-amber-400 group-hover:text-slate-950 transition-all">
                        Login →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Need Help Card */}
            <div className="bg-blue-50/80 border border-blue-200 rounded-3xl p-6 space-y-3">
              <h4 className="font-sans font-black text-xs uppercase text-blue-950 tracking-wider">
                NEED REGISTRATION OR PORTAL ASSISTANCE?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                If your institution requires specialized vendor forms or physical invoice dispatch, reach out to the GCDIS Secretariat:
              </p>
              <div className="text-xs font-mono text-blue-900 font-bold space-y-1">
                <div>📞 Helpline: {GDSL_TOURNAMENT_INFO.emergencyHelpline}</div>
                <div>✉️ Email: {GDSL_TOURNAMENT_INFO.supportEmail}</div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="pt-1 text-xs font-bold text-blue-700 hover:text-blue-900 underline block"
              >
                Open Secretariat Helpdesk →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TeamLoginPage;
