import React, { useState } from 'react';
import { PRIZE_POOLS, TOURNAMENT_TIMELINE, GDSL_TOURNAMENT_INFO } from '../data/droneSoccerData';
import { GcdisLogo } from './GcdisLogo';

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
  const [selectedDivision, setSelectedDivision] = useState<'d40' | 'd20'>('d40');
  return (
    <div className="relative z-20 w-full py-20 px-4 sm:px-6 lg:px-12 bg-white/70 backdrop-blur-sm border-t border-blue-100">
      <div className="max-w-7xl mx-auto space-y-24">
        {/* SECTION 1: WHAT IS DRONE SOCCER? */}
        <section className="space-y-12">
          <div className="text-center max-w-3xl mx-auto">
            <span className="font-mono text-xs font-bold text-blue-700 tracking-widest uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              OFFICIAL LEAGUE EXPLAINER
            </span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-sans font-black text-blue-950 uppercase tracking-tight">
              THE RULES OF 3D AERIAL SOCCER
            </h2>
            <p className="mt-4 text-slate-700 text-base sm:text-lg leading-relaxed">
              Drone soccer is an exhilarating FAI-sanctioned aerospace sport where two squads of 5 caged multirotors compete inside a protective netting arena to score by passing through elevated hoops.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-blue-200/80 rounded-3xl p-6 shadow-xs hover:border-blue-400 hover:shadow-md transition-all text-left">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-900 mb-4 font-black text-lg">
                01
              </div>
              <h3 className="text-lg font-sans font-black text-blue-950 uppercase">
                THE SPHERICAL CAGE
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Multirotor avionics and carbon propellers are safely locked within a 360-degree impact-resistant polycarbonate geodesic sphere capable of absorbing 50 km/h collisions.
              </p>
            </div>

            <div className="bg-white border border-blue-200/80 rounded-3xl p-6 shadow-xs hover:border-blue-400 hover:shadow-md transition-all text-left">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-900 mb-4 font-black text-lg">
                02
              </div>
              <h3 className="text-lg font-sans font-black text-blue-950 uppercase">
                ONE DESIGNATED STRIKER
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Only 1 player per team serves as the Striker, designated by a bright tail ribbon. Only the Striker can score by penetrating the opponent&apos;s 3-meter elevated goal hoop.
              </p>
            </div>

            <div className="bg-white border border-blue-200/80 rounded-3xl p-6 shadow-xs hover:border-blue-400 hover:shadow-md transition-all text-left">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-900 mb-4 font-black text-lg">
                03
              </div>
              <h3 className="text-lg font-sans font-black text-blue-950 uppercase">
                GOALKEEPER &amp; SWEEPER
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                The remaining 4 pilots act as Goalkeepers, Sweepers, and Wing Guides to body-block incoming strikers, establish screen passes, and pin opponents against the net.
              </p>
            </div>

            <div className="bg-white border border-blue-200/80 rounded-3xl p-6 shadow-xs hover:border-blue-400 hover:shadow-md transition-all text-left">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-900 mb-4 font-black text-lg">
                04
              </div>
              <h3 className="text-lg font-sans font-black text-blue-950 uppercase">
                3-MINUTE HIGH OCTANE SETS
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Matches are played over 3 sets of 3 minutes each with 5-minute tactical pit-stops for rapid LiPo battery swaps, propeller replacements, and team coach huddles.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: DUAL DIVISION PRIZE POOL BREAKDOWN */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-950 to-slate-950 text-white rounded-3xl p-5 sm:p-8 md:p-12 lg:p-16 shadow-xl relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 sm:mb-12">
            <div className="max-w-3xl text-left">
              <span className="font-mono text-xs font-bold text-sky-400 tracking-widest uppercase bg-sky-950/60 px-3 py-1 rounded-full border border-sky-800">
                CHAMPIONSHIP STAKES · DUAL TOURNAMENT TIERS
              </span>
              <h2 className="mt-3 text-2xl sm:text-4xl lg:text-5xl font-sans font-black uppercase tracking-tight text-white">
                ₹1,00,000 TOTAL PRIZE POOL
              </h2>
              <p className="mt-3 text-blue-200 text-sm sm:text-base lg:text-lg">
                The total pool is of <span className="text-white font-bold">₹1,00,000</span> (including trophy and cash prize). Dedicated division funds for <span className="text-white font-bold">Class 40 (D-40: ₹57,000)</span> and <span className="text-white font-bold">Class 20 (D-20: ₹37,000)</span> alongside prestigious national rolling trophies and honors.
              </p>
            </div>

            {/* Division Switcher Filter */}
            <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/15 w-full sm:w-auto self-start lg:self-end">
              <button
                onClick={() => setSelectedDivision('d40')}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all text-center ${
                  selectedDivision === 'd40'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-blue-200 hover:text-white hover:bg-white/5'
                }`}
              >
                D-40 Pool (₹57K)
              </button>
              <button
                onClick={() => setSelectedDivision('d20')}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all text-center ${
                  selectedDivision === 'd20'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-blue-200 hover:text-white hover:bg-white/5'
                }`}
              >
                D-20 Pool (₹37K)
              </button>
            </div>
          </div>

          <div className="space-y-12 relative z-10">
            {/* D-40 DIVISION SECTION */}
            {selectedDivision === 'd40' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-4 text-left">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-black uppercase bg-amber-400 text-slate-950">
                        D-40 DIVISION
                      </span>
                      <h3 className="text-xl sm:text-2xl font-sans font-black uppercase tracking-tight text-white">
                        Class 40 Heavyweight (400mm Sphere)
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-blue-200 mt-1">
                      5 vs 5 full arena clash · 16m × 8m cage · ≤1100g max drone mass · FIDA standard
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-sky-300 block font-bold uppercase">Division Purse</span>
                    <span className="text-2xl sm:text-3xl font-mono font-black text-amber-300">₹57,000</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {PRIZE_POOLS.d40.prizes.map((prize) => (
                    <div
                      key={`d40-${prize.place}`}
                      className={`rounded-2xl p-6 text-left flex flex-col justify-between transition-all ${
                        prize.highlight
                          ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-xl border-2 border-amber-300 ring-2 ring-amber-400/30'
                          : 'bg-white/10 backdrop-blur-md text-white border border-white/15 hover:border-white/30'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider opacity-80">
                            {prize.place}
                          </span>
                          {prize.highlight ? (
                            <span className="text-[10px] font-black uppercase tracking-widest bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-mono">
                              D-40 GOLD CUP
                            </span>
                          ) : prize.place === '2nd Place' ? (
                            <span className="text-[10px] font-black uppercase tracking-widest bg-slate-300 text-slate-900 px-2 py-0.5 rounded-full font-mono">
                              SILVER CUP
                            </span>
                          ) : (
                            <span className="text-[10px] font-black uppercase tracking-widest bg-sky-400/30 text-sky-200 border border-sky-400/40 px-2 py-0.5 rounded-full font-mono">
                              SPECIAL PRIZE
                            </span>
                          )}
                        </div>
                        <div className="text-3xl sm:text-4xl font-sans font-black tracking-tight mb-2 text-white">
                          {prize.amount}
                        </div>
                        <div className="text-sm font-bold opacity-90 mb-4">{prize.title}</div>
                      </div>

                      <ul className="space-y-2 border-t border-white/15 pt-4 text-xs opacity-85">
                        {prize.perks.map((p, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-amber-300 font-bold">✓</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* D-20 DIVISION SECTION */}
            {selectedDivision === 'd20' && (
              <div className="space-y-6 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-4 text-left">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-black uppercase bg-sky-400 text-slate-950">
                        D-20 DIVISION
                      </span>
                      <h3 className="text-xl sm:text-2xl font-sans font-black uppercase tracking-tight text-white">
                        Class 20 High-Speed (200mm Sphere)
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-blue-200 mt-1">
                      3 vs 3 high-speed agile arena · 8m × 4m cage · ≤110g max drone mass · FIDA standard
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-sky-300 block font-bold uppercase">Division Purse</span>
                    <span className="text-2xl sm:text-3xl font-mono font-black text-sky-300">₹37,000</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {PRIZE_POOLS.d20.prizes.map((prize) => (
                    <div
                      key={`d20-${prize.place}`}
                      className={`rounded-2xl p-6 text-left flex flex-col justify-between transition-all ${
                        prize.highlight
                          ? 'bg-gradient-to-b from-sky-700 to-blue-800 text-white shadow-xl border-2 border-sky-300 ring-2 ring-sky-400/30'
                          : 'bg-white/10 backdrop-blur-md text-white border border-white/15 hover:border-white/30'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider opacity-80">
                            {prize.place}
                          </span>
                          {prize.highlight ? (
                            <span className="text-[10px] font-black uppercase tracking-widest bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-mono">
                              D-20 GOLD CUP
                            </span>
                          ) : prize.place === '2nd Place' ? (
                            <span className="text-[10px] font-black uppercase tracking-widest bg-slate-300 text-slate-900 px-2 py-0.5 rounded-full font-mono">
                              SILVER CUP
                            </span>
                          ) : (
                            <span className="text-[10px] font-black uppercase tracking-widest bg-sky-400/30 text-sky-200 border border-sky-400/40 px-2 py-0.5 rounded-full font-mono">
                              SPECIAL PRIZE
                            </span>
                          )}
                        </div>
                        <div className="text-3xl sm:text-4xl font-sans font-black tracking-tight mb-2 text-white">
                          {prize.amount}
                        </div>
                        <div className="text-sm font-bold opacity-90 mb-4">{prize.title}</div>
                      </div>

                      <ul className="space-y-2 border-t border-white/15 pt-4 text-xs opacity-85">
                        {prize.perks.map((p, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-sky-300 font-bold">✓</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3: 2-DAY TOURNAMENT TIMELINE */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="text-left max-w-2xl">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-xs font-bold text-blue-700 tracking-widest uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  OFFICIAL ROADMAP
                </span>
                <span className="font-mono text-xs font-bold text-amber-700 tracking-wider uppercase bg-amber-50 px-3 py-1 rounded-full border border-amber-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  COMING SOON
                </span>
              </div>
              <h2 className="mt-3 text-3xl sm:text-5xl font-sans font-black text-blue-950 uppercase tracking-tight flex flex-wrap items-center gap-3">
                <span>2-DAY CHAMPIONSHIP SCHEDULE</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-amber-700 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full">
                  COMING SOON
                </span>
              </h2>
              <p className="mt-2 text-slate-600 text-base">
                Official slot allocations, technical scrutineering windows, and arena flight timings will be published once team registrations are closed.
              </p>
            </div>

            <button
              onClick={onBracketClick}
              className="px-6 py-3 rounded-full bg-blue-900 hover:bg-blue-950 text-white font-sans font-bold text-xs tracking-wider uppercase transition-all shadow-xs shrink-0 self-start md:self-auto flex items-center gap-2"
            >
              <span>BRACKET &amp; FIXTURES</span>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full font-mono">
                SOON
              </span>
            </button>
          </div>

          {/* Coming Soon Feature Card */}
          <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 text-white rounded-3xl p-8 sm:p-12 border border-blue-800 shadow-xl relative overflow-hidden text-left">
            <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-mono font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>SCHEDULE IN PREPARATION</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-sans font-black uppercase tracking-tight text-white">
                Tournament Schedule Will Be Released After Registration Closes
              </h3>

              <p className="text-blue-200 text-sm sm:text-base leading-relaxed">
                The full 2-day itinerary including pilot check-ins, technical scrutineering (exoskeleton sphere diameter, fail-safe cut-offs, weight checks), group stage heats, and knockout finals will be dispatched directly to registered team captains and published live here.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="text-xs font-mono text-sky-400 font-bold uppercase">DAY 01 (DEC 02, 2026)</div>
                  <div className="text-sm font-bold text-white mt-1">Scrutineering &amp; Group Stage Heats</div>
                  <div className="text-xs text-blue-300 mt-1">Detailed match timings coming soon</div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="text-xs font-mono text-sky-400 font-bold uppercase">DAY 02 (DEC 03, 2026)</div>
                  <div className="text-sm font-bold text-white mt-1">Knockouts, Semi-Finals &amp; Finals</div>
                  <div className="text-xs text-blue-300 mt-1">Championship schedule coming soon</div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="text-xs font-mono text-amber-400 font-bold uppercase">TEAM NOTIFICATIONS</div>
                  <div className="text-sm font-bold text-white mt-1">Direct SMS &amp; Portal Alerts</div>
                  <div className="text-xs text-blue-300 mt-1">Dispatched to registered team leads</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: HOST INSTITUTION & PROVING ARENA */}
        <section className="bg-blue-50/80 border border-blue-200/80 rounded-3xl p-5 sm:p-8 md:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8 text-left">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <GcdisLogo size="xl" showWordmark={false} />
            <div className="max-w-xl">
              <span className="font-mono text-xs font-bold text-blue-700 uppercase tracking-widest">
                HOSTED BY GCDIS AT GALGOTIAS UNIVERSITY
              </span>
              <h3 className="mt-1 text-xl sm:text-2xl md:text-3xl font-sans font-black text-blue-950 uppercase">
                GALGOTIAS INDOOR DRONE SOCCER ARENA
              </h3>
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-slate-700 leading-relaxed">
                Purpose-built with 16m × 8m × 5m protective ballistic netting, dual illuminated goal hoops, 6-camera FPV track telemetry, and 800-seat spectator gallery in Greater Noida, UP.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={onRulesClick}
              className="w-full sm:w-auto min-h-[44px] px-5 sm:px-6 py-3 rounded-full bg-white hover:bg-blue-100 text-blue-950 font-sans font-bold text-xs tracking-wider uppercase border border-blue-200 transition-all shadow-xs text-center justify-center flex items-center"
            >
              FIDA 5TH REVISION RULES
            </button>
            <button
              onClick={onRegisterClick}
              className="w-full sm:w-auto min-h-[44px] px-6 sm:px-7 py-3 rounded-full bg-blue-900 hover:bg-blue-950 text-white font-sans font-black text-xs tracking-wider uppercase shadow-md transition-all hover:scale-105 active:scale-95 text-center justify-center flex items-center"
            >
              REGISTER SQUAD NOW
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
export default TournamentOverviewSection;
