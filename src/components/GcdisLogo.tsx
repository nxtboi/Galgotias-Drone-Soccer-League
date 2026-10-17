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
        className={`relative ${iconDimensions} rounded-full shrink-0 shadow-sm border border-blue-900/15 overflow-hidden transition-transform duration-300 hover:scale-105 bg-white`}
        title="Galgotias Drone Soccer League · GCDIS"
      >
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full rounded-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Top curved path for GALGOTIAS UNIVERSITY */}
            <path id="topTextArcComp" d="M 68,250 A 182,182 0 1,1 432,250" fill="none" />
            {/* Bottom curved path for G.C.D.I.S */}
            <path id="bottomTextArcComp" d="M 72,250 A 178,178 0 0,0 428,250" fill="none" />

            <linearGradient id="compRedFlame" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b91c1c" />
              <stop offset="50%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="compYellowFlame" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="compCyanFlame" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>

          {/* White Circular Base Plate */}
          <circle cx="250" cy="250" r="244" fill="#ffffff" />

          {/* Outermost Bold Navy Ring */}
          <circle cx="250" cy="250" r="238" fill="none" stroke="#081e4b" strokeWidth="14" />

          {/* Arced Top Text: GALGOTIAS UNIVERSITY */}
          <text
            fill="#081e4b"
            fontFamily="'Inter', -apple-system, sans-serif"
            fontWeight="900"
            fontSize="34"
            letterSpacing="4px"
          >
            <textPath href="#topTextArcComp" startOffset="50%" textAnchor="middle">
              GALGOTIAS UNIVERSITY
            </textPath>
          </text>

          {/* Arced Bottom Text: G . C . D . I . S */}
          <text
            fill="#081e4b"
            fontFamily="'Inter', -apple-system, sans-serif"
            fontWeight="900"
            fontSize="37"
            letterSpacing="6px"
          >
            <textPath href="#bottomTextArcComp" startOffset="50%" textAnchor="middle">
              G . C . D . I . S
            </textPath>
          </text>

          {/* Side Separator Dots */}
          <circle cx="75" cy="250" r="14" fill="#081e4b" />
          <circle cx="425" cy="250" r="14" fill="#081e4b" />

          {/* Inner Concentric Circle Ring */}
          <circle cx="250" cy="250" r="146" fill="none" stroke="#081e4b" strokeWidth="7" />

          {/* 4 Diagonal Arms for the Quadcopter Drone */}
          <line x1="250" y1="250" x2="182" y2="182" stroke="#081e4b" strokeWidth="14" strokeLinecap="round" />
          <line x1="250" y1="250" x2="318" y2="182" stroke="#081e4b" strokeWidth="14" strokeLinecap="round" />
          <line x1="250" y1="250" x2="182" y2="318" stroke="#081e4b" strokeWidth="14" strokeLinecap="round" />
          <line x1="250" y1="250" x2="318" y2="318" stroke="#081e4b" strokeWidth="14" strokeLinecap="round" />

          {/* 4 Motor Hub Solid Disks */}
          <circle cx="182" cy="182" r="16" fill="#081e4b" />
          <circle cx="318" cy="182" r="16" fill="#081e4b" />
          <circle cx="182" cy="318" r="16" fill="#081e4b" />
          <circle cx="318" cy="318" r="16" fill="#081e4b" />

          {/* 4 Propeller Guard Protective Spherical Rings */}
          <circle cx="182" cy="182" r="47" fill="none" stroke="#081e4b" strokeWidth="7" />
          <circle cx="318" cy="182" r="47" fill="none" stroke="#081e4b" strokeWidth="7" />
          <circle cx="182" cy="318" r="47" fill="none" stroke="#081e4b" strokeWidth="7" />
          <circle cx="318" cy="318" r="47" fill="none" stroke="#081e4b" strokeWidth="7" />

          {/* Propeller Rotation Flow Lines */}
          <path d="M 148,172 A 38,38 0 0,1 214,162" fill="none" stroke="#081e4b" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 152,194 A 38,38 0 0,0 212,204" fill="none" stroke="#081e4b" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 286,162 A 38,38 0 0,1 352,172" fill="none" stroke="#081e4b" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 288,204 A 38,38 0 0,0 348,194" fill="none" stroke="#081e4b" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 148,308 A 38,38 0 0,1 214,298" fill="none" stroke="#081e4b" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 152,330 A 38,38 0 0,0 212,340" fill="none" stroke="#081e4b" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 286,298 A 38,38 0 0,1 352,308" fill="none" stroke="#081e4b" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 288,340 A 38,38 0 0,0 348,330" fill="none" stroke="#081e4b" strokeWidth="3.5" strokeLinecap="round" />

          {/* Central Avionics Housing Ring */}
          <circle cx="250" cy="250" r="59" fill="#ffffff" stroke="#081e4b" strokeWidth="8.5" />

          {/* Galgotias Tricolor Swirling Flame Emblem */}
          <g transform="translate(250, 250)">
            <path
              d="M -4,34 C -22,33 -38,18 -38,-4 C -38,-24 -24,-36 -4,-38 C -14,-28 -18,-14 -12,0 C -6,14 4,24 18,28 C 10,32 0,34 -4,34 Z"
              fill="url(#compRedFlame)"
            />
            <path
              d="M -6,-38 C 12,-38 28,-26 34,-10 C 37,-1 35,10 28,18 C 28,8 24,-2 14,-10 C 4,-18 -8,-24 -6,-38 Z"
              fill="url(#compYellowFlame)"
            />
            <path
              d="M 28,18 C 22,24 14,26 6,24 C 12,18 16,8 14,-2 C 12,-12 4,-18 -6,-22 C 4,-20 14,-12 18,-4 C 22,4 25,12 28,18 Z"
              fill="url(#compCyanFlame)"
            />
            <circle cx="6" cy="-4" r="3.5" fill="#ffffff" />
          </g>
        </svg>
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
