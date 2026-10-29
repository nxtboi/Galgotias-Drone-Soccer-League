import React from 'react';

export interface GcdisLogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'glass';
  badgeOnly?: boolean;
}

export const GcdisLogo: React.FC<GcdisLogoProps> = ({
  className = '',
  showWordmark = true,
  size = 'md',
  variant = 'light',
  badgeOnly = false,
}) => {
  const iconDimensions = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }[size];

  const wordmarkSizes = {
    xs: {
      title: 'text-xs font-black tracking-tight',
      sub: 'text-[7px] tracking-wider',
    },
    sm: {
      title: 'text-sm font-black tracking-tight',
      sub: 'text-[8px] tracking-wider',
    },
    md: {
      title: 'text-base sm:text-lg font-black tracking-tight leading-tight',
      sub: 'text-[9px] tracking-widest',
    },
    lg: {
      title: 'text-xl sm:text-2xl font-black tracking-tight leading-tight',
      sub: 'text-[10px] tracking-widest',
    },
    xl: {
      title: 'text-2xl sm:text-3xl font-black tracking-tight leading-tight',
      sub: 'text-xs tracking-widest',
    },
  }[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Official Galgotias Drone Soccer League & GCDIS Circular Logo */}
      <div
        className={`relative ${iconDimensions} aspect-square rounded-full shrink-0 shadow-md border border-white/20 overflow-hidden transition-transform duration-300 hover:scale-105 bg-white flex items-center justify-center`}
        title="Galgotias Centre for Drone Intelligence & Simulation · GCDIS"
      >
        <img
          src="/assets/aistudio/GCDIS_HD_Logo_aeb80099.png"
          alt="Galgotias Centre for Drone Intelligence & Simulation (GCDIS) Logo"
          className="w-full h-full rounded-full object-cover object-center block"
          loading="eager"
        />
      </div>

      {/* Event Wordmark & Host Affiliation */}
      {showWordmark && !badgeOnly && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2.5">
            <span
              className={`font-orbitron font-black tracking-wider uppercase text-white group-hover:text-[#d0fe1d] transition-colors ${wordmarkSizes.title}`}
            >
              GALGOTIAS DRONE SOCCER LEAGUE
            </span>
            <span className="hidden md:inline-flex items-center text-[10px] font-mono font-bold text-[#d0fe1d] tracking-widest uppercase">
              · GDSL 2026
            </span>
          </div>
          <span className="font-rajdhani uppercase text-neutral-400 font-semibold leading-tight mt-0.5 hidden sm:block text-xs tracking-widest">
            GCDIS · Galgotias Centre for Drone Intelligence &amp; Simulation
          </span>
        </div>
      )}
    </div>
  );
};

export default GcdisLogo;
