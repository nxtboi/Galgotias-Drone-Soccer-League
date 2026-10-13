import React, { useState } from 'react';
import { GcdisLogo } from './GcdisLogo';
import { RegisteredTeamProfile } from '../data/teamAuthData';

export interface NavigationProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenRegister?: () => void;
  onOpenShare?: () => void;
  loggedInTeam?: RegisteredTeamProfile | null;
  isAdminLoggedIn?: boolean;
  onLogout?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  onOpenShare,
  loggedInTeam,
  isAdminLoggedIn = false,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dedicated Event Navigation for Galgotias Drone Soccer League
  const navItems = [
    { id: 'home', label: 'League Overview' },
    { id: 'practice', label: 'Practice Arena' },
    { id: 'bracket', label: 'Bracket & Fixtures' },
    { id: 'rules', label: 'Rules & Specs' },
    { id: 'contact', label: 'Helpdesk' },
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="relative z-50 max-w-7xl w-full mx-auto px-4 sm:px-8 py-3 flex items-center justify-between pointer-events-auto bg-transparent">
      {/* Brand Circular Logo with Official Event Wordmark */}
      <div className="flex items-center">
        <button
          onClick={() => handleNavClick('home')}
          className="group flex items-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-900 rounded-lg py-0.5 text-left"
          title="Galgotias Drone Soccer League · GDSL"
        >
          <GcdisLogo size="md" showWordmark={false} />
        </button>
      </div>

      {/* Main Desktop Navigation Items in the Centre */}
      <div className="hidden md:flex flex-1 justify-center px-4">
        <nav
          aria-label="Tournament Navigation"
          className="flex items-center gap-1 bg-blue-50/90 border border-blue-200/80 rounded-full px-2 py-1 shadow-xs"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`relative px-4 py-1.5 rounded-full text-xs font-sans font-bold tracking-wide uppercase transition-all duration-200 whitespace-nowrap ${
                activeTab === item.id
                  ? 'bg-blue-950 text-white shadow-xs scale-102'
                  : 'text-slate-700 hover:text-blue-950 hover:bg-blue-100/70'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Right Side Event CTAs */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Admin Hub Button & Logout (when Admin is logged in) */}
        {isAdminLoggedIn && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleNavClick('admin')}
              className={`px-3 sm:px-4 py-2 min-h-[40px] rounded-full font-sans font-bold text-xs uppercase tracking-wide transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
              }`}
              title="Tournament Admin Control Panel"
            >
              <span>👑</span>
              <span className="hidden xs:inline">Admin Hub</span>
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3 py-2 min-h-[40px] rounded-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold uppercase transition-colors cursor-pointer flex items-center gap-1"
                title="Log out from Admin session"
              >
                <span>🚪</span>
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        )}

        {/* Team Portal / Login Button */}
        {loggedInTeam ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`px-3 sm:px-4 py-2 min-h-[40px] rounded-full font-sans font-bold text-xs uppercase tracking-wide transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-blue-950 text-white'
                  : 'bg-white hover:bg-blue-50 text-blue-950 border border-blue-200'
              }`}
              title={`Logged in as ${loggedInTeam.teamName}`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="truncate max-w-[80px] sm:max-w-[130px]">{loggedInTeam.teamName.split(' ')[0]} Hub</span>
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3 py-2 min-h-[40px] rounded-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold uppercase transition-colors cursor-pointer flex items-center gap-1"
                title="Log out from squad portal"
              >
                <span>🚪</span>
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        ) : !isAdminLoggedIn ? (
          <button
            onClick={() => handleNavClick('login')}
            className={`hidden sm:inline-flex px-3 sm:px-4 py-2 min-h-[40px] rounded-full font-sans font-bold text-xs uppercase tracking-wide transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-blue-950 text-white'
                : 'bg-white hover:bg-blue-50 text-blue-950 border border-blue-200'
            }`}
          >
            <span>Team Login</span>
          </button>
        ) : null}

        {/* Share Event Button */}
        {onOpenShare && (
          <button
            onClick={onOpenShare}
            className="px-3 sm:px-3.5 py-2 min-h-[40px] rounded-full bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-sans font-bold text-xs uppercase tracking-wide transition-all shadow-xs hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
            title="Share GDSL 2026 on Social Media"
          >
            <span className="text-sm">📢</span>
            <span className="hidden lg:inline">Share</span>
          </button>
        )}

        {/* Primary CTA: Register Squad */}
        <button
          onClick={() => handleNavClick('register')}
          className={`px-3 sm:px-5 py-2 min-h-[40px] rounded-full font-sans font-black text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 whitespace-nowrap flex items-center gap-1.5 sm:gap-2 ${
            activeTab === 'register'
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-900 hover:bg-blue-950 text-white hover:scale-105'
          }`}
        >
          <span>REGISTER</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-mono hidden xs:inline">
            ₹1L CUP
          </span>
        </button>

        {/* Mobile menu toggle with 44px touch target */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2.5 min-w-[44px] min-h-[44px] rounded-xl bg-blue-50 border border-blue-200 text-blue-950 hover:bg-blue-100 flex items-center justify-center transition-colors"
          aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
        >
          {mobileMenuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[60px] z-50 bg-white/98 backdrop-blur-2xl border-t border-blue-100 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto md:hidden shadow-2xl animate-fade-in">
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[10px] font-mono text-blue-600 uppercase tracking-widest font-bold">
                GDSL 2026 NAVIGATION
              </span>
              <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                DEC 02-03 · ₹1,00,000 CUP
              </span>
            </div>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-3 min-h-[48px] rounded-2xl font-sans font-black text-sm tracking-wide uppercase transition-all flex items-center justify-between ${
                  activeTab === item.id
                    ? 'bg-blue-950 text-white shadow-sm'
                    : 'text-slate-700 hover:text-blue-950 hover:bg-blue-50 active:bg-blue-100'
                }`}
              >
                <span>{item.label}</span>
                <span className="text-xs font-mono opacity-50">→</span>
              </button>
            ))}

            {/* Mobile Drawer: Admin Portal option if logged in */}
            {isAdminLoggedIn && (
              <div className="space-y-1.5 pt-1">
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`w-full text-left px-4 py-3 min-h-[48px] rounded-2xl font-sans font-bold text-sm tracking-wide uppercase transition-all flex items-center justify-between border ${
                    activeTab === 'admin'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-amber-50 text-amber-950 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>👑 Tournament Admin Hub</span>
                  </div>
                  <span className="text-xs font-mono opacity-60">→</span>
                </button>
                {onLogout && (
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 font-bold text-xs uppercase flex items-center justify-between cursor-pointer"
                  >
                    <span>🚪 Logout Administrator</span>
                    <span>✕</span>
                  </button>
                )}
              </div>
            )}

            {/* Mobile Drawer: Team Portal option if logged in */}
            {loggedInTeam ? (
              <div className="space-y-1.5 pt-1">
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className={`w-full text-left px-4 py-3 min-h-[48px] rounded-2xl font-sans font-bold text-sm tracking-wide uppercase transition-all flex items-center justify-between border ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-950 text-white border-blue-950'
                      : 'bg-blue-50/70 text-blue-950 border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{loggedInTeam.teamName} Hub</span>
                  </div>
                  <span className="text-xs font-mono opacity-60">→</span>
                </button>
                {onLogout && (
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 font-bold text-xs uppercase flex items-center justify-between cursor-pointer"
                  >
                    <span>🚪 Logout Squad</span>
                    <span>✕</span>
                  </button>
                )}
              </div>
            ) : !isAdminLoggedIn ? (
              <button
                onClick={() => handleNavClick('login')}
                className={`w-full text-left px-4 py-3 min-h-[48px] rounded-2xl font-sans font-bold text-sm tracking-wide uppercase transition-all flex items-center justify-between border ${
                  activeTab === 'login'
                    ? 'bg-blue-950 text-white border-blue-950'
                    : 'bg-blue-50/70 text-blue-950 border-blue-200 hover:bg-blue-100'
                }`}
              >
                <span>🔑 Squad &amp; Admin Login</span>
                <span className="text-xs font-mono opacity-60">→</span>
              </button>
            ) : null}
          </div>

          <div className="pt-5 border-t border-blue-100 space-y-2.5">
            {onOpenShare && (
              <button
                onClick={() => {
                  onOpenShare();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 min-h-[46px] rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 hover:bg-blue-100 font-sans font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>📢</span>
                <span>SHARE EVENT ON SOCIAL MEDIA</span>
              </button>
            )}

            <button
              onClick={() => handleNavClick('register')}
              className="w-full py-3.5 min-h-[48px] rounded-2xl bg-blue-900 active:bg-blue-950 text-white font-sans font-black text-xs uppercase tracking-wider text-center shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>REGISTER SQUAD (D-20 &amp; D-40 POOLS)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
export default Navigation;
