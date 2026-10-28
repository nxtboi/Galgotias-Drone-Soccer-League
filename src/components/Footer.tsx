import React from 'react';
import { GcdisLogo } from './GcdisLogo';
import { GDSL_TOURNAMENT_INFO } from '../data/droneSoccerData';

export interface FooterProps {
  onNavigate: (page: string) => void;
  onOpenShare?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenShare }) => {
  const handleNav = (page: string) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative z-30 w-full px-4 sm:px-8 md:px-16 lg:px-24 border-t border-white/15 pt-14 sm:pt-20 pb-12 bg-[#0d0e0c] text-white pointer-events-auto">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top Grid: XOTC Style Brand on Left & Neon-Lime Header Columns on Right */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 text-left">
          {/* Col 1 & 2: Brand Emblem & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <GcdisLogo size="md" showWordmark={true} />
            </div>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed max-w-md">
              Galgotias Drone Soccer League (GDSL 2026): India&apos;s premier national intercollegiate 3D aerial robotics e-sport championship, organized by GCDIS at Galgotias University under FAI Class F9A regulations.
            </p>
            <div className="text-[11px] font-mono text-neutral-400 space-y-1">
              <div><span className="text-[#d0fe1d]">VENUE:</span> Galgotias University Indoor Arena, Greater Noida, UP</div>
              <div><span className="text-[#d0fe1d]">DATES:</span> {GDSL_TOURNAMENT_INFO.dates}</div>
              <div><span className="text-[#d0fe1d]">EMAIL:</span> {GDSL_TOURNAMENT_INFO.supportEmail}</div>
            </div>
          </div>

          {/* Col 3: League Sections */}
          <div className="space-y-3">
            <div className="text-xs font-orbitron text-[#d0fe1d] uppercase tracking-widest font-black">
              SECTIONS
            </div>
            <ul className="space-y-2.5 text-xs font-sans text-neutral-300">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-[#d0fe1d] transition-colors cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('practice')} className="hover:text-[#d0fe1d] transition-colors font-semibold text-white cursor-pointer">
                  Practice Arena (3D)
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('bracket')} className="hover:text-[#d0fe1d] transition-colors cursor-pointer">
                  Bracket &amp; Fixtures
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('rules')} className="hover:text-[#d0fe1d] transition-colors cursor-pointer">
                  Rules &amp; Drone Specs
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('gallery')} className="hover:text-[#d0fe1d] transition-colors cursor-pointer">
                  Arena Action Gallery
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    handleNav('home');
                    setTimeout(() => {
                      document.getElementById('sponsors')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }} 
                  className="hover:text-[#d0fe1d] transition-colors cursor-pointer"
                >
                  Sponsors &amp; Partners
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Info & Portals */}
          <div className="space-y-3">
            <div className="text-xs font-orbitron text-[#d0fe1d] uppercase tracking-widest font-black">
              PORTALS
            </div>
            <ul className="space-y-2.5 text-xs font-sans text-neutral-300">
              <li>
                <button onClick={() => handleNav('register')} className="hover:text-[#d0fe1d] transition-colors font-semibold text-white cursor-pointer">
                  Squad Registration
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('login')} className="hover:text-[#d0fe1d] transition-colors cursor-pointer">
                  Registered Squad Portal
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('login')} className="hover:text-[#d0fe1d] transition-colors cursor-pointer">
                  Tournament Admin Hub
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('contact')} className="hover:text-[#d0fe1d] transition-colors cursor-pointer">
                  Helpline &amp; Secretariat
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Action / Share */}
          <div className="space-y-3">
            <div className="text-xs font-orbitron text-[#d0fe1d] uppercase tracking-widest font-black">
              ACTION
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Open to university students, college robotics clubs, and collegiate flight teams nationwide.
            </p>
            <div className="pt-2 space-y-2.5">
              <button
                onClick={() => handleNav('register')}
                className="xotc-btn-lime w-full py-2.5 px-4 text-[11px] text-center cursor-pointer"
              >
                REGISTER NOW
              </button>

              {onOpenShare && (
                <button
                  onClick={onOpenShare}
                  className="xotc-btn-outline w-full py-2.5 px-4 text-[11px] text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>SHARE EVENT</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-neutral-500">
          <div>
            GDSL © 2026 ALL RIGHTS RESERVED · GCDIS GALGOTIAS UNIVERSITY
          </div>

          <div className="flex items-center gap-6">
            <span className="text-[#d0fe1d] font-bold">FAI CLASS F9A RECOGNISED</span>
            <span className="text-white/20">|</span>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-neutral-300 hover:text-[#d0fe1d] font-bold transition-colors cursor-pointer"
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
