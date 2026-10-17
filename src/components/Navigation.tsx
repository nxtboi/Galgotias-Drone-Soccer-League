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

  const navItems = [
    { id: 'home', label: 'League Overview' },
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
    <header className="relative z-50 w-full bg-[#111210]/90 backdrop-blur-xl border-b border-white/15 pointer-events-auto">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
        {/* Left: XOTC-Inspired Brand Mark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavClick('home')}
            className="group flex items-center gap-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#d0fe1d] py-0.5 text-left cursor-pointer"
            title="Galgotias Drone Soccer League · GDSL"
          >
            <GcdisLogo size="sm" showWordmark={false} />
            <div className="flex flex-col">
              <span className="font-orbitron font-black text-base sm:text-lg tracking-widest text-white group-hover:text-[#d0fe1d] transition-colors leading-none">
                GDSL<span className="text-[#d0fe1d]">.26</span>
              </span>
              <span className="font-mono text-[9px] tracking-widest text-neutral-400 uppercase mt-0.5 hidden sm:inline">
                GCDIS · GALGOTIAS
              </span>
            </div>
          </button>
        </div>

        {/* Center: Clean Technical Typography Navigation */}
        <div className="hidden lg:flex flex-1 justify-center px-4">
          <nav aria-label="Tournament Navigation" className="flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative py-2 text-xs font-rajdhani font-bold tracking-[0.14em] uppercase transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'text-[#d0fe1d]'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d0fe1d] shadow-[0_0_10px_#d0fe1d]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Side Event CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Hub Button & Logout */}
          {isAdminLoggedIn && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleNavClick('admin')}
                className={`px-3 py-2 min-h-[38px] font-orbitron font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
                  activeTab === 'admin'
                    ? 'bg-[#d0fe1d] text-black border-[#d0fe1d]'
                    : 'bg-[#171915] hover:border-[#d0fe1d] text-[#d0fe1d] border-[#d0fe1d]/40'
                }`}
                title="Tournament Admin Control Panel"
              >
                <span className="hidden xs:inline">Admin Hub</span>
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-2.5 py-2 min-h-[38px] bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/40 text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer"
                  title="Log out from Admin session"
                >
                  Logout
                </button>
              )}
            </div>
          )}

          {/* Team Portal / Login Button */}
          {loggedInTeam ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`px-3 py-2 min-h-[38px] font-orbitron font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
                  activeTab === 'dashboard'
                    ? 'bg-[#d0fe1d] text-black border-[#d0fe1d]'
                    : 'bg-[#171915] text-white border-white/20 hover:border-[#d0fe1d]'
                }`}
                title={`Logged in as ${loggedInTeam.teamName}`}
              >
                <span className="w-2 h-2 rounded-full bg-[#d0fe1d] animate-pulse" />
                <span className="truncate max-w-[90px] sm:max-w-[130px]">{loggedInTeam.teamName.split(' ')[0]} Hub</span>
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-2.5 py-2 min-h-[38px] bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/40 text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer"
                  title="Log out from squad portal"
                >
                  Logout
                </button>
              )}
            </div>
          ) : !isAdminLoggedIn ? (
            <button
              onClick={() => handleNavClick('login')}
              className={`hidden sm:inline-flex px-3.5 py-2 min-h-[38px] font-rajdhani font-bold text-xs uppercase tracking-widest transition-all cursor-pointer border ${
                activeTab === 'login'
                  ? 'border-[#d0fe1d] text-[#d0fe1d] bg-[#d0fe1d]/10'
                  : 'border-white/20 text-neutral-300 hover:border-white hover:text-white bg-[#171915]'
              }`}
            >
              Squad Login
            </button>
          ) : null}

          {/* Share Event Button */}
          {onOpenShare && (
            <button
              onClick={onOpenShare}
              className="px-3 py-2 min-h-[38px] bg-[#171915] hover:bg-[#d0fe1d]/10 text-neutral-200 hover:text-[#d0fe1d] border border-white/20 hover:border-[#d0fe1d] font-rajdhani font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer"
              title="Share GDSL 2026 on Social Media"
            >
              <span className="hidden md:inline">Share</span>
              <svg className="w-3.5 h-3.5 text-[#d0fe1d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          )}

          {/* Primary XOTC Acid-Lime Chamfered CTA */}
          <button
            onClick={() => handleNavClick('register')}
            className="xotc-btn-lime px-4 sm:px-5 py-2.5 min-h-[38px] text-[10px] sm:text-xs whitespace-nowrap flex items-center gap-2 cursor-pointer"
          >
            <span>REGISTER SQUAD</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 min-w-[42px] min-h-[42px] bg-[#171915] border border-white/20 text-[#d0fe1d] hover:border-[#d0fe1d] flex items-center justify-center transition-colors cursor-pointer"
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
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[63px] z-50 bg-[#111210]/98 backdrop-blur-2xl border-t border-white/15 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto lg:hidden shadow-2xl">
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2 mb-3 text-[11px] font-mono text-[#d0fe1d] uppercase tracking-widest">
              <span>GDSL 2026 DIRECTORY</span>
              <span>DEC 02-03 · ₹1,00,000 CUP</span>
            </div>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-3.5 min-h-[48px] font-orbitron font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-between border cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-[#d0fe1d] text-black border-[#d0fe1d]'
                    : 'bg-[#171915] text-neutral-200 border-white/10 hover:border-[#d0fe1d]/50'
                }`}
              >
                <span>{item.label}</span>
                <span className="font-mono">→</span>
              </button>
            ))}

            {isAdminLoggedIn && (
              <div className="space-y-1.5 pt-2">
                <button
                  onClick={() => handleNavClick('admin')}
                  className="w-full text-left px-4 py-3 min-h-[48px] font-orbitron font-bold text-xs tracking-wider uppercase bg-[#171915] text-[#d0fe1d] border border-[#d0fe1d]/50 flex items-center justify-between"
                >
                  <span>Tournament Admin Hub</span>
                  <span>→</span>
                </button>
              </div>
            )}

            {!loggedInTeam && !isAdminLoggedIn && (
              <button
                onClick={() => handleNavClick('login')}
                className="w-full text-left px-4 py-3.5 min-h-[48px] font-orbitron font-bold text-xs tracking-wider uppercase bg-[#171915] text-white border border-white/15 flex items-center justify-between"
              >
                <span>Squad &amp; Admin Portal Login</span>
                <span className="text-[#d0fe1d]">→</span>
              </button>
            )}
          </div>

          <div className="pt-5 border-t border-white/15 space-y-3">
            {onOpenShare && (
              <button
                onClick={() => {
                  onOpenShare();
                  setMobileMenuOpen(false);
                }}
                className="xotc-btn-outline w-full py-3 min-h-[46px] text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>SHARE EVENT ON SOCIAL MEDIA</span>
              </button>
            )}

            <button
              onClick={() => handleNavClick('register')}
              className="xotc-btn-lime w-full py-3.5 min-h-[48px] text-xs flex items-center justify-center gap-2 cursor-pointer"
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
