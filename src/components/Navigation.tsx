import React, { useState } from 'react';
import { GcdisLogo } from './GcdisLogo';

export interface NavigationProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenRegister?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dedicated Event Navigation for Galgotias Drone Soccer League
  const navItems = [
    { id: 'home', label: 'League Overview' },
    { id: 'bracket', label: 'Bracket & Fixtures' },
    { id: 'register', label: 'Team Registration' },
    { id: 'rules', label: 'Rules & Specs' },
    { id: 'contact', label: 'Helpdesk' },
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="relative z-50 w-full px-4 sm:px-8 lg:px-12 py-3.5 flex items-center justify-between pointer-events-auto bg-transparent">
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

      {/* Main Desktop Navigation Items */}
      <nav
        aria-label="Tournament Navigation"
        className="hidden md:flex items-center gap-1 bg-blue-50/80 border border-blue-200/80 rounded-full px-2 py-1 shadow-xs"
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

      {/* Right Side Event CTAs */}
      <div className="flex items-center gap-3">
        {/* Primary CTA: Register Squad */}
        <button
          onClick={() => handleNavClick('register')}
          className={`px-5 py-2 rounded-full font-sans font-black text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'register'
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-900 hover:bg-blue-950 text-white hover:scale-105'
          }`}
        >
          <span>REGISTER TEAM</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-mono">
            ₹1L CUP
          </span>
        </button>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 hover:bg-blue-100"
          aria-label="Toggle Navigation Menu"
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
        <div className="fixed inset-0 top-[64px] z-50 bg-white/98 backdrop-blur-xl border-t border-blue-100 p-6 flex flex-col justify-between overflow-y-auto md:hidden shadow-2xl">
          <div className="space-y-2">
            <div className="text-[10px] font-mono text-blue-600 uppercase tracking-widest px-3 mb-2 font-bold">
              GDSL 2026 NAVIGATION
            </div>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-3 rounded-2xl font-sans font-black text-sm tracking-wide uppercase transition-all flex items-center justify-between ${
                  activeTab === item.id
                    ? 'bg-blue-950 text-white'
                    : 'text-slate-700 hover:text-blue-950 hover:bg-blue-50'
                }`}
              >
                <span>{item.label}</span>
                <span className="text-xs font-mono opacity-50">→</span>
              </button>
            ))}
          </div>

          <div className="pt-6 border-t border-blue-100 space-y-3">
            <button
              onClick={() => handleNavClick('register')}
              className="w-full py-3.5 rounded-2xl bg-blue-900 text-white font-sans font-black text-xs uppercase tracking-wider text-center shadow-md flex items-center justify-center gap-2"
            >
              <span>REGISTER SQUAD NOW (₹1L PRIZE POOL)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
export default Navigation;
