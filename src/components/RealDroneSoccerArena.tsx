import React, { useState } from 'react';
import { GcdisLogo } from './GcdisLogo';

export interface RealDroneSoccerArenaProps {
  onRegisterClick?: () => void;
  onBracketClick?: () => void;
  onRulesClick?: () => void;
}

interface VideoChannel {
  id: string;
  videoId: string;
  title: string;
  category: string;
  source: string;
  badge: string;
  description: string;
}

const CHANNELS: VideoChannel[] = [
  {
    id: 'ch-1',
    videoId: 'vfyZZAgXipA',
    title: 'FIDA International Cup: 5v5 Live Arena Clash',
    category: 'Main Arena Feed',
    source: 'FIDA Official Championship',
    badge: 'LIVE MATCH',
    description: 'High-octane 5v5 aerial soccer clash inside the full-size regulation netted Skyfence.',
  },
  {
    id: 'ch-2',
    videoId: '4S9OA1rtFn4',
    title: 'High-Impact Collisions & 50 km/h Cage Battles',
    category: 'Collision Highlights',
    source: 'FIDA World Cup',
    badge: 'ACTION REEL',
    description: 'Defenders executing body-checks, blocking strikers, and real drone ball crash survivability.',
  },
  {
    id: 'ch-3',
    videoId: 'dAIhdSUbXBE',
    title: 'FAI World Drone Soccer Championship Finals',
    category: 'Championship Final',
    source: 'FAI World Air Sports',
    badge: 'GRAND FINALE',
    description: 'The pinnacle of collegiate and national drone soccer pilots scoring through elevated 3m hoops.',
  },
  {
    id: 'ch-4',
    videoId: '3UG-b0J8j38',
    title: 'Class 40 & Class 20 Arena Pilot Showcase',
    category: 'Pilot Dugout & Tech',
    source: 'FIDA USA',
    badge: 'TECH & PILOTS',
    description: 'Pilots wearing FPV goggles, bench technicians, rapid LiPo battery swaps, and pit stops.',
  },
];

