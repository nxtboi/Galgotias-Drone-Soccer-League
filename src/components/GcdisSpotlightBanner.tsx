import React from 'react';
import { Parallax3DSection, Tilt3DCard } from './Parallax3DSection';
import { GcdisLogo } from './GcdisLogo';

export interface GcdisSpotlightBannerProps {
  onNavigate: (page: string) => void;
}

export const GcdisSpotlightBanner: React.FC<GcdisSpotlightBannerProps> = ({ onNavigate }) => {
  const handleJump = (page: string) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative z-20 w-full px-4 sm:px-8 lg:px-16 my-20 space-y-20 pointer-events-auto text-white">
      {/* Banner 1: Host Institution & Proving Arena (Interchanged from Overview Section) */}
      <Parallax3DSection offsetY={45} rotateXRange={[6, 0, -5]} scaleRange={[0.96, 1, 0.97]}>
        <Tilt3DCard maxTilt={4} scrollOffsetY={25} className="max-w-6xl mx-auto">
          <section className="bg-[#161814] border border-[#d0fe1d]/50 p-6 sm:p-10 md:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 text-left shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <GcdisLogo size="lg" showWordmark={false} />
              <div className="max-w-xl">
                <span className="font-rajdhani text-xs font-bold text-[#d0fe1d] uppercase tracking-[0.22em]">
                  HOSTED BY GCDIS AT GALGOTIAS UNIVERSITY
                </span>
                <h3 className="mt-1 text-xl sm:text-3xl font-orbitron font-black text-white uppercase tracking-wider">
                  GALGOTIAS INDOOR DRONE SOCCER ARENA
                </h3>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full lg:w-auto shrink-0">
              <button
                onClick={() => handleJump('rules')}
                className="xotc-btn-outline px-6 py-3.5 text-xs text-center justify-center flex items-center cursor-pointer"
              >
                GCDIS 5TH REVISION RULES
              </button>
              <button
                onClick={() => handleJump('register')}
                className="xotc-btn-lime px-7 py-3.5 text-xs text-center justify-center flex items-center cursor-pointer"
              >
                REGISTER SQUAD NOW
              </button>
            </div>
          </section>
        </Tilt3DCard>
      </Parallax3DSection>

      {/* Grid: 4 Tournament Pillars with 3D Parallax & Tilt */}
      <Parallax3DSection offsetY={50} rotateXRange={[7, 0, -5]} scaleRange={[0.95, 1, 0.96]}>
        <div className="max-w-6xl mx-auto space-y-8 text-left">
          <div className="text-center space-y-2">
            <span className="text-xs font-rajdhani font-bold text-[#d0fe1d] uppercase tracking-[0.22em]">
              TOURNAMENT DIRECTORY
            </span>
            <h2 className="text-2xl sm:text-4xl font-orbitron font-black text-white uppercase tracking-wider">
              EXPLORE THE LEAGUE HUBS
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Bracket */}
            <Tilt3DCard maxTilt={8} scrollOffsetY={20} onClick={() => handleJump('bracket')}>
              <div className="group cursor-pointer p-6 xotc-card space-y-4 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 xotc-icon-box flex items-center justify-center font-orbitron font-black text-xs">
                      01
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#d0fe1d] uppercase tracking-wider">
                      · SOON
                    </span>
                  </div>
                  <h4 className="font-orbitron font-black text-sm text-white uppercase tracking-wider">
                    Knockout Bracket
                  </h4>
                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                    Official draw, group seeding, and knockout tree will unlock once team registrations close.
                  </p>
                </div>
                <div className="text-xs font-rajdhani text-[#d0fe1d] font-bold flex items-center gap-1.5 uppercase tracking-widest pt-2">
                  <span>View Bracket Status</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Tilt3DCard>

            {/* Card 2: Rules */}
            <Tilt3DCard maxTilt={8} scrollOffsetY={36} onClick={() => handleJump('rules')}>
              <div className="group cursor-pointer p-6 xotc-card space-y-4 flex flex-col justify-between h-full">
                <div>
                  <div className="w-10 h-10 xotc-icon-box flex items-center justify-center mb-4 font-orbitron font-black text-xs">
                    02
                  </div>
                  <h4 className="font-orbitron font-black text-sm text-white uppercase tracking-wider">
                    Rules &amp; Drone Specs
                  </h4>
                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                    GDSL Class D-20 and D-40 regulations, 400mm and 200mm sphere cage tolerances, weight limits, and scoring hoops.
                  </p>
                </div>
                <div className="text-xs font-rajdhani text-[#d0fe1d] font-bold flex items-center gap-1.5 uppercase tracking-widest pt-2">
                  <span>Read Rulebook</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Tilt3DCard>

            {/* Card 3: Action Gallery */}
            <Tilt3DCard maxTilt={8} scrollOffsetY={24} onClick={() => handleJump('gallery')}>
              <div className="group cursor-pointer p-6 xotc-card space-y-4 flex flex-col justify-between h-full">
                <div>
                  <div className="w-10 h-10 xotc-icon-box flex items-center justify-center mb-4 font-orbitron font-black text-xs">
                    03
                  </div>
                  <h4 className="font-orbitron font-black text-sm text-white uppercase tracking-wider">
                    Action Gallery &amp; Reels
                  </h4>
                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                    Official GCDIS tournament match video streams, 50 km/h cage collision captures, and podium ceremonies.
                  </p>
                </div>
                <div className="text-xs font-rajdhani text-[#d0fe1d] font-bold flex items-center gap-1.5 uppercase tracking-widest pt-2">
                  <span>View Match Action</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Tilt3DCard>

            {/* Card 4: Contact */}
            <Tilt3DCard maxTilt={8} scrollOffsetY={40} onClick={() => handleJump('contact')}>
              <div className="group cursor-pointer p-6 xotc-card space-y-4 flex flex-col justify-between h-full">
                <div>
                  <div className="w-10 h-10 xotc-icon-box flex items-center justify-center mb-4 font-orbitron font-black text-xs">
                    04
                  </div>
                  <h4 className="font-orbitron font-black text-sm text-white uppercase tracking-wider">
                    Pilot Helpline
                  </h4>
                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                    24/7 tournament coordinators, outstation hostel booking, and technical scrutineering desk.
                  </p>
                </div>
                <div className="text-xs font-rajdhani text-[#d0fe1d] font-bold flex items-center gap-1.5 uppercase tracking-widest pt-2">
                  <span>Connect Desk</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Tilt3DCard>
          </div>
        </div>
      </Parallax3DSection>
    </div>
  );
};
export default GcdisSpotlightBanner;
