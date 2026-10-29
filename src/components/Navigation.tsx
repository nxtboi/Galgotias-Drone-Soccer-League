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
    { id: 'home', label: 'Home' },
    { id: 'rules', label: 'Rules & Specs' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'team', label: 'Our Team' },
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
                GCDIS
              </span>
              <span className="font-mono text-[9px] tracking-widest text-neutral-400 uppercase mt-0.5 hidden sm:inline">
                Galgotias University
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

      {/* Dropdown Navigation Menu - No Scroll, All Pages Visible */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 w-full z-50 bg-[#111210] border-t border-b border-white/20 px-4 sm:px-6 py-4 flex flex-col gap-3 lg:hidden shadow-[0_24px_60px_rgba(0,0,0,0.9)]">
          <div className="flex items-center justify-between px-1 text-[10px] font-mono text-[#d0fe1d] uppercase tracking-widest">
            <span>GDSL 2026 DIRECTORY</span>
            <span>DEC 08-09 · ₹2,00,000 CUP</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-3.5 py-2.5 font-orbitron font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-between border cursor-pointer ${
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
              <button
                onClick={() => handleNavClick('admin')}
                className="w-full text-left px-3.5 py-2.5 font-orbitron font-bold text-xs tracking-wider uppercase bg-[#171915] text-[#d0fe1d] border border-[#d0fe1d]/50 flex items-center justify-between cursor-pointer"
              >
                <span>Tournament Admin Hub</span>
                <span>→</span>
              </button>
            )}

            {loggedInTeam && (
              <button
                onClick={() => handleNavClick('dashboard')}
                className="w-full text-left px-3.5 py-2.5 font-orbitron font-bold text-xs tracking-wider uppercase bg-[#171915] text-[#d0fe1d] border border-[#d0fe1d]/50 flex items-center justify-between cursor-pointer"
              >
                <span>{loggedInTeam.teamName.split(' ')[0]} Squad Hub</span>
                <span>→</span>
              </button>
            )}

            {!loggedInTeam && !isAdminLoggedIn && (
              <button
                onClick={() => handleNavClick('login')}
                className={`w-full text-left px-3.5 py-2.5 font-orbitron font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-between border cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-[#d0fe1d] text-black border-[#d0fe1d]'
                    : 'bg-[#171915] text-white border-white/15 hover:border-[#d0fe1d]/50'
                }`}
              >
                <span>Squad &amp; Admin Portal Login</span>
                <span className="text-[#d0fe1d]">→</span>
              </button>
            )}
          </div>

          <div className="pt-2.5 border-t border-white/15 flex flex-col sm:flex-row gap-2">
            {onOpenShare && (
              <button
                onClick={() => {
                  onOpenShare();
                  setMobileMenuOpen(false);
                }}
                className="xotc-btn-outline w-full py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>SHARE EVENT</span>
              </button>
            )}

            <button
              onClick={() => handleNavClick('register')}
              className="xotc-btn-lime w-full py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer"
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
