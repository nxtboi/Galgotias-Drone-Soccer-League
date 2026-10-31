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
    { title: 'Squad Registration', sub: 'Portal Open · 32 Slots', completed: true },
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
              <p className="text-neutral-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
                Every match is governed by strict GCDIS aerodynamics, spherical impact protection, and real-time electronic hoop refereeing.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 xl:gap-7 relative z-10 items-stretch">
              {[
                {
                  num: '01',
                  title: 'THE SPHERICAL CAGE',
                  desc: 'Multirotor avionics and carbon propellers are safely locked within a 360-degree impact-resistant polycarbonate geodesic sphere capable of absorbing 50 km/h collisions.',
                  icon: (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="9" strokeWidth={2.2} />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
                    </svg>
                  ),
                },
                {
                  num: '02',
                  title: 'ONE DESIGNATED STRIKER',
                  desc: 'Only 1 player per team serves as the Striker, designated by a bright tail ribbon. Only the Striker can score by penetrating the opponent’s 3-meter elevated goal hoop.',
                  icon: (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                },
                {
                  num: '03',
                  title: 'GOALKEEPER & SWEEPER',
                  desc: 'The remaining 4 pilots act as Goalkeepers, Sweepers, and Wing Guides to body-block incoming strikers, establish screen passes, and pin opponents against the net.',
                  icon: (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  ),
                },
                {
                  num: '04',
                  title: '3-MINUTE HIGH OCTANE SETS',
                  desc: 'Matches are played over 3 sets of 3 minutes each with 5-minute tactical pit-stops for rapid LiPo battery swaps, propeller replacements, and team coach huddles.',
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
                        {item.num} · REGULATION
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
              University flight squads, pilot captains, and robotics engineers can now compete head-to-head under full international GCDIS telemetry standards.
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

        {/* SECTION 3: DUAL DIVISION PRIZE POOL BREAKDOWN */}
        <Parallax3DSection offsetY={60} rotateXRange={[7, 0, -6]} scaleRange={[0.95, 1, 0.96]}>
          <section id="prize-pool" className="relative scroll-mt-24 bg-[#151713] border border-[#d0fe1d]/40 p-4 sm:p-7 md:p-10 lg:p-12 xl:p-14 shadow-[0_0_50px_rgba(208,254,29,0.08)] overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
              <div className="max-w-3xl text-left">
                <span className="font-rajdhani text-xs font-bold text-[#d0fe1d] tracking-[0.22em] uppercase block">
                  CHAMPIONSHIP STAKES · DUAL TOURNAMENT TIERS
                </span>
                <h2 className="mt-1.5 sm:mt-2 text-2xl sm:text-4xl lg:text-5xl font-orbitron font-black uppercase tracking-wider text-white">
                  ₹2,00,000 <span className="text-[#d0fe1d]">TOTAL PRIZE POOL</span>
                </h2>
                <p className="mt-2.5 sm:mt-3 text-neutral-300 text-xs sm:text-sm md:text-base">
                  The total pool is <span className="text-white font-bold">₹2,00,000</span> (including championship trophies and cash prizes). Dedicated division funds for <span className="text-[#d0fe1d] font-bold">Class 40 (D-40: ₹94,000)</span> and <span className="text-[#d0fe1d] font-bold">Class 20 (D-20: ₹74,000)</span> alongside national rolling trophies.
                </p>
              </div>
            </div>

            <div className="space-y-10 sm:space-y-12 relative z-10">
              {/* D-40 DIVISION */}
              <div className="space-y-5 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-white/15 pb-3.5 sm:pb-4 text-left">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="text-xs font-mono font-black uppercase text-[#d0fe1d]">
                        D-40 DIVISION ·
                      </span>
                      <h3 className="text-base sm:text-xl lg:text-2xl font-orbitron font-black uppercase tracking-wider text-white">
                        Class 40 Heavyweight (400mm Sphere)
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                      5 vs 5 full arena clash · 16m × 8m cage · ≤1100g max drone mass · GCDIS standard
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[11px] sm:text-xs font-rajdhani text-neutral-400 block font-bold uppercase tracking-widest">Division Purse</span>
                    <span className="text-xl sm:text-2xl lg:text-3xl font-orbitron font-black text-[#d0fe1d]">₹94,000</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 items-stretch">
                  {PRIZE_POOLS.d40.prizes.map((prize, idx) => (
                    <Tilt3DCard key={`d40-${prize.place}`} maxTilt={6} scrollOffsetY={20 + idx * 12}>
                      <div
                        className={`p-5 sm:p-6 lg:p-7 text-left flex flex-col justify-between transition-all h-full ${
                          prize.highlight ? 'xotc-card-lime' : 'xotc-card'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                            <span className="text-[10px] font-orbitron font-black uppercase tracking-widest text-[#d0fe1d]">
                              {prize.highlight ? '1ST PLACE' : prize.place === '2nd Place' ? '2ND PLACE' : prize.place === '3rd Place' ? '3RD PLACE' : 'SPECIAL PRIZE'}
                            </span>
                          </div>
                          <div className="text-2xl sm:text-3xl lg:text-4xl font-orbitron font-black tracking-wider mb-1.5 sm:mb-2 text-white">
                            {prize.amount}
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-[#d0fe1d] mb-3.5 sm:mb-4">{prize.title}</div>
                        </div>

                        <ul className="space-y-2 border-t border-white/15 pt-3.5 sm:pt-4 text-xs text-neutral-300">
                          {prize.perks.map((p, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2">
                              <span className="text-[#d0fe1d] font-bold">✓</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Tilt3DCard>
                  ))}
                </div>
              </div>

              {/* D-20 DIVISION */}
              <div className="space-y-5 sm:space-y-6 pt-6 sm:pt-8 border-t border-white/15">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-white/15 pb-3.5 sm:pb-4 text-left">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="text-xs font-mono font-black uppercase text-[#d0fe1d]">
                        D-20 DIVISION ·
                      </span>
                      <h3 className="text-base sm:text-xl lg:text-2xl font-orbitron font-black uppercase tracking-wider text-white">
                        Class 20 High-Speed (200mm Sphere)
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                      3 vs 3 high-speed agile arena · 8m × 4m cage · ≤110g max drone mass · GCDIS standard
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[11px] sm:text-xs font-rajdhani text-neutral-400 block font-bold uppercase tracking-widest">Division Purse</span>
                    <span className="text-xl sm:text-2xl lg:text-3xl font-orbitron font-black text-[#d0fe1d]">₹74,000</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 items-stretch">
                  {PRIZE_POOLS.d20.prizes.map((prize, idx) => (
                    <Tilt3DCard key={`d20-${prize.place}`} maxTilt={6} scrollOffsetY={20 + idx * 12}>
                      <div
                        className={`p-5 sm:p-6 lg:p-7 text-left flex flex-col justify-between transition-all h-full ${
                          prize.highlight ? 'xotc-card-lime' : 'xotc-card'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                            <span className="text-[10px] font-orbitron font-black uppercase tracking-widest text-[#d0fe1d]">
                              {prize.highlight ? '1ST PLACE' : prize.place === '2nd Place' ? '2ND PLACE' : prize.place === '3rd Place' ? '3RD PLACE' : 'SPECIAL PRIZE'}
                            </span>
                          </div>
                          <div className="text-2xl sm:text-3xl lg:text-4xl font-orbitron font-black tracking-wider mb-1.5 sm:mb-2 text-white">
                            {prize.amount}
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-[#d0fe1d] mb-3.5 sm:mb-4">{prize.title}</div>
                        </div>

                        <ul className="space-y-2 border-t border-white/15 pt-3.5 sm:pt-4 text-xs text-neutral-300">
                          {prize.perks.map((p, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2">
                              <span className="text-[#d0fe1d] font-bold">✓</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Tilt3DCard>
                  ))}
                </div>
              </div>

              {/* SPECIAL PRIZES CATEGORY */}
              <div className="space-y-5 sm:space-y-6 pt-6 sm:pt-8 border-t border-white/15">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-white/15 pb-3.5 sm:pb-4 text-left">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="text-xs font-mono font-black uppercase text-[#d0fe1d]">
                        SPECIAL DIVISION ·
                      </span>
                      <h3 className="text-base sm:text-xl lg:text-2xl font-orbitron font-black uppercase tracking-wider text-white">
                        Special Prizes
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                      Individual &amp; tactical excellence awards · MVP, Max Goal Scorer &amp; Best Defender
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[11px] sm:text-xs font-rajdhani text-neutral-400 block font-bold uppercase tracking-widest">Category Purse</span>
                    <span className="text-xl sm:text-2xl lg:text-3xl font-orbitron font-black text-[#d0fe1d]">₹33,000</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 items-stretch">
                  {SPECIAL_PRIZE_CATEGORIES.map((prize, idx) => (
                    <Tilt3DCard key={`special-${prize.place}`} maxTilt={6} scrollOffsetY={20 + idx * 12}>
                      <div className="p-5 sm:p-6 lg:p-7 text-left flex flex-col justify-between transition-all h-full xotc-card">
                        <div>
                          <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                            <span className="text-[10px] font-orbitron font-black uppercase tracking-widest text-[#d0fe1d]">
                              {prize.place}
                            </span>
                          </div>
                          <div className="text-2xl sm:text-3xl lg:text-4xl font-orbitron font-black tracking-wider mb-1.5 sm:mb-2 text-white">
                            {prize.amount}
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-[#d0fe1d] mb-3.5 sm:mb-4">{prize.title}</div>
                        </div>

                        <ul className="space-y-2 border-t border-white/15 pt-3.5 sm:pt-4 text-xs text-neutral-300">
                          {prize.perks.map((p, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2">
                              <span className="text-[#d0fe1d] font-bold">✓</span>
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
