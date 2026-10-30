import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Terminal,
  HelpCircle,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { GcdisLogo } from '../components/GcdisLogo';
import {
  authenticateTeam,
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
  const [loginMode, setLoginMode] = useState<'squad' | 'admin'>('squad');
  const [identifier, setIdentifier] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleModeSwitch = (mode: 'squad' | 'admin') => {
    setLoginMode(mode);
    setErrorMessage(null);
    setIdentifier('');
    setAccessCode('');
  };

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
      }, 250);
      return;
    }

    setTimeout(() => {
      const result = authenticateTeam(identifier, accessCode);
      setIsLoading(false);

      if (result.success && result.team) {
        onLoginSuccess(result.team);
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please check your Team ID and Passcode.');
      }
    }, 300);
  };

  return (
    <div className="relative z-20 min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-12 flex items-center justify-center">
      {/* Main Split-Format Login Container (Static, No Parallax) */}
      <div className="w-full max-w-7xl rounded-3xl bg-[#141612]/95 backdrop-blur-2xl border border-white/15 shadow-[0_28px_80px_rgba(0,0,0,0.85)] p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-0 overflow-hidden">
        {/* Left Visual Showcase Card */}
        <div className="lg:col-span-5 relative rounded-2xl overflow-hidden min-h-[300px] sm:min-h-[360px] lg:min-h-[620px] flex flex-col justify-between p-6 sm:p-7 border border-white/10 bg-[#0d0e0b]">
          {/* Background Cyberspace Imagery (Static) */}
          <img
            src="/login-cyber-bg.svg"
            alt="Futuristic Green Neon Cyberspace Data Transfer Background"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-85"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('drone-lab.jpg')) {
                target.src = '/drone-lab.jpg';
              }
            }}
          />

          {/* Measured Contrast Scrim + Subtle Acid-Lime Glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(13,14,11,0.75) 0%, rgba(13,14,11,0.35) 40%, rgba(13,14,11,0.94) 100%)',
            }}
          />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#d0fe1d]/20 blur-3xl pointer-events-none" />

          {/* Top Bar inside Image Panel: Logo + Back to Website Button */}
          <div className="relative z-10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <GcdisLogo size="sm" showWordmark={false} />
              <div className="text-left">
                <span className="font-orbitron font-black text-sm tracking-wider text-white block leading-none">
                  GDSL<span className="text-[#d0fe1d]">.26</span>
                </span>
                <span className="font-mono text-[9px] tracking-widest text-neutral-300 uppercase">
                  GCDIS · GALGOTIAS
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Back to website</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#d0fe1d]" />
            </button>
          </div>

          {/* Bottom Showcase Copy & Carousel Indicators inside Image Panel */}
          <div className="relative z-10 space-y-5 text-left pt-12">
            <div className="space-y-2">
              <div className="text-[11px] font-rajdhani font-bold uppercase tracking-[0.2em] text-[#d0fe1d]">
                GCDIS CLASS 40 &amp; CLASS 20 · {GDSL_TOURNAMENT_INFO.dates}
              </div>
              <h2 className="font-orbitron font-black text-xl sm:text-2xl text-white leading-snug tracking-wide uppercase">
                Command Your Squad. Track Live Brackets &amp; Official OD Letters.
              </h2>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Verified team captains and tournament officials can manage pilot rosters, download fee receipts, and monitor arena court assignments in real time.
              </p>
            </div>

            {/* Progress Bars / Indicators */}
            <div className="flex items-center gap-2 pt-1">
              <span className="h-1 w-10 rounded-full bg-[#d0fe1d]" />
              <span className="h-1 w-6 rounded-full bg-white/30" />
              <span className="h-1 w-6 rounded-full bg-white/30" />
            </div>

            {/* Secretariat Support Footer inside Visual Panel */}
            <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-neutral-300 font-mono">
              <span>Helpline: {GDSL_TOURNAMENT_INFO.emergencyHelpline}</span>
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="text-[#d0fe1d] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Helpdesk</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 flex flex-col justify-center px-4 sm:px-8 lg:px-10 py-6 sm:py-8 text-left">
          <div className="max-w-md w-full mx-auto space-y-6">
            {/* Title & Register Link */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-rajdhani font-bold uppercase tracking-[0.2em] text-[#d0fe1d]">
                  OFFICIAL PARTICIPANT PORTAL
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  GDSL 2026
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-orbitron font-black text-white tracking-wide uppercase">
                Sign In to Portal
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400">
                Don&apos;t have a registered squad yet?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="text-[#d0fe1d] hover:underline font-semibold cursor-pointer"
                >
                  Register your squad →
                </button>
              </p>
            </div>

            {/* Role Switcher Tabs (Squad vs Admin) */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#0d0e0b] border border-white/10">
              <button
                type="button"
                onClick={() => handleModeSwitch('squad')}
                className={`py-2 px-3 rounded-lg text-xs font-rajdhani font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  loginMode === 'squad'
                    ? 'bg-[#d0fe1d] text-[#0b0c0a] shadow-sm font-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Squad Captain</span>
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('admin')}
                className={`py-2 px-3 rounded-lg text-xs font-rajdhani font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  loginMode === 'admin'
                    ? 'bg-[#d0fe1d] text-[#0b0c0a] shadow-sm font-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Tournament Admin</span>
              </button>
            </div>

            {/* Active Session Banners */}
            {loggedInTeam && (
              <div className="p-3.5 rounded-xl bg-[#1c2017] border border-[#d0fe1d]/40 text-xs text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-mono uppercase text-[#d0fe1d]">Active Squad Session</div>
                  <div className="font-bold">{loggedInTeam.teamName} ({loggedInTeam.teamId})</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigate('dashboard')}
                    className="px-3 py-1.5 rounded-lg bg-[#d0fe1d] text-black font-bold text-xs hover:bg-[#e2ff54] transition-colors cursor-pointer"
                  >
                    Open Hub →
                  </button>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={onLogout}
                      className="p-1.5 rounded-lg bg-red-950/70 text-red-300 border border-red-500/30 hover:bg-red-900/80 transition-colors cursor-pointer"
                      title="Logout"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {isAdminLoggedIn && (
              <div className="p-3.5 rounded-xl bg-[#1c2017] border border-[#d0fe1d]/40 text-xs text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-mono uppercase text-[#d0fe1d]">Active Admin Session</div>
                  <div className="font-bold">GDSL Secretariat Control</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigate('admin')}
                    className="px-3 py-1.5 rounded-lg bg-[#d0fe1d] text-black font-bold text-xs hover:bg-[#e2ff54] transition-colors cursor-pointer"
                  >
                    Admin Hub →
                  </button>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={onLogout}
                      className="p-1.5 rounded-lg bg-red-950/70 text-red-300 border border-red-500/30 hover:bg-red-900/80 transition-colors cursor-pointer"
                      title="Logout"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Error Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-red-300">Authentication Error</span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-rajdhani font-bold uppercase tracking-wider text-neutral-300">
                  {loginMode === 'admin' ? 'Administrator Username' : 'Team ID or Captain Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder={
                      loginMode === 'admin'
                        ? 'Enter administrator username'
                        : 'e.g. GDSL-26-T101 or captain@university.edu'
                    }
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0d0e0b] border border-white/15 focus:border-[#d0fe1d] focus:ring-1 focus:ring-[#d0fe1d]/40 outline-none text-sm text-white placeholder:text-neutral-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-rajdhani font-bold uppercase tracking-wider text-neutral-300">
                  {loginMode === 'admin' ? 'Admin Security Key' : 'Squad Access Passcode'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={accessCode}
                    onChange={(e) => {
                      setAccessCode(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Enter access passcode"
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#0d0e0b] border border-white/15 focus:border-[#d0fe1d] focus:ring-1 focus:ring-[#d0fe1d]/40 outline-none text-sm text-white placeholder:text-neutral-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#d0fe1d] transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide passcode' : 'Show passcode'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Session & Forgot Passcode Row */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="inline-flex items-center gap-2 text-neutral-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-white/20 bg-[#0d0e0b] accent-[#d0fe1d]"
                  />
                  <span>Keep session signed in</span>
                </label>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="text-neutral-400 hover:text-[#d0fe1d] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Forgot passcode?</span>
                </button>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-[#d0fe1d] hover:bg-[#e2ff54] text-[#0b0c0a] font-orbitron font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_24px_rgba(208,254,29,0.25)] hover:shadow-[0_0_32px_rgba(208,254,29,0.45)] flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <>
                    <span>{loginMode === 'admin' ? 'ENTER ADMIN CONTROL HUB' : 'ENTER SQUAD DASHBOARD'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamLoginPage;
