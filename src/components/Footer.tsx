import React from 'react';
import { GcdisLogo } from './GcdisLogo';
import { GDSL_TOURNAMENT_INFO } from '../data/droneSoccerData';

export interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (page: string) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative z-30 w-full px-4 sm:px-8 md:px-16 lg:px-24 border-t border-blue-200/80 pt-10 sm:pt-16 pb-8 sm:pb-12 bg-white/95 backdrop-blur-xl text-blue-950 pointer-events-auto shadow-sm">
      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12">
        {/* Top Grid: Brand & Directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 text-left">
          {/* Col 1 & 2: Circular Brand Emblem & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <GcdisLogo size="md" showWordmark={true} />
            </div>
            <p className="text-xs text-slate-600 font-sans leading-relaxed max-w-md">
              Galgotias Drone Soccer League (GDSL 2026): India&apos;s premier national intercollegiate 3D aerial robotics e-sport championship, organized by GCDIS at Galgotias University under FAI Class F9A regulations.
            </p>
            <div className="text-[11px] font-mono text-blue-800 space-y-1">
              <div>VENUE: Galgotias University Indoor Arena, Greater Noida, UP, India</div>
              <div>DATES: {GDSL_TOURNAMENT_INFO.dates}</div>
              <div>EMAIL: {GDSL_TOURNAMENT_INFO.supportEmail}</div>
            </div>
          </div>

          {/* Col 3: League Navigation */}
          <div className="space-y-3">
            <div className="text-[10px] font-mono text-blue-700 uppercase tracking-widest font-bold">
              TOURNAMENT SECTIONS
            </div>
            <ul className="space-y-2 text-xs font-sans text-slate-700">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-blue-900 transition-colors">
                  League Overview
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('practice')} className="hover:text-blue-900 transition-colors font-bold text-blue-900 flex items-center gap-1.5">
                  <span>Practice Arena (3D Simulator)</span>
                  <span className="text-[9px] font-mono font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">NEW</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('bracket')} className="hover:text-blue-900 transition-colors flex items-center gap-1.5">
                  <span>Bracket &amp; Fixtures</span>
                  <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">SOON</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('register')} className="hover:text-blue-900 transition-colors font-bold text-blue-900">
                  Squad Entry (D-20 &amp; D-40 Cups)
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('rules')} className="hover:text-blue-900 transition-colors">
                  Rules &amp; Drone Specs
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('contact')} className="hover:text-blue-900 transition-colors">
                  Helpline &amp; Secretariat
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('login')} className="hover:text-blue-900 transition-colors font-medium text-blue-900">
                  Registered Squad Portal (Login) 🔑
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('login')} className="hover:text-amber-900 transition-colors font-bold text-amber-800 flex items-center gap-1">
                  <span>👑</span>
                  <span>Tournament Admin &amp; Sheets Hub</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Rapid Team Entry */}
          <div className="space-y-3">
            <div className="text-[10px] font-mono text-blue-700 uppercase tracking-widest font-bold">
              TEAM REGISTRATION
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Open to university students, college robotics clubs, and collegiate flight teams nationwide.
            </p>
            <div className="pt-1">
              <button
                onClick={() => handleNav('register')}
                className="w-full py-2.5 rounded-full bg-blue-900 hover:bg-blue-950 text-white font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-xs text-center"
              >
                Register Squad Now →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-slate-500 font-medium">
          <div>
            © 2026 GALGOTIAS DRONE SOCCER LEAGUE · GCDIS GALGOTIAS UNIVERSITY. ALL RIGHTS RESERVED.
          </div>

          <div className="flex items-center gap-6">
            <span className="text-blue-900 font-bold">FAI CLASS F9A RECOGNISED</span>
            <span className="text-blue-300">|</span>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-blue-700 hover:text-blue-950 font-bold transition-colors"
            >
              TOP ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