export const RealDroneSoccerArena: React.FC<RealDroneSoccerArenaProps> = ({
  onRegisterClick,
}) => {
  const [activeChannelIndex, setActiveChannelIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState<'match' | 'ball' | 'var'>('match');

  const activeChannel = CHANNELS[activeChannelIndex];

  return (
    <div className="relative w-full overflow-hidden bg-[#111210] border border-white/20 shadow-2xl text-white">
      {/* Real Broadcast Video Layer */}
      <div className={`relative w-full ${isCinemaMode ? 'aspect-[16/9] min-h-[260px] sm:min-h-[580px]' : 'aspect-[16/9] sm:aspect-[21/9] min-h-[220px] sm:min-h-[460px] max-h-[680px]'} bg-black overflow-hidden`}>
        <iframe
          key={`${activeChannel.videoId}-${isMuted}`}
          className="absolute inset-0 w-full h-full pointer-events-auto border-0"
          src={`https://www.youtube-nocookie.com/embed/${activeChannel.videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${activeChannel.videoId}&controls=1&modestbranding=1&rel=0&playsinline=1`}
          title={activeChannel.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />

        {/* Live Broadcast Telemetry HUD Overlay (Top) */}
        <div className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-2 sm:gap-3 bg-[#111210]/90 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 border border-[#d0fe1d]/40 pointer-events-auto shadow-lg">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#d0fe1d] animate-ping" />
              <span className="font-mono text-[10px] sm:text-xs font-black tracking-widest text-[#d0fe1d] uppercase">
                {activeChannel.badge}
              </span>
            </div>
            <span className="text-neutral-600 text-xs">|</span>
            <div className="text-left">
              <div className="text-[11px] sm:text-xs font-orbitron font-bold text-white leading-tight truncate max-w-[140px] xs:max-w-[200px] sm:max-w-none">
                {activeChannel.title}
              </div>
              <div className="text-[9px] sm:text-[10px] font-mono text-neutral-400">
                {activeChannel.source} · 1080p
              </div>
            </div>
          </div>

          {/* Controls: Audio, Cinema Mode */}
          <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="px-3 py-1.5 bg-[#111210]/90 hover:border-[#d0fe1d] text-white font-mono text-[10px] sm:text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5 backdrop-blur-md min-h-[34px] cursor-pointer"
              title={isMuted ? 'Unmute match audio' : 'Mute audio'}
            >
              <span>{isMuted ? '🔇 MUTE' : '🔊 AUDIO'}</span>
            </button>

            <button
              onClick={() => setIsCinemaMode(!isCinemaMode)}
              className="px-3 py-1.5 bg-[#d0fe1d] hover:bg-[#e2ff54] text-black font-orbitron text-[10px] sm:text-xs font-black transition-all min-h-[34px] cursor-pointer"
            >
              {isCinemaMode ? 'STANDARD' : 'CINEMA ⛶'}
            </button>
          </div>
        </div>

        {/* Live Score Bug HUD Overlay (Bottom-Left) */}
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 hidden xs:flex items-center gap-2 sm:gap-3 bg-[#111210]/90 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 border border-white/20 pointer-events-auto">
          <div className="flex items-center gap-2 font-orbitron">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#d0fe1d]" />
              <span className="text-[11px] sm:text-xs font-black text-white">HAWKS</span>
              <span className="text-sm sm:text-base font-black text-[#d0fe1d] ml-1">14</span>
            </div>
            <span className="text-neutral-500 px-1 font-bold">-</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-black text-white mr-1">11</span>
              <span className="text-[11px] sm:text-xs font-black text-neutral-300">VORTEX</span>
              <span className="w-2 h-2 bg-white/50" />
            </div>
          </div>
          <span className="text-neutral-600 hidden sm:inline">|</span>
          <div className="font-mono text-[10px] sm:text-xs hidden sm:block">
            <span className="text-[#d0fe1d] font-bold">SET 2</span>
            <span className="text-neutral-400 ml-2">1:42</span>
          </div>
        </div>
      </div>

      {/* Camera Angles Switcher Bar */}
      <div className="p-3 sm:p-5 bg-[#171915] border-t border-white/15 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 overflow-hidden">
          <span className="font-rajdhani text-xs font-bold text-[#d0fe1d] uppercase tracking-[0.2em] shrink-0 text-left">
            ARENA CAMERAS:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {CHANNELS.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannelIndex(idx)}
                className={`px-3.5 py-1.5 font-mono text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer border ${
                  activeChannelIndex === idx
                    ? 'bg-[#d0fe1d] text-black border-[#d0fe1d]'
                    : 'bg-[#111210] text-neutral-300 hover:text-white border-white/15 hover:border-[#d0fe1d]/50'
                }`}
              >
                CAM {idx + 1}: {ch.category}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 shrink-0">
          {onRegisterClick && (
            <button
              onClick={onRegisterClick}
              className="xotc-btn-lime w-full sm:w-auto px-5 py-2 text-xs text-center cursor-pointer"
            >
              Register Team For League →
            </button>
          )}
        </div>
      </div>

      {/* Real Drone Soccer Technical Spotlight Bar */}
      <div className="p-6 sm:p-8 bg-[#111210] border-t border-white/15 text-left space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-4">
          <div className="flex items-center gap-3">
            <GcdisLogo size="sm" showWordmark={false} />
            <div>
              <span className="text-[10px] font-rajdhani font-bold text-[#d0fe1d] uppercase tracking-[0.2em]">
                AUTHENTIC SPORT HARDWARE
              </span>
              <h3 className="text-lg sm:text-xl font-orbitron font-black text-white uppercase tracking-wider">
                REAL CAGED DRONE SOCCER BALL ANATOMY
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveInfoTab('match')}
              className={`px-3.5 py-1.5 font-rajdhani uppercase tracking-wider text-xs font-bold cursor-pointer border ${
                activeInfoTab === 'match'
                  ? 'bg-[#d0fe1d] text-black border-[#d0fe1d]'
                  : 'bg-[#171915] text-neutral-400 border-white/15 hover:text-white'
              }`}
            >
              Match Action
            </button>
            <button
              onClick={() => setActiveInfoTab('ball')}
              className={`px-3.5 py-1.5 font-rajdhani uppercase tracking-wider text-xs font-bold cursor-pointer border ${
                activeInfoTab === 'ball'
                  ? 'bg-[#d0fe1d] text-black border-[#d0fe1d]'
                  : 'bg-[#171915] text-neutral-400 border-white/15 hover:text-white'
              }`}
            >
              Drone Ball Specs
            </button>
            <button
              onClick={() => setActiveInfoTab('var')}
              className={`px-3.5 py-1.5 font-rajdhani uppercase tracking-wider text-xs font-bold cursor-pointer border ${
                activeInfoTab === 'var'
                  ? 'bg-[#d0fe1d] text-black border-[#d0fe1d]'
                  : 'bg-[#171915] text-neutral-400 border-white/15 hover:text-white'
              }`}
            >
              FIDA Net Cage
            </button>
          </div>
        </div>

        {/* Tab Content 1: Match Action Explainer */}
        {activeInfoTab === 'match' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-neutral-300">
            <div className="p-5 bg-[#171915] border border-white/15 space-y-2">
              <div className="font-orbitron font-bold text-white uppercase text-xs flex items-center gap-2">
                <span className="w-2 h-2 bg-[#d0fe1d]" />
                <span>50 km/h Aerial Collisions</span>
              </div>
              <p className="leading-relaxed text-neutral-400">
                Unlike delicate camera drones, official drone soccer balls are engineered to absorb violent full-speed mid-air crashes against opponents, goal hoops, and netting without breaking.
              </p>
            </div>

            <div className="p-5 bg-[#171915] border border-white/15 space-y-2">
              <div className="font-orbitron font-bold text-white uppercase text-xs flex items-center gap-2">
                <span className="w-2 h-2 bg-[#d0fe1d]" />
                <span>One Designated Striker</span>
              </div>
              <p className="leading-relaxed text-neutral-400">
                The Striker drone carries a green LED indicator and ribbon tag. When it penetrates the circular hoop from front to back, the goal turns red and the team enters an offside retreat.
              </p>
            </div>

            <div className="p-5 bg-[#171915] border border-white/15 space-y-2">
              <div className="font-orbitron font-bold text-white uppercase text-xs flex items-center gap-2">
                <span className="w-2 h-2 bg-[#d0fe1d]" />
                <span>3-Minute High-Heartrate Sets</span>
              </div>
              <p className="leading-relaxed text-neutral-400">
                Matches are 3 sets of 3 minutes each with 5-minute pit lane intervals for rapid battery changes, carbon strut realignment, and pilot coaching.
              </p>
            </div>
          </div>
        )}

        {/* Tab Content 2: Physical Ball Specifications */}
        {activeInfoTab === 'ball' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-5 bg-[#171915] border border-white/15">
              <div className="text-[10px] font-rajdhani font-bold tracking-widest text-[#d0fe1d] uppercase">EXOSKELETON</div>
              <div className="font-orbitron text-sm font-black text-white mt-1">Class 40 (40cm ± 2cm)</div>
              <p className="text-[11px] text-neutral-400 mt-1">Carbon-fiber &amp; polycarbonate geodesic cage, max open area ≤150 cm².</p>
            </div>

            <div className="p-5 bg-[#171915] border border-white/15">
              <div className="text-[10px] font-rajdhani font-bold tracking-widest text-[#d0fe1d] uppercase">WEIGHT RESTRICTION</div>
              <div className="font-orbitron text-sm font-black text-white mt-1">≤ 1,100 Grams</div>
              <p className="text-[11px] text-neutral-400 mt-1">Class 20 division: ≤ 110g, 20cm diameter (strict zero-modification rule).</p>
            </div>

            <div className="p-5 bg-[#171915] border border-white/15">
              <div className="text-[10px] font-rajdhani font-bold tracking-widest text-[#d0fe1d] uppercase">PROPULSION</div>
              <div className="font-orbitron text-sm font-black text-white mt-1">2806.5 Brushless Motors</div>
              <p className="text-[11px] text-neutral-400 mt-1">High-RPM tri-blade props generating over 2.5 kg total thrust inside the cage.</p>
            </div>

            <div className="p-5 bg-[#171915] border border-white/15">
              <div className="text-[10px] font-rajdhani font-bold tracking-widest text-[#d0fe1d] uppercase">LIGHTING STRIP</div>
              <div className="font-orbitron text-sm font-black text-white mt-1">360° Circular LED Ring</div>
              <p className="text-[11px] text-neutral-400 mt-1">≥6 individual LEDs per 10cm displaying Team Red/Blue and Player Role.</p>
            </div>
          </div>
        )}

        {/* Tab Content 3: Arena Netting */}
        {activeInfoTab === 'var' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-neutral-300">
            <div className="p-5 bg-[#171915] border border-white/15 space-y-2">
              <div className="font-orbitron font-bold text-white uppercase text-xs">FIDA Regulation Skyfence</div>
              <p className="leading-relaxed text-neutral-400">
                16 meters long by 7-8 meters wide by 4.5 meters height. Enclosed with high-tensile netting (deflection ≤20cm at 5 m/s) ensuring 100% spectator ballistic protection.
              </p>
            </div>

            <div className="p-5 bg-[#171915] border border-white/15 space-y-2">
              <div className="font-orbitron font-bold text-white uppercase text-xs">Elevated Goal Hoops</div>
              <p className="leading-relaxed text-neutral-400">
                Two donut-shaped goals (60cm inner / 100cm outer, 20cm thick, 10-15kg) suspended at 3.0 to 3.5 meters elevation with internal White and Red goal LEDs.
              </p>
            </div>

            <div className="p-5 bg-[#171915] border border-white/15 space-y-2">
              <div className="font-orbitron font-bold text-white uppercase text-xs">Broadcast &amp; VAR System</div>
              <p className="leading-relaxed text-neutral-400">
                Equipped with Tier 2 Pro VAR: 5 synchronized 1080/60p cameras (both goals, both pilot areas, whole pitch) with timecode sync for buzzer-beater reviews.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default RealDroneSoccerArena;
