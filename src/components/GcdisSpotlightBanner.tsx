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
    <div className="relative z-20 w-full px-3 sm:px-6 md:px-8 lg:px-12 xl:px-16 my-12 sm:my-16 lg:my-20 space-y-12 sm:space-y-16 lg:space-y-20 pointer-events-auto text-white">
      {/* Banner 1: Host Institution & Proving Arena */}
      <Parallax3DSection offsetY={45} rotateXRange={[6, 0, -5]} scaleRange={[0.96, 1, 0.97]}>
        <Tilt3DCard maxTilt={4} scrollOffsetY={25} className="w-full max-w-[1440px] 2xl:max-w-[1600px] mx-auto">
          <section className="bg-[#161814] border border-[#d0fe1d]/50 p-5 sm:p-8 md:p-10 lg:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8 text-left shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
              <GcdisLogo size="lg" showWordmark={false} />
              <div className="max-w-2xl">
                <span className="font-rajdhani text-xs font-bold text-[#d0fe1d] uppercase tracking-[0.22em]">
                  HOSTED BY GCDIS AT GALGOTIAS UNIVERSITY
                </span>
                <h3 className="mt-1 text-lg sm:text-2xl lg:text-3xl font-orbitron font-black text-white uppercase tracking-wider">
                  GALGOTIAS DRONE SOCCER ARENA
                </h3>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5 w-full lg:w-auto shrink-0">
              <button
                onClick={() => handleJump('rules')}
                className="xotc-btn-outline px-5 sm:px-6 py-3 sm:py-3.5 text-xs text-center justify-center flex items-center cursor-pointer"
              >
                GDSL Rules
              </button>
              <button
                onClick={() => handleJump('register')}
                className="xotc-btn-lime px-6 sm:px-7 py-3 sm:py-3.5 text-xs text-center justify-center flex items-center cursor-pointer"
              >
                REGISTER SQUAD NOW
              </button>
            </div>
          </section>
        </Tilt3DCard>
      </Parallax3DSection>
    </div>
  );
};
export default GcdisSpotlightBanner;
