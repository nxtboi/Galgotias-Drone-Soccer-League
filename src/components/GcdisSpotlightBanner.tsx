import React from 'react';
import { Parallax3DSection, Tilt3DCard } from './Parallax3DSection';

export interface GcdisSpotlightBannerProps {
  onNavigate: (page: string) => void;
}

export const GcdisSpotlightBanner: React.FC<GcdisSpotlightBannerProps> = ({ onNavigate }) => {
  const handleJump = (page: string) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className="relative z-20 w-full px-4 sm:px-8 lg:px-16 my-20 space-y-20 pointer-events-auto text-white"
      style={{ perspective: '1300px', transformStyle: 'preserve-3d' }}
    >
      {/* Banner 1: XOTC "GET EARLY ACCESS" Style Chamfered Neon-Lime Frame with 3D Parallax */}
      <Parallax3DSection offsetY={60} rotateXRange={[9, 0, -7]} scaleRange={[0.94, 1, 0.95]}>
        <Tilt3DCard maxTilt={5} scrollOffsetY={30} className="max-w-6xl mx-auto">
          <div className="relative bg-[#151713] border border-[#d0fe1d]/70 p-8 sm:p-12 md:p-16 shadow-[0_25px_70px_rgba(208,254,29,0.14)] overflow-hidden">
            {/* Ambient Acid-Lime City/Arena Glow */}
            <div
              className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#d0fe1d]/15 blur-[100px] rounded-full pointer-events-none"
              aria-hidden="true"
            />

            {/* Dot Matrix Bottom Accent */}
            <div
              className="hidden sm:block absolute bottom-3 left-1/3 w-20 h-4 xotc-dots-lime opacity-85 pointer-events-none"
              aria-hidden="true"
            />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="space-y-4 text-left max-w-xl">
                <span className="font-rajdhani text-xs font-bold text-[#d0fe1d] uppercase tracking-[0.22em]">
                  OFFICIAL INVITATION · INTERCOLLEGIATE CUP
                </span>
                <h3 className="text-3xl sm:text-5xl font-orbitron font-black tracking-wider uppercase text-white leading-[1.08]">
                  REGISTER <br />
                  YOUR <br />
                  <span className="text-[#d0fe1d]">SQUAD</span>
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed max-w-md">
                  32 team slots. Total pool of ₹1,00,000 (including trophy and cash prize). Class 20 (₹37,000 pool) &amp; Class 40 (₹57,000 pool) divisions, FIDA rules, and live arena stream at Galgotias University.
                </p>
              </div>

              <div className="hidden lg:block text-[#d0fe1d] font-mono text-4xl font-bold select-none">
                →
              </div>

              <div className="w-full lg:w-auto shrink-0">
                <button
                  onClick={() => handleJump('register')}
                  className="xotc-btn-lime w-full sm:w-auto min-h-[56px] px-10 py-4 text-xs sm:text-sm text-center justify-center flex items-center cursor-pointer"
                >
                  REGISTER SQUAD NOW
                </button>
              </div>
            </div>
          </div>
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
                    FAI Class F9A regulations, 400mm sphere cage tolerances, weight limits, and scoring hoops.
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
                    Official FIDA tournament match video streams, 50 km/h cage collision captures, and podium ceremonies.
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
