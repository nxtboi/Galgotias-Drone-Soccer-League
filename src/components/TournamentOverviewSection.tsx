import React from 'react';
import { PRIZE_POOL, TOURNAMENT_TIMELINE, GDSL_TOURNAMENT_INFO } from '../data/droneSoccerData';
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

        {/* SECTION 2: PRIZE POOL BREAKDOWN */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-950 to-slate-950 text-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-xl relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl text-left mb-12">
            <span className="font-mono text-xs font-bold text-sky-400 tracking-widest uppercase bg-sky-950/60 px-3 py-1 rounded-full border border-sky-800">
              CHAMPIONSHIP STAKES
            </span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-sans font-black uppercase tracking-tight text-white">
              ₹1,00,000 GRAND PRIZE POOL
            </h2>
            <p className="mt-4 text-blue-200 text-base sm:text-lg">
              Recognizing tactical pilot brilliance, aerospace durability, and collegiate engineering craftsmanship across India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {PRIZE_POOL.map((prize) => (
              <div
                key={prize.place}
                className={`rounded-2xl p-6 text-left flex flex-col justify-between transition-all ${
                  prize.highlight
                    ? 'bg-blue-600 text-white shadow-lg border border-sky-300 ring-2 ring-sky-400/40'
                    : 'bg-white/10 backdrop-blur-md text-white border border-white/15'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider opacity-80">
                      {prize.place}
                    </span>
                    {prize.highlight && (
                      <span className="text-[10px] font-black uppercase tracking-widest bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-mono">
                        GOLD CUP
                      </span>
                    )}
                  </div>
                  <div className="text-3xl sm:text-4xl font-sans font-black tracking-tight mb-2">
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
        </section>

        {/* SECTION 3: 2-DAY TOURNAMENT TIMELINE */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="text-left max-w-2xl">
              <span className="font-mono text-xs font-bold text-blue-700 tracking-widest uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                OFFICIAL ROADMAP
              </span>
              <h2 className="mt-3 text-3xl sm:text-5xl font-sans font-black text-blue-950 uppercase tracking-tight">
                2-DAY CHAMPIONSHIP SCHEDULE
              </h2>
              <p className="mt-2 text-slate-600 text-base">
                From technical scrutineering to the illuminated grand championship match in the indoor drone cage arena.
              </p>
            </div>

            <button
              onClick={onBracketClick}
              className="px-6 py-3 rounded-full bg-blue-900 hover:bg-blue-950 text-white font-sans font-bold text-xs tracking-wider uppercase transition-all shadow-xs shrink-0 self-start md:self-auto"
            >
              VIEW LIVE BRACKET &amp; FIXTURES
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TOURNAMENT_TIMELINE.map((item) => (
              <div
                key={item.phase}
                className="bg-white border border-blue-200/80 rounded-3xl p-6 text-left shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-blue-600">{item.phase}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-sans font-black text-blue-950 uppercase">
                    {item.title}
                  </h3>
                  <div className="mt-1 text-xs font-semibold text-blue-700">
                    {item.date} · {item.time}
                  </div>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] font-medium text-slate-500">
                  <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span>{item.location}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: HOST INSTITUTION & PROVING ARENA */}
        <section className="bg-blue-50/80 border border-blue-200/80 rounded-3xl p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 text-left">
          <div className="flex items-center gap-6">
            <GcdisLogo size="xl" showWordmark={false} />
            <div className="max-w-xl">
              <span className="font-mono text-xs font-bold text-blue-700 uppercase tracking-widest">
                HOSTED BY GCDIS AT GALGOTIAS UNIVERSITY
              </span>
              <h3 className="mt-1 text-2xl sm:text-3xl font-sans font-black text-blue-950 uppercase">
                GALGOTIAS INDOOR DRONE SOCCER ARENA
              </h3>
              <p className="mt-3 text-sm sm:text-base text-slate-700 leading-relaxed">
                Purpose-built with 16m × 8m × 5m protective ballistic netting, dual illuminated goal hoops, 6-camera FPV track telemetry, and 800-seat spectator gallery in Greater Noida, UP.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <button
              onClick={onRulesClick}
              className="px-6 py-3.5 rounded-full bg-white hover:bg-blue-100 text-blue-950 font-sans font-bold text-xs tracking-wider uppercase border border-blue-200 transition-all shadow-xs"
            >
              FIDA 5TH REVISION RULES
            </button>
            <button
              onClick={onRegisterClick}
              className="px-7 py-3.5 rounded-full bg-blue-900 hover:bg-blue-950 text-white font-sans font-black text-xs tracking-wider uppercase shadow-md transition-all hover:scale-105 active:scale-95"
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
