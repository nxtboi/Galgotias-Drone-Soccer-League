import React from 'react';
import { motion } from 'motion/react';
import { PRIZE_POOLS, SPECIAL_PRIZE_CATEGORIES } from '../data/droneSoccerData';
import { GcdisLogo } from './GcdisLogo';
import {
  Parallax3DSection,
  ParallaxDepthLayer,
  Tilt3DCard,
} from './Parallax3DSection';

export interface TournamentOverviewSectionProps {
  onRegisterClick: () => void;
  onBracketClick: () => void;
  onRulesClick: () => void;
}

export const TournamentOverviewSection: React.FC<TournamentOverviewSectionProps> = ({
  onRegisterClick,
  onBracketClick,
  onRulesClick,
}) => {
  const roadmapSteps = [
    { title: 'Squad Registration', sub: 'Slots filling fast', completed: true },
    { title: 'Tech Scrutineering', sub: 'Dec 08 · Sphere & Weight Check', completed: true },
    { title: 'Group Stage Heats', sub: 'Dec 08 · 5v5 Cage Clashes', completed: true },
    { title: 'Quarter-Finals', sub: 'Dec 09 · Knockout Seeding', active: true },
    { title: 'Semi-Final Showdown', sub: 'Dec 09 · D-40 & D-20 Cups', active: false },
    { title: 'Grand Championship', sub: 'Dec 09 · ₹2,00,000 Purse', active: false },
  ];

  return (
    <div className="relative z-20 w-full py-12 sm:py-16 md:py-20 lg:py-24 px-3 sm:px-6 md:px-8 lg:px-12 xl:px-16 bg-transparent text-white">
      <div className="w-full max-w-[1440px] 2xl:max-w-[1600px] mx-auto space-y-14 sm:space-y-18 md:space-y-22 lg:space-y-24">
        {/* ABOUT: GCDIS & WHAT IS DRONE SOCCER — Responsive Dual/Stacked Architectural Divisions */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-stretch">
          {/* Division 1: About GCDIS */}
          <section className="xl:col-span-6 xotc-card p-5 sm:p-7 md:p-9 lg:p-10 text-left flex flex-col justify-between space-y-4 h-full">
            <div className="space-y-3">
              <span className="font-rajdhani text-xs font-bold text-[#d0fe1d] tracking-[0.22em] uppercase block">
                HOST RESEARCH &amp; INNOVATION HUB
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-orbitron font-black text-white uppercase tracking-wider leading-tight">
                About: <span className="text-[#d0fe1d]">Galgotias Centre of Drone Intelligence &amp; Simulation (GCDIS)</span>
              </h2>
            </div>

            <p className="text-neutral-300 text-sm sm:text-base lg:text-lg leading-relaxed font-sans w-full text-left sm:text-justify">
              The Galgotias Centre for Drone Intelligence &amp; Simulation (GCDIS) stands as a premier hub of innovation, research, and training dedicated to advancing the frontiers of unmanned aerial systems and intelligent flight technologies. Established at Galgotias University, the Centre embodies the institution’s vision to create a transformative platform for nurturing next generation engineers, innovators, and entrepreneurs in the field of drones and autonomous aerial systems.
            </p>
          </section>

          {/* Division 2: What Is Drone Soccer? */}
          <Parallax3DSection offsetY={65} rotateXRange={[8, 0, -6]} scaleRange={[0.94, 1, 0.95]} className="xl:col-span-6 h-full">
            <section className="xotc-card p-5 sm:p-7 md:p-9 lg:p-10 text-left flex flex-col justify-between space-y-4 h-full">
              <ParallaxDepthLayer speed={0.18} translateZ={28} className="space-y-3">
                <span className="font-rajdhani text-xs font-bold text-[#d0fe1d] tracking-[0.22em] uppercase block">
                  OFFICIAL LEAGUE EXPLAINER
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-orbitron font-black text-white uppercase tracking-wider leading-tight">
                  WHAT IS <span className="text-[#d0fe1d]">DRONE SOCCER?</span>
                </h2>
              </ParallaxDepthLayer>
              <ParallaxDepthLayer speed={-0.12} translateZ={16}>
                <p className="text-neutral-300 text-sm sm:text-base lg:text-lg leading-relaxed font-sans text-left sm:text-justify">
                  Drone Soccer is a game in which 3-5 players from each team control the drone in the shape of a soccer ball to score in a round goal of the opponent team inside a Netted play Zone called the Arena. Two teams of five players compete in a netted arena. Roles include a designated Striker (the only drone allowed to score points by flying through the opponent's suspended hoop) alongside blockers, midfielders, and defenders.
                </p>
              </ParallaxDepthLayer>
            </section>
          </Parallax3DSection>
        </div>

        {/* SECTION 2: THE RULES OF 3D AERIAL SOCCER (Responsive 1 -> 2 -> 4 Column Grid) */}
        <Parallax3DSection offsetY={70} rotateXRange={[9, 0, -7]} scaleRange={[0.94, 1, 0.95]}>
          <section className="space-y-8 sm:space-y-10 lg:space-y-12 relative">
            {/* Ambient green underglow behind the 4 cards */}
            <div className="absolute inset-x-6 sm:inset-x-12 bottom-8 h-36 sm:h-48 bg-[#d0fe1d]/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-3 px-2">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-orbitron font-black text-white uppercase tracking-wider">
                THE RULES OF 3D AERIAL SOCCER
              </h2>
              <div className="text-[#d0fe1d] font-mono text-xl sm:text-2xl leading-none">↓</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 xl:gap-7 relative z-10 items-stretch">
              {[
                {
                  num: '01',
                  title: 'DRONE BALL & EXOSKELETON',
                  desc: 'Each pilot flies one round exoskeleton drone ball: Ø 20 ± 1 cm (max 150 g, open surface ≤ 70 cm²) in Class D20, and Ø 40 ± 2 cm (max 1.2 kg, open surface ≤ 150 cm²) in Class D40, lit with red or blue team LED rings.',
                  icon: (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="9" strokeWidth={2.2} />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
                    </svg>
                  ),
                },
                {
                  num: '02',
                  title: 'STRIKER & FRONT-TO-BACK GOAL',
                  desc: 'Only the Striker carrying a green tag and LED can score by passing completely through the opponent’s goal ring from front to back (1 Striker per team in Class D40; max 2 Strikers per team in Class D20).',
                  icon: (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                },
                {
                  num: '03',
                  title: 'OFFSIDE & REVERSE ENTRY',
                  desc: 'After a Striker passes through the opponent’s goal, all team balls in the opponent’s half must return behind the half line before scoring again. Defenders may pass through their own goal front-to-back only—reverse entry awards a penalty kick.',
                  icon: (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  ),
                },
                {
                  num: '04',
                  title: '3 SETS × 3 MIN & PENALTY KICKS',
                  desc: 'Games are 3 sets of 3 minutes with no time-outs and at least 5 minutes of repair time between sets. Penalty kicks are 1-on-1 (Striker vs Keeper) for 5 seconds from the half line.',
                  icon: (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="9" strokeWidth={2.2} />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 7v5l3 3" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <Tilt3DCard
                  key={item.num}
                  className="h-full"
                >
                  <div
                    className="xotc-card p-5 sm:p-6 lg:p-7 flex flex-col items-center text-center justify-between min-h-[220px] sm:min-h-[250px] lg:min-h-[275px] h-full"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 xotc-icon-box flex items-center justify-center mb-4 sm:mb-5 mt-1">
                      {item.icon}
                    </div>
                    <div className="space-y-2.5 sm:space-y-3">
                      <div className="text-[10px] sm:text-[11px] font-mono text-[#d0fe1d] tracking-widest uppercase">
                        {item.num} · OFFICIAL RULE
                      </div>
                      <h3 className="text-xs sm:text-sm font-orbitron font-black text-white uppercase tracking-wider">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-sans">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </Tilt3DCard>
              ))}
            </div>

            <p className="text-center text-neutral-300 text-xs sm:text-sm max-w-xl mx-auto pt-2 px-2">
              University flight squads, pilot captains, and robotics engineers compete head-to-head under official GCDIS Class D20 and Class D40 Rule Book specifications.
            </p>

            {/* Center Crosshair Divider */}
            <div className="flex justify-center pt-1" aria-hidden="true">
              <div className="relative flex items-center justify-center w-8 h-8">
                <div className="w-3.5 h-3.5 rounded-full border border-[#d0fe1d]/80" />
                <div className="absolute w-8 h-[1px] bg-[#d0fe1d]/80" />
                <div className="absolute h-8 w-[1px] bg-[#d0fe1d]/80" />
              </div>
            </div>
          </section>
        </Parallax3DSection>

        {/* SECTION 3: DUAL DIVISION PRIZE POOL BREAKDOWN - HIGHLY HIGHLIGHTED */}
        <Parallax3DSection offsetY={60} rotateXRange={[7, 0, -6]} scaleRange={[0.95, 1, 0.96]}>
          <section
            id="prize-pool"
            className="relative scroll-mt-24 bg-gradient-to-b from-[#1d1910] via-[#141512] to-[#10110e] border-2 border-amber-400/80 p-5 sm:p-8 md:p-10 lg:p-12 xl:p-14 shadow-[0_0_90px_rgba(245,158,11,0.28),0_0_40px_rgba(208,254,29,0.14)] overflow-hidden"
          >
            {/* Ambient Background Glows */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 sm:w-[600px] h-48 bg-amber-400/15 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 right-10 w-80 h-48 bg-[#d0fe1d]/12 blur-[100px] rounded-full pointer-events-none" />

            {/* Corner Decorative Tech Brackets */}
            <div className="absolute top-0 left-0 w-8 sm:w-16 h-1 bg-amber-400" />
            <div className="absolute top-0 left-0 w-1 h-8 sm:h-16 bg-amber-400" />
            <div className="absolute top-0 right-0 w-8 sm:w-16 h-1 bg-[#d0fe1d]" />
            <div className="absolute top-0 right-0 w-1 h-8 sm:h-16 bg-[#d0fe1d]" />
            <div className="absolute bottom-0 left-0 w-8 sm:w-16 h-1 bg-[#d0fe1d]" />
            <div className="absolute bottom-0 left-0 w-1 h-8 sm:h-16 bg-[#d0fe1d]" />
            <div className="absolute bottom-0 right-0 w-8 sm:w-16 h-1 bg-amber-400" />
            <div className="absolute bottom-0 right-0 w-1 h-8 sm:h-16 bg-amber-400" />

            {/* Section Header */}
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 sm:mb-10">
              <div className="max-w-3xl text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/20 border border-amber-400/60 text-amber-300 mb-3 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <span className="font-orbitron text-[11px] sm:text-xs font-black tracking-widest uppercase">
                    ★ OFFICIAL CHAMPIONSHIP PURSE &amp; PODIUM HONORS ★
                  </span>
                </div>
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-orbitron font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-[#d0fe1d] leading-none">
                  ₹2,00,000 <span className="text-white">TOTAL PRIZE POOL</span>
                </h2>
                <p className="mt-3 text-neutral-200 text-xs sm:text-sm md:text-base leading-relaxed">
                  The grand collegiate aerial robotics prize purse in India. Over <strong className="text-amber-300">₹2,00,000</strong> in cash rewards, national championship rolling trophies, gold medals, and individual excellence bursaries allocated across <strong className="text-[#d0fe1d]">Class D-40 (₹94,000)</strong>, <strong className="text-[#d0fe1d]">Class D-20 (₹74,000)</strong>, and <strong className="text-cyan-300">Tactical Honors (₹33,000)</strong>.
                </p>
              </div>

              <div className="shrink-0 flex flex-wrap gap-2.5">
                <button
                  onClick={onRegisterClick}
                  className="xotc-btn-lime px-5 sm:px-7 py-3 text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-[0_0_30px_rgba(208,254,29,0.35)]"
                >
                  <span>REGISTER TO COMPETE</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Division Detail Grid */}
            <div className="space-y-12 sm:space-y-14 relative z-10">
              {/* D-40 DIVISION */}
              <div className="space-y-5 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b-2 border-amber-400/40 pb-4 text-left">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="px-2.5 py-0.5 text-xs font-mono font-black uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40">
                        HEAVYWEIGHT CATEGORY
                      </span>
                      <h3 className="text-lg sm:text-2xl font-orbitron font-black uppercase tracking-wider text-white">
                        Class D40 Division (Ø 40 cm Sphere)
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-300 mt-1">
                      Teams of 2–3 members · 16m × 7m × 4.5m standard cage · ≤ 1.2 kg drone weight · Ø 60 cm hoop
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0 bg-black/60 px-4 py-2 border border-amber-400/40">
                    <span className="text-[10px] sm:text-[11px] font-rajdhani text-neutral-400 block font-bold uppercase tracking-widest">
                      D-40 Total Division Purse
                    </span>
                    <span className="text-2xl sm:text-3xl font-orbitron font-black text-amber-300">
                      ₹94,000
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 items-stretch">
                  {PRIZE_POOLS.d40.prizes.map((prize, idx) => {
                    const isFirst = prize.highlight;
                    const isSecond = prize.place === '2nd Place';
                    const cardClass = isFirst
                      ? 'xotc-card-gold border-2 border-amber-400'
                      : isSecond
                      ? 'xotc-card-silver border border-slate-300/60'
                      : 'xotc-card-bronze border border-orange-500/50';

                    return (
                      <Tilt3DCard key={`d40-${prize.place}`} maxTilt={6} scrollOffsetY={20 + idx * 12}>
                        <div className={`p-6 sm:p-7 text-left flex flex-col justify-between transition-all h-full ${cardClass}`}>
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className={`text-[11px] font-orbitron font-black uppercase tracking-widest flex items-center gap-1.5 ${
                                isFirst ? 'text-amber-300' : isSecond ? 'text-slate-200' : 'text-orange-300'
                              }`}>
                                <span>{isFirst ? '🏆 1ST PLACE' : isSecond ? '🥈 2ND PLACE' : '🥉 3RD PLACE'}</span>
                              </span>
                              {isFirst && (
                                <span className="px-2 py-0.5 text-[9px] font-mono font-black bg-amber-400 text-black uppercase tracking-wider">
                                  CHAMPION
                                </span>
                              )}
                              {isSecond && (
                                <span className="px-2 py-0.5 text-[9px] font-mono font-black bg-slate-300 text-black uppercase tracking-wider">
                                  RUNNER-UP
                                </span>
                              )}
                            </div>

                            <div className={`text-3xl sm:text-4xl lg:text-5xl font-orbitron font-black tracking-wider mb-2 ${
                              isFirst ? 'text-amber-300' : isSecond ? 'text-white' : 'text-orange-200'
                            }`}>
                              {prize.amount}
                            </div>
                            <div className="text-sm font-bold text-white mb-4 uppercase font-rajdhani tracking-wider">
                              {prize.title}
                            </div>
                          </div>

                          <ul className="space-y-2.5 border-t border-white/20 pt-4 text-xs sm:text-sm text-neutral-200">
                            {prize.perks.map((p, pIdx) => (
                              <li key={pIdx} className="flex items-start gap-2">
                                <span className={`font-black ${isFirst ? 'text-amber-400' : isSecond ? 'text-slate-200' : 'text-orange-400'}`}>
                                  ✓
                                </span>
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </Tilt3DCard>
                    );
                  })}
                </div>
              </div>

              {/* D-20 DIVISION */}
              <div className="space-y-5 sm:space-y-6 pt-6 sm:pt-8 border-t-2 border-white/15">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b-2 border-[#d0fe1d]/40 pb-4 text-left">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="px-2.5 py-0.5 text-xs font-mono font-black uppercase bg-[#d0fe1d]/20 text-[#d0fe1d] border border-[#d0fe1d]/40">
                        HIGH-SPEED CATEGORY
                      </span>
                      <h3 className="text-lg sm:text-2xl font-orbitron font-black uppercase tracking-wider text-white">
                        Class D20 Division (Ø 20 cm Sphere)
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-300 mt-1">
                      Teams of 2–5 members · 8m × 4m × 3m standard cage · ≤ 150 g drone weight · Ø 30 cm hoop
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0 bg-black/60 px-4 py-2 border border-[#d0fe1d]/40">
                    <span className="text-[10px] sm:text-[11px] font-rajdhani text-neutral-400 block font-bold uppercase tracking-widest">
                      D-20 Total Division Purse
                    </span>
                    <span className="text-2xl sm:text-3xl font-orbitron font-black text-[#d0fe1d]">
                      ₹74,000
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 items-stretch">
                  {PRIZE_POOLS.d20.prizes.map((prize, idx) => {
                    const isFirst = prize.highlight;
                    const isSecond = prize.place === '2nd Place';
                    const cardClass = isFirst
                      ? 'xotc-card-lime border-2 border-[#d0fe1d]'
                      : isSecond
                      ? 'xotc-card-silver border border-slate-300/60'
                      : 'xotc-card-bronze border border-orange-500/50';

                    return (
                      <Tilt3DCard key={`d20-${prize.place}`} maxTilt={6} scrollOffsetY={20 + idx * 12}>
                        <div className={`p-6 sm:p-7 text-left flex flex-col justify-between transition-all h-full ${cardClass}`}>
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className={`text-[11px] font-orbitron font-black uppercase tracking-widest flex items-center gap-1.5 ${
                                isFirst ? 'text-[#d0fe1d]' : isSecond ? 'text-slate-200' : 'text-orange-300'
                              }`}>
                                <span>{isFirst ? '🏆 1ST PLACE' : isSecond ? '🥈 2ND PLACE' : '🥉 3RD PLACE'}</span>
                              </span>
                              {isFirst && (
                                <span className="px-2 py-0.5 text-[9px] font-mono font-black bg-[#d0fe1d] text-black uppercase tracking-wider">
                                  CHAMPION
                                </span>
                              )}
                              {isSecond && (
                                <span className="px-2 py-0.5 text-[9px] font-mono font-black bg-slate-300 text-black uppercase tracking-wider">
                                  RUNNER-UP
                                </span>
                              )}
                            </div>

                            <div className={`text-3xl sm:text-4xl lg:text-5xl font-orbitron font-black tracking-wider mb-2 ${
                              isFirst ? 'text-[#d0fe1d]' : isSecond ? 'text-white' : 'text-orange-200'
                            }`}>
                              {prize.amount}
                            </div>
                            <div className="text-sm font-bold text-white mb-4 uppercase font-rajdhani tracking-wider">
                              {prize.title}
                            </div>
                          </div>

                          <ul className="space-y-2.5 border-t border-white/20 pt-4 text-xs sm:text-sm text-neutral-200">
                            {prize.perks.map((p, pIdx) => (
                              <li key={pIdx} className="flex items-start gap-2">
                                <span className={`font-black ${isFirst ? 'text-[#d0fe1d]' : isSecond ? 'text-slate-200' : 'text-orange-400'}`}>
                                  ✓
                                </span>
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </Tilt3DCard>
                    );
                  })}
                </div>
              </div>

              {/* SPECIAL PRIZES CATEGORY */}
              <div className="space-y-5 sm:space-y-6 pt-6 sm:pt-8 border-t-2 border-white/15">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b-2 border-cyan-400/40 pb-4 text-left">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="px-2.5 py-0.5 text-xs font-mono font-black uppercase bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                        TACTICAL INDIVIDUAL EXCELLENCE
                      </span>
                      <h3 className="text-lg sm:text-2xl font-orbitron font-black uppercase tracking-wider text-white">
                        Special Championship Awards
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-300 mt-1">
                      Individual excellence recognition for tournament standouts · Voted by referee panel &amp; telemetry analytics
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0 bg-black/60 px-4 py-2 border border-cyan-400/40">
                    <span className="text-[10px] sm:text-[11px] font-rajdhani text-neutral-400 block font-bold uppercase tracking-widest">
                      Special Awards Purse
                    </span>
                    <span className="text-2xl sm:text-3xl font-orbitron font-black text-cyan-300">
                      ₹33,000
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 items-stretch">
                  {SPECIAL_PRIZE_CATEGORIES.map((prize, idx) => (
                    <Tilt3DCard key={`special-${prize.place}`} maxTilt={6} scrollOffsetY={20 + idx * 12}>
                      <div className="p-6 sm:p-7 text-left flex flex-col justify-between transition-all h-full bg-[#131b20] border border-cyan-400/40 hover:border-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.12)]">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-orbitron font-black uppercase tracking-widest text-cyan-300 flex items-center gap-1.5">
                              <span>{idx === 0 ? '🌟' : idx === 1 ? '🎯' : '🛡️'}</span>
                              <span>{prize.place}</span>
                            </span>
                          </div>
                          <div className="text-3xl sm:text-4xl lg:text-5xl font-orbitron font-black tracking-wider mb-2 text-cyan-300">
                            {prize.amount}
                          </div>
                          <div className="text-sm font-bold text-white mb-4 uppercase font-rajdhani tracking-wider">
                            {prize.title}
                          </div>
                        </div>

                        <ul className="space-y-2 border-t border-white/20 pt-4 text-xs sm:text-sm text-neutral-200">
                          {prize.perks.map((p, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2">
                              <span className="text-cyan-400 font-bold">✓</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Tilt3DCard>
                  ))}
                </div>
              </div>
            </div>

            {/* Official Disbursement & Honors Guarantee Banner */}
            <div className="mt-10 sm:mt-12 p-4 sm:p-6 bg-black/75 border border-amber-400/50 flex flex-col md:flex-row items-center justify-between gap-4 text-left">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-300 font-orbitron text-xs sm:text-sm font-black uppercase">
                  <span>🎖️ DISBURSEMENT GUARANTEE</span>
                  <span>·</span>
                  <span className="text-neutral-300 font-normal">GALGOTIAS UNIVERSITY VERIFIED</span>
                </div>
                <p className="text-xs text-neutral-300 max-w-3xl">
                  Cash prize amounts are disbursed directly to team captains upon tournament grand finale completion. All podium pilots receive official medals, tournament merit certificates, and lifetime pilot ranking points under the Galgotias Centre of Drone Intelligence &amp; Simulation (GCDIS).
                </p>
              </div>
              <button
                onClick={onRegisterClick}
                className="xotc-btn-lime px-6 py-3 text-xs sm:text-sm whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(208,254,29,0.4)]"
              >
                <span>ENTER CHAMPIONSHIP</span>
                <span>→</span>
              </button>
            </div>
          </section>
        </Parallax3DSection>

        {/* SECTION 4: XOTC-STYLE NEON LIME ROADMAP / 2-DAY CHAMPIONSHIP SCHEDULE */}
        <Parallax3DSection offsetY={55} rotateXRange={[8, 0, -6]} scaleRange={[0.95, 1, 0.96]}>
          <section className="space-y-8 sm:space-y-10 lg:space-y-12">
            <div className="text-center space-y-2.5 sm:space-y-3 px-2">
              <span className="font-rajdhani text-xs font-bold text-[#d0fe1d] tracking-[0.22em] uppercase">
                OFFICIAL TOURNAMENT ROADMAP
              </span>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-orbitron font-black text-white uppercase tracking-wider">
                CHAMPIONSHIP ROADMAP
              </h2>
              <p className="text-neutral-400 text-xs sm:text-sm md:text-base max-w-2xl mx-auto">
                2-Day Championship Progression at Galgotias Indoor Arena (Dec 08–09, 2026).
              </p>
            </div>

            {/* XOTC Neon Lime Connected Roadmap Track */}
            <div className="relative py-3 sm:py-6">
              {/* Horizontal Glowing Acid-Lime Line (Desktop) */}
              <div className="hidden lg:block absolute top-11 left-0 right-0 h-[3px] bg-gradient-to-r from-[#d0fe1d] via-[#d0fe1d] to-white/20 shadow-[0_0_16px_rgba(208,254,29,0.6)]" />

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-5 lg:gap-6 relative z-10">
                {roadmapSteps.map((step, i) => (
                  <ParallaxDepthLayer
                    key={i}
                    speed={0.08 * ((i % 3) - 1)}
                    translateZ={20 + (i % 2) * 15}
                    className="flex flex-col items-center text-center group bg-[#151713]/70 lg:bg-transparent border border-white/10 lg:border-none p-3.5 sm:p-4 lg:p-0 rounded"
                  >
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-mono text-xs sm:text-sm font-black transition-all mb-3 sm:mb-4 ${
                        step.completed
                          ? 'bg-[#111210] border-2 border-[#d0fe1d] text-[#d0fe1d] shadow-[0_0_18px_rgba(208,254,29,0.5)]'
                          : step.active
                          ? 'bg-[#d0fe1d] text-black border-2 border-[#d0fe1d] shadow-[0_0_24px_#d0fe1d]'
                          : 'bg-[#111210] border border-white/30 text-neutral-400'
                      }`}
                    >
                      {step.completed ? '✓' : step.active ? '🚁' : '•'}
                    </div>
                    <h3 className="font-orbitron font-bold text-xs sm:text-sm text-white uppercase tracking-wider">
                      {step.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs font-mono text-neutral-400 mt-1">{step.sub}</p>
                  </ParallaxDepthLayer>
                ))}
              </div>
            </div>
          </section>
        </Parallax3DSection>

      </div>
    </div>
  );
};
export default TournamentOverviewSection;
